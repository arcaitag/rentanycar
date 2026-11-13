// Parametrische Fahrzeug-Illustrationen (Seitenansicht) für rentanycar.ch.
// Eigene Arbeit – keine Fremdbilder, frei im Projekt verwendbar. Siehe CREDITS.md.

const n1 = (v) => Math.round(v * 10) / 10;

export function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const lighten = (c, t) => mix(c, "#ffffff", t);
const darken = (c, t) => mix(c, "#000000", t);

/** Polylinie mit abgerundeten Ecken. Punkte: [x, Höhe über Boden, Radius]. */
function path(pts, closed = false) {
  const P = pts.map(([x, h, r = 0]) => [x, -h, r]);
  const n = P.length;
  let d = "";
  P.forEach(([x, y, r], i) => {
    const cmd = i === 0 ? "M" : "L";
    if ((!closed && (i === 0 || i === n - 1)) || !r) { d += `${cmd}${n1(x)} ${n1(y)}`; return; }
    const a = P[(i - 1 + n) % n], b = P[(i + 1) % n];
    const la = Math.hypot(a[0] - x, a[1] - y), lb = Math.hypot(b[0] - x, b[1] - y);
    const c = Math.min(r, la / 2, lb / 2);
    d += `${cmd}${n1(x + ((a[0] - x) / la) * c)} ${n1(y + ((a[1] - y) / la) * c)}Q${n1(x)} ${n1(y)} ${n1(x + ((b[0] - x) / lb) * c)} ${n1(y + ((b[1] - y) / lb) * c)}`;
  });
  return closed ? d + "Z" : d;
}

