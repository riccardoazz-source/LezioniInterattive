"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Activity, Lesson } from "@/content/types";
import { SUBJECT_MAP } from "@/content/subjects";
import { recordLesson } from "@/lib/progress";
import { speak, stopSpeaking } from "@/lib/speech";
import { useSettings } from "@/lib/settings";
import { pick, shuffle, distinctWith } from "@/lib/random";
import type { Stroke } from "@/lib/storage/types";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Stars } from "@/components/ui/Stars";
import { Confetti } from "@/components/ui/Confetti";
import { DrawingBoard } from "@/components/draw/DrawingCanvas";

const PRAISE = ["Bravissima!", "Perfetto!", "Giusto!", "Che brava!", "Evviva!"];
const RETRY = ["Riprova!", "Quasi! Prova ancora.", "Non è questa, riprova."];

interface Props {
  lesson: Lesson;
}

export function LessonPlayer({ lesson }: Props) {
  const [settings] = useSettings();
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const subject = SUBJECT_MAP[lesson.subject];
  const total = lesson.activities.length;
  const activity = lesson.activities[index];
  const lang = lesson.subject === "inglese" ? "en-GB" : "it-IT";

  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    stopSpeaking();
    if (index + 1 >= total) {
      const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      recordLesson(lesson.id, stars);
      setDone(true);
      speak("Lezione finita! Bravissima!");
    } else {
      setIndex(index + 1);
    }
  };

  if (done) {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    return (
      <div className="animate-pop mx-auto flex max-w-lg flex-col items-center gap-4 p-6 text-center">
        <Confetti />
        <div className="text-7xl">🎉</div>
        <h2 className="text-3xl font-black">Lezione finita!</h2>
        <Stars value={stars} size="lg" />
        <p className="text-lg text-muted">Hai completato «{lesson.title}».</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setIndex(0);
              setMistakes(0);
              setDone(false);
            }}
          >
            🔁 Rifai
          </Button>
          <Link href={`/impara/${lesson.subject}`}>
            <Button>Altre lezioni →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6">
      <div className="my-3 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-success transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-muted">
          {index + 1}/{total}
        </span>
      </div>
      <div key={index} className="animate-pop flex flex-1 flex-col">
        <ActivityView
          activity={activity}
          lang={lang}
          fingerDraw={settings.fingerDraw}
          accent={subject.accent}
          onDone={next}
          onMistake={() => setMistakes((m) => m + 1)}
        />
      </div>
    </div>
  );
}

interface ActivityProps {
  activity: Activity;
  lang: string;
  fingerDraw: boolean;
  accent: string;
  onDone: () => void;
  onMistake: () => void;
}

function ActivityView(props: ActivityProps) {
  const { activity } = props;
  switch (activity.type) {
    case "intro":
      return <IntroActivity {...props} activity={activity} />;
    case "cards":
      return <CardsActivity {...props} activity={activity} />;
    case "choice":
      return <ChoiceActivity {...props} activity={activity} />;
    case "count":
      return <CountActivity {...props} activity={activity} />;
    case "trace":
      return <TraceActivity {...props} activity={activity} />;
    case "draw":
      return <DrawActivity {...props} activity={activity} />;
    case "match":
      return <MatchActivity {...props} activity={activity} />;
  }
}

function NextButton({ onClick, label = "Avanti →" }: { onClick: () => void; label?: string }) {
  return (
    <div className="mt-auto flex justify-center pt-4">
      <Button size="xl" onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}

function IntroActivity({ activity, onDone }: ActivityProps & { activity: Extract<Activity, { type: "intro" }> }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 text-center">
      <div className="text-8xl">{activity.emoji ?? "📘"}</div>
      <h2 className="text-3xl font-black">{activity.title}</h2>
      <p className="max-w-xl text-xl leading-relaxed">{activity.text}</p>
      <SpeakButton text={`${activity.title}. ${activity.text}`} />
      <NextButton onClick={onDone} />
    </div>
  );
}

