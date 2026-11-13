// Arte original gerada por código (SVG): retratos, vila isométrica e interior do restaurante.
import { CHARACTERS, STYLES, AREAS } from '../data/world.js';

import { shade, portrait } from './portraits.js';
import { areaArt, menuArt, interiorArt } from './assets.js';
export { shade };

export { portrait };

// ---------- Vila isométrica ----------
const TW = 62, TH = 31, OX = 800, OY = 120; // espaçamento da grade do mapa
const BW = 44, BH = 22; // meia-largura/altura base das construções
export const VILLAGE_SIZE = [1600, 1000];
export const iso = (gx, gy) => [OX + (gx - gy) * TW, OY + (gx + gy) * TH];
const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
const poly = (arr, fill, extra = '') => `<polygon points="${pts(arr)}" fill="${fill}" ${extra}/>`;

// Construções abandonadas ficam desbotadas e com madeira à mostra, mas a paisagem em volta é sempre viva.
const ABAND = { wall: '#d8cbb8', wall2: '#b9aa95', roof: '#9a7d6c', trim: '#7d6655', accent: '#a8957f', floor: '#c9bba7', floor2: '#b3a48f', furn: '#8a7563', cloth: '#cfc3b3' };
const CLEAN = { wall: '#fbefd9', wall2: '#ead6b5', roof: '#e0674a', trim: '#a86a45', accent: '#f2b632', floor: '#f3e3cf', floor2: '#e4ccb0', furn: '#b08d6a', cloth: '#fff' };
function palette(info) {
  if (!info.unlocked || info.status === 'abandonado') return { ...ABAND, aband: true };
  if (info.status === 'limpo') return CLEAN;
  return STYLES[info.choices.estilo] || CLEAN;
}
const decorOf = (info) => (info.status === 'decorado' && info.choices.decor ? STYLES[info.choices.decor] : null);
const lerp = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];

/** Gradientes compartilhados por mapa, visão ampliada e cenários. */
export const VDEFS = `<defs>
  <linearGradient id="v-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd8f0"/><stop offset=".55" stop-color="#2fb8e0"/><stop offset="1" stop-color="#1d8fcf"/></linearGradient>
  <radialGradient id="v-grass" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#b9ee8c"/><stop offset=".7" stop-color="#97dc72"/><stop offset="1" stop-color="#7cc95e"/></radialGradient>
  <linearGradient id="v-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c9"/><stop offset="1" stop-color="#f7d996"/></linearGradient>
  <linearGradient id="v-wallL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#4a2a10" stop-opacity=".18"/></linearGradient>
  <linearGradient id="v-wallR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="v-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
  <linearGradient id="v-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4f8ff"/><stop offset=".5" stop-color="#9fdcf5"/><stop offset="1" stop-color="#5fb8e0"/></linearGradient>
  <radialGradient id="v-pink" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#ffe3f0"/><stop offset=".5" stop-color="#ffa6cf"/><stop offset="1" stop-color="#e86aa8"/></radialGradient>
  <radialGradient id="v-leaf" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#a8ec86"/><stop offset=".55" stop-color="#5cc062"/><stop offset="1" stop-color="#2f8a45"/></radialGradient>
  <linearGradient id="v-palm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ad66a"/><stop offset="1" stop-color="#2f8a45"/></linearGradient>
  <linearGradient id="v-trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c08a52"/><stop offset="1" stop-color="#8a5a33"/></linearGradient>
  <radialGradient id="v-shadow"><stop offset="0" stop-color="#2a4a10" stop-opacity=".32"/><stop offset="1" stop-color="#2a4a10" stop-opacity="0"/></radialGradient>
  <radialGradient id="v-water" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#d4f6ff"/><stop offset="1" stop-color="#4fc3ea"/></radialGradient>
</defs>`;

const shadowE = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#v-shadow)"/>`;
function weeds(cx, cy, n, spread) {
  let o = '';
  for (let i = 0; i < n; i++) {
    const x = cx + Math.sin(i * 2.4 + cx) * spread, y = cy + Math.cos(i * 1.7 + cy) * spread * 0.4;
    o += `<path d="M${x} ${y} l-4 -9 M${x} ${y} l0 -12 M${x} ${y} l4 -8" stroke="#7d9a55" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  }
  return o;
}
function flowers(x, y, n = 5, spread = 10, colors = ['#ff8fc4', '#fff', '#ffe08a']) {
  let o = `<ellipse cx="${x}" cy="${y}" rx="${spread * 1.1}" ry="${spread * 0.5}" fill="#5cb85a"/>`;
  for (let i = 0; i < n; i++) { const fx = x + Math.sin(i * 2.1 + x) * spread * 0.85, fy = y + Math.cos(i * 1.3 + y) * spread * 0.32 - 2; o += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="2.6" fill="${colors[i % colors.length]}"/><circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="1" fill="#ffb020"/>`; }
  return o;
}

