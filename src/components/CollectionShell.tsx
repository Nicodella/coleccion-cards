"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import FutbolPanel from "@/components/FutbolPanel";
import ColeccionView from "@/components/ColeccionView";
import ContactoSection from "@/components/ContactoSection";
import HeroCarousel from "@/components/HeroCarousel";
import VentasSection from "@/components/VentasSection";
import type { SectionId, ItemConCategoria } from "@/lib/catalog";
import { resolveColores, themeStyle } from "@/lib/categoryTheme";
import type { Categoria, Perfil } from "@/lib/types";

interface CollectionShellProps {
  perfil: Perfil | null;
  categorias: Categoria[];
  items: ItemConCategoria[];
}

function sectionLabel(section: SectionId, categorias: Categoria[]): string {
  if (section === "inicio") return "Inicio";
  if (section === "ventas") return "Ventas";
  if (section === "contacto") return "Contacto";
  const catId = section.replace("cat-", "");
  return categorias.find((c) => c.id === catId)?.nombre ?? "Colección";
}

export default function CollectionShell({
  perfil,
  categorias,
  items,
}: CollectionShellProps) {
  const [section, setSection] = useState<SectionId>("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [futbolAbierto, setFutbolAbierto] = useState(false);

  const irA = useCallback((destino: SectionId) => {
    setSection(destino);
    setMenuAbierto(false);
  }, []);

  const categoriaActiva = section.startsWith("cat-")
    ? categorias.find((c) => c.id === section.replace("cat-", ""))
    : null;

  const indiceCategoria = categoriaActiva
    ? categorias.findIndex((c) => c.id === categoriaActiva.id)
    : -1;

  const totalItems = items.length;
  const itemsEnVenta = items.filter((item) => item.en_venta);

  return (
    <div className="app-shell">
      {menuAbierto && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {futbolAbierto && (
        <button
          type="button"
          className="sidebar-backdrop futbol-backdrop"
          aria-label="Cerrar panel de fútbol"
          onClick={() => setFutbolAbierto(false)}
        />
      )}

      <aside className={`sidebar${menuAbierto ? " abierto" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-badge">⚽ ÁLBUM</span>
          <p className="sidebar-title">Mi Colección Futbolera</p>
          <p className="sidebar-stats">
            {categorias.length} colecciones · {totalItems} cards
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <button
            type="button"
            className={`sidebar-link${section === "inicio" ? " activo" : ""}`}
            onClick={() => irA("inicio")}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              🏠
            </span>
            Inicio
          </button>

          <p className="sidebar-group">Mis colecciones</p>

          {categorias.length === 0 ? (
            <p className="sidebar-empty">Sin colecciones aún</p>
          ) : (
            categorias.map((cat) => {
              const colores = resolveColores(cat, cat.nombre);
              const activo = section === `cat-${cat.id}`;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`sidebar-link sidebar-link-team${activo ? " activo" : ""}`}
                  style={themeStyle(colores)}
                  onClick={() => irA(`cat-${cat.id}`)}
                >
                  <span className="sidebar-link-icon" aria-hidden="true">
                    {colores.emoji}
                  </span>
                  <span className="sidebar-link-text">{cat.nombre}</span>
                  <span className="sidebar-link-count">{cat.items.length}</span>
                </button>
              );
            })
          )}

          <p className="sidebar-group">Más</p>

          <button
            type="button"
            className={`sidebar-link${section === "ventas" ? " activo" : ""}`}
            onClick={() => irA("ventas")}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              💰
            </span>
            Ventas
            {itemsEnVenta.length > 0 && (
              <span className="sidebar-link-count">{itemsEnVenta.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-link${section === "contacto" ? " activo" : ""}`}
            onClick={() => irA("contacto")}
          >
            <span className="sidebar-link-icon" aria-hidden="true">
              📞
            </span>
            Contacto
          </button>
        </nav>

        <Link href="/admin" className="sidebar-admin">
          🔐 Vestuario
        </Link>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Abrir menú"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            ☰
          </button>
          <div className="topbar-info">
            <span className="topbar-section">{sectionLabel(section, categorias)}</span>
            <h1 className="topbar-title">Mi Colección Futbolera</h1>
          </div>
          <button
            type="button"
            className="futbol-toggle"
            aria-label="Abrir resultados de fútbol"
            aria-expanded={futbolAbierto}
            onClick={() => setFutbolAbierto((v) => !v)}
          >
            ⚽ Resultados
          </button>
        </header>

        <div className="app-content" key={section}>
          {section === "inicio" && (
            <div className="inicio-view">
              <HeroCarousel items={items} onVerColeccion={(id) => irA(`cat-${id}`)} />
              {categorias.length > 0 && (
                <div className="inicio-colecciones">
                  <h2 className="inicio-subtitulo">Explorá tus colecciones</h2>
                  <div className="inicio-grid">
                    {categorias.map((cat) => {
                      const colores = resolveColores(cat, cat.nombre);

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className="inicio-card"
                          style={themeStyle(colores)}
                          onClick={() => irA(`cat-${cat.id}`)}
                        >
                          <div className="inicio-card-visual">
                            <span className="inicio-card-placeholder">
                              {colores.emoji}
                            </span>
                          </div>
                          <div className="inicio-card-info">
                            <span>
                              {colores.emoji} {cat.nombre}
                            </span>
                            <small>{cat.items.length} cards</small>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {categoriaActiva && indiceCategoria >= 0 && (
            <ColeccionView categoria={categoriaActiva} index={indiceCategoria} />
          )}

          {section === "ventas" && (
            <VentasSection items={itemsEnVenta} onVerColeccion={(id) => irA(`cat-${id}`)} />
          )}

          {section === "contacto" && <ContactoSection perfil={perfil} />}
        </div>

        <footer className="footer app-footer">
          <span className="footer-ball" aria-hidden="true">
            ⚽
          </span>
          <p>Colección personal · Rodrigo</p>
        </footer>
      </div>

      <FutbolPanel
        mobileOpen={futbolAbierto}
        onClose={() => setFutbolAbierto(false)}
      />
    </div>
  );
}
