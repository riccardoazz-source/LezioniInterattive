/**
 * Riduce una foto (dalla fotocamera o dal rullino) a una dimensione
 * ragionevole e la converte in JPEG, così pesa poco (≈100-250 KB).
 */
export async function compressImage(file: File, maxSide = 1280, quality = 0.8): Promise<string> {
  const bitmap = await loadImage(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas non disponibile");
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

async function loadImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // imageOrientation: "from-image" rispetta la rotazione EXIF delle foto da iPhone
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fallback sotto */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("immagine non valida"));
    };
    img.src = url;
  });
}
