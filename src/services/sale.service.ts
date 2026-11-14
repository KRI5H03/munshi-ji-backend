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
