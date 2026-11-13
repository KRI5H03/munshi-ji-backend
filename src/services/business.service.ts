import { db } from "../db/connection.js";
import { eq } from "drizzle-orm";
import { businesses } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import type { UpdateBusinessInput } from "../validators/business.validator.js";

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

export async function updateBusiness(
  businessId: string,
  input: UpdateBusinessInput,
): Promise<typeof businesses.$inferSelect> {
  const existing = await getBusiness(businessId);
  const [row] = await db
    .update(businesses)
    .set({
      name: input.name ?? existing.name,
      address: input.address ?? existing.address,
      phone: input.phone ?? existing.phone,
      pan: input.pan ?? existing.pan,
      msmeUdhyamNo: input.msmeUdhyamNo ?? existing.msmeUdhyamNo,
      branchAddress: input.branchAddress ?? existing.branchAddress,
      jurisdiction: input.jurisdiction ?? existing.jurisdiction,
      bankName: input.bankName ?? existing.bankName,
      bankAccountNo: input.bankAccountNo ?? existing.bankAccountNo,
      ifsc: input.ifsc ?? existing.ifsc,
      bankBranch: input.bankBranch ?? existing.bankBranch,
      termsText: input.termsText ?? existing.termsText,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId))
    .returning();
  if (!row) {
    throw new Error("updateBusiness: update returned no row.");
  }
  return row;
}
