"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaintOp } from "@/lib/storage/drawings";
import type { BrushKind, Stroke } from "@/lib/storage/types";
import { buildLineMask, floodFill } from "@/lib/floodfill";
import { BRUSHES, DrawingCanvas, PEN_WIDTHS, renderStrokes, type Tool } from "./DrawingCanvas";
import { PalettePicker } from "./PalettePicker";
import { useConfirmDelete } from "@/components/ui/ConfirmDelete";

const MAX_SIDE = 1400;

type Mode = "fill" | BrushKind | "erase";

interface Props {
  src: string;
  paintOps: PaintOp[];
  strokes: Stroke[];
  onPaintOps: (ops: PaintOp[]) => void;
  onStrokes: (s: Stroke[]) => void;
  onThumbnail?: (dataUrl: string) => void;
  fingerAllowed?: boolean;
}

/**
 * Colora un'IMMAGINE (disegno con linee nere).
 * Livelli, dal basso: bianco + riempimenti (canvas) → tratti (penna, matita,
 * pennarello, acquerello, pennello) → le LINEE del disegno in "multiply",
 * così restano sempre nere anche colorandoci sopra.
 */
export function ImageColoringBoard({ src, paintOps, strokes, onPaintOps, onStrokes, onThumbnail, fingerAllowed }: Props) {
  const [color, setColor] = useState("#ef476f");
  const [mode, setMode] = useState<Mode>("fill");
  const [widthIdx, setWidthIdx] = useState(1);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  const displayRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const paintRef = useRef<ImageData | null>(null);
  const maskRef = useRef<Uint8Array | null>(null);
  const opsRef = useRef<PaintOp[]>(paintOps);
  const strokesRef = useRef<Stroke[]>(strokes);
  useEffect(() => {
    strokesRef.current = strokes;
  }, [strokes]);
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const width = PEN_WIDTHS[widthIdx];
  const tool: Tool = { color, width, erase: mode === "erase", kind: mode !== "fill" && mode !== "erase" ? mode : "pen" };

  const compose = useCallback(() => {
    const display = displayRef.current;
    const paint = paintRef.current;
    if (!display || !paint) return;
    const ctx = display.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, display.width, display.height);
    ctx.putImageData(paint, 0, 0);
  }, []);

  const scheduleThumbnail = useCallback(() => {
    if (!onThumbnail) return;
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    thumbTimer.current = setTimeout(() => {
      const display = displayRef.current;
      const line = lineRef.current;
      if (!display || !line) return;
      const tw = 320;
      const th = Math.round((display.height / display.width) * tw);
      const c = document.createElement("canvas");
      c.width = tw;
      c.height = th;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(display, 0, 0, tw, th);
      renderStrokes(ctx, strokesRef.current, tw / display.width);
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(line, 0, 0, tw, th);
      ctx.globalCompositeOperation = "source-over";
      onThumbnail(c.toDataURL("image/jpeg", 0.7));
    }, 150);
  }, [onThumbnail]);

  const replay = useCallback(
    (ops: PaintOp[]) => {
      const paint = paintRef.current;
      const mask = maskRef.current;
      if (!paint || !mask) return;
      paint.data.fill(0);
      for (const op of ops) floodFill(mask, paint.width, paint.height, op.x, op.y, paint.data, op.color);
      compose();
    },
    [compose],
  );

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

  useEffect(() => {
    if (opsRef.current !== paintOps) {
      opsRef.current = paintOps;
      replay(paintOps);
      scheduleThumbnail();
    }
  }, [paintOps, replay, scheduleThumbnail]);

  const onTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "fill" || !dims) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * dims.w;
    const y = ((e.clientY - rect.top) / rect.height) * dims.h;
    const paint = paintRef.current;
    const mask = maskRef.current;
    if (!paint || !mask) return;
    const n = floodFill(mask, dims.w, dims.h, x, y, paint.data, color);
    if (n === 0) return;
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
    if (paintOps.length) onPaintOps(paintOps.slice(0, -1));
    else if (strokes.length) {
      onStrokes(strokes.slice(0, -1));
      scheduleThumbnail();
    }
  };

  const clearAll = async () => {
    if (!(await confirmDelete("Ricominciare da capo questo disegno?"))) return;
    onPaintOps([]);
    onStrokes([]);
  };

  const empty = strokes.length === 0 && paintOps.length === 0;

  return (
    <div className="flex flex-col gap-1.5">
      {deleteDialog}
      {/* Strumenti: una riga compatta */}
      <div className="no-select flex items-center gap-1 overflow-x-auto py-0.5" style={{ scrollbarWidth: "none" }}>
        <ToolBtn label="🪣" aria="Riempi" active={mode === "fill"} onClick={() => setMode("fill")} />
        {BRUSHES.map((b) => (
          <ToolBtn key={b.kind} label={b.emoji} aria={b.name} active={mode === b.kind} onClick={() => setMode(b.kind)} />
        ))}
        <ToolBtn label="🧽" aria="Gomma" active={mode === "erase"} onClick={() => setMode("erase")} />
        <span className="mx-0.5 h-7 w-px shrink-0 bg-gray-300" />
        <button
          type="button"
          aria-label="Spessore"
          title="Spessore"
          onClick={() => setWidthIdx((i) => (i + 1) % PEN_WIDTHS.length)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow"
        >
          <span className="rounded-full bg-foreground" style={{ width: width + 3, height: width + 3 }} />
        </button>
        <ToolBtn label="↩️" aria="Annulla" disabled={empty} onClick={undo} />
        <ToolBtn label="🗑️" aria="Ricomincia" disabled={empty} onClick={clearAll} />
      </div>
      <PalettePicker
        color={color}
        active={mode !== "erase"}
        onColor={(c) => {
          setColor(c);
          if (mode === "erase") setMode("pen");
        }}
      />
      {error && <p className="text-center font-bold text-danger">{error}</p>}
      <div className="flex w-full justify-center">
        <div
          className="relative overflow-hidden rounded-2xl bg-white shadow-inner"
          style={{ width: "100%", maxWidth: dims ? `calc((100dvh - 215px) * ${dims.w / dims.h})` : undefined, aspectRatio: dims ? `${dims.w} / ${dims.h}` : "1 / 1" }}
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
              className={`rounded-2xl ${mode === "fill" ? "pointer-events-none" : ""}`}
            />
          )}
          {/* Le linee del disegno: sempre sopra, sempre nere */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none" style={{ mixBlendMode: "multiply" }} />
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ label, aria, onClick, active, disabled }: { label: string; aria: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={aria}
      title={aria}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg shadow transition active:scale-90 disabled:opacity-30 ${active ? "bg-foreground text-white" : "bg-white"}`}
    >
      {label}
    </button>
  );
}