function CardsActivity({ activity, lang, onDone }: ActivityProps & { activity: Extract<Activity, { type: "cards" }> }) {
  const [touched, setTouched] = useState<Set<number>>(new Set());
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-black">{activity.title}</h2>
        {activity.text && <p className="text-muted">{activity.text}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activity.cards.map((card, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              speak(card.say ?? card.label, lang);
              setTouched((t) => new Set(t).add(i));
            }}
            className={`no-select flex min-h-36 flex-col items-center justify-center gap-1 rounded-3xl bg-white p-3 shadow-md transition active:scale-95 ${
              touched.has(i) ? "ring-4 ring-success" : ""
            }`}
          >
            <span className="text-4xl leading-tight">{card.emoji}</span>
            <span className="text-2xl font-black">{card.label}</span>
            {card.note && <span className="text-sm font-semibold text-muted">{card.note}</span>}
          </button>
        ))}
      </div>
      <NextButton onClick={onDone} />
    </div>
  );
}

function Feedback({ state }: { state: "ok" | "ko" | null }) {
  if (!state) return <div className="h-10" />;
  return (
    <div className={`animate-pop h-10 text-center text-2xl font-black ${state === "ok" ? "text-success" : "text-danger"}`}>
      {state === "ok" ? "✅ Bravissima!" : "❌ Riprova!"}
    </div>
  );
}

