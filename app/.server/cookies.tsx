import {
  createCookie,
  createCookieSessionStorage,
  createSessionStorage,
} from "react-router";

let secret = process.env.COOKIE_SECRET || "default";

if (secret === "default") {
  console.warn(
    "🚨 SECURITY WARNING: No COOKIE_SECRET environment variable set! Using default secret."
  );
  console.warn(
    "🚨 This is a security risk in production. Please set COOKIE_SECRET to a random 32+ character string."
  );
}

/**`
 * Creates basic secure template for users cookie sessions - expires in 30 days
 * @param name - The name of the cookie
 * @param options - The options for the cookie. See https://reactrouter.com/en/main/reference/api/createCookie
 * @returns A cookie object
 */
export const authCookie = createCookie("auth", {
  sameSite: "lax", // allows cookie to be sent when a user is navigating to the origin site from an external site
  secure: true, // always require HTTPS in production
  httpOnly: true, // don't allow JS or others to access cookies via dom
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secrets: [secret], // used to sign the cookie
});
