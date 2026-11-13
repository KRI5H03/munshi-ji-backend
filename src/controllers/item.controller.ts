import type { Request, Response } from "express";
import { createItem } from "../services/item.service.js";

export async function createItemController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("createItemController: requireTenant must run first.");
  }
  if (!req.userId) {
    throw new Error("createItemController: requireAuth must run first.");
  }
  const item = await createItem(req.businessId, req.userId, req.body);
  res.status(201).json({ item });
}
