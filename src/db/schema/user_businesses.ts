import { uuid, pgTable, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { businesses } from "./businesses.js";
import { userRole } from "./enum.js";

export const userBusinesses = pgTable(
  "user_businesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    role: userRole("role").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("user_business_uq").on(table.userId, table.businessId)],
);
