import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error); // → error middleware → 400 with field details
      return;
    }
    req.body = parsed.data; // cleaned: trimmed, uppercased GSTIN, etc.
    next();
  };
}
