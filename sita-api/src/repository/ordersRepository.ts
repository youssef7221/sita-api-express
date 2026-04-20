import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { governorates, orderItems, orders, productSizes, products } from "../db/drizzle/schema";

type CreateOrderInsertInput = {
    orderRef: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    governorateId: number;
    address: string;
    subtotal: string;
    shippingFee: string;
    total: string;
    paymentMethod: string;
    paymentType: string;
    screenshotUrl: string;
};

type CreateOrderItemInsertInput = {
    orderId: number;
    productId: number;
    size: string;
    quantity: number;
    unitPrice: string;
    oldPrice: string | null;
};

export const findAllOrders = async (limit: number , offset: number) => {
    return db.select().from(orders).limit(limit).offset(offset);
}

export const findOrderById = async (id: number) => {
    const rows = await db
        .select({
            orderId: orders.orderId,
            orderRef: orders.orderRef,
            customerFirstName: orders.customerFirstName,
            customerLastName: orders.customerLastName,
            customerPhone: orders.customerPhone,
            governorateId: orders.governorateId,
            address: orders.address,
            subtotal: orders.subtotal,
            shippingFee: orders.shippingFee,
            total: orders.total,
            paymentMethod: orders.paymentMethod,
            paymentType: orders.paymentType,
            screenshotUrl: orders.screenshotUrl,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            governorateName: governorates.name,
            itemId: orderItems.orderItemId,
            itemProductId: orderItems.productId,
            itemProductName: products.name,
            itemSize: orderItems.size,
            itemQuantity: orderItems.quantity,
            itemUnitPrice: orderItems.unitPrice,
            itemOldPrice: orderItems.oldPrice,
        })
        .from(orders)
        .leftJoin(governorates, eq(governorates.governorateId, orders.governorateId))
        .leftJoin(orderItems, eq(orderItems.orderId, orders.orderId))
        .leftJoin(products, eq(products.productId, orderItems.productId))
        .where(eq(orders.orderId, id));
    return rows;
}

export const countOrders = async () => {
    return db
        .select({ count: sql<number>`count(*)` })
        .from(orders);
}

export const findOrderByRef = async (orderRef: string) => {
    const rows = await db.select({ orderId: orders.orderId }).from(orders).where(eq(orders.orderRef, orderRef)).limit(1);
    return rows[0];
};

export const insertOrderTx = async (tx: any, input: CreateOrderInsertInput) => {
    return tx.insert(orders).values(input);
};

export const insertOrderItemTx = async (tx: any, input: CreateOrderItemInsertInput) => {
    return tx.insert(orderItems).values(input);
};

export const decrementProductSizeStockTx = async (tx: any, sizeId: number, productId: number, quantity: number) => {
    return tx
        .update(productSizes)
        .set({ stockQty: sql`${productSizes.stockQty} - ${quantity}` })
        .where(
            and(
                eq(productSizes.sizeId, sizeId),
                eq(productSizes.productId, productId),
                gte(productSizes.stockQty, quantity)
            )
        );
};