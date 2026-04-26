import { z } from "zod";

export const CreateSizeChartSchema = z.object({
    productId: z.coerce.number().int().positive("Product ID must be a positive integer"),
});

export type CreateSizeChartDto = z.infer<typeof CreateSizeChartSchema>;

export interface SizeChartResponseDto {
    id: number;
    productId: number;
    chartUrl: string;
    createdAt: string;
    updatedAt: string;
}
