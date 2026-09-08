// Genera le icone PWA nel nuovo sistema grafico (handoff Claude Design):
// prugna piena, tratto crema, lo stesso germoglio dell'intestazione e della
// schermata di accesso. Alle misure piccole cade il "ricciolo" del terzo
// tratto e restano solo le due foglie e il fusto (mockup 1k). Uso: node
// scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PRUGNA = "#7A2E86";
const CREMA = "#F5EAD8";

// Germoglio in coordinate viewBox 0 0 24 24 (stesso disegno di
// src/components/app-header.tsx). Nessuna rotazione, quindi nessun problema
// con transform-origin e librsvg.
function germoglio({ conRicciolo, strokeWidth }) {
  const tratti = [
    "M12 21v-8",
    "M12 13c0-3.4 2.4-6 6-6 0 3.4-2.6 6-6 6z",
    "M12 13c0-3.4-2.4-6-6-6 0 3.4 2.6 6 6 6z",
  ];
  if (conRicciolo) tratti.push("M12 11c0-4 1.6-7 3.4-9.2C12.6 2.6 11 5.4 11 8");
  const path = tratti.map((d) => `<path d="${d}"/>`).join("");
  return `<g fill="none" stroke="${CREMA}" stroke-width="${strokeWidth}" stroke-linecap="round">${path}</g>`;
}

function svgIcona({ size, padding, rounded, conRicciolo, strokeWidth }) {
  const r = rounded ? size * 0.22 : 0;
  const areaContenuto = size - padding * 2;
  // Alle misure piccole il germoglio riempie una quota maggiore del
  // riquadro (resta leggibile), a quelle grandi una minore.
  const rapportoRiempimento = conRicciolo ? 0.66 : 0.72;
  const lato = areaContenuto * rapportoRiempimento;
  const offset = (size - lato) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="${PRUGNA}"/>
    <svg x="${offset}" y="${offset}" width="${lato}" height="${lato}" viewBox="0 0 24 24">
      ${germoglio({ conRicciolo, strokeWidth })}
    </svg>
  </svg>`;
}

const outDir = path.join(process.cwd(), "public", "icons");
await mkdir(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, padding: 20, rounded: true, conRicciolo: false, strokeWidth: 2.1 },
  { file: "icon-512.png", size: 512, padding: 48, rounded: true, conRicciolo: true, strokeWidth: 1.7 },
  { file: "icon-512-maskable.png", size: 512, padding: 96, rounded: false, conRicciolo: true, strokeWidth: 1.7 },
  { file: "apple-touch-icon.png", size: 180, padding: 18, rounded: false, conRicciolo: false, strokeWidth: 2.1 }, // iOS arrotonda da sé
];

for (const t of targets) {
  const svg = svgIcona(t);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(path.join(outDir, t.file), png);
  console.log(`Scritto ${t.file}`);
}
