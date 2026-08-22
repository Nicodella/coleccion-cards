import { NextResponse } from "next/server";
import {
  createOtpPendingToken,
  getOtpPendingCookieOptions,
  OTP_PENDING_COOKIE,
} from "@/lib/adminPending";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no configurada en el servidor" },
      { status: 503 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const pendingToken = createOtpPendingToken();
  if (!pendingToken) {
    return NextResponse.json({ error: "No se pudo iniciar la verificación" }, { status: 500 });
  }

  const response = NextResponse.json({
    ok: true,
    requiresOtp: true,
  });

  response.cookies.set(OTP_PENDING_COOKIE, pendingToken, getOtpPendingCookieOptions());

  return response;
}
