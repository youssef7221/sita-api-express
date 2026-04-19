import {productRepository} from "../repository";
import { categoryRepository } from "../repository";
import { NotFoundError } from "../errors/appErrors";
import { getFinalPrice } from "./productDiscountService";
import { createServiceLogger } from "../utils/serviceLogger";
import { ChangeProductActivityDto, CreateProductsDto, UpdateProductsDto } from "../dtos/product/productsDto";
import { getActiveSale } from "./salesService";
const logger = createServiceLogger("ProductsService");

const calculateFinalPriceByPriority = ({
    price,
    productDiscountPercentage,
    productDiscountedPrice,
    activeSaleDiscountPercent,
}: {
    price: number;
    productDiscountPercentage: number | null;
    productDiscountedPrice: number | null;
    activeSaleDiscountPercent: number | null;
}) => {
    const hasSpecificProductDiscount = productDiscountPercentage !== null || productDiscountedPrice !== null;

    if (hasSpecificProductDiscount) {
        return {
            finalPrice: getFinalPrice(price, productDiscountPercentage, productDiscountedPrice, true),
            hasDiscount: true,
        };
    }

    if (activeSaleDiscountPercent !== null) {
        const saleFinalPrice = price - (price * activeSaleDiscountPercent) / 100;
        return {
            finalPrice: Number(saleFinalPrice.toFixed(2)),
            hasDiscount: true,
        };
    }

    return {
        finalPrice: price,
        hasDiscount: false,
    };
};

const mapProductListItem = (p: {
    productId: number;
    name: string;
    price: string;
    isActive: number | null;
    imageUrl: string | null;
    categoryId: number;
    categoryName: string | null;
    discountPercentage: string | null;
    discountedPrice: string | null;
}, activeSaleDiscountPercent: number | null) => {
    const price = Number(p.price);
    const discountPercentage = p.discountPercentage !== null ? Number(p.discountPercentage) : null;
    const discountedPrice = p.discountedPrice !== null ? Number(p.discountedPrice) : null;
    const { finalPrice, hasDiscount } = calculateFinalPriceByPriority({
        price,
        productDiscountPercentage: discountPercentage,
        productDiscountedPrice: discountedPrice,
        activeSaleDiscountPercent,
    });
    


    return {
        id: p.productId,
        name: p.name,
        price,
        hasDiscount,
        finalPrice,
        isActive: Number(p.isActive ?? 0) === 1,
        mainImageUrl: p.imageUrl,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
    };
};

