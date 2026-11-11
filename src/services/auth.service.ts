import { db } from "../db/connection.js";
import { users, businesses, userBusinesses } from "../db/schema/index.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { isValidStateCode } from "../config/states.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";
import { AppError } from "../utils/AppError.js";
import { eq, and, isNull } from "drizzle-orm";

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

export async function login(input: LoginInput): Promise<{
  token: string;
  userId: string;
  businesses: {
    id: string;
    name: string;
    role: "owner" | "staff";
    isDefault: boolean;
  }[];
}> {
  // ── 1. Lowercase ────────────────────────────────────
  const email = input.email.toLowerCase();

  // ── 2. Find the user (not deleted) ──────────────────
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  // ── 3. Guard — user found ───────────────────────────
  if (!user) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is wrong.",
    );
  }

  // ── 4. Guard — password matches ─────────────────────
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is wrong.",
    );
  }

  // ── 5. Record the login ─────────────────────────────
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  // ── 6. Load his firms (join) ────────────────────────
  const firms = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      role: userBusinesses.role,
      isDefault: userBusinesses.isDefault,
    })
    .from(userBusinesses)
    .innerJoin(businesses, eq(userBusinesses.businessId, businesses.id))
    .where(eq(userBusinesses.userId, user.id));

  // ── 7. Token + return ───────────────────────────────
  return {
    token: signToken(user.id),
    userId: user.id,
    businesses: firms,
  };
}
