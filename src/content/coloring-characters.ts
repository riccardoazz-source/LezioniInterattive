/**
 * Personaggi cartoon da colorare in stile chibi (testa grande, occhioni),
 * costruiti con il kit. Tutti originali: fatine magiche, squadra di
 * giovani eroi, animali cartoon, stelle pop.
 */
import { rect, type ColoringPage, type ColoringRegion } from "./coloring-shapes";
import {
  armsPose, bangs, bangsSide, bangsStraight, belt, bgStars, boots, bracelet, braidSide, cape, chibi, choker, cropTop,
  dress, earrings, ears, eyesChibi, faceChibi, fairyWings, flowerInHair, frameBg, hairBobBack, hairBun, hairLongBack,
  hairLongStraightBack, hairSpiky, head, heroSuit, hoodCloak, jacketOpen, join, kit, legs, mask, neck,
  offShoulderTop, pantsWide, part, pigtails, ponytail, shorts, skirtChain, sneakers, sparklesBg, sword, tassels,
  tiara, topSkirt, torsoSkin, type Kit, type Part,
} from "./coloring-kit";

const SFONDO: ColoringRegion = { id: "sfondo", d: rect(0, 0, 1000, 700) };

function page(id: string, category: ColoringPage["category"], title: string, emoji: string, ...parts: Part[]): ColoringPage {
  const all = join(...parts);
  const seen = new Set<string>();
  for (const r of all.regions) {
    if (seen.has(r.id)) throw new Error(`Zona duplicata in ${id}: ${r.id}`);
    seen.add(r.id);
  }
  return { id, category, title, emoji, regions: [SFONDO, ...all.regions], lines: all.lines };
}

const prefix = (p: Part, pre: string): Part => ({ regions: p.regions.map((r) => ({ ...r, id: `${pre}-${r.id}` })), lines: p.lines });

/** Bacchetta magica nella mano destra alzata (kit del corpo). */
function wand(kb: Kit): Part {
  return part([{ id: "stella-bacchetta", d: kb.S(79, -150, 36, 15, 5) }], [`M${kb.L(79, -82)}L${kb.L(79, -122)}`]);
}

/** Personaggio singolo in piedi al centro. */
const std = () => chibi(500, 185, 1.22);

// ====================== STELLE POP ======================
const stellaPop = (() => {
  const { k, kb } = std();
  return page("stella-pop", "pop", "Stella Pop", "🎤",
    frameBg(500, 350, 620, 600, -6), frameBg(500, 350, 580, 560, 5, "cornice-2"),
    sparklesBg([[120, 120, 22], [880, 100, 26], [140, 560, 18], [870, 580, 22], [300, 60, 12], [700, 640, 12]]),
    ponytail(k), ears(k), neck(kb), torsoSkin(kb), pantsWide(kb), belt(kb), tassels(kb), cropTop(kb),
    armsPose(kb, "hip", "mic"), sneakers(kb),
    head(k), bangsSide(k), eyesChibi(k), faceChibi(k, { smile: "open" }), earrings(k));
})();

const lunaPop = (() => {
  const { k, kb } = std();
  return page("luna-pop", "pop", "Luna Pop", "🎶",
    frameBg(500, 350, 620, 600, 6), frameBg(500, 350, 580, 560, -5, "cornice-2"),
    sparklesBg([[110, 110, 24], [890, 130, 20], [130, 580, 20], [880, 560, 24], [500, 50, 12]]),
    hairBun(k), ears(k), neck(kb), torsoSkin(kb), shorts(kb), belt(kb), tassels(kb), cropTop(kb), jacketOpen(kb),
    armsPose(kb, "down", "mic"), bracelet(kb, "sx"), sneakers(kb),
    head(k), bangsStraight(k), eyesChibi(k), faceChibi(k, { smile: "big" }), earrings(k));
})();

