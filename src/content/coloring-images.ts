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
  {"id":"pop-derpy","title":"Derpy","category":"pop","src":"/colora/pop/derpy.png"},
  {"id":"pop-huntrix-2","title":"Huntrix 2","category":"pop","src":"/colora/pop/huntrix-2.png"},
  {"id":"pop-huntrix","title":"Huntrix","category":"pop","src":"/colora/pop/huntrix.png"},
  {"id":"pop-mira-2","title":"Mira 2","category":"pop","src":"/colora/pop/mira-2.png"},
  {"id":"pop-mira","title":"Mira","category":"pop","src":"/colora/pop/mira.png"},
  {"id":"pop-rumi","title":"Rumi","category":"pop","src":"/colora/pop/rumi.png"},
  {"id":"pop-zoey-2","title":"Zoey 2","category":"pop","src":"/colora/pop/zoey-2.png"},
  {"id":"pop-zoey","title":"Zoey","category":"pop","src":"/colora/pop/zoey.png"},
];

export const IMAGE_PAGE_MAP: Record<string, ImagePage> = Object.fromEntries(IMAGE_PAGES.map((p) => [p.id, p]));
