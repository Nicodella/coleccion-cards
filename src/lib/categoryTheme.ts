import type { CSSProperties } from "react";

export interface CategoriaColores {
  color_accent: string;
  color_border: string;
  color_badge_bg: string;
  color_badge_text: string;
  emoji: string;
}

export const DEFAULT_COLORES: CategoriaColores = {
  color_accent: "#ffd700",
  color_border: "#e6b800",
  color_badge_bg: "#ffd700",
  color_badge_text: "#0f3d1f",
  emoji: "⚽",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const PRESETS: [string[], CategoriaColores][] = [
  [
    ["penarol"],
    {
      color_accent: "#ffd700",
      color_border: "#ffd700",
      color_badge_bg: "#ffd700",
      color_badge_text: "#1a1a1a",
      emoji: "🟡⚫",
    },
  ],
  [
    ["roma"],
    {
      color_accent: "#ffd700",
      color_border: "#c8102e",
      color_badge_bg: "#ffd700",
      color_badge_text: "#6b0f1f",
      emoji: "🟡🔴",
    },
  ],
  [
    ["estudiantes"],
    {
      color_accent: "#ffffff",
      color_border: "#c8102e",
      color_badge_bg: "#ffffff",
      color_badge_text: "#6b0f1f",
      emoji: "🔴⚪",
    },
  ],
  [
    ["nenes", "old school", "vintage"],
    {
      color_accent: "#d4a574",
      color_border: "#8b6914",
      color_badge_bg: "#d4a574",
      color_badge_text: "#1a1208",
      emoji: "📼",
    },
  ],
  [
    ["mundial", "mundiales", "album"],
    {
      color_accent: "#ffd700",
      color_border: "#1e56a0",
      color_badge_bg: "#ffd700",
      color_badge_text: "#0d2d5e",
      emoji: "🏆",
    },
  ],
  [
    ["nacional"],
    {
      color_accent: "#ffffff",
      color_border: "#1e56a0",
      color_badge_bg: "#ffffff",
      color_badge_text: "#0d2d5e",
      emoji: "🔵⚪🔴",
    },
  ],
];

export function suggestColores(nombre: string): CategoriaColores {
  const normalized = normalize(nombre);

  for (const [keys, colores] of PRESETS) {
    if (keys.some((key) => normalized.includes(key))) {
      return colores;
    }
  }

  return { ...DEFAULT_COLORES };
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(255, 215, 0, ${alpha})`;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(255, 215, 0, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function resolveColores(
  categoria: Partial<CategoriaColores> | null | undefined,
  nombreFallback = ""
): CategoriaColores {
  if (categoria?.color_accent) {
    return {
      color_accent: categoria.color_accent,
      color_border: categoria.color_border ?? categoria.color_accent,
      color_badge_bg: categoria.color_badge_bg ?? categoria.color_accent,
      color_badge_text: categoria.color_badge_text ?? "#0f3d1f",
      emoji: categoria.emoji ?? "⚽",
    };
  }

  return suggestColores(nombreFallback);
}

export function themeStyle(colores: CategoriaColores): CSSProperties {
  return {
    "--team-accent": colores.color_accent,
    "--team-accent-dark": colores.color_border,
    "--team-border": colores.color_border,
    "--team-badge-bg": colores.color_badge_bg,
    "--team-badge-text": colores.color_badge_text,
    "--team-glow": hexToRgba(colores.color_accent, 0.35),
    "--team-stripe": hexToRgba(colores.color_accent, 0.2),
  } as CSSProperties;
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
