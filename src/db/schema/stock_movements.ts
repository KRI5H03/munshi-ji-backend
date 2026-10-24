import { sql } from "drizzle-orm";
import {
  uuid,
  pgTable,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { invoices } from "./invoices.js";
import { items } from "./items.js";
import { users } from "./users.js";
import { movementReason } from "./enum.js";

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    qtyChange: integer("qty_change").notNull(),
    reason: movementReason("reason").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("stock_movement_non_zero", sql`qty_change<>0`),

    index("stock_movement_item_idx").on(
      table.businessId,
      table.itemId,
      table.createdAt,
    ),
  ],
);
