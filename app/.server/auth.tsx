export const danger = "danger zone";
import crypto from "node:crypto";
import type { AuthCookie } from "./types";
import { authCookie } from "./cookies";
import { redirect } from "react-router";
import { AUTH_COOKIE_EXPIRY, authCache } from "./cache";
import { prisma } from "./prisma";

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

/**
 * Require authentication and throws a redirect to login if not authenticated
 * @param request - The request object
 * @returns The auth cookie. If the auth cookie is not found or expired etc, the function will throw a redirect to /login
 */
export async function requireAuthRedirect(
  request: Request
): Promise<AuthCookie> {
  const auth: AuthCookie = await authCookie.parse(
    request.headers.get("Cookie")
  );
  if (!auth) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await authCookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  }
  const { userId, sessionId } = auth;
  if (!sessionId) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await authCookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  }

  // --- CACHE LOGIC ---
  const cached = authCache.get(sessionId);
  if (cached) {
    if (cached.expiresAt > new Date()) {
      console.log("Auth cache hit");
      return cached.authCookie;
    } else {
      authCache.delete(sessionId);
    }
  }

  console.log("Auth cache Miss");

  // --- DB LOGIC ---
  const dbSession = await prisma.session.findUnique({
    where: {
      sessionId: sessionId,
      userId: userId,
      expiresAt: { gt: new Date() },
    },
    select: {
      userId: true,
      sessionId: true,
      expiresAt: true,
      user: {
        select: {
          email: true,
          username: true,
          avatarURL: true,
        },
      },
    },
  });

  if (!dbSession) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await authCookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  }
  const cookie: AuthCookie = {
    userId: dbSession.userId,
    email: dbSession.user.email,
    username: dbSession.user.username,
    sessionId: dbSession.sessionId,
    avatarURL: dbSession.user.avatarURL,
  };
  authCache.set(dbSession.sessionId, {
    expiresAt: new Date(Date.now() + AUTH_COOKIE_EXPIRY),
    authCookie: cookie,
  });

  return cookie;
}
