# Imágenes de ejemplo

Copiá acá tus fotos para cargarlas al álbum con un solo comando.

## Estructura

```
demo-images/
├── penarol/       → categoría "Peñarol"
├── nacional/      → categoría "Nacional"
├── roma/          → categoría "Roma"
├── estudiantes/   → categoría "Estudiantes"
├── futbol/        → categoría "Fútbol"
├── mundiales/     → categoría "Álbumes de mundiales"
└── figuritas/     → categoría "Figuritas viejas"
```

Formatos: `.jpg`, `.jpeg`, `.png`, `.webp`

Cada archivo = 1 card en esa categoría. El nombre del archivo se usa como título (ej. `cavani-2011.jpg` → "cavani 2011").

## Cargar al álbum

```bash
npm run seed:demo
```

Requisitos: `.env.local` con Supabase y Cloudinary configurados, y las categorías creadas en Supabase (ejecutá `supabase/schema.sql` si es la primera vez).

Tus propias fotos: reemplazá o agregá archivos en las carpetas y volvé a correr el script.
