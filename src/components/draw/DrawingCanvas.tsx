"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOARD_H, BOARD_W, type BrushKind, type Stroke, type StrokePoint } from "@/lib/storage/types";

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
  kind?: BrushKind;
}

export const BRUSHES: { kind: BrushKind; name: string; emoji: string }[] = [
  { kind: "pen", name: "Penna", emoji: "🖊️" },
  { kind: "pencil", name: "Matita", emoji: "✏️" },
  { kind: "marker", name: "Pennarello", emoji: "🖍️" },
  { kind: "watercolor", name: "Acquerello", emoji: "💧" },
  { kind: "brush", name: "Pennello", emoji: "🖌️" },
];

/** Caratteristiche di ogni strumento. */
const BRUSH_STYLE: Record<BrushKind, { widthMul: number; alpha: number; cap: CanvasLineCap; pressure: [number, number]; blur: number; jitter: number; taper: boolean }> = {
  pen: { widthMul: 1, alpha: 1, cap: "round", pressure: [0.35, 1.3], blur: 0, jitter: 0, taper: false },
  pencil: { widthMul: 0.45, alpha: 0.85, cap: "round", pressure: [0.6, 0.8], blur: 0, jitter: 1.2, taper: false },
  marker: { widthMul: 2.8, alpha: 0.45, cap: "butt", pressure: [1, 0], blur: 0, jitter: 0, taper: false },
  watercolor: { widthMul: 4, alpha: 0.16, cap: "round", pressure: [0.7, 0.6], blur: 1.2, jitter: 0, taper: false },
  brush: { widthMul: 2.2, alpha: 1, cap: "round", pressure: [0.2, 1.6], blur: 0, jitter: 0, taper: true },
};

interface CanvasProps {
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  tool: Tool;
  fingerAllowed?: boolean;
  readOnly?: boolean;
  /** contenuto mostrato dietro la lavagna (es. lettera da ricalcare) */
  guide?: React.ReactNode;
  className?: string;
  /** senza sfondo bianco: per sovrapporre la lavagna a un disegno */
  transparent?: boolean;
  /** riempie il contenitore assoluto invece di avere un proprio aspect ratio */
  fill?: boolean;
  /** dimensione logica (default: lavagna 1000 × 700) */
  logicalW?: number;
  logicalH?: number;
}

function strokeWidth(stroke: Stroke, p: number, pen: boolean, t = 0.5): number {
  if (stroke.erase) return stroke.width * 3;
  const st = BRUSH_STYLE[stroke.kind ?? "pen"];
  let base = stroke.width * st.widthMul;
  if (st.taper) {
    // pennello: sottile all'inizio e alla fine, pieno al centro (t = posizione 0..1 nel tratto)
    const prof = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
    base *= 0.25 + 0.75 * Math.pow(prof, 0.6);
  }
  return pen ? base * (st.pressure[0] + st.pressure[1] * p) : base;
}

/** Imposta trasparenza, sfumatura e composizione per il tratto. */
function applyStyle(ctx: CanvasRenderingContext2D, stroke: Stroke, scale: number) {
  if (stroke.erase) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = ctx.fillStyle = "#000";
    return;
  }
  const st = BRUSH_STYLE[stroke.kind ?? "pen"];
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = st.alpha;
  ctx.shadowBlur = st.blur * stroke.width * scale;
  ctx.shadowColor = st.blur ? stroke.color : "transparent";
  ctx.strokeStyle = ctx.fillStyle = stroke.color;
}

/** Piccolo tremolio deterministico per la matita. */
function jitter(stroke: Stroke, i: number): number {
  const st = BRUSH_STYLE[stroke.kind ?? "pen"];
  if (!st.jitter || stroke.erase) return 0;
  const x = Math.sin(i * 12.9898 + stroke.points.length * 78.233) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * st.jitter;
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  a: StrokePoint,
  b: StrokePoint,
  scale: number,
  pen: boolean,
) {
  applyStyle(ctx, stroke, scale);
  const st = BRUSH_STYLE[stroke.kind ?? "pen"];
  ctx.lineCap = stroke.erase ? "round" : st.cap;
  ctx.lineJoin = "round";
  const idx = stroke.points.indexOf(b);
  const t = stroke.points.length > 1 ? idx / (stroke.points.length - 1) : 0.5;
  ctx.lineWidth = strokeWidth(stroke, (a.p + b.p) / 2, pen, t) * scale;
  const j = jitter(stroke, Math.round(b.x + b.y));
  ctx.beginPath();
  ctx.moveTo(a.x * scale, a.y * scale);
  ctx.lineTo((b.x + j) * scale, (b.y + j) * scale);
  ctx.stroke();
  if (st.jitter) {
    // matita: seconda linea sottile leggermente spostata = grana
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(1, ctx.lineWidth * 0.5);
    ctx.beginPath();
    ctx.moveTo((a.x + j * 1.5) * scale, (a.y - j) * scale);
    ctx.lineTo((b.x - j) * scale, (b.y + j * 1.5) * scale);
    ctx.stroke();
  }
}

