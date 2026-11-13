import type { Request, Response } from "express";
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
} from "../services/contact.service.js";

export async function createContactController(req: Request, res: Response) {
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

export async function getContactController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("createContactController: requireTenant must run first.");
  }

  const contactId =
    typeof req.params.id === "string" ? req.params.id : undefined;
  if (!contactId) {
    throw new Error("getContactController: route needs :id.");
  }

  const row = await getContact(req.businessId, contactId);
  res.status(200).json({ contact: row });
}

export async function updateContactController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("updateContactController: requireTenant must run first.");
  }
  const contactId =
    typeof req.params.id === "string" ? req.params.id : undefined;
  if (!contactId) {
    throw new Error("updateContactController: route needs :id.");
  }
  const row = await updateContact(req.businessId, contactId, req.body);
  res.status(200).json({ contact: row });
}

export async function deleteContactController(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.businessId) {
    throw new Error("deleteContactController: requireTenant must run first.");
  }
  const contactId =
    typeof req.params.id === "string" ? req.params.id : undefined;
  if (!contactId) {
    throw new Error("deleteContactController: route needs :id.");
  }
  await deleteContact(req.businessId, contactId);
  res.status(204).end();
}
