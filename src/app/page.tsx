import CollectionShell from "@/components/CollectionShell";
import { flattenItems } from "@/lib/catalog";
import { getCategoriasConItems, getPerfil } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [perfil, categorias] = await Promise.all([
    getPerfil(),
    getCategoriasConItems(),
  ]);

  const items = flattenItems(categorias);

  return (
    <CollectionShell
      perfil={perfil}
      categorias={categorias}
      items={items}
    />
  );
}
