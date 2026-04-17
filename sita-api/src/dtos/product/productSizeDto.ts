import { z } from "zod";


export const ProductSizeSchema = z.object({
productId: z.coerce.number().int().positive(),
    size: z.string().min(1, "Size cannot be empty"),
    stockQty: z.number().int().nonnegative()
});

export type ProductSizeSchema = z.infer<typeof ProductSizeSchema>;