// Aplicação: gerenciador de cenas (menu, tabuleiro, vila), HUD, diálogos, entrada e salvamento automático.
import { CFG, FESTIVAL } from '../data/config.js';
import { CHAINS, GENERATORS, itemDef } from '../data/items.js';
import { CHARACTERS, SCENES, CHAPTERS, AREAS } from '../data/world.js';
import { bus, newGame, regen, nextRegenIn, rewardText } from '../engine/core.js';
import * as B from '../engine/board.js';
import * as O from '../engine/orders.js';
import * as M from '../engine/meta.js';
import * as Save from '../engine/save.js';
import { portrait, villageSvg, sceneBg, titleArt, iso } from './art.js';
import { sfx, setAudio, unlockAudio } from './audio.js';
import { PANELS } from './panels.js';
import { $, $$, esc, fmt, timer, ico, bar, itemFace } from './util.js';
import { loadManifest, sceneryArt } from './assets.js';

const G = { s: null, scene: 'menu', bk: 'main', sel: -1, modal: null, dlg: null, drag: null, isNew: false, started: false, popups: [], dirty: false, enter: false };
window.__dakota = G; // para depuração e testes de interface
const now = () => Date.now();
const RARITY = ['Comum', 'Raro', 'Especial', 'Lendário'];
const FAIL = {
  energia: '⚡ Sem energia! Ela recarrega com o tempo — ou passe na loja.', fichas: '🎟️ Sem fichas! Entregue pedidos para ganhar mais.', cheio: 'Tabuleiro cheio! Combine, venda ou guarde itens.',
  recarga: '⏳ Gerador recarregando…', auto: 'Este gerador produz sozinho com o tempo.', preso: '🔒 Este item está preso.', bloqueado: 'Esse item não pode ser trocado de lugar.',
  gemas: '💎 Gemas insuficientes.', moedas: '🪙 Moedas insuficientes.', inventario: '🎒 Inventário cheio.', evento: 'Itens de evento ficam no tabuleiro do evento.', gerador: 'Geradores não podem ser vendidos.',
  estrelas: '⭐ Estrelas insuficientes. Entregue pedidos!', pecas: '🧩 Faltam peças de oficina.', pas: '⛏️ Sem pás! Entregue pedidos para ganhar mais.', incompleto: 'Ainda faltam itens para este pedido.', nivel: '🔒 Ainda bloqueado.',
};

// ---------- Toasts e efeitos ----------
function toast(html, cls = '') {
  const box = $('#toasts');
  while (box.children.length >= 3) box.firstChild.remove();
  const el = document.createElement('div');
  el.className = 'toast ' + cls; el.innerHTML = html;
  box.append(el);
  setTimeout(() => el.remove(), 2600);
}
const cellEl = (i) => $(`.cell[data-i="${i}"]`);
function burst(el, chars = ['✨', '⭐', '💫'], n = 8) {
  if (!el) return;
  const r = el.getBoundingClientRect(), fx = $('#fx');
  for (let k = 0; k < n; k++) {
    const p = document.createElement('span');
    const ang = (k / n) * Math.PI * 2 + Math.random();
    p.className = 'pt'; p.textContent = chars[k % chars.length];
    p.style.left = r.left + r.width / 2 + 'px'; p.style.top = r.top + r.height / 2 + 'px';
    p.style.setProperty('--dx', Math.cos(ang) * (30 + Math.random() * 30) + 'px');
    p.style.setProperty('--dy', Math.sin(ang) * (30 + Math.random() * 30) + 'px');
    fx.append(p); setTimeout(() => p.remove(), 700);
  }
}
function floatText(el, text) {
  if (!el) return;
  const r = el.getBoundingClientRect(), p = document.createElement('span');
  p.className = 'float'; p.textContent = text;
  p.style.left = r.left + r.width / 2 + 'px'; p.style.top = r.top + 'px';
  $('#fx').append(p); setTimeout(() => p.remove(), 1000);
}
function animate(i, cls) { const el = cellEl(i); if (el && el.firstElementChild) el.firstElementChild.classList.add(cls); return el; }

function showFx(r) {
  switch (r.type) {
    case 'merge': { sfx('merge', itemDef(G.s.boards[G.bk].cells[r.i].id).level); burst(animate(r.i, 'pop')); (r.revealed || []).forEach((j) => animate(j, 'reveal')); if (r.bubble >= 0) animate(r.bubble, 'spawn'); if (r.unlocked) toast('🔓 Item liberado!'); break; }
    case 'spawn': sfx('spawn'); animate(r.i, 'spawn'); if (r.chestDone) burst(cellEl(r.i), ['🎉', '✨']); break;
    case 'collect': sfx('coin'); floatText(cellEl(r.i), `+${r.amount} ${{ coins: '🪙', energy: '⚡', gems: '💎', xp: 'XP', comps: '🧩' }[r.res]}`); break;
    case 'sell': sfx('coin'); floatText(cellEl(r.i), r.coins ? `+${r.coins} 🪙` : 'Descartado'); break;
    case 'split': sfx('pop'); animate(r.i, 'spawn'); animate(r.j, 'spawn'); break;
    case 'boost': sfx('level'); burst(cellEl(r.i), ['⚡', '✨']); break;
    case 'pop': sfx('pop'); burst(animate(r.i, 'pop'), ['🫧', '✨']); break;
    case 'unlock': sfx('pop'); burst(animate(r.i, 'pop'), ['🔓', '✨']); break;
    case 'undo': sfx('page'); animate(r.i, 'spawn'); break;
    case 'move': case 'swap': sfx('tap'); break;
    default: break;
  }
}

