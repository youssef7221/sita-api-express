import { BadRequestError, NotFoundError } from "../errors/appErrors";
import { CreateProductDiscountDto, UpdateProductDiscountDto } from "../dtos/product/productDiscountDto";
import { productDiscountRepository, productRepository } from "../repository";
import { createServiceLogger } from "../utils/serviceLogger";

const logger = createServiceLogger("ProductDiscountService");

const parseDateValue = (value: string): Date | null => {
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const withTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(normalized) ? normalized : `${normalized}Z`;
    const parsed = new Date(withTimezone);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toNullableNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
};

const toActiveNumber = (value: boolean | number | undefined) => {
    if (value === undefined) return 1;
    if (typeof value === "boolean") return value ? 1 : 0;
    return Number(value) === 1 ? 1 : 0;
};

const getUtcNowDateTimeString = () => {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
};

export const isCurrentlyActive = (active: number | boolean | null, startDate: string, endDate: string) => {
    const isActive = typeof active === "boolean" ? active : Number(active ?? 0) === 1;
    if (!isActive) return false;

    const start = parseDateValue(startDate);
    const end = parseDateValue(endDate);

    if (!start || !end) return false;

    const now = new Date();
    return now >= start && now <= end;
};

export const getFinalPrice = (
    originalPrice: number,
    discountPercentage: number | null,
    discountedPrice: number | null,
    currentlyActive: boolean
) => {
    if (!currentlyActive) return originalPrice;

    if (discountedPrice !== null) return discountedPrice;

    if (discountPercentage !== null) {
        const discounted = originalPrice - (originalPrice * discountPercentage) / 100;
        return Number(discounted.toFixed(2));
    }

    return originalPrice;
};

const toDiscountResponse = (row: {
    id: number;
    productId: number;
    productName: string;
    originalPrice: string;
    discountPercentage: string | null;
    discountedPrice: string | null;
    startDate: string;
    endDate: string;
    active: number;
    createdAt: string | null;
    updatedAt: string | null;
}) => {
    const originalPrice = Number(row.originalPrice);
    const discountPercentage = toNullableNumber(row.discountPercentage);
    const discountedPrice = toNullableNumber(row.discountedPrice);
    const currentlyActive = isCurrentlyActive(row.active, row.startDate, row.endDate);
    const finalPrice = getFinalPrice(originalPrice, discountPercentage, discountedPrice, currentlyActive);

    return {
        id: row.id,
        productId: row.productId,
        productName: row.productName,
        originalPrice,
        discountPercentage,
        discountedPrice,
        finalPrice,
        startDate: row.startDate,
        endDate: row.endDate,
        active: Number(row.active) === 1,
        currentlyActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
};

const validateDiscountValues = (originalPrice: number, discountPercentage: number | null, discountedPrice: number | null) => {
    if (discountPercentage === null && discountedPrice === null) {
        throw new BadRequestError("Either discountPercentage or discountedPrice must be provided");
    }

    if (discountPercentage !== null && discountedPrice !== null) {
        throw new BadRequestError("Provide only one of discountPercentage or discountedPrice");
    }

    if (discountedPrice !== null && discountedPrice > originalPrice) {
        throw new BadRequestError("discountedPrice must be less than or equal to original product price");
    }
};

const ensureProductExists = async (productId: number) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new NotFoundError("Product not found");
    }

    return product;
};

export const getAllProductDiscounts = async () => {
    logger.info("Get all product discounts");

    const rows = await productDiscountRepository.findAllProductDiscounts();
    return rows.map(toDiscountResponse);
};

export const getProductDiscountById = async (id: number) => {
    logger.info("Get product discount by id", { discountId: id });

    const row = await productDiscountRepository.findProductDiscountById(id);

    if (!row) {
        logger.warn("Get product discount by id failed: not found", { discountId: id });
        throw new NotFoundError("Product discount not found");
    }

    return toDiscountResponse(row);
};

export const getProductDiscountsByProductId = async (productId: number) => {
    logger.info("Get product discounts by product id", { productId });

    await ensureProductExists(productId);

    const rows = await productDiscountRepository.findProductDiscountsByProductId(productId);
    return rows.map(toDiscountResponse);
};

export const createProductDiscount = async (dto: CreateProductDiscountDto) => {
    logger.info("Create product discount started", { productId: dto.productId });

    const product = await ensureProductExists(dto.productId);
    const originalPrice = Number(product.price);
    const discountPercentage = dto.discountPercentage ?? null;
    const discountedPrice = dto.discountedPrice ?? null;

    validateDiscountValues(originalPrice, discountPercentage, discountedPrice);

    const now = getUtcNowDateTimeString();

    const [result] = await productDiscountRepository.insertProductDiscount({
        productId: dto.productId,
        discountPercentage: discountPercentage === null ? null : String(discountPercentage),
        discountedPrice: discountedPrice === null ? null : String(discountedPrice),
        startDate: dto.startDate,
        endDate: dto.endDate,
        active: toActiveNumber(dto.active),
        createdAt: now,
        updatedAt: now,
    });

    const created = await productDiscountRepository.findProductDiscountById(Number(result.insertId));

    if (!created) {
        throw new NotFoundError("Product discount not found after creation");
    }

    return toDiscountResponse(created);
};

export const updateProductDiscount = async (id: number, dto: UpdateProductDiscountDto) => {
    logger.info("Update product discount started", { discountId: id, productId: dto.productId });

    const existing = await productDiscountRepository.findProductDiscountById(id);

    if (!existing) {
        logger.warn("Update product discount failed: not found", { discountId: id });
        throw new NotFoundError("Product discount not found");
    }

    const product = await ensureProductExists(dto.productId);
    const originalPrice = Number(product.price);
    const discountPercentage = dto.discountPercentage ?? null;
    const discountedPrice = dto.discountedPrice ?? null;

    validateDiscountValues(originalPrice, discountPercentage, discountedPrice);

    await productDiscountRepository.updateProductDiscountById(id, {
        productId: dto.productId,
        discountPercentage: discountPercentage === null ? null : String(discountPercentage),
        discountedPrice: discountedPrice === null ? null : String(discountedPrice),
        startDate: dto.startDate,
        endDate: dto.endDate,
        active: toActiveNumber(dto.active),
        updatedAt: getUtcNowDateTimeString(),
    });

    const updated = await productDiscountRepository.findProductDiscountById(id);

    if (!updated) {
        throw new NotFoundError("Product discount not found after update");
    }

    return toDiscountResponse(updated);
};

export const toggleProductDiscount = async (id: number) => {
    logger.info("Toggle product discount started", { discountId: id });

    const existing = await productDiscountRepository.findProductDiscountById(id);

    if (!existing) {
        logger.warn("Toggle product discount failed: not found", { discountId: id });
        throw new NotFoundError("Product discount not found");
    }

    const nextActive = Number(existing.active) === 1 ? 0 : 1;

    await productDiscountRepository.updateProductDiscountActive(id, nextActive, getUtcNowDateTimeString());

    const updated = await productDiscountRepository.findProductDiscountById(id);

    if (!updated) {
        throw new NotFoundError("Product discount not found after toggle");
    }

    return toDiscountResponse(updated);
};

export const deleteProductDiscount = async (id: number) => {
    logger.info("Delete product discount started", { discountId: id });

    const existing = await productDiscountRepository.findProductDiscountById(id);

    if (!existing) {
        logger.warn("Delete product discount failed: not found", { discountId: id });
        throw new NotFoundError("Product discount not found");
    }

    await productDiscountRepository.deleteProductDiscountById(id);
};
