import { and, eq, ilike, isNull, or, asc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { items, stockMovements } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import type { CreateItemInput } from "../validators/item.validator.js";

export async function createItem(
  businessId: string,
  userId: string,
  input: CreateItemInput,
): Promise<typeof items.$inferSelect> {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .insert(items)
      .values({
        businessId,
        description: input.description,
        hsnCode: input.hsnCode,
        designNo: input.designNo,
        unit: input.unit,
        stockQty: input.openingStock,
      })
      .returning();
    if (!item) {
      throw new Error("createItem: insert returned no row.");
    }
    if (input.openingStock > 0) {
      await tx.insert(stockMovements).values({
        businessId,
        itemId: item.id,
        qtyChange: input.openingStock,
        reason: "opening",
        createdBy: userId,
      });
    }
    return item;
  });
}

export async function listItems(
  businessId: string,
  search?: string,
): Promise<(typeof items.$inferSelect)[]> {
  const term = search?.trim() || undefined;
  if (!(!term || term.length <= 100)) {
    throw new AppError(400, "SEARCH_TOO_LONG", "Search is too long.");
  }
  const rows = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.businessId, businessId),
        isNull(items.deletedAt),
        term
          ? or(
              ilike(items.description, `%${term}%`),
              ilike(items.designNo, `%${term}%`),
            )
          : undefined,
      ),
    )
    .orderBy(asc(items.description))
    .limit(50);
  return rows;
}
