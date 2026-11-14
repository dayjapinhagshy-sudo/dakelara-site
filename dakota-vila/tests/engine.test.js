import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CFG, SHOP, LOGIN_REWARDS } from '../src/data/config.js';
import { CHAINS, GENERATORS, CHAIN_GEN, CHEST_LOOT, itemDef, allItemIds } from '../src/data/items.js';
import { ORDERS, CHARACTERS, AREAS, SCENES, STYLES, ALBUM, LEVEL_SCENES } from '../src/data/world.js';
import { newGame, setRng, seeded, mkItem, regen, spend, grant, addXp, bus } from '../src/engine/core.js';
import * as B from '../src/engine/board.js';
import * as O from '../src/engine/orders.js';
import * as M from '../src/engine/meta.js';
import * as S from '../src/engine/save.js';

const T0 = 1_800_000_000_000;
const fresh = () => { setRng(seeded(42)); return newGame(T0); };
/** Tabuleiro vazio para testes controlados. */
const blank = () => { const s = fresh(); s.boards.main.cells.fill(null); return s; };
const put = (s, i, id, extra) => (s.boards.main.cells[i] = mkItem(s, id, extra));
const at = (s, i) => s.boards.main.cells[i];

test('dados: escopo mínimo da primeira entrega', () => {
  const items = allItemIds();
  assert.ok(items.length >= 60, `itens: ${items.length}`);
  assert.ok(Object.values(GENERATORS).filter((g) => !g.event).length >= 8);
  assert.ok(ORDERS.length >= 20);
  assert.ok(Object.keys(CHARACTERS).length >= 5);
  assert.equal(CFG.initialBoard.length, 9);
  for (const row of CFG.initialBoard) assert.equal(row.split(/\s+/).length, 7);
});

test('dados: todas as referências são válidas', () => {
  for (const id of allItemIds()) itemDef(id);
  const icons = new Map();
  for (const id of allItemIds()) { const d = itemDef(id); assert.ok(!icons.has(d.icon), `ícone repetido ${d.icon}: ${id} e ${icons.get(d.icon)}`); icons.set(d.icon, id); }
  for (const g of Object.values(GENERATORS)) { for (const [c] of g.drops) assert.ok(CHAINS[c]); assert.equal(g.levels.length, 5); }
  for (const c of Object.keys(CHAINS)) if (CHAINS[c].kind === 'item') assert.ok(CHAIN_GEN[c], `cadeia sem gerador: ${c}`);
  for (const o of ORDERS) { assert.ok(CHARACTERS[o.who]); for (const [id] of o.need) { const d = itemDef(id); assert.ok(GENERATORS[CHAIN_GEN[d.chain]].unlock <= o.lvl, `pedido pede ${id} antes do gerador`); } }
  for (const a of AREAS) for (const st of a.steps) if (st.scene) assert.ok(SCENES[st.scene], st.scene);
  for (const sc of Object.values(LEVEL_SCENES)) assert.ok(SCENES[sc]);
  for (const sc of Object.values(SCENES)) for (const l of sc.lines) {
    if (Array.isArray(l)) assert.ok(CHARACTERS[l[0]], l[0]);
    else for (const e of l.escolha) { assert.ok(CHARACTERS[e.resp[0]]); for (const c of Object.keys(e.rel)) assert.ok(CHARACTERS[c]); }
  }
  for (const it of SHOP) for (const id of it.give.items || []) itemDef(id);
  for (const r of LOGIN_REWARDS) for (const id of r.items || []) itemDef(id);
  for (const T of Object.values(CHEST_LOOT)) for (const [c] of T.loot) assert.ok(c === '$chain' || CHAINS[c]);
  assert.ok(Object.keys(STYLES).length >= 3);
  assert.ok(ALBUM.length >= 3);
});

test('novo jogo: tabuleiro 7x9 com geradores iniciais', () => {
  const s = fresh();
  assert.equal(s.boards.main.cells.length, 63);
  const gens = s.boards.main.cells.filter((c) => c && itemDef(c.id).kind === 'gen');
  assert.equal(gens.length, 3);
  assert.deepEqual(Object.keys(s.gens).sort(), ['cafe', 'forno', 'mercado']);
});

test('merge: dois iguais viram o próximo nível', () => {
  const s = blank();
  put(s, 0, 'cafe:1'); put(s, 1, 'cafe:1');
  const r = B.drop(s, 'main', 0, 1, T0);
  assert.equal(r.type, 'merge');
  assert.equal(at(s, 1).id, 'cafe:2');
  assert.equal(at(s, 0), null);
  assert.equal(s.stats.merges, 1);
  assert.ok(s.discovered['cafe:2']);
});

