import { AppHeader } from "@/components/ui/AppHeader";
import { GameGrid } from "@/components/GameGrid";

export default function GiocaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title="Gioca" emoji="🎮" backHref="/" />
      <GameGrid />
    </main>
  );
}
