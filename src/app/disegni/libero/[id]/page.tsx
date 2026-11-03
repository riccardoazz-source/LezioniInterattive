import { AppHeader } from "@/components/ui/AppHeader";
import { FreeDrawingEditor } from "@/components/disegni/FreeDrawingEditor";

export default async function DisegnoLiberoPage({ params }: PageProps<"/disegni/libero/[id]">) {
  const { id } = await params;
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Disegno libero" emoji="🖌️" backHref="/disegni" />
      <FreeDrawingEditor id={id} />
    </main>
  );
}
