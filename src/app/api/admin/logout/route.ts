import { NextResponse } from "next/server";
import { COOKIE_NAME, OTP_PENDING_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(OTP_PENDING_COOKIE);
  return response;
}
