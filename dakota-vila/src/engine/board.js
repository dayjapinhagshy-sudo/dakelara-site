// Motor Merge-2 reutilizável: opera sobre qualquer tabuleiro em s.boards[chave].
import { CFG } from '../data/config.js';
import { GENERATORS, CHEST_LOOT, CHAINS, CHAIN_GEN, itemDef } from '../data/items.js';
import { bus, rand, weighted, mkItem, discover, grant, addXp, spend, addFestPts } from './core.js';

const fail = (why) => ({ ok: false, why });
export const isFree = (it) => !!it && !it.locked && !it.covered && !it.bubble;

export function neighbors(b, i) {
  const x = i % b.w, y = (i / b.w) | 0, out = [];
  if (x > 0) out.push(i - 1);
  if (x < b.w - 1) out.push(i + 1);
  if (y > 0) out.push(i - b.w);
  if (y < b.h - 1) out.push(i + b.w);
  return out;
}

export function nearestEmpty(b, i) {
  if (i < 0) return b.cells.indexOf(null);
  const x0 = i % b.w, y0 = (i / b.w) | 0;
  let best = -1, bd = 1e9;
  for (let j = 0; j < b.cells.length; j++) {
    if (b.cells[j]) continue;
    const d = Math.hypot((j % b.w) - x0, ((j / b.w) | 0) - y0);
    if (d < bd) { bd = d; best = j; }
  }
  return best;
}

/** Coloca um novo item no tabuleiro; devolve o índice ou -1 se cheio. */
export function place(s, bk, id, near = -1, extra) {
  const b = s.boards[bk];
  const j = nearestEmpty(b, near);
  if (j < 0) return -1;
  b.cells[j] = mkItem(s, id, extra);
  discover(s, id);
  return j;
}

export function canMerge(a, t) {
  if (!isFree(a) || !t || t.covered || t.bubble) return false;
  if (a.id !== t.id || a === t) return false;
  if (a.left != null || t.left != null) return false; // baús já abertos não combinam
  return itemDef(a.id).mergeable;
}

function afterMerge(s, bk, i, now) {
  const b = s.boards[bk];
  const it = b.cells[i];
  const d = itemDef(it.id);
  s.stats.merges++;
  discover(s, it.id);
  const revealed = [];
  for (const n of neighbors(b, i)) {
    const c = b.cells[n];
    if (c && c.covered) {
      delete c.covered;
      if (itemDef(c.id).mergeable) c.locked = 1; // ferramentas e itens finais já saem livres
      discover(s, c.id);
      revealed.push(n);
    }
  }
  if (d.kind === 'item' && d.level >= CFG.mergeXpFromLevel) addXp(s, d.level - CFG.mergeXpFromLevel + 1, now);
  if (d.chain === 'festa') addFestPts(s, d.level, now);
  let bubble = -1;
  if (d.kind === 'item' && d.level >= CFG.bubble.minLevel && rand() < CFG.bubble.chance) {
    bubble = place(s, bk, it.id, i, { bubble: now + CFG.bubble.ttlMs });
  }
  bus.emit('merge', { bk, i, id: it.id, level: d.level, chain: d.chain });
  return { revealed, bubble };
}

/** Arrastar o item de `from` para `to`: mover, trocar, combinar ou usar ferramenta. */
export function drop(s, bk, from, to, now = Date.now()) {
  const b = s.boards[bk];
  const a = b.cells[from], t = b.cells[to];
  if (from === to || to < 0 || to >= b.cells.length) return fail('nada');
  if (!a) return fail('nada');
  if (!isFree(a)) return fail('preso');
  if (!t) { b.cells[to] = a; b.cells[from] = null; return { ok: true, type: 'move', i: to }; }
  const da = itemDef(a.id);
  if (da.kind === 'tool' && !t.covered && !t.bubble) {
    const dt = itemDef(t.id);
    if (da.chain === 'coringa' && dt.mergeable) {
      t.id = dt.next; delete t.locked; b.cells[from] = null;
      return { ok: true, type: 'merge', i: to, tool: 'coringa', ...afterMerge(s, bk, to, now) };
    }
    if (da.chain === 'tesoura' && isFree(t) && dt.kind === 'item' && dt.prev) {
      t.id = dt.prev;
      b.cells[from] = mkItem(s, dt.prev); // a tesoura é consumida e libera a célula
      return { ok: true, type: 'split', i: to, j: from };
    }
    if (da.chain === 'acelerador' && dt.kind === 'gen' && !t.locked) {
      const L = genLevel(s, dt.gen);
      t.ch = L.charges; t.cd = 0; t.next = now;
      b.cells[from] = null;
      return { ok: true, type: 'boost', i: to };
    }
  }
  if (canMerge(a, t)) {
    const unlocked = !!t.locked;
    t.id = da.next; delete t.locked; b.cells[from] = null;
    return { ok: true, type: 'merge', i: to, unlocked, ...afterMerge(s, bk, to, now) };
  }
  if (!isFree(t)) return fail('bloqueado');
  b.cells[to] = a; b.cells[from] = t;
  return { ok: true, type: 'swap', i: to, j: from };
}

