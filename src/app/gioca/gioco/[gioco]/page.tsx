import { notFound } from "next/navigation";
import { GAMES, GAME_MAP } from "@/content/games";
import type { GameKind } from "@/content/types";
import { AppHeader } from "@/components/ui/AppHeader";
import { GamePlayer } from "@/components/games/GamePlayer";

export function generateStaticParams() {
  return GAMES.map((g) => ({ gioco: g.id }));
}

export default async function GiocoPage({ params }: PageProps<"/gioca/gioco/[gioco]">) {
  const { gioco } = await params;
  const game = GAME_MAP[gioco as GameKind];
  if (!game) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={game.title} emoji={game.emoji} backHref="/gioca" />
      <GamePlayer game={game} />
    </main>
  );
}
