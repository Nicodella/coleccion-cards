import { createHash } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase";

const SECCIONES_VALIDAS = /^(inicio|ventas|contacto|cat-[0-9a-f-]{36})$/i;

export function hashIp(ip: string): string {
  const salt = process.env.ADMIN_PASSWORD?.trim() || "coleccion-cards";
  return createHash("sha256").update(`${salt}:visita:${ip}`).digest("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

export function isValidSeccion(seccion: string): boolean {
  return SECCIONES_VALIDAS.test(seccion);
}

export async function isOwnerSession(): Promise<boolean> {
  return isAdminAuthenticated();
}

export async function registrarVisita(ip: string, seccion: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const ip_hash = hashIp(ip);
  const dia = new Date().toISOString().slice(0, 10);

  await supabase.from("visitas").upsert(
    { ip_hash, seccion, dia },
    { onConflict: "ip_hash,seccion,dia", ignoreDuplicates: true }
  );
}

export async function getVisitantesUnicos(): Promise<number> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from("visitas").select("ip_hash");
  if (error || !data) return 0;
  return new Set(data.map((r) => r.ip_hash)).size;
}

export async function getVisitasPorSeccion(): Promise<
  { seccion: string; visitas: number; ips: number }[]
> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("visitas")
    .select("seccion, ip_hash");

  if (error || !data) return [];

  const map = new Map<string, { count: number; ips: Set<string> }>();
  for (const row of data) {
    const cur = map.get(row.seccion) ?? { count: 0, ips: new Set<string>() };
    cur.count += 1;
    cur.ips.add(row.ip_hash);
    map.set(row.seccion, cur);
  }

  return [...map.entries()]
    .map(([seccion, v]) => ({
      seccion,
      visitas: v.count,
      ips: v.ips.size,
    }))
    .sort((a, b) => b.visitas - a.visitas);
}
