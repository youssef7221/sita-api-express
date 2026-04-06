import {z} from "zod";

export const RegisterSchema = z.object({
    username: z.string()
        .min(3, "username must be at least 3 characters")
        .max(50, "username too long"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
});

export const LoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;