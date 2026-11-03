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

export function amountInWords(paise: number): string {
  if (!(Number.isSafeInteger(paise) && paise >= 0)) {
    throw new Error(
      `amountInWords: invalid paise ${paise}. Expected a whole number >= 0.`,
    );
  }
  const paisePart = paise % 100;
  const rupees = (paise - paisePart) / 100;
  if (!(rupees < 1_000_000_000)) {
    throw new Error(
      `amountInWords: amount too large — ${rupees} rupees. Maximum is 99,99,99,999.`,
    );
  }
  let remaining = rupees;
  const crore = Math.floor(remaining / 10_000_000);
  remaining = remaining % 10_000_000;
  const lakh = Math.floor(remaining / 100_000);
  remaining = remaining % 100_000;
  const thousand = Math.floor(remaining / 1_000);
  remaining = remaining % 1_000;
  const hundred = Math.floor(remaining / 100);
  const rest = remaining % 100;

  const words: string[] = [];

  if (crore > 0) words.push(`${twoDigitWords(crore)} Crore`);
  if (lakh > 0) words.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand > 0) words.push(`${twoDigitWords(thousand)} Thousand`);
  if (hundred > 0) words.push(`${twoDigitWords(hundred)} Hundred`);
  if (rest > 0) words.push(twoDigitWords(rest)); // no unit word

  const rupeeWords = words.length > 0 ? words.join(" ") : "Zero";

  let sentence = `Rupees ${rupeeWords}`;
  if (paisePart > 0) {
    sentence = sentence + " and " + twoDigitWords(paisePart) + " Paise";
  }
  return `${sentence} Only`;
  return "";
}