const novaPop = (() => {
  const { k, kb } = std();
  return page("nova-pop", "pop", "Nova Pop", "💖",
    frameBg(500, 350, 620, 600, -5), frameBg(500, 350, 580, 560, 7, "cornice-2"),
    sparklesBg([[120, 100, 20], [880, 110, 24], [120, 570, 22], [870, 590, 18]]),
    part([{ id: "cuore", d: "M870 300L838 266A19 19 0 1 1 870 246A19 19 0 1 1 902 266Z" }]),
    hairLongStraightBack(k), neck(kb), torsoSkin(kb), skirtChain(kb), offShoulderTop(kb), choker(kb),
    armsPose(kb, "wave", "mic"), bracelet(kb, "dx", 250), boots(kb),
    head(k), bangsStraight(k), eyesChibi(k, { wink: "dx" }), faceChibi(k, { smile: "open" }), earrings(k));
})();

const guerrieraPop = (() => {
  const { k, kb } = std();
  const ks = kit(500 + 62 * kb.s, 185 + 112 * 1.22 * (1 - 0.82) + 130 * kb.s, kb.s);
  return page("guerriera-pop", "pop", "Guerriera Pop", "⚔️",
    bgStars([[100, 100, 26], [900, 90, 22], [880, 580, 20]]),
    sparklesBg([[200, 220, 16], [820, 300, 14], [160, 520, 14]]),
    braidSide(k), ears(k), neck(kb), torsoSkin(kb), shorts(kb), belt(kb), cropTop(kb), jacketOpen(kb),
    armsPose(kb, "hip", "down"), sword(ks), boots(kb),
    head(k), bangsSide(k), eyesChibi(k), faceChibi(k, { smile: "small" }), part([{ id: "fascia", d: k.R(-96, -64, 192, 22, 11) }]));
})();

const bandPop = (() => {
  const mk = (x: number) => chibi(x, 160, 0.95);
  const a = mk(220);
  const b = mk(500);
  const c = mk(780);
  return page("band-pop", "pop", "Le Stelle Pop", "🌟",
    frameBg(225, 320, 290, 560, -6), frameBg(500, 310, 300, 590, 3, "cornice-2"), frameBg(775, 320, 290, 560, 6, "cornice-3"),
    sparklesBg([[60, 60, 20], [500, 30, 16], [940, 60, 20], [80, 640, 16], [920, 640, 16], [360, 660, 12], [640, 660, 12]]),
    prefix(join(ponytail(a.k), neck(a.kb), torsoSkin(a.kb), pantsWide(a.kb), belt(a.kb), tassels(a.kb), cropTop(a.kb), armsPose(a.kb, "hip", "mic"), sneakers(a.kb), head(a.k), bangsSide(a.k), eyesChibi(a.k), faceChibi(a.k, { smile: "open" })), "a"),
    prefix(join(hairBun(b.k), neck(b.kb), torsoSkin(b.kb), shorts(b.kb), belt(b.kb), tassels(b.kb), cropTop(b.kb), jacketOpen(b.kb), armsPose(b.kb, "wave", "mic"), sneakers(b.kb), head(b.k), bangsStraight(b.k), eyesChibi(b.k), faceChibi(b.k, { smile: "big" })), "b"),
    prefix(join(hairLongStraightBack(c.k), neck(c.kb), torsoSkin(c.kb), skirtChain(c.kb), offShoulderTop(c.kb), choker(c.kb), armsPose(c.kb, "down", "mic"), boots(c.kb), head(c.k), bangsStraight(c.k), eyesChibi(c.k, { wink: "dx" }), faceChibi(c.k, { smile: "open" })), "c"));
})();

