import { and, eq, ilike, isNull, or, asc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { items, stockMovements } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreateItemInput,
  UpdateItemInput,
} from "../validators/item.validator.js";
import { UUID_PATTERN } from "../utils/jwt.js";

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

export async function getItem(
  businessId: string,
  itemId: string,
): Promise<typeof items.$inferSelect> {
  if (!UUID_PATTERN.test(itemId)) {
    throw new AppError(400, "INVALID_ID", "Invalid item id.");
  }
  const [row] = await db
    .select()
    .from(items)
    .where(
      and(
        eq(items.id, itemId),
        eq(items.businessId, businessId),
        isNull(items.deletedAt),
      ),
    )
    .limit(1);
  if (!row) {
    throw new AppError(404, "ITEM_NOT_FOUND", "Item not found.");
  }
  return row;
}

export async function updateItem(
  businessId: string,
  itemId: string,
  input: UpdateItemInput,
): Promise<typeof items.$inferSelect> {
  const existing = await getItem(businessId, itemId);
  const [row] = await db
    .update(items)
    .set({
      description: input.description ?? existing.description,
      hsnCode: input.hsnCode ?? existing.hsnCode,
      designNo: input.designNo ?? existing.designNo,
      unit: input.unit ?? existing.unit,
      updatedAt: new Date(),
    })
    .where(and(eq(items.id, itemId), eq(items.businessId, businessId)))
    .returning();
  if (!row) {
    throw new Error("updateItem: update returned no row.");
  }
  return row;
}

export async function deleteItem(
  businessId: string,
  itemId: string,
): Promise<void> {
  await getItem(businessId, itemId);
  await db
    .update(items)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(items.id, itemId), eq(items.businessId, businessId)));
}
