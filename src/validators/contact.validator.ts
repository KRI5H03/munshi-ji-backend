import { z } from "zod";
import { GSTIN_PATTERN } from "./auth.validator.js";

const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

const contactFields = z.object({
  name: z.string().trim().min(1).max(200),
  contactType: z.enum(["customer", "supplier", "both"]),
  city: z.string().trim().min(1).max(100),
  address: z.string().trim().max(500).optional(),
  stateCode: z
    .string()
    .regex(/^\d{2}$/, "State code must be 2 digits")
    .optional(),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(GSTIN_PATTERN, "Invalid GSTIN")
    .optional(),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_PATTERN, "Invalid PAN")
    .optional(),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits")
    .optional(),
});

export const createContactSchema = contactFields.refine(
  (d) => d.gstin || d.stateCode,
  { message: "Give either a GSTIN or a state code.", path: ["stateCode"] },
);

export const updateContactSchema = contactFields
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update." });

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
