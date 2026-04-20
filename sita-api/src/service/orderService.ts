import { db } from "../db";
import { CreateOrderDto, OrderResponseDto } from "../dtos/order/orderRequestDto";
import { BadRequestError, InternalServerError, NotFoundError } from "../errors/appErrors";
import {
    governorateRepository,
    ordersRepository,
    productDiscountRepository,
    productRepository,
    productSizeRepository,
} from "../repository";
import { getFinalPrice } from "./productDiscountService";
import { getActiveSale } from "./salesService";
import { createServiceLogger } from "../utils/serviceLogger";
import { deleteImage, uploadImage } from "../utils/uploadImage";

const logger = createServiceLogger("OrderService");

const toFixedNumber = (value: number) => Number(value.toFixed(2));

const toIsoUtc = (value: string | null) => {
    if (!value) return null;

    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const withTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(normalized) ? normalized : `${normalized}Z`;
    const parsed = new Date(withTimezone);

    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

const generateOrderRef = () => {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${randomSixDigits}`;
};

const generateUniqueOrderRef = async () => {
    const maxTries = 10;

    for (let attempt = 0; attempt < maxTries; attempt++) {
        const candidate = generateOrderRef();
        const existing = await ordersRepository.findOrderByRef(candidate);

        if (!existing) {
            return candidate;
        }
    }

    throw new InternalServerError("Failed to generate unique order reference");
};

const mapOrderRowsToResponse = (rows: Awaited<ReturnType<typeof ordersRepository.findOrderById>>): OrderResponseDto & { updatedAt?: string | null } => {
    const first = rows[0];

    const items = rows
        .filter((row) => row.itemId !== null)
        .map((row) => ({
            productId: Number(row.itemProductId),
            productName: row.itemProductName ?? "",
            size: row.itemSize ?? "",
            quantity: Number(row.itemQuantity ?? 0),
            unitPrice: Number(row.itemUnitPrice ?? 0),
            oldPrice: row.itemOldPrice !== null ? Number(row.itemOldPrice) : null,
        }));

    return {
        id: first.orderId,
        orderRef: first.orderRef,
        customerFirstName: first.customerFirstName,
        customerLastName: first.customerLastName,
        customerPhone: first.customerPhone,
        address: first.address,
        governorateName: first.governorateName,
        paymentMethod: first.paymentMethod,
        paymentType: first.paymentType,
        screenshotUrl: first.screenshotUrl,
        subtotal: Number(first.subtotal),
        shippingFee: Number(first.shippingFee),
        total: Number(first.total),
        createdAt: toIsoUtc(first.createdAt),
        updatedAt: toIsoUtc(first.updatedAt),
        items,
    };
};

export const getAllOrders = async (limit: number = 10, offset: number = 0) => {
    logger.info("Get all orders");
    const data = await ordersRepository.findAllOrders(limit, offset);
    const [totalCountResult] = await ordersRepository.countOrders();
    const total = Number(totalCountResult.count);
    return { data, total };
};

export const getOrderById = async (id: number) => {
    logger.info("Get order by id", { orderId: id });
    const rows = await ordersRepository.findOrderById(id);

    if (rows.length === 0) {
        logger.warn("Get order by id failed: not found", { orderId: id });
        throw new NotFoundError("Order not found");
    }

    return mapOrderRowsToResponse(rows);
};

export const createOrder = async (dto: CreateOrderDto, screenshot: Express.Multer.File): Promise<OrderResponseDto> => {
    logger.info("Create order started", {
        customerPhone: dto.customerPhone,
        governorateId: dto.governorateId,
        itemsCount: dto.items.length,
    });

    if (!screenshot) {
        throw new BadRequestError("screenshot is required");
    }

    const governorate = await governorateRepository.findGovernorateById(dto.governorateId);
    if (!governorate) {
        throw new NotFoundError("Governorate not found");
    }

    const activeSale = await getActiveSale();
    const activeSaleDiscountPercent = activeSale?.discountPercent ?? null;

    const pricedItems: Array<{
        productId: number;
        productName: string;
        sizeId: number;
        sizeName: string;
        quantity: number;
        unitPrice: number;
        oldPrice: number | null;
    }> = [];

    for (const item of dto.items) {
        const product = await productRepository.findProductById(item.productId);
        if (!product) {
            throw new NotFoundError(`Product not found: ${item.productId}`);
        }

        if (Number(product.isActive ?? 0) !== 1) {
            throw new BadRequestError(`Product is inactive: ${item.productId}`);
        }

        const size = await productSizeRepository.findProductSizeByIdAndProductId(item.sizeId, item.productId);
        if (!size) {
            throw new NotFoundError(`Size not found for product ${item.productId}`);
        }

        const stockQty = Number(size.stockQty ?? 0);
        if (stockQty < item.quantity) {
            throw new BadRequestError(`Insufficient stock for product ${item.productId} size ${size.sizeName}`);
        }

        const originalPrice = Number(product.price);
        const activeProductDiscount = await productDiscountRepository.findActiveProductDiscountByProductId(item.productId);
        const discountPercentage = activeProductDiscount?.discountPercentage !== null && activeProductDiscount?.discountPercentage !== undefined
            ? Number(activeProductDiscount.discountPercentage)
            : null;
        const discountedPrice = activeProductDiscount?.discountedPrice !== null && activeProductDiscount?.discountedPrice !== undefined
            ? Number(activeProductDiscount.discountedPrice)
            : null;

        let unitPrice = originalPrice;

        if (discountPercentage !== null || discountedPrice !== null) {
            unitPrice = getFinalPrice(originalPrice, discountPercentage, discountedPrice, true);
        } else if (activeSaleDiscountPercent !== null) {
            unitPrice = toFixedNumber(originalPrice - (originalPrice * activeSaleDiscountPercent) / 100);
        }

        const oldPrice = unitPrice < originalPrice ? originalPrice : null;

        pricedItems.push({
            productId: item.productId,
            productName: product.name,
            sizeId: item.sizeId,
            sizeName: size.sizeName,
            quantity: item.quantity,
            unitPrice,
            oldPrice,
        });
    }

    const subtotal = toFixedNumber(
        pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    );
    const shippingFee = Number(governorate.shippingFee);
    const total = toFixedNumber(subtotal + shippingFee);
    const orderRef = await generateUniqueOrderRef();

    const uploadedScreenshot = await uploadImage(screenshot.buffer, { folder: "orders" });

    let createdOrderId = 0;

    try {
        createdOrderId = await db.transaction(async (tx) => {
            const [insertOrderResult] = await ordersRepository.insertOrderTx(tx, {
                orderRef,
                customerFirstName: dto.customerFirstName,
                customerLastName: dto.customerLastName,
                customerPhone: dto.customerPhone,
                governorateId: dto.governorateId,
                address: dto.address,
                subtotal: subtotal.toFixed(2),
                shippingFee: shippingFee.toFixed(2),
                total: total.toFixed(2),
                paymentMethod: dto.paymentMethod,
                paymentType: dto.paymentType,
                screenshotUrl: uploadedScreenshot.url,
            });

            const orderId = Number(insertOrderResult.insertId);

            for (const item of pricedItems) {
                const updateResult = await ordersRepository.decrementProductSizeStockTx(tx, item.sizeId, item.productId, item.quantity);
                const affectedRows = Number((updateResult as any)?.affectedRows ?? (Array.isArray(updateResult) ? (updateResult as any)[0]?.affectedRows : 0));

                if (!affectedRows) {
                    throw new BadRequestError(`Insufficient stock for product ${item.productId} size ${item.sizeName}`);
                }

                await ordersRepository.insertOrderItemTx(tx, {
                    orderId,
                    productId: item.productId,
                    size: item.sizeName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toFixed(2),
                    oldPrice: item.oldPrice !== null ? item.oldPrice.toFixed(2) : null,
                });
            }

            return orderId;
        });
    } catch (error) {
        await deleteImage(uploadedScreenshot.publicId).catch(() => undefined);
        throw error;
    }

    const rows = await ordersRepository.findOrderById(createdOrderId);
    if (rows.length === 0) {
        throw new InternalServerError("Order not found after creation");
    }

    const mapped = mapOrderRowsToResponse(rows);
    return {
        id: mapped.id,
        orderRef: mapped.orderRef,
        customerFirstName: mapped.customerFirstName,
        customerLastName: mapped.customerLastName,
        customerPhone: mapped.customerPhone,
        address: mapped.address,
        governorateName: mapped.governorateName,
        paymentMethod: mapped.paymentMethod,
        paymentType: mapped.paymentType,
        screenshotUrl: mapped.screenshotUrl,
        subtotal: mapped.subtotal,
        shippingFee: mapped.shippingFee,
        total: mapped.total,
        createdAt: mapped.createdAt,
        items: mapped.items,
    };
};