"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaintOp } from "@/lib/storage/drawings";
import type { Stroke } from "@/lib/storage/types";
import { buildLineMask, floodFill } from "@/lib/floodfill";
import { DrawingCanvas, PEN_WIDTHS, type Tool } from "./DrawingCanvas";
import { COLORING_PALETTE } from "@/content/coloring-categories";
import { useConfirmDelete } from "@/components/ui/ConfirmDelete";

const MAX_SIDE = 1400;

type Mode = "fill" | "pen" | "erase";

interface Props {
  src: string;
  paintOps: PaintOp[];
  strokes: Stroke[];
  onPaintOps: (ops: PaintOp[]) => void;
  onStrokes: (s: Stroke[]) => void;
  /** miniatura JPEG del risultato, aggiornata dopo ogni modifica */
  onThumbnail?: (dataUrl: string) => void;
  fingerAllowed?: boolean;
}

/**
 * Colora un'IMMAGINE (disegno con linee nere): tocca una zona per riempirla
 * con il secchiello (riempimento sui pixel, fermato dalle linee), oppure
 * disegna sopra con la penna.
 */
export function ImageColoringBoard({ src, paintOps, strokes, onPaintOps, onStrokes, onThumbnail, fingerAllowed }: Props) {
  const [color, setColor] = useState(COLORING_PALETTE[2]);
  const [mode, setMode] = useState<Mode>("fill");
  const [width, setWidth] = useState(PEN_WIDTHS[1]);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  const displayRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef<ImageData | null>(null);
  const maskRef = useRef<Uint8Array | null>(null);
  const opsRef = useRef<PaintOp[]>(paintOps);
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tool: Tool = { color, width, erase: mode === "erase" };

  // Composizione: bianco + colori + linee (in multiply, così il bianco sparisce)
  const compose = useCallback(() => {
    const display = displayRef.current;
    const line = lineRef.current;
    const paint = paintRef.current;
    if (!display || !line || !paint) return;
    const ctx = display.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, display.width, display.height);
    ctx.putImageData(paint, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(line, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  const scheduleThumbnail = useCallback(() => {
    if (!onThumbnail) return;
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    thumbTimer.current = setTimeout(() => {
      const display = displayRef.current;
      if (!display) return;
      const tw = 320;
      const th = Math.round((display.height / display.width) * tw);
      const c = document.createElement("canvas");
      c.width = tw;
      c.height = th;
      c.getContext("2d")!.drawImage(display, 0, 0, tw, th);
      onThumbnail(c.toDataURL("image/jpeg", 0.7));
    }, 800);
  }, [onThumbnail]);

  const replay = useCallback((ops: PaintOp[]) => {
    const paint = paintRef.current;
    const mask = maskRef.current;
    if (!paint || !mask) return;
    paint.data.fill(0);
    for (const op of ops) floodFill(mask, paint.width, paint.height, op.x, op.y, paint.data, op.color);
    compose();
  }, [compose]);

  // Carica l'immagine e prepara i layer.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const line = document.createElement("canvas");
      line.width = w;
      line.height = h;
      const lctx = line.getContext("2d", { willReadFrequently: true })!;
      lctx.fillStyle = "#fff";
      lctx.fillRect(0, 0, w, h);
      lctx.drawImage(img, 0, 0, w, h);
      lineRef.current = line;
      maskRef.current = buildLineMask(lctx.getImageData(0, 0, w, h));
      paintRef.current = new ImageData(w, h);
      setDims({ w, h });
    };
    img.onerror = () => !cancelled && setError("Non riesco a caricare il disegno.");
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Quando il canvas è montato (dims noti) ridisegna i riempimenti salvati.
  useEffect(() => {
    if (!dims) return;
    const display = displayRef.current;
    if (!display) return;
    display.width = dims.w;
    display.height = dims.h;
    opsRef.current = paintOps;
    replay(paintOps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims]);

  // Se le operazioni cambiano dall'esterno (annulla), ridisegna.
  useEffect(() => {
    if (opsRef.current !== paintOps) {
      opsRef.current = paintOps;
      replay(paintOps);
      scheduleThumbnail();
    }
  }, [paintOps, replay, scheduleThumbnail]);

  const onTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "fill" || !dims || busy) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * dims.w;
    const y = ((e.clientY - rect.top) / rect.height) * dims.h;
    const paint = paintRef.current;
    const mask = maskRef.current;
    if (!paint || !mask) return;
    setBusy(true);
    const n = floodFill(mask, dims.w, dims.h, x, y, paint.data, color);
    setBusy(false);
    if (n === 0) return; // toccata una linea
    compose();
    const ops = [...opsRef.current, { x: Math.round(x), y: Math.round(y), color }];
    opsRef.current = ops;
    onPaintOps(ops);
    scheduleThumbnail();
  };

  const undo = () => {
    if (mode !== "fill" && strokes.length) {
      onStrokes(strokes.slice(0, -1));
      scheduleThumbnail();
      return;
    }
    if (opsRef.current.length) onPaintOps(opsRef.current.slice(0, -1));
    else if (strokes.length) onStrokes(strokes.slice(0, -1));
  };

  const clearAll = async () => {
    if (!(await confirmDelete("Ricominciare da capo questo disegno?"))) return;
    onPaintOps([]);
    onStrokes([]);
  };

  const modeBtn = (m: Mode, label: string) => (
    <button type="button" onClick={() => setMode(m)} className={`rounded-full px-4 py-2 text-base font-black shadow ${mode === m ? "bg-foreground text-white" : "bg-white"}`}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      {deleteDialog}
      <div className="no-select flex flex-wrap items-center justify-center gap-2">
        {modeBtn("fill", "🪣 Riempi")}
        {modeBtn("pen", "✏️ Penna")}
        {modeBtn("erase", "🧽 Gomma")}
        <span className="mx-1 h-8 w-px bg-gray-300" />
        {mode !== "fill" &&
          PEN_WIDTHS.map((w) => (
            <button key={w} type="button" aria-label={`Spessore ${w}`} onClick={() => setWidth(w)} className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${width === w ? "ring-4 ring-primary" : ""}`}>
              <span className="rounded-full bg-foreground" style={{ width: w + 4, height: w + 4 }} />
            </button>
          ))}
        <button type="button" aria-label="Annulla" onClick={undo} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow">
          ↩️
        </button>
        <button type="button" aria-label="Ricomincia" onClick={clearAll} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow">
          🗑️
        </button>
      </div>
      <div className="no-select flex flex-wrap items-center justify-center gap-2">
        {COLORING_PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => {
              setColor(c);
              if (mode === "erase") setMode("pen");
            }}
            className={`h-11 w-11 rounded-full border-4 transition active:scale-90 ${color === c && mode !== "erase" ? "scale-110 border-foreground" : "border-white"}`}
            style={{ background: c, boxShadow: "0 1px 3px rgba(0,0,0,.25)" }}
          />
        ))}
      </div>
      {error && <p className="text-center font-bold text-danger">{error}</p>}
      <div className="flex w-full justify-center">
        <div
          className="relative overflow-hidden rounded-3xl bg-white shadow-inner"
          style={{ width: "100%", maxWidth: dims ? `calc((100dvh - 290px) * ${dims.w / dims.h})` : undefined, aspectRatio: dims ? `${dims.w} / ${dims.h}` : "1 / 1" }}
        >
          {!dims && !error && <p className="absolute inset-0 flex items-center justify-center text-muted">Carico il disegno…</p>}
          <canvas
            ref={displayRef}
            className="absolute inset-0 h-full w-full"
            style={{ cursor: mode === "fill" ? "pointer" : "default", touchAction: "none" }}
            onPointerDown={onTap}
          />
          {dims && (
            <DrawingCanvas
              strokes={strokes}
              onChange={(s) => {
                onStrokes(s);
                scheduleThumbnail();
              }}
              tool={tool}
              fingerAllowed={fingerAllowed}
              readOnly={mode === "fill"}
              transparent
              fill
              logicalW={dims.w}
              logicalH={dims.h}
              className={mode === "fill" ? "pointer-events-none" : ""}
            />
          )}
        </div>
      </div>
    </div>
  );
}
