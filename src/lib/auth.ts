import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_session";
export const OTP_PENDING_COOKIE = "admin_otp_pending";

const SESSION_MS = 60 * 60 * 24 * 1000;
const OTP_MS = 10 * 60 * 1000;

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_PASSWORD?.trim();
  return secret || null;
}

export function signToken(payload: string, secret: string): string {
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySignedToken(token: string, secret: string): string | null {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");

  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  return payload;
}

export function createAdminSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const exp = Date.now() + SESSION_MS;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  return signToken(payload, secret);
}

function verifyAdminSessionToken(token: string): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;

  const payload = verifySignedToken(token, secret);
  if (!payload) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token);
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_MS / 1000,
    path: "/",
  };
}

export function getOtpPendingCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: OTP_MS / 1000,
    path: "/",
  };
}
