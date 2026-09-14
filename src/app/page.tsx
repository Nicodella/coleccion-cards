import CollectionShell from "@/components/CollectionShell";
import { asItemVenta, flattenItems } from "@/lib/catalog";
import { getCategoriasConItems, getItemsEnVenta, getPerfil } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [perfil, categorias, ventasRaw] = await Promise.all([
    getPerfil(),
    getCategoriasConItems(),
    getItemsEnVenta(),
  ]);

  const items = flattenItems(categorias);
  const itemsVenta = ventasRaw.map(asItemVenta);

  return (
    <CollectionShell
      perfil={perfil}
      categorias={categorias}
      items={items}
      itemsVenta={itemsVenta}
    />
  );
}
