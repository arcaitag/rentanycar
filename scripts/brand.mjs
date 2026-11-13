// Logo-Varianten für rentanycar.ch. Wortmarke als echte Schriftkonturen (Manrope ExtraBold, SIL OFL),
// damit das Logo überall identisch aussieht – auch ohne installierte Schrift.
import { readFileSync } from "node:fs";
import opentype from "opentype.js";

export const COLORS = { forest: "#174B38", green: "#38A96B", leaf: "#79D99F", mint: "#E7F8ED", white: "#FFFFFF" };
// Symbol im 64er-Raster: Strasse, die ein «r» bildet und an einem Ziel-Punkt endet.
export const SYMBOL = { route: "M18.5 47V31.5C18.5 24.6 24.1 19 31 19H32", dot: [45, 19, 6], rx: 17, stroke: 9.5 };

const buf = readFileSync(new URL("../node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff", import.meta.url));
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

function wordmark(x, baseline, size, tracking = -0.02) {
  const text = "rentanycar.ch";
  const parts = ["", ""];
  let i = 0;
  font.forEachGlyph(text, x, baseline, size, { kerning: true }, (glyph, gx, gy) => {
    parts[i < 7 ? 0 : 1] += glyph.getPath(gx + i * tracking * size, gy, size).toPathData(2);
    i++;
  });
  const width = font.getAdvanceWidth(text, size, { kerning: true }) + (text.length - 1) * tracking * size;
  return { a: parts[0], b: parts[1], width };
}

function symbol({ bg, route, dot, size = 64, x = 0, y = 0, rx = SYMBOL.rx, stroke = SYMBOL.stroke, r = SYMBOL.dot[2], mono = false, id = "k" }) {
  const t = `translate(${x} ${y}) scale(${size / 64})`;
  const [cx, cy] = SYMBOL.dot;
  if (mono) {
    return `<defs><mask id="${id}"><rect width="64" height="64" fill="#fff"/><path d="${SYMBOL.route}" fill="none" stroke="#000" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#000"/></mask></defs><g transform="${t}"><rect width="64" height="64" rx="${rx}" fill="${bg}" mask="url(#${id})"/></g>`;
  }
  return `<g transform="${t}"><rect width="64" height="64" rx="${rx}" fill="${bg}"/><path d="${SYMBOL.route}" fill="none" stroke="${route}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${dot}"/></g>`;
}

function horizontal({ sym, a, b, title }) {
  const S = 56, gap = 15, size = 38;
  const xh = font.tables.os2.sxHeight / font.unitsPerEm;
  const baseline = S / 2 + (xh * size) / 2;
  const wm = wordmark(S + gap, baseline, size);
  const w = Math.ceil(S + gap + wm.width + 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${S}" width="${w * 4}" height="${S * 4}" role="img" aria-labelledby="t"><title id="t">${title}</title>${symbol({ ...sym, size: S })}<path d="${wm.a}" fill="${a}"/><path d="${wm.b}" fill="${b}"/></svg>`;
}

export function brandFiles() {
  const { forest, green, leaf, white } = COLORS;
  const std = { bg: forest, route: leaf, dot: white };
  return {
    "rentanycar-logo.svg": horizontal({ sym: std, a: forest, b: green, title: "rentanycar.ch" }),
    "rentanycar-logo-dark.svg": horizontal({ sym: { bg: leaf, route: forest, dot: forest }, a: white, b: leaf, title: "rentanycar.ch (für dunkle Hintergründe)" }),
    "rentanycar-logo-mono.svg": horizontal({ sym: { bg: forest, mono: true }, a: forest, b: forest, title: "rentanycar.ch (einfarbig)" }),
    "rentanycar-symbol.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256" role="img" aria-label="rentanycar.ch">${symbol(std)}</svg>`,
    "rentanycar-app-icon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512" role="img" aria-label="rentanycar.ch"><rect width="64" height="64" fill="${forest}"/>${symbol({ ...std, rx: 0 })}</svg>`,
    "rentanycar-favicon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32">${symbol({ ...std, rx: 15, stroke: 11, r: 7 })}</svg>`,
  };
}
