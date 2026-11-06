import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { signToken, verifyToken } from "../../src/utils/jwt.js";
import { env } from "../../src/config/env.js";

const USER_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

describe("signToken", () => {
  it("produces a 3-part token", () => {
    expect(signToken(USER_ID).split(".")).toHaveLength(3);
  });
  it("rejects a non-UUID userId", () => {
    expect(() => signToken("abc")).toThrow();
  });
});

describe("verifyToken", () => {
  it("round trip returns the same user id", () => {
    expect(verifyToken(signToken(USER_ID))).toBe(USER_ID);
  });
  it("rejects a forged payload", () => {
    const [h, , s] = signToken(USER_ID).split(".");
    const fakePayload = Buffer.from(
      JSON.stringify({ sub: "00000000-0000-0000-0000-000000000000" }),
    ).toString("base64url");
    expect(() => verifyToken(`${h}.${fakePayload}.${s}`)).toThrow();
  });
  it("rejects an expired token", () => {
    const expired = jwt.sign({ sub: USER_ID }, env.JWT_SECRET, {
      expiresIn: -10,
      algorithm: "HS256",
    });
    expect(() => verifyToken(expired)).toThrow();
  });
  it("rejects a token signed with a different secret", () => {
    const other = jwt.sign({ sub: USER_ID }, "x".repeat(40), {
      algorithm: "HS256",
    });
    expect(() => verifyToken(other)).toThrow();
  });
  it("rejects a valid token with no sub", () => {
    const noSub = jwt.sign({ foo: 1 }, env.JWT_SECRET, { algorithm: "HS256" });
    expect(() => verifyToken(noSub)).toThrow(
      "verifyToken: token payload is invalid.",
    );
  });
  it("rejects garbage", () => {
    expect(() => verifyToken("not.a.token")).toThrow();
  });
});
