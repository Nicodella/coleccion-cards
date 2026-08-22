import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uploadImage as uploadToCloudinary } from "./cloudinary";

const PLACEHOLDER_MARKERS = ["tu-cloud-name", "tu-api-key", "tu-api-secret"];

function isPlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m));
}

export function isCloudinaryConfigured(): boolean {
  return (
    !isPlaceholder(process.env.CLOUDINARY_CLOUD_NAME) &&
    !isPlaceholder(process.env.CLOUDINARY_API_KEY) &&
    !isPlaceholder(process.env.CLOUDINARY_API_SECRET)
  );
}

export function getImageStorageHint(): string | null {
  if (isCloudinaryConfigured()) return null;
  return "Cloudinary no configurado — las fotos se guardan en public/uploads/ (local).";
}

async function saveLocalImage(buffer: Buffer, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(filename) || ".jpg";
  const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeName = `${Date.now()}-${base}${ext}`;

  await writeFile(path.join(uploadsDir, safeName), buffer);
  return `/uploads/${safeName}`;
}

export async function saveItemImage(buffer: Buffer, filename: string): Promise<string> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, filename);
  }
  return saveLocalImage(buffer, filename);
}