const tigre = (() => {
  const k = kit(500, 215, 0.95);
  const { C, E, P, L } = k;
  return page("tigre", "pop", "Tigre mascotte", "🐯",
    sparklesBg([[120, 120, 18], [880, 110, 20], [860, 580, 16]]),
    part([{ id: "coda", d: `M${L(70, 330)}C${L(190, 340)} ${L(230, 260)} ${L(200, 190)}C${L(185, 170)} ${L(160, 185)} ${L(175, 210)}C${L(195, 270)} ${L(160, 310)} ${L(70, 300)}Z` }]),
    part([{ id: "gamba-sx", d: k.R(-70, 310, 56, 100, 22) }, { id: "gamba-dx", d: k.R(14, 310, 56, 100, 22) }, { id: "piede-sx", d: E(-42, 412, 48, 20) }, { id: "piede-dx", d: E(42, 412, 48, 20) }]),
    part([{ id: "corpo", d: E(0, 230, 105, 115) }, { id: "pancia", d: E(0, 245, 62, 80) }]),
    part([{ id: "braccio-sx", d: k.R(-125, 160, 44, 100, 22) }, { id: "braccio-dx", d: k.R(81, 160, 44, 100, 22) }]),
    part([{ id: "orecchio-sx", d: C(-85, -85, 32) }, { id: "orecchio-dx", d: C(85, -85, 32) }, { id: "interno-sx", d: C(-85, -85, 16) }, { id: "interno-dx", d: C(85, -85, 16) }]),
    part([{ id: "testa", d: C(0, 0, 115) }]),
    part([{ id: "striscia-1", d: P([-30, -112], [0, -60], [30, -112]) }, { id: "striscia-2", d: P([-115, -20], [-60, 0], [-112, 25]) }, { id: "striscia-3", d: P([115, -20], [60, 0], [112, 25]) }, { id: "striscia-4", d: P([-95, 60], [-55, 60], [-85, 90]) }, { id: "striscia-5", d: P([95, 60], [55, 60], [85, 90]) }]),
    part([{ id: "muso", d: E(0, 55, 48, 34) }, { id: "naso", d: P([-14, 42], [14, 42], [0, 58]) }]),
    eyesChibi(k, { w: 28, dx: 44, y: -5, brows: false }),
    part([], [`M${L(0, 58)}L${L(0, 70)}`, `M${L(0, 70)}Q${L(-20, 88)} ${L(-36, 72)}`, `M${L(0, 70)}Q${L(20, 88)} ${L(36, 72)}`]));
})();

// ====================== FATE ======================
const fataFuoco = (() => {
  const { k, kb } = std();
  return page("fata-fuoco", "fate", "Fata del Fuoco", "🔥",
    bgStars([[120, 110, 26], [880, 90, 22], [860, 560, 20], [130, 520, 18]]),
    sparklesBg([[260, 220, 16], [740, 200, 14], [250, 520, 12]]),
    fairyWings(k), hairLongBack(k), neck(kb), legs(kb, { boots: true }), topSkirt(kb), armsPose(kb, "hip", "down"),
    head(k), bangsSide(k), eyesChibi(k), faceChibi(k, { smile: "big" }), tiara(k));
})();

const fataAcqua = (() => {
  const { k, kb } = std();
  return page("fata-acqua", "fate", "Fata dell'Acqua", "💧",
    bgStars([[110, 130, 22], [890, 120, 26], [870, 540, 18]]),
    part([{ id: "bolla-1", d: k.C(-280, 300, 30) }, { id: "bolla-2", d: k.C(300, 250, 22) }, { id: "bolla-3", d: k.C(-240, 420, 18) }]),
    fairyWings(k), pigtails(k), hairBobBack(k), neck(kb), legs(kb), dress(kb), armsPose(kb, "down", "wave"),
    head(k), bangs(k), eyesChibi(k), faceChibi(k, { smile: "open" }), flowerInHair(k, 70, -75));
})();

