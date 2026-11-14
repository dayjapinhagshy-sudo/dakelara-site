// Lógica da ferramenta de recorte (roda no navegador): folhas → recortes → sem fundo → WebP (com transparência) no tamanho do jogo.
import { CHARACTERS, AREAS } from '../src/data/world.js';
import { GENERATORS, allItemIds } from '../src/data/items.js';

const EXPR = ['feliz', 'rindo', 'neutro', 'triste', 'surpreso', 'bravo'];
const STATES = ['abandonado', 'limpo', 'reformado', 'decorado'];
const ITEMS = new Set(allItemIds().map((id) => id.replace(':', '-')).concat(Object.keys(GENERATORS).map((g) => 'gen-' + g)));
const AREA_IDS = new Set(AREAS.map((a) => a.id));
// Paisagem da vila: fundo inteiro (ilha + mar) e enfeites soltos
export const SCENERY = ['palmeira', 'arvore-rosa', 'arvore-verde', 'flores', 'poste', 'farol'];
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
  if (base === 'vila-fundo') return { outs: [{ f: 'areas/vila-fundo.webp', kind: 'fundo' }] };
  if (/^fundo-(menu|conversa|conversa-dentro|tabuleiro)$/.test(base)) return { outs: [{ f: `areas/${base}.webp`, kind: 'tela' }] };
  if (base === 'mesa-menu') return { outs: [{ f: 'areas/mesa-menu.webp', kind: 'mesa' }] };
  if (SCENERY.includes(base.replace(/^enfeite-/, '')) && base.startsWith('enfeite-')) return { outs: [{ f: `areas/${base}.webp`, kind: 'enfeite' }] };
  if (ITEMS.has(base)) return { outs: [{ f: `items/${base}.webp`, kind: 'item' }] };
  if (AREA_IDS.has(who) && /^[a-z]+-dentro-(0|1|(piso|parede|moveis|decor)-(rustico|tropical|moderno))$/.test(base)) return { outs: [{ f: `areas/${base}.webp`, kind: 'interior' }] };
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
const FRAME = { portrait: [512, 512, 0.04, 'bottom'], pose: [1024, 1536, 0.03, 'bottom'], item: [256, 256, 0.06, 'center'], area: [768, 768, 0.03, 'bottom'], interior: [768, 512, 0.02, 'center'], enfeite: [384, 384, 0.03, 'bottom'], mesa: [1024, 384, 0.01, 'top'] };
function frame(cv, kind) {
  if (kind === 'tela') { // fundo de tela de celular: 900×1600, preenche tudo (corta as sobras, sem deformar)
    const out = canvasOf(900, 1600), s = Math.max(900 / cv.width, 1600 / cv.height), w = cv.width * s, h = cv.height * s;
    const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, (900 - w) / 2, (1600 - h) / 2, w, h);
    return out;
  }
  if (kind === 'fundo') { // paisagem: a ilha inteira cabe em 1600×1000, centralizada, sem cortar; em volta fica o mar do jogo
    const b = bbox(cv), out = canvasOf(1600, 1000), s = Math.min(1600 / b.w, 1000 / b.h), w = b.w * s, h = b.h * s;
    const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(cv, b.x, b.y, b.w, b.h, (1600 - w) / 2, (1000 - h) / 2, w, h);
    return out;
  }
  const [W, H, pad, align] = FRAME[kind], b = bbox(cv), out = canvasOf(W, H);
  const s = Math.min((W * (1 - 2 * pad)) / b.w, (H * (1 - 2 * pad)) / b.h);
  const w = b.w * s, h = b.h * s, x = (W - w) / 2, y = align === 'bottom' ? H - h : align === 'top' ? 0 : (H - h) / 2;
  const ctx = out.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cv, b.x, b.y, b.w, b.h, x, y, w, h);
  return out;
}

// Acha os objetos separados de uma folha (pela transparência) e devolve as caixas em ordem de leitura.
function findObjects(cv, junta = 0.018) {
  const S = 4, W = cv.width, H = cv.height, w = Math.ceil(W / S), h = Math.ceil(H / S);
  const d = cv.getContext('2d').getImageData(0, 0, W, H).data, m = new Uint8Array(w * h);
  for (let y = 0; y < H; y += S) for (let x = 0; x < W; x += S) if (d[(y * W + x) * 4 + 3] > 40) m[(y / S) * w + x / S] = 1;
  // junta pedaços próximos (sombra, brilho, partes soltas) numa peça só
  const R = Math.max(1, Math.round(Math.min(w, h) * junta)), g = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < w && Y < h) g[Y * w + X] = 1; }
  const lab = new Int32Array(w * h), boxes = [];
  for (let p = 0; p < w * h; p++) {
    if (!g[p] || lab[p]) continue;
    const b = { x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0 }, st = [p]; lab[p] = boxes.length + 1;
    while (st.length) {
      const q = st.pop(), x = q % w, y = (q - x) / w;
      if (m[q]) { b.n++; if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; }
      for (const n of [x > 0 ? q - 1 : -1, x < w - 1 ? q + 1 : -1, q - w, q + w]) if (n >= 0 && n < w * h && g[n] && !lab[n]) { lab[n] = lab[p]; st.push(n); }
    }
    boxes.push(b);
  }
  const big = boxes.filter((b) => b.n > w * h * 0.002).map((b) => ({ x: b.x0 * S, y: b.y0 * S, w: (b.x1 - b.x0 + 1) * S, h: (b.y1 - b.y0 + 1) * S }));
  // ordem de leitura: linhas de cima para baixo, cada linha da esquerda para a direita
  big.sort((a, b) => a.y - b.y);
  const rows = [];
  for (const b of big) { const r = rows.find((r) => b.y + b.h / 2 > r.top && b.y + b.h / 2 < r.bot); if (r) { r.items.push(b); r.bot = Math.max(r.bot, b.y + b.h); } else rows.push({ top: b.y, bot: b.y + b.h, items: [b] }); }
  return rows.flatMap((r) => r.items.sort((a, b) => a.x - b.x));
}

