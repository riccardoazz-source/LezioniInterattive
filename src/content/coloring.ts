/**
 * Catalogo dei disegni da colorare. Ogni disegno è un insieme di ZONE (path
 * SVG chiusi) che si riempiono di colore con un tocco, più alcune LINEE
 * decorative (baffi, bocca...) che non si colorano.
 *
 * Spazio di disegno: 1000 × 700 (come la lavagna). Tutti i personaggi sono
 * originali: niente personaggi protetti da copyright.
 *
 * Per aggiungere un disegno: crea le zone con gli helper qui sotto
 * (circle, ellipse, rect, poly, star) e aggiungilo a COLORING_PAGES.
 */

export type ColoringCategoryId = "animali" | "piante" | "bamboline" | "eroi";

export interface ColoringRegion {
  id: string;
  d: string;
}

export interface ColoringPage {
  id: string;
  category: ColoringCategoryId;
  title: string;
  emoji: string;
  regions: ColoringRegion[];
  lines?: string[];
}

export const COLORING_CATEGORIES: { id: ColoringCategoryId; name: string; emoji: string; color: string }[] = [
  { id: "animali", name: "Animali", emoji: "🐾", color: "bg-emerald-100" },
  { id: "piante", name: "Piante e natura", emoji: "🌻", color: "bg-lime-100" },
  { id: "bamboline", name: "Bamboline", emoji: "👧", color: "bg-pink-100" },
  { id: "eroi", name: "Eroi e cartoni", emoji: "🦸", color: "bg-violet-100" },
];

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
const petal = (cx: number, cy: number, angleDeg: number, rBase: number, rTip: number, halfWidthDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  const w = (halfWidthDeg * Math.PI) / 180;
  return poly(
    [cx + rBase * Math.cos(a - w), cy + rBase * Math.sin(a - w)],
    [cx + rTip * Math.cos(a), cy + rTip * Math.sin(a)],
    [cx + rBase * Math.cos(a + w), cy + rBase * Math.sin(a + w)],
  );
};

const SFONDO: ColoringRegion = { id: "sfondo", d: rect(0, 0, 1000, 700) };
const TERRA: ColoringRegion = { id: "terra", d: rect(0, 560, 1000, 140) };

