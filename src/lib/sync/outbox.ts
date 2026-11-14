/**
 * Coda delle modifiche da mandare al server. Ogni salvataggio locale chiama
 * markDirty(): il motore di sincronizzazione (engine.ts) le invia appena può.
 * Nessuna dipendenza da altri moduli, così tutti possono importarlo.
 */
export type Collection = "notes" | "drawings" | "pages" | "kv";

export interface OutboxEntry {
  deleted: boolean;
  /** momento della cancellazione (per i "deleted") */
  at: string;
}

const OUTBOX = "li:sync:outbox";
const KVMETA = "li:sync:kvmeta";
export const DIRTY_EVENT = "li:sync-dirty";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage pieno o non disponibile */
  }
}

export function readOutbox(): Record<string, OutboxEntry> {
  return read<Record<string, OutboxEntry>>(OUTBOX, {});
}

export function writeOutbox(o: Record<string, OutboxEntry>) {
  write(OUTBOX, o);
}

export const outboxKey = (collection: Collection, id: string) => `${collection}/${id}`;

export function markDirty(collection: Collection, id: string, deleted = false) {
  if (typeof window === "undefined") return;
  const o = readOutbox();
  o[outboxKey(collection, id)] = { deleted, at: new Date().toISOString() };
  writeOutbox(o);
  window.dispatchEvent(new Event(DIRTY_EVENT));
}

/** Data dell'ultima modifica locale di impostazioni, stelle, palette. */
export function kvUpdatedAt(id: string): string | null {
  return read<Record<string, string>>(KVMETA, {})[id] ?? null;
}

export function setKvUpdatedAt(id: string, at: string) {
  const m = read<Record<string, string>>(KVMETA, {});
  m[id] = at;
  write(KVMETA, m);
}

/** Chiamato quando cambiano impostazioni, stelle o palette su questo dispositivo. */
export function touchKv(id: string) {
  setKvUpdatedAt(id, new Date().toISOString());
  markDirty("kv", id);
}