function drawDot(ctx: CanvasRenderingContext2D, stroke: Stroke, a: StrokePoint, scale: number, pen: boolean) {
  applyStyle(ctx, stroke, scale);
  ctx.beginPath();
  ctx.arc(a.x * scale, a.y * scale, (strokeWidth(stroke, a.p, pen) * scale) / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Un tratto intero in un colpo solo: così la trasparenza di pennarello e
 * acquerello è uniforme (non si scurisce dove i segmenti si sovrappongono).
 */
function drawWholeStroke(ctx: CanvasRenderingContext2D, s: Stroke, scale: number) {
  const pen = isPenStroke(s);
  if (s.points.length === 1) {
    drawDot(ctx, s, s.points[0], scale, pen);
    return;
  }
  const st = BRUSH_STYLE[s.kind ?? "pen"];
  const variable = !s.erase && (st.taper || st.jitter > 0 || (pen && st.pressure[1] > 0.5));
  if (variable) {
    // spessore variabile: segmenti, ma con trasparenza piena (la penna/pennello è opaco)
    for (let i = 1; i < s.points.length; i++) drawSegment(ctx, s, s.points[i - 1], s.points[i], scale, pen);
    return;
  }
  applyStyle(ctx, s, scale);
  ctx.lineCap = s.erase ? "round" : st.cap;
  ctx.lineJoin = "round";
  const avgP = s.points.reduce((acc, p) => acc + p.p, 0) / s.points.length;
  ctx.lineWidth = strokeWidth(s, avgP, pen) * scale;
  const tracePath = () => {
    ctx.beginPath();
    ctx.moveTo(s.points[0].x * scale, s.points[0].y * scale);
    for (let i = 1; i < s.points.length; i++) {
      const j = jitter(s, i);
      ctx.lineTo((s.points[i].x + j) * scale, (s.points[i].y + j) * scale);
    }
  };
  tracePath();
  ctx.stroke();
  if (s.kind === "watercolor") {
    // centro più "bagnato" e bordi che restano chiari
    ctx.lineWidth *= 0.55;
    ctx.globalAlpha = 0.14;
    ctx.shadowBlur = 0;
    tracePath();
    ctx.stroke();
  }
}

/** Un tratto con pressione variabile viene disegnato "a tratti con penna". */
function isPenStroke(s: Stroke): boolean {
  return s.points.some((pt) => pt.p !== 0.5);
}

export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], scale: number) {
  for (const s of strokes) drawWholeStroke(ctx, s, scale);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function DrawingCanvas({
  strokes,
  onChange,
  tool,
  fingerAllowed = true,
  readOnly = false,
  guide,
  className = "",
  transparent = false,
  fill = false,
  logicalW = BOARD_W,
  logicalH = BOARD_H,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleRef = useRef(1); // pixel CSS per unità logica
  const activeRef = useRef<{ id: number; stroke: Stroke; pen: boolean; live: boolean } | null>(null);
  const scratchRef = useRef<HTMLCanvasElement>(null);
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
      for (const c of [canvas, scratchRef.current]) {
        if (!c) continue;
        c.width = Math.round(rect.width * dpr);
        c.height = Math.round(rect.height * dpr);
        c.style.width = `${rect.width}px`;
        c.style.height = `${rect.height}px`;
      }
      scaleRef.current = rect.width / logicalW;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [redraw, logicalW]);

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
    const stroke: Stroke = { color: tool.color, width: tool.width, erase: tool.erase || undefined, kind: tool.erase ? undefined : tool.kind, points: [point] };
    // Tratti trasparenti (pennarello, acquerello, matita): anteprima su un livello separato
    const st = BRUSH_STYLE[stroke.kind ?? "pen"];
    const live = !stroke.erase && st.alpha < 1;
    activeRef.current = { id: e.pointerId, stroke, pen, live };
    const ctx = (live ? scratchRef.current : canvasRef.current)?.getContext("2d");
    if (ctx) {
      if (live) {
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, scratchRef.current!.width / dpr, scratchRef.current!.height / dpr);
      }
      drawDot(ctx, stroke, point, scaleRef.current, pen);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeRef.current;
    if (!active || active.id !== e.pointerId) return;
    const ctx = (active.live ? scratchRef.current : canvasRef.current)?.getContext("2d");
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
    if (active.live && scratchRef.current) {
      const sctx = scratchRef.current.getContext("2d");
      sctx?.clearRect(0, 0, scratchRef.current.width, scratchRef.current.height);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) drawWholeStroke(ctx, active.stroke, scaleRef.current);
    }
    onChange([...strokesRef.current, active.stroke]);
  };

  return (
    <div
      ref={containerRef}
      className={`draw-surface overflow-hidden rounded-3xl ${fill ? "absolute inset-0" : "relative w-full"} ${
        transparent ? "" : "bg-white shadow-inner"
      } ${className}`}
      style={fill ? undefined : { aspectRatio: `${logicalW} / ${logicalH}` }}
    >
      {guide && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          {guide}
        </div>
      )}
      <canvas ref={scratchRef} className="pointer-events-none absolute inset-0 block" aria-hidden />
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
      {BRUSHES.map((b) => (
        <button
          key={b.kind}
          type="button"
          aria-label={b.name}
          title={b.name}
          onClick={() => onTool({ ...tool, kind: b.kind, erase: false })}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shadow ${!tool.erase && (tool.kind ?? "pen") === b.kind ? "bg-foreground text-white" : "bg-white"}`}
        >
          {b.emoji}
        </button>
      ))}
      <span className="mx-1 h-8 w-px bg-gray-300" />
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
