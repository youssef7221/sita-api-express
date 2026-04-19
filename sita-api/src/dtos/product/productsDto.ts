import { z } from "zod";

export const CreateProductsSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name is too long"),
	description: z.string().max(65535, "Description is too long").optional(),
	price: z.coerce.number().int().positive("Price must be greater than 0"),
	categoryId: z.coerce.number().int().positive("Category ID must be a positive integer"),
	isActive: z.coerce.number().int().min(0).max(1).optional(),
});

export const UpdateProductsSchema = z.object({
	name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
	description: z.string().max(65535, "Description is too long").optional(),
	price: z.coerce.number().int().positive("Price must be greater than 0").optional(),
	categoryId: z.coerce.number().int().positive("Category ID must be a positive integer").optional(),
	isActive: z.coerce.number().int().min(0).max(1).optional(),
});

export const ChangeProductActivitySchema = z.object({
	isActive: z.boolean({ message: "isActive must be true or false" }),
});

export type CreateProductsDto = z.infer<typeof CreateProductsSchema>;
export type UpdateProductsDto = z.infer<typeof UpdateProductsSchema>;
export type ChangeProductActivityDto = z.infer<typeof ChangeProductActivitySchema>;