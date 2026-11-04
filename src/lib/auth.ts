import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "vv_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is not configured.");
  return password;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function valid(value: string) {
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(expires);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function verifyPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return false;
  const actual = Buffer.from(password);
  const expected = Buffer.from(configured);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  return `${expires}.${sign(expires)}`;
}

export function hasSession() {
  const value = cookies().get(COOKIE_NAME)?.value;
  return Boolean(value && valid(value));
}

export function setSessionCookie(value: string) {
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export function requireSession() {
  if (!isAuthConfigured()) throw new Error("ADMIN_PASSWORD is not configured.");
  if (!hasSession()) throw new Response("Unauthorized", { status: 401 });
}