function building(cx, cy, k, p, info, opts = {}) {
  const a = BW * k, b = BH * k, h = (opts.tall ? 86 : 52) * k, rh = 34 * k;
  const Lw = (u, v) => [cx - a + u * a, cy + u * b - v * h];
  const Rw = (u, v) => [cx + u * a, cy + b - u * b - v * h];
  const quad = (W, u0, u1, v0, v1) => [W(u0, v0), W(u1, v0), W(u1, v1), W(u0, v1)];
  const apex = [cx, cy - h - rh], o = 7 * k;
  const dec = decorOf(info), nice = !p.aband && (info.status === 'reformado' || info.status === 'decorado');
  let s = shadowE(cx + 6 * k, cy + b * 0.75, a * 1.45, b * 1.25);
  // paredes com base de pedra e luz suave
  s += poly(quad(Lw, 0, 1, 0, 1), p.wall2) + poly(quad(Lw, 0, 1, 0, 1), 'url(#v-wallL)') + poly(quad(Rw, 0, 1, 0, 1), p.wall) + poly(quad(Rw, 0, 1, 0, 1), 'url(#v-wallR)');
  s += poly(quad(Lw, 0, 1, 0, 0.1), shade(p.wall2, -0.22)) + poly(quad(Rw, 0, 1, 0, 0.1), shade(p.wall, -0.18));
  s += `<path d="M${cx} ${cy + b} V${cy + b - h}" stroke="${shade(p.wall, 0.35)}" stroke-width="${1.6 * k}"/>`;
  if (p.aband) for (const W of [Lw, Rw]) s += `<path d="M${W(0.1, 0.6)} L${W(0.3, 0.7)} M${W(0.7, 0.3)} L${W(0.85, 0.4)}" stroke="${shade(p.wall, -0.25)}" stroke-width="${1.2 * k}" fill="none"/>`;
  // janelas com venezianas e floreiras
  const rows = opts.tall ? [0.2, 0.58] : [0.38];
  const wh = opts.tall ? 0.24 : 0.34;
  for (const v of rows) {
    for (const [W, us] of [[Lw, [0.18, 0.6]], [Rw, opts.tall || v !== rows[0] ? [0.12, 0.62] : [0.62]]]) for (const u of us) {
      const ww = 0.2;
      s += poly(quad(W, u, u + ww, v, v + wh), p.aband ? '#6f6258' : 'url(#v-glass)', `stroke="${shade(p.wall, -0.3)}" stroke-width="${1.6 * k}"`);
      if (p.aband) { const q = quad(W, u - 0.02, u + ww + 0.02, v + wh * 0.3, v + wh * 0.5); s += poly(q, '#a0774c', `stroke="#6b4a2a" stroke-width="1"`) + poly(quad(W, u - 0.02, u + ww + 0.02, v + wh * 0.65, v + wh * 0.82), '#a0774c', `stroke="#6b4a2a" stroke-width="1"`); continue; }
      s += `<path d="M${W(u + ww / 2, v)} L${W(u + ww / 2, v + wh)} M${W(u, v + wh * 0.55)} L${W(u + ww, v + wh * 0.55)}" stroke="#fff" stroke-width="${1.2 * k}"/>`;
      s += poly(quad(W, u - 0.07, u - 0.005, v, v + wh), p.trim) + poly(quad(W, u + ww + 0.005, u + ww + 0.07, v, v + wh), p.trim);
      s += poly(quad(W, u, u + ww * 0.45, v + wh * 0.62, v + wh * 0.96), '#fff', 'opacity=".35"');
      if (nice) { const q = quad(W, u - 0.03, u + ww + 0.03, v - 0.07, v - 0.005); s += poly(q, shade(p.trim, -0.1)) + [0.15, 0.4, 0.65, 0.9].map((tt, i) => { const [fx, fy] = lerp(q[3], q[2], tt); return `<circle cx="${fx.toFixed(1)}" cy="${(fy - 2.2 * k).toFixed(1)}" r="${2.6 * k}" fill="${['#ff6f9f', '#fff', '#ffcc33', '#ff9fc8'][i]}"/>`; }).join(''); }
    }
  }
  // porta em arco com degrau
  const dh = opts.tall ? 0.32 : 0.56;
  s += poly(quad(Rw, 0.2, 0.46, 0, dh), p.aband ? '#5e4a3a' : shade(p.trim, -0.1)) + poly(quad(Rw, 0.23, 0.43, 0.02, dh - 0.04), p.aband ? '#6b5444' : p.trim);
  if (p.aband) s += `<path d="M${Rw(0.18, dh * 0.3)} L${Rw(0.48, dh * 0.7)} M${Rw(0.18, dh * 0.7)} L${Rw(0.48, dh * 0.35)}" stroke="#a0774c" stroke-width="${3.4 * k}"/>`;
  else s += `<circle cx="${Rw(0.39, dh * 0.45)[0]}" cy="${Rw(0.39, dh * 0.45)[1]}" r="${1.6 * k}" fill="#ffe08a"/>` + poly(quad(Rw, 0.17, 0.49, -0.04, 0.01), shade(p.wall, -0.3));
  // telhado de telhas (quatro águas)
  const E1 = [cx - a - o, cy - h + 2 * k], E2 = [cx, cy + b - h + o], E3 = [cx + a + o, cy - h + 2 * k];
  const rL = shade(p.roof, -0.16), rR = p.roof;
  s += poly([E1, E2, apex], rL) + poly([E2, E3, apex], rR) + poly([E2, E3, apex], 'url(#v-roof)');
  for (const [A, B, col] of [[E1, E2, shade(p.roof, -0.36)], [E2, E3, shade(p.roof, -0.24)]]) {
    for (let i = 1; i <= 4; i++) { const t0 = i / 5, P1 = lerp(A, apex, t0), P2 = lerp(B, apex, t0); s += `<path d="M${P1} L${P2}" stroke="${col}" stroke-width="${1.3 * k}" stroke-dasharray="${5 * k} ${1.6 * k}" opacity=".75"/>`; }
    s += `<path d="M${A} L${B}" stroke="${shade(p.roof, -0.42)}" stroke-width="${3.2 * k}" stroke-linecap="round"/>`;
  }
  s += `<path d="M${E2} L${apex}" stroke="${shade(p.roof, 0.3)}" stroke-width="${2.2 * k}" stroke-linecap="round"/>`;
  // chaminé
  const ch = lerp(lerp(E2, E3, 0.55), apex, 0.45);
  s += `<rect x="${ch[0] - 4 * k}" y="${ch[1] - 16 * k}" width="${8 * k}" height="${16 * k}" fill="${shade(p.wall2, -0.1)}"/><rect x="${ch[0] - 5 * k}" y="${ch[1] - 18 * k}" width="${10 * k}" height="${3.5 * k}" rx="1" fill="${shade(p.roof, -0.3)}"/>`;
  if (p.aband) s += poly([lerp(E2, apex, 0.35), lerp(lerp(E2, E3, 0.4), apex, 0.4), lerp(lerp(E2, E3, 0.25), apex, 0.15)], '#4d3e36') + `<path d="M${lerp(E1, apex, 0.5)} l${10 * k} ${-4 * k}" stroke="#a0774c" stroke-width="${3 * k}"/>` + weeds(cx, cy + b + 6, 5, a * 0.8);
  if (nice) s += flowers(Lw(0.5, 0)[0] - 6 * k, Lw(0.5, 0)[1] + 8 * k, 6, 12 * k) + flowers(Rw(0.75, 0)[0] + 4 * k, Rw(0.75, 0)[1] + 7 * k, 5, 10 * k);
  if (dec) {
    const A = Rw(0.08, opts.tall ? 0.38 : 0.64), B = Rw(0.54, opts.tall ? 0.38 : 0.64);
    for (let i = 0; i < 5; i++) { const t0 = i / 5, t1 = (i + 1) / 5; const [x0, y0] = lerp(A, B, t0), [x1, y1] = lerp(A, B, t1); s += poly([[x0, y0], [x1, y1], [x1 + 9 * k, y1 + 13 * k], [x0 + 9 * k, y0 + 13 * k]], i % 2 ? '#fff' : dec.accent); }
    for (let i = 0; i <= 8; i++) { const tt = i / 8; s += `<circle class="tw" cx="${cx - a + tt * a}" cy="${cy - h + tt * b + 7 * k + Math.sin(tt * Math.PI) * 5}" r="${2.4 * k}" fill="${i % 2 ? '#ffe08a' : dec.accent}"/>`; }
    for (let i = 0; i <= 8; i++) { const tt = i / 8; s += `<circle class="tw" cx="${cx + tt * a}" cy="${cy - h + b - tt * b + 7 * k + Math.sin(tt * Math.PI) * 5}" r="${2.4 * k}" fill="${i % 2 ? '#ff8fc4' : '#ffe08a'}"/>`; }
    s += `<rect x="${cx - 24 * k}" y="${cy - h - rh * 0.66}" width="${48 * k}" height="${17 * k}" rx="${6 * k}" fill="#fff" stroke="${dec.trim}" stroke-width="2"/><text x="${cx}" y="${cy - h - rh * 0.66 + 13 * k}" text-anchor="middle" font-size="${12 * k}">${info.a.icon}</text>`;
  }
  return s;
}

