// Pedidos e clientes — máquina de estados: aguardando ⇄ pronto → entregue | expirado
import { CFG, FESTIVAL, HUNT } from '../data/config.js';
import { CHAINS, CHAIN_GEN, itemDef } from '../data/items.js';
import { ORDERS, ORDER_LINES, CUSTOMERS } from '../data/world.js';
import { bus, rand, pick, grant, addFestPts, dayIndex, weekIndex, dayEnd, weekEnd } from './core.js';
import { countFree, removeFree } from './board.js';

export const TRANSITIONS = {
  aguardando: ['pronto', 'expirado'],
  pronto: ['aguardando', 'entregue', 'expirado'],
  entregue: [],
  expirado: [],
};
export function transition(o, to) {
  if (o.state === to) return o;
  if (!TRANSITIONS[o.state].includes(to)) throw new Error(`Transição inválida de pedido: ${o.state} → ${to}`);
  o.state = to;
  return o;
}

const MULT = { normal: 1, tempo: 1.5, vip: 2, diario: 2.5, semanal: 4 };
export function rewardFor(need, kind = 'normal') {
  let val = 0, work = 0;
  for (const [id, n] of need) { const d = itemDef(id); val += d.value * n; work += Math.pow(2, d.level - 1) * n; }
  const m = MULT[kind] || 1;
  const r = { coins: Math.round(val * 1.3 * m + 5), xp: Math.round((work * 1.2 + 3) * m), stars: Math.max(1, Math.round((work / 5) * m)) };
  if (kind === 'vip' || kind === 'semanal') r.cards = 1;
  if (kind === 'diario') r.gems = 2;
  if (kind === 'semanal') r.gems = 6;
  return r;
}

const unlockedChains = (s) => Object.keys(CHAINS).filter((c) => CHAINS[c].kind === 'item' && !CHAINS[c].event && s.gens[CHAIN_GEN[c]]);

function proceduralNeed(s, big = 0) {
  const lvl = s.player.lvl;
  const chains = unlockedChains(s);
  const count = 1 + (rand() < 0.5 ? 1 : 0) + (big && rand() < 0.6 ? 1 : 0);
  const hi = Math.min(7, 2 + Math.floor(lvl / 2) + big);
  const need = [], used = new Set();
  for (let k = 0; k < count; k++) {
    const c = pick(chains.filter((x) => !used.has(x)));
    if (!c) break;
    used.add(c);
    const lv = Math.min(CHAINS[c].items.length, 2 + Math.floor(rand() * (hi - 1)));
    need.push([`${c}:${lv}`, lv <= 2 && rand() < 0.3 ? 2 : 1]);
  }
  return need;
}

function mkOrder(s, { who, need, kind = 'normal', line, expires }, now) {
  const o = { uid: ++s.orders.uid, who, need, kind, line: line || pick(ORDER_LINES[who]), state: 'aguardando', reward: rewardFor(need, kind) };
  if (kind === 'tempo') o.expires = now + CFG.orders.timedMs;
  if (expires) o.expires = expires;
  return o;
}

function nextOrder(s, now) {
  const tpl = ORDERS[s.orders.seq];
  if (tpl && tpl.lvl <= s.player.lvl && tpl.need.every(([id]) => s.gens[CHAIN_GEN[itemDef(id).chain]])) {
    s.orders.seq++;
    return mkOrder(s, tpl, now);
  }
  const r = rand();
  const kind = r < CFG.orders.vipChance ? 'vip' : r < CFG.orders.vipChance + CFG.orders.timedChance ? 'tempo' : 'normal';
  const busy = new Set(s.orders.active.map((o) => o.who));
  const who = pick(CUSTOMERS.filter((c) => !busy.has(c))) || pick(CUSTOMERS);
  return mkOrder(s, { who, need: proceduralNeed(s, kind === 'vip' ? 1 : 0), kind }, now);
}

export const maxActive = (s) => (s.player.lvl >= 5 ? CFG.orders.maxActiveLvl5 : CFG.orders.maxActive);

