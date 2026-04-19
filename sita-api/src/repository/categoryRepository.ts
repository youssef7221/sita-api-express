import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/drizzle/schema";

type InsertCategoryInput = {
    name: string;
    slug: string;
    description?: string | null;
};

type UpdateCategoryInput = Partial<InsertCategoryInput>;

export const countCategories = async () => {
    return db.select({ count: sql<number>`count(*)` }).from(categories);
};

export const findAllCategories = async (limit: number, offset: number) => {
    return db.select().from(categories).limit(limit).offset(offset);
};

export const findCategoryById = async (id: number) => {
    const rows = await db.select().from(categories).where(eq(categories.categoryId, id)).limit(1);
    return rows[0];
};

export const findCategoryBySlug = async (slug: string) => {
    const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return rows[0];
};

export const insertCategory = async (input: InsertCategoryInput) => {
    return db.insert(categories).values(input);
};

export const updateCategoryById = async (id: number, updateData: UpdateCategoryInput) => {
    return db.update(categories).set(updateData).where(eq(categories.categoryId, id));
};

export const deleteCategoryById = async (id: number) => {
    return db.delete(categories).where(eq(categories.categoryId, id));
};
