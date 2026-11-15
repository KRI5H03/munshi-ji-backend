import { eq, inArray, isNull, and, sql } from "drizzle-orm";
import {
  auditLogs,
  businesses,
  contacts,
  invoiceLines,
  invoices,
  invoiceTaxSummary,
  items,
  ledgerEntries,
  stockMovements,
} from "../db/schema/index.js";
import type { Tx } from "./counter.service.js";
import { AppError } from "../utils/AppError.js";
import { getBusiness } from "./business.service.js";
import { getContact } from "./contact.service.js";
import type { CreateSaleInput } from "../validators/invoice.validator.js";
import type { BillTotals, BuiltLines } from "../core/bill.js";
import { formatInvoiceNo } from "../core/invoiceNumber.js";
import type { TaxSummaryRow } from "../core/tax.js";

type ItemRow = typeof items.$inferSelect;
type ContactRow = typeof contacts.$inferSelect;
type BusinessRow = typeof businesses.$inferSelect;
type InvoiceInsert = typeof invoices.$inferInsert;
type InvoiceArgs = {
  businessId: string;
  userId: string;
  input: CreateSaleInput;
  fy: string;
  serial: number;
  billedTo: ContactRow;
  shippedTo: ContactRow | null;
  built: BuiltLines;
  totals: BillTotals;
};
type LedgerArgs = {
  businessId: string;
  userId: string;
  invoiceId: string;
  invoiceNo: string;
  contactId: string;
  date: string;
  grandTotal: number;
};

export async function loadItemsForSale(
  tx: Tx,
  businessId: string,
  itemsId: string[],
): Promise<Map<string, ItemRow>> {
  const uniqueIds = [...new Set(itemsId)];
  const rows = await tx
    .select()
    .from(items)
    .where(
      and(
        eq(items.businessId, businessId),
        inArray(items.id, uniqueIds),
        isNull(items.deletedAt),
      ),
    )
    .for("update");
  if (!(rows.length === uniqueIds.length)) {
    throw new AppError(
      400,
      "ITEM_NOT_FOUND",
      "One or more items were not found.",
    );
  }
  const map = new Map<string, ItemRow>();
  for (const row of rows) {
    map.set(row.id, row);
  }
  return map;
}

export function checkStock(
  lines: { itemId: string; qty: number }[],
  itemMap: Map<string, ItemRow>,
): void {
  const needed = new Map<string, number>();
  for (const line of lines) {
    needed.set(line.itemId, (needed.get(line.itemId) ?? 0) + line.qty);
  }
  for (const [itemId, qty] of needed) {
    const item = itemMap.get(itemId);
    if (!item) {
      throw new Error(`checkStock: item ${itemId} not loaded.`);
    }
    if (!(item.stockQty >= qty)) {
      throw new AppError(
        400,
        "INSUFFICIENT_STOCK",
        `Only ${item.stockQty} left of ${item.designNo}.`,
      );
    }
  }
}

export async function loadParties(
  businessId: string,
  billedToId: string,
  shippedToId: string | undefined,
): Promise<{
  business: BusinessRow;
  billedTo: ContactRow;
  shippedTo: ContactRow | null;
}> {
  const business = await getBusiness(businessId);
  const billedTo = await getContact(businessId, billedToId);
  if (
    !(billedTo.contactType === "customer" || billedTo.contactType === "both")
  ) {
    throw new AppError(
      400,
      "NOT_A_CUSTOMER",
      `${billedTo.name} is a supplier, not a customer.`,
    );
  }
  const shippedTo = shippedToId
    ? await getContact(businessId, shippedToId)
    : null;
  return { business, billedTo, shippedTo };
}

