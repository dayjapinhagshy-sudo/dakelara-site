// Arte opcional em imagem (ex.: renders 3D em PNG). O que estiver listado em assets/manifest.json
// substitui o emoji/SVG correspondente; o que faltar continua com a arte gerada por código.
let M = { items: {}, portraits: {}, areas: {} };

export function setManifest(m) {
  M = { items: {}, portraits: {}, areas: {}, ...(m || {}) };
  return M;
}
export async function loadManifest(url = 'assets/manifest.json') {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return setManifest(null);
    return setManifest(await r.json());
  } catch (e) { console.warn('[assets] manifesto indisponível, usando arte gerada', e); return setManifest(null); }
}
const url = (p) => (p ? 'assets/' + p : null);
/** Imagem de um item ("cafe:3") ou gerador ("gen:cafe"). */
export const itemArt = (id) => url(M.items[id]);
/** Retrato: tenta "dakota:rindo", depois "dakota". */
export const portraitArt = (id, expr) => url(M.portraits[`${id}:${expr}`] || M.portraits[id]);
/** Dakota em pose para a tela inicial (characters/dakota-menu.png). */
export const menuArt = () => url(M.portraits['dakota:menu']);
/** Área da vila por estado: "restaurante:decorado", depois "restaurante". */
export const areaArt = (id, status) => url(M.areas[`${id}:${status}`] || M.areas[id]);
