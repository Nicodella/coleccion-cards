"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";
import { estaEnVenta, formatPrecio } from "@/lib/catalog";

interface CardItemProps {
  item: Item;
  onOpen?: () => void;
}

export default function CardItem({ item, onOpen }: CardItemProps) {
  const fotos = item.fotos ?? [];
  const [fotoActiva, setFotoActiva] = useState(0);
  const urlPrincipal = fotos[fotoActiva]?.url ?? "/placeholder.svg";
  const precio = estaEnVenta(item) ? formatPrecio(item.precio) : null;

  return (
    <article className="card">
      <div
        className={`card-frame${onOpen ? " card-frame-clickable" : ""}`}
        role={onOpen ? "button" : undefined}
        tabIndex={onOpen ? 0 : undefined}
        onClick={onOpen}
        onKeyDown={
          onOpen
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen();
                }
              }
            : undefined
        }
      >
        <div className="card-shine" aria-hidden="true" />
        <div className="card-imagen-container">
          <span className="card-rarity">★ RARE</span>
          <img
            className="card-imagen-principal"
            src={urlPrincipal}
            alt={item.nombre}
            loading="lazy"
          />
        </div>

        {fotos.length > 1 && (
          <div
            className="card-miniaturas"
            role="tablist"
            aria-label={`Fotos de ${item.nombre}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {fotos.map((foto, index) => (
              <button
                key={foto.id}
                type="button"
                className={`card-miniatura${index === fotoActiva ? " activa" : ""}`}
                role="tab"
                aria-selected={index === fotoActiva}
                aria-label={`Ver foto ${index + 1}`}
                onClick={() => setFotoActiva(index)}
              >
                <img src={foto.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="card-contenido">
          <h3 className="card-nombre">{item.nombre}</h3>
          {item.descripcion && (
            <p className="card-descripcion">{item.descripcion}</p>
          )}
          {precio && (
            <div className="card-footer">
              <span className="card-precio-label">Valor</span>
              <p className="card-precio">{precio}</p>
            </div>
          )}
          {onOpen && <span className="card-ver-hint">Ver detalle</span>}
        </div>
      </div>
    </article>
  );
}