/** Finaliza uma ação do motor: trata falhas, atualiza pedidos, redesenha e toca efeitos. */
function commit(r, { quiet = false } = {}) {
  if (!r) return r;
  if (r.ok === false) { if (FAIL[r.why] && !quiet) { toast(FAIL[r.why], 'warn'); sfx('error'); } return r; }
  O.refresh(G.s, now());
  G.dirty = true;
  render();
  showFx(r);
  flow();
  return r;
}

// ---------- HUD ----------
function pill(icon, value, extra = '', act = '') {
  return `<button class="pill" ${act}><span>${icon}</span><b>${value}</b>${extra}</button>`;
}
function hud() {
  const s = G.s, p = s.player, t = now(), ev = G.scene === 'board' && G.bk === 'event';
  const need = CFG.xpForLevel(p.lvl), key = ev ? 'tickets' : 'energy';
  const cur = regen(s, key, t), max = ev ? FESTIVAL.tickets.max : CFG.energy.max, wait = nextRegenIn(s, key, t);
  return `<header class="hud"><button class="avatar" data-act="modal" data-name="perfil" aria-label="Perfil">${portrait('dakota', 'feliz', p)}<b class="lvl">${p.lvl}</b></button>
    <div class="hud-main"><div class="xp" title="Experiência"><i style="width:${(p.xp / need) * 100}%"></i><span>${esc(p.name)} · ${p.xp}/${need} XP</span></div>
    <div class="pills">${pill(ev ? '🎟️' : '⚡', `${cur}/${max}`, wait ? `<small>${timer(t + wait, t)}</small>` : '', 'data-act="modal" data-name="loja"')}${pill('🪙', s.wallet.coins, '', 'data-act="modal" data-name="loja"')}${pill('💎', s.wallet.gems, '', 'data-act="modal" data-name="loja"')}${pill('⭐', s.wallet.stars, '', 'data-act="go" data-scene="village"')}</div></div></header>`;
}

// ---------- Cena: menu ----------
function menuScene() {
  const s = G.s, claims = G.started || !G.isNew ? M.pendingClaims(s, now()) : 0;
  return `<div class="scene menu">${titleArt(s.player)}
    <h1 class="logo"><span>Dakota</span><span>Vila</span></h1>
    <nav class="menu-btns">
      <button class="mbtn play" data-act="play">${G.isNew ? 'Jogar' : 'Continuar'} ▶</button>
      <button class="mbtn" data-act="menu" data-name="historia">📖 História</button>
      <button class="mbtn" data-act="menu" data-scene="village">🏡 Minha Vila</button>
      <button class="mbtn" data-act="menu" data-name="personagens">👥 Personagens</button>
      <button class="mbtn" data-act="menu" data-name="eventos">🗓️ Eventos${claims ? `<b class="dot">${claims}</b>` : ''}</button>
      <button class="mbtn" data-act="menu" data-name="config">⚙️ Configurações</button>
    </nav></div>`;
}

// ---------- Cena: tabuleiro ----------
function cellHtml(it, i, wanted, t) {
  if (!it) return `<div class="cell" data-i="${i}"></div>`;
  if (it.covered) return `<div class="cell" data-i="${i}"><div class="it crate ${G.sel === i ? 'sel' : ''}"><span class="q">?</span></div></div>`;
  const d = itemDef(it.id);
  let extra = '', cls = `it r${d.rarity}`;
  if (d.kind === 'gen') {
    const st = B.genStatus(G.s, it, t);
    cls += ' gen' + (st.cooling ? ' cooling' : '') + (st.g.mode === 'auto' ? ' auto' : '');
    extra += st.cooling ? `<b class="cd">${timer(it.cd, t)}</b>` : `<b class="chg">${st.g.mode === 'auto' ? '♻️' : '⚡'}${st.charges}</b>`;
  }
  if (d.kind === 'collect') cls += ' collect';
  if (d.kind === 'tool') cls += ' tool';
  if (it.locked) { cls += ' locked'; extra += '<b class="lock">🔒</b>'; }
  if (it.bubble) { cls += ' bubble'; extra += `<b class="cd">${timer(it.bubble, t)}</b>`; }
  if (d.level === d.max && d.max > 1 && d.kind === 'item') extra += '<b class="maxb">★</b>';
  if (wanted[it.id] && B.isFree(it)) extra += '<b class="ok">✓</b>';
  if (it.left != null) extra += `<b class="chg">${it.left}</b>`;
  if (G.sel === i) cls += ' sel';
  return `<div class="cell" data-i="${i}"><div class="${cls}">${itemFace(it.id)}${extra}</div></div>`;
}

