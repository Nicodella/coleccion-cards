"use client";

import { useEffect, useState } from "react";
import CompactStandings from "@/components/CompactStandings";
import {
  buildFootballWidgetUrl,
  FOOTBALL_LEAGUES,
  VIEW_HEIGHTS,
  VIEW_LABELS,
  type FootballLeague,
  type FootballView,
} from "@/lib/footballWidgets";

interface FutbolPanelProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function FutbolPanel({ mobileOpen = false, onClose }: FutbolPanelProps) {
  const [liga, setLiga] = useState<FootballLeague>(FOOTBALL_LEAGUES[0]);
  const [vista, setVista] = useState<FootballView>("standings");

  const widgetUrl = buildFootballWidgetUrl(liga, vista);
  const widgetHeight = VIEW_HEIGHTS[vista];

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://footballdata.io") return;
      const data = event.data as { fbwidget?: boolean; height?: number };
      if (!data?.fbwidget || !data.height) return;

      document.querySelectorAll<HTMLIFrameElement>(".fbwidget").forEach((frame) => {
        if (frame.contentWindow === event.source) {
          frame.style.height = `${data.height}px`;
        }
      });
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <aside
      className={`futbol-panel${mobileOpen ? " futbol-panel-open" : ""}`}
      aria-label="Resultados de fútbol"
    >
      <div className="futbol-panel-header">
        <div>
          <span className="futbol-panel-badge">⚽ EN VIVO</span>
          <h2 className="futbol-panel-title">Fútbol</h2>
          <p className="futbol-panel-sub">Datos en vivo · Footballdata.io</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="futbol-panel-close"
            aria-label="Cerrar panel"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      <div className="futbol-ligas" role="tablist" aria-label="Ligas">
        {FOOTBALL_LEAGUES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`futbol-liga-btn${liga.id === item.id ? " activo" : ""}`}
            aria-selected={liga.id === item.id}
            onClick={() => setLiga(item)}
            title={item.name}
          >
            <span className="futbol-liga-flag" aria-hidden="true">
              {item.flag}
            </span>
            <span className="futbol-liga-label">{item.shortName}</span>
          </button>
        ))}
      </div>

      <p className="futbol-liga-nombre">
        {liga.flag} {liga.name}
      </p>

      <div className="futbol-vistas" role="tablist" aria-label="Tipo de datos">
        {(Object.keys(VIEW_LABELS) as FootballView[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`futbol-vista-btn${vista === key ? " activo" : ""}`}
            aria-selected={vista === key}
            onClick={() => setVista(key)}
          >
            {VIEW_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="futbol-widget-wrap">
        {vista === "standings" ? (
          <CompactStandings leagueId={liga.leagueId} leagueName={liga.name} />
        ) : (
          <iframe
            key={`${liga.id}-${vista}`}
            src={widgetUrl}
            title={`${liga.name} — ${VIEW_LABELS[vista]}`}
            className="futbol-widget fbwidget"
            style={{ height: widgetHeight }}
            loading="lazy"
            scrolling="no"
          />
        )}
      </div>

      <a
        href="https://footballdata.io/widgets/"
        target="_blank"
        rel="noopener noreferrer"
        className="futbol-sofascore-link"
      >
        Más widgets en Footballdata.io →
      </a>
    </aside>
  );
}
