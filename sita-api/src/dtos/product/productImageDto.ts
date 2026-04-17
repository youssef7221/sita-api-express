import { z } from "zod";

export const UploadProductImagesSchema = z.object({
    primaryIndex: z.preprocess((value) => {
        if (value === undefined || value === null || value === "") return undefined;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    }, z.number().int().min(0, "primaryIndex must be a non-negative integer").optional())
});

export type UploadProductImagesDto = z.infer<typeof UploadProductImagesSchema>;

export interface ProductImageResponseDto {
    imageId: number;
    productId: number;
    url: string;
    public_id: string | null;
    isPrimary: boolean;
    displayOrder: number;
}
