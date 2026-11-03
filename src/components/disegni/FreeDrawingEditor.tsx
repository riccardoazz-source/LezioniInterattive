"use client";

import { useConfirmDelete } from "@/components/ui/ConfirmDelete";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDrawing, removeDrawing, saveDrawing, type SavedDrawing } from "@/lib/storage/drawings";
import { newPage, type Stroke } from "@/lib/storage";
import { useSettings } from "@/lib/settings";
import { PEN_COLORS, PEN_WIDTHS, type Tool } from "@/components/draw/DrawingCanvas";
import { NotebookSheet } from "@/components/notes/NotebookSheet";
import { IconBtn } from "@/components/notes/NoteEditor";

/** Disegno libero: un foglio bianco a tutta pagina per la Pencil. */
export function FreeDrawingEditor({ id }: { id: string }) {
  const router = useRouter();
  const [settings] = useSettings();
  const [drawing, setDrawing] = useState<SavedDrawing | null>(null);
  const [tool, setTool] = useState<Tool>({ color: PEN_COLORS[0].value, width: PEN_WIDTHS[1], erase: false });
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [maxHeight, setMaxHeight] = useState(800);
  const [showTitle, setShowTitle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

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

  useEffect(() => {
    const calc = () => setMaxHeight(Math.max(420, window.innerHeight - 190));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

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

  const page = { ...newPage("free"), drawing: drawing.strokes };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-2 px-2 pb-3 sm:px-4">
      {deleteDialog}
      <div className="no-select flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/70 p-2">
        {PEN_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-label={c.name}
            onClick={() => setTool({ ...tool, color: c.value, erase: false })}
            className={`h-9 w-9 rounded-full border-4 ${!tool.erase && tool.color === c.value ? "scale-110 border-foreground" : "border-white"}`}
            style={{ background: c.value, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }}
          />
        ))}
        {PEN_WIDTHS.map((w) => (
          <IconBtn key={w} aria={`Spessore ${w}`} active={tool.width === w} onClick={() => setTool({ ...tool, width: w })}>
            <span className="rounded-full bg-foreground" style={{ width: w + 4, height: w + 4 }} />
          </IconBtn>
        ))}
        <IconBtn label="🧽" aria="Gomma" active={tool.erase} onClick={() => setTool({ ...tool, erase: !tool.erase })} />
        <IconBtn label="↩️" aria="Annulla" disabled={drawing.strokes.length === 0} onClick={() => patch({ strokes: drawing.strokes.slice(0, -1) })} />
        <IconBtn label="🗑️" aria="Cancella tutto" disabled={drawing.strokes.length === 0} onClick={async () => (await confirmDelete("Cancellare tutto il foglio?")) && patch({ strokes: [] })} />
        <span className="mx-1 h-8 w-px bg-gray-300" />
        <IconBtn label="🏷️" aria="Nome del disegno" active={showTitle} onClick={() => setShowTitle((v) => !v)} />
        <span className="text-xs text-muted">{saved === "saving" ? "Salvo…" : saved === "saved" ? "✓ Salvato" : ""}</span>
      </div>
      {showTitle && (
        <div className="flex gap-2 rounded-2xl bg-white p-2 shadow">
          <input
            value={drawing.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Nome del disegno"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-lg font-black outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={async () => {
              if (!(await confirmDelete("Eliminare questo disegno?"))) return;
              if (timer.current) clearTimeout(timer.current);
              await removeDrawing(id);
              router.replace("/disegni");
            }}
            className="rounded-full bg-danger px-3 text-sm font-bold text-white"
          >
            🗑️ Elimina
          </button>
        </div>
      )}
      <NotebookSheet
        page={page}
        mode="pen"
        tool={tool}
        fingerAllowed={settings.fingerDraw}
        onStrokes={(strokes: Stroke[]) => patch({ strokes })}
        onText={() => {}}
        onImages={() => {}}
        selectedImage={null}
        onSelectImage={() => {}}
        maxHeight={maxHeight}
        lined={false}
      />
    </div>
  );
}
