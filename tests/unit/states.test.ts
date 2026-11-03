import { describe, it, expect } from "vitest";
import { isValidStateCode } from "../../src/config/states.js";

describe("isValidStateCode", () => {
  it("Uttar Pradesh — father's bills", () => {
    expect(isValidStateCode("09")).toBe(true);
  });
  it("Andhra Pradesh — current code", () => {
    expect(isValidStateCode("37")).toBe(true);
  });
  it("rejects retired 25", () => {
    expect(isValidStateCode("25")).toBe(false);
  });
  it("rejects retired 28", () => {
    expect(isValidStateCode("28")).toBe(false);
  });
  it("rejects a single digit", () => {
    expect(isValidStateCode("9")).toBe(false);
  });
  it("rejects an unknown code", () => {
    expect(isValidStateCode("99")).toBe(false);
  });
});
