import { db } from "../db/connection.js";
import { users, businesses, userBusinesses } from "../db/schema/index.js";
import { hashPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { isValidStateCode } from "../config/states.js";
import type { RegisterInput } from "../validators/auth.validator.js";
import { AppError } from "../utils/AppError.js";

export async function register(
  input: RegisterInput,
): Promise<{ userId: string; businessId: string; token: string }> {
  // ── 1. Prepare (outside the transaction) ────────────
  const email = input.email.toLowerCase();
  const stateCode = input.gstin.slice(0, 2);

  // Guard — good = a real GST state code
  if (!isValidStateCode(stateCode)) {
    throw new AppError(
      400,
      "INVALID_GSTIN",
      "GSTIN has an invalid state code.",
    );
  }

  // slow — do it BEFORE opening the transaction
  const passwordHash = await hashPassword(input.password);

  // ── 2. Transaction — all three rows or none ─────────
  const { userId, businessId } = await db.transaction(async (tx) => {
    // 2a. user
    const [userRow] = await tx
      .insert(users)
      .values({
        name: input.name,
        email: email,
        passwordHash: passwordHash,
      })
      .returning({ id: users.id });

    if (!userRow) {
      throw new Error("register: user insert returned no row.");
    }

    // 2b. business
    const [businessRow] = await tx
      .insert(businesses)
      .values({
        name: input.businessName,
        gstin: input.gstin,
        stateCode: stateCode,
        address: input.address,
      })
      .returning({ id: businesses.id });

    if (!businessRow) {
      throw new Error("register: business insert returned no row.");
    }

    // 2c. link — owner, default firm
    await tx.insert(userBusinesses).values({
      userId: userRow.id,
      businessId: businessRow.id,
      role: "owner",
      isDefault: true,
    });

    return { userId: userRow.id, businessId: businessRow.id };
  });

  // ── 3. After the transaction ────────────────────────
  const token = signToken(userId);

  return { userId, businessId, token };
}
