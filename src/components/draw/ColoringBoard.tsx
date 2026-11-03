"use client";

import { useConfirmDelete } from "@/components/ui/ConfirmDelete";
import { useState } from "react";
import type { ColoringPage } from "@/content/coloring";
import { BOARD_H, BOARD_W, type Stroke } from "@/lib/storage/types";
import { DrawingCanvas, PEN_WIDTHS, type Tool } from "./DrawingCanvas";

/** Tavolozza per colorare: tanti colori, anche pastello. */
export const COLORING_PALETTE = [
  "#ffffff",
  "#2b2d42",
  "#ef476f",
  "#ff7b54",
  "#ffb703",
  "#fff176",
  "#06d6a0",
  "#4caf50",
  "#118ab2",
  "#64b5f6",
  "#8338ec",
  "#f8a5c2",
  "#a1887f",
  "#ffe0b2",
];

type Mode = "fill" | "pen" | "erase";

interface Props {
  page: ColoringPage;
  fills: Record<string, string>;
  strokes: Stroke[];
  onFills: (f: Record<string, string>) => void;
  onStrokes: (s: Stroke[]) => void;
  fingerAllowed?: boolean;
}

/**
 * Disegno da colorare: tocca una zona per riempirla (secchiello), oppure
 * passa alla penna per disegnare sopra con Apple Pencil.
 */
export function ColoringBoard({ page, fills, strokes, onFills, onStrokes, fingerAllowed }: Props) {
  const [color, setColor] = useState(COLORING_PALETTE[2]);
  const [mode, setMode] = useState<Mode>("fill");
  const [width, setWidth] = useState(PEN_WIDTHS[1]);
  const [fillHistory, setFillHistory] = useState<Record<string, string>[]>([]);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  const tool: Tool = { color, width, erase: mode === "erase" };

  const fillRegion = (id: string) => {
    if (mode !== "fill") return;
    setFillHistory((h) => [...h.slice(-30), fills]);
    onFills({ ...fills, [id]: color });
  };

  const undo = () => {
    if (mode === "fill" && fillHistory.length) {
      onFills(fillHistory[fillHistory.length - 1]);
      setFillHistory((h) => h.slice(0, -1));
    } else if (strokes.length) {
      onStrokes(strokes.slice(0, -1));
    }
  };

  const clearAll = async () => {
    if (!(await confirmDelete("Ricominciare da capo questo disegno?"))) return;
    setFillHistory([]);
    onFills({});
    onStrokes([]);
  };

  const modeBtn = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`rounded-full px-4 py-2 text-base font-black shadow ${mode === m ? "bg-foreground text-white" : "bg-white"}`}
    >
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
            <button
              key={w}
              type="button"
              aria-label={`Spessore ${w}`}
              onClick={() => setWidth(w)}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${width === w ? "ring-4 ring-primary" : ""}`}
            >
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
      <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-inner" style={{ aspectRatio: `${BOARD_W} / ${BOARD_H}` }}>
        <ColoringSvg page={page} fills={fills} onRegion={fillRegion} interactive={mode === "fill"} className="absolute inset-0 h-full w-full" />
        <DrawingCanvas
          strokes={strokes}
          onChange={onStrokes}
          tool={tool}
          fingerAllowed={fingerAllowed}
          transparent
          fill
          className={mode === "fill" ? "pointer-events-none" : ""}
        />
      </div>
    </div>
  );
}

interface SvgProps {
  page: ColoringPage;
  fills: Record<string, string>;
  onRegion?: (id: string) => void;
  interactive?: boolean;
  className?: string;
  strokes?: Stroke[];
}

/** L'SVG del disegno: usato sia per colorare sia come anteprima. */
export function ColoringSvg({ page, fills, onRegion, interactive = false, className = "", strokes }: SvgProps) {
  return (
    <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className={className} aria-label={page.title}>
      {page.regions.map((r) => (
        <path
          key={r.id}
          d={r.d}
          fill={fills[r.id] ?? r.fill ?? "#ffffff"}
          stroke="#2b2d42"
          strokeWidth={r.stroke ?? (r.id === "sfondo" ? 0 : 5)}
          strokeLinejoin="round"
          onPointerDown={interactive && onRegion ? () => onRegion(r.id) : undefined}
          style={interactive ? { cursor: "pointer" } : undefined}
        />
      ))}
      {page.lines?.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2b2d42" strokeWidth={5} strokeLinecap="round" />
      ))}
      {strokes?.map((s, i) => (
        <polyline
          key={`s${i}`}
          points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={s.erase ? "#fff" : s.color}
          strokeWidth={s.erase ? s.width * 3 : s.width * 1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
