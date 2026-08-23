import type { Item, CategoriaColores } from "./types";

export type SectionId = "inicio" | "ventas" | `cat-${string}`;

export interface ItemConCategoria extends Item, CategoriaColores {
  categoriaId: string;
  categoriaNombre: string;
}

/** Aplana categorías → items únicos (para carrusel / ventas). */
export function flattenItems(
  categorias: {
    id: string;
    nombre: string;
    color_accent: string;
    color_border: string;
    color_badge_bg: string;
    color_badge_text: string;
    emoji: string;
    items: Item[];
  }[]
): ItemConCategoria[] {
  const seen = new Set<string>();
  const result: ItemConCategoria[] = [];

  for (const cat of categorias) {
    for (const item of cat.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.push({
        ...item,
        categoriaId: cat.id,
        categoriaNombre: cat.nombre,
        color_accent: cat.color_accent,
        color_border: cat.color_border,
        color_badge_bg: cat.color_badge_bg,
        color_badge_text: cat.color_badge_text,
        emoji: cat.emoji,
      });
    }
  }

  return result;
}

export function formatPrecio(precio: number | null): string | null {
  if (precio == null) return null;
  const monto = new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(precio);
  return `$ ${monto}`;
}

/** Disponible en la lista de ventas: marcado + precio + stock > 0 */
export function estaEnVenta(item: {
  en_venta: boolean;
  precio: number | null;
  cantidad_venta?: number;
}): boolean {
  return (
    Boolean(item.en_venta) &&
    item.precio != null &&
    (item.cantidad_venta ?? 0) > 0
  );
}
