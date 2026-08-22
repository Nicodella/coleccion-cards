"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";

interface CardItemProps {
  item: Item;
}

export default function CardItem({ item }: CardItemProps) {
  const fotos = item.fotos ?? [];
  const [fotoActiva, setFotoActiva] = useState(0);
  const urlPrincipal = fotos[fotoActiva]?.url ?? "/placeholder.svg";

  return (
    <article className="card">
      <div className="card-frame">
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
          {item.en_venta && item.precio != null && (
            <div className="card-footer">
              <span className="card-precio-label">Valor</span>
              <p className="card-precio">
                {new Intl.NumberFormat("es-UY", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(item.precio)}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
