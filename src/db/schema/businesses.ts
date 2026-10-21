import { uuid, pgTable, text, char, timestamp } from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  gstin: char("gstin", { length: 15 }).notNull().unique(),
  stateCode: char("state_code", { length: 2 }).notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  pan: char("pan", { length: 10 }),
  msmeUdhyamNo: text("msme_udhyam_no"),
  branchAddress: text("branch_address"),
  jurisdiction: text("jurisdiction"),
  bankName: text("bank_name"),
  bankAccountNo: text("bank_account_no"),
  ifsc: char("ifsc", { length: 11 }),
  bankBranch: text("bank_branch"),
  termsText: text("terms_text"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
