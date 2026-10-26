import { GST_RULES } from "../config/gstRules.js";
import { dateRules } from "./fy.js";

export function getGstRateBp(valuePerPiece: number, date: string): number {
  if (!(Number.isSafeInteger(valuePerPiece) && valuePerPiece >= 0)) {
    throw new Error(
      `getGstRateBp: invalid valuePerPiece ${valuePerPiece}. Expected a whole number >= 0.`,
    );
  }
  if (!dateRules.test(date)) {
    throw new Error(`getGstRateBp: invalid date ${date}. Expected YYYY-MM-DD.`);
  }

  const rule = GST_RULES.find(
    (r) =>
      r.effectiveFrom <= date &&
      (r.effectiveTo === null || r.effectiveTo >= date),
  );

  if (!rule) {
    throw new Error(`getGstRateBp: no GST rule covers ${date}.`);
  }

  return valuePerPiece > rule.thresholdPaise ? rule.highBp : rule.lowBp;
}
