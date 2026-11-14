"use client";

import { useSyncExternalStore } from "react";
import { idbDelete, idbGet, idbGetAll, idbPut, STORES } from "@/lib/storage/idb";
import { normalizeNote, type Note } from "@/lib/storage/types";
import type { CustomPage, SavedDrawing } from "@/lib/storage/drawings";
import { applyRemoteSettings, readSettings } from "@/lib/settings";
import { applyRemoteProgress, readProgress } from "@/lib/progress";
import { applyRemotePalettes, readCustom } from "@/lib/palettes";
import {
  DIRTY_EVENT,
  kvUpdatedAt,
  markDirty,
  outboxKey,
  readOutbox,
  setKvUpdatedAt,
  writeOutbox,
  type Collection,
} from "./outbox";

/**
 * Sincronizzazione con il server (Neon/Postgres).
 *
 * - I dati restano sempre anche sul dispositivo: l'app funziona offline.
 * - Ogni modifica locale va in coda (outbox) e parte appena c'è connessione.
 * - Dal server si scaricano solo le novità (numero progressivo "seq").
 * - In caso di modifiche su due dispositivi vince la più recente; per le
 *   stelle si tiene il meglio di entrambi.
 * - Foto e disegni importati viaggiano a parte (/api/blobs), una volta sola.
 */

export type SyncState = "checking" | "local" | "locked" | "syncing" | "online" | "offline" | "error";

export interface SyncStatus {
  state: SyncState;
  detail?: string;
  lastSync?: string;
  pending: number;
  protected?: boolean;
  serverBuild?: string;
  serverDocs?: number;
}

const LAST_SEQ = "li:sync:lastSeq";
const LAST_SYNC = "li:sync:lastSync";
const INIT = "li:sync:initialized";
const BLOBS = "li:sync:blobs";
const CODE = "li:familyCode";
export const REMOTE_EVENT = "li:remote-change";

// ---------------- stato osservabile ----------------
let status: SyncStatus = { state: "checking", pending: 0 };
const listeners = new Set<() => void>();
function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch, pending: Object.keys(readOutbox()).length };
  listeners.forEach((l) => l());
}
const SERVER_STATUS: SyncStatus = { state: "checking", pending: 0 };
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status,
    () => SERVER_STATUS,
  );
}

/** Numero che cresce quando arrivano dati dal server: le liste lo usano per ricaricarsi. */
let remoteVersion = 0;
const remoteListeners = new Set<() => void>();
export function useRemoteVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      remoteListeners.add(cb);
      return () => remoteListeners.delete(cb);
    },
    () => remoteVersion,
    () => 0,
  );
}
function notifyRemote() {
  remoteVersion++;
  remoteListeners.forEach((l) => l());
  window.dispatchEvent(new Event(REMOTE_EVENT));
}

// ---------------- codice famiglia ----------------
export function getFamilyCode(): string {
  try {
    return window.localStorage.getItem(CODE) ?? "";
  } catch {
    return "";
  }
}

