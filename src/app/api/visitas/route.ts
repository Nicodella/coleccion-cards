import { NextResponse } from "next/server";
import {
  getClientIp,
  getVisitantesUnicos,
  isOwnerSession,
  isValidSeccion,
  registrarVisita,
} from "@/lib/visitas";
import { getSupabaseConfigError } from "@/lib/supabase";

/** Registra una visita (no cuenta al dueño logueado en el vestuario). */
export async function POST(request: Request) {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  if (await isOwnerSession()) {
    return NextResponse.json({ ok: true, skipped: "owner" });
  }

  let body: { seccion?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const seccion = typeof body.seccion === "string" ? body.seccion.trim() : "";
  if (!isValidSeccion(seccion)) {
    return NextResponse.json({ error: "Sección inválida" }, { status: 400 });
  }

  try {
    await registrarVisita(getClientIp(request), seccion);
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Contador público: visitantes únicos (IPs distintas). */
export async function GET() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ visitantes: 0 });
  }

  try {
    const visitantes = await getVisitantesUnicos();
    return NextResponse.json({ visitantes });
  } catch {
    return NextResponse.json({ visitantes: 0 });
  }
}
