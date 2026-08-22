import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  mapItemRow,
  parseCategoriaIds,
  parseItemSaleFields,
} from "@/lib/itemSale";
import { saveItemImage } from "@/lib/imageStorage";
import { createSupabaseAdmin, getSupabaseConfigError } from "@/lib/supabase";

type RouteContext = { params: Promise<{ id: string }> };

async function syncItemCategorias(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  itemId: string,
  categoriaIds: string[]
) {
  await supabase.from("item_categorias").delete().eq("item_id", itemId);
  if (categoriaIds.length === 0) return;

  const { error } = await supabase.from("item_categorias").insert(
    categoriaIds.map((categoria_id) => ({
      item_id: itemId,
      categoria_id,
    }))
  );
  if (error) throw new Error(error.message);
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const categoriaIds = parseCategoriaIds(formData);
  const nombre = formData.get("nombre") as string;
  const descripcion = (formData.get("descripcion") as string) ?? "";
  const fotos = (formData.getAll("fotos") as File[]).filter(
    (f) => f && typeof f === "object" && "size" in f && f.size > 0
  );
  const sale = parseItemSaleFields(formData);

  if (categoriaIds.length === 0 || !nombre?.trim()) {
    return NextResponse.json(
      { error: "Seleccioná al menos una categoría y un nombre" },
      { status: 400 }
    );
  }

  if (sale.error) {
    return NextResponse.json({ error: sale.error }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const { data: existing, error: fetchError } = await supabase
    .from("items")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Card no encontrada" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("items")
    .update({
      categoria_id: categoriaIds[0],
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      en_venta: sale.en_venta,
      precio: sale.precio,
      cantidad_venta: sale.cantidad_venta,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    await syncItemCategorias(supabase, id, categoriaIds);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error en categorías";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (fotos.length > 0) {
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
        { error: `No se pudieron subir las fotos: ${message}` },
        { status: 500 }
      );
    }

    const { error: deleteFotosError } = await supabase
      .from("fotos")
      .delete()
      .eq("item_id", id);

    if (deleteFotosError) {
      return NextResponse.json({ error: deleteFotosError.message }, { status: 500 });
    }

    const fotosRows = uploadedUrls.map((url, i) => ({
      item_id: id,
      url,
      orden: i,
    }));

    const { error: insertFotosError } = await supabase.from("fotos").insert(fotosRows);

    if (insertFotosError) {
      return NextResponse.json({ error: insertFotosError.message }, { status: 500 });
    }
  }

  const { data: item, error: finalError } = await supabase
    .from("items")
    .select(
      `
      id,
      nombre,
      descripcion,
      precio,
      en_venta,
      cantidad_venta,
      categoria_id,
      categorias!items_categoria_id_fkey ( nombre ),
      item_categorias ( categoria_id, categorias!item_categorias_categoria_id_fkey ( nombre ) ),
      fotos ( id, url, orden )
    `
    )
    .eq("id", id)
    .single();

  if (finalError || !item) {
    return NextResponse.json(
      { error: finalError?.message ?? "Error al cargar ítem actualizado" },
      { status: 500 }
    );
  }

  return NextResponse.json(mapItemRow(item));
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
