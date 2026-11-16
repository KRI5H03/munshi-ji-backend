import type { Request, Response } from "express";
import {
  cancelSale,
  createSale,
  getSale,
  listSales,
} from "../services/sale.service.js";
import { AppError } from "../utils/AppError.js";

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

export async function listSalesController(
  req: Request,
  res: Response,
): Promise<void> {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  if (!req.businessId)
    throw new Error("listSalesController: requireTenant must run first.");
  const rows = await listSales(req.businessId, search);
  res.status(200).json({ sales: rows });
}

export async function cancelSaleController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("cancelSaleController: requireTenant must run first.");
  }
  if (!req.userId) {
    throw new Error("cancelSaleController: requireAuth must run first.");
  }
  if (req.role !== "owner") {
    throw new AppError(403, "FORBIDDEN", "Only the owner can cancel a bill.");
  }
  const invoiceId =
    typeof req.params.id === "string" ? req.params.id : undefined;
  if (!invoiceId) throw new Error("cancelSaleController: route needs :id.");
  const invoice = await cancelSale(
    req.businessId,
    req.userId,
    invoiceId,
    req.body,
  );
  res.status(200).json({ invoice });
}
