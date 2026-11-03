"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDrawing, removeDrawing, saveDrawing, type SavedDrawing } from "@/lib/storage/drawings";
import type { Stroke } from "@/lib/storage/types";
import { useSettings } from "@/lib/settings";
import { Button } from "@/components/ui/Button";
import { DrawingBoard } from "@/components/draw/DrawingCanvas";

export function FreeDrawingEditor({ id }: { id: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [drawing, setDrawing] = useState<SavedDrawing | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDrawing(id).then((d) => {
      if (cancelled) return;
      const now = new Date().toISOString();
      setDrawing(d ?? { id, kind: "free", title: "", strokes: [], fills: {}, createdAt: now, updatedAt: now });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
      <input
        value={drawing.title}
        onChange={(e) => patch({ title: e.target.value })}
        placeholder="Nome del disegno (facoltativo)"
        className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-xl font-black outline-none focus:border-primary"
      />
      <DrawingBoard strokes={drawing.strokes} onChange={(strokes: Stroke[]) => patch({ strokes })} fingerAllowed={settings.fingerDraw} />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : ""}</span>
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="md"
            onClick={async () => {
              if (!confirm("Eliminare questo disegno?")) return;
              if (timer.current) clearTimeout(timer.current);
              await removeDrawing(id);
              router.replace("/disegni");
            }}
          >
            🗑️ Elimina
          </Button>
          <Button size="md" onClick={() => router.push("/disegni")}>
            ✓ Fine
          </Button>
        </div>
      </div>
    </div>
  );
}
