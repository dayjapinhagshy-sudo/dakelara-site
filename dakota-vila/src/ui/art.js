// Arte original gerada por código (SVG): retratos, vila isométrica e interior do restaurante.
import { CHARACTERS, STYLES, AREAS } from '../data/world.js';

export function shade(hex, f) { // f < 0 escurece, f > 0 clareia
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('');
}

// ---------- Retratos ----------
const INK = '#3a2430';
const eyeOpen = (x, r = 1) => `<ellipse cx="${x}" cy="47" rx="${3.3 * r}" ry="${4.3 * r}" fill="${INK}"/><circle cx="${x + 1.2}" cy="45.3" r="${1.3 * r}" fill="#fff"/>`;
const eyeArc = (x) => `<path d="M${x - 4} 48.5 q4 -5.5 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
const brow = (x, y1, y2) => `<path d="M${x - 4.5} ${y1} L${x + 4.5} ${y2}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>`;
const FACE = {
  feliz: () => eyeOpen(41) + eyeOpen(59) + `<path d="M43 57 Q50 66 57 57 Q50 60.5 43 57Z" fill="#b8324f"/>`,
  rindo: () => eyeArc(41) + eyeArc(59) + `<path d="M41.5 56 Q50 70 58.5 56Z" fill="#8f2440"/><path d="M45.5 62 Q50 66 54.5 62 Q50 60 45.5 62Z" fill="#ff8fa3"/>`,
  neutro: () => eyeOpen(41) + eyeOpen(59) + `<path d="M45 59 Q50 62 55 59" fill="none" stroke="#b8324f" stroke-width="2" stroke-linecap="round"/>`,
  triste: () => eyeOpen(41) + eyeOpen(59) + brow(41, 40.5, 38.5) + brow(59, 38.5, 40.5) + `<path d="M44.5 61.5 Q50 56.5 55.5 61.5" fill="none" stroke="#b8324f" stroke-width="2" stroke-linecap="round"/>`,
  surpreso: () => eyeOpen(41, 1.2) + eyeOpen(59, 1.2) + brow(41, 37, 36.5) + brow(59, 36.5, 37) + `<ellipse cx="50" cy="60.5" rx="3" ry="4" fill="#8f2440"/>`,
  bravo: () => eyeOpen(41) + eyeOpen(59) + brow(41, 38.5, 41.5) + brow(59, 41.5, 38.5) + `<path d="M44.5 61 Q50 58 55.5 61" fill="none" stroke="#8f2440" stroke-width="2.2" stroke-linecap="round"/>`,
};

