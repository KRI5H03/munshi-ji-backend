import { sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
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

export const invoiceTaxSummary = pgTable(
  "invoice_tax_summary",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    hsnCode: varchar("hsn_code", { length: 8 }).notNull(),
    gstRateBp: integer("gst_rate_bp").notNull(),
    taxable: bigint("taxable", { mode: "number" }).notNull(),
    cgst: bigint("cgst", { mode: "number" }).notNull().default(0),
    sgst: bigint("sgst", { mode: "number" }).notNull().default(0),
    igst: bigint("igst", { mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("invoice_tax_summary_group_uq").on(
      table.invoiceId,
      table.hsnCode,
      table.gstRateBp,
    ),

    check("invoice_tax_summary_tax_mode", sql`igst=0 OR(cgst=0 and sgst=0)`),
    check("invoice_tax_summary_cgst_eq_sgst", sql`cgst=sgst`),
    check("invoice_tax_summary_taxable_non_neg", sql`taxable>=0`),

    index("invoice_tax_summary_invoice_idx").on(
      table.businessId,
      table.invoiceId,
    ),
  ],
);
