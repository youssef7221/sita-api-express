import { eq } from "drizzle-orm";
import { db } from "../db";
import { productSizes } from "../db/drizzle/schema";

type InsertProductSizeInput = {
    productId: number;
    sizeName: string;
    stockQty?: number;
};

export const findProductSizesByProductId = async (productId: number) => {
    return db.select().from(productSizes).where(eq(productSizes.productId, productId));
};

export const insertProductSize = async (input: InsertProductSizeInput) => {
    return db.insert(productSizes).values(input);
};
