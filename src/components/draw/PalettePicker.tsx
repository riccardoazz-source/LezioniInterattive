"use client";

import { useState } from "react";
import { BUILTIN_PALETTES, useCustomPalettes, type Palette } from "@/lib/palettes";
import { uid } from "@/lib/random";
import { useConfirmDelete } from "@/components/ui/ConfirmDelete";

interface Props {
  color: string;
  onColor: (c: string) => void;
  /** evidenzia il colore scelto (false in modalità gomma) */
  active?: boolean;
}

/**
 * Riga di colori scorrevole + scelta della palette (predefinite e
 * personalizzate). Le palette personalizzate si creano con il selettore
 * colore del sistema e restano salvate nel dispositivo.
 */
export function PalettePicker({ color, onColor, active = true }: Props) {
  const { custom, save, remove } = useCustomPalettes();
  const all = [...BUILTIN_PALETTES, ...custom];
  const [paletteId, setPaletteId] = useState(all[0].id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Palette | null>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();
  const palette = all.find((p) => p.id === paletteId) ?? all[0];

  const startNew = () => {
    setEditing({ id: uid(), name: "La mia palette", colors: [color], custom: true });
  };

  return (
    <div className="flex flex-col gap-1">
      {deleteDialog}
      <div className="no-select flex items-center gap-1">
        <button
          type="button"
          aria-label="Scegli palette"
          onClick={() => setOpen((v) => !v)}
          className={`flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-2 text-sm font-bold shadow ${open ? "ring-2 ring-primary" : ""}`}
        >
          🎨 <span className="max-w-24 truncate">{palette.name}</span> ▾
        </button>
        <div className="flex flex-1 gap-1.5 overflow-x-auto py-1 pr-1" style={{ scrollbarWidth: "none" }}>
          {palette.colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => onColor(c)}
              className={`h-9 w-9 shrink-0 rounded-full border-[3px] transition active:scale-90 ${active && color.toLowerCase() === c.toLowerCase() ? "scale-110 border-foreground" : "border-white"}`}
              style={{ background: c, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }}
            />
          ))}
          <label className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-lg shadow" aria-label="Altro colore" title="Altro colore">
            🌈
            <input type="color" value={color} onChange={(e) => onColor(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
          </label>
        </div>
      </div>

      {open && !editing && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/80 p-2">
          {all.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPaletteId(p.id);
                setOpen(false);
              }}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-bold ${p.id === paletteId ? "bg-foreground text-white" : "bg-white shadow"}`}
            >
              <span className="flex -space-x-1">
                {p.colors.slice(0, 4).map((c) => (
                  <span key={c} className="h-4 w-4 rounded-full border border-white" style={{ background: c }} />
                ))}
              </span>
              {p.name}
              {p.custom && (
                <span
                  role="button"
                  aria-label={`Modifica ${p.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(p);
                  }}
                  className="ml-1 opacity-70"
                >
                  ✏️
                </span>
              )}
            </button>
          ))}
          <button type="button" onClick={startNew} className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-white">
            ＋ Nuova palette
          </button>
        </div>
      )}

      {editing && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow">
          <div className="flex items-center gap-2">
            <input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="min-w-0 flex-1 rounded-xl border-2 border-gray-200 px-3 py-1.5 font-bold outline-none focus:border-primary"
              placeholder="Nome della palette"
            />
            <label className="flex h-9 cursor-pointer items-center gap-1 rounded-full bg-primary px-3 text-sm font-bold text-white">
              ＋ Colore
              <input
                type="color"
                className="h-0 w-0 opacity-0"
                onChange={(e) => {
                  const c = e.target.value;
                  setEditing((ed) => (ed && !ed.colors.includes(c) ? { ...ed, colors: [...ed.colors, c] } : ed));
                }}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {editing.colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Togli ${c}`}
                title="Tocca per togliere"
                onClick={() => setEditing({ ...editing, colors: editing.colors.filter((x) => x !== c) })}
                className="relative h-9 w-9 rounded-full border-[3px] border-white shadow"
                style={{ background: c }}
              >
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] shadow">✕</span>
              </button>
            ))}
            {editing.colors.length === 0 && <span className="text-sm text-muted">Aggiungi almeno un colore.</span>}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              {custom.some((p) => p.id === editing.id) && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!(await confirmDelete(`Eliminare la palette «${editing.name}»?`))) return;
                    remove(editing.id);
                    if (paletteId === editing.id) setPaletteId(all[0].id);
                    setEditing(null);
                  }}
                  className="rounded-full bg-danger px-3 py-1 text-sm font-bold text-white"
                >
                  🗑️ Elimina
                </button>
              )}
              <button type="button" onClick={() => setEditing(null)} className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
                Annulla
              </button>
            </div>
            <button
              type="button"
              disabled={editing.colors.length === 0}
              onClick={() => {
                save(editing);
                setPaletteId(editing.id);
                setEditing(null);
                setOpen(false);
              }}
              className="rounded-full bg-success px-4 py-1 text-sm font-bold text-white disabled:opacity-40"
            >
              ✓ Salva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