// ---- Geradores ----
export function genLevel(s, type) {
  const g = GENERATORS[type];
  const lvl = Math.min(g.levels.length, (s.gens[type] && s.gens[type].lvl) || 1);
  return g.levels[lvl - 1];
}

function rollDrop(g, L) {
  for (const [id, p] of CFG.bonusDrop) if (!g.event && rand() < p) return id;
  const chain = weighted(g.drops);
  const lv = weighted(L.lv.map((w, i) => [i + 1, w]));
  return `${chain}:${lv}`;
}

/** Estado legível de um gerador (para a interface). */
export function genStatus(s, it, now) {
  const d = itemDef(it.id), g = GENERATORS[d.gen], L = genLevel(s, d.gen);
  let ch = it.ch == null ? L.charges : it.ch;
  if (ch <= 0 && now >= (it.cd || 0)) ch = L.charges;
  return { g, L, charges: ch, max: L.charges, cooling: ch <= 0, readyIn: ch <= 0 ? Math.max(0, it.cd - now) : 0 };
}

export function produce(s, bk, i, now = Date.now()) {
  const b = s.boards[bk], it = b.cells[i];
  const d = itemDef(it.id), g = GENERATORS[d.gen], L = genLevel(s, d.gen);
  if (g.mode === 'auto') return fail('auto');
  if (it.ch == null) it.ch = L.charges;
  if (it.ch <= 0) { if (now >= it.cd) it.ch = L.charges; else return fail('recarga'); }
  if (nearestEmpty(b, i) < 0) return fail('cheio');
  if (!spend(s, b.pool, g.energy, now)) return fail(b.pool === 'tickets' ? 'fichas' : 'energia');
  const id = rollDrop(g, L);
  const j = place(s, bk, id, i);
  it.ch--;
  if (it.ch <= 0) it.cd = now + L.cd * 1000;
  s.stats.generated++;
  bus.emit('generate', { bk, id });
  return { ok: true, type: 'spawn', i: j, from: i, id };
}

// ---- Ativar (toque): gerador, coletável, baú, bolha ----
export function activate(s, bk, i, now = Date.now()) {
  const b = s.boards[bk], it = b.cells[i];
  if (!it || it.covered) return fail('nada');
  if (it.bubble) return popBubble(s, bk, i, now);
  if (it.locked) return fail('bloqueado');
  const d = itemDef(it.id);
  if (d.kind === 'gen') return produce(s, bk, i, now);
  if (d.kind === 'collect') {
    grant(s, { [d.res]: d.amount }, now);
    b.cells[i] = null;
    return { ok: true, type: 'collect', i, res: d.res, amount: d.amount };
  }
  if (d.kind === 'chest') {
    const T = CHEST_LOOT[d.level];
    if (it.left == null) it.left = T.n;
    let j = nearestEmpty(b, i);
    if (j < 0 && it.left > 1) return fail('cheio');
    const id = rollLoot(s, T);
    it.left--;
    if (it.left <= 0) { b.cells[i] = null; s.stats.chests++; j = i; }
    b.cells[j] = mkItem(s, id); discover(s, id);
    return { ok: true, type: 'spawn', i: j, from: i, id, chestDone: it.left <= 0 };
  }
  return fail('nada');
}

function rollLoot(s, T) {
  const [chain, lo, hi] = weighted(T.loot.map((e) => [e, e[3]]));
  let c = chain;
  if (c === '$chain') { // uma cadeia de algum gerador já desbloqueado
    const opts = Object.keys(CHAINS).filter((k) => CHAINS[k].kind === 'item' && !CHAINS[k].event && s.gens[CHAIN_GEN[k]]);
    c = opts[Math.floor(rand() * opts.length)] || 'cafe';
  }
  const max = CHAINS[c].items.length;
  const lv = Math.min(max, lo + Math.floor(rand() * (hi - lo + 1)));
  return `${c}:${lv}`;
}

export const bubbleCost = (it) => CFG.bubble.popBase + itemDef(it.id).level;
export function popBubble(s, bk, i, now = Date.now()) {
  const it = s.boards[bk].cells[i];
  if (!it || !it.bubble) return fail('nada');
  const cost = bubbleCost(it);
  if (s.wallet.gems < cost) return fail('gemas');
  s.wallet.gems -= cost;
  delete it.bubble;
  return { ok: true, type: 'pop', i };
}

