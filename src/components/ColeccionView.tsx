"use client";

import CardItem from "@/components/CardItem";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";
import type { Categoria } from "@/lib/types";

interface ColeccionViewProps {
  categoria: Categoria;
  index: number;
}

export default function ColeccionView({ categoria, index }: ColeccionViewProps) {
  const colores = resolveColores(categoria, categoria.nombre);

  return (
    <section
      className="categoria categoria-view"
      style={themeStyle(colores)}
      aria-label={`Colección ${categoria.nombre}`}
    >
      <div className="categoria-header">
        <span className="categoria-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="categoria-emoji" aria-hidden="true">
          {colores.emoji}
        </span>
        <h2 className="categoria-titulo">{categoria.nombre}</h2>
        <span className="categoria-count">
          {categoria.items.length}{" "}
          {categoria.items.length === 1 ? "card" : "cards"}
        </span>
      </div>

      {categoria.items.length === 0 ? (
        <p className="categoria-vacia">Sin fichajes en este equipo todavía…</p>
      ) : (
        <div className="cards-grid">
          {categoria.items.map((item) => (
            <CardItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