const HAIR_BACK = {
  long: (c) => `<path d="M19 50 Q12 10 50 8 Q88 10 81 50 Q90 80 76 96 Q66 84 68 60 L32 60 Q34 84 24 96 Q10 80 19 50Z" fill="${c}"/><circle cx="56" cy="11" r="12" fill="${c}"/><circle cx="40" cy="12" r="9" fill="${shade(c, 0.12)}"/>`,
  bun: (c) => `<circle cx="50" cy="11" r="10" fill="${c}"/><path d="M24 48 Q20 16 50 15 Q80 16 76 48 Q78 58 72 62 L28 62 Q22 58 24 48Z" fill="${c}"/>`,
  curly: (c) => [[30, 28, 10], [40, 19, 11], [52, 16, 11], [63, 20, 10], [71, 29, 9], [26, 40, 8], [74, 40, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(''),
  short: (c) => `<path d="M25 46 Q20 14 50 13 Q80 14 75 46 L70 50 L30 50Z" fill="${c}"/>`,
  straight: (c) => `<path d="M22 46 Q18 12 50 11 Q82 12 78 46 L82 92 L66 92 L68 56 L32 56 L34 92 L18 92Z" fill="${c}"/>`,
  wavy: (c) => `<path d="M21 46 Q16 11 50 10 Q84 11 79 46 Q86 62 78 74 Q86 86 76 96 L64 90 Q70 70 68 56 L32 56 Q30 70 36 90 L24 96 Q14 86 22 74 Q14 62 21 46Z" fill="${c}"/>`,
};
const HAIR_FRONT = {
  long: (c) => `<path d="M27 44 Q26 18 50 18 Q74 18 73 44 Q68 28 52 27 Q44 38 27 44Z" fill="${c}"/><path d="M36 22 Q48 16 60 22" stroke="${shade(c, 0.3)}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  bun: (c) => `<path d="M27 42 Q28 19 50 19 Q72 19 73 42 Q66 27 50 27 Q34 27 27 42Z" fill="${c}"/>` + [[31, 33], [37, 27], [63, 27], [69, 33]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${shade(c, -0.06)}"/>`).join(''),
  curly: (c) => [[34, 29, 7], [44, 25, 7], [55, 25, 7], [65, 29, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(c, 0.08)}"/>`).join(''),
  short: (c) => `<path d="M27 42 Q27 18 50 18 Q73 18 73 42 Q70 29 56 27 Q40 25 30 36Z" fill="${c}"/><path d="M34 24 Q46 15 62 21" stroke="${shade(c, 0.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
  straight: (c) => `<path d="M27 46 Q26 18 50 18 Q74 18 73 46 Q70 28 50 24 Q30 28 27 46Z" fill="${c}"/><path d="M50 18 L50 25" stroke="${shade(c, 0.3)}" stroke-width="1.5"/>`,
  wavy: (c) => `<path d="M27 44 Q26 18 50 18 Q74 18 73 44 Q70 30 58 26 Q42 28 34 40Z" fill="${c}"/><path d="M38 22 Q50 16 64 24" stroke="${shade(c, 0.3)}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
};
const ACC = {
  glasses: () => `<g fill="rgba(255,255,255,.25)" stroke="#6b4a2a" stroke-width="1.6"><circle cx="41" cy="47" r="7"/><circle cx="59" cy="47" r="7"/><path d="M48 47h4" fill="none"/></g>`,
  headphones: () => `<path d="M26 46 Q24 12 50 12 Q76 12 74 46" fill="none" stroke="#f2b632" stroke-width="4" stroke-linecap="round"/><rect x="21" y="40" width="8" height="15" rx="4" fill="#f2b632"/><rect x="71" y="40" width="8" height="15" rx="4" fill="#f2b632"/>`,
  flower: () => `<g transform="translate(29 27)">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${5 * Math.cos((a * Math.PI) / 180)}" cy="${5 * Math.sin((a * Math.PI) / 180)}" r="4" fill="#ffe08a"/>`).join('')}<circle r="3" fill="#ff9d2e"/></g>`,
  earring: () => `<circle cx="27.5" cy="57" r="3.2" fill="none" stroke="#f2b632" stroke-width="1.6"/><circle cx="72.5" cy="57" r="3.2" fill="none" stroke="#f2b632" stroke-width="1.6"/>`,
  shades: () => `<g transform="rotate(-8 56 16)"><rect x="44" y="12" width="11" height="7" rx="3.5" fill="#4a2a44"/><rect x="58" y="12" width="11" height="7" rx="3.5" fill="#4a2a44"/><path d="M55 15h3" stroke="#4a2a44" stroke-width="1.5"/></g>`,
  beard: (L) => `<path d="M29 52 Q30 74 50 74 Q70 74 71 52 Q66 62 58 62 Q50 58 42 62 Q34 62 29 52Z" fill="${shade(L.hair, -0.1)}"/>`,
  stubble: () => `<path d="M31 56 Q34 71 50 72 Q66 71 69 56 Q64 66 50 67 Q36 66 31 56Z" fill="${INK}" opacity=".18"/>`,
};

function dog(expr) {
  const happy = expr === 'feliz' || expr === 'rindo';
  return `<ellipse cx="50" cy="96" rx="30" ry="18" fill="#d99a4e"/><path d="M38 86 Q50 100 62 86 L60 100 L40 100Z" fill="#fff6e6"/>
  <path d="M22 34 Q10 40 16 66 Q24 70 32 50Z" fill="#a8672c"/><path d="M78 34 Q90 40 84 66 Q76 70 68 50Z" fill="#a8672c"/>
  <ellipse cx="50" cy="50" rx="27" ry="28" fill="#e2a85c"/><path d="M50 24 Q60 40 58 56 Q64 74 50 78 Q36 74 42 56 Q40 40 50 24Z" fill="#fff6e6"/>
  ${happy ? eyeArc(39) + eyeArc(61) : eyeOpen(39) + eyeOpen(61)}${expr === 'bravo' ? brow(39, 38, 41.5) + brow(61, 41.5, 38) : ''}
  <ellipse cx="50" cy="60" rx="5.5" ry="4" fill="${INK}"/><path d="M50 64 V68 M42 68 Q50 74 58 68" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>
  ${happy ? '<path d="M46 70 Q50 82 54 70Z" fill="#ff7b93"/>' : ''}<path d="M30 80 Q50 90 70 80" fill="none" stroke="#e4576b" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="88" r="3.5" fill="#f2b632"/>`;
}
function mystery() {
  return `<path d="M12 100 Q14 70 34 62 Q22 30 50 12 Q78 30 66 62 Q86 70 88 100Z" fill="#2c2440"/><ellipse cx="50" cy="48" rx="17" ry="20" fill="#191428"/>
  <text x="50" y="57" text-anchor="middle" font-size="24" font-weight="800" fill="#b9a6ff">?</text><path d="M34 62 Q50 76 66 62" fill="none" stroke="#4a3d6b" stroke-width="3"/>`;
}

const BG = { dakota: '#ffd3e6', matilde: '#e6d5ff', juninho: '#d5f2cf', sol: '#ffe7b8', luna: '#ffd9ec', rafael: '#d7e9ff', vera: '#ffe0c9', teco: '#fff0cf', visitante: '#cfc6ea' };

/** Retrato SVG de um personagem com a expressão pedida. */
export function portrait(id, expr = 'neutro', player) {
  const L = { ...CHARACTERS[id].look };
  if (id === 'dakota' && player) { L.hair = player.hair; L.skin = player.skin; }
  let inner;
  if (L.dog) inner = dog(expr);
  else if (L.mystery) inner = mystery();
  else {
    const sk = L.skin, sk2 = shade(sk, -0.12);
    inner = `${HAIR_BACK[L.style](L.hair)}
    <path d="M14 100 Q16 78 38 73 L62 73 Q84 78 86 100Z" fill="${L.cloth}"/><path d="M38 73 Q50 84 62 73" fill="${shade(L.cloth, -0.12)}"/>
    <rect x="43" y="62" width="14" height="14" rx="5" fill="${sk2}"/>
    <ellipse cx="27.5" cy="49" rx="3.5" ry="5" fill="${sk2}"/><ellipse cx="72.5" cy="49" rx="3.5" ry="5" fill="${sk2}"/>
    <ellipse cx="50" cy="45" rx="22.5" ry="25" fill="${sk}"/>
    ${(L.acc || []).filter((a) => a === 'beard' || a === 'stubble').map((a) => ACC[a](L)).join('')}
    <ellipse cx="35" cy="55" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/><ellipse cx="65" cy="55" rx="5" ry="3" fill="#ff8fa3" opacity=".45"/>
    <path d="M49 50 q1.5 3 0 4.5" fill="none" stroke="${sk2}" stroke-width="1.6" stroke-linecap="round"/>
    ${(FACE[expr] || FACE.neutro)()}
    ${HAIR_FRONT[L.style](L.hair)}
    ${(L.acc || []).filter((a) => a !== 'beard' && a !== 'stubble').map((a) => ACC[a](L)).join('')}`;
  }
  return `<svg class="portrait" viewBox="0 0 100 100" role="img" aria-label="${CHARACTERS[id].name}"><rect width="100" height="100" fill="${BG[id] || '#eee'}"/><circle cx="50" cy="52" r="46" fill="#fff" opacity=".35"/>${inner}</svg>`;
}

// ---------- Vila isométrica ----------
const TW = 62, TH = 31, OX = 800, OY = 120; // espaçamento da grade do mapa
const BW = 44, BH = 22; // meia-largura/altura base das construções
export const VILLAGE_SIZE = [1600, 1000];
export const iso = (gx, gy) => [OX + (gx - gy) * TW, OY + (gx + gy) * TH];
const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
const poly = (arr, fill, extra = '') => `<polygon points="${pts(arr)}" fill="${fill}" ${extra}/>`;

const ABAND = { wall: '#bdb5ae', wall2: '#9d958f', roof: '#877e7a', trim: '#6f6662', accent: '#8f8782', floor: '#b5ada5', floor2: '#9a928b', furn: '#7d746e', cloth: '#aaa' };
const CLEAN = { wall: '#f5ecdb', wall2: '#dfd2ba', roof: '#c98d6c', trim: '#9c7556', accent: '#e2b273', floor: '#e6d9c0', floor2: '#d2c3a6', furn: '#b08d6a', cloth: '#fff' };
function palette(info) {
  if (!info.unlocked || info.status === 'abandonado') return { ...ABAND, aband: true };
  if (info.status === 'limpo') return CLEAN;
  return STYLES[info.choices.estilo] || CLEAN;
}
const decorOf = (info) => (info.status === 'decorado' && info.choices.decor ? STYLES[info.choices.decor] : null);

function weeds(cx, cy, n, spread) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = cx + Math.sin(i * 2.4 + cx) * spread, y = cy + Math.cos(i * 1.7 + cy) * spread * 0.4;
    o += `<path d="M${x} ${y} l-4 -9 M${x} ${y} l0 -12 M${x} ${y} l4 -8" stroke="#7d9a55" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  }
  return o;
}

