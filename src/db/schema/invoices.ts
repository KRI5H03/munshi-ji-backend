import {
  uuid,
  pgTable,
  timestamp,
  bigint,
  text,
  char,
  integer,
  boolean,
  date,
  jsonb,
  uniqueIndex,
  index,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { businesses } from "./businesses.js";
import { users } from "./users.js";
import { contacts } from "./contacts.js";
import { docType, invoiceStatus } from "./enum.js";

type Discount = { seq: number; percentMilli: number; amount: number };

export const invoices = pgTable(
  "invoices",
  {
    // group 1
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    docType: docType("doc_type").notNull(),
    fy: char("fy", { length: 7 }).notNull(),
    serial: integer("serial"),
    invoiceNo: text("invoice_no"),
    supplierInvoiceNo: text("supplier_invoice_no"),
    date: date("date", { mode: "string" }).notNull(),
    status: invoiceStatus("status").notNull().default("active"),
    //group 2
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: uuid("cancelled_by").references(() => users.id),
    cancelReason: text("cancel_reason"),
    //group 3
    refInvoiceId: uuid("ref_invoice_id").references(
      (): AnyPgColumn => invoices.id,
    ),
    noteReason: text("note_reason"),
    //group 4
    billedToContactId: uuid("billed_to_contact_id")
      .notNull()
      .references(() => contacts.id),
    billedToName: text("billed_to_name").notNull(),
    billedToAddress: text("billed_to_address"),
    billedToGstin: char("billed_to_gstin", { length: 15 }),
    billedToPan: char("billed_to_pan", { length: 10 }),
    billedToAadhaarEncrypted: text("billed_to_aadhaar_encrypted"),
    billedToPhone: text("billed_to_phone"),
    billedToStateCode: char("billed_to_state_code", { length: 2 }).notNull(),
    //group 5
    shippedToContactId: uuid("shipped_to_contact_id").references(
      () => contacts.id,
    ),
    shippedToName: text("shipped_to_name"),
    shippedToAddress: text("shipped_to_address"),
    shippedToGstin: char("shipped_to_gstin", { length: 15 }),
    shippedToPan: char("shipped_to_pan", { length: 10 }),
    shippedToAadhaarEncrypted: text("shipped_to_aadhaar_encrypted"),
    shippedToPhone: text("shipped_to_phone"),
    shippedToStateCode: char("shipped_to_state_code", { length: 2 }),
    //group 6
    placeOfSupply: char("place_of_supply", { length: 2 }).notNull(),
    reverseCharge: boolean("reverse_charge").notNull().default(false),
    grRrNo: text("gr_rr_no"),
    transport: text("transport"),
    vehicleNo: text("vehicle_no"),
    station: text("station"),
    //group 7
    shippingCost: bigint("shipping_cost", { mode: "number" })
      .notNull()
      .default(0),
    transportType: text("transport_type"),
    //group 8
    discounts: jsonb("discounts").$type<Discount[]>().notNull().default([]),
    //group 9
    gross: bigint("gross", { mode: "number" }).notNull(),
    discountTotal: bigint("discount_total", { mode: "number" })
      .default(0)
      .notNull(),
    taxable: bigint("taxable", { mode: "number" }).notNull(),
    cgst: bigint("cgst", { mode: "number" }).default(0).notNull(),
    sgst: bigint("sgst", { mode: "number" }).default(0).notNull(),
    igst: bigint("igst", { mode: "number" }).default(0).notNull(),
    roundOff: bigint("round_off", { mode: "number" }).default(0).notNull(),
    grandTotal: bigint("grand_total", { mode: "number" }).notNull(),
    //group 10
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("invoices_serial_uq")
      .on(table.businessId, table.docType, table.fy, table.serial)
      .where(sql`${table.serial} is not null`),

    uniqueIndex("invoices_supplier_no_uq")
      .on(table.businessId, table.billedToContactId, table.supplierInvoiceNo)
      .where(sql`${table.supplierInvoiceNo} is not null`),

    check(
      "invoices_tax_mode",
      sql`${table.igst}=0 or (${table.cgst}=0 and ${table.sgst}=0)`,
    ),
    check("invoices_cgst_eq_sgst", sql`${table.cgst}=${table.sgst}`),
    check(
      "invoices_serial_rule",
      sql`(${table.docType}='purchase' and ${table.serial} is null and ${table.supplierInvoiceNo} is not null)
        or(${table.docType}<>'purchase' and serial is not null and invoice_no is not null)`,
    ),
    check(
      "invoices_need_note_ref",
      sql`doc_type not in ('credit_note','debit_note') OR ref_invoice_id is not null`,
    ),
    check(
      "invoices_amount_non_negative",
      sql`gross >=0 and discount_total>=0 and taxable>=0 and grand_total>=0`,
    ),
    index("invoices_contacts_id").on(
      table.businessId,
      table.billedToContactId,
      table.date,
    ),
    index("invoices_date_idx").on(table.businessId, table.date),
  ],
);
