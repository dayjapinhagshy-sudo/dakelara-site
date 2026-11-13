// Meta-jogo: vila e reformas, história, oficina, loja, missões, festival, caça ao tesouro, álbum, conquistas.
import { CFG, SHOP, ACHIEVEMENTS, LOGIN_REWARDS, TASK_POOL, FESTIVALS, FESTIVAL, HUNT } from '../data/config.js';
import { GENERATORS, CHAINS } from '../data/items.js';
import { AREAS, STYLES, SCENES, ALBUM } from '../data/world.js';
import { bus, grant, mkItem, seeded, dayIndex, weekIndex, weekEnd, ensureFest } from './core.js';

const fail = (why) => ({ ok: false, why });
const canPay = (s, price) => Object.entries(price).every(([k, v]) => s.wallet[k] >= v);
const pay = (s, price) => { for (const [k, v] of Object.entries(price)) s.wallet[k] -= v; };

// ---- Vila ----
export const STATUS_NAMES = { abandonado: 'Abandonado', limpo: 'Limpo', reformado: 'Em reforma', decorado: 'Decorado' };
export function areaInfo(s, id) {
  const a = AREAS.find((x) => x.id === id);
  const st = s.village[id] || { step: 0, choices: {} };
  const total = a.steps.length;
  const status = st.step === 0 ? 'abandonado' : st.step >= total ? 'decorado' : st.step === 1 ? 'limpo' : 'reformado';
  return { a, step: st.step, total, choices: st.choices, status, unlocked: s.player.lvl >= a.lvl, next: a.steps[st.step] || null };
}
export function doStep(s, id, style, now = Date.now()) {
  const info = areaInfo(s, id);
  if (!info.unlocked) return fail('nivel');
  const next = info.next;
  if (!next) return fail('completo');
  if (next.choice && !STYLES[style]) return fail('estilo');
  if (s.wallet.stars < next.stars) return fail('estrelas');
  s.wallet.stars -= next.stars;
  const st = s.village[id] || (s.village[id] = { step: 0, choices: {} });
  st.step++;
  if (next.choice) st.choices[next.choice] = style;
  s.stats.renovations++;
  if (next.scene && !s.story.seen.includes(next.scene)) s.story.queue.push(next.scene);
  const reward = { xp: 8 + next.stars * 2, coins: next.stars * 10 };
  grant(s, reward, now);
  bus.emit('renovate', { id, step: next.id });
  return { ok: true, step: next, reward, scene: next.scene };
}
/** Troca gratuita de um estilo já escolhido (a escolha altera o cenário e fica salva). */
export function setChoice(s, id, key, style) {
  const st = s.village[id];
  if (!st || !(key in st.choices) || !STYLES[style]) return fail('estilo');
  st.choices[key] = style;
  return { ok: true };
}
export function villageProgress(s) {
  let done = 0, total = 0;
  for (const a of AREAS) { total += a.steps.length; done += (s.village[a.id] || { step: 0 }).step; }
  return { done, total };
}

// ---- História ----
export const nextScene = (s) => s.story.queue[0] || null;
export function finishScene(s, id) {
  s.story.queue = s.story.queue.filter((x) => x !== id);
  if (!s.story.seen.includes(id)) s.story.seen.push(id);
}
export function choose(s, sceneId, lineIdx, opt) {
  const line = SCENES[sceneId].lines[lineIdx];
  if (!line || !line.escolha || !line.escolha[opt]) return fail('nada');
  const key = `${sceneId}:${lineIdx}`;
  if (s.story.choices[key] == null) { // relacionamento só conta na primeira vez
    s.story.choices[key] = opt;
    for (const [c, n] of Object.entries(line.escolha[opt].rel || {})) s.story.rel[c] = (s.story.rel[c] || 0) + n;
  }
  return { ok: true, resp: line.escolha[opt].resp };
}
export function setPlayer(s, { name, hair, skin }) {
  if (typeof name === 'string' && name.trim()) s.player.name = name.trim().slice(0, 14);
  if (hair) s.player.hair = hair;
  if (skin) s.player.skin = skin;
}

// ---- Oficina Dakota ----
export function upgradeInfo(s, type) {
  const g = GENERATORS[type], lvl = s.gens[type] ? s.gens[type].lvl : 0;
  return { g, lvl, max: g.levels.length, cost: lvl ? CFG.genUpgrade[lvl] || null : null };
}
export function upgradeGen(s, type) {
  const { lvl, cost } = upgradeInfo(s, type);
  if (!lvl) return fail('bloqueado');
  if (!cost) return fail('max');
  if (!canPay(s, cost)) return fail(s.wallet.comps < cost.comps ? 'pecas' : 'moedas');
  pay(s, cost);
  s.gens[type].lvl++;
  bus.emit('upgrade', { type, lvl: s.gens[type].lvl });
  return { ok: true, lvl: s.gens[type].lvl };
}

