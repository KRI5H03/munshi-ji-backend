import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["owner", "staff"]);

export const contactType = pgEnum("contact_type", [
  "customer",
  "supplier",
  "both",
]);

export const docType = pgEnum("doc_type", [
  "sale",
  "purchase",
  "credit_note",
  "debit_note",
]);

export const invoiceStatus = pgEnum("invoice_status", ["active", "cancelled"]);

export const movementReason = pgEnum("movement_reason", [
  "opening",
  "purchase",
  "sale",
  "credit_note",
  "debit_note",
  "cancel",
  "adjustment",
]);

export const ledgerEntryType = pgEnum("ledger_entry_type", [
  "opening",
  "sale",
  "purchase",
  "credit_note",
  "debit_note",
  "payment_received",
  "payment_paid",
  "cancel",
]);

export const paymentMode = pgEnum("payment_mode", [
  "cash",
  "bank",
  "upi",
  "cheque",
]);

export const auditAction = pgEnum("audit_action", [
  "create",
  "update",
  "cancel",
  "delete",
  "print",
]);
