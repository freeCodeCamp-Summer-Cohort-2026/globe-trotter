import { z } from "zod";
import { passwordSchema } from "./password";

export const signupSchema = z
  .object({
    name: z.string().min(1, { error: "Name is required" }).max(50),
    email: z.email({ error: "Enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type SignupValues = z.infer<typeof signupSchema>;
