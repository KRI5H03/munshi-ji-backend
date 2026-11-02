import { describe, it, expect } from "vitest";
import { computeTaxSummary } from "../../src/core/tax.js";

const testBillLines = [
  { hsnCode: "62114290", gstRateBp: 500, taxable: 568285 },
  { hsnCode: "62114290", gstRateBp: 500, taxable: 568285 },
  { hsnCode: "62114290", gstRateBp: 500, taxable: 568285 },
];

describe("computeTaxSummary", () => {
  it("test bill, same state — CGST + SGST", () => {
    expect(computeTaxSummary(testBillLines, false)).toEqual([
      {
        hsnCode: "62114290",
        gstRateBp: 500,
        taxable: 1704855,
        cgst: 42621,
        sgst: 42621,
        igst: 0,
      },
    ]);
  });

  it("test bill, other state — IGST", () => {
    expect(computeTaxSummary(testBillLines, true)).toEqual([
      {
        hsnCode: "62114290",
        gstRateBp: 500,
        taxable: 1704855,
        cgst: 0,
        sgst: 0,
        igst: 85243,
      },
    ]);
  });

  it("BHOLA COLLECTION — 6 lines into one group", () => {
    const lines = [357143, 148571, 394285, 1508570, 677142, 1131428].map(
      (t) => ({
        hsnCode: "62114290",
        gstRateBp: 500,
        taxable: t,
      }),
    );
    expect(computeTaxSummary(lines, false)).toEqual([
      {
        hsnCode: "62114290",
        gstRateBp: 500,
        taxable: 4217139,
        cgst: 105428,
        sgst: 105428,
        igst: 0,
      },
    ]);
  });

  it("BHOLA SALES — HSN 6204", () => {
    const lines = [316800, 225500, 60000].map((t) => ({
      hsnCode: "6204",
      gstRateBp: 500,
      taxable: t,
    }));
    expect(computeTaxSummary(lines, false)).toEqual([
      {
        hsnCode: "6204",
        gstRateBp: 500,
        taxable: 602300,
        cgst: 15058,
        sgst: 15058,
        igst: 0,
      },
    ]);
  });

  it("mixed HSN and rates — separate groups, in order of first appearance", () => {
    const lines = [
      { hsnCode: "62114290", gstRateBp: 500, taxable: 100000 },
      { hsnCode: "6204", gstRateBp: 500, taxable: 50000 },
      { hsnCode: "62114290", gstRateBp: 1800, taxable: 300000 },
    ];
    expect(computeTaxSummary(lines, false)).toEqual([
      {
        hsnCode: "62114290",
        gstRateBp: 500,
        taxable: 100000,
        cgst: 2500,
        sgst: 2500,
        igst: 0,
      },
      {
        hsnCode: "6204",
        gstRateBp: 500,
        taxable: 50000,
        cgst: 1250,
        sgst: 1250,
        igst: 0,
      },
      {
        hsnCode: "62114290",
        gstRateBp: 1800,
        taxable: 300000,
        cgst: 27000,
        sgst: 27000,
        igst: 0,
      },
    ]);
  });

  it("rejects no lines", () => {
    expect(() => computeTaxSummary([], false)).toThrow();
  });

  it("rejects an odd rate", () => {
    expect(() =>
      computeTaxSummary(
        [{ hsnCode: "62114290", gstRateBp: 501, taxable: 1000 }],
        false,
      ),
    ).toThrow();
  });

  it("rejects a bad HSN", () => {
    expect(() =>
      computeTaxSummary(
        [{ hsnCode: "62A", gstRateBp: 500, taxable: 1000 }],
        false,
      ),
    ).toThrow();
  });
});
