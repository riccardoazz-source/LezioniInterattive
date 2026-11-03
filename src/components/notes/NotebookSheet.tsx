"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_H, PAGE_W, type NoteImage, type NotePage, type Stroke } from "@/lib/storage/types";
import { DrawingCanvas, type Tool } from "@/components/draw/DrawingCanvas";

export type SheetMode = "pen" | "text" | "photo";

interface Props {
  page: NotePage;
  mode: SheetMode;
  tool: Tool;
  fingerAllowed: boolean;
  readOnly?: boolean;
  onStrokes: (s: Stroke[]) => void;
  onText: (t: string) => void;
  onImages: (imgs: NoteImage[]) => void;
  selectedImage: string | null;
  onSelectImage: (id: string | null) => void;
  /** altezza massima disponibile in px (per far entrare il foglio nello schermo) */
  maxHeight: number;
  /** carta a righe (quaderno) oppure foglio bianco (disegno) */
  lined?: boolean;
}

const LINE = 56; // interlinea in unità logiche
const MARGIN = 90; // margine rosso
const FONT = 38;

/**
 * Il foglio del quaderno: carta a righe a tutta pagina su cui si scrive con
 * la Pencil (canvas), con la tastiera (textarea trasparente) e si mettono foto.
 * Tutto è in coordinate logiche PAGE_W × PAGE_H, quindi la pagina appare
 * identica su iPhone, iPad e PC.
 */
export function NotebookSheet({ page, mode, tool, fingerAllowed, readOnly, onStrokes, onText, onImages, selectedImage, onSelectImage, maxHeight, lined = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const drag = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.getBoundingClientRect().width / PAGE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Il foglio è largo quanto il contenitore, ma non più alto dello schermo.
  const widthByHeight = (maxHeight * PAGE_W) / PAGE_H;

  const px = (v: number) => v * scale;

  const startDrag = (e: React.PointerEvent, img: NoteImage) => {
    if (mode !== "photo" || readOnly) return;
    e.preventDefault();
    onSelectImage(img.id);
    drag.current = { id: img.id, startX: e.clientX, startY: e.clientY, ox: img.x, oy: img.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const nx = Math.max(-200, Math.min(PAGE_W - 100, d.ox + (e.clientX - d.startX) / scale));
    const ny = Math.max(-200, Math.min(PAGE_H - 100, d.oy + (e.clientY - d.startY) / scale));
    onImages(page.images.map((im) => (im.id === d.id ? { ...im, x: Math.round(nx), y: Math.round(ny) } : im)));
  };
  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div className="flex w-full justify-center">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-xl bg-white shadow-lg"
        style={{
          width: "100%",
          maxWidth: `${widthByHeight}px`,
          aspectRatio: `${PAGE_W} / ${PAGE_H}`,
          backgroundImage: !lined ? undefined : `repeating-linear-gradient(to bottom, transparent 0, transparent ${px(LINE) - 1.5}px, #cfe0f5 ${px(LINE) - 1.5}px, #cfe0f5 ${px(LINE)}px), linear-gradient(to right, transparent ${px(MARGIN) - 2}px, #f4b6c2 ${px(MARGIN) - 2}px, #f4b6c2 ${px(MARGIN)}px, transparent ${px(MARGIN)}px)`,
          backgroundPosition: lined ? `0 ${px(LINE * 0.9)}px, 0 0` : undefined,
          backgroundRepeat: lined ? "repeat, no-repeat" : undefined,
        }}
      >
        {/* Foto */}
        {page.images.map((img) => (
          <div
            key={img.id}
            className={`absolute select-none ${mode === "photo" && !readOnly ? "cursor-move" : "pointer-events-none"} ${selectedImage === img.id ? "ring-4 ring-primary" : ""}`}
            style={{ left: px(img.x), top: px(img.y), width: px(img.w), touchAction: "none" }}
            onPointerDown={(e) => startDrag(e, img)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.dataUrl} alt="" className="block w-full rounded-lg" draggable={false} />
          </div>
        ))}

        {/* Testo digitato */}
        <textarea
          value={page.text}
          onChange={(e) => onText(e.target.value)}
          readOnly={readOnly || mode !== "text"}
          spellCheck={false}
          placeholder={mode === "text" && !readOnly ? "Scrivi qui…" : ""}
          className={`absolute inset-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent font-semibold text-[#1b2a4a] outline-none ${
            mode === "text" && !readOnly ? "" : "pointer-events-none"
          }`}
          style={{
            paddingLeft: px(MARGIN + 14),
            paddingRight: px(30),
            paddingTop: px(LINE * 0.9 - FONT * 1.02),
            fontSize: px(FONT),
            lineHeight: `${px(LINE)}px`,
            fontFamily: "var(--font-nunito), ui-rounded, sans-serif",
          }}
        />

        {/* Penna */}
        <DrawingCanvas
          strokes={page.drawing}
          onChange={onStrokes}
          tool={tool}
          fingerAllowed={fingerAllowed}
          readOnly={readOnly || mode !== "pen"}
          transparent
          fill
          logicalW={PAGE_W}
          logicalH={PAGE_H}
          className={`rounded-xl ${mode === "pen" && !readOnly ? "" : "pointer-events-none"}`}
        />
      </div>
    </div>
  );
}
