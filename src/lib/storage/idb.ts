/** Piccolo wrapper su IndexedDB: note, disegni e disegni da colorare importati. */
const DB_NAME = "lezioni-interattive";
const VERSION = 3;
export const STORES = { notes: "notes", drawings: "drawings", pages: "pages" } as const;
export type StoreName = (typeof STORES)[keyof typeof STORES];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function idb<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export const idbGetAll = <T,>(store: StoreName) => idb<T[]>(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
export const idbGet = <T,>(store: StoreName, id: string) => idb<T | undefined>(store, "readonly", (s) => s.get(id) as IDBRequest<T | undefined>);
export const idbPut = (store: StoreName, value: unknown) => idb(store, "readwrite", (s) => s.put(value)).then(() => undefined);
export const idbDelete = (store: StoreName, id: string) => idb(store, "readwrite", (s) => s.delete(id)).then(() => undefined);
