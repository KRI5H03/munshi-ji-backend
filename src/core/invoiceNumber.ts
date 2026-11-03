const FY_PATTERN = /^\d{4}-\d{2}$/;
export function formatInvoiceNo(serial: number, fy: string): string {
  if (!(Number.isSafeInteger(serial) && serial >= 1)) {
    throw new Error(
      `formatInvoiceNo: invalid serial ${serial}. Expected a whole number >= 1.`,
    );
  }
  if (!FY_PATTERN.test(fy)) {
    throw new Error(`formatInvoiceNo: invalid fy ${fy}. Expected YYYY-YY.`);
  }
  const s = Number(fy.slice(0, 4));
  const e = Number(fy.slice(5));
  if (!(e === (s + 1) % 100)) {
    throw new Error(`formatInvoiceNo: fy ${fy} is not a valid year pair.`);
  }
  return serial + "/" + fy;
}