function orderCard(o, have, t) {
  const c = CHARACTERS[o.who], ready = o.state === 'pronto';
  const kind = { vip: '<b class="kind vip">👑 VIP</b>', tempo: '<b class="kind tempo">⏳ Rápido</b>', diario: '<b class="kind dia">📅 Do dia</b>', semanal: '<b class="kind sem">🗓️ Da semana</b>' }[o.kind] || '';
  return `<article class="order ${ready ? 'ready' : ''} ${o.kind}" data-act="orderinfo" data-uid="${o.uid}">
    <div class="who">${portrait(o.who, ready ? 'rindo' : 'neutro', G.s.player)}<small>${c.name.split(' ').pop()}</small></div>
    <div class="ord-main">${kind}${o.expires ? `<small class="exp">${timer(o.expires, t)}</small>` : ''}
      <div class="needs">${o.need.map(([id, n]) => ico(id, { n, check: (have[id] || 0) >= n })).join('')}</div>
      ${ready ? `<button class="btn sm go" data-act="deliver" data-uid="${o.uid}">Entregar</button>` : `<small class="rw">🪙${o.reward.coins} ⭐${o.reward.stars}${o.reward.cards ? ' 🎴' : ''}${o.reward.gems ? ' 💎' + o.reward.gems : ''}</small>`}
    </div></article>`;
}

function infoPanel(t) {
  const s = G.s, b = s.boards[G.bk], it = G.sel >= 0 ? b.cells[G.sel] : null;
  if (!it) {
    const nextArea = AREAS.map((a) => M.areaInfo(s, a.id)).find((x) => x.unlocked && x.next);
    const tip = G.bk === 'event' ? '🎊 Toque na caixa de festa para criar itens e combine-os para somar pontos no festival.'
      : nextArea ? `🔨 Próxima reforma: <b>${nextArea.next.name}</b> (${nextArea.a.name}) — ⭐ ${Math.min(s.wallet.stars, nextArea.next.stars)}/${nextArea.next.stars}` : 'Atenda pedidos e continue evoluindo a vila!';
    const canBuild = G.bk === 'main' && nextArea && s.wallet.stars >= nextArea.next.stars;
    return `<section class="info hint"><p>${tip}</p>${canBuild ? '<button class="btn sm go" data-act="go" data-scene="village">Ir para a vila</button>' : '<button class="btn sm" data-act="modal" data-name="ajuda">Como jogar</button>'}</section>`;
  }
  if (it.covered) return `<section class="info"><div class="it crate mini"><span class="q">?</span></div><div class="info-txt"><b>Caixote fechado</b><small>Faça uma combinação em uma célula ao lado para abri-lo.</small></div></section>`;
  const d = itemDef(it.id);
  let sub, btns = '';
  if (d.kind === 'gen') {
    const st = B.genStatus(s, it, t), lvl = (s.gens[d.gen] && s.gens[d.gen].lvl) || 1;
    sub = `Gerador nível ${lvl} · ${st.g.mode === 'auto' ? 'automático' : `⚡${st.g.energy} por toque`} · ${st.cooling ? `recarrega em ${timer(it.cd, t)}` : `${st.charges}/${st.max} cargas`}`;
    if (!st.g.event) btns = '<button class="btn sm" data-act="modal" data-name="oficina">🔧 Oficina</button>';
  } else {
    sub = `${d.chainName} · Nível ${d.level}/${d.max} · ${RARITY[d.rarity]}`;
    if (d.kind === 'tool') sub = d.desc;
    if (d.kind === 'collect') sub = `Toque de novo para coletar · combine para render mais`;
    if (d.kind === 'chest') sub = `Toque de novo para abrir${it.left != null ? ` · restam ${it.left}` : ''}`;
    if (it.bubble) { sub = `Bolha bônus! Some em ${timer(it.bubble, t)}`; btns = `<button class="btn sm go" data-act="use">Estourar 💎${B.bubbleCost(it)}</button>`; }
    else if (it.locked) { sub += ' · preso'; btns = `<button class="btn sm" data-act="unlock">Soltar 🪙${CFG.unlockCost(d.value)}</button>`; }
    else {
      if (d.kind === 'collect') btns += '<button class="btn sm go" data-act="use">Coletar</button>';
      if (d.kind === 'chest') btns += '<button class="btn sm go" data-act="use">Abrir</button>';
      if (d.kind !== 'collect') btns += `<button class="btn sm" data-act="sell">${d.value ? `Vender 🪙${d.value}` : 'Descartar'}</button>`;
      if (G.bk === 'main') btns += '<button class="btn sm" data-act="store">🎒 Guardar</button>';
    }
  }
  const chain = CHAINS[d.chain] && d.max > 1 ? `<div class="chain">${CHAINS[d.chain].items.map((_, k) => { const id = `${d.chain}:${k + 1}`; return `<span class="${k + 1 === d.level ? 'cur' : ''} ${s.discovered[id] ? '' : 'unk'}">${s.discovered[id] ? itemDef(id).icon : '?'}</span>`; }).join('')}</div>` : '';
  return `<section class="info">${ico(it.id)}<div class="info-txt"><b>${d.name}</b><small>${sub}</small>${chain}</div><div class="info-btns">${btns}</div></section>`;
}

