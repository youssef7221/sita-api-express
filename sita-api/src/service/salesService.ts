import { ConflictError, NotFoundError } from "../errors/appErrors";
import { CreateSaleDto, UpdateSaleDto } from "../dtos/sales/salesDto";
import { salesRepository } from "../repository";
import { createServiceLogger } from "../utils/serviceLogger";

const logger = createServiceLogger("SalesService");

const toSaleResponse = (sale: {
    saleId: number;
    name: string;
    discountPercent: string | null;
    startDate: string;
    endDate: string;
    createdAt: string | null;
}) => ({
    id: sale.saleId,
    name: sale.name,
    discountPercent: sale.discountPercent !== null ? Number(sale.discountPercent) : null,
    startDate: sale.startDate,
    endDate: sale.endDate,
    createdAt: sale.createdAt,
});

const hasDateRangeOverlap = (startA: string, endA: string, startB: string, endB: string) => {
    return !(endA < startB || startA > endB);
};

const ensureNoOverlappingSale = async (startDate: string, endDate: string, excludeSaleId?: number) => {
    const sales = await salesRepository.findAllSales();

    const conflict = sales.some((sale) => {
        if (excludeSaleId !== undefined && sale.saleId === excludeSaleId) {
            return false;
        }

        return hasDateRangeOverlap(startDate, endDate, sale.startDate, sale.endDate);
    });

    if (conflict) {
        throw new ConflictError("Cannot create sale: Another sale is already active today. Only one active sale is allowed at a time.");
    }
};

export const getActiveSale = async () => {
    logger.info("Get active sale");

    const sales = await salesRepository.findAllSales();
    const today = new Date().toISOString().slice(0, 10);
    const activeSale = sales.find((sale) => sale.startDate <= today && sale.endDate >= today);

    return activeSale ? toSaleResponse(activeSale) : null;
};

export const getAllSales = async () => {
    logger.info("Get all sales");

    const sales = await salesRepository.findAllSales();
    return sales.map(toSaleResponse);
};

export const getSaleById = async (id: number) => {
    logger.info("Get sale by id", { saleId: id });

    const sale = await salesRepository.findSaleById(id);

    if (!sale) {
        logger.warn("Get sale by id failed: not found", { saleId: id });
        throw new NotFoundError("Sale not found");
    }

    return toSaleResponse(sale);
};

export const createSale = async (dto: CreateSaleDto) => {
    logger.info("Create sale started", { name: dto.name, startDate: dto.startDate, endDate: dto.endDate });

    await ensureNoOverlappingSale(dto.startDate, dto.endDate);

    const [result] = await salesRepository.insertSale({
        name: dto.name,
        discountPercent: String(dto.discountPercent),
        startDate: dto.startDate,
        endDate: dto.endDate,
    });

    const createdSale = await salesRepository.findSaleById(Number(result.insertId));

    if (!createdSale) {
        throw new NotFoundError("Sale not found after creation");
    }

    return toSaleResponse(createdSale);
};

export const updateSale = async (id: number, dto: UpdateSaleDto) => {
    logger.info("Update sale started", { saleId: id });

    const existing = await salesRepository.findSaleById(id);

    if (!existing) {
        logger.warn("Update sale failed: not found", { saleId: id });
        throw new NotFoundError("Sale not found");
    }

    await ensureNoOverlappingSale(dto.startDate, dto.endDate, id);

    await salesRepository.updateSaleById(id, {
        name: dto.name,
        discountPercent: String(dto.discountPercent),
        startDate: dto.startDate,
        endDate: dto.endDate,
    });

    const updated = await salesRepository.findSaleById(id);

    if (!updated) {
        throw new NotFoundError("Sale not found after update");
    }

    return toSaleResponse(updated);
};

export const deleteSale = async (id: number) => {
    logger.info("Delete sale started", { saleId: id });

    const existing = await salesRepository.findSaleById(id);

    if (!existing) {
        logger.warn("Delete sale failed: not found", { saleId: id });
        throw new NotFoundError("Sale not found");
    }

    await salesRepository.deleteSaleById(id);
};
