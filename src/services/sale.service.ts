import { eq, inArray, isNull, and } from "drizzle-orm";
import { businesses, contacts, invoices, items } from "../db/schema/index.js";
import type { Tx } from "./counter.service.js";
import { AppError } from "../utils/AppError.js";
import { getBusiness } from "./business.service.js";
import { getContact } from "./contact.service.js";
import type { CreateSaleInput } from "../validators/invoice.validator.js";
import type { BillTotals, BuiltLines } from "../core/bill.js";
import { formatInvoiceNo } from "../core/invoiceNumber.js";

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