// Barra lateral de atalhos do tabuleiro (como no mockup): mochila, entrada, missões, próxima reforma e loja.
function sideRail(t) {
  const s = G.s;
  const tasks = ['daily', 'weekly'].reduce((n, sc) => n + M.tasks(s, sc, t).filter((x) => x.done && !x.claimed).length, 0);
  const next = AREAS.map((a) => M.areaInfo(s, a.id)).find((x) => x.unlocked && x.next);
  const canBuild = next && s.wallet.stars >= next.next.stars;
  const dot = (n) => (n ? `<b class="dot">${n}</b>` : '');
  return `<nav class="rail" aria-label="Atalhos">
    <button data-act="modal" data-name="inventario" class="bag" title="Inventário"><span>🎒</span><small>${s.inv.items.length}/${s.inv.slots}</small></button>
    <button data-act="inbox" class="${s.inbox.length ? 'pulse' : ''}" title="Caixa de entrada"><span>📬</span>${dot(s.inbox.length)}</button>
    <button data-act="modal" data-name="eventos" data-tab="missoes" title="Missões"><span>📋</span>${dot(tasks)}</button>
    ${next ? `<button data-act="area" data-id="${next.a.id}" class="${canBuild ? 'pulse' : ''}" title="Próxima reforma: ${next.next.name}"><span>⭐</span><small>${Math.min(s.wallet.stars, next.next.stars)}/${next.next.stars}</small></button>`
      : '<button data-act="go" data-scene="village" title="Vila"><span>⭐</span></button>'}
    <button data-act="modal" data-name="loja" title="Loja"><span>🛒</span></button></nav>`;
}

function boardScene() {
  const s = G.s, t = now(), ev = G.bk === 'event';
  if (ev) M.ensureEventBoard(s, t);
  const b = s.boards[G.bk];
  const have = B.countFree(s.boards.main), wanted = {};
  if (!ev) for (const o of s.orders.active) for (const [id] of o.need) wanted[id] = 1;
  let top;
  if (ev) {
    const f = M.festState(s, t), nx = f.milestones.find((m) => !m.reached) || f.milestones.at(-1);
    top = `<section class="evtop"><span class="big-em">${f.def.icon}</span><div><b>${f.def.name}</b><small>⏳ ${timer(f.end, t)}</small>${bar(Math.min(f.pts, nx.pts), nx.pts, `${f.pts}/${nx.pts} pts · próximo: ${rewardText(nx.reward)}`)}</div></section>`;
  } else {
    const streak = O.streakBonus(s, t);
    top = `<section class="orders">${s.orders.active.map((o) => orderCard(o, have, t)).join('') || '<p class="note">Novos clientes a caminho…</p>'}</section>${streak > 0 ? `<div class="streak">🔥 Sequência ×${streak} · +${streak * 10}% moedas</div>` : ''}`;
  }
  const navMain = `<button data-act="go" data-scene="village" class="main"><span>🏝️</span>Vila</button>
    <button data-act="modal" data-name="oficina"><span>🔧</span>Oficina</button>
    <button data-act="modal" data-name="eventos"><span>🎪</span>Eventos${M.pendingClaims(s, t) ? `<b class="dot">${M.pendingClaims(s, t)}</b>` : ''}</button>
    <button data-act="undo" ${s.undo ? '' : 'disabled'}><span>↩️</span>Desfazer</button>`;
  const navEv = `<button data-act="go" data-scene="board" data-bk="main"><span>⬅️</span>Tabuleiro</button><button data-act="modal" data-name="eventos" data-tab="fest"><span>🎁</span>Prêmios</button><button data-act="undo" ${s.undo ? '' : 'disabled'}><span>↩️</span>Desfazer</button>`;
  const fundo = sceneryArt('fundo-tabuleiro'); // fundo 3D do tabuleiro (areas/fundo-tabuleiro.webp)
  return `<div class="scene board ${ev ? 'event' : ''}${fundo ? ' com-fundo' : ''}"${fundo ? ` style="background-image:url('${fundo}')"` : ''}>${hud()}${top}
    <div class="board-mid">${ev ? '' : sideRail(t)}<div class="grid-wrap"><div class="grid" style="--w:${b.w};--h:${b.h}">${b.cells.map((it, i) => cellHtml(it, i, wanted, t)).join('')}</div></div></div>
    ${infoPanel(t)}<nav class="bar">${ev ? navEv : navMain}</nav></div>`;
}