// ---- Loja ----
export function buy(s, id, now = Date.now()) {
  const it = SHOP.find((x) => x.id === id);
  if (!it) return fail('nada');
  if (!canPay(s, it.price)) return fail(it.price.gems ? 'gemas' : 'moedas');
  pay(s, it.price);
  grant(s, it.give, now);
  return { ok: true, item: it };
}

// ---- Login diário ----
export function loginState(s, now = Date.now()) {
  const today = dayIndex(now), D = s.daily;
  const idx = (D.loginDay === today - 1 || D.loginDay === today ? D.loginStreak : 0) % LOGIN_REWARDS.length;
  return { canClaim: D.loginDay !== today, idx: D.loginDay === today ? (D.loginStreak - 1 + LOGIN_REWARDS.length) % LOGIN_REWARDS.length : idx, claimedToday: D.loginDay === today };
}
export function claimLogin(s, now = Date.now()) {
  const st = loginState(s, now);
  if (!st.canClaim) return fail('feito');
  const reward = LOGIN_REWARDS[st.idx];
  s.daily.loginStreak = st.idx + 1;
  s.daily.loginDay = dayIndex(now);
  grant(s, reward, now);
  return { ok: true, reward, day: st.idx + 1 };
}

// ---- Missões diárias e semanais ----
function pickTasks(pool, seed, n) {
  const r = seeded(seed), arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr.slice(0, n);
}
export function tasks(s, scope, now = Date.now()) {
  const D = s.daily, daily = scope === 'daily';
  const idx = daily ? dayIndex(now) : weekIndex(now);
  const [kI, kB, kC] = daily ? ['day', 'base', 'claimed'] : ['week', 'wbase', 'wclaimed'];
  if (D[kI] !== idx) { D[kI] = idx; D[kB] = { ...s.stats }; D[kC] = {}; }
  return pickTasks(TASK_POOL[scope], idx * 31 + (daily ? 1 : 2), 3).map((t) => {
    const prog = Math.min(t.n, (s.stats[t.stat] || 0) - (D[kB][t.stat] || 0));
    return { ...t, text: t.text.replace('{n}', t.n), prog, done: prog >= t.n, claimed: !!D[kC][t.id] };
  });
}
export function claimTask(s, scope, id, now = Date.now()) {
  const t = tasks(s, scope, now).find((x) => x.id === id);
  if (!t || !t.done || t.claimed) return fail('nada');
  s.daily[scope === 'daily' ? 'claimed' : 'wclaimed'][id] = 1;
  grant(s, t.reward, now);
  return { ok: true, reward: t.reward };
}

// ---- Festival semanal (pontos, marcos gratuitos, placar local simulado, tabuleiro de evento) ----
export function festState(s, now = Date.now()) {
  ensureFest(s, now);
  const w = weekIndex(now), def = FESTIVALS[((w % FESTIVALS.length) + FESTIVALS.length) % FESTIVALS.length];
  const end = weekEnd(now), frac = 1 - Math.max(0, end - now) / (7 * 864e5);
  const r = seeded(w * 977);
  const rank = FESTIVAL.bots.map(([name, f]) => ({ name, pts: Math.round(FESTIVAL.botMax * f * Math.pow(frac, 0.9) * (0.85 + 0.3 * r())) }));
  rank.push({ name: s.player.name, pts: s.fest.pts, me: true });
  rank.sort((a, b) => b.pts - a.pts);
  return { def, pts: s.fest.pts, end, rank, milestones: FESTIVAL.milestones.map((m, i) => ({ ...m, i, reached: s.fest.pts >= m.pts, claimed: !!s.fest.claimed[i] })) };
}
export function claimMilestone(s, i, now = Date.now()) {
  const m = festState(s, now).milestones[i];
  if (!m || !m.reached || m.claimed) return fail('nada');
  s.fest.claimed[i] = 1;
  grant(s, m.reward, now);
  return { ok: true, reward: m.reward };
}
export function ensureEventBoard(s, now = Date.now()) {
  ensureFest(s, now);
  if (!s.boards.event) {
    const { w, h } = FESTIVAL.board;
    const cells = Array(w * h).fill(null);
    cells[Math.floor((w * h) / 2)] = mkItem(s, 'gen:festa');
    s.boards.event = { w, h, pool: 'tickets', cells };
  }
  return s.boards.event;
}

