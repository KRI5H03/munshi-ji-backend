import { isValidStateCode } from "../config/states.js";
import { db } from "../db/connection.js";
import { contacts } from "../db/schema/index.js";
import { AppError } from "../utils/AppError.js";
import type { CreateContactInput } from "../validators/contact.validator.js";

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
