import { AppHeader } from "@/components/ui/AppHeader";
import { ColoringCatalog } from "@/components/disegni/ColoringCatalog";

export default function ColoraPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Da colorare" emoji="🖍️" backHref="/disegni" />
      <ColoringCatalog />
    </main>
  );
}
