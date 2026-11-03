"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_H, BOARD_W, type Stroke, type StrokePoint } from "@/lib/storage/types";

/**
 * Lavagna per Apple Pencil, dito e mouse.
 *
 * - Usa i Pointer Events: `pointerType === "pen"` è la Pencil, con la
 *   pressione (0..1) che cambia lo spessore del tratto.
 * - Rifiuto del palmo: mentre la penna è attiva (o subito dopo) i tocchi
 *   delle dita vengono ignorati. Con `fingerAllowed=false` si disegna solo con
 *   penna/mouse.
 * - `getCoalescedEvents` recupera tutti i punti campionati dalla Pencil
 *   (fino a 240 Hz) per tratti fluidi.
 * - I tratti sono salvati in coordinate logiche (BOARD_W × BOARD_H), così
 *   si ridisegnano uguali su iPhone, iPad e PC e si possono salvare in JSON.
 */

export const PEN_COLORS = [
  { name: "Nero", value: "#2b2d42" },
  { name: "Rosso", value: "#ef476f" },
  { name: "Arancione", value: "#ff7b54" },
  { name: "Giallo", value: "#ffb703" },
  { name: "Verde", value: "#06d6a0" },
  { name: "Blu", value: "#118ab2" },
  { name: "Viola", value: "#8338ec" },
];

export const PEN_WIDTHS = [4, 8, 14];

export interface Tool {
  color: string;
  width: number;
  erase: boolean;
}

interface CanvasProps {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  tool: Tool;
  fingerAllowed?: boolean;
  readOnly?: boolean;
  /** contenuto mostrato dietro la lavagna (es. lettera da ricalcare) */
  guide?: React.ReactNode;
  className?: string;
}

function strokeWidth(stroke: Stroke, p: number, pen: boolean): number {
  const base = stroke.erase ? stroke.width * 3 : stroke.width;
  return pen ? base * (0.35 + 1.3 * p) : base;
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  a: StrokePoint,
  b: StrokePoint,
  scale: number,
  pen: boolean,
) {
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.erase ? "#000" : stroke.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = strokeWidth(stroke, (a.p + b.p) / 2, pen) * scale;
  ctx.beginPath();
  ctx.moveTo(a.x * scale, a.y * scale);
  ctx.lineTo(b.x * scale, b.y * scale);
  ctx.stroke();
}

function drawDot(ctx: CanvasRenderingContext2D, stroke: Stroke, a: StrokePoint, scale: number, pen: boolean) {
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.fillStyle = stroke.erase ? "#000" : stroke.color;
  ctx.beginPath();
  ctx.arc(a.x * scale, a.y * scale, (strokeWidth(stroke, a.p, pen) * scale) / 2, 0, Math.PI * 2);
  ctx.fill();
}

/** Un tratto con pressione variabile viene disegnato "a tratti con penna". */
function isPenStroke(s: Stroke): boolean {
  return s.points.some((pt) => pt.p !== 0.5);
}

