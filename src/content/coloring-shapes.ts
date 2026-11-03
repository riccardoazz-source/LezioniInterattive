/** Tipi e forme base per i disegni da colorare (spazio 1000 × 700). */

export type ColoringCategoryId = "animali" | "piante" | "bamboline" | "fate" | "eroi" | "cartoni" | "pop";

export interface ColoringRegion {
  id: string;
  d: string;
  /** colore iniziale (es. pupille nere); si può comunque ricolorare */
  fill?: string;
  /** spessore del contorno (0 = nessuno); default 5 */
  stroke?: number;
}

export interface ColoringPage {
  id: string;
  category: ColoringCategoryId;
  title: string;
  emoji: string;
  regions: ColoringRegion[];
  lines?: string[];
}


// ---------- helper geometrici ----------
const f = (n: number) => Math.round(n * 10) / 10;
export const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r === 0
    ? `M${x} ${y}h${w}v${h}h${-w}Z`
    : `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
export const poly = (...pts: [number, number][]) => `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;
export const star = (cx: number, cy: number, rOut: number, rIn: number, n: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return poly(...pts);
};
/** petalo triangolare che punta fuori dal centro */
export const petal = (cx: number, cy: number, angleDeg: number, rBase: number, rTip: number, halfWidthDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  const w = (halfWidthDeg * Math.PI) / 180;
  return poly(
    [cx + rBase * Math.cos(a - w), cy + rBase * Math.sin(a - w)],
    [cx + rTip * Math.cos(a), cy + rTip * Math.sin(a)],
    [cx + rBase * Math.cos(a + w), cy + rBase * Math.sin(a + w)],
  );
};

