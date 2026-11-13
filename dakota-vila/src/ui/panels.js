// Painéis (folhas modais): cada função devolve { title, body } a partir do estado.
import { CFG, SHOP, LOGIN_REWARDS, HUNT } from '../data/config.js';
import { CHAINS, GENERATORS, CHAIN_GEN } from '../data/items.js';
import { CHARACTERS, AREAS, STYLES, SCENES, CHAPTERS } from '../data/world.js';
import { rewardText, dayEnd, weekEnd } from '../engine/core.js';
import * as M from '../engine/meta.js';
import { portrait, areaZoom, interiorSvg } from './art.js';
import { esc, timer, ico, bar, priceText, fmt } from './util.js';

const tabs = (m, list) => `<nav class="tabs">${list.map(([k, label]) => `<button class="${(m.tab || list[0][0]) === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${label}</button>`).join('')}</nav>`;
const claimBtn = (can, done, act, attrs, label = 'Coletar') => done ? '<span class="done">✓ Coletado</span>' : `<button class="btn sm ${can ? 'go' : ''}" ${can ? '' : 'disabled'} data-act="${act}" ${attrs}>${label}</button>`;
const CHOICE_NAMES = { piso: 'Piso', parede: 'Paredes', moveis: 'Móveis', decor: 'Decoração', estilo: 'Fachada' };

function preview(a, info, key, style) {
  const fake = { ...info, step: info.step + 1, choices: { ...info.choices, [key]: style } };
  const total = a.steps.length;
  fake.status = fake.step >= total ? 'decorado' : fake.step === 1 ? 'limpo' : 'reformado';
  return a.interior && key !== 'estilo' ? interiorSvg(fake) : areaZoom(a, fake);
}

