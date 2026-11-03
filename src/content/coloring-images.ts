/**
 * Disegni da colorare come IMMAGINI (PNG/JPG con linee nere su sfondo bianco).
 *
 * Metti i file in `public/colora/<categoria>/` e lancia `npm run colora:scan`:
 * lo script riempie la lista qui sotto. Il titolo viene dal nome del file
 * (es. `fata-del-fuoco.png` → "Fata del fuoco"). Categorie: usa i nomi delle
 * cartelle (es. pop, fate, eroi, animali, principesse...).
 *
 * I disegni importati dall'app (dal rullino dell'iPad) non passano da qui:
 * restano salvati nel dispositivo.
 */
export interface ImagePage {
  id: string;
  title: string;
  category: string;
  /** percorso pubblico, es. /colora/pop/stella.png */
  src: string;
}

export const IMAGE_PAGES: ImagePage[] = [
  // GENERATO DA scripts/scan-coloring.js — non modificare a mano sotto questa riga
];

export const IMAGE_PAGE_MAP: Record<string, ImagePage> = Object.fromEntries(IMAGE_PAGES.map((p) => [p.id, p]));
