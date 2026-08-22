import { readFileSync, readdirSync, existsSync } from "fs";
import { join, basename, extname } from "path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const FOLDER_TO_CATEGORIA = {
  penarol: "Peñarol",
  nacional: "Nacional",
  roma: "Roma",
  estudiantes: "Estudiantes",
  futbol: "Fútbol",
  fútbol: "Fútbol",
  mundiales: "Álbumes de mundiales",
  figuritas: "Figuritas viejas",
};

const PRECIOS = [15, 25, 35, 50, 75, 120, 200];

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    throw new Error("No existe .env.local — configurá Supabase y Cloudinary primero.");
  }

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function nombreDesdeArchivo(filename) {
  return basename(filename, extname(filename))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function listImages(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listImages(full);
    if (IMAGE_EXT.has(extname(entry.name).toLowerCase())) return [full];
    return [];
  });
}

async function uploadImage(buffer, filename) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "coleccion-cards/demo",
          public_id: `${Date.now()}-${basename(filename, extname(filename))}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Error al subir imagen"));
            return;
          }
          resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }
  if (!cloudName || !cloudKey || !cloudSecret) {
    throw new Error("Faltan credenciales de Cloudinary en .env.local");
  }

  cloudinary.config({ cloud_name: cloudName, api_key: cloudKey, api_secret: cloudSecret });

  const supabase = createClient(supabaseUrl, serviceKey);
  const demoRoot = join(process.cwd(), "demo-images");

  const { data: categorias, error: catError } = await supabase
    .from("categorias")
    .select("id, nombre");

  if (catError || !categorias?.length) {
    throw new Error(
      catError?.message ??
        "No hay categorías en Supabase. Ejecutá supabase/schema.sql en el SQL Editor."
    );
  }

  const catMap = new Map(categorias.map((c) => [c.nombre.toLowerCase(), c.id]));

  let creados = 0;
  let omitidos = 0;

  for (const [folder, categoriaNombre] of Object.entries(FOLDER_TO_CATEGORIA)) {
    const folderPath = join(demoRoot, folder);
    const images = listImages(folderPath);
    const categoriaId = catMap.get(categoriaNombre.toLowerCase());

    if (!categoriaId) {
      console.warn(`⚠️  Categoría "${categoriaNombre}" no existe — saltando carpeta ${folder}/`);
      continue;
    }

    if (images.length === 0) {
      console.log(`📁 ${folder}/ — sin imágenes`);
      continue;
    }

    console.log(`\n📂 ${folder}/ → ${categoriaNombre} (${images.length} imágenes)`);

    for (const imagePath of images) {
      const filename = basename(imagePath);
      const nombre = nombreDesdeArchivo(filename);
      const precio = PRECIOS[creados % PRECIOS.length];

      const { data: existente } = await supabase
        .from("items")
        .select("id")
        .eq("categoria_id", categoriaId)
        .eq("nombre", nombre)
        .maybeSingle();

      if (existente) {
        console.log(`   ⏭️  ${nombre} — ya existe`);
        omitidos++;
        continue;
      }

      const buffer = readFileSync(imagePath);
      const url = await uploadImage(buffer, filename);

      const { data: item, error: itemError } = await supabase
        .from("items")
        .insert({
          categoria_id: categoriaId,
          nombre,
          descripcion: `Ejemplo de ${categoriaNombre} — cargado desde demo-images/${folder}/`,
          precio,
        })
        .select()
        .single();

      if (itemError || !item) {
        console.error(`   ❌ ${nombre}: ${itemError?.message ?? "error"}`);
        continue;
      }

      const { error: fotoError } = await supabase.from("fotos").insert({
        item_id: item.id,
        url,
        orden: 0,
      });

      if (fotoError) {
        console.error(`   ❌ Foto ${nombre}: ${fotoError.message}`);
        continue;
      }

      console.log(`   ✅ ${nombre} — USD ${precio}`);
      creados++;
    }
  }

  console.log(`\n🏁 Listo: ${creados} cards creadas, ${omitidos} omitidas (duplicadas).`);
  console.log("   Abrí http://localhost:3000 para ver el álbum.\n");

  if (creados === 0 && omitidos === 0) {
    console.log("💡 Copiá tus fotos en demo-images/<equipo>/ y volvé a correr npm run seed:demo");
  }
}

main().catch((err) => {
  console.error("\n❌", err.message ?? err);
  process.exit(1);
});
