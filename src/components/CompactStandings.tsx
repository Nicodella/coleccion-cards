"use client";

import { useEffect, useState } from "react";
import type { StandingRow } from "@/lib/footballStandings";

interface CompactStandingsProps {
  leagueId: number;
  leagueName: string;
}

export default function CompactStandings({ leagueId, leagueName }: CompactStandingsProps) {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/football/standings?league=${leagueId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Error al cargar");
        }

        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar posiciones");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  if (loading) {
    return <p className="standings-compact-msg">Cargando tabla...</p>;
  }

  if (error) {
    return <p className="standings-compact-msg standings-compact-error">{error}</p>;
  }

  if (rows.length === 0) {
    return <p className="standings-compact-msg">Sin datos de posiciones.</p>;
  }

  return (
    <div className="standings-compact">
      <p className="standings-compact-league">{leagueName}</p>
      <table className="standings-compact-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.position}-${row.team}`}>
              <td className="standings-compact-pos">{row.position}</td>
              <td className="standings-compact-team">
                <span className="standings-compact-team-inner">
                  {row.crest && (
                    <img
                      src={row.crest}
                      alt=""
                      className="standings-compact-crest"
                      loading="lazy"
                    />
                  )}
                  <span className="standings-compact-name">{row.team}</span>
                </span>
              </td>
              <td className="standings-compact-pts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
