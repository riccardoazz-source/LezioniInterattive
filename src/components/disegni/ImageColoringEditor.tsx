"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMAGE_PAGE_MAP } from "@/content/coloring-images";
import { getCustomPage, getDrawing, saveDrawing, type PaintOp, type SavedDrawing } from "@/lib/storage/drawings";
import type { Stroke } from "@/lib/storage/types";
import { useSettings } from "@/lib/settings";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { ImageColoringBoard } from "@/components/draw/ImageColoringBoard";

export const imageDrawingId = (pageId: string) => `img-${pageId}`;

/** Colora un disegno-immagine: dal catalogo (public/colora) o importato. */
export function ImageColoringEditor({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [page, setPage] = useState<{ title: string; src: string } | null | undefined>(undefined);
  const [drawing, setDrawing] = useState<SavedDrawing | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = imageDrawingId(pageId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const builtIn = IMAGE_PAGE_MAP[pageId];
      const p = builtIn ? { title: builtIn.title, src: builtIn.src } : await getCustomPage(pageId).then((c) => (c ? { title: c.title, src: c.dataUrl } : null));
      if (cancelled) return;
      setPage(p);
      if (!p) return;
      const d = await getDrawing(id);
      if (cancelled) return;
      const now = new Date().toISOString();
      setDrawing(d ?? { id, kind: "image", pageId, title: p.title, strokes: [], fills: {}, paintOps: [], createdAt: now, updatedAt: now });
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId, id]);

  const persist = useCallback((d: SavedDrawing) => {
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDrawing(d).then(() => setSaved("saved")), 400);
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

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={page.title} emoji="🖍️" backHref="/disegni/colora" />
      {drawing && (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 pb-8">
          <ImageColoringBoard
            src={page.src}
            paintOps={drawing.paintOps ?? []}
            strokes={drawing.strokes}
            onPaintOps={(paintOps: PaintOp[]) => patch({ paintOps })}
            onStrokes={(strokes: Stroke[]) => patch({ strokes })}
            onThumbnail={onThumbnail}
            fingerAllowed={settings.fingerDraw}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : ""}</span>
            <Button size="md" onClick={() => router.push("/disegni/colora")}>
              ✓ Fine
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
