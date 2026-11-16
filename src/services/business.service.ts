import { db } from "../db/connection.js";
import { eq } from "drizzle-orm";
import { businesses, userBusinesses } from "../db/schema/index.js";
import { isValidStateCode } from "../config/states.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreateBusinessInput,
  UpdateBusinessInput,
} from "../validators/business.validator.js";

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

export async function createBusiness(
  userId: string,
  input: CreateBusinessInput,
): Promise<typeof businesses.$inferSelect> {
  const stateCode = input.gstin.slice(0, 2);
  if (!isValidStateCode(stateCode)) {
    throw new AppError(
      400,
      "INVALID_GSTIN",
      "GSTIN has an invalid state code.",
    );
  }
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(businesses)
      .values({
        name: input.name,
        gstin: input.gstin,
        stateCode,
        address: input.address,
      })
      .returning();
    if (!row) {
      throw new Error("createBusiness: insert returned no row.");
    }
    await tx.insert(userBusinesses).values({
      userId,
      businessId: row.id,
      role: "owner",
      isDefault: false,
    });
    return row;
  });
}
