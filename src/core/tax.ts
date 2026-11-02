import { applyBasisPoints } from "./money.js";

export type TaxLine = {
  hsnCode: string;
  gstRateBp: number;
  taxable: number;
};

export type TaxSummaryRow = {
  hsnCode: string;
  gstRateBp: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
};

const HSN_PATTERN = /^\d{4,8}$/;

export function computeTaxSummary(
  lines: TaxLine[],
  interState: boolean,
): TaxSummaryRow[] {
  if (!(lines.length > 0)) {
    throw new Error(`computeTaxSummary: no lines given.`);
  }

  const groups = new Map<string, TaxLine>();

  for (const line of lines) {
    if (!HSN_PATTERN.test(line.hsnCode)) {
      throw new Error(
        `computeTaxSummary: invalid hsnCode ${line.hsnCode}. Expected 4 to 8 digits.`,
      );
    }
    if (
      !(
        Number.isSafeInteger(line.gstRateBp) &&
        line.gstRateBp >= 0 &&
        line.gstRateBp <= 10000 &&
        line.gstRateBp % 2 === 0
      )
    ) {
      throw new Error(
        `computeTaxSummary: invalid gstRateBp ${line.gstRateBp}. Expected an even whole number 0 to 10000.`,
      );
    }
    if (!(Number.isSafeInteger(line.taxable) && line.taxable >= 0)) {
      throw new Error(
        `computeTaxSummary: invalid taxable ${line.taxable}. Expected a whole number >= 0.`,
      );
    }

    const key: string = line.hsnCode + "|" + line.gstRateBp;

    const existing = groups.get(key);

    if (existing) {
      existing.taxable = existing.taxable + line.taxable;
    } else {
      groups.set(key, {
        hsnCode: line.hsnCode,
        gstRateBp: line.gstRateBp,
        taxable: line.taxable,
      });
    }
  }

  const rows: TaxSummaryRow[] = [];

  for (const g of groups.values()) {
    if (interState) {
      rows.push({
        hsnCode: g.hsnCode,
        gstRateBp: g.gstRateBp,
        taxable: g.taxable,
        cgst: 0,
        sgst: 0,
        igst: applyBasisPoints(g.taxable, g.gstRateBp),
      });
    } else {
      const half = g.gstRateBp / 2;
      const split = applyBasisPoints(g.taxable, half);

      rows.push({
        hsnCode: g.hsnCode,
        gstRateBp: g.gstRateBp,
        taxable: g.taxable,
        cgst: split,
        sgst: split,
        igst: 0,
      });
    }
  }

  return rows;
}
