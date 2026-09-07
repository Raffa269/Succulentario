/**
 * Ridimensiona e comprime una foto lato client prima del caricamento:
 * 800px sul lato lungo, JPEG qualità 0,72 — stessa scelta dell'artifact,
 * fa risparmiare banda in terrazzo (SPECIFICA.md §8.1).
 */
export async function comprimiImmagine(file: File, latoMax = 800, qualita = 0.72): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scala = Math.min(1, latoMax / Math.max(bitmap.width, bitmap.height));
  const larghezza = Math.round(bitmap.width * scala);
  const altezza = Math.round(bitmap.height * scala);

  const canvas = document.createElement("canvas");
  canvas.width = larghezza;
  canvas.height = altezza;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossibile preparare l'immagine.");
  ctx.drawImage(bitmap, 0, 0, larghezza, altezza);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compressione fallita."))),
      "image/jpeg",
      qualita,
    );
  });
}
