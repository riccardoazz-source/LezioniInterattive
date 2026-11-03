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

import { circle, ellipse, petal, poly, rect, star, type ColoringCategoryId, type ColoringPage, type ColoringRegion } from "./coloring-shapes";
import { CHARACTER_PAGES } from "./coloring-characters";

export * from "./coloring-shapes";

export const COLORING_CATEGORIES: { id: ColoringCategoryId; name: string; emoji: string; color: string }[] = [
  { id: "animali", name: "Animali", emoji: "🐾", color: "bg-emerald-100" },
  { id: "piante", name: "Piante e natura", emoji: "🌻", color: "bg-lime-100" },
  { id: "fate", name: "Fate magiche", emoji: "🧚", color: "bg-fuchsia-100" },
  { id: "eroi", name: "Squadra di eroi", emoji: "🦸", color: "bg-violet-100" },
  { id: "cartoni", name: "Amici cartoon", emoji: "😸", color: "bg-sky-100" },
  { id: "pop", name: "Stelle pop", emoji: "🎤", color: "bg-rose-100" },
  { id: "bamboline", name: "Bamboline", emoji: "👧", color: "bg-pink-100" },
];

const SFONDO: ColoringRegion = { id: "sfondo", d: rect(0, 0, 1000, 700) };
const TERRA: ColoringRegion = { id: "terra", d: rect(0, 560, 1000, 140) };

const BASE_PAGES: ColoringPage[] = [
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
];

export const COLORING_PAGES: ColoringPage[] = [...BASE_PAGES, ...CHARACTER_PAGES];

export const COLORING_MAP: Record<string, ColoringPage> = Object.fromEntries(COLORING_PAGES.map((p) => [p.id, p]));