// Karosserieformen: sil = Silhouette von hinten unten nach vorne unten, win = Fensterflächen.
export const BODIES = {
  hatch: { L: 440, clr: 16, wr: 38, w: [86, 356], top: 140, ice: true,
    sil: [[8,16],[0,34,10],[3,96,14],[60,136,34],[250,140,46],[322,98,16],[412,84,30],[440,58,14],[436,16]],
    win: [[[100,130,8],[192,131,6],[192,99,4],[80,99,6]], [[202,131,6],[241,131,10],[306,100,4],[202,100,4]]],
    seams: [110, 197, 314], handles: [182, 298], mirror: [310, 100],
    head: [[402,82],[430,74],[434,64],[406,68]], tail: [[1,90],[16,92],[16,78],[2,76]] },
  mini: { L: 400, clr: 16, wr: 37, w: [74, 326], top: 137, ice: true,
    sil: [[8,16],[0,36,12],[2,96,12],[24,133,24],[216,137,30],[284,100,12],[374,88,32],[400,60,16],[396,16]],
    win: [[[34,127,10],[146,128,6],[146,101,4],[26,101,6]], [[156,128,6],[208,128,10],[268,102,4],[156,102,4]]],
    seams: [150, 278], handles: [176], mirror: [270, 102],
    head: [[372,82],[394,74],[396,64],[376,66]], tail: [[1,92],[14,93],[14,78],[2,77]] },
  fastback: { L: 480, clr: 18, wr: 40, w: [96, 390], top: 136,
    sil: [[10,18],[0,36,12],[2,86,10],[44,92,16],[150,134,52],[270,136,52],[340,92,18],[454,74,34],[480,50,14],[476,18]],
    win: [[[124,124,16],[208,129,6],[208,95,4],[92,95,10]], [[218,129,6],[262,129,14],[326,96,4],[218,96,4]]],
    seams: [110, 213, 332], handles: [196, 318], mirror: [322, 96],
    head: [[440,72],[468,62],[472,56],[446,62]], tail: [[1,82],[22,86],[22,78],[2,76]] },
  wagon: { L: 500, clr: 16, wr: 39, w: [96, 410], top: 142, ice: true, rails: [44, 280],
    sil: [[8,16],[0,34,10],[4,104,14],[30,140,22],[292,142,50],[366,98,16],[472,82,30],[500,56,14],[496,16]],
    win: [[[36,132,10],[96,133,4],[96,100,4],[30,100,8]], [[104,133,4],[210,133,4],[210,100,4],[104,100,4]], [[218,133,4],[284,133,10],[350,101,4],[218,101,4]]],
    seams: [100, 214, 356], handles: [196, 338], mirror: [354, 101],
    head: [[462,82],[490,72],[494,62],[466,66]], tail: [[1,100],[16,102],[16,86],[2,84]] },
  suv: { L: 480, clr: 26, wr: 45, w: [92, 396], top: 164, ice: true, clad: 16, rails: [40, 262],
    sil: [[8,26],[0,46,12],[4,112,14],[30,160,24],[276,164,50],[352,116,18],[452,106,34],[480,72,16],[476,26]],
    win: [[[36,152,10],[94,154,4],[94,120,4],[32,120,8]], [[102,154,4],[204,154,4],[204,120,4],[102,120,4]], [[212,154,4],[268,154,12],[336,121,4],[212,121,4]]],
    seams: [98, 208, 342], handles: [190, 326], mirror: [338, 121],
    head: [[446,102],[474,92],[476,82],[450,86]], tail: [[1,106],[16,108],[16,92],[2,90]] },
  van: { L: 520, clr: 22, wr: 41, w: [88, 430], top: 198, ice: true,
    sil: [[8,22],[0,40,10],[2,176,14],[16,194,14],[378,198,40],[452,136,24],[498,112,26],[520,80,14],[516,22]],
    win: [[[22,184,8],[112,186,4],[112,130,4],[20,130,6]], [[120,186,4],[236,186,4],[236,130,4],[120,130,4]], [[244,186,4],[346,186,4],[346,130,4],[244,130,4]], [[354,186,4],[372,186,14],[440,134,4],[354,134,4]]],
    seams: [116, 240, 350], handles: [226, 434], mirror: [436, 134],
    head: [[492,108],[514,98],[516,88],[496,92]], tail: [[1,150],[12,150],[12,110],[1,110]] },
  panel: { L: 520, clr: 22, wr: 41, w: [88, 430], top: 202, ice: true,
    sil: [[8,22],[0,40,10],[2,188,12],[14,200,12],[372,202,36],[448,138,24],[496,112,26],[520,80,14],[516,22]],
    win: [[[354,190,4],[368,190,14],[436,135,4],[354,135,4]]],
    seams: [120, 238, 346], handles: [226, 430], mirror: [432, 135], stripe: true,
    head: [[490,108],[512,98],[514,88],[494,92]], tail: [[1,150],[12,150],[12,110],[1,110]] },
  roadster: { L: 400, clr: 14, wr: 36, w: [78, 330], top: 118, ice: true, open: true,
    sil: [[8,14],[0,30,10],[3,74,14],[118,82,12],[240,82,10],[372,66,30],[400,46,14],[396,14]],
    win: [[[238,82,2],[214,118,4],[230,118,4],[258,82,2]]],
    seams: [148, 244], handles: [230], mirror: [248, 84],
    head: [[368,66],[392,58],[394,50],[372,54]], tail: [[1,68],[16,70],[16,58],[2,56]] },
  small: { L: 380, clr: 16, wr: 36, w: [70, 310], top: 140,
    sil: [[8,16],[0,36,14],[2,100,16],[22,134,26],[196,140,40],[268,98,14],[350,84,34],[380,58,18],[376,16]],
    win: [[[30,128,10],[126,131,6],[126,100,4],[26,100,8]], [[134,131,6],[190,131,12],[252,101,4],[134,101,4]]],
    seams: [130, 262], handles: [150], mirror: [252, 101],
    head: [[352,78],[372,72],[374,62],[356,64]], tail: [[1,94],[14,95],[14,80],[2,79]] },
};