function building(cx, cy, k, p, info, opts = {}) {
  const a = BW * k, b = BH * k, h = (opts.tall ? 84 : 48) * k, rh = 30 * k;
  const Lw = (u, v) => [cx - a + u * a, cy + u * b - v * h];
  const Rw = (u, v) => [cx + u * a, cy + b - u * b - v * h];
  const quad = (W, u0, u1, v0, v1) => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
  const apex = [cx, cy - h - rh], o = 6 * k;
  const dec = decorOf(info);
  let s = `<ellipse cx="${cx}" cy="${cy + b * 0.6}" rx="${a * 1.1}" ry="${b * 1.1}" fill="#000" opacity=".12"/>`;
  s += poly(quad(Lw, 0, 1, 0, 1), p.wall2) + poly(quad(Rw, 0, 1, 0, 1), p.wall);
  const rows = opts.tall ? [0.2, 0.6] : [0.42];
  for (const v of rows) {
    for (const [W, us] of [[Lw, [0.18, 0.6]], [Rw, opts.tall || v !== rows[0] ? [0.15, 0.6] : [0.58]]]) for (const u of us) {
      s += poly(quad(W, u, u + 0.24, v, v + (opts.tall ? 0.22 : 0.36)), p.aband ? '#6f6a72' : '#bfe9ff', `stroke="${p.trim}" stroke-width="2"`);
      if (p.aband) { const q = quad(W, u, u + 0.24, v, v + 0.3); s += `<path d="M${q[0]} L${q[2]} M${q[1]} L${q[3]}" stroke="#7a5a3a" stroke-width="3"/>`; }
      if (dec) { const q = quad(W, u - 0.02, u + 0.26, v - 0.07, v); s += poly(q, dec.trim) + [0.2, 0.5, 0.8].map((t) => `<circle cx="${q[3][0] + (q[2][0] - q[3][0]) * t}" cy="${q[3][1] + (q[2][1] - q[3][1]) * t - 2}" r="${3.2 * k}" fill="${dec.accent}"/>`).join(''); }
    }
  }
  s += poly(quad(Rw, 0.18, 0.44, 0, opts.tall ? 0.34 : 0.58), p.aband ? '#5e4a3a' : p.trim);
  if (!p.aband) s += `<circle cx="${Rw(0.4, 0.26)[0]}" cy="${Rw(0.4, opts.tall ? 0.16 : 0.26)[1]}" r="2" fill="#ffe08a"/>`;
  // telhado (duas águas visíveis com beiral)
  s += poly([[cx - a - o, cy - h + 2], [cx, cy + b - h + o], apex], shade(p.roof, -0.14)) + poly([[cx, cy + b - h + o], [cx + a + o, cy - h + 2], apex], p.roof);
  s += `<path d="M${cx} ${cy + b - h + o} L${apex}" stroke="${shade(p.roof, 0.25)}" stroke-width="2"/>`;
  if (p.aband) s += poly([[cx + a * 0.3, cy - h - rh * 0.3], [cx + a * 0.55, cy - h - rh * 0.25], [cx + a * 0.45, cy - h - rh * 0.05]], '#4d4644') + weeds(cx, cy + b + 6, 5, a * 0.8);
  if (dec) {
    const A = Rw(0.1, opts.tall ? 0.4 : 0.66), B = Rw(0.52, opts.tall ? 0.4 : 0.66);
    for (let i = 0; i < 4; i++) { const t0 = i / 4, t1 = (i + 1) / 4; const x0 = A[0] + (B[0] - A[0]) * t0, y0 = A[1] + (B[1] - A[1]) * t0, x1 = A[0] + (B[0] - A[0]) * t1, y1 = A[1] + (B[1] - A[1]) * t1; s += poly([[x0, y0], [x1, y1], [x1 + 8 * k, y1 + 12 * k], [x0 + 8 * k, y0 + 12 * k]], i % 2 ? '#fff' : dec.accent); }
    for (let i = 0; i <= 6; i++) { const t = i / 6; s += `<circle class="tw" cx="${cx - a + t * a}" cy="${cy - h + t * b + 6 + Math.sin(t * Math.PI) * 5}" r="${2.4 * k}" fill="${i % 2 ? '#ffe08a' : dec.accent}"/>`; }
    s += `<rect x="${cx - 22 * k}" y="${cy - h - rh * 0.62}" width="${44 * k}" height="${15 * k}" rx="${5 * k}" fill="#fff" stroke="${dec.trim}" stroke-width="2"/><text x="${cx}" y="${cy - h - rh * 0.62 + 11.5 * k}" text-anchor="middle" font-size="${11 * k}">${info.a.icon}</text>`;
  }
  return s;
}

