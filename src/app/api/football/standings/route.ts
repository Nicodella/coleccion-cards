import { NextResponse } from "next/server";
import { fetchCompactStandings } from "@/lib/footballStandings";

export async function GET(request: Request) {
  const leagueId = Number(new URL(request.url).searchParams.get("league"));

  if (!leagueId || Number.isNaN(leagueId)) {
    return NextResponse.json({ error: "Liga inválida" }, { status: 400 });
  }

  try {
    const standings = await fetchCompactStandings(leagueId);
    return NextResponse.json(standings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al cargar posiciones";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
