-- Revierte migration-foto-crop.sql (ya no se usa recorte de fotos)
ALTER TABLE fotos
  DROP COLUMN IF EXISTS crop_x,
  DROP COLUMN IF EXISTS crop_y,
  DROP COLUMN IF EXISTS crop_w,
  DROP COLUMN IF EXISTS crop_h;