// ---- Vender, desfazer, desbloquear ----
export function sell(s, bk, i) {
  const b = s.boards[bk], it = b.cells[i];
  if (!isFree(it)) return fail('preso');
  const d = itemDef(it.id);
  if (d.kind === 'gen') return fail('gerador');
  b.cells[i] = null;
  s.wallet.coins += d.value;
  if (d.value) s.stats.coinsEarned += d.value;
  s.stats.sold++;
  s.undo = { bk, i, item: it, coins: d.value };
  return { ok: true, type: 'sell', i, coins: d.value };
}

export function undo(s) {
  const u = s.undo;
  if (!u) return fail('nada');
  const b = s.boards[u.bk];
  s.wallet.coins = Math.max(0, s.wallet.coins - u.coins);
  const j = b.cells[u.i] ? nearestEmpty(b, u.i) : u.i;
  if (j < 0) s.inbox.push(u.item.id); else b.cells[j] = u.item;
  s.undo = null;
  s.stats.sold = Math.max(0, s.stats.sold - 1);
  return { ok: true, type: 'undo', i: j };
}

export function payUnlock(s, bk, i) {
  const it = s.boards[bk].cells[i];
  if (!it || !it.locked) return fail('nada');
  const cost = CFG.unlockCost(itemDef(it.id).value);
  if (s.wallet.coins < cost) return fail('moedas');
  s.wallet.coins -= cost;
  delete it.locked;
  return { ok: true, type: 'unlock', i, cost };
}

// ---- Inventário e caixa de entrada ----
export function store(s, bk, i) {
  const b = s.boards[bk], it = b.cells[i];
  if (!isFree(it)) return fail('preso');
  if (s.inv.items.length >= s.inv.slots) return fail('inventario');
  if (itemDef(it.id).chain === 'festa' || bk !== 'main') return fail('evento');
  b.cells[i] = null;
  s.inv.items.push(it);
  return { ok: true, type: 'store' };
}
export function retrieve(s, bk, k) {
  const b = s.boards[bk];
  const j = b.cells.indexOf(null);
  if (j < 0) return fail('cheio');
  const [it] = s.inv.items.splice(k, 1);
  if (!it) return fail('nada');
  b.cells[j] = it;
  return { ok: true, type: 'spawn', i: j };
}
export function expandInventory(s) {
  if (s.inv.slots >= CFG.inventory.max) return fail('max');
  const cost = CFG.inventory.costGems(s.inv.slots);
  if (s.wallet.gems < cost) return fail('gemas');
  s.wallet.gems -= cost;
  s.inv.slots += 2;
  return { ok: true, cost };
}
export function takeInbox(s, bk = 'main') {
  if (!s.inbox.length) return fail('nada');
  const j = place(s, bk, s.inbox[0]);
  if (j < 0) return fail('cheio');
  s.inbox.shift();
  return { ok: true, type: 'spawn', i: j };
}

// ---- Passagem do tempo: bolhas e geradores automáticos ----
export function tick(s, now = Date.now()) {
  let changed = false;
  for (const [bk, b] of Object.entries(s.boards)) {
    for (let i = 0; i < b.cells.length; i++) {
      const it = b.cells[i];
      if (!it) continue;
      if (it.bubble && now >= it.bubble) { b.cells[i] = mkItem(s, 'moeda:1'); changed = true; continue; }
      if (it.covered || it.locked) continue;
      const d = itemDef(it.id);
      if (d.kind !== 'gen' || GENERATORS[d.gen].mode !== 'auto') continue;
      const g = GENERATORS[d.gen], L = genLevel(s, d.gen);
      if (it.ch == null) { it.ch = L.charges; it.next = now + L.every * 1000; }
      for (let guard = 0; guard < 30; guard++) {
        if (it.ch <= 0) { // após a recarga começa um novo ciclo (no máximo um ciclo por ausência)
          if (now < it.cd) break;
          it.ch = L.charges; it.next = now + L.every * 1000; break;
        }
        if (now < it.next) break;
        if (nearestEmpty(b, i) < 0) { it.next = now + L.every * 1000; break; }
        place(s, bk, rollDrop(g, L), i);
        s.stats.generated++;
        it.ch--; it.next += L.every * 1000;
        if (it.ch <= 0) it.cd = it.next - L.every * 1000 + L.cd * 1000;
        changed = true;
      }
    }
  }
  return changed;
}

/** Contagem de itens livres por id (para pedidos). */
export function countFree(b) {
  const m = {};
  for (const it of b.cells) if (isFree(it)) m[it.id] = (m[it.id] || 0) + 1;
  return m;
}
export function removeFree(b, id, n) {
  for (let i = 0; i < b.cells.length && n > 0; i++) {
    const it = b.cells[i];
    if (isFree(it) && it.id === id) { b.cells[i] = null; n--; }
  }
  return n === 0;
}