/** Fahrzeug als SVG-Gruppe in lokalen Koordinaten (Boden y=0, Front rechts). */
export function car(type, o = {}) {
  const B = BODIES[type];
  const id = o.id ?? type;
  const color = o.color ?? "#38A96B";
  const glass = o.glass ?? "#22332D";
  const rim = o.rim ?? "#DCE4E0";
  const { L, clr, wr, w } = B;
  const R = wr + 5, dx = Math.sqrt(R * R - (wr - clr) ** 2);
  const [w1, w2] = w;
  const bodyD = path(B.sil) + `L${n1(w2 + dx)} ${-clr}A${R} ${R} 0 1 0 ${n1(w2 - dx)} ${-clr}L${n1(w1 + dx)} ${-clr}A${R} ${R} 0 1 0 ${n1(w1 - dx)} ${-clr}Z`;
  const pts = B.win.flat();
  const winTop = Math.max(...pts.map((p) => p[1]));
  const belt = Math.min(...pts.map((p) => p[1]));
  const dc = darken(color, 0.3);
  let s = `<defs><linearGradient id="${id}b" x1="0" y1="${-B.top}" x2="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${lighten(color, 0.2)}"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${darken(color, 0.14)}"/></linearGradient>`
    + `<linearGradient id="${id}g" x1="0" y1="${-winTop}" x2="0" y2="${-belt}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${lighten(glass, 0.24)}"/><stop offset="1" stop-color="${glass}"/></linearGradient>`
    + `<clipPath id="${id}c"><path d="${bodyD}"/></clipPath><clipPath id="${id}w">${B.win.map((p) => `<path d="${path(p, true)}"/>`).join("")}</clipPath>`
    + `<filter id="${id}f" x="-10%" y="-150%" width="120%" height="400%"><feGaussianBlur stdDeviation="${o.simple ? 3 : 5}"/></filter></defs>`;
  s += `<ellipse cx="${L / 2}" cy="1" rx="${L * 0.49}" ry="${o.simple ? 6 : 9}" fill="#174B38" opacity=".22" filter="url(#${id}f)"/>`;
  s += w.map((x) => `<circle cx="${x}" cy="${-wr}" r="${wr + 4}" fill="#1D2723"/>`).join("");
  if (B.open) s += `<rect x="144" y="-106" width="22" height="26" rx="9" fill="#2A3530"/>`;
  s += `<path d="${bodyD}" fill="url(#${id}b)"/>`;
  s += `<g clip-path="url(#${id}c)">`;
  if (o.roof) s += `<rect x="0" y="${-B.top - 4}" width="${L}" height="${B.top + 4 - (o.roofDown ? belt - 2 : winTop + 1)}" fill="${o.roof}"/>`;
  s += `<rect x="0" y="${-(clr + (B.clad ?? 9))}" width="${L}" height="${B.clad ?? 9}" fill="#10201A" opacity="${B.clad ? 0.55 : 0.1}"/>`;
  if (B.stripe) s += `<rect x="0" y="${-(belt - 22)}" width="${L}" height="7" fill="${o.accent ?? "#79D99F"}"/>`;
  s += `</g>`;
  if (B.rails) s += `<rect x="${B.rails[0]}" y="${-B.top - 5}" width="${B.rails[1] - B.rails[0]}" height="4.5" rx="2.2" fill="${darken(color, 0.45)}"/>`;
  s += B.win.map((p) => `<path d="${path(p, true)}" fill="url(#${id}g)"/>`).join("");
  if (B.open) s += `<path d="M120 -83H236" stroke="#1D2723" stroke-width="3" stroke-linecap="round"/>`;
  const band = (x) => `<path d="M${x} ${-winTop - 4}h26l-${n1((winTop - belt) * 0.55)} ${winTop - belt + 8}h-26z" fill="#fff" opacity=".14"/>`;
  s += `<g clip-path="url(#${id}w)">${band(L * 0.3)}${band(L * 0.6)}</g>`;
  s += `<path d="M${n1(L * 0.03)} ${-(belt - 9)}L${n1(L * 0.93)} ${-(belt - 12)}" stroke="#fff" stroke-opacity=".32" stroke-width="2" stroke-linecap="round"/>`;
  if (!o.simple) {
    s += B.seams.map((x) => `<path d="M${x} ${-(belt - 3)}L${x - 1.5} ${-(clr + 8)}" stroke="${dc}" stroke-opacity=".4" stroke-width="1.5" fill="none"/>`).join("");
    s += B.handles.map((x) => `<rect x="${x - 16}" y="${-(belt - 11)}" width="16" height="4" rx="2" fill="${dc}" opacity=".5"/>`).join("");
  }
  const [mx, mh] = B.mirror;
  s += `<rect x="${mx - 13}" y="${-(mh + 8)}" width="14" height="9" rx="4" fill="${darken(color, 0.12)}"/>`;
  s += `<path d="${path(B.head.map((p) => [...p, 3]), true)}" fill="#FCF7E6" stroke="${dc}" stroke-opacity=".3"/>`;
  s += `<path d="${path(B.tail.map((p) => [...p, 3]), true)}" fill="#D7544D"/>`;
  if (B.ice && !o.simple) s += `<rect x="${L - 36}" y="${-(clr + 25)}" width="26" height="7" rx="3.5" fill="#1D2723" opacity=".45"/>`;
  const wheel = (x) => {
    const sp = [0, 72, 144, 216, 288].map((a) => `<rect x="${n1(-wr * 0.075)}" y="${n1(-wr * 0.6)}" width="${n1(wr * 0.15)}" height="${n1(wr * 0.6)}" rx="${n1(wr * 0.06)}" transform="rotate(${a})"/>`).join("");
    return `<g transform="translate(${x} ${-wr})"><circle r="${wr}" fill="#1B2420"/><circle r="${n1(wr * 0.84)}" fill="none" stroke="#2E3A35" stroke-width="${n1(wr * 0.08)}"/><circle r="${n1(wr * 0.62)}" fill="${rim}"/><circle r="${n1(wr * 0.53)}" fill="${darken(rim, 0.5)}"/><g fill="${rim}"${o.spin ? ` class="${o.spin}"` : ""}>${sp}</g><circle r="${n1(wr * 0.13)}" fill="${lighten(rim, 0.35)}"/></g>`;
  };
  s += w.map(wheel).join("");
  return { svg: s, L, top: B.top };
}