function ChoiceActivity({
  activity,
  lang,
  onDone,
  onMistake,
}: ActivityProps & { activity: Extract<Activity, { type: "choice" }> }) {
  const [state, setState] = useState<"ok" | "ko" | null>(null);
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const say = activity.question;

  const choose = (i: number) => {
    if (state === "ok") return;
    if (i === activity.answer) {
      setState("ok");
      speak(pick(PRAISE));
      setTimeout(onDone, 900);
    } else {
      setState("ko");
      setWrong((w) => new Set(w).add(i));
      onMistake();
      speak(activity.hint ?? pick(RETRY));
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      {activity.emoji && <div className="whitespace-pre-line text-6xl leading-tight">{activity.emoji}</div>}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">{activity.question}</h2>
        <SpeakButton text={say} lang={lang.startsWith("en") && /[a-z]/.test(say) && !/\b(come|si|dice|quale)\b/i.test(say) ? lang : "it-IT"} size="sm" />
      </div>
      <div className="mt-2 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
        {activity.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => choose(i)}
            disabled={wrong.has(i)}
            className={`no-select min-h-20 rounded-3xl px-4 text-2xl font-black shadow-md transition active:scale-95 ${
              state === "ok" && i === activity.answer
                ? "bg-success text-white"
                : wrong.has(i)
                  ? "bg-gray-200 text-gray-400 line-through"
                  : "bg-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <Feedback state={state} />
    </div>
  );
}

function CountActivity({ activity, onDone, onMistake }: ActivityProps & { activity: Extract<Activity, { type: "count" }> }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [state, setState] = useState<"ok" | "ko" | null>(null);
  const options = useMemo(() => {
    const pool = [activity.count - 2, activity.count - 1, activity.count + 1, activity.count + 2].filter((v) => v >= 1);
    return distinctWith(activity.count, pool, 3);
  }, [activity.count]);

  const choose = (v: number) => {
    if (state === "ok") return;
    if (v === activity.count) {
      setState("ok");
      speak(`${activity.count}! Bravissima!`);
      setTimeout(onDone, 900);
    } else {
      setState("ko");
      onMistake();
      speak("Riprova! Tocca gli oggetti uno alla volta per contarli.");
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">{activity.question}</h2>
        <SpeakButton text={`${activity.question} Toccali per contarli.`} size="sm" />
      </div>
      <p className="text-muted">Tocca ogni oggetto per contarlo</p>
      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {Array.from({ length: activity.count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              const n = new Set(tapped);
              if (n.has(i)) n.delete(i);
              else {
                n.add(i);
                speak(String(n.size));
              }
              setTapped(n);
            }}
            className={`no-select relative flex h-16 w-16 items-center justify-center rounded-2xl text-4xl transition active:scale-90 ${
              tapped.has(i) ? "bg-accent" : "bg-white shadow"
            }`}
          >
            {activity.emoji}
            {tapped.has(i) && (
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-black text-white">
                {[...tapped].sort((a, b) => a - b).indexOf(i) + 1}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {options.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => choose(v)}
            className={`no-select h-20 w-20 rounded-3xl text-4xl font-black shadow-md transition active:scale-95 ${
              state === "ok" && v === activity.count ? "bg-success text-white" : "bg-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <Feedback state={state} />
    </div>
  );
}

function TraceActivity({ activity, fingerDraw, onDone }: ActivityProps & { activity: Extract<Activity, { type: "trace" }> }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">{activity.title}</h2>
        <SpeakButton text={activity.say ?? `${activity.title}. ${activity.text ?? ""}`} size="sm" />
      </div>
      {activity.text && <p className="text-center text-muted">{activity.text}</p>}
      <DrawingBoard
        className="w-full"
        strokes={strokes}
        onChange={setStrokes}
        fingerAllowed={fingerDraw}
        initialColor="#118ab2"
        guide={
          <span
            className="select-none font-black text-gray-200"
            style={{ fontSize: "min(55vw, 420px)", lineHeight: 1, fontFamily: "ui-rounded, 'Nunito', sans-serif" }}
          >
            {activity.glyph}
          </span>
        }
      />
      <NextButton onClick={onDone} label={strokes.length ? "Fatto! →" : "Salta →"} />
    </div>
  );
}

function DrawActivity({ activity, fingerDraw, onDone }: ActivityProps & { activity: Extract<Activity, { type: "draw" }> }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">{activity.title}</h2>
        <SpeakButton text={`${activity.title}. ${activity.text}`} size="sm" />
      </div>
      <p className="text-center text-muted">{activity.text}</p>
      <DrawingBoard className="w-full" strokes={strokes} onChange={setStrokes} fingerAllowed={fingerDraw} />
      <NextButton onClick={onDone} label={strokes.length ? "Fatto! →" : "Salta →"} />
    </div>
  );
}

function MatchActivity({ activity, lang, onDone, onMistake }: ActivityProps & { activity: Extract<Activity, { type: "match" }> }) {
  const rights = useMemo(() => shuffle(activity.pairs.map((p, i) => ({ text: p.right, idx: i }))), [activity.pairs]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState<number | null>(null);

  const pickRight = (idx: number) => {
    if (selectedLeft === null || matched.has(idx)) return;
    if (selectedLeft === idx) {
      const m = new Set(matched).add(idx);
      setMatched(m);
      setSelectedLeft(null);
      speak(activity.pairs[idx].right.replace(/[^\p{L}\p{N} ]/gu, "").trim() || PRAISE[0], lang);
      if (m.size === activity.pairs.length) setTimeout(onDone, 900);
    } else {
      onMistake();
      setShake(idx);
      speak(RETRY[1]);
      setTimeout(() => setShake(null), 500);
    }
  };

  const cellBase = "no-select flex min-h-16 items-center justify-center rounded-3xl px-3 text-xl font-black shadow-md transition active:scale-95";
  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black">{activity.title}</h2>
        <SpeakButton text={activity.text ?? activity.title} size="sm" />
      </div>
      <p className="text-center text-muted">{activity.text ?? "Tocca a sinistra, poi la coppia giusta a destra."}</p>
      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {activity.pairs.map((p, i) => (
            <button
              key={i}
              type="button"
              disabled={matched.has(i)}
              onClick={() => {
                setSelectedLeft(i);
                speak(p.left.replace(/[^\p{L}\p{N} ]/gu, "").trim() || p.left, lang);
              }}
              className={`${cellBase} ${matched.has(i) ? "bg-success text-white" : selectedLeft === i ? "bg-accent ring-4 ring-primary" : "bg-white"}`}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rights.map((r) => (
            <button
              key={r.idx}
              type="button"
              disabled={matched.has(r.idx)}
              onClick={() => pickRight(r.idx)}
              className={`${cellBase} ${matched.has(r.idx) ? "bg-success text-white" : "bg-white"} ${shake === r.idx ? "animate-wiggle" : ""}`}
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>
      {matched.size === activity.pairs.length && <div className="animate-pop text-2xl font-black text-success">✅ Tutte giuste!</div>}
    </div>
  );
}
