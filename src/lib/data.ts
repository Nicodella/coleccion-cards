import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { resolveColores } from "./categoryTheme";
import type { Categoria, Perfil } from "./types";

export async function getPerfil(): Promise<Perfil | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("perfil").select("*").limit(1).single();

  if (error) {
    console.error("Error al cargar perfil:", error.message);
    return null;
  }

  return data;
}

export async function getCategoriasConItems(): Promise<Categoria[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("categorias")
    .select(
      `
      id,
      nombre,
      color_accent,
      color_border,
      color_badge_bg,
      color_badge_text,
      emoji,
      items (
        id,
        nombre,
        descripcion,
        precio,
        en_venta,
        fotos ( id, url, orden )
      )
    `
    )
    .order("nombre");

  if (error) {
    console.error("Error al cargar categorías:", error.message);
    return [];
  }

  return (data ?? []).map((cat) => {
    const colores = resolveColores(cat, cat.nombre);
    return {
      ...cat,
      ...colores,
      items: (cat.items ?? []).map((item) => ({
        ...item,
        en_venta: Boolean(item.en_venta),
        precio: item.precio != null ? Number(item.precio) : null,
        fotos: (item.fotos ?? []).sort((a, b) => a.orden - b.orden),
      })),
    };
  });
}

export async function getCategoriasSimples() {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("categorias")
    .select(
      "id, nombre, color_accent, color_border, color_badge_bg, color_badge_text, emoji"
    )
    .order("nombre");

  if (error) return [];
  return (data ?? []).map((cat) => ({
    ...cat,
    ...resolveColores(cat, cat.nombre),
  }));
}