test('merge: itens diferentes trocam de lugar; vazio move', () => {
  const s = blank();
  put(s, 0, 'cafe:1'); put(s, 1, 'pao:1');
  assert.equal(B.drop(s, 'main', 0, 1, T0).type, 'swap');
  assert.equal(at(s, 0).id, 'pao:1');
  assert.equal(B.drop(s, 'main', 0, 5, T0).type, 'move');
  assert.equal(at(s, 5).id, 'pao:1');
});

test('merge: nível máximo não combina', () => {
  const s = blank();
  put(s, 0, 'cafe:8'); put(s, 1, 'cafe:8');
  assert.equal(B.drop(s, 'main', 0, 1, T0).type, 'swap');
});

test('itens presos e cobertos: preso não move, merge destrava e revela vizinhos', () => {
  const s = blank();
  put(s, 0, 'cafe:1'); put(s, 1, 'cafe:1', { locked: 1 }); put(s, 2, 'pao:2', { covered: 1 }); put(s, 8, 'tesoura:1', { covered: 1 });
  assert.equal(B.drop(s, 'main', 1, 3, T0).why, 'preso');
  assert.equal(B.drop(s, 'main', 2, 3, T0).why, 'preso');
  const r = B.drop(s, 'main', 0, 1, T0);
  assert.ok(r.unlocked);
  assert.equal(at(s, 1).id, 'cafe:2');
  assert.ok(!at(s, 1).locked);
  assert.ok(!at(s, 2).covered && at(s, 2).locked, 'coberto vira preso');
  assert.ok(!at(s, 8).covered && !at(s, 8).locked, 'ferramenta revelada sai livre');
  // não dá para trocar com item preso
  put(s, 10, 'doce:1');
  assert.equal(B.drop(s, 'main', 10, 2, T0).why, 'bloqueado');
});

test('desbloqueio pago de item preso', () => {
  const s = blank();
  put(s, 0, 'cafe:2', { locked: 1 });
  s.wallet.coins = 0;
  assert.equal(B.payUnlock(s, 'main', 0).why, 'moedas');
  s.wallet.coins = 500;
  assert.ok(B.payUnlock(s, 'main', 0).ok);
  assert.ok(!at(s, 0).locked);
  assert.equal(s.wallet.coins, 500 - CFG.unlockCost(itemDef('cafe:2').value));
});

test('gerador manual: gasta energia, cargas e entra em recarga', () => {
  const s = blank();
  put(s, 31, 'gen:cafe');
  const L = GENERATORS.cafe.levels[0];
  for (let k = 0; k < L.charges; k++) assert.ok(B.produce(s, 'main', 31, T0).ok);
  assert.equal(s.energy.cur, CFG.energy.max - L.charges);
  assert.equal(s.stats.generated, L.charges);
  assert.equal(B.produce(s, 'main', 31, T0 + 1000).why, 'recarga');
  assert.ok(B.genStatus(s, at(s, 31), T0 + 1000).cooling);
  assert.ok(B.produce(s, 'main', 31, T0 + L.cd * 1000).ok, 'recarrega após cooldown');
  for (const c of s.boards.main.cells) if (c && c.id !== 'gen:cafe') assert.ok(['cafe', 'cha', 'peca', 'moeda', 'energia'].includes(itemDef(c.id).chain));
});

test('gerador: sem energia e tabuleiro cheio', () => {
  const s = blank();
  put(s, 0, 'gen:cafe');
  s.energy.cur = 0; s.energy.ts = T0;
  assert.equal(B.produce(s, 'main', 0, T0).why, 'energia');
  s.energy.cur = 50;
  for (let i = 1; i < 63; i++) put(s, i, 'pao:1');
  assert.equal(B.produce(s, 'main', 0, T0).why, 'cheio');
  assert.equal(s.energy.cur, 50, 'não cobra energia se falhar');
});

test('gerador automático produz com o tempo, respeita limite e recarga', () => {
  const s = blank();
  s.gens.pomar = { lvl: 1 };
  put(s, 31, 'gen:pomar');
  const L = GENERATORS.pomar.levels[0];
  assert.equal(B.produce(s, 'main', 31, T0).why, 'auto');
  B.tick(s, T0);
  const count = () => s.boards.main.cells.filter((c) => c && c.id !== 'gen:pomar').length;
  assert.equal(count(), 0);
  B.tick(s, T0 + L.every * 1000);
  assert.equal(count(), 1);
  B.tick(s, T0 + L.every * 1000 * 100); // muito tempo depois: só até o limite de cargas por ciclo
  assert.ok(count() >= L.charges && count() <= L.charges * 2);
  assert.equal(s.energy.cur, CFG.energy.max, 'automático não gasta energia');
});

