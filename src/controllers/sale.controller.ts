import type { Request, Response } from "express";
import { createSale, getSale } from "../services/sale.service.js";

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

export async function getSaleController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId)
    throw new Error("getSaleController: requireTenant must run first.");
  const invoiceId =
    typeof req.params.id === "string" ? req.params.id : undefined;
  if (!invoiceId) throw new Error("getSaleController: route needs :id.");
  const sale = await getSale(req.businessId, invoiceId);
  res.status(200).json(sale);
}
