import { ImageColoringEditor } from "@/components/disegni/ImageColoringEditor";

/** Disegni-immagine: dal catalogo o importati (risolti lato client). */
export default async function ColoraImmaginePage({ params }: PageProps<"/disegni/colora/immagine/[id]">) {
  const { id } = await params;
  return <ImageColoringEditor pageId={id} />;
}
