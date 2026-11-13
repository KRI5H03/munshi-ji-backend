import type { Request, Response } from "express";
import { getBusiness } from "../services/business.service.js";

export function currentBusinessController(req: Request, res: Response) {
  res.json({ businessId: req.businessId, role: req.role });
}

export async function getBusinessController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("getBusinessController: requireTenant must run first.");
  }
  const row = await getBusiness(req.businessId);
  res.status(200).json({ business: row });
}