/** Atualiza estados, expira pedidos com prazo e cria novos. Devolve true se algo mudou. */
export function refresh(s, now = Date.now()) {
  const O = s.orders;
  let changed = false;
  const have = countFree(s.boards.main);
  for (const o of O.active) {
    if (o.expires && now >= o.expires) { transition(o, 'expirado'); changed = true; bus.emit('orderExpired', o); continue; }
    const ready = o.need.every(([id, n]) => (have[id] || 0) >= n);
    const to = ready ? 'pronto' : 'aguardando';
    if (o.state !== to) { transition(o, to); changed = true; }
  }
  const before = O.active.length;
  O.active = O.active.filter((o) => o.state !== 'expirado' && o.state !== 'entregue');
  if (O.active.length !== before) { changed = true; O.nextTs = Math.max(O.nextTs, now + CFG.orders.respawnMs); }
  const regular = () => O.active.filter((o) => o.kind !== 'diario' && o.kind !== 'semanal').length;
  while (regular() < maxActive(s) && now >= O.nextTs) {
    O.active.push(nextOrder(s, now));
    changed = true;
    if (regular() < maxActive(s) && O.uid > maxActive(s)) { O.nextTs = now + CFG.orders.respawnMs; }
  }
  // Pedido especial do dia e da semana (a partir do nível 2 / 4)
  if (s.player.lvl >= 2 && O.day !== dayIndex(now)) {
    O.day = dayIndex(now);
    O.active = O.active.filter((o) => o.kind !== 'diario');
    O.active.push(mkOrder(s, { who: 'matilde', need: proceduralNeed(s, 1), kind: 'diario', line: 'Pedido especial do dia, minha flor!', expires: dayEnd(now) }, now));
    changed = true;
  }
  if (s.player.lvl >= 4 && O.week !== weekIndex(now)) {
    O.week = weekIndex(now);
    O.active = O.active.filter((o) => o.kind !== 'semanal');
    const need = proceduralNeed(s, 2);
    O.active.push(mkOrder(s, { who: 'rafael', need, kind: 'semanal', line: 'Encomenda da semana para o banquete da vila!', expires: weekEnd(now) }, now));
    changed = true;
  }
  if (changed) for (const o of O.active) { // reavalia os recém-criados
    if (o.state === 'aguardando' && o.need.every(([id, n]) => (have[id] || 0) >= n)) transition(o, 'pronto');
  }
  return changed;
}

export function streakBonus(s, now) {
  const O = s.orders;
  const alive = now - O.lastTs <= CFG.orders.streakWindowMs;
  return alive ? Math.min(CFG.orders.streakMax, O.streak) : 0;
}

export function deliver(s, uid, now = Date.now()) {
  const O = s.orders;
  const o = O.active.find((x) => x.uid === uid);
  if (!o) return { ok: false, why: 'nada' };
  refresh(s, now);
  if (o.state !== 'pronto') return { ok: false, why: 'incompleto' };
  const b = s.boards.main;
  for (const [id, n] of o.need) removeFree(b, id, n);
  const streak = streakBonus(s, now);
  const reward = { ...o.reward, coins: Math.round(o.reward.coins * (1 + streak * CFG.orders.streakStep)) };
  O.streak = streak + 1; O.lastTs = now;
  s.stats.deliveries++;
  s.stats.bestStreak = Math.max(s.stats.bestStreak, O.streak);
  transition(o, 'entregue');
  O.active = O.active.filter((x) => x !== o);
  O.nextTs = now + CFG.orders.respawnMs;
  s.story.rel[o.who] = (s.story.rel[o.who] || 0) + (o.kind === 'vip' ? 2 : 1);
  grant(s, reward, now);
  grant(s, { shovels: HUNT.shovelPerDelivery, tickets: FESTIVAL.ticketsPerDelivery }, now);
  addFestPts(s, reward.stars, now);
  bus.emit('deliver', { order: o, reward, streak: O.streak });
  refresh(s, now);
  return { ok: true, type: 'deliver', order: o, reward, streak: O.streak };
}
