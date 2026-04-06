import {z} from "zod";

export const UpdateGovernorateSchema = z.object({
    ShippingFee: z.number().positive("Shipping fee must be a positive number")
});

export type UpdateGovernorateDto = z.infer<typeof UpdateGovernorateSchema>;