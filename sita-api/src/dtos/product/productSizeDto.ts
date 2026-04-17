import { z } from "zod";

export const CreateProductSizeSchema = z.object({
    sizeName: z.string().min(1, "Size Name cannot be empty").max(3, "Size cannot exceed 3 characters"),
    stockQty: z.coerce.number().int().nonnegative(),
});

export const UpdateProductSizeSchema = z.object({
    sizeName: z.string().min(1, "Size Name cannot be empty").max(3, "Size cannot exceed 3 characters"),
    stockQty: z.number().int().nonnegative().min(0, "Stock quantity cannot be negative"),
});

export type CreateProductSizeDto = z.infer<typeof CreateProductSizeSchema>;
export type UpdateProductSizeDto = z.infer<typeof UpdateProductSizeSchema>;