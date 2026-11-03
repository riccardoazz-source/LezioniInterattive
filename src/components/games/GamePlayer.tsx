"use client";

import type { GameDef, Level } from "@/content/types";
import { LEVELS } from "@/content/subjects";
import { useSettings } from "@/lib/settings";
import { ChoiceGame } from "./ChoiceGame";
import { MemoryGame } from "./MemoryGame";
import { SillabeGame } from "./SillabeGame";
import {
  calcoliRound,
  confrontaRound,
  contaRound,
  formeRound,
  ingleseRound,
  lettereRound,
  orologioRound,
  sequenzeRound,
} from "./rounds";
import { useState } from "react";

const GENERATORS = {
  conta: contaRound,
  calcoli: calcoliRound,
  confronta: confrontaRound,
  sequenze: sequenzeRound,
  forme: formeRound,
  orologio: orologioRound,
  lettere: lettereRound,
  inglese: ingleseRound,
} as const;

export function GamePlayer({ game }: { game: GameDef }) {
  const [settings, , ready] = useSettings();
  const [override, setOverride] = useState<Level | null>(null);
  if (!ready) return null;
  // Il gioco usa il livello delle impostazioni, limitato a quelli disponibili.
  const available = game.levels;
  const wanted = override ?? settings.level;
  const level = (available.includes(wanted) ? wanted : available[available.length - 1]) as Level;

  let body: React.ReactNode;
  if (game.id === "memory") body = <MemoryGame key={level} level={level} />;
  else if (game.id === "sillabe") body = <SillabeGame key={level} level={level} />;
  else {
    const gen = GENERATORS[game.id];
    body = <ChoiceGame key={level} gameId={game.id} level={level} makeRound={gen} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      {available.length > 1 && (
        <div className="flex justify-center gap-2 px-4 pt-2">
          {available.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setOverride(l)}
              className={`rounded-full px-3 py-1 text-sm font-bold ${
                l === level ? "bg-foreground text-white" : "bg-white text-muted"
              }`}
            >
              {LEVELS.find((x) => x.value === l)?.label ?? l}
            </button>
          ))}
        </div>
      )}
      {body}
    </div>
  );
}
