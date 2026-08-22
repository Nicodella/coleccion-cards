"use client";

import type { ItemConCategoria } from "@/lib/catalog";
import { estaEnVenta, formatPrecio } from "@/lib/catalog";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";
import { mensajeConsultaCard, whatsappUrl } from "@/lib/whatsapp";

interface VentasSectionProps {
  items: ItemConCategoria[];
  telefono: string | null;
  onVerColeccion: (categoriaId: string) => void;
}

export default function VentasSection({
  items,
  telefono,
  onVerColeccion,
}: VentasSectionProps) {
  const enVenta = items.filter(estaEnVenta);
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
        <p>Cards disponibles para comprar — contactame por WhatsApp</p>
      </header>

      <div className="ventas-grid">
        {ordenados.map((item) => {
          const colores = resolveColores(item, item.categoriaNombre);
          const imagen = item.fotos[0]?.url ?? "/placeholder.svg";
          const precio = formatPrecio(item.precio);
          const waHref =
            telefono != null
              ? whatsappUrl(telefono, mensajeConsultaCard(item.nombre, precio))
              : null;

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
                {item.cantidad_venta > 1 && (
                  <p className="venta-stock">{item.cantidad_venta} disponibles</p>
                )}
                <div className="venta-footer">
                  {precio && <span className="venta-precio">{precio}</span>}
                  <div className="venta-actions">
                    {waHref && (
                      <a
                        className="venta-btn venta-btn-wa"
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      className="venta-btn"
                      onClick={() => onVerColeccion(item.categoriaId)}
                    >
                      Ver más
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