function plaza(cx, cy, k, p, info) {
  const a = BW * k * 1.2, b = BH * k * 1.2, dec = decorOf(info);
  let s = poly([[cx, cy - b], [cx + a, cy], [cx, cy + b], [cx - a, cy]], p.floor, `stroke="${p.floor2}" stroke-width="3"`);
  s += poly([[cx, cy - b * 0.55], [cx + a * 0.55, cy], [cx, cy + b * 0.55], [cx - a * 0.55, cy]], p.floor2);
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${24 * k}" ry="${12 * k}" fill="${p.wall2}"/><ellipse cx="${cx}" cy="${cy - 5}" rx="${24 * k}" ry="${12 * k}" fill="${p.wall}"/><ellipse cx="${cx}" cy="${cy - 5}" rx="${19 * k}" ry="${9 * k}" fill="${p.aband ? '#8b8f86' : '#7fd6f2'}"/>`;
  s += `<rect x="${cx - 3}" y="${cy - 28 * k}" width="6" height="${24 * k}" fill="${p.wall2}"/><ellipse cx="${cx}" cy="${cy - 28 * k}" rx="${9 * k}" ry="${4.5 * k}" fill="${p.wall}"/>`;
  if (p.aband) s += weeds(cx, cy + 4, 7, a * 0.7) + `<path d="M${cx - 30} ${cy + 8} l14 6 l-6 8" stroke="#6f6662" stroke-width="2" fill="none"/>`;
  else s += `<path class="jet" d="M${cx} ${cy - 30 * k} q-10 -16 -15 4 M${cx} ${cy - 30 * k} q10 -16 15 4 M${cx} ${cy - 30 * k} v-13" stroke="#c9f2ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (info.status === 'reformado' || info.status === 'decorado') for (const [dx, dy] of [[-0.62, -0.28], [0.62, -0.28], [-0.62, 0.28], [0.62, 0.28]]) s += `<rect x="${cx + dx * a - 9}" y="${cy + dy * b * 2 - 4}" width="18" height="6" rx="2" fill="${p.furn}"/><rect x="${cx + dx * a - 9}" y="${cy + dy * b * 2 - 10}" width="18" height="4" rx="2" fill="${p.trim}"/>`;
  if (dec) for (const [dx, dy] of [[0, -0.8], [0.8, 0], [0, 0.8], [-0.8, 0]]) { const x = cx + dx * a, y = cy + dy * b; s += `<rect x="${x - 1.5}" y="${y - 30}" width="3" height="30" fill="${dec.trim}"/><circle class="tw" cx="${x}" cy="${y - 32}" r="5" fill="#ffe08a"/>` + [-8, 8].map((d) => `<circle cx="${x + d}" cy="${y + 2}" r="4" fill="${dec.accent}"/><circle cx="${x + d}" cy="${y - 1}" r="3" fill="#ff8fb8"/>`).join(''); }
  return s;
}

function tree(x, y, k = 1, dead = false) {
  return `<ellipse cx="${x}" cy="${y + 2}" rx="${12 * k}" ry="${5 * k}" fill="#000" opacity=".12"/><rect x="${x - 3 * k}" y="${y - 24 * k}" width="${6 * k}" height="${24 * k}" rx="2" fill="#8a5a33"/>` +
    (dead ? `<path d="M${x} ${y - 24 * k} l-10 -12 M${x} ${y - 24 * k} l9 -14 M${x} ${y - 18 * k} l12 -6" stroke="#8a5a33" stroke-width="3" stroke-linecap="round"/>`
      : `<circle cx="${x}" cy="${y - 34 * k}" r="${17 * k}" fill="#4fae5b"/><circle cx="${x - 9 * k}" cy="${y - 28 * k}" r="${11 * k}" fill="#3f9a4d"/><circle cx="${x + 8 * k}" cy="${y - 38 * k}" r="${10 * k}" fill="#6cc76b"/>`);
}
function palm(x, y, k = 1) {
  const top = y - 44 * k;
  return `<ellipse cx="${x}" cy="${y + 2}" rx="${10 * k}" ry="${4 * k}" fill="#000" opacity=".12"/><path d="M${x} ${y} q${6 * k} ${-22 * k} ${2 * k} ${-44 * k}" stroke="#a9773f" stroke-width="${5 * k}" fill="none" stroke-linecap="round"/>` +
    [[-22, 4], [-16, -12], [0, -18], [16, -12], [22, 4]].map(([dx, dy], i) => `<path d="M${x + 2 * k} ${top} q${dx * k * 0.5} ${dy * k - 6 * k} ${dx * k} ${dy * k + 6 * k}" stroke="${i % 2 ? '#3f9a4d' : '#5cbb5f'}" stroke-width="${6 * k}" fill="none" stroke-linecap="round"/>`).join('');
}

function houses(cx, cy, k, p, info) {
  const pals = info.status === 'reformado' || info.status === 'decorado' ? [p, { ...p, wall: shade(p.wall, 0.25), roof: p.trim }, { ...p, wall: p.accent, wall2: shade(p.accent, -0.15) }] : [p, p, p];
  return [[-34, -14, 0.55], [34, -10, 0.6], [0, 16, 0.62]].map(([dx, dy, kk], i) => building(cx + dx * k, cy + dy * k, kk * k, pals[i], info)).join('');
}

function beach(cx, cy, k, p, info) {
  const dec = decorOf(info), ok = info.status === 'reformado' || info.status === 'decorado';
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${86 * k}" ry="${40 * k}" fill="${p.aband ? '#cdc3ae' : '#ffe9b8'}"/><ellipse cx="${cx + 10}" cy="${cy + 8}" rx="${60 * k}" ry="${24 * k}" fill="${p.aband ? '#beb39c' : '#fff3d1'}"/>`;
  if (p.aband) s += `<path d="M${cx - 50} ${cy} l30 8 M${cx + 10} ${cy - 12} l26 -4 M${cx - 10} ${cy + 16} l22 6" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/><circle cx="${cx + 44}" cy="${cy + 10}" r="7" fill="#77706a"/><circle cx="${cx - 30}" cy="${cy - 12}" r="5" fill="#77706a"/>` + weeds(cx, cy, 4, 50);
  if (ok) for (const [dx, dy, c] of [[-44, -4, p.roof], [0, 12, p.accent], [44, -6, p.trim]]) {
    const x = cx + dx * k, y = cy + dy * k;
    s += `<rect x="${x - 16}" y="${y + 4}" width="26" height="6" rx="3" fill="${p.cloth}" stroke="${p.trim}" stroke-width="1.5"/><rect x="${x - 1.5}" y="${y - 30}" width="3" height="36" fill="#8a5a33"/><path d="M${x - 24} ${y - 22} Q${x} ${y - 50} ${x + 24} ${y - 22}Z" fill="${c}"/><path d="M${x - 8} ${y - 22} Q${x} ${y - 48} ${x + 8} ${y - 22}Z" fill="#fff" opacity=".7"/>`;
  }
  if (dec) s += `<rect x="${cx - 70 * k}" y="${cy - 34}" width="3" height="30" fill="${dec.trim}"/><rect x="${cx - 26 * k}" y="${cy - 40}" width="3" height="30" fill="${dec.trim}"/><path d="M${cx - 70 * k} ${cy - 30} L${cx - 26 * k} ${cy - 36} L${cx - 26 * k} ${cy - 24} L${cx - 70 * k} ${cy - 18}Z" fill="#fff" opacity=".6" stroke="${dec.trim}"/><circle cx="${cx - 40 * k}" cy="${cy + 4}" r="6" fill="#fff" stroke="${dec.accent}" stroke-width="3"/>` +
    [0, 1, 2, 3, 4].map((i) => `<path class="tw" d="M${cx + 20 + i * 14} ${cy - 44 + (i % 2) * 3} l6 0 l-3 9Z" fill="${i % 2 ? dec.accent : dec.roof}"/>`).join('');
  return s;
}

