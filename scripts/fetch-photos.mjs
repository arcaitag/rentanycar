// Lädt die in src/data/photos.json ausgewählten Symbolbilder von Wikimedia Commons und speichert sie
// einheitlich im Format 3:2 unter public/symbolbilder/<slug>.jpg (1200 px) und <slug>-600.jpg.
// Auf Vercel bricht der Build ab, wenn ein Foto fehlt. Lokal ohne Netz entstehen graue Platzhalter.
// Optionen: --force (neu laden), --sheet (Kontrollbogen als Base64-Text nach $SHEET_OUT/kontrolle.b64.txt)
import sharp from "sharp";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const UA = "rentanycar/1.0 (https://rentanycar.vercel.app)";
const args = process.argv.slice(2);
const force = args.includes("--force");
const sheet = args.includes("--sheet");
const outDir = new URL("../public/symbolbilder/", import.meta.url).pathname;
const onVercel = !!process.env.VERCEL;
const photos = JSON.parse(readFileSync(new URL("../src/data/photos.json", import.meta.url), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });

async function get(url, asJson) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
    if (r?.ok) return asJson ? r.json() : Buffer.from(await r.arrayBuffer());
    await sleep(1500 * (i + 1));
  }
  throw new Error(`Download fehlgeschlagen: ${url}`);
}

async function original(file) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", formatversion: "2", titles: file, prop: "imageinfo", iiprop: "url", iiurlwidth: "1920" }).forEach(([k, v]) => u.searchParams.set(k, v));
  const ii = (await get(u, true)).query?.pages?.[0]?.imageinfo?.[0];
  if (!ii) throw new Error(`Datei nicht auf Commons gefunden: ${file}`);
  return get(ii.thumburl ?? ii.url);
}

/**
 * Bringt ein Foto auf 3:2. Standard: mittig zuschneiden.
 * `crop` = { left, top, width } (Anteile) wählt vorher einen Ausschnitt.
 * `fill` zeigt das ganze Bild und ergänzt fehlende Ränder gespiegelt (für sehr breite Fotos).
 */
async function render(buf, p, w, h) {
  let img = sharp(buf);
  if (p.crop) {
    const meta = await sharp(buf).metadata();
    const cw = Math.min(meta.width, Math.round(p.crop.width * meta.width));
    const ch = Math.min(meta.height, Math.round(cw / 1.5));
    const left = Math.max(0, Math.min(meta.width - cw, Math.round(p.crop.left * meta.width)));
    const top = Math.max(0, Math.min(meta.height - ch, Math.round(p.crop.top * meta.height)));
    img = img.extract({ left, top, width: cw, height: ch });
  }
  const jpeg = { quality: w > 800 ? 80 : 78, mozjpeg: true, progressive: true };
  if (p.fill) {
    const inner = await img.resize({ width: w, height: h, fit: "inside" }).toBuffer({ resolveWithObject: true });
    const py = h - inner.info.height, px = w - inner.info.width;
    return sharp(inner.data)
      .extend({ top: Math.floor(py / 2), bottom: Math.ceil(py / 2), left: Math.floor(px / 2), right: Math.ceil(px / 2), extendWith: "mirror" })
      .jpeg(jpeg)
      .toBuffer();
  }
  return img.resize(w, h, { fit: "cover", position: "centre" }).jpeg(jpeg).toBuffer();
}

const placeholder = (w, h) =>
  sharp({ create: { width: w, height: h, channels: 3, background: "#dfe8e3" } })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><text x="50%" y="50%" text-anchor="middle" font-family="sans-serif" font-size="${w / 20}" fill="#66736d">Foto (offline)</text></svg>`) }])
    .jpeg({ quality: 70 })
    .toBuffer();

const label = (text) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="24"><rect width="100%" height="100%" fill="#174B38"/><text x="6" y="17" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff">${text}</text></svg>`);

let loaded = 0, offline = 0;
const tiles = [];
const bundle = {};
for (const p of photos) {
  const big = `${outDir}/${p.slug}.jpg`, small = `${outDir}/${p.slug}-600.jpg`;
  if (!force && !sheet && existsSync(big) && existsSync(small)) continue;
  try {
    const buf = await original(p.file);
    writeFileSync(big, await render(buf, p, 1200, 800));
    const smallBuf = await render(buf, p, 600, 400);
    writeFileSync(small, smallBuf);
    if (sheet) {
      bundle[p.slug] = smallBuf.toString("base64");
      const { width, height } = await sharp(buf).metadata();
      const ratio = (width / height).toFixed(2);
      const tile = async (q, text) => sharp(await render(buf, q, 400, 267)).composite([{ input: label(text), left: 0, top: 0 }]).png().toBuffer();
      tiles.push(await tile(p, `${p.slug} ${ratio}${p.fill ? " fill" : p.crop ? " crop" : ""}`));
      if (!p.fill && width / height > 1.55) tiles.push(await tile({ ...p, crop: undefined, fill: true }, `${p.slug} (Variante fill)`));
    }
    loaded++;
    await sleep(250);
  } catch (e) {
    if (onVercel) {
      console.error(`Foto für ${p.slug} konnte nicht geladen werden: ${e.message}`);
      process.exit(1);
    }
    writeFileSync(big, await placeholder(1200, 800));
    writeFileSync(small, await placeholder(600, 400));
    offline++;
  }
}
console.log(`Symbolbilder: ${loaded} geladen${offline ? `, ${offline} Platzhalter (offline)` : ""}.`);

if (sheet && tiles.length) {
  const cols = 3, tw = 400, th = 267, pad = 6, rows = Math.ceil(tiles.length / cols);
  const jpg = await sharp({ create: { width: cols * (tw + pad) + pad, height: rows * (th + pad) + pad, channels: 3, background: "#ffffff" } })
    .composite(tiles.map((input, i) => ({ input, left: pad + (i % cols) * (tw + pad), top: pad + Math.floor(i / cols) * (th + pad) })))
    .jpeg({ quality: 74 })
    .toBuffer();
  const dir = process.env.SHEET_OUT ?? outDir;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/kontrolle.b64.txt`, jpg.toString("base64"));
  writeFileSync(`${dir}/bilder.json`, JSON.stringify(bundle));
  console.log(`Kontrollbogen: ${jpg.length} Bytes`);
}
