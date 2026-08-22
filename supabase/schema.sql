-- Esquema para Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- Perfil único del coleccionista
CREATE TABLE IF NOT EXISTS perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categorías dinámicas
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  color_accent TEXT NOT NULL DEFAULT '#ffd700',
  color_border TEXT NOT NULL DEFAULT '#e6b800',
  color_badge_bg TEXT NOT NULL DEFAULT '#ffd700',
  color_badge_text TEXT NOT NULL DEFAULT '#0f3d1f',
  emoji TEXT NOT NULL DEFAULT '⚽',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ítems (categoria_id = categoría principal; también pueden tener varias vía item_categorias)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  precio NUMERIC(10, 2),
  en_venta BOOLEAN NOT NULL DEFAULT false,
  cantidad_venta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fotos de cada ítem (URLs de Cloudinary)
CREATE TABLE IF NOT EXISTS fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Multi-categoría
CREATE TABLE IF NOT EXISTS item_categorias (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, categoria_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_items_categoria ON items(categoria_id);
CREATE INDEX IF NOT EXISTS idx_fotos_item ON fotos(item_id);
CREATE INDEX IF NOT EXISTS idx_item_categorias_categoria ON item_categorias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_item_categorias_item ON item_categorias(item_id);

-- Row Level Security: lectura pública
ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública perfil" ON perfil FOR SELECT USING (true);
CREATE POLICY "Lectura pública categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública items" ON items FOR SELECT USING (true);
CREATE POLICY "Lectura pública fotos" ON fotos FOR SELECT USING (true);
CREATE POLICY "Lectura pública item_categorias" ON item_categorias FOR SELECT USING (true);

-- Config admin (2FA, etc.) — sin políticas públicas
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Datos iniciales
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
ON CONFLICT (nombre) DO NOTHING;
