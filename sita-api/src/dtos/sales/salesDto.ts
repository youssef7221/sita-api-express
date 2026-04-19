import { z } from "zod";

const SaleDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const CreateSaleSchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
    discountPercent: z.coerce.number().gt(0, "Discount percent must be greater than 0").lte(100, "Discount percent must be 100 or less"),
    startDate: SaleDateSchema,
    endDate: SaleDateSchema,
}).refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be greater than or equal to startDate",
    path: ["endDate"],
});

export const UpdateSaleSchema = z.object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long"),
    discountPercent: z.coerce.number().gt(0, "Discount percent must be greater than 0").lte(100, "Discount percent must be 100 or less"),
    startDate: SaleDateSchema,
    endDate: SaleDateSchema,
}).refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be greater than or equal to startDate",
    path: ["endDate"],
});

export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;
export type UpdateSaleDto = z.infer<typeof UpdateSaleSchema>;