test('nível do gerador (oficina) aumenta cargas e melhora os itens', () => {
  const s = blank();
  s.wallet.comps = 0;
  assert.equal(M.upgradeGen(s, 'cafe').why, 'pecas');
  s.wallet.comps = 100; s.wallet.coins = 10000;
  assert.ok(M.upgradeGen(s, 'cafe').ok);
  assert.equal(s.gens.cafe.lvl, 2);
  assert.ok(B.genLevel(s, 'cafe').charges > GENERATORS.cafe.levels[0].charges);
  for (let k = 0; k < 3; k++) M.upgradeGen(s, 'cafe');
  assert.equal(s.gens.cafe.lvl, 5);
  assert.equal(M.upgradeGen(s, 'cafe').why, 'max');
  assert.equal(M.upgradeGen(s, 'bancada').why, 'bloqueado');
});

test('energia: regenera com o tempo até o máximo', () => {
  const s = fresh();
  assert.ok(spend(s, 'energy', 10, T0));
  assert.equal(s.energy.cur, 90);
  regen(s, 'energy', T0 + CFG.energy.regenMs * 3 + 5);
  assert.equal(s.energy.cur, 93);
  regen(s, 'energy', T0 + CFG.energy.regenMs * 1000);
  assert.equal(s.energy.cur, 100);
  assert.equal(spend(s, 'energy', 101, T0 + CFG.energy.regenMs * 1000), false);
  grant(s, { energy: 50 }, T0 + CFG.energy.regenMs * 1000);
  assert.equal(s.energy.cur, 150, 'bônus pode passar do máximo');
});

test('ferramentas: tesoura divide, coringa evolui, acelerador recarrega', () => {
  const s = blank();
  put(s, 0, 'tesoura:1'); put(s, 1, 'cafe:3');
  assert.equal(B.drop(s, 'main', 0, 1, T0).type, 'split');
  assert.equal(at(s, 0).id, 'cafe:2'); assert.equal(at(s, 1).id, 'cafe:2');
  put(s, 5, 'coringa:1');
  assert.equal(B.drop(s, 'main', 5, 0, T0).type, 'merge');
  assert.equal(at(s, 0).id, 'cafe:3'); assert.equal(at(s, 5), null);
  put(s, 10, 'gen:cafe'); at(s, 10).ch = 0; at(s, 10).cd = T0 + 99999;
  put(s, 11, 'acelerador:1');
  assert.equal(B.drop(s, 'main', 11, 10, T0).type, 'boost');
  assert.ok(B.produce(s, 'main', 10, T0).ok);
  // tesoura em item nível 1 não faz nada além de trocar
  put(s, 20, 'tesoura:1'); put(s, 21, 'pao:1');
  assert.equal(B.drop(s, 'main', 20, 21, T0).type, 'swap');
});

test('coletáveis: toque entrega o recurso; combinam entre si', () => {
  const s = blank();
  put(s, 0, 'moeda:1'); put(s, 1, 'moeda:1'); put(s, 2, 'energia:1'); put(s, 3, 'peca:1');
  B.drop(s, 'main', 0, 1, T0);
  assert.equal(at(s, 1).id, 'moeda:2');
  const c0 = s.wallet.coins;
  assert.equal(B.activate(s, 'main', 1, T0).type, 'collect');
  assert.equal(s.wallet.coins, c0 + 15);
  B.activate(s, 'main', 2, T0);
  assert.equal(s.energy.cur, CFG.energy.max + 5);
  B.activate(s, 'main', 3, T0);
  assert.equal(s.wallet.comps, 1);
});

test('baús: abrem o número certo de itens e somem', () => {
  const s = blank();
  put(s, 31, 'bau:1');
  for (let k = 0; k < CHEST_LOOT[1].n; k++) assert.ok(B.activate(s, 'main', 31, T0).ok);
  assert.equal(s.boards.main.cells.filter(Boolean).length, CHEST_LOOT[1].n);
  assert.equal(s.stats.chests, 1);
  assert.ok(!s.boards.main.cells.some((c) => c && c.id === 'bau:1'));
});

test('bolhas: estourar custa gemas; expiram virando moeda', () => {
  const s = blank();
  put(s, 0, 'cafe:3', { bubble: T0 + 1000 });
  put(s, 1, 'cafe:3');
  assert.equal(B.drop(s, 'main', 1, 0, T0).why, 'bloqueado', 'bolha não combina');
  s.wallet.gems = 0;
  assert.equal(B.activate(s, 'main', 0, T0).why, 'gemas');
  s.wallet.gems = 20;
  assert.equal(B.activate(s, 'main', 0, T0).type, 'pop');
  assert.ok(!at(s, 0).bubble);
  assert.equal(s.wallet.gems, 20 - B.bubbleCost({ id: 'cafe:3' }));
  put(s, 5, 'pao:4', { bubble: T0 + 1000 });
  assert.ok(B.tick(s, T0 + 2000));
  assert.equal(at(s, 5).id, 'moeda:1');
});

