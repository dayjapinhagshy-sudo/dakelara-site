// Gera assets/manifest.json a partir dos PNG/WebP nas pastas de assets.
// Nomes: items/cafe-3.png → "cafe:3" · items/gen-cafe.png → "gen:cafe"
//        characters/dakota.png ou dakota-rindo.png · areas/restaurante-decorado.png
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allItemIds, GENERATORS } from '../src/data/items.js';
import { CHARACTERS, AREAS } from '../src/data/world.js';

const root = fileURLToPath(new URL('../assets/', import.meta.url));
const EXPR = ['feliz', 'rindo', 'neutro', 'triste', 'surpreso', 'bravo'];
const STATES = ['abandonado', 'limpo', 'reformado', 'decorado'];
const list = (d) => (existsSync(root + d) ? readdirSync(root + d).filter((f) => /\.(png|webp)$/i.test(f)) : []);
const valid = new Set([...allItemIds(), ...Object.keys(GENERATORS).map((g) => 'gen:' + g)]);
const out = { items: {}, portraits: {}, areas: {} }, warn = [];

for (const f of list('items')) {
  const base = f.replace(/\.\w+$/, ''), m = base.match(/^(.+)-(\d+)$/);
  const id = base.startsWith('gen-') ? 'gen:' + base.slice(4) : m ? `${m[1]}:${m[2]}` : base;
  if (valid.has(id)) out.items[id] = 'items/' + f; else warn.push(`items/${f}: nenhum item "${id}"`);
}
for (const f of list('characters')) {
  const [who, expr] = f.replace(/\.\w+$/, '').split('-');
  if (!CHARACTERS[who] || (expr && !EXPR.includes(expr))) { warn.push(`characters/${f}: personagem ou expressão desconhecida`); continue; }
  out.portraits[expr ? `${who}:${expr}` : who] = 'characters/' + f;
}
for (const f of list('areas')) {
  const [area, st] = f.replace(/\.\w+$/, '').split('-');
  if (!AREAS.some((a) => a.id === area) || (st && !STATES.includes(st))) { warn.push(`areas/${f}: área ou estado desconhecido`); continue; }
  out.areas[st ? `${area}:${st}` : area] = 'areas/' + f;
}
writeFileSync(root + 'manifest.json', JSON.stringify(out, null, 2) + '\n');
console.log(`manifest.json: ${Object.keys(out.items).length} itens, ${Object.keys(out.portraits).length} retratos, ${Object.keys(out.areas).length} áreas`);
for (const w of warn) console.warn('aviso:', w);
