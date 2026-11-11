import type { Request, Response } from "express";

export function currentBusinessController(req: Request, res: Response) {
  res.json({ businessId: req.businessId, role: req.role });
}
