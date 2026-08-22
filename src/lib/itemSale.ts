export function parseItemSaleFields(formData: FormData): {
  en_venta: boolean;
  precio: number | null;
  error?: string;
} {
  const en_venta = formData.get("en_venta") === "true";
  const precioRaw = formData.get("precio") as string;

  if (!en_venta) {
    return { en_venta: false, precio: null };
  }

  const precio = parseFloat(precioRaw);
  if (isNaN(precio) || precio < 0) {
    return { en_venta: true, precio: null, error: "Indicá un precio válido para la venta" };
  }

  return { en_venta: true, precio };
}

export function mapItemRow(row: {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | string | null;
  en_venta?: boolean | null;
  categoria_id: string;
  categorias: { nombre: string } | { nombre: string }[] | null;
  fotos: { id: string; url: string; orden: number }[] | null;
}) {
  const categoriaRaw = row.categorias;
  const categoria = Array.isArray(categoriaRaw) ? categoriaRaw[0] : categoriaRaw;
  const fotos = row.fotos ?? [];

  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? "",
    en_venta: Boolean(row.en_venta),
    precio: row.precio != null ? Number(row.precio) : null,
    categoria_id: row.categoria_id,
    categoria_nombre: categoria?.nombre ?? "",
    fotos: fotos.sort((a, b) => a.orden - b.orden),
  };
}
