import {
  pgTable,
  uuid,
  text,
  jsonb,
  inet,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { users } from "./users.js";
import { auditAction } from "./enum.js";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    action: auditAction("action").notNull(),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    ipAddress: inet("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_record_idx").on(
      table.businessId,
      table.tableName,
      table.recordId,
    ),
    index("audit_logs_time_idx").on(table.businessId, table.createdAt),
  ],
);
