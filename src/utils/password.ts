import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  // Guard — good = not empty AND at most 72 bytes
  if (!(plain.length >= 1 && Buffer.byteLength(plain, "utf-8") <= 72)) {
    throw new Error("hashPassword: password must be 1 to 72 bytes.");
  }

  return await bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!(hash.length === 60 && hash.startsWith("$2"))) {
    throw new Error(`verifyPassword: stored hash is malformed.`);
  }
  if (plain.length === 0) {
    return false;
  }
  return await bcrypt.compare(plain, hash);
}
