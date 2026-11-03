export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** n valori distinti presi da `pool`, includendo sempre `must`. */
export function distinctWith<T>(must: T, pool: readonly T[], n: number): T[] {
  const set = new Set<T>([must]);
  const shuffled = shuffle(pool);
  for (const v of shuffled) {
    if (set.size >= n) break;
    set.add(v);
  }
  return shuffle([...set]);
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
