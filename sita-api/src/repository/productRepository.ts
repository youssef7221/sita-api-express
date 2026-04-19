import { db } from "../db";
import { products , categories , productDiscounts , productImages, productSizes , sales } from "../db/drizzle/schema";
import { and, asc, eq, lte, gte, sql , like } from "drizzle-orm";
import { CreateProductsDto , UpdateProductsDto } from "../dtos/product/productsDto";


export const createProduct = async (data: CreateProductsDto) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const [result] = await db.insert(products).values({
        name: data.name,
        description: data.description ?? null,
        price: data.price.toFixed(2),
        categoryId: data.categoryId,
        isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
        createdAt: now,
        updatedAt: now
    });
    return result;
};

export const updateProduct = async (id: number, data: UpdateProductsDto) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
   const [result] = await db.update(products).set({
        name: data.name,
        description: data.description ?? null,
        price: data.price !== undefined ? data.price.toFixed(2) : undefined,
        categoryId: data.categoryId,
        isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
        updatedAt: now
    }).where(eq(products.productId, id));

    return result;
};

export const deleteProduct = async (id: number) => {
    await db.delete(products).where(eq(products.productId, id));
}

export const changeProductisActive = async (id: number, isActive: boolean) => {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const [result] = await db.update(products).set({
        isActive: isActive ? 1 : 0,
        updatedAt: now
    }).where(eq(products.productId, id));

    return result;
};

export const countProducts = async ({ isActive, search }: { isActive?: boolean; search?: string }) => {
    const query = db.select({ count: sql<number>`count(*)` }).from(products);
    const searchFilter = search?.trim() ? like(products.name, `%${search.trim()}%`) : undefined;

    if (isActive === true) {
        return query.where(and(eq(products.isActive, 1), searchFilter));
    }

    if (isActive === false) {
        return query.where(and(eq(products.isActive, 0), searchFilter));
    }

    if (searchFilter) {
        return query.where(searchFilter);
    }

    return query;
};

export const findAllProducts = async ({
    isActive,
    limit,
    offset,
    search
}: {
    isActive?: boolean;
    limit: number;
    offset: number;
    search?: string;
}) => {
    const searchFilter = search?.trim() ? like(products.name, `%${search.trim()}%`) : undefined;

    const query = db
        .select({
            productId: products.productId,
            name: products.name,
            description: products.description,
            price: products.price,
            isActive: products.isActive,
            categoryId: products.categoryId,
            categoryName: categories.name,
            imageUrl: productImages.imageUrl,
            discountPercentage: productDiscounts.discountPercentage,
            discountedPrice: productDiscounts.discountedPrice,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.categoryId))
        .leftJoin(productImages,
            and(
                eq(productImages.productId, products.productId),
                eq(productImages.isPrimary, 1)
            )
        )
        .leftJoin(productDiscounts,
            and(
                eq(productDiscounts.productId, products.productId),
                eq(productDiscounts.active, 1),
                lte(productDiscounts.startDate, sql`UTC_TIMESTAMP()`),
                gte(productDiscounts.endDate, sql`UTC_TIMESTAMP()`)
            )
        );

    if (isActive === true) {
        return query.where(and(eq(products.isActive, 1), searchFilter)).limit(limit).offset(offset);
    }

    if (isActive === false) {
        return query.where(and(eq(products.isActive, 0), searchFilter)).limit(limit).offset(offset);
    }

    if (searchFilter) {
        return query.where(searchFilter).limit(limit).offset(offset);
    }

    return query.limit(limit).offset(offset);
};
export const countProductsByCategoryId = async (categoryId: number) => {
    return db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.categoryId, categoryId));
};

export const findProductsByCategoryId = async (categoryId: number, limit: number, offset: number) => {
    return db
        .select({
            productId: products.productId,
            name: products.name,
            description: products.description,
            price: products.price,
            isActive: products.isActive,
            categoryId: products.categoryId,
            categoryName: categories.name,
            imageUrl: productImages.imageUrl,
            discountPercentage: productDiscounts.discountPercentage,
            discountedPrice: productDiscounts.discountedPrice,
            
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.categoryId))
        .leftJoin(productImages,
            and(
                eq(productImages.productId, products.productId),
                eq(productImages.isPrimary, 1)
            )
        )
        .leftJoin(productDiscounts,
            and(
                eq(productDiscounts.productId, products.productId),
                eq(productDiscounts.active, 1),
                lte(productDiscounts.startDate, sql`UTC_TIMESTAMP()`),
                gte(productDiscounts.endDate, sql`UTC_TIMESTAMP()`)
            )
        )
        .where(eq(products.categoryId, categoryId))
        .limit(limit)
        .offset(offset);
    };

export const findProductById = async (id: number) => {
    const rows = await db.select().from(products).where(eq(products.productId, id)).limit(1);
    return rows[0];
}

export const findProductDetailsById = async (id: number) => {
    return db
        .select({
            productId: products.productId,
            name: products.name,
            description: products.description,
            price: products.price,
            isActive: products.isActive,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            discountPercentage: productDiscounts.discountPercentage,
            discountedPrice: productDiscounts.discountedPrice,
            imageId: productImages.imageId,
            imageUrl: productImages.imageUrl,
            imageIsPrimary: productImages.isPrimary,
            imageDisplayOrder: productImages.displayOrder,
            sizeId: productSizes.sizeId,
            sizeName: productSizes.sizeName,
            stockQty: productSizes.stockQty,
        })
        .from(products)
        .leftJoin(productImages, eq(productImages.productId, products.productId))
        .leftJoin(productSizes, eq(productSizes.productId, products.productId))
        .leftJoin(productDiscounts,
            and(
                eq(productDiscounts.productId, products.productId),
                eq(productDiscounts.active, 1),
                lte(productDiscounts.startDate, sql`UTC_TIMESTAMP()`),
                gte(productDiscounts.endDate, sql`UTC_TIMESTAMP()`)
            )
        )
        .where(eq(products.productId, id))
        .orderBy(asc(productImages.displayOrder), asc(productImages.imageId), asc(productSizes.sizeId));
};

