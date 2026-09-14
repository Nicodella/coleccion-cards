-- Items de venta no pertenecen a ninguna categoría de colección
ALTER TABLE items
  ALTER COLUMN categoria_id DROP NOT NULL;
