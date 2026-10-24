import { sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  bigint,
  date,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { contacts } from "./contacts.js";
import { invoices } from "./invoices.js";
import { users } from "./users.js";
import { ledgerEntryType, paymentMode } from "./enum.js";

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => contacts.id),
    entryType: ledgerEntryType("entry_type").notNull(),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    date: date("date", { mode: "string" }).notNull(),
    credit: bigint("credit", { mode: "number" }).notNull().default(0),
    debit: bigint("debit", { mode: "number" }).notNull().default(0),
    mode: paymentMode("mode"),
    referenceNo: text("reference_no"),
    narration: text("narration"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "ledger_entries_one_side",
      sql`(debit>0 and credit=0)or (credit>0 and debit=0)`,
    ),
    check(
      "ledger_entries_has_invoice",
      sql`entry_type in('opening','payment_received','payment_paid') or invoice_id is not null`,
    ),
    check(
      "ledger_entries_payment_mode",
      sql`entry_type not in ('payment_received','payment_paid') or mode is not null`,
    ),

    index("ledger_entries_contact_idx").on(
      table.businessId,
      table.contactId,
      table.date,
    ),
  ],
);
