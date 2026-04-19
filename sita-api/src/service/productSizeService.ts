import { CreateProductSizeDto, UpdateProductSizeDto } from "../dtos/product/productSizeDto";
import { NotFoundError } from "../errors/appErrors";
import { productSizeRepository } from "../repository";
import { createServiceLogger } from "../utils/serviceLogger";

const logger = createServiceLogger("ProductSizeService");

export const addProductSize = async (productId: number, dto: CreateProductSizeDto) => {
    logger.info("Add product size started", { productId, sizeName: dto.sizeName });

    const existing = await productSizeRepository.findProductSizeByProductIdAndName(productId, dto.sizeName);
    if (existing) {
        const currentStockQty = existing.stockQty ?? 0;
        const updatedStockQty = currentStockQty + dto.stockQty;
        await productSizeRepository.updateProductSizeStockQty(existing.sizeId, productId, updatedStockQty, dto.sizeName);
        return {
            sizeId: existing.sizeId,
            productId,
            sizeName: dto.sizeName,
            stockQty: updatedStockQty,
        };
    }
    const [result] = await productSizeRepository.insertProductSize(productId, dto.sizeName, dto.stockQty);
    return {
        sizeId: Number(result.insertId),
        productId,
        sizeName: dto.sizeName,
        stockQty: dto.stockQty,
    };
};

export const updateProductSize = async (productId: number, sizeId: number, dto: UpdateProductSizeDto) => {
    logger.info("Update product size started", { productId, sizeId });
    const existing = await productSizeRepository.findProductSizeByIdAndProductId(sizeId, productId);
    if (!existing) {
        logger.warn("Update product size failed: not found", { productId, sizeId });
        throw new NotFoundError("Product size not found");
    }
    await productSizeRepository.updateProductSizeStockQty(sizeId, productId, dto.stockQty, dto.sizeName);
    return {
        sizeId,
        productId,
        sizeName: dto.sizeName,
        stockQty: dto.stockQty,
    };
};

export const deleteProductSize = async (productId: number, sizeId: number) => {
    logger.info("Delete product size started", { productId, sizeId });
    const existing = await productSizeRepository.findProductSizeByIdAndProductId(sizeId, productId);
    if (!existing) {
        logger.warn("Delete product size failed: not found", { productId, sizeId });
        throw new NotFoundError("Product size not found");
    }
    await productSizeRepository.deleteProductSizeById(sizeId, productId);
    return { message: "Product size deleted successfully" };
};