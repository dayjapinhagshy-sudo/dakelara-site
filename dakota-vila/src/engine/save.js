// Persistência local com cópia de segurança, versão e recuperação de erros.
import { CFG } from '../data/config.js';
import { itemDef } from '../data/items.js';
import { newGame } from './core.js';

export const KEY = 'dakota-vila-save';
export const KEY_BAK = 'dakota-vila-save-bak';

/** Preenche campos novos em saves antigos e descarta itens que não existem mais. */
export function migrate(s, now = Date.now()) {
  const base = newGame(now);
  const merge = (dst, src) => { for (const k of Object.keys(src)) { if (dst[k] === undefined) dst[k] = src[k]; else if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && typeof dst[k] === 'object' && dst[k] && k !== 'boards') merge(dst[k], src[k]); } };
  const boards = s.boards;
  merge(s, { ...base, story: { ...base.story, queue: [] } });
  s.boards = boards && boards.main ? boards : base.boards;
  const valid = (id) => { try { itemDef(id); return true; } catch { return false; } };
  for (const b of Object.values(s.boards)) b.cells = b.cells.map((c) => (c && valid(c.id) ? c : null));
  s.inv.items = s.inv.items.filter((c) => c && valid(c.id));
  s.inbox = s.inbox.filter(valid);
  s.v = CFG.saveVersion;
  return s;
}

export function serialize(s) { return JSON.stringify(s); }
export function deserialize(text, now = Date.now()) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || !s.boards || !s.wallet || !s.player) throw new Error('Save inválido');
  return migrate(s, now);
}

export function save(s, storage, now = Date.now()) {
  try {
    s.lastSeen = now;
    const prev = storage.getItem(KEY);
    if (prev) storage.setItem(KEY_BAK, prev);
    storage.setItem(KEY, serialize(s));
    return true;
  } catch (e) { console.error('[save] falha ao salvar', e); return false; }
}

/** Carrega o save; se estiver corrompido tenta a cópia de segurança. Devolve null se não houver nenhum. */
export function load(storage, now = Date.now()) {
  for (const k of [KEY, KEY_BAK]) {
    try {
      const t = storage.getItem(k);
      if (t) return deserialize(t, now);
    } catch (e) { console.error(`[save] ${k} corrompido, tentando alternativa`, e); }
  }
  return null;
}
export function wipe(storage) { storage.removeItem(KEY); storage.removeItem(KEY_BAK); }
