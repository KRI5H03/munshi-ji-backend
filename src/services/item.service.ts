import { db } from "../db/connection.js";
import { items, stockMovements } from "../db/schema/index.js";
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
      await tx
        .insert(stockMovements)
        .values({
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
