import { describe, it, expect } from "vitest";
import {
  rupeesToPaise,
  formatPaise,
  applyPercentMilli,
  applyBasisPoints,
  roundToRupee,
} from "../../src/core/money.js";

describe("rupeesToPaise", () => {
  it("whole rupees", () => {
    expect(rupeesToPaise("780")).toBe(78000);
  });
  it("one decimal place", () => {
    expect(rupeesToPaise("780.5")).toBe(78050);
  });
  it("two decimal places", () => {
    expect(rupeesToPaise("780.50")).toBe(78050);
  });
  it("rejects three decimal places", () => {
    expect(() => rupeesToPaise("780.555")).toThrow();
  });
  it("rejects letters", () => {
    expect(() => rupeesToPaise("abc")).toThrow();
  });
  it("rejects empty input", () => {
    expect(() => rupeesToPaise("")).toThrow();
  });
  it("rejects negative amounts", () => {
    expect(() => rupeesToPaise("-5")).toThrow();
  });
});

describe("formatPaise", () => {
  it("formats a normal amount", () => {
    expect(formatPaise(1704855)).toBe("17,048.55");
  });
  it("uses Indian lakh grouping", () => {
    expect(formatPaise(12345678)).toBe("1,23,456.78");
  });
  it("pads small paise", () => {
    expect(formatPaise(5)).toBe("0.05");
  });
  it("formats zero", () => {
    expect(formatPaise(0)).toBe("0.00");
  });
  it("keeps the minus sign", () => {
    expect(formatPaise(-16)).toBe("-0.16");
  });
  it("rejects non-integers", () => {
    expect(() => formatPaise(100.5)).toThrow();
  });
});

describe("applyPercentMilli", () => {
  it("15% discount — test bill", () => {
    expect(applyPercentMilli(2106000, 15000)).toBe(315900);
  });
  it("4.762% discount — test bill", () => {
    expect(applyPercentMilli(1790100, 4762)).toBe(85245);
  });
  it("4.762% discount — BHOLA COLLECTION", () => {
    expect(applyPercentMilli(4428000, 4762)).toBe(210861);
  });
  it("rejects percentMilli above 100%", () => {
    expect(() => applyPercentMilli(100000, 150000)).toThrow();
  });
  it("rejects negative amount", () => {
    expect(() => applyPercentMilli(-100, 15000)).toThrow();
  });
});

describe("applyBasisPoints", () => {
  it("CGST 2.5% — test bill", () => {
    expect(applyBasisPoints(1704855, 250)).toBe(42621);
  });
  it("CGST 2.5% — BHOLA COLLECTION", () => {
    expect(applyBasisPoints(4217139, 250)).toBe(105428);
  });
  it("CGST 2.5% — BHOLA SALES, exact half rounds up", () => {
    expect(applyBasisPoints(602300, 250)).toBe(15058);
  });
  it("rejects bp above 100%", () => {
    expect(() => applyBasisPoints(100000, 25000)).toThrow();
  });
});

describe("roundToRupee", () => {
  it("rounds up — test bill", () => {
    expect(roundToRupee(1790097)).toEqual({ total: 1790100, roundOff: 3 });
  });
  it("rounds up — BHOLA COLLECTION", () => {
    expect(roundToRupee(4427995)).toEqual({ total: 4428000, roundOff: 5 });
  });
  it("rounds down — BHOLA SALES", () => {
    expect(roundToRupee(632416)).toEqual({ total: 632400, roundOff: -16 });
  });
  it("exactly 50 paise rounds up", () => {
    expect(roundToRupee(1050)).toEqual({ total: 1100, roundOff: 50 });
  });
  it("rejects negative input", () => {
    expect(() => roundToRupee(-100)).toThrow();
  });
});
