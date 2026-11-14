"use client";

import { useSyncExternalStore } from "react";
import { touchKv } from "./sync/outbox";

/**
 * Progressi (stelle) salvati in locale. Quando ci sarà il server (Neon)
 * potranno essere sincronizzati con la stessa forma (tabella `progress`).
 */
export interface Progress {
  lessons: Record<string, { stars: number; completedAt: string; times: number }>;
  games: Record<string, { best: number; plays: number; lastAt: string }>;
}

const EMPTY: Progress = { lessons: {}, games: {} };
const KEY = "li:progress";
const EVENT = "li:progress-changed";

let cache: Progress | null = null;

export function readProgress(): Progress {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Progress>) : {};
    cache = { lessons: parsed.lessons ?? {}, games: parsed.games ?? {} };
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function store(p: Progress) {
  cache = p;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVENT));
}

function writeProgress(p: Progress) {
  store(p);
  touchKv("progress");
}

/**
 * Stelle arrivate dal server: si uniscono a quelle locali tenendo il meglio
 * di entrambi. Restituisce true se qui c'era qualcosa in più da rimandare.
 */
export function applyRemoteProgress(remote: Partial<Progress>): boolean {
  const local = readProgress();
  const lessons = { ...(remote.lessons ?? {}) };
  const games = { ...(remote.games ?? {}) };
  let localHasMore = false;
  for (const [id, l] of Object.entries(local.lessons)) {
    const r = lessons[id];
    if (!r || l.stars > r.stars || l.times > r.times) {
      lessons[id] = { stars: Math.max(l.stars, r?.stars ?? 0), times: Math.max(l.times, r?.times ?? 0), completedAt: l.completedAt > (r?.completedAt ?? "") ? l.completedAt : r!.completedAt };
      localHasMore = true;
    }
  }
  for (const [id, g] of Object.entries(local.games)) {
    const r = games[id];
    if (!r || g.best > r.best || g.plays > r.plays) {
      games[id] = { best: Math.max(g.best, r?.best ?? 0), plays: Math.max(g.plays, r?.plays ?? 0), lastAt: g.lastAt > (r?.lastAt ?? "") ? g.lastAt : r!.lastAt };
      localHasMore = true;
    }
  }
  store({ lessons, games });
  return localHasMore;
}

export function recordLesson(id: string, stars: number) {
  const p = readProgress();
  const prev = p.lessons[id];
  writeProgress({
    ...p,
    lessons: {
      ...p.lessons,
      [id]: {
        stars: Math.max(stars, prev?.stars ?? 0),
        completedAt: new Date().toISOString(),
        times: (prev?.times ?? 0) + 1,
      },
    },
  });
}

export function recordGame(id: string, score: number) {
  const p = readProgress();
  const prev = p.games[id];
  writeProgress({
    ...p,
    games: {
      ...p.games,
      [id]: {
        best: Math.max(score, prev?.best ?? 0),
        plays: (prev?.plays ?? 0) + 1,
        lastAt: new Date().toISOString(),
      },
    },
  });
}

export function resetProgress() {
  writeProgress(EMPTY);
}

function subscribe(cb: () => void) {
  const onStorage = () => {
    cache = null;
    cb();
  };
  window.addEventListener(EVENT, onStorage);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onStorage);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): [Progress] {
  const progress = useSyncExternalStore(subscribe, readProgress, () => EMPTY);
  return [progress];
}

export function totalStars(p: Progress): number {
  return Object.values(p.lessons).reduce((acc, l) => acc + l.stars, 0);
}
