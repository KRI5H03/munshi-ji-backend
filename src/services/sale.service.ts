import { eq, inArray, isNull, and } from "drizzle-orm";
import { items } from "../db/schema/index.js";
import type { Tx } from "./counter.service.js";
import { AppError } from "../utils/AppError.js";

type ItemRow = typeof items.$inferSelect;

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
