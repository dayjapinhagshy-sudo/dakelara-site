// Núcleo: estado do jogo, RNG, barramento de eventos, recursos e níveis.
import { CFG, FESTIVAL, HUNT } from '../data/config.js';
import { GENERATORS, itemDef } from '../data/items.js';
import { LEVEL_SCENES, ALBUM } from '../data/world.js';

export const bus = {
  subs: [],
  on(f) { this.subs.push(f); },
  emit(type, data) { for (const f of this.subs) { try { f(type, data); } catch (e) { console.error('[bus]', e); } } },
};

let rng = Math.random;
export const setRng = (f) => { rng = f || Math.random; };
export const rand = () => rng();
export const pick = (arr) => arr[Math.floor(rand() * arr.length)];
export function weighted(entries) { // [[valor, peso], ...]
  let t = 0; for (const e of entries) t += e[1];
  let r = rand() * t;
  for (const e of entries) { r -= e[1]; if (r < 0) return e[0]; }
  return entries[entries.length - 1][0];
}
export function seeded(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const DAY = 864e5;
const localDays = (now) => Math.floor((now - new Date(now).getTimezoneOffset() * 6e4) / DAY);
export const dayIndex = (now) => localDays(now);
export const weekIndex = (now) => Math.floor((localDays(now) + 3) / 7); // semanas começam na segunda
export const weekEnd = (now) => ((weekIndex(now) + 1) * 7 - 3) * DAY + new Date(now).getTimezoneOffset() * 6e4;
export const dayEnd = (now) => (localDays(now) + 1) * DAY + new Date(now).getTimezoneOffset() * 6e4;

export function mkItem(s, id, extra) {
  itemDef(id); // valida
  return { id, u: ++s.seq, ...extra };
}

function parseBoard(s, rows) {
  const cells = [];
  for (const row of rows) for (const tok of row.split(/\s+/)) {
    if (tok === '.') cells.push(null);
    else if (tok.startsWith('G:')) cells.push(mkItem(s, 'gen:' + tok.slice(2)));
    else if (tok.startsWith('x:')) cells.push(mkItem(s, tok.slice(2), { covered: 1 }));
    else if (tok.startsWith('l:')) cells.push(mkItem(s, tok.slice(2), { locked: 1 }));
    else cells.push(mkItem(s, tok));
  }
  return cells;
}

export function newGame(now = Date.now()) {
  const s = {
    v: CFG.saveVersion, createdAt: now, lastSeen: now, seq: 0,
    player: { name: 'Dakota', hair: '#ff5fa2', skin: '#f7cdb0', lvl: 1, xp: 0 },
    wallet: { ...CFG.start },
    energy: { cur: CFG.energy.max, ts: now },
    boards: {},
    inv: { slots: CFG.inventory.start, items: [] },
    inbox: [],
    gens: {},
    discovered: {},
    orders: { active: [], seq: 0, streak: 0, lastTs: 0, nextTs: 0, uid: 0, day: -1, week: -1 },
    village: {},
    story: { seen: [], queue: [], choices: {}, rel: {} },
    daily: { loginDay: -1, loginStreak: 0, day: -1, base: {}, claimed: {}, week: -1, wbase: {}, wclaimed: {} },
    fest: { week: -1, pts: 0, claimed: {}, tickets: { cur: FESTIVAL.tickets.max, ts: now } },
    hunt: { shovels: HUNT.shovelsStart, map: 1, dug: {}, found: 0 },
    album: {}, albumClaimed: {},
    ach: {},
    stats: { merges: 0, deliveries: 0, generated: 0, sold: 0, coinsEarned: 0, chests: 0, renovations: 0, discovered: 0, treasures: 0, bestStreak: 0 },
    undo: null,
    settings: { sfx: true, music: true },
  };
  s.boards.main = { w: CFG.board.w, h: CFG.board.h, pool: 'energy', cells: parseBoard(s, CFG.initialBoard) };
  for (const c of s.boards.main.cells) if (c) { if (!c.covered) discover(s, c.id); }
  for (const [g, def] of Object.entries(GENERATORS)) if (def.unlock <= 1) s.gens[g] = { lvl: 1 };
  s.story.queue.push('intro');
  return s;
}

export function discover(s, id) {
  if (s.discovered[id]) return false;
  s.discovered[id] = 1;
  s.stats.discovered++;
  bus.emit('discover', { id });
  return true;
}

// ---- Reservas com regeneração (energia e fichas de evento) ----
export function poolOf(s, key) {
  if (key === 'tickets') return { pool: s.fest.tickets, max: FESTIVAL.tickets.max, regenMs: FESTIVAL.tickets.regenMs };
  return { pool: s.energy, max: CFG.energy.max, regenMs: CFG.energy.regenMs };
}
export function regen(s, key, now) {
  const { pool, max, regenMs } = poolOf(s, key);
  if (pool.cur >= max) { pool.ts = now; return pool.cur; }
  const n = Math.floor((now - pool.ts) / regenMs);
  if (n > 0) { pool.cur = Math.min(max, pool.cur + n); pool.ts = pool.cur >= max ? now : pool.ts + n * regenMs; }
  return pool.cur;
}
export function nextRegenIn(s, key, now) {
  const { pool, max, regenMs } = poolOf(s, key);
  return pool.cur >= max ? 0 : Math.max(0, pool.ts + regenMs - now);
}
export function spend(s, key, n, now) {
  const { pool, max } = poolOf(s, key);
  regen(s, key, now);
  if (pool.cur < n) return false;
  if (pool.cur >= max && pool.cur - n < max) pool.ts = now;
  pool.cur -= n;
  return true;
}

// ---- Recompensas ----
/** Concede uma recompensa genérica. Itens vão para a caixa de entrada. */
export function grant(s, r, now = Date.now()) {
  if (!r) return;
  if (r.coins) { s.wallet.coins += r.coins; s.stats.coinsEarned += r.coins; }
  if (r.gems) s.wallet.gems += r.gems;
  if (r.stars) s.wallet.stars += r.stars;
  if (r.comps) s.wallet.comps += r.comps;
  if (r.energy) { regen(s, 'energy', now); s.energy.cur += r.energy; }
  if (r.tickets) { regen(s, 'tickets', now); s.fest.tickets.cur += r.tickets; }
  if (r.shovels) s.hunt.shovels += r.shovels;
  if (r.items) for (const id of r.items) s.inbox.push(id);
  if (r.cards) giveCards(s, r.cards);
  if (r.xp) addXp(s, r.xp, now);
}

export function addXp(s, n, now = Date.now()) {
  s.player.xp += n;
  while (s.player.xp >= CFG.xpForLevel(s.player.lvl)) {
    s.player.xp -= CFG.xpForLevel(s.player.lvl);
    s.player.lvl++;
    const lvl = s.player.lvl;
    const reward = { gems: CFG.levelUp.gems, coins: CFG.levelUp.coins + lvl * 10, items: [] };
    if (lvl % CFG.levelUp.chestEvery === 0) reward.items.push(lvl >= 8 ? 'bau:3' : lvl >= 4 ? 'bau:2' : 'bau:1');
    const unlocked = [];
    for (const [g, def] of Object.entries(GENERATORS)) {
      if (!def.event && def.unlock <= lvl && !s.gens[g]) { s.gens[g] = { lvl: 1 }; reward.items.push('gen:' + g); unlocked.push(g); }
    }
    regen(s, 'energy', now);
    s.energy.cur = Math.max(s.energy.cur, CFG.energy.max);
    grant(s, reward, now);
    if (LEVEL_SCENES[lvl]) s.story.queue.push(LEVEL_SCENES[lvl]);
    bus.emit('levelup', { lvl, reward, unlocked });
  }
}

export function rewardText(r) {
  const p = [];
  if (r.coins) p.push(`🪙 ${r.coins}`);
  if (r.gems) p.push(`💎 ${r.gems}`);
  if (r.stars) p.push(`⭐ ${r.stars}`);
  if (r.xp) p.push(`✨ ${r.xp} XP`);
  if (r.energy) p.push(`⚡ ${r.energy}`);
  if (r.comps) p.push(`🧩 ${r.comps}`);
  if (r.shovels) p.push(`⛏️ ${r.shovels}`);
  if (r.tickets) p.push(`🎟️ ${r.tickets}`);
  if (r.cards) p.push(`🎴 ${r.cards}`);
  if (r.items) for (const id of r.items) p.push(itemDef(id).icon);
  return p.join('  ');
}

// ---- Cartas do álbum e pontos de festival (usados por várias partes do motor) ----
export function giveCards(s, n) {
  const all = ALBUM.flatMap((a) => a.cards.map((_, i) => `${a.id}:${i}`));
  const got = [];
  for (let k = 0; k < n; k++) {
    const missing = all.filter((c) => !s.album[c]);
    const c = missing.length && rand() < 0.6 ? pick(missing) : pick(all);
    if (s.album[c]) { s.album[c]++; s.wallet.coins += 20; got.push({ c, dup: true }); } else { s.album[c] = 1; got.push({ c }); }
  }
  bus.emit('cards', { got });
  return got;
}
export function ensureFest(s, now) {
  const w = weekIndex(now);
  if (s.fest.week !== w) { s.fest.week = w; s.fest.pts = 0; s.fest.claimed = {}; delete s.boards.event; }
}
export function addFestPts(s, n, now) { ensureFest(s, now); s.fest.pts += n; }
