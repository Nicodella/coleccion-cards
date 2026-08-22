import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { resolveColores } from "./categoryTheme";
import type { Categoria, Item, Perfil } from "./types";

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

function mapPublicItem(item: {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string | null;
  en_venta?: boolean | null;
  cantidad_venta?: number | null;
  fotos?: { id: string; url: string; orden: number }[] | null;
}): Item {
  const cantidad = Number(item.cantidad_venta ?? 0);
  const enVenta = Boolean(item.en_venta) && cantidad > 0;

  return {
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion ?? "",
    en_venta: enVenta,
    precio: enVenta && item.precio != null ? Number(item.precio) : null,
    cantidad_venta: cantidad,
    fotos: (item.fotos ?? []).sort((a, b) => a.orden - b.orden),
  };
}

export async function getCategoriasConItems(): Promise<Categoria[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createSupabaseClient();

  const { data: cats, error: catsError } = await supabase
    .from("categorias")
    .select(
      `
      id,
      nombre,
      color_accent,
      color_border,
      color_badge_bg,
      color_badge_text,
      emoji
    `
    )
    .order("nombre");

  if (catsError) {
    console.error("Error al cargar categorías:", catsError.message);
    return [];
  }

  const { data: items, error: itemsError } = await supabase.from("items").select(
    `
      id,
      nombre,
      descripcion,
      precio,
      en_venta,
      cantidad_venta,
      categoria_id,
      fotos ( id, url, orden ),
      item_categorias ( categoria_id )
    `
  );

  if (itemsError) {
    console.error("Error al cargar ítems:", itemsError.message);
    // Fallback: relación antigua 1 categoría
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
          cantidad_venta,
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
        items: (cat.items ?? []).map(mapPublicItem),
      };
    });
  }

  const itemRows = items ?? [];

  return (cats ?? []).map((cat) => {
    const colores = resolveColores(cat, cat.nombre);
    const catItems = itemRows
      .filter((item) => {
        const links = item.item_categorias ?? [];
        if (links.length > 0) {
          return links.some((l) => l.categoria_id === cat.id);
        }
        return item.categoria_id === cat.id;
      })
      .map(mapPublicItem);

    return {
      ...cat,
      ...colores,
      items: catItems,
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
