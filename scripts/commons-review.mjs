// Sucht frei lizenzierte Fahrzeugfotos auf Wikimedia Commons und erstellt Kontaktbögen zur Auswahl.
// Ausgabe in ./out: bogen-N.jpg, bogen-N.b64.txt (Base64 des JPEG) und kandidaten.json.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const UA = "rentanycar-bildauswahl/1.0 (https://rentanycar.vercel.app)";
const MOCK = process.env.MOCK === "1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = process.env.REVIEW_OUT ?? "out";
mkdirSync(OUT, { recursive: true });

const MODELS = [
  { slug: "vw-golf", q: ['"Golf VIII" front', '"Golf 8" front', 'Volkswagen "Golf VIII"', '"Golf Mk8"'], must: /golf/i, not: /\bGT[IDE]\b|Golf R\b|R-Line|Clubsport|Variant|Alltrack|estate|Golf (VII|7|Mk7)\b|Sportsvan|VIII R\b|\bR 333\b|20 Years/i, pref: /1\.5|TSI|Life|Style/i },
  { slug: "tesla-model-3", q: ['"Tesla Model 3" front', 'Tesla "Model 3" 2022', 'Tesla "Model 3" 2021'], must: /model[ _-]?3/i, not: /Model (S|X|Y)\b/i, pref: /202[0-4]/ },
  { slug: "mini-cooper", q: ['Mini Cooper F56 front', '"MINI Cooper" F56', '"Mini Hatch" F56', '"Mini Cooper" 2019 front'], must: /mini/i, not: /cabrio|convertible|clubman|countryman|paceman|john cooper works|\bJCW\b|\bR5[036]\b|\bJ01\b|\bF66\b|\bF55\b|5-door|5-Türer|five-door/i, pref: /F56/i },
  { slug: "mercedes-vito", q: ['"Mercedes-Benz Vito" W447 front', '"Vito Tourer" front', 'Vito W447 Tourer', '"Mercedes-Benz Vito" 2021'], must: /vito|w\s?447/i, not: /W63[89]|polizei|police|ambulance|rettung|feuerwehr|taxi|V-Klasse|V-Class|Marco Polo|eVito Kasten|Kastenwagen|panel van|\bV ?2[0-9]0 ?d\b/i, pref: /tourer|facelift|2020|2021|2022/i },
  { slug: "skoda-octavia-combi", q: ['"Octavia Combi" front', '"Octavia IV" Combi', 'Skoda Octavia estate 2021 front', 'Škoda "Octavia Combi" 2020'], must: /octavia[^]*?(combi|estate|kombi|wagon|break)|(combi|estate|kombi|wagon|break)[^]*?octavia/i, not: /\bRS\b|Scout|Octavia (I|II|III)\b|Mk ?[123]\b|polizei|police/i, pref: /\bIV\b|\bNX\b|202[0-3]/ },
  { slug: "volvo-xc60", q: ['"Volvo XC60" 2022 front', '"XC60 II" front', '"Volvo XC60" Recharge', '"Volvo XC60" 2021 front'], must: /xc60/i, not: /20(0[89]|1[0-6])\b|XC60 I\b|XC40|XC90|polizei|police/i, pref: /Recharge|T6|T8|202[1-3]|facelift/i },
  { slug: "mazda-mx-5", q: ['"Mazda MX-5" ND front', '"MX-5" ND Roadster', '"Mazda MX-5" 2019', '"MX-5 Miata" ND'], must: /mx-?5|miata/i, not: /\b(RF|NA|NB|NC|NA6)\b|Cup|racing|race car/i, pref: /\bND\b|201[6-9]|202[0-3]/ },
  { slug: "fiat-500e", q: ['"Fiat 500e" front', '"Fiat 500" electric 2021', '"New 500" Fiat electric', '"Fiat 500" La Prima'], must: /500/i, not: /abarth|500X|500L|cabrio|convertible|3\+1|1957|Nuova|20(0[7-9]|1\d)\b/i, pref: /500e|electric|elettric|elektro|La Prima|Icon|\bRED\b/i },
  { slug: "toyota-yaris", q: ['"Toyota Yaris" Hybrid 2021 front', '"Yaris" XP210 front', '"Toyota Yaris" 2020 front', '"Toyota Yaris" 2022'], must: /yaris/i, not: /GR Yaris|GR-Yaris|\bGR\b|Yaris Cross|WRC|rally|XP(130|150|90)|20(0\d|1[0-8])\b|sedan|ativ|vios/i, pref: /hybrid|XP210|202[0-3]/i },
  { slug: "vw-transporter", q: ['"Transporter T6.1" front', '"T6.1" Kastenwagen', '"Volkswagen Transporter" T6.1', '"T6.1" Transporter van'], must: /transporter|T6[.,]1/i, not: /multivan|caravelle|california|pick-?up|pritsche|doppelkabine|double cab|polizei|police|feuerwehr|ambulance|rettung|camper|\bT[3457]\b|\bT5\.1\b|kombi/i, pref: /T6[.,]1|kastenwagen|panel van|\bvan\b/i },
];
const GENERIC_NOT = /\b(rear|heck|back view|interior|innen|innenraum|cockpit|dashboard|armaturen|engine|motorraum|detail|badge|emblem|logo|wheel|felge|seat|sitz|trunk|kofferraum|crash|unfall|tuning|concept|studie|prototype|camouflage|model car|toy|lego|diecast|scale model|intérieur|arrière|posteriore|trasera|heckansicht|rückansicht|free image)\b/i;
const OK_LICENSE = /^(CC BY(-SA)? \d(\.\d)?( [a-z]{2})?|CC0( 1\.0)?|Public domain)$/i;
const strip = (h = "") => String(h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function api(params) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({ action: "query", format: "json", formatversion: "2", ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
    if (r?.ok) return r.json();
    await sleep(1500 * (i + 1));
  }
  throw new Error(`Commons-API nicht erreichbar: ${url}`);
}

async function candidates(m) {
  const found = new Map();
  for (const q of m.q) {
    const j = await api({ generator: "search", gsrsearch: `${q} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "50", prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "330", iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|ImageDescription" });
    for (const p of j.query?.pages ?? []) {
      const ii = p.imageinfo?.[0];
      if (!ii || found.has(p.title)) continue;
      const md = ii.extmetadata ?? {};
      const license = strip(md.LicenseShortName?.value);
      const desc = strip(md.ImageDescription?.value);
      const text = `${p.title} ${desc}`;
      const ratio = ii.width / ii.height;
      if (ii.mime !== "image/jpeg" || ii.width < 2000 || ratio < 1.25 || ratio > 1.95) continue;
      if (!OK_LICENSE.test(license) || !m.must.test(text) || m.not.test(text) || GENERIC_NOT.test(text)) continue;
      let score = -(p.index ?? 50) / 100;
      if (/front|vorne|frontansicht|vorderansicht|3\/4/i.test(text)) score += 3;
      if (m.pref.test(text)) score += 1;
      if (ii.width >= 3000) score += 0.5;
      found.set(p.title, { title: p.title, author: strip(md.Artist?.value), license, licenseUrl: md.LicenseUrl?.value ?? "", page: ii.descriptionurl, thumb: ii.thumburl, width: ii.width, height: ii.height, score: +score.toFixed(2), desc: desc.slice(0, 180) });
    }
    await sleep(300);
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, 12);
}

const TW = 240, TH = 160, COLS = 6, PAD = 6, HEAD = 26;
const esc = (s) => s.replace(/[<&>]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" })[c]);
const label = (text, w, h, size, bg) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="6" y="${h - 7}" font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-size="${size}" font-weight="bold" fill="#fff">${esc(text)}</text></svg>`);

async function tile(url, n) {
  let img = null;
  if (MOCK) img = sharp({ create: { width: 330, height: 220, channels: 3, background: `hsl(${n * 37 % 360}, 45%, 55%)` } });
  else {
    for (let i = 0; i < 3 && !img; i++) {
      const r = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
      if (r?.ok) img = sharp(Buffer.from(await r.arrayBuffer()));
      else await sleep(1000 * (i + 1));
    }
  }
  const base = img ? await img.resize(TW, TH, { fit: "contain", background: "#ffffff" }).png().toBuffer() : await sharp({ create: { width: TW, height: TH, channels: 3, background: "#dddddd" } }).png().toBuffer();
  return sharp(base).composite([{ input: label(String(n), 30, 22, 15, "#174B38"), left: 0, top: 0 }]).png().toBuffer();
}

async function sheet(groups, file) {
  const parts = [];
  let y = PAD;
  for (const g of groups) {
    parts.push({ input: label(g.slug, COLS * (TW + PAD) - PAD, HEAD - 4, 16, "#38A96B"), left: PAD, top: y });
    y += HEAD;
    for (let i = 0; i < g.items.length; i++) {
      const col = i % COLS, row = Math.floor(i / COLS);
      parts.push({ input: await tile(g.items[i].thumb, i + 1), left: PAD + col * (TW + PAD), top: y + row * (TH + PAD) });
      if (!MOCK) await sleep(150);
    }
    y += Math.max(1, Math.ceil(g.items.length / COLS)) * (TH + PAD) + 4;
  }
  const jpg = await sharp({ create: { width: COLS * (TW + PAD) + PAD, height: y + PAD, channels: 3, background: "#ffffff" } }).composite(parts).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
  writeFileSync(`${OUT}/${file}.b64.txt`, jpg.toString("base64"));
    console.log(`${file}: ${jpg.length} Bytes`);
}

const all = [];
for (const m of MODELS) {
  const items = MOCK ? Array.from({ length: 9 }, (_, i) => ({ title: `File:Mock ${m.slug} ${i + 1}.jpg`, thumb: "" })) : await candidates(m);
  console.log(`${m.slug}: ${items.length} Kandidaten`);
  all.push({ slug: m.slug, items });
}
writeFileSync(`${OUT}/kandidaten.json`, JSON.stringify(all));
for (let s = 0; s < all.length; s += 2) await sheet(all.slice(s, s + 2), `bogen-${s / 2 + 1}`);
// writeFileSync("out/index.html", `<!doctype html><meta charset="utf-8"><title>Bildauswahl</title>${[1, 2, 3, 4, 5].map((n) => `<p><img src="bogen-${n}.jpg" style="max-width:100%"></p>`).join("")}`);
console.log("fertig");
