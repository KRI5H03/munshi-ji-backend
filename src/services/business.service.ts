import { db } from "../db/connection.js";
import { eq } from "drizzle-orm";
import { businesses } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";

export async function getBusiness(
  businessId: string,
): Promise<typeof businesses.$inferSelect> {
  const [row] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!row) {
    throw new AppError(404, "BUSINESS_NOT_FOUND", "Business not found.");
  }
  return row;
}
