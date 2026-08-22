-- Migración: colores dinámicos en categorías + datos de Rodrigo
-- Ejecutar en Supabase → SQL Editor (si ya tenés la base creada)

ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS color_accent TEXT NOT NULL DEFAULT '#ffd700',
  ADD COLUMN IF NOT EXISTS color_border TEXT NOT NULL DEFAULT '#e6b800',
  ADD COLUMN IF NOT EXISTS color_badge_bg TEXT NOT NULL DEFAULT '#ffd700',
  ADD COLUMN IF NOT EXISTS color_badge_text TEXT NOT NULL DEFAULT '#0f3d1f',
  ADD COLUMN IF NOT EXISTS emoji TEXT NOT NULL DEFAULT '⚽';

UPDATE perfil SET
  nombre = 'Rodrigo',
  direccion = 'Centro Montevideo, Pocitos (Lunes a viernes) o Parque Batlle domingos'
WHERE EXISTS (SELECT 1 FROM perfil LIMIT 1);

INSERT INTO perfil (nombre, direccion, telefono)
SELECT
  'Rodrigo',
  'Centro Montevideo, Pocitos (Lunes a viernes) o Parque Batlle domingos',
  '+598 99 123 456'
WHERE NOT EXISTS (SELECT 1 FROM perfil LIMIT 1);

INSERT INTO categorias (nombre, color_accent, color_border, color_badge_bg, color_badge_text, emoji) VALUES
  ('Peñarol', '#ffd700', '#ffd700', '#ffd700', '#1a1a1a', '🟡⚫'),
  ('Roma', '#ffd700', '#c8102e', '#ffd700', '#6b0f1f', '🟡🔴'),
  ('Estudiantes', '#ffffff', '#c8102e', '#ffffff', '#6b0f1f', '🔴⚪'),
  ('Nenes old school', '#d4a574', '#8b6914', '#d4a574', '#1a1208', '📼'),
  ('Albumes de mundiales', '#ffd700', '#1e56a0', '#ffd700', '#0d2d5e', '🏆')
ON CONFLICT (nombre) DO UPDATE SET
  color_accent = EXCLUDED.color_accent,
  color_border = EXCLUDED.color_border,
  color_badge_bg = EXCLUDED.color_badge_bg,
  color_badge_text = EXCLUDED.color_badge_text,
  emoji = EXCLUDED.emoji;
