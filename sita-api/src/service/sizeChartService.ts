import { CreateSizeChartDto, SizeChartResponseDto } from "../dtos/product/sizeChartDto";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../errors/appErrors";
import { productRepository, sizeChartRepository } from "../repository";
import { createServiceLogger } from "../utils/serviceLogger";
import { deleteImage, uploadImage } from "../utils/uploadImage";
const logger = createServiceLogger("Size Chart Service");

const ensureProductExists = async (productId: number) => {
    const product = await productRepository.findProductById(productId);
    if (!product) {
        throw new NotFoundError("No Product id with this number");
    }
};

export const createSizeChart = async (dto: CreateSizeChartDto, file: Express.Multer.File) => {
    logger.info("Creating size chart", { productId: dto.productId });
    if (!dto.productId || dto.productId <= 0) {
        throw new BadRequestError("Product ID must be a positive integer");
    }
    await ensureProductExists(dto.productId);

    if (!file) {
        throw new BadRequestError("Size chart image file is required");
    } 

    const existingChart = await sizeChartRepository.getSizeChartByProductId(dto.productId);
    if (existingChart) {
        throw new ConflictError("Size chart already exists for this product");
    }

    const chartUrl = await uploadImage(file.buffer, {
        folder: "size-charts",
    });
    
    const sizeChart = await sizeChartRepository.createSizeChart(dto.productId, chartUrl.url);
    if (!sizeChart) {
        throw new InternalServerError("Failed to create or update size chart");
    }
    return sizeChart as SizeChartResponseDto;
}

export const updateSizeChart = async (dto: CreateSizeChartDto, file: Express.Multer.File) => {
    logger.info("Updating size chart", { productId: dto.productId });
    if (!dto.productId || dto.productId <= 0) {
        throw new BadRequestError("Product ID must be a positive integer");
    }
    await ensureProductExists(dto.productId);

    if (!file) {
        throw new BadRequestError("Size chart image file is required");
    }

    const existingChart = await sizeChartRepository.getSizeChartByProductId(dto.productId);
    if (!existingChart) {
        throw new NotFoundError("Size chart not found for the given product ID");
    }

    const chartUrl = await uploadImage(file.buffer, {
        folder: "size-charts",
    });

    await deleteImage(existingChart.chartUrl);
    const sizeChart = await sizeChartRepository.updateSizeChart(dto.productId, chartUrl.url);
    if (!sizeChart) {
        throw new InternalServerError("Failed to create or update size chart");
    }
    return sizeChart as SizeChartResponseDto;
}

export const getSizeChartByProductId = async (productId: number) => {
    logger.info("Fetching size chart by product ID", { productId });
    if (!productId || productId <= 0) {
        throw new BadRequestError("Product ID must be a positive integer");
    }
    await ensureProductExists(productId);
    const sizeChart = await sizeChartRepository.getSizeChartByProductId(productId);
    if (!sizeChart) {
        throw new NotFoundError("Size chart not found for the given product ID");
    }
    return sizeChart as SizeChartResponseDto;
}

export const deleteSizeChart = async (productId: number) => {
  logger.info("Deleting size chart by product ID", { productId });
  if (!productId || productId <= 0) {
      throw new BadRequestError("Product ID must be a positive integer");
  }
    await ensureProductExists(productId);
  const existingChart = await sizeChartRepository.getSizeChartByProductId(productId);
  if (!existingChart) {
      throw new NotFoundError("Size chart not found for the given product ID");
  }
    await deleteImage(existingChart.chartUrl);
    await sizeChartRepository.deleteSizeChart(productId);
    logger.info("Size chart deleted successfully", { productId });
    return { message: "Size chart deleted successfully" };
}

