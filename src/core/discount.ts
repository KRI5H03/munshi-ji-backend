import { applyPercentMilli } from "./money.js";

export type DiscountStep = {
  seq: number;
  percentMilli: number;
  amount: number;
};

export type StackedDiscountResult = {
  steps: DiscountStep[];
  discountTotal: number;
  net: number;
};

export function applyStackedDiscounts(
  gross: number,
  percentMillis: number[],
): StackedDiscountResult {
  if (!(Number.isSafeInteger(gross) && gross >= 0)) {
    throw new Error(
      `applyStackedDiscounts: invalid gross ${gross}. Expected a whole number >= 0.`,
    );
  }

  const steps: DiscountStep[] = [];
  let remaining = gross;
  let seq = 1;

  for (const pm of percentMillis) {
    const amount = applyPercentMilli(remaining, pm);

    steps.push({ seq, percentMilli: pm, amount });

    remaining = remaining - amount;

    seq++;
  }

  const net = remaining;
  const discountTotal = gross - net;

  return { steps, discountTotal, net };
}
