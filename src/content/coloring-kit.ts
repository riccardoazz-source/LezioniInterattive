/**
 * Kit per disegnare personaggi cartoon da colorare (stile "occhioni").
 * Coordinate locali: centro della testa in (0,0), raggio testa ≈ 100.
 * Il kit trasla (x, y) e scala (s) nello spazio 1000 × 700 della pagina.
 */
import { circle, ellipse, poly, rect, star, type ColoringRegion } from "./coloring-shapes";

const f = (n: number) => Math.round(n * 10) / 10;

export interface Part {
  regions: ColoringRegion[];
  lines: string[];
}

export function kit(x: number, y: number, s: number) {
  const X = (px: number) => f(x + px * s);
  const Y = (py: number) => f(y + py * s);
  const L = (px: number, py: number) => `${X(px)} ${Y(py)}`;
  return {
    s,
    L,
    C: (cx: number, cy: number, r: number) => circle(x + cx * s, y + cy * s, r * s),
    E: (cx: number, cy: number, rx: number, ry: number) => ellipse(x + cx * s, y + cy * s, rx * s, ry * s),
    R: (rx: number, ry: number, w: number, h: number, rad = 0) => rect(x + rx * s, y + ry * s, w * s, h * s, rad * s),
    P: (...pts: [number, number][]) => poly(...pts.map(([px, py]) => [x + px * s, y + py * s] as [number, number])),
    S: (cx: number, cy: number, ro: number, ri: number, n: number) => star(x + cx * s, y + cy * s, ro * s, ri * s, n),
  };
}
export type Kit = ReturnType<typeof kit>;

const merge = (...parts: Part[]): Part => ({
  regions: parts.flatMap((p) => p.regions),
  lines: parts.flatMap((p) => p.lines),
});
export const part = (regions: ColoringRegion[], lines: string[] = []): Part => ({ regions, lines });
export const join = merge;

// ---------------- TESTA E VISO ----------------
export function head(k: Kit, id = "viso"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(-95, -10)}C${L(-95, -75)} ${L(-55, -100)} ${L(0, -100)}C${L(55, -100)} ${L(95, -75)} ${L(95, -10)}C${L(95, 55)} ${L(50, 112)} ${L(0, 112)}C${L(-50, 112)} ${L(-95, 55)} ${L(-95, -10)}Z`,
    },
  ]);
}

/** Occhioni grandi con iride, pupilla e riflesso. `w` = metà larghezza. */
export function eyes(k: Kit, opts: { w?: number; y?: number; dx?: number; lashes?: boolean; brows?: boolean } = {}): Part {
  const { w = 26, y = 15, dx = 40, lashes = true, brows = true } = opts;
  const { L, E, C } = k;
  const h = w * 1.25;
  const regions: ColoringRegion[] = [];
  const lines: string[] = [];
  for (const side of [-1, 1] as const) {
    const cx = side * dx;
    const n = side < 0 ? "sx" : "dx";
    regions.push({ id: `occhio-${n}`, d: E(cx, y, w, h) });
    regions.push({ id: `iride-${n}`, d: C(cx, y + h * 0.15, w * 0.72) });
    regions.push({ id: `pupilla-${n}`, d: C(cx, y + h * 0.22, w * 0.38) });
    regions.push({ id: `riflesso-${n}`, d: C(cx - w * 0.3, y - h * 0.2, w * 0.26) });
    if (lashes) lines.push(`M${L(cx - w, y - h * 0.3)}Q${L(cx, y - h * 1.15)} ${L(cx + w, y - h * 0.3)}`);
    if (brows) lines.push(`M${L(cx - w * 0.9, y - h * 1.45)}Q${L(cx, y - h * 1.75)} ${L(cx + w * 0.9, y - h * 1.4)}`);
  }
  return part(regions, lines);
}

export function face(k: Kit, opts: { cheeks?: boolean; smile?: "small" | "big" | "open" } = {}): Part {
  const { cheeks = true, smile = "small" } = opts;
  const { L, C, E } = k;
  const regions: ColoringRegion[] = [];
  const lines: string[] = [`M${L(-3, 44)}L${L(3, 54)}`];
  if (cheeks) regions.push({ id: "guancia-sx", d: C(-70, 50, 11) }, { id: "guancia-dx", d: C(70, 50, 11) });
  if (smile === "small") lines.push(`M${L(-14, 68)}Q${L(0, 82)} ${L(14, 68)}`);
  if (smile === "big") lines.push(`M${L(-26, 64)}Q${L(0, 92)} ${L(26, 64)}`);
  if (smile === "open") regions.push({ id: "bocca", d: E(0, 74, 20, 12) });
  return part(regions, lines);
}

// ---------------- CAPELLI ----------------
/** Capelli lunghi e mossi (dietro la testa). */
export function hairLongBack(k: Kit, id = "capelli"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(-108, -20)}C${L(-110, -90)} ${L(-60, -130)} ${L(0, -130)}C${L(60, -130)} ${L(110, -90)} ${L(108, -20)}C${L(118, 80)} ${L(145, 200)} ${L(130, 340)}Q${L(105, 300)} ${L(88, 345)}Q${L(72, 300)} ${L(52, 335)}L${L(58, 140)}L${L(-58, 140)}L${L(-52, 335)}Q${L(-72, 300)} ${L(-88, 345)}Q${L(-105, 300)} ${L(-130, 340)}C${L(-145, 200)} ${L(-118, 80)} ${L(-108, -20)}Z`,
    },
  ]);
}

