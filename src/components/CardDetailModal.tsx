"use client";

import { useEffect, useState } from "react";
import type { ItemConCategoria } from "@/lib/catalog";
import { estaEnVenta, formatPrecio } from "@/lib/catalog";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";
import { mensajeConsultaCard, whatsappUrl } from "@/lib/whatsapp";

interface CardDetailModalProps {
  item: ItemConCategoria;
  telefono?: string | null;
  onClose: () => void;
}

export default function CardDetailModal({
  item,
  telefono,
  onClose,
}: CardDetailModalProps) {
  const fotos = item.fotos ?? [];
  const [fotoActiva, setFotoActiva] = useState(0);
  const colores = resolveColores(item, item.categoriaNombre);
  const enVenta = estaEnVenta(item);
  const precio = enVenta ? formatPrecio(item.precio) : null;
  const url = fotos[fotoActiva]?.url ?? "/placeholder.svg";
  const waHref =
    enVenta && telefono
      ? whatsappUrl(telefono, mensajeConsultaCard(item.nombre, precio))
      : null;

  useEffect(() => {
    setFotoActiva(0);
  }, [item.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && fotos.length > 1) {
        setFotoActiva((i) => (i + 1) % fotos.length);
      }
      if (e.key === "ArrowLeft" && fotos.length > 1) {
        setFotoActiva((i) => (i - 1 + fotos.length) % fotos.length);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, fotos.length]);

  return (
    <div
      className="card-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="card-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.nombre}
        style={themeStyle(colores)}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="card-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="card-modal-media">
          <img src={url} alt={item.nombre} />
          {fotos.length > 1 && (
            <>
              <button
                type="button"
                className="card-modal-nav card-modal-nav-prev"
                aria-label="Foto anterior"
                onClick={() =>
                  setFotoActiva((i) => (i - 1 + fotos.length) % fotos.length)
                }
              >
                ‹
              </button>
              <button
                type="button"
                className="card-modal-nav card-modal-nav-next"
                aria-label="Foto siguiente"
                onClick={() => setFotoActiva((i) => (i + 1) % fotos.length)}
              >
                ›
              </button>
              <div className="card-modal-dots" aria-hidden="true">
                {fotos.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className={i === fotoActiva ? "activa" : undefined}
                    onClick={() => setFotoActiva(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="card-modal-body">
          <span className="card-modal-badge">
            {colores.emoji} {item.categoriaNombre}
          </span>
          <h2>{item.nombre}</h2>
          {item.descripcion && <p className="card-modal-desc">{item.descripcion}</p>}

          {enVenta && (
            <div className="card-modal-venta">
              {precio && <span className="card-modal-precio">{precio}</span>}
              <span className="card-modal-stock">pesos uruguayos</span>
              {item.cantidad_venta > 1 && (
                <span className="card-modal-stock">
                  {item.cantidad_venta} disponibles
                </span>
              )}
            </div>
          )}

          <div className="card-modal-actions">
            {waHref && (
              <a
                className="card-modal-btn card-modal-btn-wa"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
              </a>
            )}
            <button type="button" className="card-modal-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
