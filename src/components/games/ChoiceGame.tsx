"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Level } from "@/content/types";
import { recordGame } from "@/lib/progress";
import { speak, stopSpeaking } from "@/lib/speech";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Stars } from "@/components/ui/Stars";
import { Confetti } from "@/components/ui/Confetti";

/**
 * Motore generico per i giochi "domanda + risposte". Ogni gioco fornisce
 * solo `makeRound(level)`, che genera una domanda casuale.
 */
export interface ChoiceOption {
  key: string;
  label: ReactNode;
  say?: string;
}

export interface ChoiceRound {
  prompt: string;
  /** testo letto ad alta voce (default: prompt) */
  say?: string;
  lang?: string;
  visual?: ReactNode;
  options: ChoiceOption[];
  answerKey: string;
  /** colonne della griglia delle risposte */
  columns?: 2 | 3 | 4;
}

export const ROUNDS = 8;

interface Props {
  gameId: string;
  level: Level;
  makeRound: (level: Level) => ChoiceRound;
}

export function ChoiceGame({ gameId, level, makeRound }: Props) {
  const [roundNo, setRoundNo] = useState(0);
  const [score, setScore] = useState(0);
  const [seed, setSeed] = useState(0);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"ok" | "ko" | null>(null);
  const [finished, setFinished] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const round = useMemo(() => makeRound(level), [level, seed, makeRound]);

  useEffect(() => () => stopSpeaking(), []);

  const choose = (key: string) => {
    if (state === "ok") return;
    if (key === round.answerKey) {
      setState("ok");
      const gained = firstTry ? 1 : 0;
      const newScore = score + gained;
      setScore(newScore);
      speak(firstTry ? "Bravissima!" : "Giusto!");
      setTimeout(() => {
        if (roundNo + 1 >= ROUNDS) {
          recordGame(gameId, newScore);
          setFinished(true);
          speak("Gioco finito! Bravissima!");
        } else {
          setRoundNo(roundNo + 1);
          setSeed((s) => s + 1);
          setWrong(new Set());
          setState(null);
          setFirstTry(true);
        }
      }, 800);
    } else {
      setState("ko");
      setFirstTry(false);
      setWrong((w) => new Set(w).add(key));
      speak("Riprova!");
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
          {score} su {ROUNDS} al primo colpo
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setRoundNo(0);
              setScore(0);
              setSeed((s) => s + 1);
              setWrong(new Set());
              setState(null);
              setFirstTry(true);
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

  const cols = round.columns ?? (round.options.length <= 3 ? 3 : round.options.length === 4 ? 2 : 4);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6">
      <div className="my-3 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-info transition-all" style={{ width: `${((roundNo + 1) / ROUNDS) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-muted">⭐ {score}</span>
      </div>
      <div key={seed} className="animate-pop flex flex-1 flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black">{round.prompt}</h2>
          <SpeakButton text={round.say ?? round.prompt} lang={round.lang} size="sm" />
        </div>
        {round.visual && <div className="w-full">{round.visual}</div>}
        <div
          className="mt-2 grid w-full max-w-xl gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {round.options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={wrong.has(opt.key)}
              onClick={() => {
                if (opt.say) speak(opt.say, round.lang);
                choose(opt.key);
              }}
              className={`no-select flex min-h-20 items-center justify-center rounded-3xl px-3 text-3xl font-black shadow-md transition active:scale-95 ${
                state === "ok" && opt.key === round.answerKey
                  ? "bg-success text-white"
                  : wrong.has(opt.key)
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className={`h-10 text-2xl font-black ${state === "ok" ? "text-success" : "text-danger"}`}>
          {state === "ok" ? "✅ Bravissima!" : state === "ko" ? "❌ Riprova!" : ""}
        </div>
      </div>
    </div>
  );
}
