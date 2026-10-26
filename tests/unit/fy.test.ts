import { describe, it, expect } from "vitest";
import { getFinancialYear } from "../../src/core/fy.js";

describe("getFinancialYear", () => {
  it("February belongs to the previous FY — BHOLA COLLECTION invoice", () => {
    expect(getFinancialYear("2026-02-20")).toBe("2025-26");
  });
  it("September belongs to the current FY — BHOLA SALES invoice", () => {
    expect(getFinancialYear("2026-09-29")).toBe("2026-27");
  });
  it("1 April starts a new FY", () => {
    expect(getFinancialYear("2026-04-01")).toBe("2026-27");
  });
  it("31 March ends the old FY", () => {
    expect(getFinancialYear("2026-03-31")).toBe("2025-26");
  });
  it("pads the end year at the century turn", () => {
    expect(getFinancialYear("2099-12-01")).toBe("2099-00");
  });
  it("rejects DD-MM-YYYY", () => {
    expect(() => getFinancialYear("20-02-2026")).toThrow();
  });
  it("rejects month 13", () => {
    expect(() => getFinancialYear("2026-13-01")).toThrow();
  });
  it("rejects month 00", () => {
    expect(() => getFinancialYear("2026-00-15")).toThrow();
  });
});
