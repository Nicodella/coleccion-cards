-- Ejecutar en Supabase SQL Editor

ALTER TABLE items
  ADD COLUMN IF NOT EXISTS en_venta BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE items
  ALTER COLUMN precio DROP NOT NULL;

-- Cards con precio cargado pasan a "en venta"
UPDATE items
SET en_venta = true
WHERE precio IS NOT NULL AND precio > 0;
