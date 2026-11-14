export type BillLineInput = { qty: number; rate: number };

export type BillLine = {
  qty: number;
  rate: number;
  gross: number;
  discountAlloc: number;
  taxable: number;
  gstRateBp: number;
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
