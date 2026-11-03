/**
 * Anteprima di tutte le pagine da colorare in un'unica immagine PNG.
 * Uso: node scripts/render-coloring.js [id1,id2,...] [output.png]
 * Richiede Playwright (npx playwright install chromium) e compila i contenuti con tsc.
 */
const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const out = fs.mkdtempSync(path.join(os.tmpdir(), "coloring-"));
execSync(
  `npx tsc src/content/coloring.ts src/content/coloring-characters.ts src/content/coloring-kit.ts src/content/coloring-shapes.ts --outDir ${out} --module commonjs --target es2020 --skipLibCheck --esModuleInterop`,
  { stdio: "inherit" },
);
const { COLORING_PAGES } = require(path.join(out, "coloring.js"));
const only = process.argv[2] ? process.argv[2].split(",") : null;
const pages = COLORING_PAGES.filter((p) => !only || only.includes(p.id));
const svg = (p) =>
  `<svg viewBox="0 0 1000 700" width="330" height="231" style="background:#fff;border:1px solid #ccc;border-radius:8px">${p.regions
    .map((r) => `<path d="${r.d}" fill="#fff" stroke="#2b2d42" stroke-width="${r.id === "sfondo" ? 0 : 5}" stroke-linejoin="round"/>`)
    .join("")}${(p.lines || []).map((d) => `<path d="${d}" fill="none" stroke="#2b2d42" stroke-width="5" stroke-linecap="round"/>`).join("")}</svg>`;
const html = `<html><body style="margin:10px;font-family:sans-serif;display:flex;flex-wrap:wrap;gap:10px;width:1060px">${pages
  .map((p) => `<div style="text-align:center;font-size:13px">${svg(p)}<div>${p.id}</div></div>`)
  .join("")}</body></html>`;

(async () => {
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  await page.setContent(html);
  const file = process.argv[3] || "coloring-preview.png";
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
  console.log(`${pages.length} disegni → ${file}`);
})();
