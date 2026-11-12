import type { Request, Response } from "express";
import { createContact, listContacts } from "../services/contact.service.js";

export async function createContactsController(req: Request, res: Response) {
  if (!req.businessId)
    throw new Error("createContactController: requireTenant must run first.");
  const contact = await createContact(req.businessId, req.body);
  res.status(201).json(contact);
}

export async function listContactsController(
  req: Request,
  res: Response,
): Promise<void> {
  // 1. read the search word from the URL
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  // 2. make sure the tenant middleware ran
  if (!req.businessId) {
    throw new Error("createContactController: requireTenant must run first.");
  }

  // 3. call the service
  const rows = await listContacts(req.businessId, search);

  // 4. send the answer
  res.status(200).json({ contacts: rows });
}
