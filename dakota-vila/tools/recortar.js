// Lógica da ferramenta de recorte (roda no navegador): folhas → recortes → sem fundo → WebP (com transparência) no tamanho do jogo.
import { CHARACTERS, AREAS } from '../src/data/world.js';
import { GENERATORS, allItemIds } from '../src/data/items.js';

const EXPR = ['feliz', 'rindo', 'neutro', 'triste', 'surpreso', 'bravo'];
const STATES = ['abandonado', 'limpo', 'reformado', 'decorado'];
const ITEMS = new Set(allItemIds().map((id) => id.replace(':', '-')).concat(Object.keys(GENERATORS).map((g) => 'gen-' + g)));
const AREA_IDS = new Set(AREAS.map((a) => a.id));
const $ = (q) => document.querySelector(q);
let results = [];

// Para onde vai cada arquivo de assets/originais e em que formato
function plan(file) {
  const base = file.replace(/\.\w+$/, '').toLowerCase();
  const sheet = base.match(/^([a-z]+)-expressoes(?:-(\d)x(\d))?$/);
  if (sheet) {
    const [, who, c = 3, r = 2] = sheet;
    if (!CHARACTERS[who]) return { error: `personagem "${who}" não existe` };
    return { sheet: true, cols: +c, rows: +r, outs: EXPR.map((e) => ({ f: `characters/${who}${e === 'feliz' ? '' : '-' + e}.webp`, kind: 'portrait' })) };
  }
  const [who, expr] = base.split('-');
  if (CHARACTERS[who] && (!expr || EXPR.includes(expr) || (who === 'dakota' && expr === 'menu')))
    return { outs: [{ f: `characters/${base === who + '-feliz' ? who : base}.webp`, kind: expr === 'menu' ? 'pose' : 'portrait' }] };
  if (ITEMS.has(base)) return { outs: [{ f: `items/${base}.webp`, kind: 'item' }] };
  if (AREA_IDS.has(who) && (!expr || STATES.includes(expr))) return { outs: [{ f: `areas/${base}.webp`, kind: 'area' }] };
  return { error: 'nome não reconhecido (veja os nomes em assets/KIT-PROMPTS.md)' };
}

const loadImg = (src) => new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error('não abriu a imagem')); i.src = src; });

function canvasOf(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// Remove o fundo liso ligado às bordas (branco, cor única ou o xadrez falso de "transparente").
function removeBg(cv) {
  const ctx = cv.getContext('2d'), { width: W, height: H } = cv, img = ctx.getImageData(0, 0, W, H), d = img.data;
  // já tem transparência de verdade? então não mexe
  const corners = [0, W - 1, (H - 1) * W, H * W - 1];
  if (corners.some((p) => d[p * 4 + 3] < 200)) return;
  // até 2 cores dominantes na borda (o xadrez falso tem duas)
  const border = [];
  for (let x = 0; x < W; x += 3) border.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y += 3) border.push(y * W, y * W + W - 1);
  const buckets = new Map();
  for (const p of border) { const k = (d[p * 4] >> 4) << 8 | (d[p * 4 + 1] >> 4) << 4 | (d[p * 4 + 2] >> 4); buckets.set(k, (buckets.get(k) || 0) + 1); }
  const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).filter(([, n], i) => i === 0 || n > border.length * 0.15);
  const pal = top.map(([k]) => { const n = border.filter((p) => ((d[p * 4] >> 4) << 8 | (d[p * 4 + 1] >> 4) << 4 | (d[p * 4 + 2] >> 4)) === k); const m = [0, 0, 0]; for (const p of n) for (let c = 0; c < 3; c++) m[c] += d[p * 4 + c]; return m.map((v) => v / n.length); });
  const dist = (p) => Math.min(...pal.map((b) => Math.max(Math.abs(d[p * 4] - b[0]), Math.abs(d[p * 4 + 1] - b[1]), Math.abs(d[p * 4 + 2] - b[2]))));
  const T1 = 34, T2 = 120, bg = new Uint8Array(W * H), q = [];
  for (const p of border) if (!bg[p] && dist(p) < T1) { bg[p] = 1; q.push(p); }
  for (let x = 0; x < W; x++) for (const p of [x, (H - 1) * W + x]) if (!bg[p] && dist(p) < T1) { bg[p] = 1; q.push(p); }
  for (let y = 0; y < H; y++) for (const p of [y * W, y * W + W - 1]) if (!bg[p] && dist(p) < T1) { bg[p] = 1; q.push(p); }
  while (q.length) {
    const p = q.pop(), x = p % W;
    for (const n of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W]) if (n >= 0 && n < W * H && !bg[n] && dist(n) < T1) { bg[n] = 1; q.push(n); }
  }
  for (let p = 0; p < W * H; p++) if (bg[p]) d[p * 4 + 3] = 0;
  // borda suave: pixels vizinhos do fundo ficam semitransparentes e perdem o halo branco
  const b0 = pal[0];
  for (let p = 0; p < W * H; p++) {
    if (bg[p]) continue;
    const x = p % W;
    if (!((x > 0 && bg[p - 1]) || (x < W - 1 && bg[p + 1]) || (p >= W && bg[p - W]) || (p < W * (H - 1) && bg[p + W]))) continue;
    const a = Math.min(1, dist(p) / T2);
    d[p * 4 + 3] = Math.round(255 * a);
    if (a > 0.05) for (let c = 0; c < 3; c++) d[p * 4 + c] = Math.max(0, Math.min(255, (d[p * 4 + c] - (1 - a) * b0[c]) / a));
  }
  ctx.putImageData(img, 0, 0);
}