const fataFiori = (() => {
  const { k, kb } = std();
  return page("fata-fiori", "fate", "Fata dei Fiori", "🌸",
    part([{ id: "erba", d: rect(0, 610, 1000, 90) }]),
    part([{ id: "farfalla-1", d: k.E(-300, 120, 22, 16) }, { id: "farfalla-2", d: k.E(300, 200, 22, 16) }]),
    fairyWings(k), hairBobBack(k), neck(kb), legs(kb), dress(kb, { long: true }), armsPose(kb, "down", "down"),
    head(k), bangsStraight(k), eyesChibi(k), faceChibi(k, { smile: "big" }), flowerInHair(k, -78, -70), prefix(flowerInHair(k, 62, -92), "f2"),
    sparklesBg([[240, 100, 14], [760, 110, 14]]));
})();

const fataStelle = (() => {
  const { k, kb } = std();
  return page("fata-stelle", "fate", "Fata delle Stelle", "⭐",
    bgStars([[100, 100, 30], [900, 80, 24], [120, 560, 20], [900, 520, 22], [300, 60, 14], [700, 620, 14]]),
    part([{ id: "luna", d: "M880 300A70 70 0 1 1 880 420A54 54 0 1 0 880 300Z" }]),
    fairyWings(k), ponytail(k), neck(kb), legs(kb, { boots: true }), topSkirt(kb), armsPose(kb, "hip", "up"),
    head(k), bangsSide(k), eyesChibi(k, { wink: "sx" }), faceChibi(k, { smile: "open" }), wand(kb));
})();

const fataLuna = (() => {
  const { k, kb } = std();
  return page("fata", "fate", "Fata Luna", "🧚",
    bgStars([[150, 120, 26], [850, 160, 22], [200, 520, 20]]),
    part([{ id: "luna", d: "M880 420A80 80 0 1 1 880 560A62 62 0 1 0 880 420Z" }]),
    fairyWings(k), hairLongStraightBack(k), neck(kb), legs(kb), dress(kb), armsPose(kb, "down", "up"),
    head(k), bangs(k), eyesChibi(k), faceChibi(k), wand(kb));
})();

// ====================== SQUADRA DI EROI ======================
const supereroina = (() => {
  const { k, kb } = std();
  return page("supereroina", "eroi", "Super Stella", "🦸‍♀️",
    bgStars([[110, 100, 26], [890, 110, 22], [870, 560, 20]]),
    cape(kb), hairLongBack(k), neck(kb), legs(kb, { boots: true }), heroSuit(kb, "star"), armsPose(kb, "hip", "up"),
    head(k), bangsSide(k), mask(k), eyesChibi(k), faceChibi(k, { smile: "big" }));
})();

const capitanFulmine = (() => {
  const { k, kb } = std();
  return page("capitan-fulmine", "eroi", "Capitan Fulmine", "⚡",
    part([{ id: "fulmine-1", d: k.P([-330, -120], [-370, -30], [-340, -30], [-360, 50], [-300, -60], [-330, -60]) }, { id: "fulmine-2", d: k.P([330, 200], [290, 290], [320, 290], [300, 370], [360, 260], [330, 260]) }]),
    cape(kb), neck(kb), legs(kb, { boots: true }), heroSuit(kb, "bolt"), armsPose(kb, "hip", "up"),
    ears(k), head(k), hairSpiky(k), mask(k), eyesChibi(k), faceChibi(k, { smile: "big" }));
})();

const ombra = (() => {
  const { k, kb } = chibi(500, 185, 1.08);
  return page("ombra", "eroi", "Ombra", "🌙",
    bgStars([[120, 90, 22], [880, 110, 26], [860, 580, 18]]),
    part([{ id: "luna", d: "M140 420A75 75 0 1 1 140 550A58 58 0 1 0 140 420Z" }]),
    hoodCloak(k), neck(kb), legs(kb, { boots: true }), heroSuit(kb, "circle"), armsPose(kb, "down", "down"),
    head(k), bangsSide(k), eyesChibi(k), faceChibi(k, { smile: "small" }),
    part([{ id: "magia-sx", d: kb.S(-79, 320, 32, 13, 4) }, { id: "magia-dx", d: kb.S(79, 320, 32, 13, 4) }]));
})();

