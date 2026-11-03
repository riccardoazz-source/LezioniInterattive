import type { GameDef } from "./types";

export const GAMES: GameDef[] = [
  {
    id: "conta",
    subject: "matematica",
    title: "Conta!",
    emoji: "🍎",
    description: "Quanti oggetti vedi?",
    levels: [1, 2, 3],
  },
  {
    id: "calcoli",
    subject: "matematica",
    title: "Calcoli",
    emoji: "➕",
    description: "Addizioni e sottrazioni",
    levels: [1, 2, 3, 4, 5],
  },
  {
    id: "confronta",
    subject: "matematica",
    title: "Più grande?",
    emoji: "⚖️",
    description: "Qual è il numero più grande?",
    levels: [1, 2, 3],
  },
  {
    id: "sequenze",
    subject: "matematica",
    title: "Cosa viene dopo?",
    emoji: "🔁",
    description: "Completa la sequenza",
    levels: [1, 2, 3],
  },
  {
    id: "forme",
    subject: "matematica",
    title: "Forme e colori",
    emoji: "🔺",
    description: "Tocca la forma giusta",
    levels: [1, 2],
  },
  {
    id: "orologio",
    subject: "mondo",
    title: "Che ore sono?",
    emoji: "🕒",
    description: "Leggi l'orologio",
    levels: [1, 2, 3],
  },
  {
    id: "lettere",
    subject: "italiano",
    title: "Prima lettera",
    emoji: "🔤",
    description: "Con quale lettera inizia?",
    levels: [1, 2],
  },
  {
    id: "sillabe",
    subject: "italiano",
    title: "Costruisci la parola",
    emoji: "🧩",
    description: "Metti in ordine le sillabe",
    levels: [1, 2],
  },
  {
    id: "memory",
    subject: "scienze",
    title: "Memory",
    emoji: "🃏",
    description: "Trova le coppie",
    levels: [1, 2, 3],
  },
  {
    id: "inglese",
    subject: "inglese",
    title: "English words",
    emoji: "🇬🇧",
    description: "Come si dice in inglese?",
    levels: [1, 2, 3],
  },
];

export const GAME_MAP = Object.fromEntries(GAMES.map((g) => [g.id, g])) as Record<
  GameDef["id"],
  GameDef
>;
