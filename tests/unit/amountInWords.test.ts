import { describe, it, expect } from "vitest";
import { amountInWords, twoDigitWords } from "../../src/core/amountInWords.js";

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

describe("amountInWords", () => {
  it("BHOLA COLLECTION", () => {
    expect(amountInWords(4428000)).toBe(
      "Rupees Forty Four Thousand Two Hundred Eighty Only",
    );
  });
  it("BHOLA SALES", () => {
    expect(amountInWords(632400)).toBe(
      "Rupees Six Thousand Three Hundred Twenty Four Only",
    );
  });
  it("test bill", () => {
    expect(amountInWords(1790100)).toBe(
      "Rupees Seventeen Thousand Nine Hundred One Only",
    );
  });
  it("skipped groups leave no gaps", () => {
    expect(amountInWords(10000000)).toBe("Rupees One Lakh Only");
  });
  it("every group used", () => {
    expect(amountInWords(1234567800)).toBe(
      "Rupees One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Only",
    );
  });
  it("paise part", () => {
    expect(amountInWords(1050)).toBe("Rupees Ten and Fifty Paise Only");
  });
  it("zero", () => {
    expect(amountInWords(0)).toBe("Rupees Zero Only");
  });
  it("rejects negative", () => {
    expect(() => amountInWords(-1)).toThrow();
  });
});