function pier(cx, cy, k, p, info) {
  const dec = decorOf(info), n = 7;
  let s = '';
  for (let i = 0; i < n; i++) {
    if (p.aband && (i === 2 || i === 5)) continue;
    const [x, y] = [cx + i * 20 * k, cy + i * 10 * k];
    s += `<rect x="${x + 2}" y="${y + 6}" width="4" height="20" fill="#6b4a2a"/>` + poly([[x, y - 8], [x + 20 * k, y + 2], [x - 2, y + 16], [x - 22 * k, y + 6]], p.aband ? (i % 2 ? '#948a80' : '#a39a90') : i % 2 ? p.floor : p.floor2, `stroke="${p.trim}" stroke-width="1"`);
  }
  if (info.status === 'reformado' || info.status === 'decorado') {
    for (const i of [0, 3, 6]) { const [x, y] = [cx + i * 20 * k + 14, cy + i * 10 * k - 2]; s += `<rect x="${x}" y="${y - 22}" width="3" height="22" fill="${p.trim}"/><circle class="tw" cx="${x + 1.5}" cy="${y - 24}" r="4" fill="#ffe08a"/>`; }
    const [bx, by] = [cx + 60 * k, cy + 70 * k];
    s += `<path d="M${bx - 30} ${by} Q${bx} ${by + 18} ${bx + 34} ${by - 4} L${bx + 26} ${by - 10} L${bx - 26} ${by - 6}Z" fill="${p.wall}" stroke="${p.trim}" stroke-width="2"/><rect x="${bx - 2}" y="${by - 44}" width="3" height="38" fill="#8a5a33"/><path d="M${bx + 2} ${by - 44} L${bx + 24} ${by - 12} L${bx + 2} ${by - 12}Z" fill="${p.accent}"/>`;
  }
  if (dec) s += [0, 1, 2, 3, 4, 5].map((i) => `<path class="tw" d="M${cx + 16 + i * 19 * k} ${cy - 26 + i * 9.5 * k} l7 2 l-5 8Z" fill="${i % 2 ? dec.accent : dec.roof}"/>`).join('') + `<text x="${cx - 12}" y="${cy - 6}" font-size="18">⚓</text>`;
  return s;
}

function park(cx, cy, k, p, info) {
  const dec = decorOf(info), ok = info.status === 'reformado' || info.status === 'decorado';
  const a = BW * k * 1.2, b = BH * k * 1.2;
  let s = poly([[cx, cy - b], [cx + a, cy], [cx, cy + b], [cx - a, cy]], p.aband ? '#a9ad8f' : '#9be08f', 'stroke="rgba(0,0,0,.08)" stroke-width="3"');
  s += tree(cx - a * 0.6, cy - 2, 0.8 * k, p.aband) + tree(cx + a * 0.55, cy - 6, 0.9 * k, p.aband) + tree(cx - 6, cy - b * 0.6, 0.7 * k, p.aband);
  if (p.aband) s += weeds(cx, cy + 6, 6, a * 0.6);
  if (ok) s += `<path d="M${cx - 16} ${cy + 16} l8 -30 l8 30 M${cx + 6} ${cy + 16} l8 -30 l8 30 M${cx - 8} ${cy - 14} h22" stroke="${p.trim}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx + 2} ${cy - 14} v18 M${cx + 10} ${cy - 14} v18" stroke="#888" stroke-width="1"/><rect x="${cx - 1}" y="${cy + 3}" width="14" height="4" rx="2" fill="${p.accent}"/>`;
  if (dec) { const x = cx + 4, y = cy + b * 0.3; s += `<ellipse cx="${x - 40}" cy="${y + 12}" rx="20" ry="8" fill="${dec.wall2}"/><path d="M${x - 62} ${y - 12} L${x - 40} ${y - 34} L${x - 18} ${y - 12}Z" fill="${dec.roof}"/><path d="M${x - 48} ${y - 12} L${x - 40} ${y - 34} L${x - 32} ${y - 12}Z" fill="#fff" opacity=".7"/><path d="M${x - 58} ${y - 12} v22 M${x - 22} ${y - 12} v22 M${x - 40} ${y - 12} v24" stroke="${dec.accent}" stroke-width="2.5"/>`; }
  return s;
}

