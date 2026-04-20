import { desc, eq , and , gte , lte, sql } from "drizzle-orm";
import { db } from "../db";
import { productDiscounts, products } from "../db/drizzle/schema";

type ProductDiscountInsertInput = {
    productId: number;
    discountPercentage: string | null;
    discountedPrice: string | null;
    startDate: string;
    endDate: string;
    active: number;
    createdAt: string;
    updatedAt: string;
};

type ProductDiscountUpdateInput = {
    productId: number;
    discountPercentage: string | null;
    discountedPrice: string | null;
    startDate: string;
    endDate: string;
    active: number;
    updatedAt: string;
};

const productDiscountSelect = {
    id: productDiscounts.id,
    productId: productDiscounts.productId,
    productName: products.name,
    originalPrice: products.price,
    discountPercentage: productDiscounts.discountPercentage,
    discountedPrice: productDiscounts.discountedPrice,
    startDate: productDiscounts.startDate,
    endDate: productDiscounts.endDate,
    active: productDiscounts.active,
    createdAt: productDiscounts.createdAt,
    updatedAt: productDiscounts.updatedAt,
};

export const findAllProductDiscounts = async () => {
    return db.select(productDiscountSelect).from(productDiscounts)
        .innerJoin(products, eq(productDiscounts.productId, products.productId))
        .orderBy(desc(productDiscounts.id));
};

export const findProductDiscountById = async (id: number) => {
    const rows = await db.select(productDiscountSelect).from(productDiscounts)
        .innerJoin(products, eq(productDiscounts.productId, products.productId))
        .where(eq(productDiscounts.id, id))
        .limit(1);

    return rows[0];
};

export const findProductDiscountsByProductId = async (productId: number) => {
    return db.select(productDiscountSelect).from(productDiscounts)
        .innerJoin(products, eq(productDiscounts.productId, products.productId))
        .where(eq(productDiscounts.productId, productId))
        .orderBy(desc(productDiscounts.startDate));
};

export const findActiveProductDiscountByProductId = async (productId: number) => {
    const rows = await db
        .select({
            discountPercentage: productDiscounts.discountPercentage,
            discountedPrice: productDiscounts.discountedPrice,
        })
        .from(productDiscounts)
        .where(
            and(
                eq(productDiscounts.productId, productId),
                eq(productDiscounts.active, 1),
                lte(productDiscounts.startDate, sql`UTC_TIMESTAMP()`),
                gte(productDiscounts.endDate, sql`UTC_TIMESTAMP()`)
            )
        )
        .orderBy(desc(productDiscounts.startDate))
        .limit(1);

    return rows[0];
};

export const insertProductDiscount = async (input: ProductDiscountInsertInput) => {
    return db.insert(productDiscounts).values(input);
};

export const updateProductDiscountById = async (id: number, input: ProductDiscountUpdateInput) => {
    return db.update(productDiscounts).set(input).where(eq(productDiscounts.id, id));
};

export const updateProductDiscountActive = async (id: number, active: number, updatedAt: string) => {
    return db.update(productDiscounts).set({ active, updatedAt }).where(eq(productDiscounts.id, id));
};

export const deleteProductDiscountById = async (id: number) => {
    return db.delete(productDiscounts).where(eq(productDiscounts.id, id));
};

export const isHaveActiveDiscount = async (productId: number) => {
    
    const rows = await db.select().from(productDiscounts)
        .where(and(
            eq(productDiscounts.productId, productId),
            eq(productDiscounts.active, 1),
            lte(productDiscounts.startDate, sql`UTC_TIMESTAMP()`),
            gte(productDiscounts.endDate, sql`UTC_TIMESTAMP()`)
        ))
        .limit(1);
    return rows.length > 0;
};