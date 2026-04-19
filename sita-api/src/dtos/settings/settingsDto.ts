import { z } from "zod";
export const UpdateSettingSchema = z.object({
    value: z.enum(["true", "false"], { 
        message: "Value must be either 'true' or 'false'" 
    })
});

export type UpdateSettingDto = z.infer<typeof UpdateSettingSchema>;
