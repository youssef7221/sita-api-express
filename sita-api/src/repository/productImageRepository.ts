import { asc, eq, sql , and } from "drizzle-orm";
import { db } from "../db";
import { productImages, products } from "../db/drizzle/schema";

type CloudinaryPublicIdRow = { publicId: string | null };

const extractRows = <T>(rawResult: unknown): T[] => {
    if (Array.isArray(rawResult)) return rawResult as T[];
    if (Array.isArray((rawResult as { rows?: unknown[] })?.rows)) {
        return (rawResult as { rows: T[] }).rows;
    }
    if (Array.isArray((rawResult as unknown[])?.[0])) {
        return (rawResult as T[][])[0];
    }
    return [];
};

export const getProductImagePublicId = async (imageId: number): Promise<string | null> => {
    try {
        const rawResult = await db.execute(
            sql`SELECT public_id AS publicId FROM product_images WHERE image_id = ${imageId} LIMIT 1`
        );
        const rows = extractRows<CloudinaryPublicIdRow>(rawResult);
        return rows[0]?.publicId ?? null;
    } catch {
        return null;
    }
};

export const findProductById = async (productId: number) => {
    const rows = await db.select({ productId: products.productId })
        .from(products)
        .where(eq(products.productId, productId))
        .limit(1);
    return rows[0];
};

export const findImagesByProductId = async (productId: number) => {
    return db.select()
        .from(productImages)
        .where(eq(productImages.productId, productId));
};

export const findImageById = async (imageId: number) => {
    const rows = await db.select()
        .from(productImages)
        .where(eq(productImages.imageId, imageId))
        .limit(1);
    return rows[0];
};

export const clearPrimaryByProductIdTx = async (tx: any, productId: number) => {
    return tx.update(productImages)
        .set({ isPrimary: 0 })
        .where(eq(productImages.productId, productId));
};

export const insertProductImageTx = async (
    tx: any,
    input: { productId: number; imageUrl: string; isPrimary: number; displayOrder: number }
) => {
    return tx.insert(productImages).values(input);
};

export const updateImagePublicIdTx = async (tx: any, imageId: number, publicId: string) => {
    return tx.execute(
        sql`UPDATE product_images SET public_id = ${publicId} WHERE image_id = ${imageId}`
    );
};

export const deleteProductImageTx = async (tx: any, imageId: number) => {
    return tx.delete(productImages).where(eq(productImages.imageId, imageId));
};

export const findPrimaryImageUrlByProductId = async (productId: number) => {
    const rows = await db.select()
        .from(productImages)
        .where(and(eq(productImages.productId, productId), eq(productImages.isPrimary, 1)))
        .orderBy(asc(productImages.displayOrder), asc(productImages.imageId))
        .limit(1);
    return rows[0].imageUrl ?? null;
};

export const findNextProductImageForPrimaryTx = async (tx: any, productId: number) => {
    const rows = await tx.select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.displayOrder), asc(productImages.imageId))
        .limit(1);
    return rows[0];
};

export const markImageAsPrimaryTx = async (tx: any, imageId: number) => {
    return tx.update(productImages)
        .set({ isPrimary: 1 })
        .where(eq(productImages.imageId, imageId));
};
