import { describe, it, expect } from "vitest";
import { formatInvoiceNo } from "../../src/core/invoiceNumber.js";

describe("formatInvoiceNo", () => {
  it("BHOLA COLLECTION", () => {
    expect(formatInvoiceNo(195, "2025-26")).toBe("195/2025-26");
  });
  it("BHOLA SALES", () => {
    expect(formatInvoiceNo(23, "2026-27")).toBe("23/2026-27");
  });
  it("century turn", () => {
    expect(formatInvoiceNo(1, "2099-00")).toBe("1/2099-00");
  });
  it("rejects serial 0", () => {
    expect(() => formatInvoiceNo(0, "2026-27")).toThrow();
  });
  it("rejects a non-whole serial", () => {
    expect(() => formatInvoiceNo(1.5, "2026-27")).toThrow();
  });
  it("rejects a bad fy shape", () => {
    expect(() => formatInvoiceNo(26, "26-27")).toThrow();
  });
  it("rejects mismatched year halves", () => {
    expect(() => formatInvoiceNo(26, "2026-28")).toThrow();
  });
});
