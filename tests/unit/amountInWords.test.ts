import { describe, it, expect } from "vitest";
import { twoDigitWords } from "../../src/core/amountInWords.js";

describe("twoDigitWords", () => {
  it("zero is empty", () => {
    expect(twoDigitWords(0)).toBe("");
  });
  it("single digit", () => {
    expect(twoDigitWords(5)).toBe("Five");
  });
  it("irregular teen", () => {
    expect(twoDigitWords(13)).toBe("Thirteen");
  });
  it("exact tens — no trailing space", () => {
    expect(twoDigitWords(20)).toBe("Twenty");
  });
  it("tens and ones", () => {
    expect(twoDigitWords(44)).toBe("Forty Four");
  });
  it("Eighty — no trailing space", () => {
    expect(twoDigitWords(80)).toBe("Eighty");
  });
  it("top edge", () => {
    expect(twoDigitWords(99)).toBe("Ninety Nine");
  });
  it("rejects 100", () => {
    expect(() => twoDigitWords(100)).toThrow();
  });
});
