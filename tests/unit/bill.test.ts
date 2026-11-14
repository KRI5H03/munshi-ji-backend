import { describe, it, expect } from "vitest";
import {
  perPieceCeil,
  lineGrosses,
  buildLines,
  computeTotals,
} from "../../src/core/bill.js";

describe("perPieceCeil", () => {
  it("exact division stays the same", () => {
    expect(perPieceCeil(750000, 3)).toBe(250000);
    expect(perPieceCeil(1000, 4)).toBe(250);
  });
  it("any leftover rounds UP by 1 paisa", () => {
    expect(perPieceCeil(750001, 3)).toBe(250001);
  });
  it("zero taxable gives 0", () => {
    expect(perPieceCeil(0, 5)).toBe(0);
  });
  it("rejects bad input", () => {
    expect(() => perPieceCeil(-1, 1)).toThrow();
    expect(() => perPieceCeil(1.5, 1)).toThrow();
    expect(() => perPieceCeil(100, 0)).toThrow();
  });
});

describe("lineGrosses", () => {
  it("qty x rate per line, plus total", () => {
    const r = lineGrosses([
      { qty: 10, rate: 85000 },
      { qty: 5, rate: 120000 },
    ]);
    expect(r.grosses).toEqual([850000, 600000]);
    expect(r.grossTotal).toBe(1450000);
  });
  it("rejects no lines and negative gross", () => {
    expect(() => lineGrosses([])).toThrow();
    expect(() => lineGrosses([{ qty: -1, rate: 85000 }])).toThrow();
  });
});

describe("buildLines", () => {
  it("10% discount split across 2 lines, both 5%", () => {
    const r = buildLines(
      [
        { qty: 10, rate: 85000 },
        { qty: 5, rate: 120000 },
      ],
      [10000],
      "2026-11-14",
    );
    expect(r.grossTotal).toBe(1450000);
    expect(r.discountTotal).toBe(145000);
    expect(r.discountSteps).toEqual([
      { seq: 1, percentMilli: 10000, amount: 145000 },
    ]);
    expect(r.lines).toEqual([
      {
        qty: 10,
        rate: 85000,
        gross: 850000,
        discountAlloc: 85000,
        taxable: 765000,
        gstRateBp: 500,
      },
      {
        qty: 5,
        rate: 120000,
        gross: 600000,
        discountAlloc: 60000,
        taxable: 540000,
        gstRateBp: 500,
      },
    ]);
  });

  it("no discount: shares are 0, nothing apportioned", () => {
    const r = buildLines([{ qty: 2, rate: 300000 }], [], "2026-11-14");
    expect(r.discountTotal).toBe(0);
    expect(r.discountSteps).toEqual([]);
    expect(r.lines[0]?.discountAlloc).toBe(0);
  });

  it("above Rs 2,500 per piece is 18%", () => {
    const r = buildLines([{ qty: 2, rate: 300000 }], [], "2026-11-14");
    expect(r.lines[0]?.gstRateBp).toBe(1800);
  });

  it("exactly Rs 2,500 is 5%, one paisa more is 18%", () => {
    expect(
      buildLines([{ qty: 3, rate: 250000 }], [], "2026-11-14").lines[0]
        ?.gstRateBp,
    ).toBe(500);
    expect(
      buildLines([{ qty: 3, rate: 250001 }], [], "2026-11-14").lines[0]
        ?.gstRateBp,
    ).toBe(1800);
  });

  it("discount pulls a line from 18% down to 5%", () => {
    // Rs 2,600 less 10% = Rs 2,340 per piece -> 5%
    const r = buildLines([{ qty: 1, rate: 260000 }], [10000], "2026-11-14");
    expect(r.lines[0]?.taxable).toBe(234000);
    expect(r.lines[0]?.gstRateBp).toBe(500);
  });
});

describe("computeTotals", () => {
  const sameHsn = [
    { hsnCode: "62114290", gstRateBp: 500, taxable: 765000 },
    { hsnCode: "62114290", gstRateBp: 500, taxable: 540000 },
  ];

  it("same state: one group, CGST = SGST, round up 50 paise", () => {
    const t = computeTotals(sameHsn, false);
    expect(t.taxSummary).toHaveLength(1);
    expect(t.taxable).toBe(1305000);
    expect(t.cgst).toBe(32625);
    expect(t.sgst).toBe(32625);
    expect(t.igst).toBe(0);
    expect(t.roundOff).toBe(50);
    expect(t.grandTotal).toBe(1370300);
  });

  it("other state: IGST only, same grand total", () => {
    const t = computeTotals(sameHsn, true);
    expect(t.cgst).toBe(0);
    expect(t.sgst).toBe(0);
    expect(t.igst).toBe(65250);
    expect(t.grandTotal).toBe(1370300);
  });

  it("two HSN/rate groups add up", () => {
    const t = computeTotals(
      [
        { hsnCode: "62114290", gstRateBp: 500, taxable: 765000 },
        { hsnCode: "6204", gstRateBp: 1800, taxable: 600000 },
      ],
      false,
    );
    expect(t.taxSummary).toHaveLength(2);
    expect(t.taxable).toBe(1365000);
    expect(t.cgst).toBe(73125); // 19125 + 54000
    expect(t.sgst).toBe(73125);
    expect(t.grandTotal).toBe(1511300);
    expect(t.roundOff).toBe(50);
  });

  it("rounds DOWN with a negative round off", () => {
    // 1000.10 taxable, 2.5% each = 25.00 each -> 1050.10 -> 1050
    const t = computeTotals(
      [{ hsnCode: "62114290", gstRateBp: 500, taxable: 100010 }],
      false,
    );
    expect(t.cgst).toBe(2500);
    expect(t.grandTotal).toBe(105000);
    expect(t.roundOff).toBe(-10);
  });
});
