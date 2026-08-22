import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { mapItemRow, parseItemSaleFields } from "@/lib/itemSale";
import { saveItemImage } from "@/lib/imageStorage";
import { createSupabaseAdmin, getSupabaseConfigError } from "@/lib/supabase";

const ITEM_FIELDS = `
  id,
  nombre,
  descripcion,
  precio,
  en_venta,
  categoria_id,
  created_at,
  categorias ( nombre ),
  fotos ( id, url, orden )
`;

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_FIELDS)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(mapItemRow));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const formData = await request.formData();
  const categoria_id = formData.get("categoria_id") as string;
  const nombre = formData.get("nombre") as string;
  const descripcion = (formData.get("descripcion") as string) ?? "";
  const fotos = formData.getAll("fotos") as File[];
  const sale = parseItemSaleFields(formData);

  if (!categoria_id || !nombre?.trim()) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  if (sale.error) {
    return NextResponse.json({ error: sale.error }, { status: 400 });
  }

  if (fotos.length === 0) {
    return NextResponse.json({ error: "Subí al menos una foto" }, { status: 400 });
  }

  const uploadedUrls: string[] = [];

  try {
    for (const file of fotos) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await saveItemImage(buffer, file.name);
      uploadedUrls.push(url);
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir las imágenes";
    return NextResponse.json(
      {
        error: `No se pudieron subir las fotos: ${message}. Revisá Cloudinary en .env.local o usá el guardado local.`,
      },
      { status: 500 }
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: item, error: itemError } = await supabase
    .from("items")
    .insert({
      categoria_id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      en_venta: sale.en_venta,
      precio: sale.precio,
    })
    .select()
    .single();

  if (itemError || !item) {
    return NextResponse.json(
      { error: itemError?.message ?? "Error al crear ítem" },
      { status: 500 }
    );
  }

  const fotosRows = uploadedUrls.map((url, i) => ({
    item_id: item.id,
    url,
    orden: i,
  }));

  const { error: fotosError } = await supabase.from("fotos").insert(fotosRows);

  if (fotosError) {
    await supabase.from("items").delete().eq("id", item.id);
    return NextResponse.json({ error: fotosError.message }, { status: 500 });
  }

  return NextResponse.json({ ...item, fotos: fotosRows }, { status: 201 });
}
