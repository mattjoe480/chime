import { object, string } from "zod"
const emailProviderRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com)$/;
export const signUpSchema = object({
    name: string({ required_error: "Name is required" , invalid_type_error: "Name must be a word" })
        .min(3, "Name is required")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: string({ required_error: "Email is required" , invalid_type_error: "Email must be a valid email" })
        .min(1, "Email is required")
        .email("Invalid email")
        .regex(emailProviderRegex, "Email must be a valid email provider")
    ,
    password: string({ required_error: "Password is required" })
        .min(6, "Password must be more than 6 characters")
        .max(32, "Password must be less than 32 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")  // At least one lowercase letter
        .regex(/[0-9]/, "Password must contain at least one number")  // At least one number
        .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
})