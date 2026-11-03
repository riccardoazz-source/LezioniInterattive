import { ImageColoringEditor } from "@/components/disegni/ImageColoringEditor";

/** Una versione colorata di un disegno (salvata nel dispositivo). */
export default async function LavoroPage({ params }: PageProps<"/disegni/lavoro/[id]">) {
  const { id } = await params;
  return <ImageColoringEditor workId={id} />;
}
