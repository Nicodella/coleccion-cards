"use client";

import type { ItemConCategoria } from "@/lib/catalog";
import { formatPrecio } from "@/lib/catalog";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";

interface VentasSectionProps {
  items: ItemConCategoria[];
  onVerColeccion: (categoriaId: string) => void;
}

export default function VentasSection({
  items,
  onVerColeccion,
}: VentasSectionProps) {
  const enVenta = items.filter((item) => item.en_venta && item.precio != null);
  const ordenados = [...enVenta].sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));

  if (ordenados.length === 0) {
    return (
      <div className="section-empty">
        <span aria-hidden="true">💰</span>
        <p>No hay ítems en venta todavía.</p>
      </div>
    );
  }

  return (
    <section className="ventas-section" aria-label="Ítems en venta">
      <header className="section-header">
        <h2>💰 Ventas</h2>
        <p>Cards disponibles para comprar — contactame para cerrar el trato</p>
      </header>

      <div className="ventas-grid">
        {ordenados.map((item) => {
          const colores = resolveColores(item, item.categoriaNombre);
          const imagen = item.fotos[0]?.url ?? "/placeholder.svg";
          const precio = formatPrecio(item.precio);

          return (
            <article
              key={item.id}
              className="venta-card"
              style={themeStyle(colores)}
            >
              <div className="venta-imagen-wrap">
                <img src={imagen} alt={item.nombre} loading="lazy" />
                <span className="venta-categoria">
                  {colores.emoji} {item.categoriaNombre}
                </span>
              </div>
              <div className="venta-body">
                <h3>{item.nombre}</h3>
                {item.descripcion && <p>{item.descripcion}</p>}
                <div className="venta-footer">
                  {precio && <span className="venta-precio">{precio}</span>}
                  <button
                    type="button"
                    className="venta-btn"
                    onClick={() => onVerColeccion(item.categoriaId)}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
