import {
  uuid,
  pgTable,
  text,
  char,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "./businesses.js";
import { contactType } from "./enum.js";
import { sql } from "drizzle-orm";

export const contacts = pgTable(
  "contsct",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    name: text("name").notNull(),
    contactType: contactType("contact_type").notNull(),
    city: text("city").notNull(),
    address: text("address"),
    stateCode: char("state_code", { length: 2 }).notNull(),
    gstin: char("gstin", { length: 15 }),
    pan: char("pan", { length: 10 }),
    aadhaarEncrypted: text("aadhaar_encrypted"),
    phone: text("phone"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contacts_gstin_uq")
      .on(table.businessId, table.gstin)
      .where(sql`${table.gstin} is not null and ${table.deletedAt} is null`),
  ],
);
