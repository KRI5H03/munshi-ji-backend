import { z } from "zod";
import { UUID_PATTERN } from "../utils/jwt.js";
import { dateRules } from "../core/fy.js";

const uuid = (label: string) =>
  z.string().regex(UUID_PATTERN, `Invalid ${label}`);

const saleLine = z.object({
  itemId: uuid("item id"),
  qty: z.number().int().min(1).max(100_000),
  rate: z.number().int().min(0).max(100_000_000), // paise per piece
});

export const createSaleSchema = z.object({
  date: z.string().regex(dateRules, "Date must be YYYY-MM-DD"),
  billedToContactId: uuid("billed-to contact id"),
  shippedToContactId: uuid("shipped-to contact id").optional(),
  lines: z.array(saleLine).min(1, "Add at least one item").max(50),
  discounts: z
    .array(z.number().int().min(0).max(100_000)) // milli-percent: 4.762% = 4762
    .max(2, "At most 2 discounts")
    .default([]),
  grRrNo: z.string().trim().max(50).optional(),
  transport: z.string().trim().max(100).optional(),
  vehicleNo: z.string().trim().toUpperCase().max(20).optional(),
  station: z.string().trim().max(100).optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
