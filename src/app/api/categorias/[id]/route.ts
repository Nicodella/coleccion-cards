import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isValidHexColor, suggestColores } from "@/lib/categoryTheme";
import { createSupabaseAdmin, getSupabaseConfigError } from "@/lib/supabase";

const CATEGORIA_FIELDS =
  "id, nombre, color_accent, color_border, color_badge_bg, color_badge_text, emoji";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const updates: Record<string, string> = {};

  if (typeof body.nombre === "string" && body.nombre.trim()) {
    updates.nombre = body.nombre.trim();
  }

  const nombreRef =
    updates.nombre ?? (typeof body.nombre === "string" ? body.nombre : "");
  const suggested = suggestColores(nombreRef);

  if (typeof body.color_accent === "string" && isValidHexColor(body.color_accent)) {
    updates.color_accent = body.color_accent;
  }
  if (typeof body.color_border === "string" && isValidHexColor(body.color_border)) {
    updates.color_border = body.color_border;
  }
  if (typeof body.color_badge_bg === "string" && isValidHexColor(body.color_badge_bg)) {
    updates.color_badge_bg = body.color_badge_bg;
  }
  if (typeof body.color_badge_text === "string" && isValidHexColor(body.color_badge_text)) {
    updates.color_badge_text = body.color_badge_text;
  }
  if (typeof body.emoji === "string" && body.emoji.trim()) {
    updates.emoji = body.emoji.trim().slice(0, 8);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("categorias")
    .update(updates)
    .eq("id", id)
    .select(CATEGORIA_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    color_accent: data.color_accent ?? suggested.color_accent,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("categorias").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
