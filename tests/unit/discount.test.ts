import { describe, it, expect } from "vitest";
import { applyStackedDiscounts } from "../../src/core/discount.js";

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
