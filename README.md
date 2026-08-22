# Colección de Cards Deportivas

Aplicación web con **Next.js**, **Supabase** (PostgreSQL) y **Cloudinary** para mostrar y administrar una colección de cards deportivas.

## Stack

- **Frontend:** Next.js 16 (App Router)
- **Base de datos:** Supabase / PostgreSQL
- **Imágenes:** Cloudinary
- **Hosting:** Vercel

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx          # Página pública (equivalente a index.tsx)
│   ├── admin/page.tsx    # Panel de administración
│   └── api/              # API Routes (login, categorías, ítems)
├── components/
│   ├── CardItem.tsx      # Card con carrusel de miniaturas
│   └── PerfilSection.tsx
└── lib/
    ├── supabase.ts       # Clientes Supabase
    ├── cloudinary.ts     # Subida de imágenes
    ├── data.ts           # Queries de lectura
    └── auth.ts           # Autenticación admin
supabase/
└── schema.sql            # Esquema SQL + datos de ejemplo
```

## Configuración

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Andá a **SQL Editor** y ejecutá el contenido de `supabase/schema.sql`
3. Copiá las credenciales desde **Settings → API**

### 2. Cloudinary

1. Creá una cuenta en [cloudinary.com](https://cloudinary.com)
2. Copiá **Cloud Name**, **API Key** y **API Secret** del dashboard

### 3. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores:

```bash
cp .env.local.example .env.local
```

### 4. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

- **Sitio público:** `/`
- **Panel admin:** `/admin` (contraseña definida en `ADMIN_PASSWORD`)

## Deploy en Vercel

1. Subí el repo a GitHub
2. Importá el proyecto en [vercel.com](https://vercel.com)
3. Agregá las mismas variables de entorno que en `.env.local`
4. Deploy automático en cada push

## Uso del panel admin

1. Ingresá con la contraseña de `ADMIN_PASSWORD`
2. **Agregar categoría:** escribí el nombre y guardá
3. **Agregar ítem:** seleccioná categoría, completá datos, subí fotos
   - Las fotos se suben a Cloudinary
   - Las URLs se guardan en Supabase

## Tablas en Supabase

| Tabla       | Campos                                      |
|-------------|---------------------------------------------|
| `perfil`    | id, nombre, direccion, telefono             |
| `categorias`| id, nombre                                  |
| `items`     | id, categoria_id, nombre, descripcion, precio |
| `fotos`     | id, item_id, url, orden                     |

Relaciones: perfil único → categorías → ítems → fotos (URLs de Cloudinary).
