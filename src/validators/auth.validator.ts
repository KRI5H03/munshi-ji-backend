import { z } from "zod";

export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email(),
  password: z.string().min(8).max(72),
  businessName: z.string().trim().min(1).max(200),
  gstin: z.string().trim().toUpperCase().regex(GSTIN_PATTERN, "Invalid GSTIN"),
  address: z.string().trim().min(1).max(500),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
