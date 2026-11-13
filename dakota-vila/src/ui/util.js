// Utilidades de interface.
import { itemDef } from '../data/items.js';

export const $ = (q, el = document) => el.querySelector(q);
export const $$ = (q, el = document) => [...el.querySelectorAll(q)];
export const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function fmt(ms) {
  let s = Math.max(0, Math.ceil(ms / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
/** Texto de contagem regressiva que a interface atualiza a cada segundo. */
export const timer = (ts, now) => `<span data-t="${ts}">${fmt(ts - now)}</span>`;

/** Ícone de item em miniatura (com moldura de raridade). */
export function ico(id, { known = true, n = 0, check = false } = {}) {
  const d = itemDef(id);
  return `<span class="it mini r${d.rarity} ${d.kind === 'gen' ? 'gen' : ''} ${known ? '' : 'unknown'}" title="${known ? esc(d.name) : '???'}"><span class="em">${d.icon}</span>${n > 1 ? `<b class="cnt">×${n}</b>` : ''}${check ? '<b class="ok">✓</b>' : ''}</span>`;
}
export const bar = (v, max, label = '') => `<div class="pbar"><i style="width:${Math.min(100, (v / max) * 100)}%"></i><span>${label || `${v}/${max}`}</span></div>`;
export const priceText = (p) => Object.entries(p).map(([k, v]) => `${{ coins: '🪙', gems: '💎', comps: '🧩', stars: '⭐' }[k]} ${v}`).join(' ');
