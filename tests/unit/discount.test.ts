import { describe, it, expect } from "vitest";
import {
  applyStackedDiscounts,
  apportionDiscount,
} from "../../src/core/discount.js";

describe("applyStackedDiscounts", () => {
  it("two stacked discounts — test bill", () => {
    expect(applyStackedDiscounts(2106000, [15000, 4762])).toEqual({
      steps: [
        { seq: 1, percentMilli: 15000, amount: 315900 },
        { seq: 2, percentMilli: 4762, amount: 85245 },
      ],
      discountTotal: 401145,
      net: 1704855,
    });
  });

  it("one discount — BHOLA COLLECTION", () => {
    expect(applyStackedDiscounts(4428000, [4762])).toEqual({
      steps: [{ seq: 1, percentMilli: 4762, amount: 210861 }],
      discountTotal: 210861,
      net: 4217139,
    });
  });

  it("no discount — BHOLA SALES", () => {
    expect(applyStackedDiscounts(602300, [])).toEqual({
      steps: [],
      discountTotal: 0,
      net: 602300,
    });
  });

  it("rejects negative gross", () => {
    expect(() => applyStackedDiscounts(-1, [])).toThrow();
  });

  it("rejects a discount above 100%", () => {
    expect(() => applyStackedDiscounts(100000, [150000])).toThrow();
  });
});

describe("apportionDiscount", () => {
  it("even split — test bill", () => {
    expect(apportionDiscount([702000, 702000, 702000], 401145)).toEqual([
      133715, 133715, 133715,
    ]);
  });
  it("hands out 4 leftover paise — BHOLA COLLECTION", () => {
    expect(
      apportionDiscount(
        [375000, 156000, 414000, 1584000, 711000, 1188000],
        210861,
      ),
    ).toEqual([17857, 7429, 19715, 75430, 33858, 56572]);
  });
  it("no discount — BHOLA SALES", () => {
    expect(apportionDiscount([316800, 225500, 60000], 0)).toEqual([0, 0, 0]);
  });
  it("tie goes to the earlier line", () => {
    expect(apportionDiscount([100, 100, 100], 2)).toEqual([1, 1, 0]);
  });
  it("rejects no lines", () => {
    expect(() => apportionDiscount([], 0)).toThrow();
  });
  it("rejects a discount bigger than the bill", () => {
    expect(() => apportionDiscount([100], 200)).toThrow();
  });
  it("rejects a negative line gross", () => {
    expect(() => apportionDiscount([-1], 0)).toThrow();
  });
});
