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

type Leftover = { index: number; rem: number };

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

export function apportionDiscount(
  lineGrosses: number[],
  discountTotal: number,
): number[] {
  // ── Guards on inputs ────────────────────────────────
  if (!(lineGrosses.length > 0)) {
    throw new Error("apportionDiscount: no lines given.");
  }
  if (!(Number.isSafeInteger(discountTotal) && discountTotal >= 0)) {
    throw new Error(
      `apportionDiscount: invalid discountTotal ${discountTotal}. Expected a whole number >= 0.`,
    );
  }

  // ── Total of the whole bill ─────────────────────────
  let totalGross = 0;
  for (const lg of lineGrosses) {
    if (!(Number.isSafeInteger(lg) && lg >= 0)) {
      throw new Error(
        `apportionDiscount: invalid line gross ${lg}. Expected a whole number >= 0.`,
      );
    }
    totalGross += lg;
  }

  if (!(totalGross > 0)) {
    throw new Error(
      "apportionDiscount: total gross is 0, nothing to apportion across.",
    );
  }
  if (!(discountTotal <= totalGross)) {
    throw new Error(
      `apportionDiscount: discount ${discountTotal} exceeds total gross ${totalGross}.`,
    );
  }

  // ── Round 1: whole share to every line ──────────────
  const results: number[] = [];
  const leftovers: Leftover[] = [];
  let given = 0;

  for (const [i, lg] of lineGrosses.entries()) {
    const product = discountTotal * lg;
    if (!Number.isSafeInteger(product)) {
      throw new Error(`apportionDiscount: overflow at line gross ${lg}.`);
    }
    const rem = product % totalGross;
    const whole = (product - rem) / totalGross;

    results.push(whole);
    leftovers.push({ index: i, rem });
    given += whole;
  }

  // ── Round 2: hand out the missing paise ─────────────
  const leftover = discountTotal - given;

  // biggest remainder first; ties → earlier line first
  leftovers.sort((a, b) => b.rem - a.rem || a.index - b.index);

  for (const lo of leftovers.slice(0, leftover)) {
    const current = results[lo.index];
    if (current === undefined) {
      throw new Error(`apportionDiscount: no result at index ${lo.index}.`);
    }
    results[lo.index] = current + 1;
  }

  return results;
}
