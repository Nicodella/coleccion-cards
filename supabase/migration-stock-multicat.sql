-- Cantidad de repetidas en venta + multi-categoría

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS cantidad_venta INTEGER NOT NULL DEFAULT 0;

-- Si estaba en venta sin stock, dejamos al menos 1 para no sacarlos de golpe
UPDATE items
SET cantidad_venta = 1
WHERE en_venta = true AND (cantidad_venta IS NULL OR cantidad_venta = 0);

CREATE TABLE IF NOT EXISTS item_categorias (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, categoria_id)
);

CREATE INDEX IF NOT EXISTS idx_item_categorias_categoria ON item_categorias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_item_categorias_item ON item_categorias(item_id);

-- Migrar vínculos actuales (1 categoría por card)
INSERT INTO item_categorias (item_id, categoria_id)
SELECT id, categoria_id FROM items
ON CONFLICT DO NOTHING;

ALTER TABLE item_categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública item_categorias" ON item_categorias;
CREATE POLICY "Lectura pública item_categorias"
  ON item_categorias FOR SELECT USING (true);
