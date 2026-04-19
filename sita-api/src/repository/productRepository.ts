import { concat } from "drizzle-orm/gel-core/expressions";
import { db } from "../db";
import { products } from "../db/drizzle/schema";
import { eq , ilike } from "drizzle-orm";

export const findAllProducts = async () => {
    return db.select().from(products);
}

export const findAllProductsIsActive = async () => {
    return db.select().from(products).where( eq(products.isActive, 1) );
}

export const findProductsByCategoryId = async (categoryId: number) => {
    return db.select().from(products).where( eq(products.categoryId, categoryId) );
}

export const findProductById = async (id: number) => {
    const rows = await db.select().from(products).where(eq(products.productId, id)).limit(1);
    return rows[0];
}

export const searchProductsByName = async (name: string) => {
    return db
        .select()
        .from(products)
        .where(ilike(products.name, `%${name}%`));
};