test('bolha aparece em fusão sortuda', () => {
  const s = blank();
  setRng(() => 0);
  put(s, 0, 'cafe:2'); put(s, 1, 'cafe:2');
  const r = B.drop(s, 'main', 0, 1, T0);
  assert.ok(r.bubble >= 0);
  assert.ok(at(s, r.bubble).bubble > T0);
  setRng(null);
});

test('vender, desfazer e descarte', () => {
  const s = blank();
  put(s, 0, 'cafe:4'); put(s, 1, 'gen:cafe');
  const c0 = s.wallet.coins, v = itemDef('cafe:4').value;
  assert.equal(B.sell(s, 'main', 1).why, 'gerador');
  assert.ok(B.sell(s, 'main', 0).ok);
  assert.equal(s.wallet.coins, c0 + v);
  assert.equal(at(s, 0), null);
  assert.ok(B.undo(s).ok);
  assert.equal(s.wallet.coins, c0);
  assert.equal(at(s, 0).id, 'cafe:4');
  assert.equal(B.undo(s).why, 'nada');
});

test('inventário: guardar, recuperar, limite e expansão', () => {
  const s = blank();
  for (let i = 0; i < 7; i++) put(s, i, 'cafe:1');
  for (let i = 0; i < 6; i++) assert.ok(B.store(s, 'main', i).ok);
  assert.equal(B.store(s, 'main', 6).why, 'inventario');
  s.wallet.gems = 100;
  assert.ok(B.expandInventory(s).ok);
  assert.equal(s.inv.slots, 8);
  assert.ok(B.store(s, 'main', 6).ok);
  assert.ok(B.retrieve(s, 'main', 0).ok);
  assert.equal(s.inv.items.length, 6);
  assert.equal(s.boards.main.cells.filter(Boolean).length, 1);
});

test('caixa de entrada: recompensas em itens vão para o tabuleiro', () => {
  const s = blank();
  grant(s, { items: ['bau:1', 'coringa:1'] }, T0);
  assert.equal(s.inbox.length, 2);
  assert.ok(B.takeInbox(s).ok);
  assert.equal(s.inbox.length, 1);
  assert.equal(s.boards.main.cells.find(Boolean).id, 'bau:1');
});

test('pedidos: máquina de estados rejeita transições inválidas', () => {
  const o = { state: 'aguardando' };
  O.transition(o, 'pronto'); O.transition(o, 'entregue');
  assert.throws(() => O.transition(o, 'aguardando'));
  assert.throws(() => O.transition({ state: 'aguardando' }, 'entregue'));
});

test('pedidos: ficam prontos com os itens, entregam e recompensam', () => {
  const s = blank();
  O.refresh(s, T0);
  assert.equal(s.orders.active.length, CFG.orders.maxActive);
  const o = s.orders.active[0];
  assert.equal(o.state, 'aguardando');
  assert.equal(O.deliver(s, o.uid, T0).why, 'incompleto');
  let i = 0;
  for (const [id, n] of o.need) for (let k = 0; k < n; k++) put(s, i++, id);
  put(s, 40, o.need[0][0], { locked: 1 }); // preso não conta
  O.refresh(s, T0);
  assert.equal(o.state, 'pronto');
  const before = { ...s.wallet }, xp = s.player.xp, lvl = s.player.lvl;
  const r = O.deliver(s, o.uid, T0);
  assert.ok(r.ok);
  assert.equal(o.state, 'entregue');
  assert.ok(s.wallet.coins > before.coins);
  assert.ok(s.wallet.stars > before.stars);
  assert.ok(s.player.xp > xp || s.player.lvl > lvl);
  assert.equal(s.stats.deliveries, 1);
  assert.ok(at(s, 40), 'item preso continua lá');
  assert.equal(at(s, 0), null);
  assert.ok(!s.orders.active.includes(o));
  O.refresh(s, T0 + CFG.orders.respawnMs + 1);
  assert.equal(s.orders.active.length, CFG.orders.maxActive, 'novo pedido entra após o intervalo');
});

test('pedidos: sequência dá bônus de moedas', () => {
  const s = blank();
  O.refresh(s, T0);
  const serve = (now) => { const o = s.orders.active.find((x) => x.kind === 'normal'); let i = 20; for (const [id, n] of o.need) for (let k = 0; k < n; k++) put(s, i++, id); return O.deliver(s, o.uid, now); };
  const a = serve(T0);
  assert.equal(a.streak, 1);
  O.refresh(s, T0 + 10_000);
  const b = serve(T0 + 10_000);
  assert.equal(b.streak, 2);
  assert.ok(b.reward.coins > b.order.reward.coins);
  O.refresh(s, T0 + 10_000 + CFG.orders.streakWindowMs * 2);
  assert.equal(serve(T0 + 10_000 + CFG.orders.streakWindowMs * 2).streak, 1, 'sequência zera após a janela');
});

