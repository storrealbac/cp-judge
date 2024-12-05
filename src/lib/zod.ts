import { object, string } from "zod";

export const loginSchema = object({
    email: string({ required_error: "Email is required"})
        .min(5, "Email must be at least 5 characters")
        .email("Please enter a valid email"),
    password: string({required_error: "Password is required"})
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be at most 32 characters")
});

export const registerSchema = object({
    username: string({ required_error: "Username is required"})
        .min(5, "Username must be at least 5 characters")
        .max(32, "Username must be at most 32 characters"),
    email: string({ required_error: "Email is required"})
        .min(5, "Email must be at least 5 characters")
        .email("Please enter a valid email"),
    password: string({required_error: "Password is required"})
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be at most 32 characters"),
    confirmPassword: string({required_error: "Confirm Password is required"})
        .min(8, "Confirm Password must be at least 8 characters")
        .max(32, "Confirm Password must be at most 32 characters")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});