function crop(src, x, y, w, h) { const c = canvasOf(Math.round(w), Math.round(h)); c.getContext('2d').drawImage(src, x, y, w, h, 0, 0, c.width, c.height); return c; }

// Lista de trabalhos: arquivos com nome do kit + folhas descritas em assets/originais/_folhas.json
async function jobs() {
  const list = [];
  for (const file of await (await fetch('/api/originais')).json()) list.push({ file, ...plan(file) });
  // ?so=74,75 → processa só essas folhas de _entrada (não refaz as antigas)
  const so = new URLSearchParams(location.search).get('so');
  const want = so ? new Set(so.split(',').map((n) => `_entrada/${n.trim()}.png`)) : null;
  if (want) list.length = 0;
  try {
    const r = await fetch('/assets/originais/_folhas.json', { cache: 'no-cache' });
    if (r.ok) for (const [file, j] of Object.entries(await r.json())) {
      if (want && !want.has(file)) continue;
      const outs = j.nomes.map((n) => { if (!n || n === '-') return null; const p = plan(n + '.png'); return p.error ? { error: `${n}: ${p.error}` } : p.outs[0]; });
      const bad = outs.find((o) => o && o.error);
      list.push(bad ? { file, error: bad.error } : { file, mode: j.modo, cols: j.cols, rows: j.rows, sheet: j.modo === 'grade', limpar: !!j.limpar, outs });
    }
  } catch (e) { console.warn('[folhas]', e); }
  return list;
}

async function processAll() {
  $('#go').disabled = true; $('#save').disabled = true; $('#out').innerHTML = ''; results = [];
  const list = await jobs();
  $('#log').textContent = list.length ? `${list.length} arquivo(s)…` : 'Nenhuma imagem em assets/originais/.';
  for (const p of list) {
    const box = document.createElement('div');
    box.className = 'src' + (p.error ? ' err' : ''); box.innerHTML = `<h2>${p.file}${p.error ? ' — ' + p.error : ''}</h2><div class="outs"></div>`;
    $('#out').append(box);
    if (p.error) continue;
    try {
      const img = await loadImg('/assets/originais/' + p.file.split('/').map(encodeURIComponent).join('/'));
      const whole = canvasOf(img.naturalWidth, img.naturalHeight); whole.getContext('2d').drawImage(img, 0, 0);
      let cells;
      if (p.mode === 'itens') {
        removeBg(whole);
        let objs = [];
        for (const j of [0.018, 0.012, 0.008, 0.005, 0.003]) { objs = findObjects(whole, j); if (objs.length >= p.outs.length) break; } // itens muito juntos: junta menos
        if (objs.length !== p.outs.length) throw new Error(`achei ${objs.length} objetos, esperava ${p.outs.length}`);
        const pad = 6;
        cells = objs.map((b) => crop(whole, Math.max(0, b.x - pad), Math.max(0, b.y - pad), Math.min(whole.width - b.x + pad, b.w + 2 * pad), Math.min(whole.height - b.y + pad, b.h + 2 * pad)));
      } else {
        const cols = p.sheet ? p.cols : 1, rows = p.sheet ? p.rows : 1, cw = whole.width / cols, ch = whole.height / rows;
        cells = p.outs.slice(0, cols * rows).map((_, k) => {
          const c = crop(whole, (k % cols) * cw, Math.floor(k / cols) * ch, cw, ch);
          if (!(p.outs[k] && p.outs[k].kind === 'tela')) removeBg(c); // fundo de tela fica inteiro; no da vila, tira o branco/xadrez em volta da ilha
          if (!p.limpar) return c;
          // "limpar": fica só com o maior objeto da célula (tira lascas do vizinho que invadiram a grade)
          const big = findObjects(c, 0.004).sort((a, b) => b.w * b.h - a.w * a.h)[0];
          return big ? crop(c, big.x, big.y, big.w, big.h) : c;
        });
      }
      cells.forEach((cell, k) => {
        const o = p.outs[k];
        if (!o) return; // "-" = pular este objeto
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
