import type { Request, Response } from "express";
import { createContact } from "../services/contact.service.js";

export async function createContactController(req: Request, res: Response) {
  if (!req.businessId)
    throw new Error("createContactController: requireTenant must run first.");
  const contact = await createContact(req.businessId, req.body);
  res.status(201).json(contact);
}
