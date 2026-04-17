import { asc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { productImages, products } from "../db/drizzle/schema";
import { ProductImageResponseDto, UploadProductImagesDto } from "../dtos/product/productImageDto";
import { BadRequestError, InternalServerError, NotFoundError } from "../errors/appErrors";
import { createServiceLogger } from "../utils/serviceLogger";
import { deleteImage, uploadImage } from "../utils/uploadImage";

type CloudinaryPublicIdRow = { publicId: string | null };
const logger = createServiceLogger("ProductImageService");

const extractRows = <T>(rawResult: any): T[] => {
	if (Array.isArray(rawResult)) return rawResult as T[];
	if (Array.isArray(rawResult?.rows)) return rawResult.rows as T[];
	if (Array.isArray(rawResult?.[0])) return rawResult[0] as T[];
	return [];
};

const validatePositiveInt = (value: number, fieldName: string) => {
	if (!Number.isInteger(value) || value <= 0) {
		throw new BadRequestError(`${fieldName} must be a valid positive integer`);
	}
};

const parsePublicIdFromUrl = (url: string): string | null => {
	try {
		const parsedUrl = new URL(url);
		const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
		const uploadIndex = pathParts.findIndex((part) => part === "upload");

		if (uploadIndex === -1) return null;

		const afterUpload = pathParts.slice(uploadIndex + 1);
		const withoutVersion = afterUpload[0]?.startsWith("v") ? afterUpload.slice(1) : afterUpload;

		if (withoutVersion.length === 0) return null;

		const lastPart = withoutVersion[withoutVersion.length - 1];
		withoutVersion[withoutVersion.length - 1] = lastPart.replace(/\.[^.]+$/, "");

		return withoutVersion.join("/");
	} catch {
		return null;
	}
};

const getProductImagePublicId = async (imageId: number): Promise<string | null> => {
	try {
		const rawResult: any = await db.execute(
			sql`SELECT public_id AS publicId FROM product_images WHERE image_id = ${imageId} LIMIT 1`
		);
		const rows = extractRows<CloudinaryPublicIdRow>(rawResult);
		return rows[0]?.publicId ?? null;
	} catch {
		return null;
	}
};

const ensureProductExists = async (productId: number) => {
	const productRows = await db.select({ productId: products.productId })
		.from(products)
		.where(eq(products.productId, productId))
		.limit(1);

	if (!productRows[0]) {
		throw new NotFoundError("Product not found");
	}
};

export const uploadProductImages = async (
	productId: number,
	files: Express.Multer.File[],
	dto: UploadProductImagesDto
): Promise<ProductImageResponseDto[]> => {
	logger.info("Upload product images started", {
		productId,
		filesCount: files?.length ?? 0,
		primaryIndex: dto?.primaryIndex,
	});

	validatePositiveInt(productId, "productId");

	if (!files || files.length === 0) {
		throw new BadRequestError("At least one image is required");
	}

	await ensureProductExists(productId);

	const existingImages = await db.select()
		.from(productImages)
		.where(eq(productImages.productId, productId));

	const hasPrimaryImage = existingImages.some((image) => Number(image.isPrimary) === 1);
	const primaryIndex = dto.primaryIndex;

	if (!hasPrimaryImage && primaryIndex === undefined) {
		throw new BadRequestError("Primary image is required");
	}

	if (primaryIndex !== undefined && (primaryIndex < 0 || primaryIndex >= files.length)) {
		throw new BadRequestError("Invalid primaryIndex");
	}

	const maxDisplayOrder = existingImages.reduce((max, image) => {
		const currentOrder = Number(image.displayOrder ?? 0);
		return currentOrder > max ? currentOrder : max;
	}, 0);

	let uploadedImages: { url: string; publicId: string }[];

	try {
		uploadedImages = await Promise.all(
			files.map((file) =>
				uploadImage(file.buffer, {
					folder: "Products",
				})
			)
		);
	} catch (error) {
		logger.error("Cloudinary upload failed", error, { productId, filesCount: files.length });
		throw new InternalServerError("Failed to upload images to Cloudinary");
	}

	try {
		const createdImages = await db.transaction(async (tx) => {
			if (primaryIndex !== undefined) {
				await tx.update(productImages)
					.set({ isPrimary: 0 })
					.where(eq(productImages.productId, productId));
			}

			const createdImages: ProductImageResponseDto[] = [];

			for (let index = 0; index < uploadedImages.length; index++) {
				const uploaded = uploadedImages[index];
				const isPrimary = primaryIndex !== undefined ? index === primaryIndex : false;
				const displayOrder = maxDisplayOrder + index + 1;

				const [insertResult] = await tx.insert(productImages).values({
					productId,
					imageUrl: uploaded.url,
					isPrimary: isPrimary ? 1 : 0,
					displayOrder,
				});

				const imageId = Number(insertResult.insertId);

				if (!Number.isInteger(imageId) || imageId <= 0) {
					throw new InternalServerError("Failed to save image record");
				}

				await (tx as any).execute(
					sql`UPDATE product_images SET public_id = ${uploaded.publicId} WHERE image_id = ${imageId}`
				);

				createdImages.push({
					imageId,
					productId,
					url: uploaded.url,
					public_id: uploaded.publicId,
					isPrimary,
					displayOrder,
				});
			}

			return createdImages;
		});

		logger.info("Upload product images completed", {
			productId,
			createdCount: createdImages.length,
			imageIds: createdImages.map((image) => image.imageId),
		});

		return createdImages;
	} catch (error) {
		logger.error("Saving uploaded images failed", error, {
			productId,
			uploadedCount: uploadedImages.length,
		});

		const rollbackResults = await Promise.allSettled(uploadedImages.map((image) => deleteImage(image.publicId)));
		const rollbackFailures = rollbackResults.filter((result) => result.status === "rejected").length;

		if (rollbackFailures > 0) {
			logger.warn("Cloudinary rollback had failures", {
				productId,
				rollbackFailures,
				totalRollbackAttempts: rollbackResults.length,
			});
		}

		throw new InternalServerError("Failed to save product images");
	}
};

export const deleteProductImage = async (productId: number, imageId: number) => {
	logger.info("Delete product image started", { productId, imageId });

	validatePositiveInt(productId, "productId");
	validatePositiveInt(imageId, "imageId");

	const imageRows = await db.select()
		.from(productImages)
		.where(eq(productImages.imageId, imageId))
		.limit(1);

	const image = imageRows[0];

	if (!image) {
		throw new NotFoundError("Product image not found");
	}

	if (image.productId !== productId) {
		throw new NotFoundError("Product image not found for this product");
	}

	const publicId = (await getProductImagePublicId(imageId)) ?? parsePublicIdFromUrl(image.imageUrl);

	if (!publicId) {
		logger.error("Delete product image failed: missing public_id", new Error("Image public_id is missing"), {
			productId,
			imageId,
		});
		throw new InternalServerError("Image public_id is missing");
	}

	try {
		await deleteImage(publicId);
	} catch (error) {
		logger.error("Cloudinary delete failed", error, { productId, imageId, publicId });
		throw new InternalServerError("Failed to delete image from Cloudinary");
	}

	try {
		let reassignedPrimaryImageId: number | null = null;

		await db.transaction(async (tx) => {
			await tx.delete(productImages).where(eq(productImages.imageId, imageId));

			if (Number(image.isPrimary) === 1) {
				const nextImageRows = await tx.select()
					.from(productImages)
					.where(eq(productImages.productId, image.productId))
					.orderBy(asc(productImages.displayOrder), asc(productImages.imageId))
					.limit(1);

				const nextImage = nextImageRows[0];

				if (nextImage) {
					reassignedPrimaryImageId = nextImage.imageId;
					await tx.update(productImages)
						.set({ isPrimary: 1 })
						.where(eq(productImages.imageId, nextImage.imageId));
				}
			}
		});

		return {
			deletedImageId: imageId,
			reassignedPrimaryImageId,
		};
	} catch (error) {
		logger.error("Delete product image transaction failed", error, { productId, imageId });
		throw new InternalServerError("Failed to delete product image");
	}
};

