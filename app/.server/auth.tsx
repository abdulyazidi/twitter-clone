export const danger = "danger zone";
import crypto from "node:crypto";

/**
 * Hash a password using scrypt
 * @param password - The password to hash
 * @param salt - The salt to use. If not provided, a new one will be generated
 * @returns The hashed password and salt. If there is an error, the error will be true
 */
export function scryptHash({
  password,
  salt,
}: {
  password: string;
  salt?: string;
}): { passwordHash: string; salt: string; error?: boolean } {
  // If no salt is provided, generate a new one
  const usedSalt =
    salt || createRandomBytes({ format: "base64url", length: 16 });

  let passwordHash;
  try {
    // TODO: Look into async scrypt implementation and performance diff
    passwordHash = crypto
      .scryptSync(password, usedSalt, 64, {
        N: 32768, // 2^15
        r: 8,
        p: 3,
        maxmem: 34603008, // 33 MiB
      })
      .toString("base64url");
  } catch (error) {
    console.error("Error hashing password", error);
    return { passwordHash: "", salt: "", error: true };
  }

  return { passwordHash, salt: usedSalt, error: false }; // If no salt, return hash and generated salt
}

/**
 * Create a random bytes string
 * @param format - The format of the random bytes. Defaults to base64url
 * @param length - The length of the random bytes. Defaults to 16
 * @returns A random bytes string
 */
export function createRandomBytes({
  format = "base64url",
  length = 16,
}: {
  format?: BufferEncoding;
  length?: number;
}) {
  return crypto.randomBytes(length).toString(format);
}
