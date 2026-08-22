import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createAdminSessionToken,
  COOKIE_NAME,
  getAdminSessionCookieOptions,
  OTP_PENDING_COOKIE,
  getOtpPendingCookieOptions,
} from "@/lib/auth";
import { isOtpPendingTokenValid } from "@/lib/adminPending";
import { setTotpEnrolled } from "@/lib/adminSettings";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(request: Request) {
  const { code } = await request.json();
  const otp = typeof code === "string" ? code.trim() : "";

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Código inválido (6 dígitos)" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(OTP_PENDING_COOKIE)?.value;

  if (!pendingToken || !isOtpPendingTokenValid(pendingToken)) {
    return NextResponse.json(
      { error: "Sesión de verificación expirada. Volvé a ingresar la contraseña." },
      { status: 401 }
    );
  }

  if (!verifyTotpCode(otp)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 401 });
  }

  try {
    await setTotpEnrolled(true);
  } catch {
    // Si falta la migración admin_settings, el login igual funciona
  }

  const sessionToken = createAdminSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ error: "No se pudo crear la sesión" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, authenticated: true });
  response.cookies.set(COOKIE_NAME, sessionToken, getAdminSessionCookieOptions());
  response.cookies.set(OTP_PENDING_COOKIE, "", { ...getOtpPendingCookieOptions(), maxAge: 0 });

  return response;
}
