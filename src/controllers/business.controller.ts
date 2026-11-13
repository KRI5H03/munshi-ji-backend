import type { Request, Response } from "express";
import { getBusiness, updateBusiness } from "../services/business.service.js";
import { AppError } from "../utils/AppError.js";

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

export async function updateBusinessController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("updateBusinessController: requireTenant must run first.");
  }
  if (req.role !== "owner") {
    throw new AppError(
      403,
      "FORBIDDEN",
      "Only the owner can edit business details.",
    );
  }
  const row = await updateBusiness(req.businessId, req.body);
  res.status(200).json({ business: row });
}
