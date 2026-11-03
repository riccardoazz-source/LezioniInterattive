"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMAGE_PAGE_MAP } from "@/content/coloring-images";
import { getCustomPage, getDrawing, saveDrawing, type PaintOp, type SavedDrawing } from "@/lib/storage/drawings";
import type { Stroke } from "@/lib/storage/types";
import { useSettings } from "@/lib/settings";
import { speak } from "@/lib/speech";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { ImageColoringBoard } from "@/components/draw/ImageColoringBoard";

async function resolvePage(pageId: string): Promise<{ title: string; src: string } | null> {
  const builtIn = IMAGE_PAGE_MAP[pageId];
  if (builtIn) return { title: builtIn.title, src: builtIn.src };
  const c = await getCustomPage(pageId);
  return c ? { title: c.title, src: c.dataUrl } : null;
}

/**
 * Una "versione" colorata di un disegno (workId). Si crea con
 * /disegni/lavoro/<nuovo id>?new=1&page=<pageId>; si riapre con /disegni/lavoro/<id>.
 */
export function ImageColoringEditor({ workId }: { workId: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [page, setPage] = useState<{ title: string; src: string } | null | undefined>(undefined);
  const [drawing, setDrawing] = useState<SavedDrawing | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [celebrate, setCelebrate] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let d = await getDrawing(workId);
      if (!d) {
        const params = new URLSearchParams(window.location.search);
        const pageId = params.get("page");
        if (params.get("new") !== "1" || !pageId) {
          if (!cancelled) setPage(null);
          return;
        }
        const p = await resolvePage(pageId);
        if (!p) {
          if (!cancelled) setPage(null);
          return;
        }
        const now = new Date().toISOString();
        // Non si salva finché non si colora qualcosa: un disegno solo aperto non va in galleria.
        d = { id: workId, kind: "image", pageId, title: p.title, strokes: [], fills: {}, paintOps: [], createdAt: now, updatedAt: now };
        if (!cancelled) {
          setPage(p);
          setDrawing(d);
        }
        return;
      }
      const p = d.pageId ? await resolvePage(d.pageId) : null;
      if (cancelled) return;
      setPage(p);
      if (p) setDrawing(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [workId]);

  const pending = useRef<SavedDrawing | null>(null);
  const persist = useCallback((d: SavedDrawing) => {
    setSaved("saving");
    pending.current = d;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pending.current = null;
      saveDrawing(d).then(() => setSaved("saved"));
    }, 300);
  }, []);

  // All'uscita (Fine, indietro, chiusura) salva subito quello che è in attesa.
  useEffect(() => {
    const flush = () => {
      if (pending.current) {
        if (timer.current) clearTimeout(timer.current);
        void saveDrawing(pending.current);
        pending.current = null;
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  const patch = useCallback(
    (p: Partial<SavedDrawing>) => {
      setDrawing((cur) => {
        if (!cur) return cur;
        const d = { ...cur, ...p, updatedAt: new Date().toISOString() };
        persist(d);
        return d;
      });
    },
    [persist],
  );

  const onThumbnail = useCallback((thumbnail: string) => patch({ thumbnail }), [patch]);

  if (page === undefined) return <p className="p-8 text-center text-muted">Carico…</p>;
  if (page === null) return <p className="p-8 text-center text-muted">Disegno non trovato.</p>;

  const backHref = drawing?.pageId ? `/disegni/colora/immagine/${drawing.pageId}` : "/disegni/colora";

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={page.title} emoji="🖍️" backHref={backHref} />
      {celebrate && <Confetti />}
      {drawing && (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-2 px-2 pb-4 sm:px-4">
          <ImageColoringBoard
            src={page.src}
            paintOps={drawing.paintOps ?? []}
            strokes={drawing.strokes}
            onPaintOps={(paintOps: PaintOp[]) => patch({ paintOps })}
            onStrokes={(strokes: Stroke[]) => patch({ strokes })}
            onThumbnail={onThumbnail}
            fingerAllowed={settings.fingerDraw}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted">
              {saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : ""}
              {drawing.completed && <span className="ml-2 rounded-full bg-success/20 px-2 py-0.5 text-xs font-bold text-success">✅ Completato</span>}
            </span>
            <div className="flex gap-2">
              <Button
                variant={drawing.completed ? "secondary" : "success"}
                size="md"
                onClick={() => {
                  const next = !drawing.completed;
                  patch({ completed: next });
                  if (next) {
                    setCelebrate(true);
                    speak("Bravissima! Disegno completato!");
                    setTimeout(() => setCelebrate(false), 2500);
                  }
                }}
              >
                {drawing.completed ? "↩︎ Non ancora finito" : "✅ Completato!"}
              </Button>
              <Button size="md" onClick={() => router.push(backHref)}>
                ✓ Fine
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