const DRAW = { building, plaza, houses, beach, pier, park };
function drawArea(a, info, cx, cy, k = 1) {
  return DRAW[a.type](cx, cy, a.size * k, palette(info), info, { tall: a.tall });
}

/** Mapa da vila. infoOf(id) devolve o resultado de areaInfo. */
export function villageSvg(infoOf, lvl) {
  const [W, H] = VILLAGE_SIZE;
  const c = [iso(-0.6, -0.6), iso(12.2, -0.6), iso(12.2, 12.2), iso(-0.6, 12.2)];
  const g = [iso(0, 0), iso(11.6, 0), iso(11.6, 7.2), iso(7.2, 11.6), iso(0, 11.6)];
  let s = `<svg class="village" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0f5"/><stop offset="1" stop-color="#3fb0e0"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sea)"/>`;
  for (let i = 0; i < 14; i++) s += `<path class="wave" style="animation-delay:${-i * 0.4}s" d="M${(i * 197) % W} ${40 + ((i * 131) % (H - 80))} q12 -8 24 0 t24 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>`;
  s += poly(c.map(([x, y]) => [x, y + 10]), '#e9d49a') + poly(c, '#ffe9b8') + poly(g, '#a8e68f') + poly(g.map(([x, y]) => [x, y]), 'none', 'stroke="#8fd47a" stroke-width="6" stroke-linejoin="round"');
  // caminhos
  const path = (p) => `<polyline points="${pts(p.map(([x, y]) => iso(x, y)))}" fill="none" stroke="#f3dfb5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts(p.map(([x, y]) => iso(x, y)))}" fill="none" stroke="#e6cd98" stroke-width="16" stroke-linecap="round" stroke-dasharray="1 22" opacity=".7"/>`;
  s += path([[0.8, 3.6], [10.4, 3.6]]) + path([[3.6, 0.8], [3.6, 10]]) + path([[0.8, 6.7], [11, 6.7]]) + path([[6.7, 0.8], [6.7, 10.2]]) + path([[6.7, 6.7], [9.2, 9.2]]);
  // farol
  const [fx, fy] = iso(0.6, 10.6);
  const things = [], labels = [];
  things.push([11.2, `<g><ellipse cx="${fx}" cy="${fy + 4}" rx="20" ry="8" fill="#000" opacity=".12"/><path d="M${fx - 13} ${fy} L${fx - 8} ${fy - 62} h16 L${fx + 13} ${fy}Z" fill="#fff"/><path d="M${fx - 11.4} ${fy - 20} h22.8 l-1 -12 h-20.8Z M${fx - 9} ${fy - 48} h18 l-.6 -8 h-16.8Z" fill="#e4576b"/><rect x="${fx - 10}" y="${fy - 74}" width="20" height="12" rx="2" fill="${lvl >= 6 ? '#ffe08a' : '#8fa0b0'}" stroke="#4a5b78" stroke-width="2"/><path d="M${fx - 12} ${fy - 74} L${fx} ${fy - 86} L${fx + 12} ${fy - 74}Z" fill="#4a5b78"/></g>`]);
  for (const [x, y, t] of [[0.6, 0.8, 't'], [1, 4.6, 't'], [10.6, 1, 'p'], [4.4, 0.6, 't'], [0.7, 7.6, 'p'], [7.6, 0.7, 't'], [10.8, 4.4, 'p'], [4.6, 10.6, 'p'], [6.9, 10.9, 'p'], [10.9, 7.6, 'p'], [3.6, 6.9, 't'], [9.9, 3.2, 't'], [7.2, 3.9, 't'], [3.9, 4.4, 't']]) {
    const [px, py] = iso(x, y);
    things.push([x + y, t === 't' ? tree(px, py, 0.8) : palm(px, py, 0.9)]);
  }
  for (const a of AREAS) {
    const info = infoOf(a.id), [cx, cy] = iso(a.pos[0], a.pos[1]);
    const locked = !info.unlocked;
    const badge = locked ? `🔒 Nível ${a.lvl}` : info.next ? `⭐ ${info.next.stars}` : '✓';
    const lw = Math.max(110, a.name.length * 7.4 + 26), ly = cy + 32 * a.size + 10;
    const act = `data-act="area" data-id="${a.id}"`;
    things.push([a.pos[0] + a.pos[1], `<g class="area ${locked ? 'locked' : ''} ${info.status}" ${act} tabindex="0" role="button" aria-label="${a.name}"><g class="area-art">${drawArea(a, info, cx, cy, 1.15)}</g></g>`]);
    labels.push(`<g class="area-label" ${act}><rect x="${cx - lw / 2}" y="${ly}" width="${lw}" height="36" rx="13" fill="#fff" opacity=".95" stroke="${locked ? '#d9d2e4' : '#e9c8ff'}" stroke-width="2"/><text x="${cx}" y="${ly + 15}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#6b3fa0">${a.name}</text>
      <text x="${cx}" y="${ly + 30}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${locked ? '#9a8fb0' : info.next ? '#e08a00' : '#2fa35a'}">${badge}${!locked && info.next ? ' · ' + info.next.name : !locked ? ' Completo' : ''}</text>
      ${!locked && info.next ? `<g class="hammer"><circle cx="${cx}" cy="${cy - 94 * a.size}" r="16" fill="#ff5fa2" stroke="#fff" stroke-width="3"/><text x="${cx}" y="${cy - 94 * a.size + 6}" text-anchor="middle" font-size="17">🔨</text></g>` : ''}</g>`);
  }
  things.sort((x, y) => x[0] - y[0]);
  s += things.map((t) => t[1]).join('') + labels.join('') + '</svg>';
  return s;
}

