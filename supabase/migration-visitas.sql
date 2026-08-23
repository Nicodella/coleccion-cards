-- Contador de visitas (IPs distintas + sección)
-- Ejecutar en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  seccion TEXT NOT NULL,
  dia DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ip_hash, seccion, dia)
);

CREATE INDEX IF NOT EXISTS idx_visitas_dia ON visitas(dia DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_seccion ON visitas(seccion);
CREATE INDEX IF NOT EXISTS idx_visitas_ip_hash ON visitas(ip_hash);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
-- Sin políticas públicas: solo service role (API del servidor)
