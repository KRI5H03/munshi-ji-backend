import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { UUID_PATTERN } from "../utils/jwt.js";
import { db } from "../db/connection.js";
import { eq, and } from "drizzle-orm";
import { userBusinesses } from "../db/schema/index.js";

export async function requireTenant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const businessId = req.header("x-business-id");

  if (!(businessId && UUID_PATTERN.test(businessId)))
    throw new AppError(400, "BUSINESS_REQUIRED", "Select a business.");

  if (!req.userId)
    throw new Error("requireTenant: requireAuth must run first.");

  const [link] = await db
    .select()
    .from(userBusinesses)
    .where(
      and(
        eq(userBusinesses.userId, req.userId),
        eq(userBusinesses.businessId, businessId),
      ),
    )
    .limit(1);

  if (!link)
    throw new AppError(
      403,
      "FORBIDDEN",
      "You don't have access to this business.",
    );

  req.businessId = businessId;
  req.role = link.role;
  next();
}