test('pedidos: com prazo expiram; VIP paga mais', () => {
  const s = blank();
  O.refresh(s, T0);
  s.orders.active[0].expires = T0 + 1000;
  const uid = s.orders.active[0].uid;
  O.refresh(s, T0 + 2000);
  assert.ok(!s.orders.active.some((o) => o.uid === uid));
  const need = [['cafe:3', 1]];
  assert.ok(O.rewardFor(need, 'vip').coins > O.rewardFor(need, 'normal').coins);
  assert.equal(O.rewardFor(need, 'vip').cards, 1);
});

test('pedidos: 24 pedidos escritos são servidos em ordem e depois vêm os gerados', () => {
  const s = blank();
  s.player.lvl = 12;
  for (const [g, d] of Object.entries(GENERATORS)) if (!d.event) s.gens[g] = { lvl: 1 };
  let now = T0, served = 0;
  for (let guard = 0; guard < 60; guard++) {
    O.refresh(s, now);
    const o = s.orders.active.find((x) => x.kind !== 'diario' && x.kind !== 'semanal');
    s.boards.main.cells.fill(null);
    let i = 0; for (const [id, n] of o.need) for (let k = 0; k < n; k++) put(s, i++, id);
    assert.ok(O.deliver(s, o.uid, now).ok);
    served++; now += CFG.orders.respawnMs + 1;
  }
  assert.equal(s.orders.seq, ORDERS.length);
  assert.equal(served, 60);
  assert.ok(s.orders.active.some((o) => o.kind === 'diario'));
  assert.ok(s.orders.active.some((o) => o.kind === 'semanal'));
  for (const o of s.orders.active) for (const [id] of o.need) itemDef(id);
});

test('experiência: subir de nível dá recompensas e desbloqueia geradores', () => {
  const s = fresh();
  const ev = [];
  bus.on((t, d) => t === 'levelup' && ev.push(d));
  addXp(s, CFG.xpForLevel(1), T0);
  assert.equal(s.player.lvl, 2);
  assert.ok(s.gens.doces);
  assert.ok(s.inbox.includes('gen:doces'));
  assert.equal(ev.at(-1).lvl, 2);
  addXp(s, 100000, T0);
  assert.ok(s.player.lvl > 12);
  for (const [g, d] of Object.entries(GENERATORS)) assert.equal(!!s.gens[g], !d.event);
  assert.ok(s.story.queue.includes('lvl3'));
});

test('vila: etapas custam estrelas, escolhas de estilo ficam salvas e disparam cenas', () => {
  const s = fresh();
  assert.equal(M.areaInfo(s, 'restaurante').status, 'abandonado');
  assert.equal(M.doStep(s, 'restaurante', null, T0).why, 'estrelas');
  s.wallet.stars = 100;
  assert.ok(M.doStep(s, 'restaurante', null, T0).ok);
  assert.equal(M.areaInfo(s, 'restaurante').status, 'limpo');
  assert.ok(s.story.queue.includes('r_limpar'));
  assert.equal(M.doStep(s, 'restaurante', 'inexistente', T0).why, 'estilo');
  assert.ok(M.doStep(s, 'restaurante', 'tropical', T0).ok);
  assert.equal(s.village.restaurante.choices.piso, 'tropical');
  assert.ok(M.setChoice(s, 'restaurante', 'piso', 'moderno').ok);
  assert.equal(M.setChoice(s, 'restaurante', 'decor', 'moderno').ok, false, 'só troca o que já foi escolhido');
  for (let k = 0; k < 4; k++) assert.ok(M.doStep(s, 'restaurante', 'rustico', T0).ok);
  assert.equal(M.areaInfo(s, 'restaurante').status, 'decorado');
  assert.equal(M.doStep(s, 'restaurante', 'rustico', T0).why, 'completo');
  assert.equal(M.doStep(s, 'salao', null, T0).why, 'nivel');
  const again = S.deserialize(S.serialize(s), T0);
  assert.equal(again.village.restaurante.choices.piso, 'moderno');
  assert.equal(s.stats.renovations, 6);
});

test('história: escolhas afetam relacionamento uma única vez; cenas entram no histórico', () => {
  const s = fresh();
  assert.equal(M.nextScene(s), 'intro');
  const idx = SCENES.intro.lines.findIndex((l) => l.escolha);
  assert.ok(M.choose(s, 'intro', idx, 0).ok);
  M.choose(s, 'intro', idx, 1);
  assert.equal(s.story.rel.matilde, 1);
  M.finishScene(s, 'intro');
  assert.equal(M.nextScene(s), null);
  assert.deepEqual(s.story.seen, ['intro']);
});

