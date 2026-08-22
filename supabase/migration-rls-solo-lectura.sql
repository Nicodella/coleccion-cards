-- Refuerzo RLS: solo lectura pública con anon key.
-- Ejecutar en Supabase SQL Editor si querés asegurarte de que nadie escriba
-- directo a la DB con la clave pública (sin pasar por tu API).

ALTER TABLE perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública perfil" ON perfil;
DROP POLICY IF EXISTS "Lectura pública categorias" ON categorias;
DROP POLICY IF EXISTS "Lectura pública items" ON items;
DROP POLICY IF EXISTS "Lectura pública fotos" ON fotos;

CREATE POLICY "Lectura pública perfil" ON perfil FOR SELECT USING (true);
CREATE POLICY "Lectura pública categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura pública items" ON items FOR SELECT USING (true);
CREATE POLICY "Lectura pública fotos" ON fotos FOR SELECT USING (true);

-- Sin políticas INSERT/UPDATE/DELETE → el rol anon no puede modificar nada.
