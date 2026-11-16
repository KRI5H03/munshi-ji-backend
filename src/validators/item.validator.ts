import { z } from "zod";
import { HSN_PATTERN } from "../core/tax.js";

const itemFields = z.object({
  description: z.string().trim().min(1).max(200),
  hsnCode: z.string().trim().regex(HSN_PATTERN, "Invalid HSN code"),
  designNo: z.string().trim().min(1).max(50),
  unit: z.string().trim().toUpperCase().min(1).max(10),
});

export const createItemSchema = itemFields.extend({
  openingStock: z.number().int().min(0).max(1_000_000).default(0),
});

export const updateItemSchema = itemFields
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Nothing to update." });

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const adjustStockSchema = z.object({
  change: z
    .number()
    .int()
    .min(-1_000_000)
    .max(1_000_000)
    .refine((n) => n !== 0, { message: "Change cannot be 0." }),
  note: z.string().trim().min(1).max(200),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
