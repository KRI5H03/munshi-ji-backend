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
