import type { Request, Response } from "express";
import {
  adjustStock,
  createItem,
  deleteItem,
  getItem,
  listItems,
  updateItem,
} from "../services/item.service.js";

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

export async function listItemsController(
  req: Request,
  res: Response,
): Promise<void> {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  if (!req.businessId) {
    throw new Error("listItemsController: requireTenant must run first.");
  }
  const rows = await listItems(req.businessId, search);
  res.status(200).json({ items: rows });
}

export async function getItemController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("getItemController: requireTenant must run first.");
  }
  const itemId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!itemId) {
    throw new Error("getItemController: route needs :id.");
  }
  const row = await getItem(req.businessId, itemId);
  res.status(200).json({ item: row });
}

export async function updateItemController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("updateItemController: requireTenant must run first.");
  }
  const itemId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!itemId) {
    throw new Error("updateItemController: route needs :id.");
  }
  const row = await updateItem(req.businessId, itemId, req.body);
  res.status(200).json({ item: row });
}

export async function deleteItemController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("deleteItemController: requireTenant must run first.");
  }
  const itemId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!itemId) {
    throw new Error("deleteItemController: route needs :id.");
  }
  await deleteItem(req.businessId, itemId);
  res.status(204).end();
}

export async function adjustStockController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("adjustStockController: requireTenant must run first.");
  }
  if (!req.userId) {
    throw new Error("adjustStockController: requireAuth must run first.");
  }
  const itemId = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!itemId) {
    throw new Error("adjustStockController: route needs :id.");
  }
  const row = await adjustStock(req.businessId, req.userId, itemId, req.body);
  res.status(200).json({ item: row });
}
