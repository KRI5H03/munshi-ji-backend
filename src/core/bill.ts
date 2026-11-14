import {
  applyStackedDiscounts,
  apportionDiscount,
  type DiscountStep,
} from "./discount.js";
import { getGstRateBp } from "./gst.js";
import { roundToRupee } from "./money.js";
import { computeTaxSummary, type TaxLine, type TaxSummaryRow } from "./tax.js";

export type BillLineInput = { qty: number; rate: number };

export type BillLine = {
  qty: number;
  rate: number;
  gross: number;
  discountAlloc: number;
  taxable: number;
  gstRateBp: number;
};

export type BuiltLines = {
  lines: BillLine[];
  grossTotal: number;
  discountSteps: DiscountStep[];
  discountTotal: number;
};

export type BillTotals = {
  taxSummary: TaxSummaryRow[];
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
};

export function lineGrosses(inputs: BillLineInput[]): {
  grosses: number[];
  grossTotal: number;
} {
  if (!(inputs.length > 0)) {
    throw new Error("lineGrosses: no lines given.");
  }
  const grosses: number[] = [];
  let grossTotal = 0;
  for (const line of inputs) {
    const gross = line.qty * line.rate;
    if (!(Number.isSafeInteger(gross) && gross >= 0)) {
      throw new Error(
        `lineGrosses: invalid gross ${gross} for qty ${line.qty} x rate ${line.rate}.`,
      );
    }
    grosses.push(gross);
    grossTotal += gross;
  }
  return { grosses, grossTotal };
}

export function perPieceCeil(taxable: number, qty: number): number {
  if (!(Number.isSafeInteger(taxable) && taxable >= 0)) {
    throw new Error(
      `perPieceCeil: invalid taxable ${taxable}. Expected a whole number >= 0.`,
    );
  }
  if (!(Number.isSafeInteger(qty) && qty > 0)) {
    throw new Error(
      `perPieceCeil: invalid qty ${qty}. Expected a whole number >= 1.`,
    );
  }
  const rem = taxable % qty;
  const whole = (taxable - rem) / qty;
  return rem > 0 ? whole + 1 : whole;
}

export function buildLines(
  inputs: BillLineInput[],
  percentMillis: number[],
  date: string,
): BuiltLines {
  const { grosses, grossTotal } = lineGrosses(inputs);
  const stacked = applyStackedDiscounts(grossTotal, percentMillis);
  const allocs =
    stacked.discountTotal === 0
      ? grosses.map(() => 0)
      : apportionDiscount(grosses, stacked.discountTotal);
  const lines: BillLine[] = [];
  for (const [i, input] of inputs.entries()) {
    const gross = grosses[i];
    const discountAlloc = allocs[i];
    if (gross === undefined || discountAlloc === undefined) {
      throw new Error(`buildLines: missing value at line ${i}.`);
    }
    const taxable = gross - discountAlloc;
    const gstRateBp = getGstRateBp(perPieceCeil(taxable, input.qty), date);
    lines.push({
      qty: input.qty,
      rate: input.rate,
      gross,
      discountAlloc,
      taxable,
      gstRateBp,
    });
  }
  return {
    lines,
    grossTotal,
    discountSteps: stacked.steps,
    discountTotal: stacked.discountTotal,
  };
}

export function computeTotals(
  taxLines: TaxLine[],
  interState: boolean,
): BillTotals {
  const taxSummary = computeTaxSummary(taxLines, interState);
  let taxable = 0,
    cgst = 0,
    sgst = 0,
    igst = 0;
  for (const row of taxSummary) {
    taxable += row.taxable;
    cgst += row.cgst;
    sgst += row.sgst;
    igst += row.igst;
  }
  const { total, roundOff } = roundToRupee(taxable + cgst + igst + sgst);
  return { taxSummary, taxable, cgst, sgst, igst, roundOff, grandTotal: total };
}