export const PANELS = {
  area(G, m) {
    const s = G.s, info = M.areaInfo(s, m.id), a = info.a, next = info.next;
    const view = m.view || (a.interior ? 'dentro' : 'fora');
    let body = `<div class="zoomwrap">${a.interior && view === 'dentro' ? interiorSvg(info) : areaZoom(a, info)}</div>`;
    if (a.interior) body += `<nav class="tabs small"><button class="${view === 'dentro' ? 'on' : ''}" data-act="view" data-view="dentro">Salão</button><button class="${view === 'fora' ? 'on' : ''}" data-act="view" data-view="fora">Fachada</button></nav>`;
    body += `<div class="row between"><span class="tag ${info.status}">${M.STATUS_NAMES[info.status]}</span>${bar(info.step, info.total, `Etapa ${info.step}/${info.total}`)}</div>`;
    if (!info.unlocked) body += `<p class="note">🔒 Este terreno será liberado no <b>nível ${a.lvl}</b>. Continue atendendo pedidos!</p>`;
    else if (next) {
      const can = s.wallet.stars >= next.stars;
      body += `<div class="card"><h3>🔨 ${next.name}</h3>`;
      if (next.choice) {
        const sel = m.style || 'tropical';
        body += `<p class="note">Escolha um estilo — o cenário muda de verdade e a escolha fica salva.</p><div class="styles">${Object.entries(STYLES).map(([k, st]) => `<button class="style ${sel === k ? 'on' : ''}" data-act="pickstyle" data-style="${k}">${preview(a, info, next.choice, k)}<b>${st.name}</b></button>`).join('')}</div>`;
        body += `<button class="btn big ${can ? 'go' : ''}" ${can ? '' : 'disabled'} data-act="step" data-id="${a.id}" data-style="${sel}">Reformar em estilo ${STYLES[sel].name} · ⭐ ${next.stars}</button>`;
      } else body += `<button class="btn big ${can ? 'go' : ''}" ${can ? '' : 'disabled'} data-act="step" data-id="${a.id}">${next.name} · ⭐ ${next.stars}</button>`;
      if (!can) body += `<p class="note">Faltam ⭐ ${next.stars - s.wallet.stars}. Entregue pedidos no tabuleiro para ganhar estrelas.</p>`;
      body += '</div>';
    } else body += `<p class="note">✨ Reforma completa! Você pode trocar os estilos quando quiser.</p>`;
    const keys = Object.keys(info.choices);
    if (keys.length) body += `<div class="card"><h3>🎨 Estilos escolhidos</h3>${keys.map((k) => `<div class="row"><span class="lbl">${CHOICE_NAMES[k]}</span>${Object.entries(STYLES).map(([sk, st]) => `<button class="chip ${info.choices[k] === sk ? 'on' : ''}" data-act="setchoice" data-id="${a.id}" data-key="${k}" data-style="${sk}">${st.name}</button>`).join('')}</div>`).join('')}</div>`;
    return { title: `${a.icon} ${a.name}`, body };
  },

  inventario(G) {
    const s = G.s;
    let cells = '';
    for (let k = 0; k < s.inv.slots; k++) { const it = s.inv.items[k]; cells += it ? `<button class="slot" data-act="retrieve" data-k="${k}">${ico(it.id)}</button>` : '<span class="slot empty"></span>'; }
    const cost = CFG.inventory.costGems(s.inv.slots);
    return { title: '🎒 Inventário', body: `<p class="note">Toque em um item para devolvê-lo ao tabuleiro. Para guardar, selecione um item no tabuleiro e toque em <b>Guardar</b> (ou arraste até a mochila).</p><div class="slots">${cells}</div>
      ${s.inv.slots < CFG.inventory.max ? `<button class="btn big" data-act="expand">Expandir +2 espaços · 💎 ${cost}</button>` : '<p class="note">Inventário no tamanho máximo.</p>'}
      ${s.inbox.length ? `<div class="card"><h3>📬 Caixa de entrada (${s.inbox.length})</h3><div class="icons">${s.inbox.slice(0, 24).map((id) => ico(id)).join('')}</div><button class="btn go" data-act="inbox">Colocar no tabuleiro</button></div>` : ''}` };
  },

  loja(G) {
    const s = G.s;
    return { title: '🛒 Loja da Vila', body: `<p class="note">Tudo aqui é comprado com moedas e gemas ganhas jogando. Não há compras com dinheiro real nem anúncios.</p><div class="shop">${SHOP.map((it) => {
      const can = Object.entries(it.price).every(([k, v]) => s.wallet[k] >= v);
      return `<div class="shopitem"><span class="big-em">${it.icon}</span><b>${it.name}</b><small>${it.desc}</small><button class="btn sm ${can ? 'go' : ''}" ${can ? '' : 'disabled'} data-act="buy" data-id="${it.id}">${priceText(it.price)}</button></div>`;
    }).join('')}</div>` };
  },

  oficina(G) {
    const s = G.s;
    const rows = Object.entries(GENERATORS).filter(([, g]) => !g.event).map(([type, g]) => {
      const u = M.upgradeInfo(s, type);
      if (!u.lvl) return `<div class="gen-row locked"><span class="it mini gen unknown"><span class="em">${g.icon}</span></span><div><b>${g.name}</b><small>🔒 Desbloqueia no nível ${g.unlock}</small></div></div>`;
      const L = g.levels[u.lvl - 1], N = g.levels[u.lvl];
      const hi = (x) => 100 - x.lv[0];
      const can = u.cost && s.wallet.comps >= u.cost.comps && s.wallet.coins >= u.cost.coins;
      return `<div class="gen-row"><span class="it mini gen r2"><span class="em">${g.icon}</span></span><div><b>${g.name}</b> <span class="stars">${'★'.repeat(u.lvl)}${'☆'.repeat(u.max - u.lvl)}</span>
        <small>${g.mode === 'auto' ? `Automático · 1 item a cada ${L.every}s` : `Manual · ⚡${g.energy} por toque`} · ${L.charges} cargas · recarga ${fmt(L.cd * 1000)} · ${hi(L)}% de itens nível 2+</small>
        <small>Produz: ${g.drops.map(([c]) => CHAINS[c].name).join(', ')}</small>
        ${N ? `<small class="up">Próximo nível: ${N.charges} cargas · recarga ${fmt(N.cd * 1000)} · ${hi(N)}% nível 2+</small>` : ''}</div>
        ${u.cost ? `<button class="btn sm ${can ? 'go' : ''}" ${can ? '' : 'disabled'} data-act="upgrade" data-type="${type}">Evoluir<br>🧩 ${u.cost.comps} · 🪙 ${u.cost.coins}</button>` : '<span class="done">Máximo</span>'}</div>`;
    }).join('');
    return { title: '🔧 Oficina Dakota', body: `<div class="row between"><p class="note">Colete peças 🧩 no tabuleiro (elas saem dos geradores e dos baús) para evoluir seus geradores.</p><span class="pill">🧩 ${s.wallet.comps}</span></div>${rows}` };
  },

  colecoes(G, m) {
    const s = G.s, tab = m.tab || 'fam';
    let body = tabs(m, [['fam', 'Famílias'], ['album', 'Álbum'], ['ach', 'Conquistas']]);
    if (tab === 'fam') {
      const total = Object.keys(s.discovered).length;
      body += `<p class="note">Itens descobertos: <b>${total}</b>. Complete uma família para ganhar ${rewardText(M.FAMILY_REWARD)}.</p>`;
      body += Object.entries(CHAINS).filter(([, c]) => c.kind !== 'tool').map(([chain, c]) => {
        const f = M.familyState(s, chain), g = GENERATORS[CHAIN_GEN[chain]];
        return `<div class="card fam"><div class="row between"><h3>${g ? g.icon + ' ' : ''}${c.name}</h3><span>${f.have}/${f.total} ${f.complete ? claimBtn(!f.claimed, f.claimed, 'family', `data-chain="${chain}"`) : ''}</span></div>
          <div class="icons">${c.items.map((_, i) => ico(`${chain}:${i + 1}`, { known: !!s.discovered[`${chain}:${i + 1}`] })).join('<i class="arrow">›</i>')}</div></div>`;
      }).join('');
    } else if (tab === 'album') {
      body += `<p class="note">Cartas vêm de pedidos VIP, eventos, tesouros e pacotes da loja. Repetidas viram 🪙 20.</p>` + M.albumState(s).map((a) => `<div class="card"><div class="row between"><h3>🎴 ${a.name}</h3><span>${a.have}/${a.cards.length} ${a.complete ? claimBtn(!a.claimed, a.claimed, 'album', `data-id="${a.id}"`) : ''}</span></div>
        <div class="cards">${a.cards.map((c) => `<div class="tcard ${c.n ? '' : 'off'}"><span>${c.n ? c.icon : '?'}</span><small>${c.n ? c.name : '???'}</small>${c.n > 1 ? `<b>×${c.n}</b>` : ''}</div>`).join('')}</div><small>Prêmio: ${rewardText(a.reward)}</small></div>`).join('');
    } else {
      body += M.achState(s).map((a) => `<div class="task ${a.claimed ? 'claimed' : ''}"><div><b>🏅 ${a.name}</b><small>${a.desc}</small>${bar(a.prog, a.goal)}</div><div class="rw"><small>${rewardText(a.reward)}</small>${claimBtn(a.done, a.claimed, 'ach', `data-id="${a.id}"`)}</div></div>`).join('');
    }
    return { title: '📖 Coleções', body };
  },

  eventos(G, m) {
    const s = G.s, now = Date.now(), tab = m.tab || 'cal';
    const fest = M.festState(s, now), login = M.loginState(s, now);
    let body = tabs(m, [['cal', 'Calendário'], ['missoes', 'Missões'], ['fest', fest.def.icon + ' Festival'], ['tesouro', '⛏️ Tesouro']]);
    if (tab === 'cal') {
      body += `<div class="card"><h3>🎁 Bônus de login</h3><div class="login">${LOGIN_REWARDS.map((r, i) => `<div class="day ${i < login.idx || (i === login.idx && login.claimedToday) ? 'got' : ''} ${i === login.idx && login.canClaim ? 'today' : ''}"><small>Dia ${i + 1}</small><span>${rewardText(r)}</span></div>`).join('')}</div>
        ${login.canClaim ? '<button class="btn big go" data-act="login">Coletar bônus de hoje</button>' : `<p class="note">Volte amanhã! Próximo bônus em ${timer(dayEnd(now), now)}.</p>`}</div>`;
      body += `<div class="card"><h3>🗓️ Acontecendo agora</h3>
        <button class="evrow" data-act="tab" data-tab="fest"><span class="big-em">${fest.def.icon}</span><div><b>${fest.def.name}</b><small>Termina em ${timer(fest.end, now)} · ${fest.pts} pontos</small></div></button>
        <button class="evrow" data-act="tab" data-tab="missoes"><span class="big-em">📋</span><div><b>Missões do dia</b><small>Renovam em ${timer(dayEnd(now), now)}</small></div></button>
        <button class="evrow" data-act="tab" data-tab="missoes"><span class="big-em">🗒️</span><div><b>Missões da semana</b><small>Renovam em ${timer(weekEnd(now), now)}</small></div></button>
        <button class="evrow" data-act="tab" data-tab="tesouro"><span class="big-em">⛏️</span><div><b>Caça ao Tesouro</b><small>Mapa ${s.hunt.map} · ${s.hunt.shovels} pás · sempre aberto</small></div></button>
        <button class="evrow" data-act="modal" data-name="colecoes" data-tab="album"><span class="big-em">🎴</span><div><b>Álbum da Vila</b><small>${M.albumState(s).reduce((n, a) => n + a.have, 0)} cartas coletadas</small></div></button></div>`;
    } else if (tab === 'missoes') {
      for (const [scope, label, end] of [['daily', 'Missões do dia', dayEnd(now)], ['weekly', 'Missões da semana', weekEnd(now)]]) {
        body += `<div class="card"><div class="row between"><h3>${label}</h3><small>⏳ ${timer(end, now)}</small></div>${M.tasks(s, scope, now).map((t) => `<div class="task ${t.claimed ? 'claimed' : ''}"><div><b>${t.text}</b>${bar(t.prog, t.n)}</div><div class="rw"><small>${rewardText(t.reward)}</small>${claimBtn(t.done, t.claimed, 'task', `data-scope="${scope}" data-id="${t.id}"`)}</div></div>`).join('')}</div>`;
      }
    } else if (tab === 'fest') {
      const last = fest.milestones.at(-1).pts;
      body += `<div class="card festhead"><span class="big-em">${fest.def.icon}</span><div><h3>${fest.def.name}</h3><small>${fest.def.desc}</small><small>⏳ Termina em ${timer(fest.end, now)}</small></div></div>
        <div class="row between"><b>${fest.pts} pontos</b>${bar(Math.min(fest.pts, last), last, `${fest.pts}/${last}`)}</div>
        <button class="btn big go" data-act="eventboard">🎊 Abrir tabuleiro do festival · 🎟️ ${s.fest.tickets.cur}</button>
        <p class="note">No tabuleiro do festival você usa fichas 🎟️ (não energia). Cada combinação de itens de festa rende pontos; entregas de pedidos também.</p>
        <div class="card"><h3>🎁 Passe gratuito</h3>${fest.milestones.map((ms) => `<div class="task ${ms.claimed ? 'claimed' : ''}"><div><b>${ms.pts} pontos</b><small>${rewardText(ms.reward)}</small></div>${claimBtn(ms.reached, ms.claimed, 'milestone', `data-i="${ms.i}"`)}</div>`).join('')}</div>
        <div class="card"><h3>🏁 Placar da vila</h3><p class="note">Corrida amistosa contra os moradores (pontuação simulada no próprio aparelho — não há ranking on-line).</p>${fest.rank.map((r, i) => `<div class="rank ${r.me ? 'me' : ''}"><b>${i + 1}º</b><span>${esc(r.name)}</span><b>${r.pts}</b></div>`).join('')}</div>`;
    } else {
      const h = M.huntState(s);
      let grid = '';
      for (let i = 0; i < h.size * h.size; i++) {
        const d = h.dug[i];
        const sym = !d ? '' : d.t === 'tesouro' ? '👑' : { nada: '', coins: '🪙', energy: '⚡', gems: '💎', comps: '🧩' }[d.t];
        grid += d ? `<span class="dig dug ${d.t === 'tesouro' ? 'tre' : ''}">${sym}${d.d ? `<b class="d${Math.min(d.d, 4)}">${d.d}</b>` : ''}</span>` : `<button class="dig" data-act="dig" data-i="${i}" aria-label="Cavar"></button>`;
      }
      body += `<div class="row between"><span class="pill">⛏️ ${h.shovels} pás</span><span class="pill">👑 ${h.found}/${h.total}</span><span class="pill">Mapa ${h.map}</span></div>
        <p class="note">Cave para achar os ${h.total} tesouros escondidos. O número mostra a quantos passos (sem diagonal) está o tesouro mais próximo. Cada pedido entregue rende uma pá.</p>
        <div class="hunt" style="--n:${h.size}">${grid}</div><p class="note">Prêmio do mapa: ${rewardText(HUNT.prize)}</p>`;
    }
    return { title: '🎪 Eventos', body };
  },

  personagens(G) {
    const s = G.s;
    return { title: '👥 Personagens', body: `<div class="chars">${Object.entries(CHARACTERS).map(([id, c]) => {
      const rel = s.story.rel[id] || 0, hearts = Math.min(5, Math.floor(rel / 3));
      const met = id === 'dakota' || s.story.seen.some((sc) => SCENES[sc].lines.some((l) => Array.isArray(l) && l[0] === id));
      return `<div class="char ${met ? '' : 'unmet'}">${portrait(met ? id : 'visitante', 'feliz', s.player)}<b>${id === 'dakota' ? esc(s.player.name) : met ? c.name : '???'}</b><small>${met ? c.role : 'Ainda não conhecido'}</small>
        ${met ? `<p>${c.bio}</p>` : ''}${id !== 'dakota' && met ? `<span class="hearts" title="Afinidade: ${rel}">${'❤️'.repeat(hearts)}${'🤍'.repeat(5 - hearts)}</span>${c.romance && hearts >= 2 ? '<small class="spark">💞 Há um clima no ar…</small>' : ''}` : ''}
        ${id === 'dakota' ? '<button class="btn sm" data-act="modal" data-name="perfil">Personalizar</button>' : ''}</div>`;
    }).join('')}</div>` };
  },

  historia(G) {
    const s = G.s;
    const body = CHAPTERS.map((ch) => {
      const scenes = Object.entries(SCENES).filter(([, sc]) => sc.cap === ch.id);
      const seen = scenes.filter(([id]) => s.story.seen.includes(id)).length;
      return `<div class="card"><div class="row between"><h3>Capítulo ${ch.id} — ${ch.name}</h3><small>${seen}/${scenes.length}</small></div>${scenes.map(([id, sc]) => s.story.seen.includes(id) ? `<button class="evrow" data-act="replay" data-id="${id}"><span class="big-em">▶️</span><div><b>${sc.title}</b><small>Toque para rever</small></div></button>` : `<div class="evrow off"><span class="big-em">🔒</span><div><b>???</b><small>Avance nas reformas para desbloquear</small></div></div>`).join('')}</div>`;
    }).join('');
    const vp = M.villageProgress(s);
    return { title: '📖 História', body: `<div class="row between"><p class="note">As reformas da vila desbloqueiam novas cenas.</p>${bar(vp.done, vp.total, `Vila ${vp.done}/${vp.total}`)}</div>${body}` };
  },

  perfil(G, m) {
    const p = G.s.player;
    const HAIR = ['#ff5fa2', '#8a4fff', '#2a2230', '#5a3620', '#f0c75e', '#e4572e', '#2fb5a5'];
    const SKIN = ['#fde0cc', '#f7cdb0', '#e0ad82', '#b97a56', '#8a5a3c'];
    return { title: m.first ? '✨ Quem é você?' : '🎀 Personalizar', body: `<div class="profile"><div class="bigportrait">${portrait('dakota', 'feliz', p)}</div>
      <label>Seu nome<input id="pname" maxlength="14" value="${esc(p.name)}" autocomplete="off"></label>
      <div><span class="lbl">Cabelo</span><div class="swatches">${HAIR.map((c) => `<button class="sw ${p.hair === c ? 'on' : ''}" style="background:${c}" data-act="look" data-hair="${c}" aria-label="Cor de cabelo"></button>`).join('')}</div></div>
      <div><span class="lbl">Pele</span><div class="swatches">${SKIN.map((c) => `<button class="sw ${p.skin === c ? 'on' : ''}" style="background:${c}" data-act="look" data-skin="${c}" aria-label="Tom de pele"></button>`).join('')}</div></div>
      <button class="btn big go" data-act="profileok">${m.first ? 'Começar a aventura' : 'Salvar'}</button></div>` };
  },

  config(G) {
    const st = G.s.settings;
    return { title: '⚙️ Configurações', body: `<div class="card"><button class="evrow" data-act="toggle" data-key="sfx"><span class="big-em">${st.sfx ? '🔊' : '🔇'}</span><div><b>Efeitos sonoros</b><small>${st.sfx ? 'Ligados' : 'Desligados'}</small></div></button>
      <button class="evrow" data-act="toggle" data-key="music"><span class="big-em">${st.music ? '🎵' : '🚫'}</span><div><b>Música ambiente</b><small>${st.music ? 'Ligada' : 'Desligada'}</small></div></button>
      <button class="evrow" data-act="modal" data-name="perfil"><span class="big-em">🎀</span><div><b>Personalizar protagonista</b><small>Nome, cabelo e pele</small></div></button></div>
      <div class="card"><h3>💾 Progresso</h3><p class="note">O jogo salva sozinho neste aparelho a cada poucos segundos.</p>
      <button class="btn" data-act="export">Copiar save</button> <button class="btn" data-act="import">Importar save</button> <button class="btn danger" data-act="reset">Apagar progresso</button>
      <textarea id="savebox" placeholder="Cole aqui um save exportado e toque em Importar" rows="3"></textarea></div>
      <p class="note center">Dakota Vila v0.1 — jogo gratuito, sem anúncios e sem compras.</p>` };
  },

  levelup(G, m) {
    return { title: '🎉 Novo nível!', body: `<div class="levelup"><div class="burst">${m.lvl}</div><h3>Você chegou ao nível ${m.lvl}!</h3><p>Energia recarregada ⚡</p><p class="rwbig">${rewardText(m.reward)}</p>
      ${m.unlocked.length ? `<div class="card"><h3>Novo gerador!</h3>${m.unlocked.map((g) => `<div class="row"><span class="it mini gen r2"><span class="em">${GENERATORS[g].icon}</span></span><b>${GENERATORS[g].name}</b></div>`).join('')}<p class="note">Ele está na sua caixa de entrada 📬.</p></div>` : ''}
      ${AREAS.filter((a) => a.lvl === m.lvl).map((a) => `<p>🗺️ Novo terreno na vila: <b>${a.name}</b></p>`).join('')}
      <button class="btn big go" data-act="close">Continuar</button></div>` };
  },

  ajuda() {
    return { title: '❓ Como jogar', body: `<div class="help">
      <p><b>Combine:</b> arraste um item sobre outro igual para evoluí-lo.</p>
      <p><b>Geradores</b> (moldura dourada): toque para criar itens. Cada toque gasta ⚡. Depois de algumas cargas eles precisam recarregar. Os automáticos 🌳 produzem sozinhos.</p>
      <p><b>Caixotes e itens presos 🔒:</b> combine ao lado de um caixote para abri-lo; combine um item igual sobre um preso para soltá-lo (ou pague moedas).</p>
      <p><b>Pedidos:</b> quando você tiver os itens pedidos, toque em <b>Entregar</b>. Você ganha 🪙, XP e ⭐.</p>
      <p><b>Estrelas ⭐</b> pagam as reformas na vila — e as reformas contam a história.</p>
      <p><b>Ferramentas:</b> ✂️ divide um item, 🃏 evolui qualquer item, ⏱️ recarrega um gerador. Arraste a ferramenta sobre o alvo.</p>
      <p><b>Bolhas 🫧</b> são itens bônus temporários: estoure com gemas antes que virem moedas.</p>
      <p><b>Vender / Desfazer:</b> selecione um item para vender; ↩️ desfaz a última venda.</p></div>` };
  },
};