// ---- Caça ao tesouro (energia própria: pás) ----
function huntMap(s) {
  const r = seeded((s.createdAt % 1e9) + s.hunt.map * 7919);
  const n = HUNT.size * HUNT.size, tre = new Set();
  while (tre.size < HUNT.treasures) tre.add(Math.floor(r() * n));
  const finds = [];
  for (let i = 0; i < n; i++) { let t = 0; const x = r() * HUNT.finds.reduce((a, e) => a + e[1], 0); let f = 'nada'; for (const e of HUNT.finds) { t += e[1]; if (x < t) { f = e[0]; break; } } finds.push(f); }
  return { tre: [...tre], finds };
}
export function huntState(s) {
  const m = huntMap(s);
  return { size: HUNT.size, shovels: s.hunt.shovels, found: s.hunt.found, total: HUNT.treasures, map: s.hunt.map, dug: s.hunt.dug, _m: m };
}
export function dig(s, i, now = Date.now()) {
  const H = s.hunt;
  if (H.dug[i]) return fail('feito');
  if (H.shovels < 1) return fail('pas');
  const m = huntMap(s), n = HUNT.size;
  H.shovels--;
  if (m.tre.includes(i)) {
    H.dug[i] = { t: 'tesouro' };
    H.found++;
    if (H.found >= HUNT.treasures) {
      s.stats.treasures++;
      grant(s, HUNT.prize, now);
      H.map++; H.dug = {}; H.found = 0;
      return { ok: true, t: 'tesouro', complete: true, reward: HUNT.prize };
    }
    return { ok: true, t: 'tesouro' };
  }
  const left = m.tre.filter((t) => !H.dug[t]);
  const dist = Math.min(...left.map((t) => Math.abs((t % n) - (i % n)) + Math.abs(Math.floor(t / n) - Math.floor(i / n))));
  const f = m.finds[i];
  H.dug[i] = { t: f, d: dist };
  if (f !== 'nada') grant(s, { [f]: HUNT.findAmount[f] }, now);
  return { ok: true, t: f, dist, amount: HUNT.findAmount[f] };
}

// ---- Álbum, coleções de famílias e conquistas ----
export function albumState(s) {
  return ALBUM.map((a) => {
    const cards = a.cards.map(([icon, name], i) => ({ icon, name, n: s.album[`${a.id}:${i}`] || 0 }));
    const have = cards.filter((c) => c.n).length;
    return { ...a, cards, have, complete: have === cards.length, claimed: !!s.albumClaimed[a.id] };
  });
}
export function claimAlbum(s, id, now = Date.now()) {
  const a = albumState(s).find((x) => x.id === id);
  if (!a || !a.complete || a.claimed) return fail('nada');
  s.albumClaimed[id] = 1;
  grant(s, a.reward, now);
  return { ok: true, reward: a.reward };
}
export const FAMILY_REWARD = { gems: 10 };
export function familyState(s, chain) {
  const c = CHAINS[chain];
  const have = c.items.filter((_, i) => s.discovered[`${chain}:${i + 1}`]).length;
  return { have, total: c.items.length, complete: have === c.items.length, claimed: !!s.ach['fam:' + chain] };
}
export function claimFamily(s, chain, now = Date.now()) {
  const f = familyState(s, chain);
  if (!f.complete || f.claimed) return fail('nada');
  s.ach['fam:' + chain] = 1;
  grant(s, FAMILY_REWARD, now);
  return { ok: true, reward: FAMILY_REWARD };
}
export function achState(s) {
  return ACHIEVEMENTS.map((a) => ({ ...a, prog: Math.min(a.goal, s.stats[a.stat] || 0), done: (s.stats[a.stat] || 0) >= a.goal, claimed: !!s.ach[a.id] }));
}
export function claimAch(s, id, now = Date.now()) {
  const a = achState(s).find((x) => x.id === id);
  if (!a || !a.done || a.claimed) return fail('nada');
  s.ach[id] = 1;
  grant(s, a.reward, now);
  return { ok: true, reward: a.reward };
}
/** Quantas recompensas estão esperando para serem coletadas (para o aviso no menu). */
export function pendingClaims(s, now = Date.now()) {
  let n = loginState(s, now).canClaim ? 1 : 0;
  n += tasks(s, 'daily', now).filter((t) => t.done && !t.claimed).length;
  n += tasks(s, 'weekly', now).filter((t) => t.done && !t.claimed).length;
  n += festState(s, now).milestones.filter((m) => m.reached && !m.claimed).length;
  return n;
}
