import { PageWorks } from "@/components/disegni/PageWorks";

/** Disegno-immagine: elenco delle versioni colorate, o avvio di una nuova. */
export default async function ColoraImmaginePage({ params }: PageProps<"/disegni/colora/immagine/[id]">) {
  const { id } = await params;
  return <PageWorks pageId={id} />;
}
