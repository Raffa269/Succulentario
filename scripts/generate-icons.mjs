// Genera le icone PWA a partire da un logo SVG minimale, nei colori del
// Succulentario. Uso: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const GREEN = "#2F6045";
const CREAM = "#F1F2EC";

// Rosetta stilizzata (stesso stile delle illustrazioni in dati/illustrazioni.json).
// Ogni foglia è definita in coordinate locali con la base nell'origine, poi
// ruotata attorno a (0,0): il gruppo esterno trasla al centro e scala, così
// la rotazione di ogni foglia resta attorno al punto giusto senza bisogno di
// `transform-origin` (non supportato in modo affidabile da librsvg).
function rosette() {
  const leaf = (rot) =>
    `<path d="M 0 0 C -7 -15 -7 -30 0 -42 C 7 -30 7 -15 0 0 Z" fill="${CREAM}" transform="rotate(${rot})"/>`;
  const angles = [0, 60, 120, 180, 240, 300];
  return `${angles.map(leaf).join("")}<circle cx="0" cy="0" r="6" fill="${CREAM}"/>`;
}

function svgIcon({ size, padding, rounded }) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = ((size - padding * 2) / 100) * 0.9;
  const r = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" fill="${GREEN}"/>
    <g transform="translate(${cx} ${cy}) scale(${scale})">${rosette()}</g>
  </svg>`;
}

const outDir = path.join(process.cwd(), "public", "icons");
await mkdir(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192, padding: 20, rounded: true },
  { file: "icon-512.png", size: 512, padding: 48, rounded: true },
  { file: "icon-512-maskable.png", size: 512, padding: 96, rounded: false },
  { file: "apple-touch-icon.png", size: 180, padding: 18, rounded: false }, // iOS arrotonda da sé
];

for (const t of targets) {
  const svg = svgIcon(t);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(path.join(outDir, t.file), png);
  console.log(`Scritto ${t.file}`);
}
