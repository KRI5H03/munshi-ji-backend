import { z } from "zod";
import { GSTIN_PATTERN } from "./auth.validator.js";

export const updateBusinessSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    address: z.string().trim().min(1).max(500),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    pan: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "Invalid PAN"),
    msmeUdhyamNo: z.string().trim().toUpperCase().max(30),
    branchAddress: z.string().trim().max(500),
    jurisdiction: z.string().trim().max(100),
    bankName: z.string().trim().max(100),
    bankAccountNo: z
      .string()
      .regex(/^\d{9,18}$/, "Account number must be 9-18 digits"),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC"),
    bankBranch: z.string().trim().max(100),
    termsText: z.string().trim().max(2000),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update." });

export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

export const createBusinessSchema = z.object({
  name: z.string().trim().min(1).max(200),
  gstin: z.string().trim().toUpperCase().regex(GSTIN_PATTERN, "Invalid GSTIN"),
  address: z.string().trim().min(1).max(500),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