// ---------- Cena: vila ----------
function villageScene() {
  const s = G.s, vp = M.villageProgress(s);
  return `<div class="scene villagescene">${hud()}
    <div class="vtop"><b>🏡 Dakota Vila</b>${bar(vp.done, vp.total, `Reformas ${vp.done}/${vp.total}`)}</div>
    <div class="map">${villageSvg((id) => M.areaInfo(s, id), s.player.lvl)}</div>
    <nav class="bar"><button data-act="go" data-scene="board" data-bk="main" class="main"><span>🧩</span>Tabuleiro</button>
      <button data-act="modal" data-name="historia"><span>📖</span>História</button>
      <button data-act="modal" data-name="personagens"><span>👥</span>Pessoas</button>
      <button data-act="modal" data-name="colecoes"><span>🎴</span>Coleções</button>
      <button data-act="modal" data-name="eventos"><span>🎪</span>Eventos</button>
      <button data-act="go" data-scene="menu"><span>🏠</span>Menu</button></nav></div>`;
}

const SCENE_UI = { menu: menuScene, board: boardScene, village: villageScene };

function render() {
  const app = $('#app');
  const ord = $('.orders'), map = $('.map');
  const keep = { ord: ord ? ord.scrollLeft : 0, map: map ? [map.scrollLeft, map.scrollTop] : null };
  app.innerHTML = SCENE_UI[G.scene]();
  if ($('.orders')) $('.orders').scrollLeft = keep.ord;
  const m2 = $('.map');
  if (m2) {
    if (keep.map) { m2.scrollLeft = keep.map[0]; m2.scrollTop = keep.map[1]; }
    else { // abre centralizado na próxima reforma (ou no restaurante)
      const n = AREAS.map((a) => M.areaInfo(G.s, a.id)).find((x) => x.unlocked && x.next), a = n ? n.a : AREAS[0];
      const [x, y0] = iso(a.pos[0], a.pos[1]), y = y0 - 60 * a.size, f = 1240 / 1600; m2.scrollLeft = x * f - m2.clientWidth / 2; m2.scrollTop = y * f - m2.clientHeight / 2; }
  }
  if (G.enter) { app.firstElementChild.classList.add('enter'); G.enter = false; }
  renderModal();
}

function renderModal() {
  const el = $('#modal'), m = G.modal;
  if (!m) { el.innerHTML = ''; el.dataset.name = ''; return; }
  const same = el.dataset.name === m.name;
  const prev = same && $('.sheet-body') ? $('.sheet-body').scrollTop : 0;
  // redesenhar não pode apagar o que a pessoa está digitando
  const typed = same ? $$('input[id], textarea[id]', el).map((f) => [f.id, f.value, document.activeElement === f, f.selectionStart]) : [];
  syncName();
  const { title, body } = PANELS[m.name](G, m);
  el.innerHTML = `<div class="backdrop" data-act="close"></div><section class="sheet" role="dialog" aria-label="${esc(title)}"><header><h2>${title}</h2><button class="x" data-act="close" aria-label="Fechar">✕</button></header><div class="sheet-body">${body}</div></section>`;
  el.dataset.name = m.name;
  $('.sheet-body').scrollTop = prev;
  for (const [id, value, focused, pos] of typed) {
    const f = document.getElementById(id);
    if (!f) continue;
    f.value = value;
    if (focused) { f.focus(); try { f.setSelectionRange(pos, pos); } catch { /* alguns tipos não suportam */ } }
  }
}

// ---------- Diálogos ----------
function startDialog(id, replay = false) { G.dlg = { id, i: 0, replay, resp: null }; sfx('page'); renderDialog(); }
function renderDialog() {
  const el = $('#dialog'), d = G.dlg;
  if (!d) { el.innerHTML = ''; return; }
  const sc = SCENES[d.id], line = d.resp || sc.lines[d.i], p = G.s.player;
  const ch = CHAPTERS.find((c) => c.id === sc.cap);
  let who = 'dakota', expr = 'neutro', box;
  if (Array.isArray(line)) {
    [who, expr] = line;
    box = `<b class="dlg-name">${who === 'dakota' ? esc(p.name) : CHARACTERS[who].name}</b><p>${line[2]}</p><i class="dlg-more">▼ toque para continuar</i>`;
  } else {
    const done = d.replay ? null : G.s.story.choices[`${d.id}:${d.i}`];
    box = `<b class="dlg-name">${esc(p.name)}</b><div class="dlg-opts">${line.escolha.map((o, k) => `<button class="btn ${done === k ? 'go' : ''}" data-act="dchoice" data-o="${k}">${o.t}</button>`).join('')}</div>`;
  }
  // quem ouve: o último outro personagem que falou (ou o próximo), para a cena ter dois rostos
  const speakers = sc.lines.map((l) => (Array.isArray(l) ? l[0] : 'dakota'));
  let other = null;
  for (let k = d.i - 1; k >= 0 && !other; k--) if (speakers[k] !== who) other = speakers[k];
  for (let k = d.i + 1; k < speakers.length && !other; k++) if (speakers[k] !== who) other = speakers[k];
  const otherLeft = who === 'dakota';
  el.innerHTML = `<div class="dlg" data-act="dnext"><div class="dlg-bg">${sceneBg(sc.bg)}</div>
    <div class="dlg-top"><span>Capítulo ${ch.id} · ${sc.title}</span><button class="btn sm" data-act="dskip">Pular ⏭</button></div>
    <div class="dlg-cast ${other ? 'duo' : ''} ${otherLeft ? 'flip' : ''}">${other ? `<div class="dlg-char listener">${portrait(other, 'neutro', p)}</div>` : ''}<div class="dlg-char" data-k="${d.i}${d.resp ? 'r' : ''}">${portrait(who, expr, p)}</div></div><div class="dlg-box">${box}</div></div>`;
}
function endDialog() {
  const d = G.dlg;
  if (!d.replay) { M.finishScene(G.s, d.id); G.dirty = true; persist(); }
  G.dlg = null; renderDialog(); flow();
}