const roboRagazzo = (() => {
  const { k, kb } = std();
  const { R, C, L } = kb;
  return page("robo-ragazzo", "eroi", "Robo-Ragazzo", "🤖",
    sparklesBg([[130, 120, 18], [870, 130, 18], [860, 580, 14]]),
    neck(kb), legs(kb, { boots: true }),
    part([
      { id: "tuta", d: R(-62, 125, 124, 180, 24) },
      { id: "corazza", d: R(2, 125, 60, 180, 14) },
      { id: "reattore", d: C(-30, 200, 24) },
      { id: "cintura", d: R(-62, 272, 124, 22) },
    ]),
    part([
      { id: "braccio-sx", d: R(-98, 135, 38, 140, 19) },
      { id: "mano-sx", d: C(-79, 282, 20) },
      { id: "spalla-robot", d: C(80, 140, 30) },
      { id: "braccio-robot", d: R(60, 160, 40, 70, 8) },
      { id: "gomito-robot", d: C(80, 240, 22) },
      { id: "avambraccio-robot", d: R(60, 255, 40, 50, 8) },
      { id: "mano-robot", d: R(55, 300, 50, 30, 8) },
    ], [`M${L(66, 180)}L${L(94, 180)}`, `M${L(66, 200)}L${L(94, 200)}`]),
    ears(k), head(k), hairSpiky(k),
    part([{ id: "visore", d: k.C(44, 22, 48) }]),
    eyesChibi(k), faceChibi(k, { smile: "small" }));
})();

const ragazzaStellare = (() => {
  const { k, kb } = std();
  return page("ragazza-stellare", "eroi", "Ragazza Stellare", "✨",
    bgStars([[110, 110, 28], [890, 100, 24], [880, 560, 22], [110, 540, 18], [500, 40, 14]]),
    hairLongBack(k), neck(kb), legs(kb, { boots: true }), heroSuit(kb, "star"), armsPose(kb, "up", "hip"),
    head(k), bangs(k), eyesChibi(k), faceChibi(k, { smile: "big" }),
    sparklesBg([[420, 80, 22], [380, 130, 14], [460, 50, 12]]));
})();

// ====================== AMICI CARTOON ======================
const micio = (() => {
  const k = kit(500, 210, 0.95);
  const { C, P, R, E, L } = k;
  return page("micio", "cartoni", "Micio", "🐱",
    part([{ id: "coda", d: `M${L(60, 320)}C${L(170, 330)} ${L(220, 250)} ${L(190, 180)}C${L(175, 160)} ${L(150, 175)} ${L(165, 200)}C${L(185, 260)} ${L(150, 300)} ${L(60, 290)}Z` }]),
    part([{ id: "gamba-sx", d: R(-55, 300, 46, 110, 14) }, { id: "gamba-dx", d: R(9, 300, 46, 110, 14) }, { id: "scarpa-sx", d: E(-32, 418, 44, 20) }, { id: "scarpa-dx", d: E(32, 418, 44, 20) }]),
    part([{ id: "maglietta", d: R(-62, 120, 124, 190, 28) }, { id: "stella-maglia", d: k.S(0, 215, 34, 14, 5) }]),
    part([{ id: "braccio-sx", d: R(-100, 135, 40, 130, 20) }, { id: "braccio-dx", d: R(60, 135, 40, 130, 20) }, { id: "zampa-sx", d: C(-80, 270, 23) }, { id: "zampa-dx", d: C(80, 270, 23) }]),
    part([{ id: "orecchio-sx", d: P([-95, -40], [-110, -150], [-20, -100]) }, { id: "orecchio-dx", d: P([95, -40], [110, -150], [20, -100]) }, { id: "interno-sx", d: P([-85, -55], [-95, -125], [-40, -95]) }, { id: "interno-dx", d: P([85, -55], [95, -125], [40, -95]) }]),
    part([{ id: "testa", d: C(0, 0, 112) }]),
    eyesChibi(k, { w: 32, dx: 46, y: 5, brows: true }),
    part([{ id: "naso", d: P([-16, 42], [16, 42], [0, 62]) }, { id: "guancia-sx", d: C(-72, 55, 12) }, { id: "guancia-dx", d: C(72, 55, 12) }],
      [`M${L(0, 62)}L${L(0, 78)}`, `M${L(0, 78)}Q${L(-22, 100)} ${L(-40, 80)}`, `M${L(0, 78)}Q${L(22, 100)} ${L(40, 80)}`, `M${L(-95, 40)}L${L(-160, 30)}`, `M${L(-95, 60)}L${L(-160, 75)}`, `M${L(95, 40)}L${L(160, 30)}`, `M${L(95, 60)}L${L(160, 75)}`]));
})();

