import type { Item, CategoriaColores } from "./types";

export type SectionId = "inicio" | "ventas" | "contacto" | `cat-${string}`;

export interface ItemConCategoria extends Item, CategoriaColores {
  categoriaId: string;
  categoriaNombre: string;
}

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
  return categorias.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoriaId: cat.id,
      categoriaNombre: cat.nombre,
      color_accent: cat.color_accent,
      color_border: cat.color_border,
      color_badge_bg: cat.color_badge_bg,
      color_badge_text: cat.color_badge_text,
      emoji: cat.emoji,
    }))
  );
}

export function formatPrecio(precio: number | null): string | null {
  if (precio == null) return null;
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(precio);
}
