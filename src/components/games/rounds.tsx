import type { Level } from "@/content/types";
import { distinctWith, pick, randInt, shuffle } from "@/lib/random";
import type { ChoiceRound } from "./ChoiceGame";

const ITEMS = ["🍎", "⭐", "🎈", "🐟", "🦋", "🌻", "🚗", "🍪", "🐸", "🧸"];

function numOptions(answer: number, min: number, max: number, n = 3) {
  const pool: number[] = [];
  for (let v = Math.max(min, answer - 4); v <= Math.min(max, answer + 4); v++) if (v !== answer) pool.push(v);
  return distinctWith(answer, pool, n).map((v) => ({ key: String(v), label: String(v) }));
}

export function contaRound(level: Level): ChoiceRound {
  const max = level === 1 ? 10 : level === 2 ? 20 : 40;
  const n = randInt(1, max);
  const emoji = pick(ITEMS);
  return {
    prompt: "Quanti ne vedi?",
    say: `Quanti ${emoji === "🍎" ? "frutti" : "oggetti"} ci sono? Contali!`,
    visual: (
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-1 rounded-3xl bg-white p-4 shadow">
        {Array.from({ length: n }, (_, i) => (
          <span key={i} className={`text-3xl ${n > 10 && i % 10 === 9 ? "mr-4" : ""}`}>
            {emoji}
          </span>
        ))}
      </div>
    ),
    options: numOptions(n, 1, max),
    answerKey: String(n),
  };
}

export function calcoliRound(level: Level): ChoiceRound {
  const max = level === 1 ? 10 : level === 2 ? 20 : level === 3 ? 100 : 1000;
  const ops: ("+" | "-" | "×")[] = level === 1 ? ["+", "+", "-"] : level === 2 ? ["+", "-"] : ["+", "-", "×"];
  const op = pick(ops);
  let a: number, b: number, result: number;
  if (op === "×") {
    a = randInt(2, level >= 4 ? 12 : 10);
    b = randInt(2, 10);
    result = a * b;
  } else if (op === "+") {
    a = randInt(1, max - 1);
    b = randInt(1, max - a);
    result = a + b;
  } else {
    a = randInt(2, max);
    b = randInt(1, a);
    result = a - b;
  }
  const showDots = level === 1;
  return {
    prompt: `${a} ${op === "-" ? "−" : op} ${b} = ?`,
    say: `${a} ${op === "+" ? "più" : op === "-" ? "meno" : "per"} ${b}?`,
    visual: showDots ? (
      <div className="flex items-center justify-center gap-3 text-3xl">
        <span className="max-w-40 rounded-2xl bg-white p-2 shadow">{"🔵".repeat(a)}</span>
        <span className="font-black">{op === "-" ? "−" : "+"}</span>
        <span className="max-w-40 rounded-2xl bg-white p-2 shadow">{(op === "-" ? "⚪" : "🟢").repeat(b)}</span>
      </div>
    ) : undefined,
    options: numOptions(result, 0, Math.max(result + 4, 10)),
    answerKey: String(result),
  };
}

export function confrontaRound(level: Level): ChoiceRound {
  const max = level === 1 ? 10 : level === 2 ? 100 : 1000;
  const big = Math.random() < 0.5;
  const nums = shuffle(distinctWith(randInt(1, max), Array.from({ length: max }, (_, i) => i + 1), 3));
  const answer = big ? Math.max(...nums) : Math.min(...nums);
  return {
    prompt: big ? "Qual è il numero più grande?" : "Qual è il numero più piccolo?",
    options: nums.map((n) => ({ key: String(n), label: String(n) })),
    answerKey: String(answer),
  };
}

const PATTERN_ITEMS = ["🍎", "🍌", "🍇", "🍓", "⭐", "🌙", "🔴", "🔵", "🟡", "🟢"];

