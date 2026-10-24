import { sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  varchar,
  integer,
  bigint,
  timestamp,
  unique,
  index,
  check,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { invoices } from "./invoices.js";
import { items } from "./items.js";

export const invoiceLines = pgTable(
  "invoice_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    lineNo: integer("line_no").notNull(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id),
    description: text("description").notNull(),
    hsnCode: varchar("hsn_code", { length: 8 }).notNull(),
    designNo: text("design_no").notNull(),
    unit: text("unit").notNull(),
    qty: integer("qty").notNull(),
    rate: bigint("rate", { mode: "number" }).notNull(),
    gross: bigint("gross", { mode: "number" }).notNull(),
    discountAlloc: bigint("discount_alloc", { mode: "number" })
      .notNull()
      .default(0),
    taxable: bigint("taxable", { mode: "number" }).notNull(),
    gstRateBp: integer("gst_rate_bp").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("invoice_lines_line_uq").on(table.invoiceId, table.lineNo),

    check("invoice_lines_qty_pos", sql`qty>0`),
    check("invoice_lines_rate_non_neg", sql`rate>=0`),
    check("invoice_lines_gross_math", sql`gross=qty*rate`),
    check("invoice_lines_taxable_math", sql`taxable=gross-discount_alloc`),
    check("invoice_lines_disc_non_neg", sql`discount_alloc>=0`),

    index("invoice_lines_invoice_idx").on(table.businessId, table.invoiceId),
    index("invoice_lines_item_idx").on(table.businessId, table.itemId),
  ],
);