/** Fila de apresentação: cenas de história primeiro, depois avisos de nível. */
function flow() {
  if (G.scene === 'menu' || G.dlg || !G.started) return;
  const sc = M.nextScene(G.s);
  if (sc) { startDialog(sc); return; }
  if (!G.modal && G.popups.length) { G.modal = G.popups.shift(); sfx('level'); renderModal(); }
}

function go(scene, bk) {
  G.scene = scene; if (bk) G.bk = bk;
  G.sel = -1; G.enter = true; G.modal = null;
  sfx('page'); render(); flow();
}

function persist() {
  if (!G.s || !G.started) return;
  if (Save.save(G.s, localStorage, now())) G.dirty = false;
}

// ---------- Ações (cliques com data-act) ----------
const metaDone = (r, msg) => { if (r && r.ok) { sfx('coin'); toast(msg || `Você ganhou: ${rewardText(r.reward || {})}`, 'good'); G.dirty = true; persist(); render(); flow(); } else if (r) { if (FAIL[r.why]) toast(FAIL[r.why], 'warn'); sfx('error'); } return r; };
function syncName() { const inp = $('#pname'); if (inp && inp.value.trim()) M.setPlayer(G.s, { name: inp.value }); }

const A = {
  play() {
    G.started = true;
    if (G.isNew && !G.s.player.named) { G.scene = 'board'; G.bk = 'main'; render(); G.modal = { name: 'perfil', first: true }; renderModal(); return; }
    go('board', 'main');
  },
  menu(d) { // atalhos do menu principal
    G.started = true;
    if (d.scene) go(d.scene); else { go('village'); G.modal = { name: d.name }; renderModal(); }
  },
  go(d) { go(d.scene, d.bk); },
  modal(d) { syncName(); G.modal = { ...d }; delete G.modal.act; sfx('page'); renderModal(); },
  close() { if (G.modal && G.modal.name === 'perfil' && G.modal.first) return A.profileok(); G.modal = null; renderModal(); flow(); },
  tab(d) { G.modal.tab = d.tab; sfx('tap'); renderModal(); },
  view(d) { G.modal.view = d.view; renderModal(); },
  area(d) { G.modal = { name: 'area', id: d.id }; sfx('page'); renderModal(); },
  pickstyle(d) { G.modal.style = d.style; sfx('tap'); renderModal(); },
  step(d) {
    const r = M.doStep(G.s, d.id, d.style, now());
    if (!r.ok) { toast(FAIL[r.why] || 'Não foi possível reformar.', 'warn'); sfx('error'); return; }
    sfx('build'); toast(`🔨 ${r.step.name} concluído! ${rewardText(r.reward)}`, 'good');
    G.dirty = true; persist(); G.modal.style = null; render();
    burst($('.zoomwrap'), ['✨', '🔨', '⭐'], 12);
    setTimeout(flow, 900);
  },
  setchoice(d) { if (M.setChoice(G.s, d.id, d.key, d.style).ok) { sfx('tap'); G.dirty = true; render(); } },
  orderinfo(d) { const o = G.s.orders.active.find((x) => x.uid === +d.uid); if (o) toast(`<b>${CHARACTERS[o.who].name}:</b> “${o.line}”`); },
  deliver(d) {
    const r = O.deliver(G.s, +d.uid, now());
    if (!r.ok) return commit(r);
    sfx('deliver'); toast(`<b>${CHARACTERS[r.order.who].name}</b> adorou! ${rewardText(r.reward)}${r.streak > 1 ? ` · 🔥×${r.streak}` : ''}`, 'good');
    G.sel = -1; G.dirty = true; persist(); render(); burst($('.orders'), ['⭐', '🪙', '✨'], 14); flow();
  },
  sell() { const r = B.sell(G.s, G.bk, G.sel); if (r.ok) G.sel = -1; commit(r); },
  store() { const r = B.store(G.s, G.bk, G.sel); if (r.ok) { G.sel = -1; toast('🎒 Guardado no inventário.'); } commit(r); if (!r.ok) render(); },
  unlock() { commit(B.payUnlock(G.s, G.bk, G.sel)); },
  use() { const i = G.sel; const r = B.activate(G.s, G.bk, i, now()); if (r.ok && (!G.s.boards[G.bk].cells[i] || r.chestDone)) G.sel = -1; commit(r); },
  undo() { commit(B.undo(G.s)); },
  inbox() { if (!G.s.inbox.length) return toast('📬 Sua caixa de entrada está vazia. Recompensas em itens chegam por aqui.'); const r = commit(B.takeInbox(G.s, 'main')); if (r.ok && G.scene !== 'board') toast('Item colocado no tabuleiro.'); },
  retrieve(d) { commit(B.retrieve(G.s, 'main', +d.k)); },
  expand() { const r = B.expandInventory(G.s); if (r.ok) { sfx('coin'); toast('🎒 Inventário ampliado!', 'good'); G.dirty = true; render(); } else commit(r); },
  buy(d) { const r = M.buy(G.s, d.id, now()); metaDone(r, r.ok ? `Comprado: ${r.item.icon} ${r.item.name}` : ''); },
  upgrade(d) { const r = M.upgradeGen(G.s, d.type); metaDone(r, r.ok ? `🔧 ${GENERATORS[d.type].name} evoluiu para o nível ${r.lvl}!` : ''); },
  login() { metaDone(M.claimLogin(G.s, now())); },
  task(d) { metaDone(M.claimTask(G.s, d.scope, d.id, now())); },
  milestone(d) { metaDone(M.claimMilestone(G.s, +d.i, now())); },
  album(d) { metaDone(M.claimAlbum(G.s, d.id, now())); },
  family(d) { metaDone(M.claimFamily(G.s, d.chain, now())); },
  ach(d) { metaDone(M.claimAch(G.s, d.id, now())); },
  dig(d) {
    const r = M.dig(G.s, +d.i, now());
    if (!r.ok) { toast(FAIL[r.why] || '', 'warn'); sfx('error'); return; }
    G.dirty = true;
    if (r.complete) { sfx('level'); toast(`👑 Tesouro completo! ${rewardText(r.reward)}`, 'good'); }
    else if (r.t === 'tesouro') { sfx('deliver'); toast('👑 Você achou um tesouro!', 'good'); }
    else if (r.t !== 'nada') { sfx('coin'); toast(`Achou ${rewardText({ [r.t]: r.amount })} · tesouro a ${r.dist} passo(s)`); }
    else { sfx('tap'); toast(`Nada aqui… tesouro a ${r.dist} passo(s).`); }
    persist(); render(); flow();
  },
  eventboard() { M.ensureEventBoard(G.s, now()); go('board', 'event'); },
  replay(d) { startDialog(d.id, true); },
  look(d) { syncName(); M.setPlayer(G.s, d); sfx('tap'); G.dirty = true; render(); },
  profileok() { syncName(); G.s.player.named = true; G.modal = null; G.dirty = true; persist(); render(); flow(); },
  toggle(d) { G.s.settings[d.key] = !G.s.settings[d.key]; setAudio(G.s.settings); G.dirty = true; persist(); renderModal(); },
  async export() {
    const txt = Save.serialize(G.s); $('#savebox').value = txt;
    try { await navigator.clipboard.writeText(txt); toast('Save copiado para a área de transferência.', 'good'); } catch { toast('Save gerado na caixa abaixo — copie o texto.'); }
  },
  import() {
    try { const s = Save.deserialize($('#savebox').value.trim(), now()); G.s = s; G.isNew = false; G.started = true; persist(); G.modal = null; go('board', 'main'); toast('Save importado!', 'good'); }
    catch (e) { console.error('[import]', e); toast('Esse texto não é um save válido.', 'warn'); }
  },
  reset(d, el) {
    if (el.dataset.sure !== '1') { el.dataset.sure = '1'; el.textContent = 'Toque de novo para confirmar'; return; }
    Save.wipe(localStorage); G.s = newGame(now()); G.isNew = true; G.started = false; G.modal = null; G.popups = []; G.scene = 'menu'; render(); toast('Progresso apagado.');
  },
  dnext() {
    const d = G.dlg, sc = SCENES[d.id];
    if (!d.resp && !Array.isArray(sc.lines[d.i])) return; // aguardando escolha
    d.resp = null; d.i++; sfx('tap');
    if (d.i >= sc.lines.length) endDialog(); else renderDialog();
  },
  dchoice(d) {
    const dl = G.dlg, o = +d.o;
    const r = dl.replay ? { resp: SCENES[dl.id].lines[dl.i].escolha[o].resp } : M.choose(G.s, dl.id, dl.i, o);
    dl.resp = r.resp; G.dirty = true; sfx('page'); renderDialog();
  },
  dskip() { endDialog(); },
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  unlockAudio();
  const f = A[el.dataset.act];
  if (!f) return;
  try { f(el.dataset, el); } catch (err) { console.error('[ação]', el.dataset.act, err); toast('Ops! Algo deu errado. Seu progresso está salvo.', 'warn'); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && G.modal) A.close();
  if ((e.key === 'Enter' || e.key === ' ') && G.dlg) { e.preventDefault(); A.dnext(); }
  else if (e.key === 'Enter' && e.target.closest && e.target.closest('.area')) A.area(e.target.closest('.area').dataset);
});

