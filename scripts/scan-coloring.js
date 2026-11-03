/**
 * Aggiorna src/content/coloring-images.ts con i file in public/colora/<categoria>/*.png|jpg
 * Uso: npm run colora:scan
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "public", "colora");
const target = path.join(__dirname, "..", "src", "content", "coloring-images.ts");
const entries = [];
if (fs.existsSync(root)) {
  for (const cat of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of fs.readdirSync(path.join(root, cat.name)).sort()) {
      if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
      const base = f.replace(/\.[^.]+$/, "");
      const id = `${cat.name}-${base}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const title = base.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
      entries.push({ id, title, category: cat.name, src: `/colora/${cat.name}/${f}` });
    }
  }
}
let src = fs.readFileSync(target, "utf8");
const marker = "  // GENERATO DA scripts/scan-coloring.js — non modificare a mano sotto questa riga\n";
const start = src.indexOf(marker);
const end = src.indexOf("];", start);
const body = entries.map((e) => `  ${JSON.stringify(e)},`).join("\n") + (entries.length ? "\n" : "");
src = src.slice(0, start + marker.length) + body + src.slice(end);
fs.writeFileSync(target, src);
console.log(`${entries.length} disegni trovati in public/colora → coloring-images.ts aggiornato`);