const coniglietta = (() => {
  const k = kit(500, 230, 0.9);
  const { C, E, P, L } = k;
  return page("coniglietta", "cartoni", "Coniglietta", "🐰",
    part([{ id: "orecchio-sx", d: E(-48, -170, 32, 100) }, { id: "orecchio-dx", d: E(48, -170, 32, 100) }, { id: "interno-sx", d: E(-48, -165, 16, 72) }, { id: "interno-dx", d: E(48, -165, 16, 72) }]),
    legs(k, { top: 300 }), dress(k), armsPose(k, "down", "wave"),
    part([{ id: "testa", d: C(0, 0, 110) }]),
    part([{ id: "fiocco-sx", d: P([-70, -105], [-115, -130], [-105, -80]) }, { id: "fiocco-dx", d: P([-70, -105], [-30, -130], [-35, -80]) }, { id: "nodo", d: C(-70, -105, 10) }]),
    eyesChibi(k, { w: 30, dx: 44, y: 5 }),
    part([{ id: "naso", d: P([-12, 42], [12, 42], [0, 56]) }, { id: "dente-sx", d: k.R(-13, 70, 13, 18, 3) }, { id: "dente-dx", d: k.R(0, 70, 13, 18, 3) }, { id: "guancia-sx", d: C(-72, 52, 12) }, { id: "guancia-dx", d: C(72, 52, 12) }],
      [`M${L(0, 56)}L${L(0, 70)}`, `M${L(0, 70)}Q${L(-20, 86)} ${L(-34, 72)}`, `M${L(0, 70)}Q${L(20, 86)} ${L(34, 72)}`, `M${L(-95, 45)}L${L(-150, 38)}`, `M${L(95, 45)}L${L(150, 38)}`]));
})();

const dino = (() => {
  const k = kit(470, 240, 0.95);
  const { C, E, P, L } = k;
  return page("dino", "cartoni", "Dino", "🦖",
    part([{ id: "coda", d: `M${L(60, 300)}C${L(200, 320)} ${L(280, 260)} ${L(300, 180)}C${L(270, 220)} ${L(220, 260)} ${L(70, 250)}Z` }]),
    part([{ id: "cresta-1", d: P([-30, -95], [-10, -150], [10, -95]) }, { id: "cresta-2", d: P([20, -80], [50, -130], [60, -70]) }, { id: "cresta-3", d: P([60, -55], [100, -90], [95, -35]) }]),
    part([{ id: "gamba-sx", d: k.R(-70, 320, 56, 110, 20) }, { id: "gamba-dx", d: k.R(14, 320, 56, 110, 20) }, { id: "piede-sx", d: E(-42, 432, 50, 20) }, { id: "piede-dx", d: E(42, 432, 50, 20) }]),
    part([{ id: "corpo", d: E(0, 225, 95, 115) }, { id: "pancia", d: E(0, 245, 50, 70) }]),
    part([{ id: "braccio-sx", d: k.R(-120, 170, 40, 90, 20) }, { id: "braccio-dx", d: k.R(80, 170, 40, 90, 20) }]),
    part([{ id: "testa", d: E(0, 0, 115, 100) }, { id: "muso", d: E(70, 35, 70, 45) }, { id: "narice", d: C(110, 25, 8) }]),
    part([{ id: "macchia-1", d: C(-60, -40, 16) }, { id: "macchia-2", d: C(-20, 200, 14) }, { id: "macchia-3", d: C(50, 300, 12) }]),
    eyesChibi(k, { w: 28, dx: 34, y: -10, brows: false }),
    part([{ id: "guancia-sx", d: C(-70, 40, 11) }], [`M${L(30, 70)}Q${L(70, 95)} ${L(120, 60)}`]));
})();

