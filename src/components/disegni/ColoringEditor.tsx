"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ColoringPage } from "@/content/coloring";
import { getDrawing, saveDrawing, type SavedDrawing } from "@/lib/storage/drawings";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";
import { ColoringBoard } from "@/components/draw/ColoringBoard";

export const coloringDrawingId = (pageId: string) => `col-${pageId}`;

export function ColoringEditor({ page }: { page: ColoringPage }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [drawing, setDrawing] = useState<SavedDrawing | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = coloringDrawingId(page.id);

  useEffect(() => {
    let cancelled = false;
    getDrawing(id).then((d) => {
      if (cancelled) return;
      const now = new Date().toISOString();
      setDrawing(d ?? { id, kind: "coloring", pageId: page.id, title: page.title, strokes: [], fills: {}, createdAt: now, updatedAt: now });
    });
    return () => {
      cancelled = true;
    };
  }, [id, page.id, page.title]);

  const persist = useCallback((d: SavedDrawing) => {
    setSaved("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveDrawing(d).then(() => setSaved("saved")), 400);
  }, []);

  const patch = (p: Partial<SavedDrawing>) => {
    if (!drawing) return;
    const d = { ...drawing, ...p, updatedAt: new Date().toISOString() };
    setDrawing(d);
    persist(d);
  };

  if (!drawing) return <p className="p-8 text-center text-muted">Carico…</p>;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-4 pb-8">
      <ColoringBoard
        page={page}
        fills={drawing.fills}
        strokes={drawing.strokes}
        onFills={(fills) => patch({ fills })}
        onStrokes={(strokes) => patch({ strokes })}
        fingerAllowed={settings.fingerDraw}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : ""}</span>
        <Button size="md" onClick={() => router.push("/disegni/colora")}>
          ✓ Fine
        </Button>
      </div>
    </div>
  );
}
