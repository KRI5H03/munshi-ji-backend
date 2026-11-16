import { describe, it, expect } from "vitest";
import { adjustStockSchema } from "../../src/validators/item.validator.js";
import { cancelSaleSchema } from "../../src/validators/invoice.validator.js";

describe("adjustStockSchema", () => {
  it("accepts adding stock", () => {
    expect(
      adjustStockSchema.safeParse({ change: 50, note: "New stock" }).success,
    ).toBe(true);
  });
  it("accepts removing stock", () => {
    expect(
      adjustStockSchema.safeParse({ change: -3, note: "Damaged" }).success,
    ).toBe(true);
  });
  it("rejects 0", () => {
    expect(adjustStockSchema.safeParse({ change: 0, note: "x" }).success).toBe(
      false,
    );
  });
  it("rejects decimals", () => {
    expect(
      adjustStockSchema.safeParse({ change: 2.5, note: "x" }).success,
    ).toBe(false);
  });
  it("needs a note", () => {
    expect(adjustStockSchema.safeParse({ change: 10 }).success).toBe(false);
    expect(
      adjustStockSchema.safeParse({ change: 10, note: "   " }).success,
    ).toBe(false);
  });
});

describe("cancelSaleSchema", () => {
  it("accepts a reason", () => {
    expect(cancelSaleSchema.safeParse({ reason: "Wrong party" }).success).toBe(
      true,
    );
  });
  it("rejects empty or missing reason", () => {
    expect(cancelSaleSchema.safeParse({}).success).toBe(false);
    expect(cancelSaleSchema.safeParse({ reason: "  " }).success).toBe(false);
  });
});
