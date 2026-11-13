// Teste de fumaça da interface em navegador real (Playwright + Chromium).
// Uso: npm start (em outro terminal) e depois: node tests/ui-smoke.mjs [pasta-de-capturas]
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright não instalado — teste de interface ignorado.'); process.exit(0); }

const URL = process.env.GAME_URL || 'http://localhost:8080/';
const out = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: out ? 2 : 1, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
const shot = async (name) => { if (out) await page.waitForTimeout(450); if (out) await page.screenshot({ path: `${out}/${name}.png` }); };
const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__dakota.s)));
const center = async (sel) => { const b = await page.locator(sel).first().boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
async function drag(from, to) {
  const [x1, y1] = await center(`.cell[data-i="${from}"]`), [x2, y2] = await center(`.cell[data-i="${to}"]`);
  await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move((x1 + x2) / 2, (y1 + y2) / 2, { steps: 4 }); await page.mouse.move(x2, y2, { steps: 4 }); await page.mouse.up();
}

/** Dispensa cenas de história e avisos de nível que apareçam no caminho. */
async function settle() {
  for (let k = 0; k < 12; k++) {
    await page.waitForTimeout(120);
    if (await page.locator('.dlg').count()) { await page.click('[data-act="dskip"]'); continue; }
    if (await page.locator('.levelup').count()) { await page.click('.levelup [data-act="close"]'); continue; }
    break;
  }
}
const stepAndSettle = async () => { await page.click('[data-act="step"]'); await page.waitForTimeout(1000); await settle(); };

await page.goto(URL);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForSelector('.menu');
await shot('01-menu');

// Novo jogo → personalização → introdução
await page.click('[data-act="play"]');
await page.waitForSelector('#pname');
await page.fill('#pname', 'Day');
await page.click('.sw[data-hair="#8a4fff"]');
assert.equal(await page.inputValue('#pname'), 'Day', 'nome preservado ao trocar o cabelo');
await page.click('.sw[data-hair="#ff5fa2"]');
await shot('02-perfil');
await page.click('[data-act="profileok"]');
await page.waitForSelector('.dlg');
await shot('03-dialogo');
for (let k = 0; k < 20 && (await page.locator('.dlg').count()); k++) {
  if (await page.locator('.dlg-opts').count()) { await shot('04-escolha'); await page.click('.dlg-opts .btn >> nth=0'); } else await page.click('.dlg-box');
}
let s = await state();
assert.deepEqual(s.story.seen, ['intro']);
assert.equal(s.story.rel.matilde, 1);
assert.equal(s.player.name, 'Day');
await page.waitForSelector('.grid');
assert.equal(await page.locator('.cell').count(), 63);
assert.ok((await page.locator('.order').count()) >= 3, 'pedidos visíveis');
await shot('05-tabuleiro');

// Layout: nada estoura a tela
const fits = await page.evaluate(() => { const g = document.querySelector('.grid').getBoundingClientRect(), b = document.querySelector('.bar').getBoundingClientRect(); return g.left >= 0 && g.right <= innerWidth && b.bottom <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth; });
assert.ok(fits, 'tabuleiro e barra cabem na tela');

// Gerador produz e gasta energia
const gi = s.boards.main.cells.findIndex((c) => c && c.id === 'gen:cafe');
await page.click(`.cell[data-i="${gi}"]`);
let s2 = await state();
assert.equal(s2.energy.cur, s.energy.cur - 1, 'energia consumida');
assert.equal(s2.stats.generated, 1);

// Arrastar para combinar (prepara dois itens iguais em células conhecidas)
await page.evaluate(() => { const G = window.__dakota, c = G.s.boards.main.cells; c[16] = { id: 'pao:1', u: 9001 }; c[18] = { id: 'pao:1', u: 9002 }; });
await page.click('.cell[data-i="16"]'); // força redesenho e seleciona
await shot('06-selecionado');
await drag(16, 18);
s2 = await state();
assert.equal(s2.boards.main.cells[18].id, 'pao:2', 'arrastar combina');
assert.equal(s2.boards.main.cells[16], null);
assert.ok(s2.stats.merges >= 1);

// Vender e desfazer
await page.click('.cell[data-i="18"]');
await page.click('[data-act="sell"]');
assert.equal((await state()).boards.main.cells[18], null);
await page.click('[data-act="undo"]');
assert.equal((await state()).boards.main.cells[18].id, 'pao:2');

// Entregar um pedido
await page.evaluate(() => { const G = window.__dakota, o = G.s.orders.active[0]; let i = 16; const c = G.s.boards.main.cells; for (const [id, n] of o.need) for (let k = 0; k < n; k++) { while (c[i]) i++; c[i] = { id, u: 9100 + i }; } });
await page.click('.cell[data-i="30"]');
await page.waitForSelector('.order.ready [data-act="deliver"]');
await shot('07-pedido-pronto');
await page.click('.order.ready [data-act="deliver"]');
await settle();
s2 = await state();
assert.equal(s2.stats.deliveries, 1);
assert.ok(s2.wallet.stars >= 1);

// Vila: reforma com escolha de estilo e cena de história
await page.evaluate(() => { window.__dakota.s.wallet.stars = 60; });
await page.click('.bar [data-scene="village"]');
await page.waitForSelector('.village');
await page.waitForTimeout(400);
await shot('08-vila');
await page.click('.area[data-id="restaurante"]', { force: true });
await page.waitForSelector('.zoomwrap');
await shot('09-restaurante-abandonado');
await stepAndSettle();
assert.ok((await state()).story.seen.includes('r_limpar'), 'reforma dispara cena');
await page.waitForSelector('.styles');
await page.click('.style[data-style="moderno"]');
await shot('10-escolha-estilo');
await stepAndSettle();
s2 = await state();
assert.equal(s2.village.restaurante.step, 2);
assert.equal(s2.village.restaurante.choices.piso, 'moderno');
for (const st of ['tropical', 'rustico', 'tropical', 'tropical']) {
  await page.click(`.style[data-style="${st}"]`); await stepAndSettle();
}
assert.equal((await state()).village.restaurante.step, 6);
await shot('11-restaurante-pronto');
const before = await page.locator('.zoomwrap').innerHTML();
await page.click('.chip[data-key="piso"][data-style="rustico"]');
assert.notEqual(await page.locator('.zoomwrap').innerHTML(), before, 'trocar o estilo muda o cenário');
await page.click('[data-act="view"][data-view="fora"]');
await shot('12-fachada');
await page.click('.x'); await settle();
await shot('13-vila-reformada');

// Painéis
for (const [name, tabsToVisit] of [['historia', []], ['personagens', []], ['colecoes', ['album', 'ach']], ['eventos', ['missoes', 'fest', 'tesouro']]]) {
  await page.click(`.bar [data-name="${name}"]`);
  await page.waitForSelector('.sheet');
  await shot('20-' + name);
  for (const t of tabsToVisit) { await page.click(`.tabs [data-tab="${t}"]`); await shot(`21-${name}-${t}`); }
  if (name === 'eventos') {
    await page.click('.dig >> nth=6');
    assert.equal(Object.keys((await state()).hunt.dug).length, 1, 'cavar funciona');
    await page.click('.tabs [data-tab="cal"]');
    await page.click('[data-act="login"]');
    assert.ok((await state()).daily.loginStreak === 1, 'bônus de login');
  }
  await page.click('.x');
}

// Tabuleiro de evento
await page.click('.bar [data-name="eventos"]');
await page.click('.tabs [data-tab="fest"]');
await page.click('[data-act="eventboard"]');
await page.waitForSelector('.board.event .grid');
assert.equal(await page.locator('.cell').count(), 25);
const tk = (await state()).fest.tickets.cur;
await page.click('.cell[data-i="12"]');
assert.equal((await state()).fest.tickets.cur, tk - 1, 'evento gasta fichas');
await shot('30-evento');
await page.click('.bar [data-scene="board"]');

// Oficina, loja, inventário
await page.evaluate(() => { const w = window.__dakota.s.wallet; w.comps = 20; w.coins = 2000; w.gems = 50; });
await page.click('.bar [data-name="oficina"]');
await page.click('[data-act="upgrade"][data-type="cafe"]');
assert.equal((await state()).gens.cafe.lvl, 2);
await shot('31-oficina');
await page.click('.x');
await page.click('.pill >> nth=1');
await page.waitForSelector('.shop');
await page.click('[data-act="buy"][data-id="coringa"]');
assert.deepEqual((await state()).inbox.slice(-1), ['coringa:1']);
await shot('32-loja');
await page.click('.x');
await page.click('.cell[data-i="18"]');
await page.click('[data-act="store"]');
assert.equal((await state()).inv.items.length, 1);
await page.click('.rail [data-name="inventario"]');
await shot('33-inventario');
await page.click('[data-act="retrieve"]');
assert.equal((await state()).inv.items.length, 0);
await page.click('.x');
await shot('34-tabuleiro-final');

// Salvamento automático sobrevive a recarregar
await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
const saved = await state();
await page.reload();
await page.waitForSelector('.menu');
assert.ok((await page.textContent('[data-act="play"]')).includes('Continuar'));
const loaded = await state();
assert.equal(loaded.player.name, 'Day');
assert.equal(loaded.village.restaurante.step, 6);
assert.equal(loaded.gens.cafe.lvl, 2);
assert.equal(loaded.stats.deliveries, saved.stats.deliveries);
await page.click('[data-act="play"]');
await page.waitForSelector('.grid');

// Telas pequenas e largas
for (const [w, h] of [[320, 568], [360, 640], [412, 915], [1280, 800]]) {
  await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(500);
  await page.waitForTimeout(100);
  const ok = await page.evaluate(() => { const g = document.querySelector('.grid').getBoundingClientRect(), b = document.querySelector('.bar').getBoundingClientRect(), a = document.querySelector('#app').getBoundingClientRect(); return g.left >= a.left - 1 && g.right <= a.right + 1 && b.bottom <= innerHeight + 1 && g.top >= 0 && g.height > 150; });
  if (!ok) console.log(await page.evaluate(() => ['.hud', '.orders', '.grid-wrap', '.grid', '.info', '.bar'].map((q) => { const r = document.querySelector(q).getBoundingClientRect(); return `${q} ${Math.round(r.top)}-${Math.round(r.bottom)} x${Math.round(r.left)}-${Math.round(r.right)}`; })));
  assert.ok(ok, `layout cabe em ${w}x${h}`);
  await shot(`40-${w}x${h}`);
}

await browser.close();
assert.deepEqual(errors, [], 'sem erros no console');
console.log('Interface OK — todos os fluxos passaram.');
