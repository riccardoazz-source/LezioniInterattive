import { notFound } from "next/navigation";
import { COLORING_MAP, COLORING_PAGES } from "@/content/coloring";
import { AppHeader } from "@/components/ui/AppHeader";
import { ColoringEditor } from "@/components/disegni/ColoringEditor";

export function generateStaticParams() {
  return COLORING_PAGES.map((p) => ({ pagina: p.id }));
}

export default async function ColoraPaginaPage({ params }: PageProps<"/disegni/colora/[pagina]">) {
  const { pagina } = await params;
  const page = COLORING_MAP[pagina];
  if (!page) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={page.title} emoji={page.emoji} backHref="/disegni/colora" />
      <ColoringEditor page={page} />
    </main>
  );
}