/** Visão ampliada de uma área (exterior). */
export function areaZoom(a, info) {
  return `<svg class="zoom" viewBox="0 0 360 250"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#fff3d6"/></linearGradient></defs><rect width="360" height="250" fill="url(#sky)"/>
  <ellipse cx="180" cy="215" rx="200" ry="60" fill="${a.type === 'pier' ? '#5cc3ea' : a.type === 'beach' ? '#ffe9b8' : '#a8e68f'}"/><circle cx="300" cy="46" r="22" fill="#fff6c9"/>
  ${a.type === 'pier' ? `<g transform="translate(-10 0)">${drawArea(a, info, 110, 120, 1.7)}</g>` : drawArea(a, info, 180, a.type === 'building' ? 178 : 170, a.type === 'building' ? (a.tall ? 1.35 : 1.7) : 1.5)}</svg>`;
}

/** Interior do restaurante: cada escolha (piso, parede, móveis, decoração) muda o cenário de verdade. */
export function interiorSvg(info) {
  const { step, choices } = info;
  const ab = step === 0;
  const wall = choices.parede ? STYLES[choices.parede] : null, floor = choices.piso ? STYLES[choices.piso] : null;
  const furn = choices.moveis ? STYLES[choices.moveis] : null, dec = choices.decor ? STYLES[choices.decor] : null;
  const wc = wall ? wall.wall : ab ? '#a59d98' : '#e9e1d3', wc2 = wall ? wall.wall2 : ab ? '#8d8580' : '#d6cbb8';
  let s = `<svg class="zoom" viewBox="0 0 360 250"><rect width="360" height="150" fill="${wc}"/><rect y="104" width="360" height="46" fill="${wc2}"/><rect y="100" width="360" height="5" fill="${wall ? wall.trim : '#7d746e'}"/>`;
  if (wall && choices.parede === 'tropical') for (let i = 0; i < 9; i++) s += `<path d="M${20 + i * 42} 30 q10 -14 20 0 q-10 6 -20 0Z" fill="${wall.trim}" opacity=".35"/><path d="M${40 + i * 42} 70 q10 -14 20 0 q-10 6 -20 0Z" fill="${wall.accent}" opacity=".35"/>`;
  if (wall && choices.parede === 'rustico') for (let i = 0; i < 12; i++) s += `<rect x="${i * 30}" y="105" width="28" height="45" fill="${i % 2 ? wall.trim : shade(wall.trim, 0.15)}" opacity=".55"/>`;
  if (wall && choices.parede === 'moderno') s += `<rect x="0" y="0" width="120" height="100" fill="${wall.accent}" opacity=".18"/><rect x="240" y="0" width="120" height="100" fill="${wall.trim}" opacity=".12"/>`;
  // janela com vista para o mar
  s += `<rect x="130" y="22" width="100" height="62" rx="8" fill="${ab ? '#6f6a72' : '#8fdcf5'}" stroke="${wall ? wall.trim : '#7d746e'}" stroke-width="5"/>`;
  if (!ab) s += `<rect x="134" y="58" width="92" height="22" fill="#3fb0e0"/><circle cx="205" cy="42" r="9" fill="#fff6c9"/><path d="M180 22 v62 M130 53 h100" stroke="${wall ? wall.trim : '#7d746e'}" stroke-width="3"/>`;
  else s += `<path d="M132 24 L228 82 M228 24 L132 82" stroke="#7a5a3a" stroke-width="7"/><path d="M0 0 L46 0 L0 40Z M360 0 L314 0 L360 40Z" fill="#d9d4d0" opacity=".5"/><path d="M0 0 q30 10 46 0 M0 12 q20 6 30 -12 M0 26 q10 0 14 -26" stroke="#eee" fill="none" opacity=".7"/>`;
  // piso
  const fc = floor ? floor.floor : ab ? '#8f8780' : '#cfc4b2', fc2 = floor ? floor.floor2 : ab ? '#7d756e' : '#bdb19c';
  s += `<rect y="150" width="360" height="100" fill="${fc}"/>`;
  if (!floor || choices.piso === 'rustico') for (let i = 0; i < 6; i++) s += `<path d="M0 ${150 + i * 18} H360" stroke="${fc2}" stroke-width="2"/>` + [0, 1, 2, 3].map((j) => `<path d="M${(i % 2) * 45 + j * 95} ${150 + i * 18} v18" stroke="${fc2}" stroke-width="2"/>`).join('');
  else if (choices.piso === 'tropical') for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) { if ((r + c) % 2) s += `<rect x="${c * 36}" y="${150 + r * 20}" width="36" height="20" fill="${fc2}"/>`; }
  else for (let c = 0; c <= 6; c++) s += `<path d="M${c * 60} 150 L${c * 60 - 30 + c * 10} 250" stroke="${fc2}" stroke-width="2"/>` + (c < 3 ? `<path d="M0 ${175 + c * 28} H360" stroke="${fc2}" stroke-width="2"/>` : '');
  // balcão
  const bc = furn ? furn.furn : ab ? '#756c66' : '#a89277';
  s += `<rect x="250" y="112" width="100" height="52" rx="6" fill="${bc}"/><rect x="246" y="106" width="108" height="10" rx="5" fill="${furn ? furn.cloth : shade(bc, 0.3)}"/>`;
  if (ab) s += `<path d="M30 236 l20 -30 l26 12 l18 -22 l22 40Z" fill="#6f6662"/><path d="M200 240 l14 -20 l24 6 l10 14Z" fill="#7d746e"/><path d="M60 200 l40 -8 M210 190 l30 12" stroke="#7a5a3a" stroke-width="6" stroke-linecap="round"/>` + weeds(120, 244, 4, 60);
  if (furn) for (const [x, y, k] of [[70, 196, 1], [180, 214, 1.12], [118, 168, 0.85]]) {
    const round = choices.moveis !== 'moderno';
    for (const dx of [-30, 30]) s += `<rect x="${x + dx * k - 7 * k}" y="${y - 20 * k}" width="${14 * k}" height="${22 * k}" rx="${choices.moveis === 'tropical' ? 7 * k : 3}" fill="${shade(furn.furn, -0.1)}"/><rect x="${x + dx * k - 8 * k}" y="${y - 2 * k}" width="${16 * k}" height="${6 * k}" rx="3" fill="${furn.furn}"/><path d="M${x + dx * k - 6 * k} ${y + 4 * k} v${12 * k} M${x + dx * k + 6 * k} ${y + 4 * k} v${12 * k}" stroke="${shade(furn.furn, -0.25)}" stroke-width="${2.5 * k}"/>`;
    s += `<rect x="${x - 2.5 * k}" y="${y - 4 * k}" width="${5 * k}" height="${22 * k}" fill="${shade(furn.furn, -0.25)}"/>` + (round ? `<ellipse cx="${x}" cy="${y - 6 * k}" rx="${22 * k}" ry="${8 * k}" fill="${furn.cloth}" stroke="${furn.furn}" stroke-width="${2.5 * k}"/>` : `<rect x="${x - 22 * k}" y="${y - 12 * k}" width="${44 * k}" height="${10 * k}" rx="2" fill="${furn.cloth}" stroke="${furn.furn}" stroke-width="${2.5 * k}"/>`);
    s += `<circle cx="${x}" cy="${y - 10 * k}" r="${3.5 * k}" fill="${furn.accent}"/>`;
  }
  if (dec) {
    for (const x of [60, 180, 300]) s += choices.decor === 'moderno' ? `<path d="M${x} 0 v26" stroke="#555" stroke-width="2"/><path d="M${x - 12} 40 L${x} 26 L${x + 12} 40Z" fill="${dec.trim}"/><circle class="tw" cx="${x}" cy="42" r="4" fill="#ffe08a"/>` : choices.decor === 'rustico' ? `<path d="M${x} 0 v22" stroke="#7a4a2a" stroke-width="2"/><rect x="${x - 8}" y="22" width="16" height="20" rx="4" fill="${dec.accent}" stroke="${dec.trim}" stroke-width="2"/><circle class="tw" cx="${x}" cy="32" r="4" fill="#ffe08a"/>` : '';
    if (choices.decor === 'tropical') { s += `<path d="M0 10 Q90 34 180 10 T360 10" fill="none" stroke="#7a4a2a" stroke-width="1.5"/>`; for (let i = 0; i < 13; i++) s += `<circle class="tw" cx="${14 + i * 28}" cy="${17 + Math.sin((i / 6.4) * Math.PI) ** 2 * 6}" r="4" fill="${['#ffcc33', '#ff7f9f', '#2fb5a5'][i % 3]}"/>`; }
    for (const x of [22, 236]) s += `<rect x="${x - 10}" y="130" width="20" height="22" rx="4" fill="${dec.trim}"/>` + (choices.decor === 'moderno' ? `<path d="M${x} 130 v-34 M${x} 110 l-9 -10 M${x} 118 l9 -12" stroke="#4fae5b" stroke-width="3" stroke-linecap="round"/>` : `<circle cx="${x}" cy="116" r="15" fill="#4fae5b"/><circle cx="${x - 8}" cy="122" r="9" fill="#3f9a4d"/>${choices.decor === 'tropical' ? `<circle cx="${x + 5}" cy="110" r="4" fill="#ff7f9f"/><circle cx="${x - 7}" cy="114" r="3.5" fill="#ffcc33"/>` : ''}`);
    for (const x of [52, 88]) s += `<rect x="${x}" y="34" width="28" height="34" rx="3" fill="#fff" stroke="${dec.trim}" stroke-width="3"/><circle cx="${x + 14}" cy="${x === 52 ? 48 : 54}" r="7" fill="${x === 52 ? dec.accent : dec.roof}"/>`;
  }
  return s + '</svg>';
}