test('loja: compra debita e entrega', () => {
  const s = fresh();
  s.wallet.gems = 6;
  assert.ok(M.buy(s, 'energia_p', T0).ok);
  assert.equal(s.wallet.gems, 0);
  assert.equal(s.energy.cur, CFG.energy.max + 30);
  assert.equal(M.buy(s, 'energia_p', T0).why, 'gemas');
  s.wallet.coins = 120;
  assert.ok(M.buy(s, 'bau1', T0).ok);
  assert.deepEqual(s.inbox, ['bau:1']);
});

test('login diário: uma vez por dia, sequência avança', () => {
  const s = fresh();
  const DAY = 864e5;
  const r1 = M.claimLogin(s, T0);
  assert.equal(r1.day, 1);
  assert.equal(M.claimLogin(s, T0 + 1000).why, 'feito');
  assert.equal(M.claimLogin(s, T0 + DAY).day, 2);
  assert.equal(M.claimLogin(s, T0 + DAY * 5).day, 1, 'perder um dia reinicia');
});

test('missões diárias: progresso, resgate único e virada do dia', () => {
  const s = fresh();
  const ts = M.tasks(s, 'daily', T0);
  assert.equal(ts.length, 3);
  const t = ts[0];
  assert.equal(M.claimTask(s, 'daily', t.id, T0).ok, false);
  s.stats[t.stat] += t.n;
  assert.ok(M.tasks(s, 'daily', T0).find((x) => x.id === t.id).done);
  assert.ok(M.claimTask(s, 'daily', t.id, T0).ok);
  assert.equal(M.claimTask(s, 'daily', t.id, T0).ok, false);
  const tomorrow = M.tasks(s, 'daily', T0 + 864e5);
  assert.ok(tomorrow.every((x) => x.prog === 0 && !x.claimed));
  assert.equal(M.tasks(s, 'weekly', T0).length, 3);
});

test('festival: pontos por entrega e por tabuleiro de evento, marcos e virada de semana', () => {
  const s = blank();
  const b = M.ensureEventBoard(s, T0);
  assert.equal(b.cells.length, 25);
  const gi = b.cells.findIndex(Boolean);
  const t0 = s.fest.tickets.cur;
  const r = B.produce(s, 'event', gi, T0);
  assert.ok(r.ok);
  assert.equal(s.fest.tickets.cur, t0 - 1);
  assert.equal(s.energy.cur, CFG.energy.max, 'evento usa fichas, não energia');
  assert.equal(itemDef(r.id).chain, 'festa');
  b.cells[0] = mkItem(s, 'festa:2'); b.cells[1] = mkItem(s, 'festa:2');
  B.drop(s, 'event', 0, 1, T0);
  assert.equal(s.fest.pts, 3);
  s.fest.pts = 20;
  assert.ok(M.claimMilestone(s, 0, T0).ok);
  assert.equal(M.claimMilestone(s, 0, T0).ok, false);
  assert.equal(M.claimMilestone(s, 3, T0).ok, false);
  const st = M.festState(s, T0);
  assert.equal(st.rank.length, 7);
  assert.ok(st.end > T0);
  M.festState(s, T0 + 8 * 864e5);
  assert.equal(s.fest.pts, 0);
  assert.ok(!s.boards.event, 'tabuleiro de evento é recriado a cada semana');
});

test('caça ao tesouro: gasta pás, dá dicas e premia ao achar todos', () => {
  const s = fresh();
  s.hunt.shovels = 25;
  const tre = M.huntState(s)._m.tre;
  const other = [...Array(25).keys()].find((i) => !tre.includes(i));
  const r = M.dig(s, other, T0);
  assert.ok(r.ok && r.dist >= 1);
  assert.equal(M.dig(s, other, T0).why, 'feito');
  assert.equal(s.hunt.shovels, 24);
  M.dig(s, tre[0], T0); M.dig(s, tre[1], T0);
  const fin = M.dig(s, tre[2], T0);
  assert.ok(fin.complete);
  assert.equal(s.hunt.map, 2);
  assert.equal(s.stats.treasures, 1);
  assert.deepEqual(s.hunt.dug, {});
  s.hunt.shovels = 0;
  assert.equal(M.dig(s, 0, T0).why, 'pas');
});