export function sequenzeRound(level: Level): ChoiceRound {
  if (level === 1 || Math.random() < 0.3) {
    const [x, y, z] = shuffle(PATTERN_ITEMS).slice(0, 3);
    const pattern = pick([
      [x, y, x, y, x, y],
      [x, x, y, x, x, y],
      [x, y, z, x, y, z],
    ]);
    const shown = pattern.slice(0, 5);
    const answer = pattern[5];
    return {
      prompt: "Cosa viene dopo?",
      visual: (
        <div className="flex items-center justify-center gap-2 text-5xl">
          {shown.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-dashed border-gray-300 text-3xl">?</span>
        </div>
      ),
      options: shuffle([x, y, z]).map((s) => ({ key: s, label: s })),
      answerKey: answer,
    };
  }
  const step = level === 2 ? pick([1, 2, 5, 10]) : pick([2, 3, 4, 5, 10, 25]);
  const start = randInt(0, level === 2 ? 20 : 50);
  const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
  const answer = start + 5 * step;
  return {
    prompt: "Quale numero viene dopo?",
    visual: (
      <div className="flex items-center justify-center gap-2 text-3xl font-black">
        {seq.map((n, i) => (
          <span key={i} className="rounded-2xl bg-white px-3 py-2 shadow">
            {n}
          </span>
        ))}
        <span className="rounded-2xl border-4 border-dashed border-gray-300 px-3 py-2">?</span>
      </div>
    ),
    options: shuffle([answer, answer + step, answer - 1, answer + 1].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)).map((n) => ({
      key: String(n),
      label: String(n),
    })),
    answerKey: String(answer),
  };
}

const SHAPES = [
  { id: "cerchio", name: "cerchio", path: (c: string) => <circle cx="50" cy="50" r="40" fill={c} /> },
  { id: "quadrato", name: "quadrato", path: (c: string) => <rect x="12" y="12" width="76" height="76" rx="6" fill={c} /> },
  { id: "triangolo", name: "triangolo", path: (c: string) => <polygon points="50,10 92,88 8,88" fill={c} /> },
  { id: "rettangolo", name: "rettangolo", path: (c: string) => <rect x="6" y="28" width="88" height="44" rx="6" fill={c} /> },
  { id: "stella", name: "stella", path: (c: string) => <polygon points="50,6 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" fill={c} /> },
  { id: "cuore", name: "cuore", path: (c: string) => <path d="M50 90 L15 52 C2 36 18 12 40 22 L50 30 L60 22 C82 12 98 36 85 52 Z" fill={c} /> },
];
const COLORS = [
  { id: "rosso", name: "rosso", hex: "#ef476f" },
  { id: "blu", name: "blu", hex: "#118ab2" },
  { id: "giallo", name: "giallo", hex: "#ffd166" },
  { id: "verde", name: "verde", hex: "#06d6a0" },
  { id: "viola", name: "viola", hex: "#8338ec" },
];

export function formeRound(level: Level): ChoiceRound {
  const shapes = level === 1 ? SHAPES.slice(0, 4) : SHAPES;
  const target = pick(shapes);
  const color = pick(COLORS);
  const byColor = level >= 2 && Math.random() < 0.5;
  // 4 opzioni: forme diverse (stesso colore) oppure stessa forma con colori diversi
  const options = byColor
    ? shuffle(distinctWith(color, COLORS, 4)).map((c) => ({
        key: c.id,
        label: <svg viewBox="0 0 100 100" className="h-20 w-20">{target.path(c.hex)}</svg>,
      }))
    : shuffle(distinctWith(target, shapes, 4)).map((s) => ({
        key: s.id,
        label: <svg viewBox="0 0 100 100" className="h-20 w-20">{s.path(color.hex)}</svg>,
      }));
  const prompt = byColor ? `Tocca il ${target.name} ${color.name}` : `Tocca il ${target.name}`;
  return { prompt, options, answerKey: byColor ? color.id : target.id, columns: 2 };
}