export const COLORING_PAGES: ColoringPage[] = [
  // ---------- ANIMALI ----------
  {
    id: "gatto",
    category: "animali",
    title: "Gatto",
    emoji: "🐱",
    regions: [
      SFONDO,
      { id: "coda", d: "M600 470C720 450 760 360 720 300C700 285 670 305 690 340C710 400 650 440 590 440Z" },
      { id: "corpo", d: ellipse(500, 480, 170, 120) },
      { id: "orecchio-sx", d: poly([395, 240], [425, 115], [485, 210]) },
      { id: "orecchio-dx", d: poly([605, 240], [575, 115], [515, 210]) },
      { id: "testa", d: circle(500, 300, 120) },
      { id: "occhio-sx", d: circle(455, 290, 22) },
      { id: "occhio-dx", d: circle(545, 290, 22) },
      { id: "pupilla-sx", d: circle(455, 290, 9) },
      { id: "pupilla-dx", d: circle(545, 290, 9) },
      { id: "naso", d: poly([485, 330], [515, 330], [500, 350]) },
      { id: "zampa-sx", d: ellipse(430, 590, 45, 25) },
      { id: "zampa-dx", d: ellipse(570, 590, 45, 25) },
    ],
    lines: ["M380 330L290 315", "M380 352L290 368", "M620 330L710 315", "M620 352L710 368", "M500 350q-20 30-45 18", "M500 350q20 30 45 18"],
  },
  {
    id: "cane",
    category: "animali",
    title: "Cane",
    emoji: "🐶",
    regions: [
      SFONDO,
      { id: "coda", d: "M660 480C740 470 770 400 740 350C725 340 705 355 715 380C730 420 690 445 650 445Z" },
      { id: "corpo", d: ellipse(500, 490, 180, 120) },
      { id: "testa", d: ellipse(500, 300, 130, 110) },
      { id: "orecchio-sx", d: ellipse(385, 330, 42, 95) },
      { id: "orecchio-dx", d: ellipse(615, 330, 42, 95) },
      { id: "muso", d: ellipse(500, 350, 60, 40) },
      { id: "naso", d: ellipse(500, 335, 24, 16) },
      { id: "occhio-sx", d: circle(455, 270, 18) },
      { id: "occhio-dx", d: circle(545, 270, 18) },
      { id: "collare", d: rect(425, 400, 150, 26, 13) },
      { id: "medaglia", d: circle(500, 440, 18) },
      { id: "zampa-sx", d: ellipse(425, 600, 48, 26) },
      { id: "zampa-dx", d: ellipse(575, 600, 48, 26) },
    ],
    lines: ["M500 351v18", "M500 369q-18 22-38 12", "M500 369q18 22 38 12"],
  },
  {
    id: "pesce",
    category: "animali",
    title: "Pesce",
    emoji: "🐟",
    regions: [
      SFONDO,
      { id: "alga-1", d: "M120 700C100 620 160 600 130 520C110 470 170 450 150 400L190 400C210 450 150 480 170 530C200 600 140 620 160 700Z" },
      { id: "alga-2", d: "M880 700C860 640 910 620 890 560C870 510 930 500 910 450L950 450C970 500 910 520 930 570C960 630 900 650 920 700Z" },
      { id: "bolla-1", d: circle(790, 150, 26) },
      { id: "bolla-2", d: circle(840, 90, 16) },
      { id: "bolla-3", d: circle(750, 80, 12) },
      { id: "coda", d: poly([690, 350], [830, 240], [830, 460]) },
      { id: "corpo", d: ellipse(480, 350, 220, 130) },
      { id: "pinna-alta", d: poly([400, 235], [470, 140], [570, 230]) },
      { id: "pinna-bassa", d: poly([470, 470], [420, 550], [560, 485]) },
      { id: "pinna-lato", d: ellipse(500, 380, 55, 28) },
      { id: "occhio", d: circle(360, 320, 26) },
      { id: "pupilla", d: circle(360, 320, 10) },
    ],
    lines: ["M270 370q25 22 50 0", "M560 300q30 30 0 60", "M610 290q30 30 0 60", "M560 400q30 30 0 60"],
  },
  {
    id: "farfalla",
    category: "animali",
    title: "Farfalla",
    emoji: "🦋",
    regions: [
      SFONDO,
      { id: "ala-alta-sx", d: ellipse(355, 260, 155, 115) },
      { id: "ala-alta-dx", d: ellipse(645, 260, 155, 115) },
      { id: "ala-bassa-sx", d: ellipse(390, 455, 115, 95) },
      { id: "ala-bassa-dx", d: ellipse(610, 455, 115, 95) },
      { id: "macchia-1", d: circle(330, 250, 38) },
      { id: "macchia-2", d: circle(670, 250, 38) },
      { id: "macchia-3", d: circle(380, 455, 26) },
      { id: "macchia-4", d: circle(620, 455, 26) },
      { id: "corpo", d: ellipse(500, 375, 34, 155) },
      { id: "testa", d: circle(500, 205, 34) },
      { id: "antenna-sx", d: circle(425, 110, 12) },
      { id: "antenna-dx", d: circle(575, 110, 12) },
    ],
    lines: ["M485 180Q450 130 430 120", "M515 180Q550 130 570 120", "M490 210h20"],
  },
  {
    id: "coniglio",
    category: "animali",
    title: "Coniglio",
    emoji: "🐰",
    regions: [
      SFONDO,
      { id: "orecchio-sx", d: ellipse(440, 170, 40, 135) },
      { id: "orecchio-dx", d: ellipse(560, 170, 40, 135) },
      { id: "interno-sx", d: ellipse(440, 175, 18, 100) },
      { id: "interno-dx", d: ellipse(560, 175, 18, 100) },
      { id: "corpo", d: ellipse(500, 530, 150, 110) },
      { id: "testa", d: circle(500, 330, 115) },
      { id: "occhio-sx", d: circle(455, 310, 18) },
      { id: "occhio-dx", d: circle(545, 310, 18) },
      { id: "naso", d: poly([485, 350], [515, 350], [500, 368]) },
      { id: "dente-sx", d: rect(487, 384, 13, 20, 3) },
      { id: "dente-dx", d: rect(500, 384, 13, 20, 3) },
      { id: "zampa-sx", d: ellipse(430, 625, 50, 28) },
      { id: "zampa-dx", d: ellipse(570, 625, 50, 28) },
      { id: "pancia", d: ellipse(500, 540, 80, 65) },
    ],
    lines: ["M500 368v16", "M385 350L300 340", "M385 368L300 385", "M615 350L700 340", "M615 368L700 385"],
  },
  {
    id: "leone",
    category: "animali",
    title: "Leone",
    emoji: "🦁",
    regions: [
      SFONDO,
      { id: "corpo", d: ellipse(500, 600, 170, 90) },
      { id: "criniera", d: star(500, 330, 235, 190, 16) },
      { id: "orecchio-sx", d: circle(400, 230, 36) },
      { id: "orecchio-dx", d: circle(600, 230, 36) },
      { id: "testa", d: circle(500, 330, 135) },
      { id: "occhio-sx", d: circle(450, 300, 20) },
      { id: "occhio-dx", d: circle(550, 300, 20) },
      { id: "muso", d: ellipse(500, 385, 70, 45) },
      { id: "naso", d: ellipse(500, 365, 28, 18) },
    ],
    lines: ["M500 383v15", "M500 398q-20 25-40 12", "M500 398q20 25 40 12", "M420 380L340 372", "M420 398L340 410", "M580 380L660 372", "M580 398L660 410"],
  },
  // ---------- PIANTE ----------
  {
    id: "fiore",
    category: "piante",
    title: "Fiore",
    emoji: "🌸",
    regions: [
      SFONDO,
      TERRA,
      { id: "gambo", d: rect(488, 330, 24, 240) },
      { id: "foglia-sx", d: "M488 470Q400 400 340 450Q410 520 488 490Z" },
      { id: "foglia-dx", d: "M512 420Q600 350 660 400Q590 470 512 440Z" },
      ...[0, 60, 120, 180, 240, 300].map((a, i) => ({
        id: `petalo-${i + 1}`,
        d: circle(500 + 95 * Math.cos((a * Math.PI) / 180), 250 + 95 * Math.sin((a * Math.PI) / 180), 62),
      })),
      { id: "centro", d: circle(500, 250, 58) },
    ],
    lines: ["M470 250q30 25 60 0"],
  },
  {
    id: "albero",
    category: "piante",
    title: "Albero",
    emoji: "🌳",
    regions: [
      SFONDO,
      TERRA,
      { id: "tronco", d: rect(458, 380, 84, 230, 12) },
      { id: "chioma-sx", d: circle(395, 330, 115) },
      { id: "chioma-dx", d: circle(605, 330, 115) },
      { id: "chioma", d: circle(500, 240, 160) },
      { id: "mela-1", d: circle(430, 260, 24) },
      { id: "mela-2", d: circle(560, 220, 24) },
      { id: "mela-3", d: circle(500, 330, 24) },
      { id: "mela-4", d: circle(380, 380, 22) },
      { id: "mela-5", d: circle(630, 370, 22) },
      { id: "sole", d: circle(880, 110, 60) },
    ],
    lines: ["M500 540v-100", "M470 480l30 40", "M530 460l-30 50"],
  },
  {
    id: "fungo",
    category: "piante",
    title: "Fungo",
    emoji: "🍄",
    regions: [
      SFONDO,
      TERRA,
      { id: "gambo", d: rect(430, 330, 140, 250, 40) },
      { id: "cappello", d: "M270 365A230 190 0 0 1 730 365Z" },
      { id: "macchia-1", d: circle(400, 280, 30) },
      { id: "macchia-2", d: circle(520, 230, 36) },
      { id: "macchia-3", d: circle(640, 300, 26) },
      { id: "macchia-4", d: circle(470, 330, 18) },
      { id: "lumaca-guscio", d: circle(820, 530, 40) },
      { id: "lumaca-corpo", d: "M760 570Q760 540 790 540L860 540Q900 540 900 570Z" },
    ],
    lines: ["M820 530a20 20 0 1 1 0 1", "M880 540L890 505", "M870 540L875 505", "M200 570q10-40 0-80", "M240 570q10-30 0-60"],
  },
  {
    id: "girasole",
    category: "piante",
    title: "Girasole",
    emoji: "🌻",
    regions: [
      SFONDO,
      TERRA,
      { id: "gambo", d: rect(488, 350, 24, 220) },
      { id: "foglia-sx", d: "M488 480Q400 420 330 470Q410 540 488 500Z" },
      { id: "foglia-dx", d: "M512 440Q600 380 670 430Q590 500 512 460Z" },
      ...Array.from({ length: 12 }, (_, i) => ({ id: `petalo-${i + 1}`, d: petal(500, 250, i * 30, 70, 170, 14) })),
      { id: "centro", d: circle(500, 250, 75) },
      { id: "sole", d: circle(110, 110, 60) },
    ],
    lines: ["M470 240q30 30 60 0", "M480 260q20 15 40 0"],
  },
  // ---------- BAMBOLINE ----------
  {
    id: "bambola",
    category: "bamboline",
    title: "Bambolina",
    emoji: "👧",
    regions: [
      SFONDO,
      { id: "capelli", d: circle(500, 200, 108) },
      { id: "codino-sx", d: circle(385, 250, 42) },
      { id: "codino-dx", d: circle(615, 250, 42) },
      { id: "testa", d: circle(500, 215, 85) },
      { id: "frangia", d: "M418 190Q500 110 582 190Q560 150 500 150Q440 150 418 190Z" },
      { id: "fiocco-sx", d: poly([370, 230], [400, 215], [400, 245]) },
      { id: "fiocco-dx", d: poly([630, 230], [600, 215], [600, 245]) },
      { id: "braccio-sx", d: rect(383, 310, 40, 175, 20) },
      { id: "braccio-dx", d: rect(577, 310, 40, 175, 20) },
      { id: "vestito", d: poly([432, 300], [568, 300], [640, 525], [360, 525]) },
      { id: "colletto", d: ellipse(500, 305, 45, 15) },
      { id: "gamba-sx", d: rect(455, 525, 36, 110, 10) },
      { id: "gamba-dx", d: rect(509, 525, 36, 110, 10) },
      { id: "scarpa-sx", d: ellipse(470, 645, 42, 18) },
      { id: "scarpa-dx", d: ellipse(530, 645, 42, 18) },
      { id: "occhio-sx", d: circle(470, 225, 12) },
      { id: "occhio-dx", d: circle(530, 225, 12) },
      { id: "tasca", d: rect(475, 430, 50, 40, 8) },
    ],
    lines: ["M480 262q20 18 40 0", "M455 395h90"],
  },
  {
    id: "principessa",
    category: "bamboline",
    title: "Principessa",
    emoji: "👸",
    regions: [
      SFONDO,
      { id: "capelli", d: "M400 220Q400 80 500 80Q600 80 600 220L650 480H350Z" },
      { id: "testa", d: circle(500, 210, 82) },
      { id: "corona", d: poly([438, 150], [462, 95], [500, 135], [538, 95], [562, 150]) },
      { id: "gemma-1", d: circle(462, 100, 9) },
      { id: "gemma-2", d: circle(538, 100, 9) },
      { id: "gemma-3", d: circle(500, 140, 9) },
      { id: "braccio-sx", d: rect(395, 300, 40, 170, 20) },
      { id: "braccio-dx", d: rect(565, 300, 40, 170, 20) },
      { id: "vestito", d: poly([440, 292], [560, 292], [690, 650], [310, 650]) },
      { id: "fascia", d: rect(440, 292, 120, 32) },
      { id: "balza", d: poly([345, 560], [655, 560], [690, 650], [310, 650]) },
      { id: "occhio-sx", d: circle(470, 215, 12) },
      { id: "occhio-dx", d: circle(530, 215, 12) },
      { id: "collana", d: circle(500, 275, 12) },
    ],
    lines: ["M480 250q20 18 40 0", "M470 300q30 25 60 0"],
  },
  {
    id: "sirena",
    category: "bamboline",
    title: "Sirena",
    emoji: "🧜‍♀️",
    regions: [
      SFONDO,
      { id: "bolla-1", d: circle(800, 150, 26) },
      { id: "bolla-2", d: circle(860, 90, 16) },
      { id: "bolla-3", d: circle(160, 200, 20) },
      { id: "stella-marina", d: star(820, 600, 48, 22, 5) },
      { id: "capelli", d: "M420 180Q420 90 500 90Q580 90 580 180Q620 260 600 400L520 300L480 300L400 400Q380 260 420 180Z" },
      { id: "testa", d: circle(500, 180, 70) },
      { id: "busto", d: rect(455, 240, 90, 110, 25) },
      { id: "top", d: ellipse(500, 290, 78, 32) },
      { id: "braccio-sx", d: rect(400, 250, 36, 150, 18) },
      { id: "braccio-dx", d: rect(564, 250, 36, 150, 18) },
      { id: "coda", d: "M455 345H545Q575 480 535 590L630 660H370L465 590Q425 480 455 345Z" },
      { id: "pinna-sx", d: poly([465, 590], [370, 660], [460, 640]) },
      { id: "pinna-dx", d: poly([535, 590], [630, 660], [540, 640]) },
      { id: "occhio-sx", d: circle(474, 180, 11) },
      { id: "occhio-dx", d: circle(526, 180, 11) },
    ],
    lines: ["M482 210q18 16 36 0", "M470 420q30 20 60 0", "M470 470q30 20 60 0", "M475 520q25 20 50 0"],
  },
  // ---------- EROI E CARTONI (personaggi originali) ----------
  {
    id: "supereroina",
    category: "eroi",
    title: "Super Stella",
    emoji: "🦸‍♀️",
    regions: [
      SFONDO,
      { id: "mantello", d: poly([430, 290], [570, 290], [660, 580], [340, 580]) },
      { id: "braccio-sx", d: rect(372, 300, 40, 160, 20) },
      { id: "braccio-dx", d: rect(590, 110, 40, 200, 20) },
      { id: "corpo", d: rect(438, 285, 124, 185, 24) },
      { id: "cintura", d: rect(438, 440, 124, 24) },
      { id: "emblema", d: star(500, 370, 38, 16, 5) },
      { id: "capelli", d: "M418 190Q440 100 500 100Q560 100 582 190L590 260L560 200H440L410 260Z" },
      { id: "testa", d: circle(500, 200, 80) },
      { id: "maschera", d: ellipse(500, 195, 72, 26) },
      { id: "occhio-sx", d: circle(470, 195, 12) },
      { id: "occhio-dx", d: circle(530, 195, 12) },
      { id: "gamba-sx", d: rect(452, 470, 42, 135, 12) },
      { id: "gamba-dx", d: rect(506, 470, 42, 135, 12) },
      { id: "stivale-sx", d: rect(446, 600, 54, 45, 12) },
      { id: "stivale-dx", d: rect(500, 600, 54, 45, 12) },
      { id: "pugno", d: circle(610, 105, 28) },
    ],
    lines: ["M478 240q22 18 44 0", "M700 150l30-30", "M720 200l40 0", "M700 250l30 30"],
  },
  {
    id: "fata",
    category: "eroi",
    title: "Fata Luna",
    emoji: "🧚",
    regions: [
      SFONDO,
      { id: "stella-1", d: star(150, 120, 26, 11, 5) },
      { id: "stella-2", d: star(850, 160, 22, 9, 5) },
      { id: "stella-3", d: star(200, 520, 20, 8, 5) },
      { id: "luna", d: "M880 420A80 80 0 1 1 880 560A62 62 0 1 0 880 420Z" },
      { id: "ala-alta-sx", d: ellipse(385, 300, 115, 145) },
      { id: "ala-alta-dx", d: ellipse(615, 300, 115, 145) },
      { id: "ala-bassa-sx", d: ellipse(405, 450, 75, 85) },
      { id: "ala-bassa-dx", d: ellipse(595, 450, 75, 85) },
      { id: "braccio-sx", d: rect(405, 300, 36, 150, 18) },
      { id: "braccio-dx", d: rect(560, 280, 36, 120, 18) },
      { id: "vestito", d: poly([452, 285], [548, 285], [605, 525], [395, 525]) },
      { id: "capelli", d: "M425 200Q425 110 500 110Q575 110 575 200L580 300L540 230H460L420 300Z" },
      { id: "testa", d: circle(500, 205, 72) },
      { id: "occhio-sx", d: circle(474, 205, 11) },
      { id: "occhio-dx", d: circle(526, 205, 11) },
      { id: "gamba-sx", d: rect(458, 525, 34, 100, 10) },
      { id: "gamba-dx", d: rect(508, 525, 34, 100, 10) },
      { id: "scarpa-sx", d: ellipse(475, 635, 36, 16) },
      { id: "scarpa-dx", d: ellipse(525, 635, 36, 16) },
      { id: "bacchetta-stella", d: star(700, 190, 32, 14, 5) },
    ],
    lines: ["M482 235q18 15 36 0", "M590 290L690 205"],
  },
  {
    id: "gattino-buffo",
    category: "eroi",
    title: "Gattino buffo",
    emoji: "😸",
    regions: [
      SFONDO,
      { id: "coda", d: "M600 580C720 560 760 480 720 430C700 420 680 440 695 465C715 510 660 540 590 545Z" },
      { id: "corpo", d: ellipse(500, 560, 125, 95) },
      { id: "orecchio-sx", d: poly([330, 220], [360, 80], [440, 170]) },
      { id: "orecchio-dx", d: poly([670, 220], [640, 80], [560, 170]) },
      { id: "testa", d: ellipse(500, 300, 195, 165) },
      { id: "occhio-sx", d: circle(425, 290, 52) },
      { id: "occhio-dx", d: circle(575, 290, 52) },
      { id: "pupilla-sx", d: circle(430, 298, 24) },
      { id: "pupilla-dx", d: circle(570, 298, 24) },
      { id: "naso", d: poly([480, 360], [520, 360], [500, 385]) },
      { id: "guancia-sx", d: circle(365, 370, 22) },
      { id: "guancia-dx", d: circle(635, 370, 22) },
      { id: "zampa-sx", d: ellipse(445, 650, 42, 22) },
      { id: "zampa-dx", d: ellipse(555, 650, 42, 22) },
      { id: "pancia", d: ellipse(500, 575, 70, 55) },
    ],
    lines: ["M500 385v14", "M500 399q-30 40-70 22", "M500 399q30 40 70 22", "M310 400L220 390", "M310 420L220 440", "M690 400L780 390", "M690 420L780 440"],
  },
  {
    id: "popstar",
    category: "eroi",
    title: "Pop star",
    emoji: "🎤",
    regions: [
      SFONDO,
      { id: "stella-1", d: star(130, 120, 30, 13, 5) },
      { id: "stella-2", d: star(870, 110, 26, 11, 5) },
      { id: "stella-3", d: star(200, 560, 24, 10, 5) },
      { id: "stella-4", d: star(830, 560, 24, 10, 5) },
      { id: "nota-1", d: circle(790, 300, 22) },
      { id: "nota-2", d: circle(870, 360, 22) },
      { id: "codino", d: ellipse(615, 240, 45, 95) },
      { id: "capelli", d: circle(500, 175, 95) },
      { id: "testa", d: circle(500, 195, 78) },
      { id: "frangia", d: "M425 175Q470 110 540 125Q575 135 575 175Q540 150 500 160Q460 165 425 175Z" },
      { id: "braccio-sx", d: rect(395, 290, 38, 160, 19) },
      { id: "braccio-dx", d: rect(588, 170, 38, 170, 19) },
      { id: "top", d: rect(440, 272, 120, 125, 22) },
      { id: "gonna", d: poly([440, 395], [560, 395], [610, 510], [390, 510]) },
      { id: "microfono-asta", d: rect(594, 125, 26, 60, 13) },
      { id: "microfono", d: circle(607, 110, 30) },
      { id: "gamba-sx", d: rect(455, 510, 36, 110, 10) },
      { id: "gamba-dx", d: rect(509, 510, 36, 110, 10) },
      { id: "scarpa-sx", d: ellipse(472, 632, 40, 17) },
      { id: "scarpa-dx", d: ellipse(528, 632, 40, 17) },
      { id: "occhio-sx", d: circle(474, 200, 12) },
      { id: "occhio-dx", d: circle(526, 200, 12) },
      { id: "cuore", d: "M500 360L465 325A20 20 0 1 1 500 305A20 20 0 1 1 535 325Z" },
    ],
    lines: ["M480 235q20 20 40 0", "M812 300V220", "M892 360V280", "M812 220q30-10 60 0"],
  },
  {
    id: "robottino",
    category: "eroi",
    title: "Robottino",
    emoji: "🤖",
    regions: [
      SFONDO,
      { id: "antenna", d: circle(500, 78, 22) },
      { id: "testa", d: rect(400, 110, 200, 150, 22) },
      { id: "occhio-sx", d: circle(455, 185, 30) },
      { id: "occhio-dx", d: circle(545, 185, 30) },
      { id: "pupilla-sx", d: circle(455, 185, 12) },
      { id: "pupilla-dx", d: circle(545, 185, 12) },
      { id: "bocca", d: rect(450, 226, 100, 18, 9) },
      { id: "collo", d: rect(475, 260, 50, 30) },
      { id: "braccio-sx", d: rect(320, 300, 45, 180, 22) },
      { id: "braccio-dx", d: rect(635, 300, 45, 180, 22) },
      { id: "corpo", d: rect(380, 290, 240, 220, 26) },
      { id: "pannello", d: rect(430, 330, 140, 80, 12) },
      { id: "bottone-1", d: circle(430, 460, 16) },
      { id: "bottone-2", d: circle(500, 460, 16) },
      { id: "bottone-3", d: circle(570, 460, 16) },
      { id: "mano-sx", d: circle(342, 500, 32) },
      { id: "mano-dx", d: circle(657, 500, 32) },
      { id: "gamba-sx", d: rect(420, 510, 60, 110, 15) },
      { id: "gamba-dx", d: rect(520, 510, 60, 110, 15) },
      { id: "piede-sx", d: rect(398, 620, 104, 40, 16) },
      { id: "piede-dx", d: rect(498, 620, 104, 40, 16) },
    ],
    lines: ["M500 100V110", "M450 350h100", "M450 375h60", "M450 395h80"],
  },
];

export const COLORING_MAP: Record<string, ColoringPage> = Object.fromEntries(COLORING_PAGES.map((p) => [p.id, p]));
