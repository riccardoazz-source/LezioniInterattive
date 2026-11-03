"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Palette di colori per colorare: predefinite + personalizzate (salvate nel dispositivo). */
export interface Palette {
  id: string;
  name: string;
  colors: string[];
  custom?: boolean;
}

export const BUILTIN_PALETTES: Palette[] = [
  {
    id: "base",
    name: "Base",
    colors: ["#ffffff", "#2b2d42", "#9e9e9e", "#ef476f", "#e53935", "#ff7b54", "#ff9800", "#ffb703", "#fff176", "#c6e377", "#06d6a0", "#4caf50", "#2e7d32", "#26c6da", "#64b5f6", "#118ab2", "#3949ab", "#8338ec", "#b388ff", "#f8a5c2", "#ec407a", "#a1887f", "#6d4c41", "#ffe0b2", "#f5cba7", "#d7a98c"],
  },
  {
    id: "pastello",
    name: "Pastello",
    colors: ["#fde2e4", "#fad2e1", "#f9c6d3", "#e2ece9", "#bee1e6", "#cddafd", "#dfe7fd", "#e0bbe4", "#fff1e6", "#ffe5b4", "#fcf6bd", "#d0f4de", "#a9def9", "#e4c1f9", "#ffd6a5", "#caffbf", "#9bf6ff", "#bdb2ff", "#ffc6ff", "#fffffc"],
  },
  {
    id: "vivaci",
    name: "Vivaci",
    colors: ["#ff0000", "#ff6d00", "#ffd600", "#aeea00", "#00c853", "#00e5ff", "#2979ff", "#651fff", "#d500f9", "#ff4081", "#ff1744", "#1de9b6", "#76ff03", "#ffea00", "#ffab00", "#ff3d00", "#00b0ff", "#3d5afe", "#f50057", "#212121"],
  },
  {
    id: "pelle-capelli",
    name: "Pelle e capelli",
    colors: ["#fde7d6", "#f8d9c4", "#f3c9a8", "#e8b48c", "#d4a373", "#c68b59", "#a9714b", "#8d5a3b", "#6d4330", "#4e2f23", "#2b1d16", "#f9e7a1", "#e6c36b", "#d6a237", "#b87333", "#8b4513", "#5c3a21", "#1a1a1a", "#c0c0c0", "#f5f5f5"],
  },
  {
    id: "natura",
    name: "Natura",
    colors: ["#1b5e20", "#2e7d32", "#43a047", "#7cb342", "#aed581", "#dcedc8", "#0277bd", "#0288d1", "#4fc3f7", "#b3e5fc", "#5d4037", "#8d6e63", "#bcaaa4", "#ffb300", "#ffe082", "#90a4ae", "#546e7a", "#fff8e1", "#ffccbc", "#e65100"],
  },
];

const KEY = "li:palettes";
const EVENT = "li:palettes-changed";
let cache: Palette[] | null = null;

function readCustom(): Palette[] {
  if (typeof window === "undefined") return [];
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Palette[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function writeCustom(list: Palette[]) {
  cache = list;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const EMPTY: Palette[] = [];

export function useCustomPalettes() {
  const custom = useSyncExternalStore(subscribe, readCustom, () => EMPTY);
  const save = useCallback((p: Palette) => {
    const list = readCustom();
    const idx = list.findIndex((x) => x.id === p.id);
    const next = [...list];
    if (idx >= 0) next[idx] = { ...p, custom: true };
    else next.push({ ...p, custom: true });
    writeCustom(next);
  }, []);
  const remove = useCallback((id: string) => writeCustom(readCustom().filter((x) => x.id !== id)), []);
  return { custom, save, remove };
}
