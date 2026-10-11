import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase character")
  .regex(/[a-z]/, "Password must contain at least one lowercase character")
  .regex(/[0-9]/, "Password must contain at least one number");
