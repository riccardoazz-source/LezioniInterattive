"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IMAGE_PAGE_MAP } from "@/content/coloring-images";
import { getCustomPage, listWorksForPage, removeDrawing, type SavedDrawing } from "@/lib/storage/drawings";
import { uid } from "@/lib/random";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { useConfirmDelete } from "@/components/ui/ConfirmDelete";

/**
 * Le versioni colorate di un disegno: si può continuare una versione,
 * colorarlo di nuovo in una versione nuova, o eliminare una versione.
 * Senza versioni, si parte subito con una nuova.
 */
export function PageWorks({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [page, setPage] = useState<{ title: string; src: string } | null | undefined>(undefined);
  const [works, setWorks] = useState<SavedDrawing[] | null>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  const startNew = () => router.replace(`/disegni/lavoro/${uid()}?new=1&page=${encodeURIComponent(pageId)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const builtIn = IMAGE_PAGE_MAP[pageId];
      const p = builtIn ? { title: builtIn.title, src: builtIn.thumb ?? builtIn.src } : await getCustomPage(pageId).then((c) => (c ? { title: c.title, src: c.dataUrl } : null));
      if (cancelled) return;
      setPage(p);
      if (!p) return;
      const w = await listWorksForPage(pageId);
      if (cancelled) return;
      if (w.length === 0) {
        router.replace(`/disegni/lavoro/${uid()}?new=1&page=${encodeURIComponent(pageId)}`);
        return;
      }
      setWorks(w);
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId, router]);

  const remove = async (w: SavedDrawing) => {
    if (!(await confirmDelete("Eliminare questa versione colorata?"))) return;
    await removeDrawing(w.id);
    setWorks((list) => list?.filter((x) => x.id !== w.id) ?? null);
  };

  if (page === null) return <p className="p-8 text-center text-muted">Disegno non trovato.</p>;
  if (!page || !works) return <p className="p-8 text-center text-muted">Carico…</p>;

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={page.title} emoji="🖍️" backHref="/disegni/colora" />
      {deleteDialog}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-8">
        <div className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.src} alt="" className="h-24 w-24 rounded-xl object-contain" />
          <div className="flex-1">
            <p className="font-black">Vuoi colorarlo di nuovo?</p>
            <p className="text-sm text-muted">Le versioni già colorate restano salvate.</p>
          </div>
          <Button onClick={startNew}>🆕 Colora da capo</Button>
        </div>

        <h2 className="text-lg font-black">🖼️ Le tue versioni</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {works.map((w, i) => (
            <div key={w.id} className="relative overflow-hidden rounded-3xl bg-white shadow-md">
              <button type="button" onClick={() => router.push(`/disegni/lavoro/${w.id}`)} className="no-select block w-full text-left transition active:scale-95">
                <div className="flex aspect-square items-center justify-center bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.thumbnail ?? page.src} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black">{w.completed ? "✅ Completato" : "✏️ Continua"}</span>
                    <span className="text-xs text-muted">{works.length - i}</span>
                  </div>
                  <div className="text-xs text-muted">{new Date(w.updatedAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
              </button>
              <button type="button" aria-label="Elimina versione" onClick={() => remove(w)} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-base shadow">
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