function plaza(cx, cy, k, p, info) {
  const a = BW * k * 1.3, b = BH * k * 1.3, dec = decorOf(info), nice = info.status === 'reformado' || info.status === 'decorado';
  const stone = p.aband ? '#cfc4b4' : '#f6e1d0', stone2 = p.aband ? '#b9ad9c' : '#ecc9b4';
  let s = shadowE(cx, cy + 4, a * 1.05, b * 1.05) + poly([[cx, cy - b], [cx + a, cy], [cx, cy + b], [cx - a, cy]], stone, `stroke="${stone2}" stroke-width="4" stroke-linejoin="round"`);
  for (let i = 1; i < 6; i++) { const t0 = i / 6; s += `<path d="M${lerp([cx - a, cy], [cx, cy - b], t0)} L${lerp([cx, cy + b], [cx + a, cy], t0)} M${lerp([cx - a, cy], [cx, cy + b], t0)} L${lerp([cx, cy - b], [cx + a, cy], t0)}" stroke="${stone2}" stroke-width="1.4"/>`; }
  s += poly([[cx, cy - b * 0.62], [cx + a * 0.62, cy], [cx, cy + b * 0.62], [cx - a * 0.62, cy]], p.aband ? '#c1b5a4' : '#f9d3e0', `stroke="${stone2}" stroke-width="2"`);
  // fonte em camadas
  const fr = 25 * k;
  s += `<ellipse cx="${cx}" cy="${cy + 2}" rx="${fr}" ry="${fr * 0.5}" fill="${shade(p.wall2, -0.15)}"/><ellipse cx="${cx}" cy="${cy - 4}" rx="${fr}" ry="${fr * 0.5}" fill="${p.aband ? '#d6cbbb' : '#fff6ec'}"/><ellipse cx="${cx}" cy="${cy - 4}" rx="${fr * 0.82}" ry="${fr * 0.4}" fill="${p.aband ? '#8f9488' : 'url(#v-water)'}"/>`;
  s += `<rect x="${cx - 3.5 * k}" y="${cy - 30 * k}" width="${7 * k}" height="${26 * k}" rx="2" fill="${p.aband ? '#c8bcab' : '#fff1e2'}"/><ellipse cx="${cx}" cy="${cy - 30 * k}" rx="${11 * k}" ry="${5 * k}" fill="${p.aband ? '#d6cbbb' : '#fff6ec'}"/><ellipse cx="${cx}" cy="${cy - 31 * k}" rx="${8 * k}" ry="${3.4 * k}" fill="${p.aband ? '#8f9488' : 'url(#v-water)'}"/>`;
  if (p.aband) s += weeds(cx, cy + 4, 7, a * 0.7) + `<path d="M${cx - 30} ${cy + 8} l14 6 l-6 8" stroke="#8a7d6c" stroke-width="2" fill="none"/>`;
  else s += `<path class="jet" d="M${cx} ${cy - 34 * k} q-12 -18 -18 6 M${cx} ${cy - 34 * k} q12 -18 18 6 M${cx} ${cy - 34 * k} v-15" stroke="#dff8ff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (nice) for (const [dx, dy] of [[-0.62, -0.3], [0.62, -0.3], [-0.62, 0.3], [0.62, 0.3]]) { const x = cx + dx * a, y = cy + dy * b * 2; s += flowers(x, y + 6, 6, 11) + `<rect x="${x - 10}" y="${y - 4}" width="20" height="5" rx="2" fill="${p.furn}"/><rect x="${x - 10}" y="${y - 10}" width="20" height="4" rx="2" fill="${p.trim}"/>`; }
  if (dec) for (const [dx, dy] of [[0, -0.86], [0.86, 0], [0, 0.86], [-0.86, 0]]) { const x = cx + dx * a, y = cy + dy * b; s += `<rect x="${x - 1.5}" y="${y - 32}" width="3" height="32" fill="${dec.trim}"/><circle class="tw" cx="${x}" cy="${y - 34}" r="5.5" fill="#ffe08a" stroke="#fff" stroke-width="1.5"/>`; }
  return s;
}

/** Árvore redonda: verde, florida (rosa) ou seca. */
function tree(x, y, k = 1, kind = 'green') {
  if (kind === true) kind = 'dead';
  let s = shadowE(x + 4 * k, y + 2, 18 * k, 7 * k) + `<path d="M${x - 3.5 * k} ${y} Q${x - 2 * k} ${y - 14 * k} ${x - 4 * k} ${y - 26 * k} L${x + 4 * k} ${y - 26 * k} Q${x + 2 * k} ${y - 14 * k} ${x + 3.5 * k} ${y}Z" fill="url(#v-trunk)"/>`;
  if (kind === 'dead') return s + `<path d="M${x} ${y - 24 * k} l-11 -13 M${x} ${y - 24 * k} l9 -15 M${x} ${y - 18 * k} l12 -6" stroke="#8a5a33" stroke-width="3" stroke-linecap="round"/>`;
  const fill = kind === 'pink' ? 'url(#v-pink)' : 'url(#v-leaf)', hi = kind === 'pink' ? '#fff0f7' : '#c6f5a6';
  for (const [dx, dy, r] of [[-12, -30, 12], [12, -31, 12], [0, -36, 17], [-6, -47, 11], [8, -45, 10]]) s += `<circle cx="${x + dx * k}" cy="${y + dy * k}" r="${r * k}" fill="${fill}"/>`;
  for (const [dx, dy, r] of [[-5, -43, 4], [6, -40, 3], [-13, -33, 2.5]]) s += `<circle cx="${x + dx * k}" cy="${y + dy * k}" r="${r * k}" fill="${hi}" opacity=".6"/>`;
  if (kind === 'pink') for (let i = 0; i < 6; i++) s += `<circle cx="${x + Math.sin(i * 2.3) * 13 * k}" cy="${y + (-36 + Math.cos(i * 1.7) * 9) * k}" r="${1.5 * k}" fill="#fff"/>`;
  return s;
}
function palm(x, y, k = 1) {
  const tx = x + 8 * k, ty = y - 50 * k;
  let s = shadowE(x + 10 * k, y + 2, 20 * k, 6 * k) + `<path d="M${x - 3 * k} ${y} Q${x + 10 * k} ${y - 24 * k} ${tx - 2.5 * k} ${ty} L${tx + 2.5 * k} ${ty} Q${x + 14 * k} ${y - 24 * k} ${x + 3 * k} ${y}Z" fill="url(#v-trunk)"/>`;
  for (let i = 1; i < 6; i++) { const t0 = i / 6, px = x + (tx - x) * t0 + Math.sin(t0 * Math.PI) * 5 * k, py = y + (ty - y) * t0; s += `<path d="M${px - 3 * k} ${py} q${3 * k} ${1.6 * k} ${6 * k} 0" stroke="#7a4e2a" stroke-width="${1 * k}" fill="none"/>`; }
  for (const [ang, len] of [[200, 30], [235, 28], [270, 22], [305, 28], [340, 30], [160, 24], [20, 24]]) {
    const r = (ang * Math.PI) / 180, ex = tx + Math.cos(r) * len * k, ey = ty + Math.sin(r) * len * k * 0.6 + 10 * k, mx = tx + Math.cos(r) * len * 0.5 * k, my = ty + Math.sin(r) * len * 0.5 * k * 0.6 - 6 * k;
    s += `<path d="M${tx} ${ty} Q${mx - 4 * k} ${my - 4 * k} ${ex} ${ey} Q${mx + 4 * k} ${my + 4 * k} ${tx} ${ty}Z" fill="url(#v-palm)" stroke="#2f7a3a" stroke-width="${0.6 * k}"/>`;
  }
  return s + `<circle cx="${tx - 3 * k}" cy="${ty + 3 * k}" r="${3 * k}" fill="#8a5a2a"/><circle cx="${tx + 3 * k}" cy="${ty + 4 * k}" r="${3 * k}" fill="#7a4a22"/>`;
}

function houses(cx, cy, k, p, info) {
  const pals = info.status === 'reformado' || info.status === 'decorado' ? [p, { ...p, wall: shade(p.wall, 0.25), roof: p.trim }, { ...p, wall: p.accent, wall2: shade(p.accent, -0.15) }] : [p, p, p];
  return [[-34, -14, 0.55], [34, -10, 0.6], [0, 16, 0.62]].map(([dx, dy, kk], i) => building(cx + dx * k, cy + dy * k, kk * k, pals[i], info)).join('');
}

function beach(cx, cy, k, p, info) {
  const dec = decorOf(info), ok = info.status === 'reformado' || info.status === 'decorado';
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${86 * k}" ry="${40 * k}" fill="${p.aband ? '#eedcb0' : '#ffe9b8'}"/><ellipse cx="${cx + 10}" cy="${cy + 8}" rx="${60 * k}" ry="${24 * k}" fill="${p.aband ? '#e6d2a4' : '#fff3d1'}"/>`;
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
  const img = areaArt(a.id, info.unlocked ? info.status : 'abandonado');
  if (img) { const w = 150 * a.size * k; return `<image href="${img}" x="${cx - w / 2}" y="${cy - w * 0.86}" width="${w}" height="${w}" preserveAspectRatio="xMidYMax meet"/>`; } // imagem quadrada com a base no rodapé
  return DRAW[a.type](cx, cy, a.size * k, palette(info), info, { tall: a.tall });
}