export function buildInvoiceValues(a: InvoiceArgs): InvoiceInsert {
  return {
    businessId: a.businessId,
    docType: "sale",
    fy: a.fy,
    serial: a.serial,
    invoiceNo: formatInvoiceNo(a.serial, a.fy),
    date: a.input.date,
    billedToContactId: a.billedTo.id,
    billedToName: a.billedTo.name,
    billedToAddress: a.billedTo.address,
    billedToGstin: a.billedTo.gstin,
    billedToPan: a.billedTo.pan,
    billedToAadhaarEncrypted: a.billedTo.aadhaarEncrypted,
    billedToPhone: a.billedTo.phone,
    billedToStateCode: a.billedTo.stateCode,
    shippedToContactId: a.shippedTo?.id ?? null,
    shippedToName: a.shippedTo?.name ?? null,
    shippedToAddress: a.shippedTo?.address ?? null,
    shippedToGstin: a.shippedTo?.gstin ?? null,
    shippedToPan: a.shippedTo?.pan ?? null,
    shippedToAadhaarEncrypted: a.shippedTo?.aadhaarEncrypted ?? null,
    shippedToPhone: a.shippedTo?.phone ?? null,
    shippedToStateCode: a.shippedTo?.stateCode ?? null,
    placeOfSupply: a.billedTo.stateCode,
    grRrNo: a.input.grRrNo ?? null,
    transport: a.input.transport ?? null,
    vehicleNo: a.input.vehicleNo ?? null,
    station: a.input.station ?? null,
    discounts: a.built.discountSteps,
    gross: a.built.grossTotal,
    discountTotal: a.built.discountTotal,
    taxable: a.totals.taxable,
    cgst: a.totals.cgst,
    sgst: a.totals.sgst,
    igst: a.totals.igst,
    roundOff: a.totals.roundOff,
    grandTotal: a.totals.grandTotal,
    createdBy: a.userId,
  };
}

export async function insertLinesAndSummary(
  tx: Tx,
  businessId: string,
  invoiceId: string,
  inputs: { itemId: string }[],
  built: BuiltLines,
  itemMap: Map<string, ItemRow>,
  taxSummary: TaxSummaryRow[],
): Promise<void> {
  const lineRows: (typeof invoiceLines.$inferInsert)[] = [];
  for (const [i, line] of built.lines.entries()) {
    const itemId = inputs[i]?.itemId;
    const item = itemId ? itemMap.get(itemId) : undefined;
    if (!item)
      throw new Error(`insertLinesAndSummary: item missing at line ${i}.`);
    lineRows.push({
      businessId,
      invoiceId,
      lineNo: i + 1,
      itemId: item.id,
      description: item.description,
      hsnCode: item.hsnCode,
      designNo: item.designNo,
      unit: item.unit,
      qty: line.qty,
      rate: line.rate,
      gross: line.gross,
      discountAlloc: line.discountAlloc,
      taxable: line.taxable,
      gstRateBp: line.gstRateBp,
    });
  }
  await tx.insert(invoiceLines).values(lineRows);
  await tx
    .insert(invoiceTaxSummary)
    .values(taxSummary.map((r) => ({ businessId, invoiceId, ...r })));
}

export async function moveStockForSale(
  tx: Tx,
  businessId: string,
  invoiceId: string,
  userId: string,
  inputs: { itemId: string; qty: number }[],
): Promise<void> {
  for (const line of inputs) {
    await tx.insert(stockMovements).values({
      businessId,
      itemId: line.itemId,
      invoiceId,
      qtyChange: -line.qty,
      reason: "sale",
      createdBy: userId,
    });
    await tx
      .update(items)
      .set({
        stockQty: sql`${items.stockQty} - ${line.qty}`,
        updatedAt: new Date(),
      })
      .where(eq(items.id, line.itemId));
  }
}

export async function writeLedgerAndAudit(
  tx: Tx,
  a: LedgerArgs,
): Promise<void> {
  if (a.grandTotal > 0) {
    await tx.insert(ledgerEntries).values({
      businessId: a.businessId,
      contactId: a.contactId,
      entryType: "sale",
      invoiceId: a.invoiceId,
      date: a.date,
      debit: a.grandTotal,
      credit: 0,
      narration: `Sale bill ${a.invoiceNo}`,
      createdBy: a.userId,
    });
  }
  await tx.insert(auditLogs).values({
    businessId: a.businessId,
    userId: a.userId,
    tableName: "invoices",
    recordId: a.invoiceId,
    action: "create",
    newData: { invoiceNo: a.invoiceNo, grandTotal: a.grandTotal },
  });
}
