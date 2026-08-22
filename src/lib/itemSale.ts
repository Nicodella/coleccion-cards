export function parseItemSaleFields(formData: FormData): {
  en_venta: boolean;
  precio: number | null;
  cantidad_venta: number;
  error?: string;
} {
  const quiereVender = formData.get("en_venta") === "true";
  const precioRaw = formData.get("precio") as string;
  const cantidadRaw = formData.get("cantidad_venta") as string;

  if (!quiereVender) {
    return { en_venta: false, precio: null, cantidad_venta: 0 };
  }

  const precio = parseFloat(precioRaw);
  if (isNaN(precio) || precio < 0) {
    return {
      en_venta: true,
      precio: null,
      cantidad_venta: 0,
      error: "Indicá un precio válido para la venta",
    };
  }

  const cantidad = parseInt(cantidadRaw, 10);
  if (isNaN(cantidad) || cantidad < 0) {
    return {
      en_venta: true,
      precio,
      cantidad_venta: 0,
      error: "Indicá cuántas repetidas tenés para vender",
    };
  }

  // Stock 0 → sale de la lista de ventas
  if (cantidad === 0) {
    return { en_venta: false, precio: null, cantidad_venta: 0 };
  }

  return { en_venta: true, precio, cantidad_venta: cantidad };
}

export function parseCategoriaIds(formData: FormData): string[] {
  const raw = formData.getAll("categoria_ids").map(String).filter(Boolean);
  if (raw.length > 0) return [...new Set(raw)];

  const single = formData.get("categoria_id");
  return typeof single === "string" && single ? [single] : [];
}

export function mapItemRow(row: {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string | null;
  en_venta?: boolean | null;
  cantidad_venta?: number | null;
  categoria_id: string;
  categorias: { nombre: string } | { nombre: string }[] | null;
  item_categorias?:
    | { categoria_id: string; categorias?: { nombre: string } | { nombre: string }[] | null }[]
    | null;
  fotos: { id: string; url: string; orden: number }[] | null;
}) {
  const categoriaRaw = row.categorias;
  const categoria = Array.isArray(categoriaRaw) ? categoriaRaw[0] : categoriaRaw;
  const fotos = row.fotos ?? [];

  const links = row.item_categorias ?? [];
  const categoria_ids =
    links.length > 0
      ? links.map((l) => l.categoria_id)
      : row.categoria_id
        ? [row.categoria_id]
        : [];

  const nombresExtra = links
    .map((l) => {
      const c = Array.isArray(l.categorias) ? l.categorias[0] : l.categorias;
      return c?.nombre;
    })
    .filter((n): n is string => Boolean(n));

  const categoria_nombres =
    nombresExtra.length > 0
      ? [...new Set(nombresExtra)].join(", ")
      : categoria?.nombre ?? "";

  const cantidad = Number(row.cantidad_venta ?? 0);
  const enVentaFlag = Boolean(row.en_venta) && cantidad > 0;

  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? "",
    en_venta: enVentaFlag,
    precio: enVentaFlag && row.precio != null ? Number(row.precio) : null,
    cantidad_venta: cantidad,
    categoria_id: row.categoria_id,
    categoria_ids,
    categoria_nombre: categoria_nombres || categoria?.nombre || "",
    fotos: fotos.sort((a, b) => a.orden - b.orden),
  };
}
