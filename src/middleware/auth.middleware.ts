import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!(header && header.startsWith("Bearer "))) {
    throw new AppError(401, "UNAUTHENTICATED", "Login required.");
  }
  const token = header.slice(7);
  try {
    req.userId = verifyToken(token);
  } catch {
    throw new AppError(401, "UNAUTHENTICATED", "Invalid or expired token.");
  }

  next();
}
