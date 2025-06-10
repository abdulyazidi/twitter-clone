import type { AuthCookie } from "./types";

/**
 * The expiry time for auth cookies in milliseconds - 5 minutes
 */
export const AUTH_COOKIE_EXPIRY = 5 * 60 * 1000;

/**
 * Simple map cache for auth cookies
 * @param authCookie - The auth cookie
 * @param expiresAt - The date the auth cookie expires
 */
export const authCache = new Map<
  string,
  {
    authCookie: AuthCookie;
    expiresAt: Date;
  }
>();
