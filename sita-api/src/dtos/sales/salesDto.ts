import { z } from "zod";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})[T\s].+$/;

const isValidCalendarDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
};

const SaleDateSchema = z.preprocess((value) => {
    if (typeof value !== "string") {
        return value;
    }

    const input = value.trim();

    if (DATE_ONLY_REGEX.test(input)) {
        return input;
    }

    const match = input.match(DATE_TIME_PREFIX_REGEX);
    if (match) {
        return match[1];
    }

    return input;
}, z.string().refine((value) => DATE_ONLY_REGEX.test(value) && isValidCalendarDate(value), {
    message: "Date must be in YYYY-MM-DD format",
}));

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
