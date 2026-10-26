export function getFinancialYear(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw new Error(
      `getFinancialYear: invalid date ${date}. Expected YYYY-MM-DD.`,
    );
  const month: string = date.substring(5, 7);
  const year: string = date.substring(0, 4);
  const m = Number(month);
  const y = Number(year);
  if (!(m >= 1 && m <= 12)) {
    throw new Error(
      `getFinancialYear: invalid month in ${date}. Expected 01 to 12.`,
    );
  }
  const sty = m >= 4 ? y : y - 1;
  const eny = String((sty + 1) % 100).padStart(2, "0");

  return sty + "-" + eny;
}
