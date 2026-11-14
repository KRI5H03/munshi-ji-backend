import { sql } from "drizzle-orm";
import type { db } from "../db/connection.js";
import { docCounters } from "../db/schema/doc_counters.js";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function nextSerial(
  tx: Tx,
  businessId: string,
  docType: "sale" | "credit_note" | "debit_note",
  fy: string,
): Promise<number> {
  const [row] = await tx
    .insert(docCounters)
    .values({ businessId, docType, fy, lastSerial: 1 })
    .onConflictDoUpdate({
      target: [docCounters.businessId, docCounters.docType, docCounters.fy],
      set: {
        lastSerial: sql`${docCounters.lastSerial}+1`,
        updatedAt: new Date(),
      },
    })
    .returning({ lastSerial: docCounters.lastSerial });
  if (!row) {
    throw new Error("nextSerial: counter returned no row.");
  }
  return row.lastSerial;
}
