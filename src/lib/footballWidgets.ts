export type FootballView = "standings" | "top-scorers" | "fixtures";

export interface FootballLeague {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  /** ID público en footballdata.io */
  leagueId: number;
  externalUrl: string;
}

/** Ligas disponibles en footballdata.io/widgets (sin API key). */
export const FOOTBALL_LEAGUES: FootballLeague[] = [
  {
    id: "arg",
    name: "Argentina",
    shortName: "ARG",
    flag: "🇦🇷",
    leagueId: 58,
    externalUrl: "https://footballdata.io/",
  },
  {
    id: "uru",
    name: "Uruguay",
    shortName: "URU",
    flag: "🇺🇾",
    leagueId: 110,
    externalUrl: "https://footballdata.io/",
  },
  {
    id: "ita",
    name: "Italia",
    shortName: "ITA",
    flag: "🇮🇹",
    leagueId: 14,
    externalUrl: "https://footballdata.io/",
  },
  {
    id: "esp",
    name: "España",
    shortName: "ESP",
    flag: "🇪🇸",
    leagueId: 10,
    externalUrl: "https://footballdata.io/",
  },
  {
    id: "eng",
    name: "Inglaterra",
    shortName: "ENG",
    flag: "🇬🇧",
    leagueId: 15,
    externalUrl: "https://footballdata.io/",
  },
  {
    id: "bra",
    name: "Brasil",
    shortName: "BRA",
    flag: "🇧🇷",
    leagueId: 29,
    externalUrl: "https://footballdata.io/",
  },
];

export const VIEW_LABELS: Record<FootballView, string> = {
  standings: "Posiciones",
  "top-scorers": "Goleadores",
  fixtures: "Partidos",
};

/** Altura inicial recomendada por footballdata.io */
export const VIEW_HEIGHTS: Record<FootballView, number> = {
  standings: 640,
  "top-scorers": 470,
  fixtures: 470,
};

export function buildFootballWidgetUrl(
  league: FootballLeague,
  view: FootballView
): string {
  const params = new URLSearchParams({
    league: String(league.leagueId),
    theme: "dark",
    accent: "3cb371",
  });

  if (view === "fixtures") {
    params.set("type", "upcoming");
  }

  return `https://footballdata.io/widget/${view}?${params}`;
}