function Clock({ h, m }: { h: number; m: number }) {
  const hourAngle = ((h % 12) + m / 60) * 30;
  const minAngle = m * 6;
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56">
      <circle cx="100" cy="100" r="95" fill="#fff" stroke="#2b2d42" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad(i * 30);
        return (
          <text key={i} x={100 + 76 * Math.cos(a)} y={100 + 76 * Math.sin(a) + 7} textAnchor="middle" fontSize="20" fontWeight="900" fill="#2b2d42">
            {i === 0 ? 12 : i}
          </text>
        );
      })}
      <line x1="100" y1="100" x2={100 + 48 * Math.cos(rad(hourAngle))} y2={100 + 48 * Math.sin(rad(hourAngle))} stroke="#2b2d42" strokeWidth="9" strokeLinecap="round" />
      <line x1="100" y1="100" x2={100 + 68 * Math.cos(rad(minAngle))} y2={100 + 68 * Math.sin(rad(minAngle))} stroke="#ef476f" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#2b2d42" />
    </svg>
  );
}

function fmt(h: number, m: number) {
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function orologioRound(level: Level): ChoiceRound {
  const minutesPool = level === 1 ? [0] : level === 2 ? [0, 30] : [0, 15, 30, 45];
  const h = randInt(1, 12);
  const m = pick(minutesPool);
  const answer = fmt(h, m);
  const wrongs = new Set<string>();
  while (wrongs.size < 2) {
    const wh = randInt(1, 12);
    const wm = pick(minutesPool);
    const s = fmt(wh, wm);
    if (s !== answer) wrongs.add(s);
  }
  return {
    prompt: "Che ore sono?",
    visual: <Clock h={h} m={m} />,
    options: shuffle([answer, ...wrongs]).map((t) => ({ key: t, label: t })),
    answerKey: answer,
  };
}

const WORDS: { word: string; emoji: string }[] = [
  { word: "APE", emoji: "🐝" },
  { word: "ELEFANTE", emoji: "🐘" },
  { word: "ISOLA", emoji: "🏝️" },
  { word: "ORSO", emoji: "🐻" },
  { word: "UVA", emoji: "🍇" },
  { word: "MELA", emoji: "🍎" },
  { word: "PALLA", emoji: "⚽" },
  { word: "LUNA", emoji: "🌙" },
  { word: "NAVE", emoji: "⛵" },
  { word: "SOLE", emoji: "☀️" },
  { word: "CASA", emoji: "🏠" },
  { word: "GATTO", emoji: "🐱" },
  { word: "CANE", emoji: "🐶" },
  { word: "FIORE", emoji: "🌸" },
  { word: "TOPO", emoji: "🐭" },
  { word: "RANA", emoji: "🐸" },
  { word: "BANANA", emoji: "🍌" },
  { word: "DADO", emoji: "🎲" },
  { word: "VASO", emoji: "🏺" },
  { word: "ZEBRA", emoji: "🦓" },
  { word: "LIBRO", emoji: "📚" },
  { word: "TRENO", emoji: "🚂" },
  { word: "PESCE", emoji: "🐟" },
  { word: "REGALO", emoji: "🎁" },
];
const ALPHABET = "ABCDEFGHILMNOPQRSTUVZ".split("");

export function lettereRound(level: Level): ChoiceRound {
  const w = pick(WORDS);
  if (level === 1) {
    const first = w.word[0];
    return {
      prompt: `Con quale lettera inizia ${w.word.charAt(0)}${w.word.slice(1).toLowerCase()}?`,
      say: `Con quale lettera inizia ${w.word.toLowerCase()}?`,
      visual: <div className="text-8xl">{w.emoji}</div>,
      options: distinctWith(first, ALPHABET, 3).map((l) => ({ key: l, label: l, say: l })),
      answerKey: first,
    };
  }
  const idx = randInt(1, w.word.length - 1);
  const missing = w.word[idx];
  const masked = w.word.slice(0, idx) + "_" + w.word.slice(idx + 1);
  return {
    prompt: "Quale lettera manca?",
    say: `Quale lettera manca nella parola ${w.word.toLowerCase()}?`,
    visual: (
      <div className="flex flex-col items-center gap-2">
        <div className="text-7xl">{w.emoji}</div>
        <div className="text-5xl font-black tracking-widest">{masked}</div>
      </div>
    ),
    options: distinctWith(missing, ALPHABET, 4).map((l) => ({ key: l, label: l })),
    answerKey: missing,
  };
}

const EN_WORDS: { it: string; en: string; emoji: string; level: Level }[] = [
  { it: "cane", en: "dog", emoji: "🐶", level: 1 },
  { it: "gatto", en: "cat", emoji: "🐱", level: 1 },
  { it: "mela", en: "apple", emoji: "🍎", level: 1 },
  { it: "sole", en: "sun", emoji: "☀️", level: 1 },
  { it: "casa", en: "house", emoji: "🏠", level: 1 },
  { it: "rosso", en: "red", emoji: "🔴", level: 1 },
  { it: "blu", en: "blue", emoji: "🔵", level: 1 },
  { it: "verde", en: "green", emoji: "🟢", level: 1 },
  { it: "giallo", en: "yellow", emoji: "🟡", level: 1 },
  { it: "pesce", en: "fish", emoji: "🐟", level: 1 },
  { it: "uccello", en: "bird", emoji: "🐦", level: 1 },
  { it: "libro", en: "book", emoji: "📚", level: 1 },
  { it: "palla", en: "ball", emoji: "⚽", level: 1 },
  { it: "macchina", en: "car", emoji: "🚗", level: 1 },
  { it: "fiore", en: "flower", emoji: "🌸", level: 1 },
  { it: "latte", en: "milk", emoji: "🥛", level: 1 },
  { it: "banana", en: "banana", emoji: "🍌", level: 1 },
  { it: "stella", en: "star", emoji: "⭐", level: 1 },
  { it: "luna", en: "moon", emoji: "🌙", level: 1 },
  { it: "acqua", en: "water", emoji: "💧", level: 1 },
  { it: "albero", en: "tree", emoji: "🌳", level: 2 },
  { it: "scuola", en: "school", emoji: "🏫", level: 2 },
  { it: "amico", en: "friend", emoji: "🧑‍🤝‍🧑", level: 2 },
  { it: "pane", en: "bread", emoji: "🍞", level: 2 },
  { it: "formaggio", en: "cheese", emoji: "🧀", level: 2 },
  { it: "coniglio", en: "rabbit", emoji: "🐰", level: 2 },
  { it: "cavallo", en: "horse", emoji: "🐴", level: 2 },
  { it: "sedia", en: "chair", emoji: "🪑", level: 2 },
  { it: "finestra", en: "window", emoji: "🪟", level: 2 },
  { it: "pioggia", en: "rain", emoji: "🌧️", level: 2 },
  { it: "farfalla", en: "butterfly", emoji: "🦋", level: 3 },
  { it: "maestra", en: "teacher", emoji: "👩‍🏫", level: 3 },
  { it: "zaino", en: "backpack", emoji: "🎒", level: 3 },
  { it: "ombrello", en: "umbrella", emoji: "☂️", level: 3 },
  { it: "cucina", en: "kitchen", emoji: "🍳", level: 3 },
  { it: "spiaggia", en: "beach", emoji: "🏖️", level: 3 },
];

export function ingleseRound(level: Level): ChoiceRound {
  const pool = EN_WORDS.filter((w) => w.level <= level);
  const w = pick(pool);
  const reverse = level >= 2 && Math.random() < 0.4;
  const options = distinctWith(w, pool, 3);
  if (reverse) {
    return {
      prompt: `What is "${w.en}"?`,
      say: w.en,
      lang: "en-GB",
      options: options.map((o) => ({ key: o.en, label: o.emoji })),
      answerKey: w.en,
    };
  }
  return {
    prompt: `Come si dice "${w.it}" in inglese?`,
    say: `Come si dice ${w.it} in inglese?`,
    lang: "en-GB",
    visual: <div className="text-8xl">{w.emoji}</div>,
    options: options.map((o) => ({ key: o.en, label: o.en, say: o.en })),
    answerKey: w.en,
  };
}
