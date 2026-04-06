import { db } from "../db";
import { categories } from "../db/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/categoryDto";
import { NotFoundError, ExistsAlready } from "../../../postsapi/src/errors/appErrors";

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getAllCategories = async (limit: number = 10, offset: number = 0) => {
    const [totalCountResult] = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const total = Number(totalCountResult.count);
    
    const data = await db.select().from(categories).limit(limit).offset(offset);
    
    return { data, total };
}

export const getCategoryById = async (id: number) => {
    const category = await db.select().from(categories).where(eq(categories.categoryId, id)).limit(1);
    if (!category[0]) throw new NotFoundError("Category not found");
    return category[0];
}

export const createCategory = async (dto: CreateCategoryDto) => {
    const slug = generateSlug(dto.name);
    
    const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existing[0]) throw new ExistsAlready("Category with this name already exists");

    const [result] = await db.insert(categories).values({
        name: dto.name,
        slug,
        description: dto.description
    });

    return {
        categoryId: result.insertId,
        name: dto.name,
        slug,
        description: dto.description
    };
}

export const updateCategory = async (id: number, dto: UpdateCategoryDto) => {
    const category = await getCategoryById(id);
    
    const updateData: any = { ...dto };
    if (dto.name) {
        updateData.slug = generateSlug(dto.name);
        if (updateData.slug !== category.slug) {
            const existing = await db.select().from(categories).where(eq(categories.slug, updateData.slug)).limit(1);
            if (existing[0]) throw new ExistsAlready("Category with this name already exists");
        }
    }

    await db.update(categories)
        .set(updateData)
        .where(eq(categories.categoryId, id));

    return { ...category, ...updateData };
}

export const deleteCategory = async (id: number) => {
    await getCategoryById(id); // throws if not found
    await db.delete(categories).where(eq(categories.categoryId, id));
    return { success: true };
}