/** Mapa da vila. infoOf(id) devolve o resultado de areaInfo. */
export function villageSvg(infoOf, lvl) {
  const [W, H] = VILLAGE_SIZE;
  const c = [iso(-0.6, -0.6), iso(12.2, -0.6), iso(12.2, 12.2), iso(-0.6, 12.2)];
  const g = [iso(0, 0), iso(11.6, 0), iso(11.6, 7.2), iso(7.2, 11.6), iso(0, 11.6)];
  let s = `<svg class="village" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${VDEFS}<rect width="${W}" height="${H}" fill="url(#v-sea)"/>`;
  for (let i = 0; i < 26; i++) s += `<path class="wave" style="animation-delay:${-i * 0.37}s" d="M${(i * 197) % W} ${30 + ((i * 131) % (H - 60))} q12 -8 24 0 t24 0" stroke="#fff" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>`;
  for (let i = 0; i < 18; i++) s += `<circle class="tw" cx="${(i * 263) % W}" cy="${(i * 173) % H}" r="2" fill="#fff" opacity=".8"/>`;
  // ilha: espuma, areia, grama com bordas arredondadas
  s += poly(c, 'none', 'stroke="#c9f3ff" stroke-width="70" stroke-linejoin="round" opacity=".6"') + poly(c, 'url(#v-sand)', 'stroke="#ffeab3" stroke-width="40" stroke-linejoin="round"');
  s += poly(c.map(([x, y]) => [x, y + 12]), 'none', 'stroke="#e9c27a" stroke-width="6" stroke-linejoin="round" opacity=".5"');
  s += poly(g, 'url(#v-grass)', 'stroke="#8fd46e" stroke-width="22" stroke-linejoin="round"');
  for (let i = 0; i < 70; i++) { const [x, y] = iso(0.4 + ((i * 37) % 112) / 10, 0.4 + ((i * 53) % 112) / 10); if (y > iso(0, 11.4)[1] - (x < OX ? 0 : 0)) continue; s += `<path d="M${x} ${y} l-3 -6 M${x} ${y} l0 -8 M${x} ${y} l3 -6" stroke="#6cbf52" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`; }
  // calçadas de pedra
  const line = (p) => pts(p.map(([x, y]) => iso(x, y)));
  const path = (p) => `<polyline points="${line(p)}" fill="none" stroke="#e2c4a8" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${line(p)}" fill="none" stroke="#f7e6d6" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${line(p)}" fill="none" stroke="#eccfb8" stroke-width="20" stroke-linecap="butt" stroke-dasharray="7 9" opacity=".9"/>`;
  s += path([[0.8, 3.6], [10.4, 3.6]]) + path([[3.6, 0.8], [3.6, 10]]) + path([[0.8, 6.7], [11, 6.7]]) + path([[6.7, 0.8], [6.7, 10.2]]) + path([[6.7, 6.7], [9.2, 9.2]]);
  // barcos e gaivotas no mar
  for (const [x, y, col, sc] of [[1380, 820, '#ff7f6e', 1], [180, 860, '#5aa7ff', 0.85], [1480, 260, '#ffcc33', 0.75], [120, 220, '#ff8fc4', 0.7]]) s += `<g class="boat" transform="translate(${x} ${y}) scale(${sc})"><ellipse cx="0" cy="10" rx="40" ry="8" fill="#1d8fcf" opacity=".4"/><path d="M-36 -2 Q0 22 38 -4 L30 -12 L-30 -8Z" fill="#fff" stroke="#c9d6e6" stroke-width="2"/><path d="M-30 -6 L30 -10" stroke="${col}" stroke-width="5"/><rect x="-10" y="-26" width="22" height="14" rx="3" fill="#fff" stroke="#c9d6e6" stroke-width="2"/><rect x="-6" y="-23" width="6" height="6" rx="1" fill="#9fdcf5"/><rect x="3" y="-23" width="6" height="6" rx="1" fill="#9fdcf5"/></g>`;
  for (const [x, y] of [[320, 120], [360, 100], [1260, 140], [1110, 70], [700, 50]]) s += `<path d="M${x - 9} ${y} q4.5 -6 9 0 q4.5 -6 9 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const things = [], labels = [];
  // farol
  const [fx, fy] = iso(0.4, 10.9);
  things.push([11.3, `<g>${shadowE(fx + 6, fy + 4, 30, 10)}<path d="M${fx - 15} ${fy} L${fx - 9} ${fy - 72} h18 L${fx + 15} ${fy}Z" fill="#fff"/><path d="M${fx + 2} ${fy} L${fx + 4} ${fy - 72} h5 L${fx + 15} ${fy}Z" fill="#e6e0ee"/><path d="M${fx - 13.2} ${fy - 22} h26.4 l-1.2 -14 h-24Z M${fx - 10.4} ${fy - 54} h20.8 l-.8 -10 h-19.2Z" fill="#e4576b"/>
    <rect x="${fx - 12}" y="${fy - 86}" width="24" height="14" rx="3" fill="${lvl >= 6 ? '#ffe08a' : '#a9c2d6'}" stroke="#4a5b78" stroke-width="2.5"/>${lvl >= 6 ? `<circle class="tw" cx="${fx}" cy="${fy - 79}" r="26" fill="#ffe08a" opacity=".25"/>` : ''}<path d="M${fx - 15} ${fy - 86} L${fx} ${fy - 100} L${fx + 15} ${fy - 86}Z" fill="#4a5b78"/><rect x="${fx - 16}" y="${fy - 74}" width="32" height="4" rx="2" fill="#4a5b78"/></g>`]);
  const TREES = [[0.5, 0.7, 'p'], [1.1, 4.7, 'pink'], [10.7, 0.9, 'p'], [4.5, 0.6, 'pink'], [0.6, 7.7, 'p'], [7.6, 0.6, 'green'], [10.9, 4.4, 'p'], [4.7, 10.8, 'p'], [7.1, 11.1, 'p'], [11.1, 7.7, 'p'],
    [3.1, 6.4, 'pink'], [9.9, 3.1, 'green'], [7.3, 4.1, 'pink'], [4.2, 4.3, 'green'], [0.5, 2.6, 'green'], [2.7, 0.5, 'pink'], [9.4, 0.6, 'pink'], [11.2, 2.6, 'green'], [0.6, 9.4, 'pink'], [6.2, 9.8, 'pink'],
    [9.6, 6.3, 'green'], [6.3, 6.1, 'pink'], [1.2, 10.3, 'p'], [10.4, 7.1, 'pink'], [4.2, 7.3, 'green'], [7.3, 7.6, 'pink'], [5.1, 3.9, 'pink'], [2.4, 3.1, 'green']];
  for (const [x, y, t] of TREES) { const [px, py] = iso(x, y); things.push([x + y, t === 'p' ? palm(px, py, 0.95) : tree(px, py, 0.85, t)]); }
  for (const [x, y] of [[3.1, 4.2], [4.2, 3.1], [6.2, 3.1], [3.1, 7.3], [7.2, 6.2], [6.2, 7.3], [9.9, 4.2], [1.4, 6.2]]) { const [px, py] = iso(x, y); things.push([x + y - 0.2, flowers(px, py, 7, 14)]); }
  for (const [x, y] of [[3.9, 3.3], [6.4, 3.3], [3.3, 6.4], [6.9, 7.1], [9.1, 6.4]]) { const [px, py] = iso(x, y); things.push([x + y, `<rect x="${px - 1.5}" y="${py - 30}" width="3" height="30" fill="#4a5b78"/><circle class="tw" cx="${px}" cy="${py - 33}" r="5" fill="#ffe08a" stroke="#4a5b78" stroke-width="1.5"/>`]); }
  for (const a of AREAS) {
    const info = infoOf(a.id), [cx, cy] = iso(a.pos[0], a.pos[1]);
    const locked = !info.unlocked;
    const badge = locked ? `🔒 Nível ${a.lvl}` : info.next ? `⭐ ${info.next.stars}` : '✓';
    const lw = Math.max(124, a.name.length * 8.4 + 40), ly = cy + 32 * a.size + 10;
    const act = `data-act="area" data-id="${a.id}"`;
    things.push([a.pos[0] + a.pos[1], `<g class="area ${locked ? 'locked' : ''} ${info.status}" ${act} tabindex="0" role="button" aria-label="${a.name}"><g class="area-art">${drawArea(a, info, cx, cy, 1.15)}</g></g>`]);
    labels.push(`<g class="area-label" ${act}><rect x="${cx - lw / 2}" y="${ly}" width="${lw}" height="40" rx="14" fill="#fff" opacity=".95" stroke="${locked ? '#d9d2e4' : '#e9c8ff'}" stroke-width="2"/><text x="${cx}" y="${ly + 17}" text-anchor="middle" font-size="14" font-weight="800" fill="#6b3fa0">${a.icon} ${a.name}</text>
      <text x="${cx}" y="${ly + 34}" text-anchor="middle" font-size="13" font-weight="700" fill="${locked ? '#9a8fb0' : info.next ? '#e08a00' : '#2fa35a'}">${badge}${!locked && info.next ? ' · ' + info.next.name : !locked ? ' Completo' : ''}</text>
      ${!locked && info.next ? `<g class="hammer"><circle cx="${cx}" cy="${cy - 94 * a.size}" r="16" fill="#ff5fa2" stroke="#fff" stroke-width="3"/><text x="${cx}" y="${cy - 94 * a.size + 6}" text-anchor="middle" font-size="17">🔨</text></g>` : ''}</g>`);
  }
  things.sort((x, y) => x[0] - y[0]);
  s += things.map((t) => t[1]).join('') + labels.join('') + '</svg>';
  return s;
}

/** Visão ampliada de uma área (exterior). */
export function areaZoom(a, info) {
  const ground = a.type === 'pier' ? 'url(#v-sea)' : a.type === 'beach' ? 'url(#v-sand)' : 'url(#v-grass)';
  return `<svg class="zoom" viewBox="0 0 360 250">${VDEFS}<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9e4ff"/><stop offset="1" stop-color="#fff0dc"/></linearGradient></defs><rect width="360" height="250" fill="url(#sky)"/>
  <circle cx="300" cy="46" r="24" fill="#fff6c9"/><path d="M0 150 Q60 120 120 140 T240 130 T360 140 V170 H0Z" fill="#5fd8f0"/><ellipse cx="180" cy="222" rx="230" ry="72" fill="${ground}"/>
  ${a.type !== 'pier' && a.type !== 'beach' ? tree(30, 200, 1, 'pink') + palm(336, 206, 1) : ''}
  ${areaArt(a.id, info.unlocked ? info.status : 'abandonado') ? drawArea(a, info, 180, 212, 1.55 / a.size)
    : a.type === 'pier' ? `<g transform="translate(-10 0)">${drawArea(a, info, 110, 120, 1.7)}</g>` : drawArea(a, info, 180, a.type === 'building' ? 182 : 172, a.type === 'building' ? (a.tall ? 1.35 : 1.6) : 1.5)}</svg>`;
}

/** Interior do restaurante: cada escolha (piso, parede, móveis, decoração) muda o cenário de verdade. */
// Qual imagem de interior mostrar: a última etapa de dentro já feita, no estilo escolhido nela.
const INSIDE = ['piso', 'parede', 'moveis', 'decor'];
export function interiorKey(a, info) {
  for (let i = info.step - 1; i >= 0; i--) { const c = a.steps[i] && a.steps[i].choice; if (INSIDE.includes(c) && info.choices[c]) return `${c}-${info.choices[c]}`; }
  return info.step >= 1 ? '1' : '0';
}

export function interiorSvg(info) {
  const img = info.a && interiorArt(info.a.id, interiorKey(info.a, info));
  if (img) return `<svg class="zoom" viewBox="0 0 360 250"><rect width="360" height="250" fill="#f7e4d4"/><image href="${img}" x="4" y="6" width="352" height="238" preserveAspectRatio="xMidYMid meet"/></svg>`;
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
  // cafeteria: vitrine de doces sobre o balcão (desenho provisório até chegar a imagem 3D)
  if (info.a && info.a.id === 'cafeteria' && furn) {
    s += `<rect x="256" y="72" width="88" height="36" rx="6" fill="#dff6ff" opacity=".75" stroke="${furn.furn}" stroke-width="3"/><path d="M258 90 H342" stroke="${furn.furn}" stroke-width="2"/>`;
    for (const [x, y, c] of [[270, 86, '#ff9fbf'], [292, 86, '#ffd36b'], [314, 86, '#c98a5a'], [281, 104, '#ffb3d1'], [303, 104, '#fff1c9'], [325, 104, '#ff7f9f']]) s += `<path d="M${x - 7} ${y} l2 -7 h10 l2 7Z" fill="${shade(c, -0.25)}"/><circle cx="${x}" cy="${y - 9}" r="6" fill="${c}"/><circle cx="${x}" cy="${y - 15}" r="2" fill="#e8344f"/>`;
  }
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
  if (kind === 'interior') return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">${VDEFS}<rect width="360" height="640" fill="#ffe3ef"/><rect y="0" width="360" height="330" fill="#ffd0e2"/><rect x="40" y="70" width="120" height="150" rx="14" fill="#9fe3f7" stroke="#fff" stroke-width="10"/><rect x="200" y="70" width="120" height="150" rx="14" fill="#9fe3f7" stroke="#fff" stroke-width="10"/><rect x="45" y="170" width="110" height="45" fill="#4fb8e6"/><rect x="205" y="170" width="110" height="45" fill="#4fb8e6"/><rect y="330" width="360" height="310" fill="#e9b98a"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M0 ${330 + i * 46} H360" stroke="#d49f6c" stroke-width="3"/>`).join('')}<path d="M0 20 Q90 60 180 20 T360 20" fill="none" stroke="#b67a4a" stroke-width="2"/>${[...Array(12)].map((_, i) => `<circle cx="${15 + i * 30}" cy="${32 + Math.sin((i / 6) * Math.PI) ** 2 * 10}" r="6" fill="${['#ffcc33', '#ff7f9f', '#7fd6f2'][i % 3]}"/>`).join('')}</svg>`;
  return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">${VDEFS}<defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc1dc"/><stop offset=".5" stop-color="#ffe2b8"/><stop offset="1" stop-color="#9fe3f7"/></linearGradient></defs><rect width="360" height="640" fill="url(#dsky)"/><circle cx="270" cy="150" r="46" fill="#fff6c9"/><rect y="330" width="360" height="310" fill="#5cc3ea"/><path d="M0 360 q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/><path d="M-20 420 Q120 340 380 410 V640 H-20Z" fill="#ffe9b8"/><path d="M-20 470 Q140 400 380 470 V640 H-20Z" fill="#a8e68f"/>${tree(300, 500, 1.6, 'pink')}${palm(40, 480, 2)}${tree(130, 520, 1.2, 'pink')}${palm(330, 470, 1.4)}<g transform="translate(250 330)"><path d="M-10 0 L-6 -50 h12 L10 0Z" fill="#fff"/><rect x="-8" y="-60" width="16" height="10" fill="#ffe08a"/><path d="M-10 -60 L0 -70 L10 -60Z" fill="#4a5b78"/></g></svg>`;
}