// ====================== BAMBOLINE ======================
const bambolina = (() => {
  const { k, kb } = std();
  return page("bambola", "bamboline", "Bambolina", "👧",
    part([{ id: "erba", d: rect(0, 610, 1000, 90) }]),
    pigtails(k), hairBobBack(k), neck(kb), legs(kb), dress(kb), armsPose(kb, "down", "wave"),
    head(k), bangsStraight(k), eyesChibi(k), faceChibi(k, { smile: "big" }),
    part([{ id: "tasca", d: kb.R(-25, 240, 50, 40, 8) }]));
})();

const principessa = (() => {
  const { k, kb } = std();
  return page("principessa", "bamboline", "Principessa", "👸",
    bgStars([[120, 100, 20], [880, 90, 22]]),
    sparklesBg([[260, 160, 14], [740, 140, 14]]),
    hairLongBack(k), neck(kb), dress(kb, { long: true }), armsPose(kb, "down", "down"),
    part([{ id: "balza", d: kb.P([-104, 360], [104, 360], [120, 420], [-120, 420]) }, { id: "collana", d: kb.C(0, 150, 12) }]),
    head(k), bangs(k), eyesChibi(k), faceChibi(k), tiara(k), earrings(k));
})();

const sirena = (() => {
  const { k, kb } = chibi(500, 170, 1.18);
  const { L, E, P } = kb;
  return page("sirena", "bamboline", "Sirena", "🧜‍♀️",
    part([{ id: "bolla-1", d: k.C(-300, -60, 28) }, { id: "bolla-2", d: k.C(-340, 20, 16) }, { id: "bolla-3", d: k.C(300, 120, 22) }, { id: "stella-marina", d: k.S(330, 420, 48, 22, 5) }]),
    part([{ id: "alga", d: "M80 700C60 620 120 600 90 520C70 470 130 450 110 400L150 400C170 450 110 480 130 530C160 600 100 620 120 700Z" }]),
    hairLongBack(k), neck(kb),
    part([
      { id: "coda", d: `M${L(-58, 230)}L${L(58, 230)}C${L(95, 330)} ${L(60, 400)} ${L(30, 440)}L${L(130, 500)}L${L(-130, 500)}L${L(-30, 440)}C${L(-60, 400)} ${L(-95, 330)} ${L(-58, 230)}Z` },
      { id: "pinna-sx", d: P([-30, 440], [-130, 500], [-40, 480]) },
      { id: "pinna-dx", d: P([30, 440], [130, 500], [40, 480]) },
      { id: "busto", d: kb.R(-58, 125, 116, 110, 24) },
      { id: "top", d: E(0, 165, 70, 30) },
    ], [`M${L(-30, 290)}q30 20 60 0`, `M${L(-30, 340)}q30 20 60 0`, `M${L(-22, 390)}q22 18 44 0`]),
    armsPose(kb, "down", "wave"), head(k), bangsSide(k), eyesChibi(k), faceChibi(k, { smile: "big" }), flowerInHair(k, -80, -75));
})();

export const CHARACTER_PAGES: ColoringPage[] = [
  stellaPop, lunaPop, novaPop, bandPop, guerrieraPop, tigre,
  fataFuoco, fataAcqua, fataFiori, fataStelle, fataLuna,
  supereroina, capitanFulmine, ombra, roboRagazzo, ragazzaStellare,
  micio, coniglietta, dino,
  bambolina, principessa, sirena,
];