export function setFamilyCode(code: string) {
  const c = code.trim();
  try {
    window.localStorage.setItem(CODE, c);
  } catch {
    /* ignora */
  }
  document.cookie = `li_family=${encodeURIComponent(c)}; path=/; max-age=${60 * 60 * 24 * 3650}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  void syncNow();
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  const code = getFamilyCode();
  return code ? { "x-family-code": code, ...extra } : extra;
}

// ---------------- utilità ----------------
const ls = {
  get: (k: string) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* ignora */
    }
  },
};

function uploadedBlobs(): Set<string> {
  try {
    return new Set(JSON.parse(ls.get(BLOBS) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

async function uploadBlob(id: string, dataUrl: string): Promise<string> {
  const url = `/api/blobs/${id}`;
  const done = uploadedBlobs();
  if (done.has(id)) return url;
  const blob = await (await fetch(dataUrl)).blob();
  const res = await fetch(url, { method: "PUT", body: blob, headers: headers({ "content-type": blob.type || "image/jpeg" }) });
  if (!res.ok) throw new Error(`Caricamento immagine non riuscito (${res.status})`);
  done.add(id);
  ls.set(BLOBS, JSON.stringify([...done]));
  return url;
}

async function gzip(text: string): Promise<{ body: BodyInit; gz: boolean }> {
  if (typeof CompressionStream === "undefined") return { body: text, gz: false };
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return { body: await new Response(stream).arrayBuffer(), gz: true };
}

// ---------------- adattatori per collezione ----------------
interface Doc {
  collection: Collection;
  id: string;
  data: unknown;
  updatedAt: string;
  deleted?: boolean;
}

/** Prepara un documento locale per il server (foto → blob). */
async function localDoc(collection: Collection, id: string): Promise<Doc | null> {
  if (collection === "notes") {
    const raw = await idbGet<Note>(STORES.notes, id);
    const n = normalizeNote(raw);
    if (!n) return null;
    const pages = [];
    for (const pg of n.pages) {
      const images = [];
      for (const im of pg.images) {
        images.push(im.dataUrl.startsWith("data:") ? { ...im, dataUrl: await uploadBlob(`img-${im.id}`, im.dataUrl) } : im);
      }
      pages.push({ ...pg, images });
    }
    return { collection, id, data: { ...n, pages }, updatedAt: n.updatedAt };
  }
  if (collection === "drawings") {
    const d = await idbGet<SavedDrawing>(STORES.drawings, id);
    return d ? { collection, id, data: d, updatedAt: d.updatedAt } : null;
  }
  if (collection === "pages") {
    const p = await idbGet<CustomPage>(STORES.pages, id);
    if (!p) return null;
    const dataUrl = p.dataUrl.startsWith("data:") ? await uploadBlob(`page-${p.id}`, p.dataUrl) : p.dataUrl;
    return { collection, id, data: { ...p, dataUrl }, updatedAt: p.updatedAt ?? p.createdAt };
  }
  // kv
  const at = kvUpdatedAt(id) ?? new Date(0).toISOString();
  if (id === "settings") return { collection, id, data: readSettings(), updatedAt: at };
  if (id === "progress") return { collection, id, data: readProgress(), updatedAt: at };
  if (id === "palettes") return { collection, id, data: readCustom(), updatedAt: at };
  return null;
}

async function localUpdatedAt(collection: Collection, id: string): Promise<string | null> {
  if (collection === "kv") return kvUpdatedAt(id);
  const store = collection === "notes" ? STORES.notes : collection === "drawings" ? STORES.drawings : STORES.pages;
  const r = await idbGet<{ updatedAt?: string; createdAt?: string }>(store, id);
  return r ? (r.updatedAt ?? r.createdAt ?? null) : null;
}

/** Applica un documento arrivato dal server. Restituisce true se ha cambiato qualcosa. */
async function applyRemote(doc: Doc): Promise<boolean> {
  const key = outboxKey(doc.collection, doc.id);
  const pendingLocal = readOutbox()[key];
  const localAt = await localUpdatedAt(doc.collection, doc.id);
  // Già uguale a quella locale (per esempio è tornata indietro la nostra): niente da fare.
  if (!doc.deleted && localAt && localAt === doc.updatedAt && !pendingLocal) return false;
  // Una modifica locale non ancora inviata e più recente vince.
  if (pendingLocal && (pendingLocal.deleted ? pendingLocal.at : localAt ?? "") >= doc.updatedAt) return false;
  if (!pendingLocal && localAt && localAt > doc.updatedAt && !doc.deleted) {
    markDirty(doc.collection, doc.id); // qui c'è una versione più nuova: rimandala
    return false;
  }
  if (doc.collection === "kv") {
    if (doc.deleted || !doc.data) return false;
    if (doc.id === "settings") applyRemoteSettings(doc.data as never);
    else if (doc.id === "palettes") applyRemotePalettes(doc.data as never);
    else if (doc.id === "progress") {
      if (applyRemoteProgress(doc.data as never)) markDirty("kv", "progress");
    }
    setKvUpdatedAt(doc.id, doc.updatedAt);
    return true;
  }
  const store = doc.collection === "notes" ? STORES.notes : doc.collection === "drawings" ? STORES.drawings : STORES.pages;
  if (doc.deleted) {
    if (!localAt) return false;
    await idbDelete(store, doc.id);
  } else {
    await idbPut(store, doc.data);
  }
  if (pendingLocal) {
    const o = readOutbox();
    delete o[key];
    writeOutbox(o);
  }
  return true;
}

// ---------------- pull / push ----------------
async function pull(): Promise<void> {
  let after = Number(ls.get(LAST_SEQ) ?? 0) || 0;
  let changed = false;
  for (let guard = 0; guard < 500; guard++) {
    const res = await fetch(`/api/sync?after=${after}`, { headers: headers(), cache: "no-store" });
    if (!res.ok) throw new Error(`Download non riuscito (${res.status})`);
    const body = (await res.json()) as { docs: Doc[]; last: number; more: boolean };
    for (const d of body.docs) if (await applyRemote(d)) changed = true;
    after = body.last;
    ls.set(LAST_SEQ, String(after));
    if (!body.more) break;
  }
  if (changed) notifyRemote();
}

const BATCH = 2_500_000;

async function push(): Promise<void> {
  const outbox = readOutbox();
  const keys = Object.keys(outbox);
  if (!keys.length) return;
  const docs: { key: string; doc: Doc; at: string }[] = [];
  for (const key of keys) {
    const entry = outbox[key];
    const [collection, ...rest] = key.split("/");
    const id = rest.join("/");
    const c = collection as Collection;
    if (entry.deleted) {
      docs.push({ key, at: entry.at, doc: { collection: c, id, data: null, updatedAt: entry.at, deleted: true } });
      continue;
    }
    const doc = await localDoc(c, id);
    if (doc) docs.push({ key, at: entry.at, doc });
    else docs.push({ key, at: entry.at, doc: { collection: c, id, data: null, updatedAt: entry.at, deleted: true } });
  }
  // invia a lotti
  let batch: typeof docs = [];
  let size = 0;
  const flush = async () => {
    if (!batch.length) return;
    const { body, gz } = await gzip(JSON.stringify({ docs: batch.map((b) => b.doc) }));
    const res = await fetch("/api/sync", { method: "POST", body, headers: headers({ "content-type": "application/json", ...(gz ? { "x-gzip": "1" } : {}) }) });
    if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
    const o = readOutbox();
    for (const b of batch) if (o[b.key]?.at === b.at) delete o[b.key];
    writeOutbox(o);
    batch = [];
    size = 0;
  };
  for (const d of docs) {
    const len = JSON.stringify(d.doc).length;
    if (batch.length && size + len > BATCH) await flush();
    batch.push(d);
    size += len;
  }
  await flush();
}

/** Alla prima connessione di questo dispositivo, manda tutto quello che ha. */
async function enqueueEverything() {
  const o = readOutbox();
  const now = new Date().toISOString();
  const add = (c: Collection, id: string) => {
    o[outboxKey(c, id)] ??= { deleted: false, at: now };
  };
  for (const n of await idbGetAll<{ id: string }>(STORES.notes)) add("notes", n.id);
  for (const d of await idbGetAll<SavedDrawing>(STORES.drawings)) if (d.strokes.length || d.paintOps?.length) add("drawings", d.id);
  for (const p of await idbGetAll<{ id: string }>(STORES.pages)) add("pages", p.id);
  for (const k of ["settings", "progress", "palettes"]) if (kvUpdatedAt(k)) add("kv", k);
  writeOutbox(o);
}

// ---------------- ciclo ----------------
let running = false;
let again = false;

export async function syncNow(): Promise<void> {
  if (typeof window === "undefined") return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  try {
    do {
      again = false;
      await cycle();
    } while (again);
  } finally {
    running = false;
  }
}

async function cycle() {
  if (!navigator.onLine) {
    setStatus({ state: "offline", detail: "Nessuna connessione: i dati restano salvati qui e partono appena torna internet." });
    return;
  }
  let health: { database: string; protected: boolean; authorized: boolean; detail?: string; build?: string; docs?: number };
  try {
    const res = await fetch("/api/health", { headers: headers(), cache: "no-store" });
    health = await res.json();
  } catch {
    setStatus({ state: "offline", detail: "Il server non risponde." });
    return;
  }
  if (health.database === "non configurato") {
    setStatus({ state: "local", detail: "Il database non è configurato su Vercel: i dati restano solo su questo dispositivo.", serverBuild: health.build });
    return;
  }
  if (health.database !== "ok") {
    setStatus({ state: "error", detail: health.detail ?? "Errore del database.", serverBuild: health.build });
    return;
  }
  if (!health.authorized) {
    setStatus({ state: "locked", detail: getFamilyCode() ? "Il codice famiglia non è corretto." : "Inserisci il codice famiglia per sincronizzare.", protected: true, serverBuild: health.build });
    return;
  }
  setStatus({ state: "syncing", detail: undefined, protected: health.protected, serverBuild: health.build });
  try {
    if (!ls.get(INIT)) {
      await enqueueEverything();
      ls.set(INIT, "1");
    }
    await pull();
    await push();
    const now = new Date().toISOString();
    ls.set(LAST_SYNC, now);
    setStatus({ state: "online", lastSync: now, detail: undefined, serverDocs: health.docs });
  } catch (e) {
    setStatus({ state: "error", detail: e instanceof Error ? e.message : String(e) });
  }
}

let started = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Avvia la sincronizzazione automatica (una volta per pagina). */
export function startSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  status = { ...status, lastSync: ls.get(LAST_SYNC) ?? undefined, pending: Object.keys(readOutbox()).length };
  void syncNow();
  window.addEventListener(DIRTY_EVENT, () => {
    setStatus({});
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => void syncNow(), 1500);
  });
  window.addEventListener("online", () => void syncNow());
  window.addEventListener("offline", () => setStatus({ state: "offline", detail: "Nessuna connessione: i dati restano salvati qui." }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void syncNow();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") void syncNow();
  }, 60_000);
}
