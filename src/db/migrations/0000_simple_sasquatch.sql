CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'cancel', 'delete', 'print');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('customer', 'supplier', 'both');--> statement-breakpoint
CREATE TYPE "public"."doc_type" AS ENUM('sale', 'purchase', 'credit_note', 'debit_note');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('opening', 'sale', 'purchase', 'credit_note', 'debit_note', 'payment_received', 'payment_paid', 'cancel');--> statement-breakpoint
CREATE TYPE "public"."movement_reason" AS ENUM('opening', 'purchase', 'sale', 'credit_note', 'debit_note', 'cancel', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('cash', 'bank', 'upi', 'cheque');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'staff');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"old_data" jsonb,
	"new_data" jsonb,
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"gstin" char(15) NOT NULL,
	"state_code" char(2) NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"pan" char(10),
	"msme_udhyam_no" text,
	"branch_address" text,
	"jurisdiction" text,
	"bank_name" text,
	"bank_account_no" text,
	"ifsc" char(11),
	"bank_branch" text,
	"terms_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_gstin_unique" UNIQUE("gstin")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact_type" "contact_type" NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"state_code" char(2) NOT NULL,
	"gstin" char(15),
	"pan" char(10),
	"aadhaar_encrypted" text,
	"phone" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doc_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"fy" char(7) NOT NULL,
	"last_serial" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doc_counters_uq" UNIQUE("business_id","doc_type","fy"),
	CONSTRAINT "doc_counters_not_purchase" CHECK ("doc_counters"."doc_type"<>'purchase')
);
--> statement-breakpoint
CREATE TABLE "invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"item_id" uuid NOT NULL,
	"description" text NOT NULL,
	"hsn_code" varchar(8) NOT NULL,
	"design_no" text NOT NULL,
	"unit" text NOT NULL,
	"qty" integer NOT NULL,
	"rate" bigint NOT NULL,
	"gross" bigint NOT NULL,
	"discount_alloc" bigint DEFAULT 0 NOT NULL,
	"taxable" bigint NOT NULL,
	"gst_rate_bp" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_lines_line_uq" UNIQUE("invoice_id","line_no"),
	CONSTRAINT "invoice_lines_qty_pos" CHECK (qty>0),
	CONSTRAINT "invoice_lines_rate_non_neg" CHECK (rate>=0),
	CONSTRAINT "invoice_lines_gross_math" CHECK (gross=qty*rate),
	CONSTRAINT "invoice_lines_taxable_math" CHECK (taxable=gross-discount_alloc),
	CONSTRAINT "invoice_lines_disc_non_neg" CHECK (discount_alloc>=0)
);
--> statement-breakpoint
CREATE TABLE "invoice_tax_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"hsn_code" varchar(8) NOT NULL,
	"gst_rate_bp" integer NOT NULL,
	"taxable" bigint NOT NULL,
	"cgst" bigint DEFAULT 0 NOT NULL,
	"sgst" bigint DEFAULT 0 NOT NULL,
	"igst" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_tax_summary_group_uq" UNIQUE("invoice_id","hsn_code","gst_rate_bp"),
	CONSTRAINT "invoice_tax_summary_tax_mode" CHECK (igst=0 OR(cgst=0 and sgst=0)),
	CONSTRAINT "invoice_tax_summary_cgst_eq_sgst" CHECK (cgst=sgst),
	CONSTRAINT "invoice_tax_summary_taxable_non_neg" CHECK (taxable>=0)
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"fy" char(7) NOT NULL,
	"serial" integer,
	"invoice_no" text,
	"supplier_invoice_no" text,
	"date" date NOT NULL,
	"status" "invoice_status" DEFAULT 'active' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"ref_invoice_id" uuid,
	"note_reason" text,
	"billed_to_contact_id" uuid NOT NULL,
	"billed_to_name" text NOT NULL,
	"billed_to_address" text,
	"billed_to_gstin" char(15),
	"billed_to_pan" char(10),
	"billed_to_aadhaar_encrypted" text,
	"billed_to_phone" text,
	"billed_to_state_code" char(2) NOT NULL,
	"shipped_to_contact_id" uuid,
	"shipped_to_name" text,
	"shipped_to_address" text,
	"shipped_to_gstin" char(15),
	"shipped_to_pan" char(10),
	"shipped_to_aadhaar_encrypted" text,
	"shipped_to_phone" text,
	"shipped_to_state_code" char(2),
	"place_of_supply" char(2) NOT NULL,
	"reverse_charge" boolean DEFAULT false NOT NULL,
	"gr_rr_no" text,
	"transport" text,
	"vehicle_no" text,
	"station" text,
	"shipping_cost" bigint DEFAULT 0 NOT NULL,
	"transport_type" text,
	"discounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gross" bigint NOT NULL,
	"discount_total" bigint DEFAULT 0 NOT NULL,
	"taxable" bigint NOT NULL,
	"cgst" bigint DEFAULT 0 NOT NULL,
	"sgst" bigint DEFAULT 0 NOT NULL,
	"igst" bigint DEFAULT 0 NOT NULL,
	"round_off" bigint DEFAULT 0 NOT NULL,
	"grand_total" bigint NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_tax_mode" CHECK ("invoices"."igst"=0 or ("invoices"."cgst"=0 and "invoices"."sgst"=0)),
	CONSTRAINT "invoices_cgst_eq_sgst" CHECK ("invoices"."cgst"="invoices"."sgst"),
	CONSTRAINT "invoices_serial_rule" CHECK (("invoices"."doc_type"='purchase' and "invoices"."serial" is null and "invoices"."supplier_invoice_no" is not null)
        or("invoices"."doc_type"<>'purchase' and serial is not null and invoice_no is not null)),
	CONSTRAINT "invoices_need_note_ref" CHECK (doc_type not in ('credit_note','debit_note') OR ref_invoice_id is not null),
	CONSTRAINT "invoices_amount_non_negative" CHECK (gross >=0 and discount_total>=0 and taxable>=0 and grand_total>=0)
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"description" text NOT NULL,
	"hsn_code" varchar(8) NOT NULL,
	"design_no" text NOT NULL,
	"unit" text NOT NULL,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "items_stock_non_negative" CHECK ("items"."stock_qty">=0)
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"invoice_id" uuid,
	"date" date NOT NULL,
	"credit" bigint DEFAULT 0 NOT NULL,
	"debit" bigint DEFAULT 0 NOT NULL,
	"mode" "payment_mode",
	"reference_no" text,
	"narration" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_entries_one_side" CHECK ((debit>0 and credit=0)or (credit>0 and debit=0)),
	CONSTRAINT "ledger_entries_has_invoice" CHECK (entry_type in('opening','payment_received','payment_paid') or invoice_id is not null),
	CONSTRAINT "ledger_entries_payment_mode" CHECK (entry_type not in ('payment_received','payment_paid') or mode is not null)
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"invoice_id" uuid,
	"qty_change" integer NOT NULL,
	"reason" "movement_reason" NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movement_non_zero" CHECK (qty_change<>0)
);
--> statement-breakpoint
CREATE TABLE "user_businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_business_uq" UNIQUE("user_id","business_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"last_login_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_counters" ADD CONSTRAINT "doc_counters_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_tax_summary" ADD CONSTRAINT "invoice_tax_summary_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_tax_summary" ADD CONSTRAINT "invoice_tax_summary_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_ref_invoice_id_invoices_id_fk" FOREIGN KEY ("ref_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billed_to_contact_id_contacts_id_fk" FOREIGN KEY ("billed_to_contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_shipped_to_contact_id_contacts_id_fk" FOREIGN KEY ("shipped_to_contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_businesses" ADD CONSTRAINT "user_businesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_businesses" ADD CONSTRAINT "user_businesses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_record_idx" ON "audit_logs" USING btree ("business_id","table_name","record_id");--> statement-breakpoint
CREATE INDEX "audit_logs_time_idx" ON "audit_logs" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_gstin_uq" ON "contacts" USING btree ("business_id","gstin") WHERE "contacts"."gstin" is not null and "contacts"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "invoice_lines_invoice_idx" ON "invoice_lines" USING btree ("business_id","invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_lines_item_idx" ON "invoice_lines" USING btree ("business_id","item_id");--> statement-breakpoint
CREATE INDEX "invoice_tax_summary_invoice_idx" ON "invoice_tax_summary" USING btree ("business_id","invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_serial_uq" ON "invoices" USING btree ("business_id","doc_type","fy","serial") WHERE "invoices"."serial" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_supplier_no_uq" ON "invoices" USING btree ("business_id","billed_to_contact_id","supplier_invoice_no") WHERE "invoices"."supplier_invoice_no" is not null;--> statement-breakpoint
CREATE INDEX "invoices_contacts_id" ON "invoices" USING btree ("business_id","billed_to_contact_id","date");--> statement-breakpoint
CREATE INDEX "invoices_date_idx" ON "invoices" USING btree ("business_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "items_design_uq" ON "items" USING btree ("business_id",lower("design_no")) WHERE "items"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "ledger_entries_contact_idx" ON "ledger_entries" USING btree ("business_id","contact_id","date");--> statement-breakpoint
CREATE INDEX "stock_movement_item_idx" ON "stock_movements" USING btree ("business_id","item_id","created_at");