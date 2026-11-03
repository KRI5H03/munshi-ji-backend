const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];
export function twoDigitWords(n: number): string {
  if (!(Number.isSafeInteger(n) && n >= 0 && n <= 99)) {
    throw new Error(
      `twoDigitWords: invalid n ${n}. Expected a whole number 0 to 99.`,
    );
  }
  if (n < 20) {
    return ONES[n] ?? "";
  }
  const tensDigit = Math.floor(n / 10);
  const onesDigit = n % 10;
  const ones = onesDigit !== 0 ? " " + ONES[onesDigit] : "";
  return TENS[tensDigit] + ones;
}
