import { z } from "zod";

const DateTimeSchema = z.string().min(1, "Date is required").refine((value) => {
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    return !Number.isNaN(new Date(normalized).getTime());
}, { message: "Invalid datetime format" });

const discountValidation = {
    message: "At least one of discountPercentage or discountedPrice must be provided",
    path: ["discountPercentage"],
};

const dateRangeValidation = {
    message: "endDate must be after startDate",
    path: ["endDate"],
};

const ProductDiscountBaseSchema = z.object({
    productId: z.coerce.number().int().positive("Product ID must be a positive integer"),
    discountPercentage: z.coerce.number().gt(0, "Discount percentage must be greater than 0").lte(100, "Discount percentage must be 100 or less").optional(),
    discountedPrice: z.coerce.number().gt(0, "Discounted price must be greater than 0").optional(),
    startDate: DateTimeSchema,
    endDate: DateTimeSchema,
    active: z.union([z.boolean(), z.coerce.number().int().min(0).max(1)]).optional(),
});

export const CreateProductDiscountSchema = ProductDiscountBaseSchema
    .refine((data) => data.discountPercentage !== undefined || data.discountedPrice !== undefined, discountValidation)
    .refine((data) => {
        const start = new Date(data.startDate.includes("T") ? data.startDate : data.startDate.replace(" ", "T"));
        const end = new Date(data.endDate.includes("T") ? data.endDate : data.endDate.replace(" ", "T"));
        return end.getTime() > start.getTime();
    }, dateRangeValidation);

export const UpdateProductDiscountSchema = ProductDiscountBaseSchema
    .refine((data) => data.discountPercentage !== undefined || data.discountedPrice !== undefined, discountValidation)
    .refine((data) => {
        const start = new Date(data.startDate.includes("T") ? data.startDate : data.startDate.replace(" ", "T"));
        const end = new Date(data.endDate.includes("T") ? data.endDate : data.endDate.replace(" ", "T"));
        return end.getTime() > start.getTime();
    }, dateRangeValidation);

export type CreateProductDiscountDto = z.infer<typeof CreateProductDiscountSchema>;
export type UpdateProductDiscountDto = z.infer<typeof UpdateProductDiscountSchema>;
