import { and, eq, ilike, isNull, or, asc } from "drizzle-orm";
import { isValidStateCode } from "../config/states.js";
import { db } from "../db/connection.js";
import { contacts } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreateContactInput,
  UpdateContactInput,
} from "../validators/contact.validator.js";
import { UUID_PATTERN } from "../utils/jwt.js";

export async function createContact(
  businessId: string,
  input: CreateContactInput,
): Promise<typeof contacts.$inferSelect> {
  if (
    !(
      !input.gstin ||
      !input.stateCode ||
      input.stateCode === input.gstin.slice(0, 2)
    )
  ) {
    throw new AppError(
      400,
      "STATE_MISMATCH",
      "State code doesn't match the GSTIN.",
    );
  }

  const stateCode = input.gstin ? input.gstin.slice(0, 2) : input.stateCode;

  if (!stateCode || !isValidStateCode(stateCode))
    throw new AppError(400, "INVALID_STATE", "Invalid state code.");

  const [row] = await db
    .insert(contacts)
    .values({
      businessId: businessId,
      name: input.name,
      contactType: input.contactType,
      city: input.city,
      stateCode: stateCode,
      address: input.address ?? null,
      gstin: input.gstin ?? null,
      pan: input.pan ?? null,
      phone: input.phone ?? null,
      aadhaarEncrypted: input.aadhaar ?? null,
    })
    .returning();
  if (!row) throw new Error("createContact: insert returned no row.");
  return row;
}

export async function listContacts(
  businessId: string,
  search?: string,
): Promise<(typeof contacts.$inferSelect)[]> {
  // Step 1: clean the search
  const term = search?.trim() || undefined;

  // Step 2: guard
  if (!(!term || term.length <= 100)) {
    throw new AppError(400, "SEARCH_TOO_LONG", "Search is too long.");
  }

  // Step 3 + 4: query
  const rows = await db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.businessId, businessId),
        isNull(contacts.deletedAt),
        term
          ? or(
              ilike(contacts.name, `%${term}%`),
              ilike(contacts.city, `%${term}%`),
            )
          : undefined,
      ),
    )
    .orderBy(asc(contacts.name))
    .limit(50);

  return rows;
}

export async function getContact(
  businessId: string,
  contactId: string,
): Promise<typeof contacts.$inferSelect> {
  if (!UUID_PATTERN.test(contactId)) {
    throw new AppError(400, "INVALID_ID", "Invalid contact id.");
  }

  const [row] = await db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.id, contactId),
        eq(contacts.businessId, businessId),
        isNull(contacts.deletedAt),
      ),
    )
    .limit(1);

  if (!row) {
    throw new AppError(404, "CONTACT_NOT_FOUND", "Contact not found.");
  }

  return row;
}

export async function updateContact(
  businessId: string,
  contactId: string,
  input: UpdateContactInput,
): Promise<typeof contacts.$inferSelect> {
  const existing = await getContact(businessId, contactId);
  const gstin = input.gstin ?? existing.gstin;
  const stateCode = gstin
    ? gstin.slice(0, 2)
    : (input.stateCode ?? existing.stateCode);
  if (!(!gstin || !input.stateCode || input.stateCode === stateCode)) {
    throw new AppError(
      400,
      "STATE_MISMATCH",
      "State code does not match GSTIN.",
    );
  }
  if (!isValidStateCode(stateCode)) {
    throw new AppError(400, "INVALID_STATE", "Invalid state code.");
  }
  const [row] = await db
    .update(contacts)
    .set({
      name: input.name ?? existing.name,
      contactType: input.contactType ?? existing.contactType,
      city: input.city ?? existing.city,
      address: input.address ?? existing.address,
      pan: input.pan ?? existing.pan,
      phone: input.phone ?? existing.phone,
      aadhaarEncrypted: input.aadhaar ?? existing.aadhaarEncrypted,
      stateCode: stateCode,
      gstin: gstin,
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, contactId), eq(contacts.businessId, businessId)))
    .returning();
  if (!row) {
    throw new Error("updateContact: update returned no row.");
  }
  return row;
}