// Caixa do conteúdo visível
function bbox(cv) {
  const { width: W, height: H } = cv, d = cv.getContext('2d').getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? { x: 0, y: 0, w: W, h: H } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// Enquadra no tamanho final: retratos e vila com a base no rodapé, itens centralizados
const FRAME = { portrait: [512, 512, 0.04, 'bottom'], pose: [1024, 1536, 0.03, 'bottom'], item: [512, 512, 0.06, 'center'], area: [1024, 1024, 0.03, 'bottom'] };
function frame(cv, kind) {
  const [W, H, pad, align] = FRAME[kind], b = bbox(cv), out = canvasOf(W, H);
  const s = Math.min((W * (1 - 2 * pad)) / b.w, (H * (1 - 2 * pad)) / b.h);
  const w = b.w * s, h = b.h * s, x = (W - w) / 2, y = align === 'bottom' ? H - h : (H - h) / 2;
  const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cv, b.x, b.y, b.w, b.h, x, y, w, h);
  return out;
}

async function processAll() {
  $('#go').disabled = true; $('#save').disabled = true; $('#out').innerHTML = ''; results = [];
  const files = await (await fetch('/api/originais')).json();
  $('#log').textContent = files.length ? `${files.length} arquivo(s)…` : 'Nenhuma imagem em assets/originais/.';
  for (const file of files) {
    const p = plan(file), box = document.createElement('div');
    box.className = 'src' + (p.error ? ' err' : ''); box.innerHTML = `<h2>${file}${p.error ? ' — ' + p.error : ''}</h2><div class="outs"></div>`;
    $('#out').append(box);
    if (p.error) continue;
    try {
      const img = await loadImg('/assets/originais/' + encodeURIComponent(file));
      const cols = p.sheet ? p.cols : 1, rows = p.sheet ? p.rows : 1, cw = img.naturalWidth / cols, ch = img.naturalHeight / rows;
      p.outs.slice(0, cols * rows).forEach((o, k) => {
        const cell = canvasOf(Math.round(cw), Math.round(ch));
        cell.getContext('2d').drawImage(img, (k % cols) * cw, Math.floor(k / cols) * ch, cw, ch, 0, 0, cell.width, cell.height);
        removeBg(cell);
        const fin = frame(cell, o.kind);
        results.push({ f: o.f, cv: fin });
        const fig = document.createElement('figure'); fig.append(fin); fig.insertAdjacentHTML('beforeend', `<figcaption>${o.f}</figcaption>`);
        box.querySelector('.outs').append(fig);
      });
    } catch (e) { box.classList.add('err'); box.querySelector('h2').textContent += ' — ' + e.message; }
  }
  $('#log').textContent = `${results.length} imagem(ns) prontas para salvar.`;
  $('#go').disabled = false; $('#save').disabled = !results.length;
}

async function saveAll() {
  $('#save').disabled = true;
  let n = 0;
  for (const r of results) {
    const blob = await new Promise((ok) => r.cv.toBlob(ok, 'image/webp', 0.9));
    const res = await fetch('/api/salvar?f=' + encodeURIComponent(r.f), { method: 'POST', body: blob });
    if (res.ok) n++; else console.error('falhou', r.f, await res.text());
  }
  const man = await (await fetch('/api/manifesto', { method: 'POST' })).text();
  $('#log').textContent = `Salvas ${n}/${results.length}. ${man.trim()}`;
  window.__recorte = { saved: n, total: results.length, manifest: man };
}

$('#go').onclick = processAll;
$('#save').onclick = saveAll;
