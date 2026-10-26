import { describe, it, expect } from "vitest";
import { getGstRateBp } from "../../src/core/gst.js";

describe("getGstRateBp", () => {
  it("₹780 piece is 5% — test bill", () => {
    expect(getGstRateBp(78000, "2026-10-26")).toBe(500);
  });
  it("exactly ₹2,500 is still 5% — 'not exceeding'", () => {
    expect(getGstRateBp(250000, "2026-10-26")).toBe(500);
  });
  it("one paisa over ₹2,500 is 18%", () => {
    expect(getGstRateBp(250001, "2026-10-26")).toBe(1800);
  });
  it("old rule on its last day — ₹1,500 is 12%", () => {
    expect(getGstRateBp(150000, "2025-09-21")).toBe(1200);
  });
  it("new rule on its first day — ₹1,500 is 5%", () => {
    expect(getGstRateBp(150000, "2025-09-22")).toBe(500);
  });
  it("rejects a negative value", () => {
    expect(() => getGstRateBp(-1, "2026-10-26")).toThrow();
  });
  it("rejects a bad date shape", () => {
    expect(() => getGstRateBp(78000, "26-10-2026")).toThrow();
  });
  it("rejects a date before any rule", () => {
    expect(() => getGstRateBp(78000, "2010-01-01")).toThrow();
  });
});
