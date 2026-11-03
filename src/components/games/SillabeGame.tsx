"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Level } from "@/content/types";
import { recordGame } from "@/lib/progress";
import { speak } from "@/lib/speech";
import { pick, shuffle } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Stars } from "@/components/ui/Stars";
import { Confetti } from "@/components/ui/Confetti";
import { ROUNDS } from "./ChoiceGame";

const WORDS: { syl: string[]; emoji: string; level: Level }[] = [
  { syl: ["ME", "LA"], emoji: "🍎", level: 1 },
  { syl: ["LU", "NA"], emoji: "🌙", level: 1 },
  { syl: ["CA", "SA"], emoji: "🏠", level: 1 },
  { syl: ["SO", "LE"], emoji: "☀️", level: 1 },
  { syl: ["NA", "VE"], emoji: "⛵", level: 1 },
  { syl: ["PA", "NE"], emoji: "🍞", level: 1 },
  { syl: ["RA", "NA"], emoji: "🐸", level: 1 },
  { syl: ["TO", "PO"], emoji: "🐭", level: 1 },
  { syl: ["MA", "RE"], emoji: "🌊", level: 1 },
  { syl: ["VA", "SO"], emoji: "🏺", level: 1 },
  { syl: ["DA", "DO"], emoji: "🎲", level: 1 },
  { syl: ["PI", "PA"], emoji: "🪈", level: 1 },
  { syl: ["BA", "NA", "NA"], emoji: "🍌", level: 2 },
  { syl: ["TA", "VO", "LO"], emoji: "🪑", level: 2 },
  { syl: ["PA", "TA", "TA"], emoji: "🥔", level: 2 },
  { syl: ["GE", "LA", "TO"], emoji: "🍦", level: 2 },
  { syl: ["CA", "ROT", "TA"], emoji: "🥕", level: 2 },
  { syl: ["FI", "NE", "STRA"], emoji: "🪟", level: 2 },
  { syl: ["ME", "DI", "CO"], emoji: "🩺", level: 2 },
  { syl: ["TE", "LE", "FO", "NO"], emoji: "📞", level: 2 },
];

export function SillabeGame({ level }: { level: Level }) {
  const [roundNo, setRoundNo] = useState(0);
  const [score, setScore] = useState(0);
  const [seed, setSeed] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [clean, setClean] = useState(true);

  const round = useMemo(() => {
    const pool = WORDS.filter((w) => w.level <= level);
    const w = pick(pool);
    const tiles = shuffle(w.syl.map((s, i) => ({ s, i })));
    return { ...w, tiles, word: w.syl.join("") };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, seed]);

  const done = built.length === round.syl.length && built.every((t, pos) => round.tiles[t].s === round.syl[pos]);

  const tap = (tileIdx: number) => {
    if (done || built.includes(tileIdx)) return;
    const pos = built.length;
    if (round.tiles[tileIdx].s === round.syl[pos]) {
      const next = [...built, tileIdx];
      setBuilt(next);
      speak(round.tiles[tileIdx].s);
      if (next.length === round.syl.length) {
        const gained = clean ? 1 : 0;
        const newScore = score + gained;
        setScore(newScore);
        setTimeout(() => speak(round.word.toLowerCase() + "! Bravissima!"), 300);
        setTimeout(() => {
          if (roundNo + 1 >= ROUNDS) {
            recordGame("sillabe", newScore);
            setFinished(true);
          } else {
            setRoundNo(roundNo + 1);
            setSeed((s) => s + 1);
            setBuilt([]);
            setClean(true);
          }
        }, 1400);
      }
    } else {
      setError(true);
      setClean(false);
      speak("Non è questa, riprova!");
      setTimeout(() => setError(false), 500);
    }
  };

  if (finished) {
    const stars = score >= ROUNDS - 1 ? 3 : score >= ROUNDS / 2 ? 2 : 1;
    return (
      <div className="animate-pop mx-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
        <Confetti />
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-black">Gioco finito!</h2>
        <Stars value={stars} size="lg" />
        <p className="text-xl font-bold">
          {score} parole su {ROUNDS} senza errori
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setRoundNo(0);
              setScore(0);
              setSeed((s) => s + 1);
              setBuilt([]);
              setClean(true);
              setFinished(false);
            }}
          >
            🔁 Gioca ancora
          </Button>
          <Link href="/gioca">
            <Button>Altri giochi →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-3 px-4 pb-6">
      <div className="my-3 flex w-full items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-info transition-all" style={{ width: `${((roundNo + 1) / ROUNDS) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-muted">⭐ {score}</span>
      </div>
      <div key={seed} className="animate-pop flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black">Costruisci la parola</h2>
          <SpeakButton text={`Costruisci la parola ${round.word.toLowerCase()}. Tocca le sillabe in ordine.`} size="sm" />
        </div>
        <div className="text-8xl">{round.emoji}</div>
        <div className="flex gap-2">
          {round.syl.map((s, pos) => (
            <span
              key={pos}
              className={`flex h-16 min-w-16 items-center justify-center rounded-2xl px-3 text-3xl font-black ${
                built[pos] !== undefined ? "bg-success text-white" : "border-4 border-dashed border-gray-300"
              }`}
            >
              {built[pos] !== undefined ? s : ""}
            </span>
          ))}
        </div>
        <div className={`mt-4 flex flex-wrap justify-center gap-3 ${error ? "animate-wiggle" : ""}`}>
          {round.tiles.map((t, i) => (
            <button
              key={i}
              type="button"
              disabled={built.includes(i)}
              onClick={() => tap(i)}
              className="no-select h-20 min-w-20 rounded-3xl bg-white px-4 text-3xl font-black shadow-md transition active:scale-95 disabled:opacity-20"
            >
              {t.s}
            </button>
          ))}
        </div>
        {done && <div className="animate-pop text-2xl font-black text-success">✅ {round.word}!</div>}
      </div>
    </div>
  );
}
