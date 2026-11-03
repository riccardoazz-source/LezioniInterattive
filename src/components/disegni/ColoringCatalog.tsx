"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COLORING_CATEGORIES, categoryInfo, categoryOrder } from "@/content/coloring-categories";
import { IMAGE_PAGES } from "@/content/coloring-images";
import { listCustomPages, listDrawings, removeCustomPage, removeDrawing, saveCustomPage, type CustomPage, type SavedDrawing } from "@/lib/storage/drawings";
import { compressImage } from "@/lib/image";
import { uid } from "@/lib/random";
import { Button } from "@/components/ui/Button";
import { useConfirmDelete } from "@/components/ui/ConfirmDelete";

const ALL_CATEGORIES = COLORING_CATEGORIES;
const catInfo = categoryInfo;

interface ImgItem {
  id: string;
  title: string;
  category: string;
  src: string;
  thumb?: string;
  custom: boolean;
}

export function ColoringCatalog() {
  const [saved, setSaved] = useState<Record<string, SavedDrawing>>({});
  const [custom, setCustom] = useState<CustomPage[]>([]);
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("pop");
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirmDelete, deleteDialog] = useConfirmDelete();

  useEffect(() => {
    listDrawings().then((all) => {
      const map: Record<string, SavedDrawing> = {};
      for (const d of all) if (d.kind === "image" && d.pageId) map[d.pageId] = d;
      setSaved(map);
    });
    listCustomPages().then(setCustom);
  }, []);

  const importFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImporting(true);
    const added: CustomPage[] = [];
    for (const f of Array.from(files)) {
      try {
        const dataUrl = await compressImage(f, 1400, 0.9);
        const base = title.trim() || f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const page: CustomPage = { id: uid(), title: files.length > 1 && title.trim() ? `${base} ${added.length + 1}` : base, category, dataUrl, createdAt: new Date().toISOString() };
        await saveCustomPage(page);
        added.push(page);
      } catch {
        alert("Non riesco a leggere questa immagine.");
      }
    }
    setCustom((c) => [...c, ...added]);
    setTitle("");
    setImporting(false);
    setShowImport(false);
  };

  const removeCustom = async (p: CustomPage) => {
    if (!(await confirmDelete(`Eliminare il disegno «${p.title}»?`))) return;
    await removeCustomPage(p.id);
    await removeDrawing(`img-${p.id}`).catch(() => {});
    setCustom((c) => c.filter((x) => x.id !== p.id));
  };

  const images: ImgItem[] = [
    ...IMAGE_PAGES.map((p) => ({ id: p.id, title: p.title, category: p.category, src: p.src, thumb: p.thumb, custom: false })),
    ...custom.map((p) => ({ id: p.id, title: p.title, category: p.category, src: p.dataUrl, custom: true })),
  ];
  const imageCats = Array.from(new Set(images.map((i) => i.category))).sort((a, b) => categoryOrder(a) - categoryOrder(b));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-8">
      {deleteDialog}

      {/* Importa */}
      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">➕ Aggiungi un disegno</h2>
            <p className="text-sm text-muted">Un&apos;immagine con linee nere su sfondo bianco, dal rullino o da un generatore di immagini.</p>
          </div>
          <Button size="md" onClick={() => setShowImport((v) => !v)}>
            {showImport ? "Chiudi" : "Aggiungi"}
          </Button>
        </div>
        {showImport && (
          <div className="mt-3 flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo (facoltativo, altrimenti il nome del file)"
              className="rounded-xl border-2 border-gray-200 px-3 py-2 text-lg font-bold outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={`rounded-full px-3 py-1 text-sm font-bold ${category === c.id ? "bg-foreground text-white" : c.color}`}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
            <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { importFiles(e.target.files); e.target.value = ""; }} />
            <Button onClick={() => fileInput.current?.click()} disabled={importing}>
              {importing ? "Importo…" : "📷 Scegli le immagini"}
            </Button>
            <p className="text-xs text-muted">
              Suggerimento per generare i disegni: &quot;coloring page for kids, thick clean black outlines, white background, no shading, chibi pop star girl singing with a microphone&quot;.
            </p>
          </div>
        )}
      </section>

      {/* Disegni immagine */}
      {imageCats.map((catId) => {
        const cat = catInfo(catId);
        return (
          <section key={catId}>
            <h2 className="mb-2 text-lg font-black">
              {cat.emoji} {cat.name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images
                .filter((p) => p.category === catId)
                .map((p) => {
                  const s = saved[p.id];
                  return (
                    <div key={p.id} className={`relative overflow-hidden rounded-3xl ${cat.color} shadow-md`}>
                      <Link href={`/disegni/colora/immagine/${p.id}`} className="no-select block transition active:scale-95">
                        <div className="m-2 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s?.thumbnail ?? p.thumb ?? p.src} alt={p.title} className="h-full w-full object-contain" loading="lazy" decoding="async" />
                        </div>
                        <div className="flex items-center justify-between px-3 pb-2">
                          <span className="truncate font-black">{p.title}</span>
                          {s && (s.paintOps?.length || s.strokes.length) ? <span className="text-xs font-bold text-muted">iniziato</span> : null}
                        </div>
                      </Link>
                      {p.custom && (
                        <button type="button" aria-label="Elimina disegno" onClick={() => removeCustom(custom.find((c) => c.id === p.id)!)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-base shadow">
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        );
      })}

      {images.length === 0 && (
        <p className="rounded-3xl bg-white p-5 text-center text-muted shadow-sm">
          Nessun disegno-immagine ancora. Aggiungine uno qui sopra, oppure metti i file in <code>public/colora/</code> (vedi README).
        </p>
      )}

    </div>
  );
}
