/**
 * Riempimento a secchiello su immagini raster (disegni da colorare).
 * Le linee nere del disegno fanno da confine; si colora solo la zona
 * contigua chiara toccata.
 */

/**
 * Maschera dei pixel "linea": 1 = confine (scuro e opaco), 0 = colorabile.
 * Le linee vengono "ingrossate" di `grow` pixel solo nella maschera (non nel
 * disegno): così le piccole interruzioni delle linee non fanno scappare il
 * colore e il riempimento si ferma un filo prima del tratto.
 */
export function buildLineMask(img: ImageData, threshold = 160, grow = 2): Uint8Array {
  const { data, width, height } = img;
  const mask = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const a = data[p + 3];
    if (a < 60) continue; // trasparente = colorabile
    const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    if (lum < threshold) mask[i] = 1;
  }
  return grow > 0 ? dilate(mask, width, height, grow) : mask;
}

/** Dilatazione separabile (orizzontale + verticale) di raggio r. */
function dilate(mask: Uint8Array, width: number, height: number, r: number): Uint8Array {
  const tmp = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (!mask[row + x]) continue;
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width - 1, x + r);
      for (let k = x0; k <= x1; k++) tmp[row + k] = 1;
    }
  }
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!tmp[y * width + x]) continue;
      const y0 = Math.max(0, y - r);
      const y1 = Math.min(height - 1, y + r);
      for (let k = y0; k <= y1; k++) out[k * width + x] = 1;
    }
  }
  return out;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Riempie (scanline) la zona contigua non-linea che contiene (x, y),
 * scrivendo il colore nel layer `paint` (RGBA). Restituisce i pixel colorati.
 */
export function floodFill(mask: Uint8Array, width: number, height: number, x: number, y: number, paint: Uint8ClampedArray, color: string): number {
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 0 || y < 0 || x >= width || y >= height) return 0;
  if (mask[y * width + x]) return 0;
  const [r, g, b] = hexToRgb(color);
  const visited = new Uint8Array(width * height);
  const stack: number[] = [x, y];
  let count = 0;
  while (stack.length) {
    const cy = stack.pop()!;
    let cx = stack.pop()!;
    let i = cy * width + cx;
    // vai a sinistra fino al confine
    while (cx >= 0 && !mask[i] && !visited[i]) {
      cx--;
      i--;
    }
    cx++;
    i++;
    let spanUp = false;
    let spanDown = false;
    while (cx < width && !mask[i] && !visited[i]) {
      visited[i] = 1;
      const p = i * 4;
      paint[p] = r;
      paint[p + 1] = g;
      paint[p + 2] = b;
      paint[p + 3] = 255;
      count++;
      if (cy > 0) {
        const up = i - width;
        const ok = !mask[up] && !visited[up];
        if (ok && !spanUp) {
          stack.push(cx, cy - 1);
          spanUp = true;
        } else if (!ok) spanUp = false;
      }
      if (cy < height - 1) {
        const down = i + width;
        const ok = !mask[down] && !visited[down];
        if (ok && !spanDown) {
          stack.push(cx, cy + 1);
          spanDown = true;
        } else if (!ok) spanDown = false;
      }
      cx++;
      i++;
    }
  }
  return count;
}
