import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { productSizes } from "../db/drizzle/schema";

export const findProductSizesByProductId = async (productId: number) => {
    return db.select().from(productSizes).where(eq(productSizes.productId, productId));
};

export const findProductSizeById = async (sizeId: number) => {
    const rows = await db.select().from(productSizes).where(eq(productSizes.sizeId, sizeId)).limit(1);
    return rows[0];
};

export const findProductSizeByIdAndProductId = async (sizeId: number, productId: number) => {
    const rows = await db.select()
        .from(productSizes)
        .where(
            and(
                eq(productSizes.sizeId, sizeId),
                eq(productSizes.productId, productId)
            )
        )
        .limit(1);
    return rows[0];
};

export const findProductSizeByProductIdAndName = async (productId: number, sizeName: string) => {
    const rows = await db.select()
        .from(productSizes)
        .where(
            and(
                eq(productSizes.productId, productId),
                eq(productSizes.sizeName, sizeName)
            )
        )
        .limit(1);
    return rows[0];
};

export const insertProductSize = async (productId: number, sizeName: string, stockQty?: number) => {
    return db.insert(productSizes).values({ productId, sizeName, stockQty });
};

export const updateProductSizeStockQty = async (sizeId: number, productId: number, stockQty: number, sizeName: string) => {
    return db.update(productSizes)
        .set({ stockQty, sizeName })
        .where(
            and(
                eq(productSizes.sizeId, sizeId),
                eq(productSizes.productId, productId)
            )
        );
};

export const deleteProductSizeById = async (sizeId: number, productId: number) => {
    return db.delete(productSizes)
        .where(
            and(
                eq(productSizes.sizeId, sizeId),
                eq(productSizes.productId, productId)
            )
        );
};