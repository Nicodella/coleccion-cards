"use client";

import { useEffect, useMemo, useState } from "react";
import CardItem from "@/components/CardItem";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";
import type { Categoria, Item } from "@/lib/types";

interface ColeccionViewProps {
  categoria: Categoria;
  categorias: Categoria[];
  index: number;
  onVerCard: (item: Item) => void;
  onCambiarCategoria: (categoriaId: string) => void;
}

export default function ColeccionView({
  categoria,
  categorias,
  index,
  onVerCard,
  onCambiarCategoria,
}: ColeccionViewProps) {
  const colores = resolveColores(categoria, categoria.nombre);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");

  useEffect(() => {
    setFiltroNombre("");
    setFiltroDescripcion("");
  }, [categoria.id]);

  const itemsFiltrados = useMemo(() => {
    const qNombre = filtroNombre.trim().toLowerCase();
    const qDesc = filtroDescripcion.trim().toLowerCase();

    return categoria.items.filter((item) => {
      if (qNombre && !item.nombre.toLowerCase().includes(qNombre)) return false;
      if (qDesc && !(item.descripcion ?? "").toLowerCase().includes(qDesc)) {
        return false;
      }
      return true;
    });
  }, [categoria.items, filtroNombre, filtroDescripcion]);

  const hayFiltroTexto = Boolean(filtroNombre.trim() || filtroDescripcion.trim());

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
          {hayFiltroTexto
            ? `${itemsFiltrados.length} de ${categoria.items.length}`
            : categoria.items.length}{" "}
          {categoria.items.length === 1 ? "card" : "cards"}
        </span>
      </div>

      <div className="coleccion-filtros">
        <label>
          <span>Categoría</span>
          <select
            value={categoria.id}
            onChange={(e) => onCambiarCategoria(e.target.value)}
          >
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Nombre</span>
          <input
            type="search"
            placeholder="Buscar por nombre…"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
        </label>
        <label>
          <span>Descripción</span>
          <input
            type="search"
            placeholder="Buscar en descripción…"
            value={filtroDescripcion}
            onChange={(e) => setFiltroDescripcion(e.target.value)}
          />
        </label>
        {hayFiltroTexto && (
          <button
            type="button"
            className="coleccion-filtros-limpiar"
            onClick={() => {
              setFiltroNombre("");
              setFiltroDescripcion("");
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {categoria.items.length === 0 ? (
        <p className="categoria-vacia">Sin fichajes en este equipo todavía…</p>
      ) : itemsFiltrados.length === 0 ? (
        <p className="categoria-vacia">Ninguna card coincide con la búsqueda.</p>
      ) : (
        <div className="cards-grid">
          {itemsFiltrados.map((item) => (
            <CardItem
              key={item.id}
              item={item}
              onOpen={() => onVerCard(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
