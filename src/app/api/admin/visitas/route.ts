import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseConfigError } from "@/lib/supabase";
import { getVisitantesUnicos, getVisitasPorSeccion } from "@/lib/visitas";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  try {
    const [visitantes, porSeccion] = await Promise.all([
      getVisitantesUnicos(),
      getVisitasPorSeccion(),
    ]);

    return NextResponse.json({ visitantes, porSeccion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar visitas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