// ---------- Arrastar e soltar no tabuleiro ----------
function tapCell(i) {
  const b = G.s.boards[G.bk], it = b.cells[i];
  if (!it) { if (G.sel !== -1) { G.sel = -1; render(); } return; }
  const d = itemDef(it.id);
  if (!it.covered && !it.locked && !it.bubble && d.kind === 'gen') { G.sel = i; const r = commit(B.activate(G.s, G.bk, i, now())); if (!r.ok) render(); return; }
  if (G.sel === i && !it.covered && !it.locked && (d.kind === 'collect' || d.kind === 'chest')) return A.use();
  G.sel = i; sfx('tap'); render();
}
document.addEventListener('pointerdown', (e) => {
  const cell = e.target.closest('.grid .cell');
  if (!cell || G.dlg) return;
  unlockAudio();
  const i = +cell.dataset.i, it = G.s.boards[G.bk].cells[i];
  G.drag = { i, x: e.clientX, y: e.clientY, moved: false, ghost: null, can: B.isFree(it) };
});
document.addEventListener('pointermove', (e) => {
  const d = G.drag;
  if (!d) return;
  if (!d.moved) {
    if (!d.can || Math.hypot(e.clientX - d.x, e.clientY - d.y) < 10) return;
    d.moved = true;
    const src = cellEl(d.i).firstElementChild;
    d.ghost = src.cloneNode(true); d.ghost.classList.add('ghost');
    const r = src.getBoundingClientRect();
    d.ghost.style.width = r.width + 'px'; d.ghost.style.height = r.height + 'px';
    $('#fx').append(d.ghost); src.classList.add('dragging');
  }
  d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
  const over = document.elementFromPoint(e.clientX, e.clientY);
  const c = over && over.closest('.grid .cell');
  $$('.cell.over').forEach((x) => x.classList.remove('over'));
  if (c) c.classList.add('over');
  const bag = $('.bag'); if (bag) bag.classList.toggle('over', !!(over && over.closest('.bag')));
});
function endDrag(e, cancel) {
  const d = G.drag;
  if (!d) return;
  G.drag = null;
  if (d.ghost) d.ghost.remove();
  $$('.cell.over').forEach((x) => x.classList.remove('over'));
  try {
    if (!d.moved) { if (!cancel) tapCell(d.i); return; }
    const over = cancel ? null : document.elementFromPoint(e.clientX, e.clientY);
    const c = over && over.closest('.grid .cell');
    if (c) { const to = +c.dataset.i; const r = B.drop(G.s, G.bk, d.i, to, now()); if (r.ok) G.sel = r.type === 'split' ? -1 : to; commit(r, { quiet: r.why === 'nada' }); if (!r.ok) render(); }
    else if (over && over.closest('.bag')) { G.sel = d.i; A.store(); }
    else render();
  } catch (err) { console.error('[arrastar]', err); render(); }
}
document.addEventListener('pointerup', (e) => endDrag(e, false));
document.addEventListener('pointercancel', (e) => endDrag(e, true));

