import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TOKEN_TTL = "7d";
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function signToken(userId: string): string {
  if (!UUID_PATTERN.test(userId)) {
    throw new Error(`signToken: invalid userId.`);
  }
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  if (
    !(
      typeof payload === "object" &&
      typeof payload.sub === "string" &&
      UUID_PATTERN.test(payload.sub)
    )
  ) {
    throw new Error(`verifyToken: token payload is invalid.`);
  }
  return payload.sub;
}