// ---------- Szenen für Inseratbilder (800 × 520) ----------
const W = 800, H = 520, GY = 440;

function scene(kind) {
  if (kind === "stadt") {
    const blds = [[-10, 118, 116, 1], [118, 88, 168, 0], [214, 122, 112, 1], [346, 68, 196, 2], [420, 130, 138, 1], [560, 96, 162, 0], [666, 150, 118, 1]];
    let s = `<rect width="${W}" height="${H}" fill="#EEF8F1"/><circle cx="672" cy="104" r="44" fill="#F6E7B4" opacity=".7"/>`;
    blds.forEach(([x, w, h, t], i) => {
      const y = 392 - h, c = ["#DCEFE3", "#D1E9D9", "#E3F3E8"][i % 3];
      if (t === 1) s += `<path d="M${x - 6} ${y + 2}L${x + w / 2} ${y - 38}L${x + w + 6} ${y + 2}Z" fill="#C6E5D1"/>`;
      if (t === 2) s += `<path d="M${x} ${y + 1}L${x + w / 2} ${y - 70}L${x + w} ${y + 1}Z" fill="#C6E5D1"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
      for (let wy = y + 22; wy < 372; wy += 30) for (let wx = x + 16; wx < x + w - 20; wx += 26) s += `<rect x="${wx}" y="${wy}" width="10" height="14" rx="2" fill="#F4FBF6"/>`;
    });
    s += `<rect y="392" width="${W}" height="${H - 392}" fill="#E3F3E9"/><rect y="392" width="${W}" height="5" fill="#D2EADB"/>`;
    s += `<circle cx="96" cy="372" r="30" fill="#BFE3CB"/><circle cx="126" cy="380" r="22" fill="#B2DDC1"/><rect x="104" y="384" width="5" height="14" fill="#9CC9AC"/>`;
    return s;
  }
  if (kind === "berge") {
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5FCF7"/><stop offset="1" stop-color="#E3F4EA"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sky)"/>`;
    s += `<path d="M0 318L96 238L150 280L246 176L326 262L402 208L474 258L566 158L652 250L724 214L800 256V400H0Z" fill="#D5EDDE"/>`;
    s += `<path d="M246 176L272 204L258 200L246 212L234 200L222 204ZM566 158L596 190L580 186L566 200L552 186L536 192ZM402 208L420 226L402 222L388 228Z" fill="#fff"/>`;
    s += `<path d="M0 352C130 322 230 346 330 336C460 322 570 348 800 326V400H0Z" fill="#C6E6D1"/>`;
    s += `<rect y="372" width="${W}" height="24" fill="#D3EEE6"/><path d="M40 384H220M300 380H520M600 386H760" stroke="#EAF8F3" stroke-width="3" stroke-linecap="round"/>`;
    s += `<rect y="396" width="${W}" height="${H - 396}" fill="#DFF1E5"/>`;
    return s;
  }
  return `<defs><radialGradient id="st" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4F5EA"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#st)"/><ellipse cx="400" cy="${GY + 4}" rx="360" ry="44" fill="#E9F7EE"/>`;
}

/** Inseratbild: Szene + Fahrzeug. crop = Detailausschnitt der Front. */
export function listingImage(type, o, kind, crop = false) {
  const c = car(type, { ...o, id: "v" });
  const s = Math.min(600 / c.L, 1.45);
  const x0 = (W - c.L * s) / 2;
  const body = `<g transform="translate(${n1(x0)} ${GY}) scale(${n1(s * 1000) / 1000})">${c.svg}</g>`;
  let vb = `0 0 ${W} ${H}`;
  if (crop) {
    const B = BODIES[type];
    const cw = 440, ch = 286;
    const cx = x0 + (B.w[1] - 30) * s, cy = GY - 100;
    const x = Math.max(0, Math.min(W - cw, cx - cw / 2)), y = Math.max(0, Math.min(H - ch, cy - ch / 2));
    vb = `${n1(x)} ${n1(y)} ${cw} ${ch}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}" role="img">${scene(kind)}${body}</svg>`;
}

/** Freigestelltes Fahrzeug (transparenter Hintergrund) für Illustrationen und Kategorien. */
export function cutout(type, o = {}) {
  const c = car(type, { ...o, id: o.id ?? "c" });
  const pad = 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-(c.top + pad)} ${c.L + pad * 2} ${c.top + pad + 12}" width="${c.L + pad * 2}" height="${c.top + pad + 12}">${c.svg}</svg>`;
}
