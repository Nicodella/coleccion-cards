import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function assertSupabaseConfig(): void {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }
}

/** Cliente público (lectura) — usar en Server Components */
export function createSupabaseClient(): SupabaseClient {
  assertSupabaseConfig();
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Cliente con service role (escritura admin) — solo en API Routes */
export function createSupabaseAdmin(): SupabaseClient {
  assertSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno");
  }
  return createClient(supabaseUrl, serviceKey);
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigError() === null;
}

export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseConfigError() === null;
}

const PLACEHOLDER_MARKERS = [
  "tu-proyecto",
  "xxxxx",
  "PENDIENTE",
  "tu-anon-key",
  "tu-service-role-key",
  "tu-cloud-name",
];

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker.toLowerCase()));
}

export function getSupabaseConfigError(): string | null {
  if (isPlaceholder(supabaseUrl) || !supabaseUrl.includes("supabase.co")) {
    return "Configurá NEXT_PUBLIC_SUPABASE_URL en .env.local (Settings → API → Project URL).";
  }
  if (isPlaceholder(supabaseAnonKey)) {
    return "Configurá NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local (Publishable key).";
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isPlaceholder(serviceKey)) {
    return "Configurá SUPABASE_SERVICE_ROLE_KEY en .env.local (Secret key).";
  }
  return null;
}
