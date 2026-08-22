"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ItemConCategoria } from "@/lib/catalog";
import { estaEnVenta, formatPrecio } from "@/lib/catalog";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";

interface HeroCarouselProps {
  items: ItemConCategoria[];
  onVerColeccion: (categoriaId: string) => void;
  onVerCard?: (item: ItemConCategoria) => void;
}

function cardsVisibles(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

export default function HeroCarousel({
  items,
  onVerColeccion,
  onVerCard,
}: HeroCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(3);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [pausado, setPausado] = useState(false);

  const syncNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 8);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 8);
  }, []);

  const scrollStep = useCallback((dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".carousel-card");
    const gap = 16;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.85;

    if (dir === 1) {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: step, behavior: "smooth" });
      }
    } else {
      track.scrollBy({ left: -step, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const update = () => {
      setVisible(cardsVisibles());
      syncNav();
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [syncNav, items.length]);

  useEffect(() => {
    if (items.length <= visible || pausado) return;

    const timer = setInterval(() => scrollStep(1), 4500);
    return () => clearInterval(timer);
  }, [items.length, visible, pausado, scrollStep]);

  if (items.length === 0) {
    return (
      <div className="carousel-empty">
        <span className="carousel-empty-icon" aria-hidden="true">
          🏟️
        </span>
        <p>Todavía no hay cards para mostrar en el carrusel.</p>
        <p className="carousel-empty-hint">Agregá ítems desde el vestuario.</p>
      </div>
    );
  }

  return (
    <section
      className="carousel-multi"
      aria-label="Destacados del álbum"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="carousel-multi-header">
        <div>
          <span className="carousel-multi-kicker">⚽ Destacados</span>
          <h2 className="carousel-multi-title">Cards del álbum</h2>
        </div>
        {items.length > visible && (
          <div className="carousel-multi-nav">
            <button
              type="button"
              className="carousel-multi-arrow"
              aria-label="Ver anteriores"
              disabled={!canPrev}
              onClick={() => scrollStep(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-multi-arrow"
              aria-label="Ver siguientes"
              disabled={!canNext}
              onClick={() => scrollStep(1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className="carousel-multi-track"
        onScroll={syncNav}
      >
        {items.map((item) => {
          const colores = resolveColores(item, item.categoriaNombre);
          const imagen = item.fotos[0]?.url ?? "/placeholder.svg";
          const precio = estaEnVenta(item) ? formatPrecio(item.precio) : null;

          return (
            <article
              key={item.id}
              className="carousel-card"
              style={themeStyle(colores)}
            >
              <button
                type="button"
                className="carousel-card-hit"
                onClick={() =>
                  onVerCard ? onVerCard(item) : onVerColeccion(item.categoriaId)
                }
              >
                <div className="carousel-card-visual">
                  <img src={imagen} alt={item.nombre} loading="lazy" />
                  <span className="carousel-card-badge">
                    {colores.emoji} {item.categoriaNombre}
                  </span>
                </div>
                <div className="carousel-card-body">
                  <h3 className="carousel-card-nombre">{item.nombre}</h3>
                  {item.descripcion && (
                    <p className="carousel-card-desc">{item.descripcion}</p>
                  )}
                  {precio && <p className="carousel-card-precio">{precio}</p>}
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
