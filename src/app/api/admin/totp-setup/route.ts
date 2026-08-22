import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OTP_PENDING_COOKIE } from "@/lib/auth";
import { isOtpPendingTokenValid } from "@/lib/adminPending";
import { isTotpEnrolled } from "@/lib/adminSettings";
import { getOtpAuthUri, getTotpSecretBase32 } from "@/lib/totp";

export async function GET() {
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(OTP_PENDING_COOKIE)?.value;

  if (!pendingToken || !isOtpPendingTokenValid(pendingToken)) {
    return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
  }

  const enrolled = await isTotpEnrolled();
  if (enrolled) {
    return NextResponse.json({ enrolled: true });
  }

  const secret = getTotpSecretBase32();
  const uri = getOtpAuthUri();

  if (!secret || !uri) {
    return NextResponse.json({ error: "2FA no disponible" }, { status: 503 });
  }

  return NextResponse.json({
    enrolled: false,
    secret,
    uri,
    label: "Vestuario — Mi Colección",
  });
}
