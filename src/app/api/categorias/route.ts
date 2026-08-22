import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isValidHexColor, suggestColores } from "@/lib/categoryTheme";
import {
  createSupabaseAdmin,
  createSupabaseClient,
  getSupabaseConfigError,
} from "@/lib/supabase";

const CATEGORIA_FIELDS =
  "id, nombre, color_accent, color_border, color_badge_bg, color_badge_text, emoji";

function parseColores(body: Record<string, unknown>, nombre: string) {
  const suggested = suggestColores(nombre);

  const color_accent =
    typeof body.color_accent === "string" && isValidHexColor(body.color_accent)
      ? body.color_accent
      : suggested.color_accent;
  const color_border =
    typeof body.color_border === "string" && isValidHexColor(body.color_border)
      ? body.color_border
      : suggested.color_border;
  const color_badge_bg =
    typeof body.color_badge_bg === "string" && isValidHexColor(body.color_badge_bg)
      ? body.color_badge_bg
      : suggested.color_badge_bg;
  const color_badge_text =
    typeof body.color_badge_text === "string" && isValidHexColor(body.color_badge_text)
      ? body.color_badge_text
      : suggested.color_badge_text;
  const emoji =
    typeof body.emoji === "string" && body.emoji.trim()
      ? body.emoji.trim().slice(0, 8)
      : suggested.emoji;

  return { color_accent, color_border, color_badge_bg, color_badge_text, emoji };
}

export async function GET() {
  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("categorias")
    .select(CATEGORIA_FIELDS)
    .order("nombre");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const body = await request.json();
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";

  if (!nombre) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const colores = parseColores(body, nombre);
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("categorias")
    .insert({ nombre, ...colores })
    .select(CATEGORIA_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