/** Cenário de fundo para os diálogos. */
export function sceneBg(kind) {
  if (kind === 'interior') return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><rect width="360" height="640" fill="#ffe3ef"/><rect y="0" width="360" height="330" fill="#ffd0e2"/><rect x="40" y="70" width="120" height="150" rx="14" fill="#9fe3f7" stroke="#fff" stroke-width="10"/><rect x="200" y="70" width="120" height="150" rx="14" fill="#9fe3f7" stroke="#fff" stroke-width="10"/><rect x="45" y="170" width="110" height="45" fill="#4fb8e6"/><rect x="205" y="170" width="110" height="45" fill="#4fb8e6"/><rect y="330" width="360" height="310" fill="#e9b98a"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M0 ${330 + i * 46} H360" stroke="#d49f6c" stroke-width="3"/>`).join('')}<path d="M0 20 Q90 60 180 20 T360 20" fill="none" stroke="#b67a4a" stroke-width="2"/>${[...Array(12)].map((_, i) => `<circle cx="${15 + i * 30}" cy="${32 + Math.sin((i / 6) * Math.PI) ** 2 * 10}" r="6" fill="${['#ffcc33', '#ff7f9f', '#7fd6f2'][i % 3]}"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc1dc"/><stop offset=".5" stop-color="#ffe2b8"/><stop offset="1" stop-color="#9fe3f7"/></linearGradient></defs><rect width="360" height="640" fill="url(#dsky)"/><circle cx="270" cy="150" r="46" fill="#fff6c9"/><rect y="330" width="360" height="310" fill="#5cc3ea"/><path d="M0 360 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M-20 420 Q120 340 380 410 V640 H-20Z" fill="#ffe9b8"/><path d="M-20 470 Q140 400 380 470 V640 H-20Z" fill="#a8e68f"/>${palm(50, 470, 2)}${palm(320, 450, 1.5)}<g transform="translate(250 330)"><path d="M-10 0 L-6 -50 h12 L10 0Z" fill="#fff"/><rect x="-8" y="-60" width="16" height="10" fill="#ffe08a"/><path d="M-10 -60 L0 -70 L10 -60Z" fill="#4a5b78"/></g></svg>`;
}

/** Arte da tela de título. */
export function titleArt(player) {
  return `<div class="title-bg">${sceneBg('vila')}</div><div class="title-hero">${portrait('dakota', 'feliz', player)}</div>`;
}
