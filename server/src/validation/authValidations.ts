import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({ message: "Name is required" })
      .min(3, { message: "Name must be at least 3 characters long" }),
    email: z
      .string({ message: "Email is required" })
      .email({ message: "Invalid email" }),
    contactNumber: z
      .string()
      .min(1, { message: "Contact number is required" })
      .max(10,{message:"Contact number cannot exceed 10 digits"}),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string({ message: "Confirm Password is required" })
      .min(8, {
        message: "Confirm Password must be at least 8 characters long",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password is required" })
});
// * path tells that on which field error is present
