import {
  uuid,
  pgTable,
  timestamp,
  char,
  integer,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { docType } from "./enum.js";
import { sql } from "drizzle-orm";

export const docCounters = pgTable(
  "doc_counters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    docType: docType("doc_type").notNull(),
    fy: char("fy", { length: 7 }).notNull(),
    lastSerial: integer("last_serial").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("doc_counters_uq").on(table.businessId, table.docType, table.fy),
    check("doc_counters_not_purchase", sql`${table.docType}<>'purchase'`),
  ],
);
