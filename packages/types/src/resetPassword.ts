import { z } from "zod";
import { passwordSchema } from "./password";

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
