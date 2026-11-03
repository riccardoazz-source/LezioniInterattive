import { AppHeader } from "@/components/ui/AppHeader";
import { DrawingsHome } from "@/components/disegni/DrawingsGallery";

export default function DisegniPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Disegni" emoji="🎨" backHref="/" />
      <DrawingsHome />
    </main>
  );
}