const toIsoUtc = (value: string | null) => {
    if (!value) return null;

    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const withTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(normalized) ? normalized : `${normalized}Z`;
    const parsed = new Date(withTimezone);

    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

export const getAllProducts = async (limit: number = 10, offset: number = 0, isActive?: boolean , search?: string) => {
    logger.info("Get all products started", { limit, offset, isActive, search });

    const [totalCountResult] = await productRepository.countProducts({ isActive, search });
    const total = Number(totalCountResult.count);
    const activeSale = await getActiveSale();
    const activeSaleDiscountPercent = activeSale?.discountPercent ?? null;

    const rows = await productRepository.findAllProducts({ isActive, limit, offset, search });
    const data = rows.map((row) => mapProductListItem(row, activeSaleDiscountPercent));

    return { data, total };
};

export const getProductsByCategoryId = async (categoryId: number, limit: number = 10, offset: number = 0) => {
    logger.info("Get products by category started", { categoryId, limit, offset });

    const [totalCountResult] = await productRepository.countProductsByCategoryId(categoryId);
    const total = Number(totalCountResult.count);
    const activeSale = await getActiveSale();
    const activeSaleDiscountPercent = activeSale?.discountPercent ?? null;

    const rows = await productRepository.findProductsByCategoryId(categoryId, limit, offset);
    const data = rows.map((row) => mapProductListItem(row, activeSaleDiscountPercent));

    return { data, total };
};

export const getProductById = async (id: number) => {
    logger.info("Get product by id started", { productId: id });

    const rows = await productRepository.findProductDetailsById(id);
    if (rows.length === 0) {
        throw new NotFoundError("Product not found");
    }

    const firstRow = rows[0];
    const price = Number(firstRow.price);
    const discountPercentage = firstRow.discountPercentage !== null ? Number(firstRow.discountPercentage) : null;
    const discountedPrice = firstRow.discountedPrice !== null ? Number(firstRow.discountedPrice) : null;
    const activeSale = await getActiveSale();
    const activeSaleDiscountPercent = activeSale?.discountPercent ?? null;
    const { finalPrice, hasDiscount } = calculateFinalPriceByPriority({
        price,
        productDiscountPercentage: discountPercentage,
        productDiscountedPrice: discountedPrice,
        activeSaleDiscountPercent,
    });

    const imagesMap = new Map<number, { imageUrl: string; isPrimary: boolean; displayOrder: number | null }>();
    const sizesMap = new Map<number, { id: number; sizeName: string; stockQty: number }>();

    for (const row of rows) {
        if (row.imageId !== null && row.imageUrl !== null && !imagesMap.has(row.imageId)) {
            imagesMap.set(row.imageId, {
                imageUrl: row.imageUrl,
                isPrimary: Number(row.imageIsPrimary) === 1,
                displayOrder: row.imageDisplayOrder,
            });
        }

        if (row.sizeId !== null && row.sizeName !== null && !sizesMap.has(row.sizeId)) {
            sizesMap.set(row.sizeId, {
                id: row.sizeId,
                sizeName: row.sizeName,
                stockQty: Number(row.stockQty ?? 0),
            });
        }
    }

    return {
        id: firstRow.productId,
        name: firstRow.name,
        description: firstRow.description,
        price,
        finalPrice,
        hasDiscount,
        isActive: Number(firstRow.isActive) === 1,
        images: Array.from(imagesMap.values()),
        sizes: Array.from(sizesMap.values()),
        createdAt: toIsoUtc(firstRow.createdAt),
        updatedAt: toIsoUtc(firstRow.updatedAt),
    };
};

const toProductBaseResponse = (product: {
    productId: number;
    name: string;
    description: string | null;
    price: string;
    categoryId: number;
    isActive: number | null;
    createdAt: string | null;
    updatedAt: string | null;
}) => {
    return {
        id: product.productId,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        categoryId: product.categoryId,
        isActive: Number(product.isActive ?? 0) === 1,
        createdAt: toIsoUtc(product.createdAt),
        updatedAt: toIsoUtc(product.updatedAt),
    };
};

const ensureProductExists = async (id: number) => {
    const existing = await productRepository.findProductById(id);

    if (!existing) {
        logger.warn("Product operation failed: product not found", { productId: id });
        throw new NotFoundError("Product not found");
    }

    return existing;
};

const ensureCategoryExists = async (categoryId: number) => {
    const category = await categoryRepository.findCategoryById(categoryId);

    if (!category) {
        logger.warn("Product operation failed: category not found", { categoryId });
        throw new NotFoundError("Category not found");
    }
};

export const createProduct = async (dto: CreateProductsDto) => {
    logger.info("Create product started", { name: dto.name, categoryId: dto.categoryId });

    await ensureCategoryExists(dto.categoryId);

    const result = await productRepository.createProduct(dto);
    const created = await productRepository.findProductById(Number(result.insertId));

    if (!created) {
        throw new NotFoundError("Product not found after creation");
    }

    return toProductBaseResponse(created);
};

export const updateProduct = async (id: number, dto: UpdateProductsDto) => {
    logger.info("Update product started", { productId: id });

    await ensureProductExists(id);

    if (dto.categoryId !== undefined) {
        await ensureCategoryExists(dto.categoryId);
    }

    await productRepository.updateProduct(id, dto);
    const updated = await productRepository.findProductById(id);

    if (!updated) {
        throw new NotFoundError("Product not found after update");
    }

    return toProductBaseResponse(updated);
};

export const deleteProduct = async (id: number) => {
    logger.info("Delete product started", { productId: id });

    await ensureProductExists(id);
    await productRepository.deleteProduct(id);
};

export const changeProductActivity = async (id: number, dto: ChangeProductActivityDto) => {
    logger.info("Change product activity started", { productId: id, isActive: dto.isActive });

    await ensureProductExists(id);

    await productRepository.changeProductisActive(id, dto.isActive);
    const updated = await productRepository.findProductById(id);

    if (!updated) {
        throw new NotFoundError("Product not found after activity change");
    }

    return toProductBaseResponse(updated);
};