test('álbum, famílias e conquistas', () => {
  const s = fresh();
  grant(s, { cards: 200 }, T0);
  const al = M.albumState(s);
  assert.ok(al.every((a) => a.complete));
  assert.ok(M.claimAlbum(s, al[0].id, T0).ok);
  assert.equal(M.claimAlbum(s, al[0].id, T0).ok, false);
  assert.equal(M.claimFamily(s, 'cafe', T0).ok, false);
  for (let i = 1; i <= 8; i++) s.discovered['cafe:' + i] = 1;
  assert.ok(M.claimFamily(s, 'cafe', T0).ok);
  assert.equal(M.claimAch(s, 'm50', T0).ok, false);
  s.stats.merges = 50;
  assert.ok(M.claimAch(s, 'm50', T0).ok);
  assert.equal(M.claimAch(s, 'm50', T0).ok, false);
});

test('salvamento: ida e volta, cópia de segurança e recuperação de corrupção', () => {
  const mem = new Map();
  const storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };
  assert.equal(S.load(storage), null);
  const s = fresh();
  B.produce(s, 'main', s.boards.main.cells.findIndex((c) => c && c.id === 'gen:cafe'), T0);
  s.wallet.coins = 777;
  assert.ok(S.save(s, storage, T0));
  const l = S.load(storage, T0);
  assert.deepEqual(l, JSON.parse(JSON.stringify(s)));
  s.wallet.coins = 888;
  S.save(s, storage, T0);
  mem.set(S.KEY, '{corrompido');
  assert.equal(S.load(storage, T0).wallet.coins, 777, 'usa a cópia de segurança');
  mem.set(S.KEY_BAK, 'lixo');
  assert.equal(S.load(storage, T0), null);
  // save antigo sem campos novos e com item inexistente
  const old = JSON.parse(S.serialize(fresh()));
  delete old.hunt; delete old.fest; old.boards.main.cells[0] = { id: 'naoexiste:1', u: 1 }; old.inbox.push('x:9');
  const m = S.deserialize(JSON.stringify(old), T0);
  assert.ok(m.hunt && m.fest);
  assert.equal(m.boards.main.cells[0], null);
  assert.equal(m.inbox.length, 0);
  assert.throws(() => S.deserialize('{"a":1}'));
});

test('simulação: 3000 ações aleatórias mantêm o estado consistente', () => {
  const s = fresh();
  const r = seeded(7);
  setRng(r);
  let now = T0;
  for (let k = 0; k < 3000; k++) {
    now += 500 + Math.floor(r() * 4000);
    const b = s.boards.main, i = Math.floor(r() * 63), j = Math.floor(r() * 63);
    const a = r();
    if (a < 0.4) B.activate(s, 'main', i, now);
    else if (a < 0.8) B.drop(s, 'main', i, j, now);
    else if (a < 0.84) B.sell(s, 'main', i);
    else if (a < 0.86) B.undo(s);
    else if (a < 0.9) B.store(s, 'main', i);
    else if (a < 0.93) B.retrieve(s, 'main', 0);
    else if (a < 0.96) B.takeInbox(s);
    else { O.refresh(s, now); const o = s.orders.active.find((x) => x.state === 'pronto'); if (o) O.deliver(s, o.uid, now); }
    B.tick(s, now); O.refresh(s, now);
    assert.equal(b.cells.length, 63);
    for (const v of Object.values(s.wallet)) assert.ok(Number.isFinite(v) && v >= 0);
    assert.ok(s.energy.cur >= 0);
    assert.ok(s.inv.items.length <= s.inv.slots);
    const ids = b.cells.filter(Boolean).map((c) => c.u);
    assert.equal(new Set(ids).size, ids.length, 'sem itens duplicados');
  }
  assert.ok(s.stats.merges > 0 && s.stats.generated > 0);
  S.deserialize(S.serialize(s), now);
  setRng(null);
});

test('arte em imagem: manifesto substitui item, retrato e área; o resto continua gerado', async () => {
  const A = await import('../src/ui/assets.js');
  A.setManifest({ items: { 'cafe:1': 'items/cafe-1.png' }, portraits: { matilde: 'characters/matilde.png', 'matilde:rindo': 'characters/matilde-rindo.png' }, areas: { 'restaurante:decorado': 'areas/restaurante-decorado.png' } });
  assert.equal(A.itemArt('cafe:1'), 'assets/items/cafe-1.png');
  assert.equal(A.itemArt('cafe:2'), null);
  assert.equal(A.portraitArt('matilde', 'rindo'), 'assets/characters/matilde-rindo.png');
  assert.equal(A.portraitArt('matilde', 'triste'), 'assets/characters/matilde.png');
  assert.equal(A.portraitArt('sol', 'feliz'), null);
  assert.equal(A.areaArt('restaurante', 'decorado'), 'assets/areas/restaurante-decorado.png');
  assert.equal(A.areaArt('restaurante', 'limpo'), null);
  const P = await import('../src/ui/portraits.js');
  assert.ok(P.portrait('matilde', 'rindo').startsWith('<img'));
  assert.ok(P.portrait('sol', 'feliz').startsWith('<svg'));
  A.setManifest(null);
  assert.ok(P.portrait('matilde', 'rindo').startsWith('<svg'));
});

