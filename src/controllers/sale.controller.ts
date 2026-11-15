import type { Request, Response } from "express";
import { createSale } from "../services/sale.service.js";

export async function createSaleController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("createSaleController: requireTenant must run first.");
  }
  if (!req.userId) {
    throw new Error("createSaleController: requireAuth must run first.");
  }
  const invoice = await createSale(req.businessId, req.userId, req.body);
  res.status(201).json({ invoice });
}
