"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Level } from "@/content/types";
import { setSpeechEnabled } from "./speech";

export interface Settings {
  /** nome della bambina, per il saluto in home */
  name: string;
  /** livello scolastico (1 = prima elementare) */
  level: Level;
  /** lettura ad alta voce */
  tts: boolean;
  /** permetti di disegnare anche col dito (oltre che con la penna) */
  fingerDraw: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  name: "",
  level: 1,
  tts: true,
  fingerDraw: true,
};

const KEY = "li:settings";
const EVENT = "li:settings-changed";

let cache: Settings | null = null;

export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    cache = DEFAULT_SETTINGS;
  }
  setSpeechEnabled(cache.tts);
  return cache;
}

export function writeSettings(s: Settings) {
  cache = s;
  setSpeechEnabled(s.tts);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage non disponibile (es. navigazione privata) */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = () => {
    cache = null;
    cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const noopSubscribe = () => () => {};

/** true solo dopo l'idratazione lato client: evita differenze server/client. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Hook: impostazioni condivise tra tutte le schermate, lette da localStorage
 * tramite useSyncExternalStore (nessun setState negli effetti).
 */
export function useSettings(): [Settings, (patch: Partial<Settings>) => void, boolean] {
  const settings = useSyncExternalStore(subscribe, readSettings, () => DEFAULT_SETTINGS);
  const ready = useHydrated();
  const update = useCallback((patch: Partial<Settings>) => {
    writeSettings({ ...readSettings(), ...patch });
  }, []);
  return [settings, update, ready];
}