// ---------- Eventos do motor ----------
bus.on((type, d) => {
  if (!G.s || !G.started) return;
  if (type === 'levelup') G.popups.push({ name: 'levelup', ...d });
  else if (type === 'discover') { const it = itemDef(d.id); if (it.kind !== 'gen') toast(`🆕 Novo item: ${it.icon} <b>${it.name}</b>`); }
  else if (type === 'cards') for (const c of d.got) toast(c.dup ? '🎴 Carta repetida → 🪙 20' : '🎴 Carta nova para o Álbum da Vila!', 'good');
  else if (type === 'orderExpired') toast(`⏳ ${CHARACTERS[d.who].name} cansou de esperar.`, 'warn');
});

// ---------- Laço de tempo (1 s) ----------
function loop() {
  const s = G.s, t = now();
  if (!s) return;
  let changed = false;
  try {
    regen(s, 'energy', t); regen(s, 'tickets', t);
    changed = B.tick(s, t);
    if (G.started) changed = O.refresh(s, t) || changed;
  } catch (e) { console.error('[loop]', e); }
  let expired = false;
  for (const el of $$('[data-t]')) { const left = +el.dataset.t - t; el.textContent = fmt(left); if (left <= 0) expired = true; }
  if ((changed || expired) && !G.drag) { if (changed) G.dirty = true; render(); }
}

async function boot() {
  await loadManifest();
  try { G.s = Save.load(localStorage, now()); } catch (e) { console.error('[boot] falha ao carregar', e); }
  if (!G.s) { G.s = newGame(now()); G.isNew = true; }
  setAudio(G.s.settings);
  render();
  setInterval(loop, 1000);
  setInterval(() => { if (G.dirty) persist(); }, 5000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  window.addEventListener('pagehide', persist);
  window.addEventListener('error', (e) => console.error('[erro]', e.message));
}
boot();
