import { sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    description: text("description").notNull(),
    hsnCode: varchar("hsn_code", { length: 8 }).notNull(),
    designNo: text("design_no").notNull(),
    unit: text("unit").notNull(),
    stockQty: integer("stock_qty").notNull().default(0),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("items_design_uq")
      .on(table.businessId, sql`lower(${table.designNo})`)
      .where(sql`${table.deletedAt} is null`),
    check("items_stock_non_negative", sql`${table.stockQty}>=0`),
  ],
);