/** Caschetto (dietro la testa). */
export function hairBobBack(k: Kit, id = "capelli"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(-108, -20)}C${L(-110, -90)} ${L(-60, -130)} ${L(0, -130)}C${L(60, -130)} ${L(110, -90)} ${L(108, -20)}C${L(115, 60)} ${L(120, 120)} ${L(105, 150)}Q${L(80, 130)} ${L(60, 150)}L${L(60, 120)}L${L(-60, 120)}L${L(-60, 150)}Q${L(-80, 130)} ${L(-105, 150)}C${L(-120, 120)} ${L(-115, 60)} ${L(-108, -20)}Z`,
    },
  ]);
}

/** Frangia con ciocche (sopra la testa). */
export function bangs(k: Kit, id = "frangia"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(-100, -15)}C${L(-100, -80)} ${L(-60, -120)} ${L(0, -120)}C${L(60, -120)} ${L(100, -80)} ${L(100, -15)}Q${L(88, -50)} ${L(72, -18)}Q${L(58, -65)} ${L(32, -24)}Q${L(12, -70)} ${L(-14, -22)}Q${L(-40, -65)} ${L(-60, -18)}Q${L(-82, -55)} ${L(-100, -15)}Z`,
    },
  ]);
}

/** Frangia laterale spettinata (sopra la testa). */
export function bangsSide(k: Kit, id = "frangia"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(-100, -15)}C${L(-100, -80)} ${L(-60, -120)} ${L(0, -120)}C${L(60, -120)} ${L(100, -80)} ${L(100, -15)}Q${L(92, -55)} ${L(78, -8)}C${L(60, -70)} ${L(-10, -85)} ${L(-62, -30)}Q${L(-85, -55)} ${L(-100, -15)}Z`,
    },
  ]);
}

/** Codini laterali (dietro). */
export function pigtails(k: Kit): Part {
  const { E, P } = k;
  return part([
    { id: "codino-sx", d: E(-128, 60, 36, 95) },
    { id: "codino-dx", d: E(128, 60, 36, 95) },
    { id: "fiocco-sx", d: P([-100, -10], [-150, -35], [-150, 15]) },
    { id: "fiocco-dx", d: P([100, -10], [150, -35], [150, 15]) },
  ]);
}

/** Coda di cavallo alta (dietro). */
export function ponytail(k: Kit, id = "coda-capelli"): Part {
  const { L } = k;
  return part([
    {
      id,
      d: `M${L(40, -110)}C${L(120, -150)} ${L(200, -80)} ${L(190, 40)}C${L(185, 130)} ${L(150, 220)} ${L(120, 280)}Q${L(125, 200)} ${L(100, 150)}Q${L(120, 100)} ${L(95, 40)}Q${L(110, -20)} ${L(60, -70)}Z`,
    },
    { id: "elastico", d: k.C(75, -80, 16) },
  ]);
}

/** Capelli corti a punte (sopra la testa). */
export function hairSpiky(k: Kit, id = "capelli"): Part {
  const { P } = k;
  return part([
    {
      id,
      d: P([-100, -10], [-112, -70], [-70, -88], [-62, -135], [-22, -102], [8, -145], [42, -102], [82, -130], [84, -82], [112, -62], [100, -10], [50, -42], [0, -38], [-50, -42]),
    },
  ]);
}

/** Cappuccio (dietro la testa) con mantello. */
export function hoodCloak(k: Kit): Part {
  const { L } = k;
  return part([
    {
      id: "mantello",
      d: `M${L(-135, 20)}C${L(-140, -130)} ${L(140, -130)} ${L(135, 20)}C${L(150, 150)} ${L(165, 300)} ${L(150, 440)}Q${L(80, 410)} ${L(0, 445)}Q${L(-80, 410)} ${L(-150, 440)}C${L(-165, 300)} ${L(-150, 150)} ${L(-135, 20)}Z`,
    },
    {
      id: "cappuccio",
      d: `M${L(-118, 10)}C${L(-120, -115)} ${L(120, -115)} ${L(118, 10)}C${L(120, 60)} ${L(100, 110)} ${L(70, 130)}L${L(-70, 130)}C${L(-100, 110)} ${L(-120, 60)} ${L(-118, 10)}Z`,
    },
  ]);
}

// ---------------- CORPO ----------------
export function neck(k: Kit): Part {
  return part([{ id: "collo", d: k.R(-18, 100, 36, 40) }]);
}

/** Vestito a trapezio con maniche a sbuffo. */
export function dress(k: Kit, opts: { long?: boolean } = {}): Part {
  const { P, C, E } = k;
  const bottom = opts.long ? 420 : 320;
  return part([
    { id: "manica-sx", d: C(-70, 150, 26) },
    { id: "manica-dx", d: C(70, 150, 26) },
    { id: "vestito", d: P([-62, 128], [62, 128], [opts.long ? 120 : 98, bottom], [opts.long ? -120 : -98, bottom]) },
    { id: "colletto", d: E(0, 130, 40, 14) },
  ]);
}

/** Top aderente + gonnellina. */
export function topSkirt(k: Kit): Part {
  const { R, P } = k;
  return part([
    { id: "top", d: R(-60, 125, 120, 110, 22) },
    { id: "gonna", d: P([-62, 228], [62, 228], [96, 318], [-96, 318]) },
  ], [`M${k.L(-30, 240)}L${k.L(-40, 318)}`, `M${k.L(0, 240)}L${k.L(0, 318)}`, `M${k.L(30, 240)}L${k.L(40, 318)}`]);
}

/** Giacca aperta su maglietta. */
export function jacket(k: Kit): Part {
  const { R, P } = k;
  return part([
    { id: "maglietta", d: R(-45, 125, 90, 180, 10) },
    { id: "giacca-sx", d: P([-66, 125], [-22, 125], [-12, 300], [-66, 300]) },
    { id: "giacca-dx", d: P([66, 125], [22, 125], [12, 300], [66, 300]) },
    { id: "bavero-sx", d: P([-22, 125], [-2, 125], [-24, 180]) },
    { id: "bavero-dx", d: P([22, 125], [2, 125], [24, 180]) },
  ]);
}

/** Tuta da supereroe con cintura ed emblema. */
export function heroSuit(k: Kit, emblem: "star" | "bolt" | "heart" | "circle" = "star"): Part {
  const { R, S, P, C, L } = k;
  const emblemRegion: ColoringRegion =
    emblem === "star"
      ? { id: "emblema", d: S(0, 200, 36, 15, 5) }
      : emblem === "bolt"
        ? { id: "emblema", d: P([6, 160], [-26, 212], [-2, 212], [-10, 250], [26, 196], [2, 196]) }
        : emblem === "heart"
          ? { id: "emblema", d: `M${L(0, 240)}L${L(-34, 206)}A${20 * k.s} ${20 * k.s} 0 1 1 ${L(0, 186)}A${20 * k.s} ${20 * k.s} 0 1 1 ${L(34, 206)}Z` }
          : { id: "emblema", d: C(0, 205, 30) };
  return part([
    { id: "tuta", d: R(-62, 125, 124, 180, 24) },
    { id: "cintura", d: R(-62, 272, 124, 22) },
    { id: "fibbia", d: R(-14, 268, 28, 30, 6) },
    emblemRegion,
  ]);
}

/** Braccia lungo i fianchi, con mani. */
export function arms(k: Kit, opts: { raisedRight?: boolean; raisedLeft?: boolean; gloves?: boolean } = {}): Part {
  const { R, C } = k;
  const regions: ColoringRegion[] = [];
  for (const side of [-1, 1] as const) {
    const n = side < 0 ? "sx" : "dx";
    const raised = side < 0 ? opts.raisedLeft : opts.raisedRight;
    if (raised) {
      regions.push({ id: `braccio-${n}`, d: R(side * 60 + (side < 0 ? -38 : 0), -60, 38, 200, 19) });
      regions.push({ id: `mano-${n}`, d: C(side * 79, -70, 21) });
    } else {
      regions.push({ id: `braccio-${n}`, d: R(side * 60 + (side < 0 ? -38 : 0), 135, 38, 150, 19) });
      regions.push({ id: `mano-${n}`, d: C(side * 79, 292, 21) });
    }
    if (opts.gloves) regions.push({ id: `guanto-${n}`, d: R(side * 60 + (side < 0 ? -40 : 0), raised ? -45 : 240, 40, 36, 10) });
  }
  return part(regions);
}

/** Gambe con stivali alti o scarpe. */
export function legs(k: Kit, opts: { boots?: boolean; top?: number } = {}): Part {
  const { R, E } = k;
  const top = opts.top ?? 315;
  const regions: ColoringRegion[] = [
    { id: "gamba-sx", d: R(-50, top, 44, 160, 14) },
    { id: "gamba-dx", d: R(6, top, 44, 160, 14) },
  ];
  if (opts.boots) {
    regions.push({ id: "stivale-sx", d: R(-56, 400, 56, 100, 16) }, { id: "stivale-dx", d: R(0, 400, 56, 100, 16) });
  } else {
    regions.push({ id: "scarpa-sx", d: E(-28, 480, 38, 18) }, { id: "scarpa-dx", d: E(28, 480, 38, 18) });
  }
  return part(regions);
}

// ---------------- ACCESSORI ----------------
/** Ali da fata (dietro il corpo). */
export function fairyWings(k: Kit): Part {
  const { L, S } = k;
  const regions: ColoringRegion[] = [];
  for (const side of [-1, 1] as const) {
    const n = side < 0 ? "sx" : "dx";
    const m = (px: number, py: number) => L(side * px, py);
    regions.push({
      id: `ala-alta-${n}`,
      d: `M${m(-40, 120)}C${m(-130, 10)} ${m(-290, 60)} ${m(-230, 210)}C${m(-190, 280)} ${m(-100, 240)} ${m(-40, 190)}Z`,
    });
    regions.push({
      id: `ala-bassa-${n}`,
      d: `M${m(-40, 200)}C${m(-130, 215)} ${m(-230, 300)} ${m(-150, 360)}C${m(-100, 380)} ${m(-60, 300)} ${m(-40, 240)}Z`,
    });
    regions.push({ id: `stella-ala-${n}`, d: S(side * -170, 150, 22, 9, 5) });
  }
  return part(regions);
}

/** Mantello (dietro il corpo). */
export function cape(k: Kit): Part {
  const { L } = k;
  return part([
    {
      id: "mantello",
      d: `M${L(-70, 125)}L${L(70, 125)}C${L(105, 250)} ${L(135, 350)} ${L(120, 430)}Q${L(60, 400)} ${L(0, 435)}Q${L(-60, 400)} ${L(-120, 430)}C${L(-135, 350)} ${L(-105, 250)} ${L(-70, 125)}Z`,
    },
  ]);
}

/** Mascherina da eroe (sopra la testa, sotto gli occhi). */
export function mask(k: Kit): Part {
  const { L } = k;
  return part([
    {
      id: "maschera",
      d: `M${L(-82, 2)}Q${L(-42, -34)} ${L(0, -6)}Q${L(42, -34)} ${L(82, 2)}Q${L(42, 44)} ${L(0, 26)}Q${L(-42, 44)} ${L(-82, 2)}Z`,
    },
  ]);
}

export function tiara(k: Kit): Part {
  const { P, C } = k;
  return part([
    { id: "tiara", d: P([-60, -92], [-40, -128], [-14, -100], [0, -140], [14, -100], [40, -128], [60, -92]) },
    { id: "gemma", d: C(0, -108, 9) },
  ]);
}

export function flowerInHair(k: Kit, cx = -78, cy = -72): Part {
  const { C } = k;
  const regions: ColoringRegion[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    regions.push({ id: `petalo-${i + 1}`, d: C(cx + 16 * Math.cos(a), cy + 16 * Math.sin(a), 11) });
  }
  regions.push({ id: "centro-fiore", d: C(cx, cy, 9) });
  return part(regions);
}

export function headphones(k: Kit): Part {
  const { L, C } = k;
  return part(
    [
      { id: "cuffia-sx", d: C(-100, 12, 24) },
      { id: "cuffia-dx", d: C(100, 12, 24) },
    ],
    [`M${L(-100, 0)}C${L(-100, -140)} ${L(100, -140)} ${L(100, 0)}`],
  );
}

/** Microfono nella mano destra alzata. */
export function microphone(k: Kit): Part {
  const { R, C } = k;
  return part([
    { id: "asta-microfono", d: R(66, -150, 26, 70, 13) },
    { id: "microfono", d: C(79, -165, 30) },
  ]);
}

/** Spada luminosa tenuta a destra, punta in alto. */
export function sword(k: Kit): Part {
  const { P, R, S } = k;
  return part([
    { id: "lama", d: P([70, -230], [96, -200], [96, 60], [70, 60], [44, -200]) },
    { id: "elsa", d: R(30, 60, 80, 20, 8) },
    { id: "impugnatura", d: R(60, 80, 20, 60, 8) },
    { id: "luce-spada", d: S(70, -260, 26, 10, 4) },
  ]);
}

export function sparkles(k: Kit, pts: [number, number, number][]): Part {
  return part(pts.map(([px, py, r], i) => ({ id: `scintilla-${i + 1}`, d: k.S(px, py, r, r * 0.4, 4) })));
}

export function bgStars(pts: [number, number, number][]): Part {
  return part(pts.map(([x, y, r], i) => ({ id: `stella-${i + 1}`, d: star(x, y, r, r * 0.42, 5) })));
}
