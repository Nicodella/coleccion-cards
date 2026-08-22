export interface StandingRow {
  position: number;
  team: string;
  crest: string | null;
  points: number;
}

export async function fetchCompactStandings(leagueId: number): Promise<StandingRow[]> {
  const url = `https://footballdata.io/widget/standings?league=${leagueId}&theme=dark&accent=3cb371`;
  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    throw new Error("No se pudieron cargar las posiciones");
  }

  const html = await res.text();
  const rows: StandingRow[] = [];
  const rowPattern =
    /<tr><td class="fbw-pos">(\d+)<\/td><td class="fbw-l">[\s\S]*?<img src="([^"]+)"[\s\S]*?<span>([^<]+)<\/span>[\s\S]*?<td class="fbw-pts">(\d+)<\/td><\/tr>/g;

  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(html)) !== null) {
    rows.push({
      position: Number(match[1]),
      crest: match[2].trim(),
      team: match[3].trim(),
      points: Number(match[4]),
    });
  }

  return rows;
}
