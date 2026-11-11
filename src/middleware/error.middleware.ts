import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

type PgError = { code?: string; constraint_name?: string; constraint?: string };

function pgErrorOf(err: unknown): PgError | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const e = err as { code?: unknown; cause?: unknown };
  if (typeof e.code === "string") return e as PgError;
  if (typeof e.cause === "object" && e.cause !== null)
    return e.cause as PgError;
  return undefined;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Errors we threw on purpose
  if (err instanceof AppError) {
    res
      .status(err.status)
      .json({ error: { code: err.code, message: err.message } });
    return;
  }

  // 2. Bad request body (Zod)
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_FAILED",
        message: "Some fields are invalid.",
        details: err.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }

  // 3. Postgres unique violation — duplicate email, GSTIN, design no., ...
  const pg = pgErrorOf(err);
  if (pg?.code === "23505") {
    res.status(409).json({
      error: {
        code: "ALREADY_EXISTS",
        message: "This record already exists.",
        ...(env.NODE_ENV !== "production" && {
          details: pg.constraint_name ?? pg.constraint,
        }),
      },
    });
    return;
  }

  // 4. Anything else is a bug
  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message:
        env.NODE_ENV === "production"
          ? "Something went wrong."
          : err instanceof Error
            ? err.message
            : String(err),
    },
  });
}
