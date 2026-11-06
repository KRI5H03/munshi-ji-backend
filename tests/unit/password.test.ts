import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

describe("hashPassword", () => {
  it("produces a 60-char bcrypt hash at cost 12", async () => {
    const h = await hashPassword("secret123");
    expect(h).toHaveLength(60);
    expect(h.startsWith("$2b$12$")).toBe(true);
  });
  it("same password gives different hashes (salt)", async () => {
    const a = await hashPassword("secret123");
    const b = await hashPassword("secret123");
    expect(a).not.toBe(b);
  });
  it("accepts exactly 72 bytes", async () => {
    await expect(hashPassword("a".repeat(72))).resolves.toHaveLength(60);
  });
  it("rejects 73 bytes", async () => {
    await expect(hashPassword("a".repeat(73))).rejects.toThrow();
  });
  it("rejects empty", async () => {
    await expect(hashPassword("")).rejects.toThrow();
  });
});

describe("verifyPassword", () => {
  it("correct password", async () => {
    const h = await hashPassword("secret123");
    expect(await verifyPassword("secret123", h)).toBe(true);
  });
  it("wrong password", async () => {
    const h = await hashPassword("secret123");
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
  it("empty password is just false", async () => {
    const h = await hashPassword("secret123");
    expect(await verifyPassword("", h)).toBe(false);
  });
  it("malformed hash throws", async () => {
    await expect(verifyPassword("secret123", "abc")).rejects.toThrow();
  });
});
