import {
  OTP_PENDING_COOKIE,
  getOtpPendingCookieOptions,
  signToken,
  verifySignedToken,
} from "@/lib/auth";

const OTP_MS = 10 * 60 * 1000;

function getSecret(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

export function createOtpPendingToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;

  const exp = Date.now() + OTP_MS;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString("base64url");
  return signToken(payload, secret);
}

export function isOtpPendingTokenValid(pendingToken: string): boolean {
  const secret = getSecret();
  if (!secret) return false;

  const payload = verifySignedToken(pendingToken, secret);
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

export { OTP_PENDING_COOKIE, getOtpPendingCookieOptions };