test('cafeteria com interior: 6 etapas e saves antigos (3 etapas) convertidos sem perda', () => {
  const caf = AREAS.find((a) => a.id === 'cafeteria');
  assert.ok(caf.interior);
  assert.deepEqual(caf.steps.map((x) => x.id), ['limpar', 'piso', 'parede', 'moveis', 'decor', 'estilo']);
  // save antigo que já terminou a cafeteria: continua terminada
  const a = fresh(); a.village.cafeteria = { step: 3, choices: { estilo: 'tropical', decor: 'rustico' } };
  const a2 = S.deserialize(S.serialize(a), T0);
  assert.equal(a2.village.cafeteria.step, 6);
  assert.equal(a2.village.cafeteria.choices.piso, 'rustico');
  assert.equal(a2.village.cafeteria.choices.estilo, 'tropical');
  // save antigo só com a fachada: volta para "limpo" e recebe as 10 estrelas de volta
  const b = fresh(); b.village.cafeteria = { step: 2, choices: { estilo: 'moderno' } }; const stars = b.wallet.stars;
  const b2 = S.deserialize(S.serialize(b), T0);
  assert.equal(b2.village.cafeteria.step, 1);
  assert.equal(b2.wallet.stars, stars + 10);
  // save novo não é mexido
  const c = fresh(); c.village.cafeteria = { step: 2, choices: { piso: 'moderno' } };
  assert.equal(S.deserialize(S.serialize(c), T0).village.cafeteria.step, 2);
});

test('paisagem da vila: fundo e enfeites em imagem entram no mapa; sem imagem, continua desenhado', async () => {
  const A = await import('../src/ui/assets.js');
  const art = await import('../src/ui/art.js');
  const info = (id) => M.areaInfo(fresh(), id);
  A.setManifest({ scenery: { fundo: 'areas/vila-fundo.webp', palmeira: 'areas/enfeite-palmeira.webp' } });
  const com = art.villageSvg(info, 1);
  assert.ok(com.includes('assets/areas/vila-fundo.webp'));
  assert.ok(com.includes('assets/areas/enfeite-palmeira.webp'));
  assert.ok(!com.includes('class="boat"'), 'com fundo em imagem, os barcos desenhados saem');
  A.setManifest(null);
  const sem = art.villageSvg(info, 1);
  assert.ok(!sem.includes('vila-fundo') && sem.includes('class="boat"'));
});

test('fundos de tela: menu, conversas e mesa usam imagem quando existe; sem imagem, continua desenhado', async () => {
  const A = await import('../src/ui/assets.js');
  const art = await import('../src/ui/art.js');
  A.setManifest({ portraits: { 'dakota:menu': 'characters/dakota-menu.webp' }, scenery: { 'fundo-menu': 'areas/fundo-menu.webp', 'fundo-conversa': 'areas/fundo-conversa.webp', 'fundo-conversa-dentro': 'areas/fundo-conversa-dentro.webp', 'mesa-menu': 'areas/mesa-menu.webp' } });
  const menu = art.titleArt(fresh().player);
  assert.ok(menu.includes('assets/areas/fundo-menu.webp') && menu.includes('class="mesa"'));
  assert.ok(art.sceneBg('vila').includes('fundo-conversa.webp'));
  assert.ok(art.sceneBg('interior').includes('fundo-conversa-dentro.webp'));
  A.setManifest(null);
  assert.ok(!art.titleArt(fresh().player).includes('fundo-menu') && !art.sceneBg('vila').includes('<image'));
});

test('dica de combinação: acha os iguais do item tocado e um par para a dica', () => {
  const s = fresh(), b = s.boards.main;
  b.cells = b.cells.map(() => null);
  assert.equal(B.findPair(b), null, 'tabuleiro vazio: sem dica');
  put(s, 0, 'cafe:2'); put(s, 5, 'cafe:2'); put(s, 9, 'cafe:3'); put(s, 12, 'cafe:2', { covered: 1 });
  assert.deepEqual(B.matchesOf(b, 0), [5], 'só o igual livre; nem o de outro nível nem o escondido no caixote');
  assert.deepEqual(B.findPair(b), [0, 5]);
  put(s, 5, 'cafe:2', { locked: 1 });
  assert.deepEqual(B.matchesOf(b, 5), [0], 'item preso combina se o outro vier até ele');
  assert.deepEqual(B.findPair(b), [0, 5], 'sem par livre, aceita livre + preso');
  put(s, 20, 'pao:1'); put(s, 21, 'pao:1');
  assert.deepEqual(B.findPair(b), [20, 21], 'prefere dois itens livres');
});
