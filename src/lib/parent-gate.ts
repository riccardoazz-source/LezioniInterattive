"use client";

import { useCallback, useSyncExternalStore } from "react";
import { randInt } from "./random";
import { useHydrated } from "./settings";

/**
 * "Cancello genitori": una moltiplicazione che una bambina di 6 anni non
 * sa ancora fare. Sblocca l'area per 15 minuti (sessionStorage).
 */
const KEY = "li:parent-unlocked-until";
const EVENT = "li:parent-gate-changed";
const DURATION_MS = 15 * 60 * 1000;

export function isParentUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const until = Number(window.sessionStorage.getItem(KEY) ?? 0);
    return Date.now() < until;
  } catch {
    return false;
  }
}

export function unlockParent() {
  try {
    window.sessionStorage.setItem(KEY, String(Date.now() + DURATION_MS));
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function lockParent() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function makeChallenge(): { question: string; answer: number } {
  const a = randInt(6, 9);
  const b = randInt(6, 9);
  return { question: `${a} × ${b}`, answer: a * b };
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useParentGate() {
  const unlocked = useSyncExternalStore(subscribe, isParentUnlocked, () => false);
  const ready = useHydrated();
  const unlock = useCallback(() => unlockParent(), []);
  const lock = useCallback(() => lockParent(), []);
  return { unlocked, ready, unlock, lock };
}