/** Xícara de cappuccino com coração na espuma (tela inicial). */
export function coffeeCup() {
  return `<svg viewBox="0 0 120 84" aria-hidden="true"><defs>
    <linearGradient id="cupB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#f6eef6"/><stop offset="1" stop-color="#ddd0e2"/></linearGradient>
    <radialGradient id="cupF" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#f3dcc0"/><stop offset=".75" stop-color="#d9a777"/><stop offset="1" stop-color="#a8713f"/></radialGradient></defs>
    <ellipse cx="58" cy="72" rx="54" ry="11" fill="#e9dcef"/><ellipse cx="58" cy="70" rx="50" ry="9" fill="#fff"/><ellipse cx="58" cy="69" rx="30" ry="5" fill="#e6d8ea"/>
    <path d="M90 30 C110 28 110 54 88 54" fill="none" stroke="#f1e6f2" stroke-width="8" stroke-linecap="round"/><path d="M90 30 C106 30 106 52 88 52" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <path d="M24 22 C24 52 34 68 58 68 C82 68 92 52 92 22Z" fill="url(#cupB)"/><path d="M30 44 C34 58 44 64 58 64" fill="none" stroke="#ffb3d1" stroke-width="3" opacity=".7"/>
    <ellipse cx="58" cy="22" rx="34" ry="9" fill="#efe4f1"/><ellipse cx="58" cy="22.5" rx="30" ry="7.2" fill="url(#cupF)"/>
    <path d="M58 27 C50 21 50 16 54.5 16 C56.5 16 58 18 58 19.5 C58 18 59.5 16 61.5 16 C66 16 66 21 58 27Z" fill="#fff6ea"/>
    <path class="steam" d="M46 10 q-4 -5 0 -9 M58 8 q-4 -5 0 -9 M70 10 q-4 -5 0 -9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/></svg>`;
}

/** Arte da tela de título: Dakota apoiada na mão com um cappuccino (ou a imagem dakota-menu.png, se existir). */
export function titleArt(player) {
  const img = !(player && player.custom) && menuArt();
  const hero = img ? `<div class="title-pose img"><img src="${img}" alt="Dakota" draggable="false"></div>`
    : `<div class="title-pose"><div class="title-hero">${portrait('dakota', 'feliz', player, 'queixo')}</div><div class="title-cup">${coffeeCup()}</div></div>`;
  return `<div class="title-bg">${sceneBg('vila')}</div>${hero}`;
}
