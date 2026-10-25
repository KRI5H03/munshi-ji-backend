export function rupeesToPaise(input: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(input)) {
    throw new Error(`Invalid amount: ${input}`);
  }
  if (input.includes(".")) {
    const id: number = input.indexOf(".");
    const rupees: string = input.substring(0, id);
    let paise: string = input.substring(id + 1);
    paise = paise.length == 1 ? paise + 0 : paise;
    return Number(rupees) * 100 + Number(paise);
  }
  return Number(input) * 100;
}

export function formatPaise(paise: number): string {
  if (!Number.isSafeInteger(paise)) {
    throw new Error(
      `formatPaise: invalid paise ${paise}. Expected a whole number.`,
    );
  }
  const roundOff: number = Math.abs(paise);
  const rup: string = new Intl.NumberFormat("en-IN").format(
    Math.trunc(roundOff / 100),
  );
  const pais: string = String(roundOff % 100).padStart(2, "0");
  const sign = paise < 0 ? "-" : "";
  return `${sign}${rup}.${pais}`;
}

function divideRoundHalf(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    throw new Error(
      `divideRoundHalf: invalid denominator ${denominator}. Expected a whole number > 0.`,
    );
  }
  const rem: number = numerator % denominator;
  const ques: number = (numerator - rem) / denominator;

  return rem * 2 >= denominator ? ques + 1 : ques;
}

export function applyPercentMilli(
  amount: number,
  percentMilli: number,
): number {
  if (!(Number.isSafeInteger(amount) && amount >= 0)) {
    throw new Error(
      `applyPercentMilli: invalid amount ${amount}. Expected a whole number >= 0.`,
    );
  }
  if (
    !(
      Number.isSafeInteger(percentMilli) &&
      percentMilli > 0 &&
      percentMilli < 100000
    )
  ) {
    throw new Error(
      `applyPercentMilli: invalid percentMilli ${percentMilli}. Expected 0 to 100000.`,
    );
  }

  return divideRoundHalf(amount * percentMilli, 100000);
}

export function applyBasisPoints(amount: number, bp: number): number {
  if (!(Number.isSafeInteger(amount) && amount >= 0)) {
    throw new Error(
      `applyBasisPoints: invalid amount ${amount}. Expected a whole number >= 0.`,
    );
  }
  if (!(Number.isSafeInteger(bp) && bp > 0 && bp < 100000)) {
    throw new Error(`applyBasisPoints: invalid bp ${bp}. Expected 0 to 10000.`);
  }
  return divideRoundHalf(amount * bp, 10000);
}

export function roundToRupee(paise: number): {
  total: number;
  roundOff: number;
} {
  if (!Number.isSafeInteger(paise) && paise < 0) {
    throw new Error(
      `roundToRupee: invalid paise ${paise}. Expected a whole number >= 0.`,
    );
  }
  const total: number = divideRoundHalf(paise, 100) * 100;
  const roundOff: number = total - paise;
  return { total: total, roundOff: roundOff };
}
