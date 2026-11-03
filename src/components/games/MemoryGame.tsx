"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Level } from "@/content/types";
import { recordGame } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { shuffle } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { Confetti } from "@/components/ui/Confetti";

const POOL = ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🦋", "🐢", "🐙"];

export function MemoryGame({ level }: { level: Level }) {
  const pairs = level === 1 ? 6 : level === 2 ? 8 : 10;
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => {
    const chosen = shuffle(POOL).slice(0, pairs);
    return shuffle([...chosen, ...chosen].map((emoji, i) => ({ id: i, emoji })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const finished = found.size === pairs;

  useEffect(() => {
    if (finished) {
      const score = Math.max(1, Math.round((pairs / Math.max(moves, pairs)) * 8));
      recordGame("memory", score);
      speak("Hai trovato tutte le coppie! Bravissima!");
    }
  }, [finished, moves, pairs]);

  const flip = (id: number) => {
    if (open.length === 2 || open.includes(id)) return;
    const card = cards[id];
    if (found.has(card.emoji)) return;
    const next = [...open, id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => cards[i]);
      if (a.emoji === b.emoji) {
        setFound((f) => new Set(f).add(a.emoji));
        speak("Coppia!");
        setTimeout(() => setOpen([]), 500);
      } else {
        setTimeout(() => setOpen([]), 900);
      }
    }
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setOpen([]);
    setFound(new Set());
    setMoves(0);
  };

  if (finished) {
    const stars = moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1;
    return (
      <div className="animate-pop mx-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
        <Confetti />
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-black">Tutte le coppie!</h2>
        <Stars value={stars} size="lg" />
        <p className="text-xl font-bold">In {moves} mosse</p>
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" onClick={restart}>
            🔁 Gioca ancora
          </Button>
          <Link href="/gioca">
            <Button>Altri giochi →</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cols = pairs <= 6 ? 4 : pairs === 8 ? 4 : 5;
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-3 px-4 pb-6">
      <p className="mt-2 font-bold text-muted">
        Coppie trovate: {found.size}/{pairs} · Mosse: {moves}
      </p>
      <div className="grid w-full gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map((c) => {
          const visible = open.includes(c.id) || found.has(c.emoji);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(c.id)}
              className={`no-select flex aspect-square items-center justify-center rounded-2xl text-4xl shadow-md transition active:scale-95 sm:text-5xl ${
                found.has(c.emoji) ? "bg-success/30" : visible ? "bg-white" : "bg-info text-white"
              }`}
              aria-label={visible ? c.emoji : "carta coperta"}
            >
              {visible ? c.emoji : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