export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number) {
  for (const s of strokes) {
    const pen = isPenStroke(s);
    if (s.points.length === 1) {
      drawDot(ctx, s, s.points[0], scale, pen);
      continue;
    }
    for (let i = 1; i < s.points.length; i++) {
      drawSegment(ctx, s, s.points[i - 1], s.points[i], scale, pen);
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

export function DrawingCanvas({
  strokes,
  onChange,
  tool,
  fingerAllowed = true,
  readOnly = false,
  guide,
  className = "",
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleRef = useRef(1); // pixel CSS per unità logica
  const activeRef = useRef<{ id: number; stroke: Stroke; pen: boolean } | null>(null);
  const penActiveUntil = useRef(0);
  const strokesRef = useRef(strokes);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    renderStrokes(ctx, strokesRef.current, scaleRef.current);
  }, []);

  // Dimensiona il canvas al contenitore (e al devicePixelRatio) e ridisegna.
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      scaleRef.current = rect.width / BOARD_W;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => {
    strokesRef.current = strokes;
    if (!activeRef.current) redraw();
  }, [strokes, redraw]);

  // Blocca scroll/zoom di Safari mentre si tocca la lavagna.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchstart", prevent, { passive: false });
    el.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      el.removeEventListener("touchstart", prevent);
      el.removeEventListener("touchmove", prevent);
    };
  }, []);

  const toPoint = useCallback((e: PointerEvent | React.PointerEvent, pen: boolean): StrokePoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const s = scaleRef.current;
    const x = (e.clientX - rect.left) / s;
    const y = (e.clientY - rect.top) / s;
    const p = pen && e.pressure > 0 ? e.pressure : 0.5;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, p: Math.round(p * 100) / 100 };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || activeRef.current) return;
    const pen = e.pointerType === "pen";
    if (e.pointerType === "touch") {
      if (!fingerAllowed) return;
      if (Date.now() < penActiveUntil.current) return; // palmo mentre si usa la Pencil
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (pen) penActiveUntil.current = Number.MAX_SAFE_INTEGER;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = toPoint(e, pen);
    const stroke: Stroke = { color: tool.color, width: tool.width, erase: tool.erase || undefined, points: [point] };
    activeRef.current = { id: e.pointerId, stroke, pen };
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawDot(ctx, stroke, point, scaleRef.current, pen);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeRef.current;
    if (!active || active.id !== e.pointerId) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const native = e.nativeEvent;
    const events: PointerEvent[] =
      "getCoalescedEvents" in native && typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : [];
    const list = events.length ? events : [native];
    for (const ev of list) {
      const pt = toPoint(ev, active.pen);
      const prev = active.stroke.points[active.stroke.points.length - 1];
      if (Math.abs(prev.x - pt.x) < 0.5 && Math.abs(prev.y - pt.y) < 0.5) continue;
      active.stroke.points.push(pt);
      drawSegment(ctx, active.stroke, prev, pt, scaleRef.current, active.pen);
    }
  };

  const finish = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeRef.current;
    if (!active || active.id !== e.pointerId) return;
    activeRef.current = null;
    if (active.pen) penActiveUntil.current = Date.now() + 500;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* già rilasciato */
    }
    onChange([...strokesRef.current, active.stroke]);
  };

  return (
    <div
      ref={containerRef}
      className={`draw-surface relative w-full overflow-hidden rounded-3xl bg-white shadow-inner ${className}`}
      style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}
    >
      {guide && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {guide}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block"
        style={{ cursor: readOnly ? "default" : "crosshair" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerLeave={finish}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

interface ToolbarProps {
  tool: Tool;
  onTool: (t: Tool) => void;
  onUndo: () => void;
  onClear: () => void;
  canUndo: boolean;
  compact?: boolean;
}

export function DrawToolbar({ tool, onTool, onUndo, onClear, canUndo, compact }: ToolbarProps) {
  return (
    <div className="no-select flex flex-wrap items-center justify-center gap-2 py-2">
      {PEN_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          aria-label={c.name}
          onClick={() => onTool({ ...tool, color: c.value, erase: false })}
          className={`h-10 w-10 rounded-full border-4 transition active:scale-90 ${
            !tool.erase && tool.color === c.value ? "border-foreground scale-110" : "border-white"
          }`}
          style={{ background: c.value }}
        />
      ))}
      <span className="mx-1 h-8 w-px bg-gray-300" />
      {PEN_WIDTHS.map((w) => (
        <button
          key={w}
          type="button"
          aria-label={`Spessore ${w}`}
          onClick={() => onTool({ ...tool, width: w })}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${
            tool.width === w ? "ring-4 ring-primary" : ""
          }`}
        >
          <span className="rounded-full bg-foreground" style={{ width: w + 4, height: w + 4 }} />
        </button>
      ))}
      <button
        type="button"
        aria-label="Gomma"
        onClick={() => onTool({ ...tool, erase: !tool.erase })}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow ${
          tool.erase ? "ring-4 ring-primary" : ""
        }`}
      >
        🧽
      </button>
      {!compact && <span className="mx-1 h-8 w-px bg-gray-300" />}
      <button
        type="button"
        aria-label="Annulla"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow disabled:opacity-30"
      >
        ↩️
      </button>
      <button
        type="button"
        aria-label="Cancella tutto"
        onClick={onClear}
        disabled={!canUndo}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow disabled:opacity-30"
      >
        🗑️
      </button>
    </div>
  );
}

interface BoardProps {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  fingerAllowed?: boolean;
  guide?: React.ReactNode;
  className?: string;
  initialColor?: string;
}

/** Lavagna completa: barra strumenti + canvas. */
export function DrawingBoard({ strokes, onChange, fingerAllowed, guide, className, initialColor }: BoardProps) {
  const [tool, setTool] = useState<Tool>({ color: initialColor ?? PEN_COLORS[0].value, width: PEN_WIDTHS[1], erase: false });
  return (
    <div className={className}>
      <DrawToolbar
        tool={tool}
        onTool={setTool}
        canUndo={strokes.length > 0}
        onUndo={() => onChange(strokes.slice(0, -1))}
        onClear={() => onChange([])}
      />
      <DrawingCanvas strokes={strokes} onChange={onChange} tool={tool} fingerAllowed={fingerAllowed} guide={guide} />
    </div>
  );
}

/** Anteprima statica (SVG) di un disegno, per le liste. */
export function DrawingPreview({ strokes, className = "" }: { strokes: Stroke[]; className?: string }) {
  return (
    <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className={className} aria-hidden>
      {strokes.map((s, i) => (
        <polyline
          key={i}
          points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={s.erase ? "#fff" : s.color}
          strokeWidth={(s.erase ? s.width * 3 : s.width) * 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
