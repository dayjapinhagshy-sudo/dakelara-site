// Retratos originais em SVG com volume (gradientes), olhos grandes expressivos e cabelo com brilho.
// Cada personagem tem penteado, roupa e acessórios próprios; as expressões mudam olhos, sobrancelhas e boca.
import { CHARACTERS } from '../data/world.js';
import { portraitArt } from './assets.js';

export function shade(hex, f) { // f < 0 escurece, f > 0 clareia
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('');
}

const INK = '#2e1a2c';
let uid = 0;

// ---------- Rosto ----------
/** Olho aberto. side = -1 (esquerdo) ou 1 (direito); lid = 0..1 cobre o topo (tristeza/raiva). */
function eye(P, x, side, { scale = 1, lid = 0, lidTilt = 0 } = {}) {
  const y = 48.5, rx = 5.3 * scale, ry = 6.3 * scale;
  let s = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff"/>
  <ellipse cx="${x + side * 0.3}" cy="${y + 0.8}" rx="${4.3 * scale}" ry="${5.3 * scale}" fill="url(#${P}iris)"/>
  <ellipse cx="${x + side * 0.3}" cy="${y + 1.2}" rx="${2.1 * scale}" ry="${2.7 * scale}" fill="#1b0f1a"/>
  <circle cx="${x + 1.8}" cy="${y - 2.4}" r="${1.75 * scale}" fill="#fff"/>
  <circle cx="${x - 1.6}" cy="${y + 2.8}" r="${0.85 * scale}" fill="#fff" opacity=".85"/>`;
  if (lid) { // pálpebra em tom de pele cobrindo o topo, inclinada para dentro ou para fora
    const t = y - ry - 1, b = y - ry + lid * ry * 1.25;
    s += `<path d="M${x - rx - 1} ${t} L${x + rx + 1} ${t} L${x + rx + 1} ${b + side * lidTilt} L${x - rx - 1} ${b - side * lidTilt}Z" fill="url(#${P}skin)"/>`;
  }
  const top = y - ry + (lid ? lid * ry * 1.25 : 0);
  const o = x + side * (rx + 0.6), i = x - side * (rx - 0.4);
  s += `<path d="M${i} ${top + 2.2 - (lid ? side * -lidTilt : 0)} Q${x} ${top - 2.6} ${o} ${top + 1.6 + (lid ? side * lidTilt * 0.4 : 0)}" fill="none" stroke="${INK}" stroke-width="${P.fem ? 2.3 : 1.7}" stroke-linecap="round"/>`;
  if (P.fem) s += `<path d="M${o} ${top + 1.6} q${side * 2.4} -0.6 ${side * 3.2} -2.6 M${o - side * 1.4} ${top} q${side * 1.4} -1.4 ${side * 1.6} -3" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`;
  return s;
}
function eyeClosed(P, x, side) {
  return `<path d="M${x - 5} 49.5 Q${x} 43.6 ${x + 5} 49.5" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>` +
    (P.fem ? `<path d="M${x + side * 5} 49.5 l${side * 2.2} -1.6" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>` : '');
}
function brows(P, a, b) { // a = ponta interna, b = ponta externa (negativo sobe)
  return [[-1, 41], [1, 59]].map(([side, x]) => {
    const ix = x - side * 5, ox = x + side * 5.5, iy = 36.5 + a, oy = 37 + b;
    return `<path d="M${ix} ${iy} Q${x} ${Math.min(iy, oy) - 2.6} ${ox} ${oy}" fill="none" stroke="${P.brow}" stroke-width="${P.fem ? 1.8 : 2.5}" stroke-linecap="round"/>`;
  }).join('');
}
const MOUTH = {
  feliz: (P) => `<path d="M43.5 59.5 Q50 67.5 56.5 59.5 Q50 61.5 43.5 59.5Z" fill="#9c2546"/><path d="M45.6 60.6 Q50 61.6 54.4 60.6 L54 61.6 Q50 62.4 46 61.6Z" fill="#fff"/><path d="M46.8 64 Q50 66.2 53.2 64 Q50 62.8 46.8 64Z" fill="#ff7d96"/>`,
  rindo: (P) => `<path d="M42 58.6 Q50 71 58 58.6 Q50 60.6 42 58.6Z" fill="#8a1f3e"/><path d="M44.2 59.6 Q50 61 55.8 59.6 L55.2 61 Q50 62.2 44.8 61Z" fill="#fff"/><path d="M45.6 65 Q50 68.6 54.4 65 Q50 63 45.6 65Z" fill="#ff7d96"/>`,
  neutro: (P) => `<path d="M45 60.5 Q50 63.2 55 60.5" fill="none" stroke="${P.lip}" stroke-width="2.2" stroke-linecap="round"/>`,
  triste: (P) => `<path d="M45.5 63 Q50 59.4 54.5 63" fill="none" stroke="${P.lip}" stroke-width="2.2" stroke-linecap="round"/>`,
  surpreso: (P) => `<ellipse cx="50" cy="62" rx="3.2" ry="4.2" fill="#8a1f3e"/><ellipse cx="50" cy="63.6" rx="2" ry="1.6" fill="#ff7d96"/>`,
  bravo: (P) => `<path d="M45 62.4 Q50 59.6 55 62.4" fill="none" stroke="#8a1f3e" stroke-width="2.4" stroke-linecap="round"/>`,
};
function face(P, expr) {
  let eyes, br;
  switch (expr) {
    case 'rindo': eyes = eyeClosed(P, 41, -1) + eyeClosed(P, 59, 1); br = brows(P, -1, -1); break;
    case 'surpreso': eyes = eye(P, 41, -1, { scale: 1.1 }) + eye(P, 59, 1, { scale: 1.1 }); br = brows(P, -3.5, -3); break;
    case 'triste': eyes = eye(P, 41, -1, { lid: 0.35, lidTilt: -1.6 }) + eye(P, 59, 1, { lid: 0.35, lidTilt: -1.6 }); br = brows(P, -2.6, 1.2); break;
    case 'bravo': eyes = eye(P, 41, -1, { lid: 0.35, lidTilt: 2 }) + eye(P, 59, 1, { lid: 0.35, lidTilt: 2 }); br = brows(P, 2.6, -1.6); break;
    case 'neutro': eyes = eye(P, 41, -1, { lid: 0.12 }) + eye(P, 59, 1, { lid: 0.12 }); br = brows(P, 0, 0); break;
    default: eyes = eye(P, 41, -1) + eye(P, 59, 1); br = brows(P, -0.6, 0);
  }
  return `<ellipse cx="34" cy="57" rx="5.5" ry="3.3" fill="url(#${P}blush)"/><ellipse cx="66" cy="57" rx="5.5" ry="3.3" fill="url(#${P}blush)"/>
    ${eyes}${br}
    <path d="M48.2 56.2 Q50 57.4 51.8 56.2" fill="none" stroke="${shade(P.skin, -0.3)}" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="50.3" cy="54.2" rx="1" ry=".7" fill="#fff" opacity=".55"/>
    ${(MOUTH[expr] || MOUTH.feliz)(P)}`;
}

// ---------- Cabelos (atrás e na frente do rosto) ----------
const shine = (P, d, w = 2.6) => `<path d="${d}" fill="none" stroke="${shade(P.hair, 0.5)}" stroke-width="${w}" stroke-linecap="round" opacity=".75"/>`;
const strands = (P, ...ds) => ds.map((d) => `<path d="${d}" fill="none" stroke="${shade(P.hair, -0.28)}" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`).join('');
const H = (P) => `url(#${P}hair)`;

const HAIR = {
  dakota: {
    back: (P) => `<path d="M50 6 C28 6 15 22 17 44 C18 58 10 68 13 80 C15 90 22 97 30 100 L70 100 C78 97 85 90 87 80 C90 68 82 58 83 44 C85 22 72 6 50 6Z" fill="${H(P)}"/>
      <circle cx="60" cy="9" r="11.5" fill="${H(P)}"/><circle cx="46" cy="8" r="8" fill="${H(P)}"/>
      ${strands(P, 'M21 58 Q14 72 20 86', 'M79 58 Q86 72 80 86', 'M25 70 Q22 82 28 94', 'M75 70 Q78 82 72 94')}${shine(P, 'M54 3.5 Q62 2.5 67 8')}`,
    front: (P) => `<path d="M27 50 C24 28 36 16 51 16 C67 16 78 28 74 50 C71 37 64 30 57 27 C52 36 42 40 32 41 C29 44 28 47 27 50Z" fill="${H(P)}"/>
      <path d="M27 50 C25 60 22 66 19 72 C26 68 30 60 31 52Z" fill="${H(P)}"/><path d="M74 50 C76 60 79 66 82 72 C75 68 71 60 70 52Z" fill="${H(P)}"/>
      ${strands(P, 'M57 27 Q48 34 36 38', 'M62 30 Q66 38 70 46')}${shine(P, 'M36 24 Q46 18 58 20')}`,
  },
  bun: { // Dona Matilde: cachos brancos e coque com flores
    back: (P) => [[50, 10, 10], [26, 34, 9], [74, 34, 9], [22, 46, 8], [78, 46, 8], [24, 57, 7], [76, 57, 7], [33, 22, 10], [67, 22, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H(P)}"/>`).join('') +
      `<circle cx="50" cy="8" r="9" fill="${shade(P.hair, -0.06)}"/>${shine(P, 'M44 4 Q50 1 56 4', 2)}`,
    front: (P) => [[31, 31, 6.5], [39, 25, 6.8], [49, 23, 7], [59, 25, 6.8], [68, 31, 6.5], [27, 40, 5], [73, 40, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H(P)}"/><path d="M${x - r * 0.5} ${y - r * 0.3} q${r * 0.5} -${r * 0.5} ${r} 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>`).join(''),
  },
  curly: { // Juninho
    back: (P) => [[28, 30, 10], [38, 19, 11], [51, 15, 12], [64, 19, 11], [73, 30, 10], [24, 42, 8], [76, 42, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H(P)}"/>`).join(''),
    front: (P) => [[33, 30, 7.5], [43, 25, 7.5], [54, 25, 7.5], [65, 30, 7.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${H(P)}"/><path d="M${x - 3} ${y - 2} q3 -3 6 0" fill="none" stroke="${shade(P.hair, 0.4)}" stroke-width="1.6" stroke-linecap="round"/>`).join(''),
  },
  tousled: { // Sol: curto, ondulado e bagunçado
    back: (P) => `<path d="M23 52 C17 22 33 9 52 9 C71 9 84 22 77 52 L72 54 L28 54Z" fill="${H(P)}"/>`,
    front: (P) => `<path d="M26 48 C23 24 36 14 52 14 C68 14 79 25 75 47 C73 40 70 35 66 33 C64 38 60 40 56 37 C52 41 46 41 43 36 C39 40 33 40 31 37 C29 41 27 44 26 48Z" fill="${H(P)}"/>
      <path d="M40 18 C46 12 56 11 63 15" fill="none" stroke="${shade(P.hair, 0.12)}" stroke-width="3" stroke-linecap="round"/>${strands(P, 'M43 36 Q45 28 50 24', 'M56 37 Q60 30 62 24', 'M31 37 Q34 30 40 26')}${shine(P, 'M40 19 Q50 13 61 16', 2.2)}`,
  },
  short: { // Rafael: curto com topete
    back: (P) => `<path d="M24 50 C19 22 34 10 52 10 C70 10 82 22 76 50 L72 52 L28 52Z" fill="${H(P)}"/>`,
    front: (P) => `<path d="M27 46 C25 24 36 15 52 15 C68 15 77 26 74 46 C71 34 64 27 54 27 C46 27 37 30 31 40 C29 42 28 44 27 46Z" fill="${H(P)}"/>
      <path d="M38 22 C44 12 58 10 66 16 C60 14 52 16 46 22Z" fill="${shade(P.hair, 0.12)}"/>${strands(P, 'M42 27 Q52 22 62 26')}${shine(P, 'M42 18 Q52 12 62 15', 2.2)}`,
  },
  straight: { // Luna: lisos, repartidos ao meio
    back: (P) => `<path d="M50 9 C28 9 18 24 20 46 L18 98 L82 98 L80 46 C82 24 72 9 50 9Z" fill="${H(P)}"/>${strands(P, 'M24 56 L23 94', 'M76 56 L77 94', 'M28 64 L28 96', 'M72 64 L72 96')}`,
    front: (P) => `<path d="M27 52 C24 28 35 16 50 16 C65 16 76 28 73 52 C71 38 63 26 50 23 C37 26 29 38 27 52Z" fill="${H(P)}"/>
      <path d="M50 16 L50 24" stroke="${shade(P.hair, -0.3)}" stroke-width="1.2"/>${shine(P, 'M36 24 Q42 19 48 18')}${shine(P, 'M53 18 Q60 19 65 24')}`,
  },
  wavy: { // Vera: loiro ondulado volumoso
    back: (P) => `<path d="M50 7 C27 7 15 23 18 44 C12 54 18 62 14 72 C10 82 18 92 24 98 L76 98 C82 92 90 82 86 72 C82 62 88 54 82 44 C85 23 73 7 50 7Z" fill="${H(P)}"/>
      ${strands(P, 'M20 52 Q14 62 20 72 Q26 82 20 92', 'M80 52 Q86 62 80 72 Q74 82 80 92')}`,
    front: (P) => `<path d="M27 48 C24 26 37 16 52 16 C68 16 78 27 74 48 C70 34 62 26 54 24 C48 33 38 37 30 40Z" fill="${H(P)}"/>
      <path d="M27 48 C22 58 24 66 20 74 C28 70 31 58 30 50Z" fill="${H(P)}"/>${strands(P, 'M54 24 Q46 31 34 36')}${shine(P, 'M38 22 Q48 17 60 19')}`,
  },
};

// ---------- Roupas ----------
const body = (P, fill) => `<path d="M10 101 C12 84 25 76 39 74 L61 74 C75 76 88 84 90 101Z" fill="${fill}"/>`;
const CLOTH = {
  dakota: (P) => body(P, `url(#${P}knit)`) + `<path d="M14 92 q6 -3 12 0 M74 92 q6 -3 12 0 M18 84 q5 -2 10 0 M72 84 q5 -2 10 0" stroke="#e6dce6" stroke-width="1.4" fill="none"/>
    <path d="M34 101 L36 85 L64 85 L66 101Z" fill="url(#${P}cloth)"/><path d="M36 85 L33 74 M64 85 L67 74" stroke="${shade(P.cloth, -0.1)}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="38" cy="88" r="1.7" fill="#ffe08a"/><circle cx="62" cy="88" r="1.7" fill="#ffe08a"/><rect x="44" y="91" width="12" height="8" rx="2" fill="${shade(P.cloth, -0.12)}"/>
    <path d="M42 72 Q50 82 58 72" fill="none" stroke="#f2b632" stroke-width=".9"/><path d="M50 79.5 c-2 -2.6 -5 -.4 -3 2 l3 3 l3 -3 c2 -2.4 -1 -4.6 -3 -2Z" fill="#ff4f8b" stroke="#fff" stroke-width=".6"/>`,
  matilde: (P) => body(P, `url(#${P}cloth)`) + [[22, 90], [34, 96], [46, 86], [62, 92], [74, 88], [80, 98], [28, 82], [56, 99], [68, 80]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${['#ff8fc4', '#ffe08a', '#fff'][i % 3]}"/><circle cx="${x}" cy="${y}" r=".9" fill="${shade(P.cloth, -0.3)}"/>`).join('') +
    `<path d="M40 74 Q50 84 60 74" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray=".1 3.2" stroke-linecap="round"/>`,
  juninho: (P) => body(P, `url(#${P}cloth)`) + `<path d="M36 74 Q50 86 64 74 Q60 82 50 84 Q40 82 36 74Z" fill="${shade(P.cloth, -0.18)}"/><path d="M45 82 L44 94 M55 82 L56 94" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><circle cx="44" cy="95" r="1.3" fill="#fff"/><circle cx="56" cy="95" r="1.3" fill="#fff"/><rect x="38" y="94" width="24" height="7" rx="3" fill="${shade(P.cloth, -0.12)}"/>`,
  sol: (P) => body(P, `url(#${P}cloth)`) + `<path d="M41 74 L50 88 L59 74 L55 74 L50 82 L45 74Z" fill="url(#${P}skin)"/><path d="M41 74 L36 86 L46 82Z M59 74 L64 86 L54 82Z" fill="${shade(P.cloth, -0.1)}"/>
    <path d="M33 76 Q50 92 67 76" fill="none" stroke="#3a3440" stroke-width="3.5" stroke-linecap="round"/><rect x="28" y="72" width="8" height="10" rx="3.5" fill="#3a3440"/><rect x="64" y="72" width="8" height="10" rx="3.5" fill="#3a3440"/><circle cx="32" cy="77" r="2" fill="#f2b632"/><circle cx="68" cy="77" r="2" fill="#f2b632"/>`,
  luna: (P) => body(P, `url(#${P}cloth)`) + `<path d="M38 74 Q50 84 62 74" fill="url(#${P}skin)"/><path d="M38 74 Q50 86 62 74" fill="none" stroke="${shade(P.cloth, -0.15)}" stroke-width="2"/><path d="M24 84 l4 -2 l2 4 Z M72 86 l4 -2 l2 4Z" fill="#fff" opacity=".7"/>`,
  rafael: (P) => body(P, `url(#${P}cloth)`) + `<path d="M40 74 Q50 82 60 74 L58 80 Q50 84 42 80Z" fill="#e4576b"/><path d="M50 82 L56 101" stroke="#ddd" stroke-width="1.2"/>
    ${[86, 93, 100].map((y) => `<circle cx="${44 + (y - 86) * 0.1}" cy="${y}" r="1.4" fill="#c9c2cc"/><circle cx="${60 + (y - 86) * 0.25}" cy="${y}" r="1.4" fill="#c9c2cc"/>`).join('')}`,
  vera: (P) => body(P, `url(#${P}cloth)`) + `<path d="M38 74 L50 90 L62 74" fill="url(#${P}skin)"/><path d="M38 74 L50 90 L62 74" fill="none" stroke="${shade(P.cloth, -0.2)}" stroke-width="2"/><circle cx="50" cy="84" r="2" fill="#ffe08a" stroke="#d49b00" stroke-width=".6"/><path d="M44 77 Q50 85 56 77" fill="none" stroke="#f2b632" stroke-width=".8"/>`,
};

// ---------- Acessórios ----------
const ACC = {
  flower: (x, y, c = '#ffe08a', r = 4.2) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${(r * 1.1 * Math.cos((a * Math.PI) / 180)).toFixed(2)}" cy="${(r * 1.1 * Math.sin((a * Math.PI) / 180)).toFixed(2)}" rx="${r}" ry="${r * 0.78}" transform="rotate(${a} ${(r * 1.1 * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(r * 1.1 * Math.sin((a * Math.PI) / 180)).toFixed(2)})" fill="${c}" stroke="${shade(c, -0.15)}" stroke-width=".5"/>`).join('')}<circle r="${r * 0.62}" fill="#ff9d2e"/><circle cx="-.8" cy="-.8" r="${r * 0.22}" fill="#fff" opacity=".7"/></g>`,
  hoops: (s = 3.4) => `<circle cx="28.5" cy="${57 + s}" r="${s}" fill="none" stroke="#f2b632" stroke-width="1.5"/><circle cx="71.5" cy="${57 + s}" r="${s}" fill="none" stroke="#f2b632" stroke-width="1.5"/><circle cx="27" cy="${56 + s}" r=".6" fill="#fff"/><circle cx="70" cy="${56 + s}" r=".6" fill="#fff"/>`,
  shades: (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-13" y="-4" width="11.5" height="7.5" rx="3.7" fill="#4a2a44"/><rect x="1.5" y="-4" width="11.5" height="7.5" rx="3.7" fill="#4a2a44"/><path d="M-1.5 -1 h3" stroke="#4a2a44" stroke-width="1.6"/><path d="M-11 -2.4 l3 0" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/><path d="M3.5 -2.4 l3 0" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/></g>`,
  glasses: () => `<g fill="rgba(255,255,255,.18)" stroke="#8a5a2a" stroke-width="1.6"><circle cx="41" cy="48.5" r="7.6"/><circle cx="59" cy="48.5" r="7.6"/></g><path d="M48.6 47.6 Q50 46.4 51.4 47.6" fill="none" stroke="#8a5a2a" stroke-width="1.6"/><path d="M36 44 l3 -2" stroke="#fff" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>`,
  headphones: () => `<path d="M24 48 C21 14 79 14 76 48" fill="none" stroke="#f2a52a" stroke-width="4.5" stroke-linecap="round"/><path d="M27 30 C34 18 66 18 73 30" fill="none" stroke="#ffd27a" stroke-width="1.3" opacity=".8"/>
    <rect x="19" y="41" width="10" height="16" rx="5" fill="#f2a52a"/><rect x="71" y="41" width="10" height="16" rx="5" fill="#f2a52a"/><rect x="21.5" y="44" width="5" height="10" rx="2.5" fill="#3a3440"/><rect x="73.5" y="44" width="5" height="10" rx="2.5" fill="#3a3440"/>`,
  beard: (P) => `<path d="M28 52 C28 76 42 80 50 80 C58 80 72 76 72 52 C68 62 62 66 56 64 C52 61 48 61 44 64 C38 66 32 62 28 52Z" fill="${H(P)}"/><path d="M41 61 Q50 56.5 59 61 Q55 59.6 50 60.4 Q45 59.6 41 61Z" fill="${shade(P.hair, -0.2)}"/>`,
  stubble: (P) => `<path d="M30 56 C33 72 43 75 50 75 C57 75 67 72 70 56 C66 66 58 69 50 69 C42 69 34 66 30 56Z" fill="${P.hair}" opacity=".28"/>`,
  freckles: () => [[33, 54], [36, 55.5], [34.5, 57.5], [64, 54], [67, 55.5], [65.5, 57.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" fill="#b9765a" opacity=".7"/>`).join(''),
  mole: () => `<circle cx="60" cy="60.5" r=".85" fill="#5a3240"/>`,
  wrinkles: () => `<path d="M31 50 l-3 1 M31 47 l-3 -.4 M69 50 l3 1 M69 47 l3 -.4 M39 62 q-2 2 -1 4 M61 62 q2 2 1 4" stroke="#c99a84" stroke-width=".8" fill="none" stroke-linecap="round"/>`,
};

// Configuração visual de cada personagem (complementa CHARACTERS[].look)
const STYLE = {
  dakota: { hair: 'dakota', eye: '#7a4a2e', fem: true, lip: '#c94a6a', extra: (P) => ACC.mole() + ACC.hoops(), top: (P) => ACC.shades(58, 17, -10) + ACC.flower(31, 27, '#ffe08a', 4.4) + ACC.flower(24, 36, '#fff', 2.6) },
  matilde: { hair: 'bun', eye: '#6a4a3a', fem: true, lip: '#c96a7a', brow: '#a899a8', extra: (P) => ACC.wrinkles() + ACC.glasses(), top: () => ACC.flower(40, 11, '#ff8fc4', 3.4) + ACC.flower(59, 9, '#ffb3d6', 3) + ACC.flower(50, 4, '#ffe08a', 2.4) },
  juninho: { hair: 'curly', eye: '#5a3a22', fem: false, lip: '#b9576a', extra: (P) => ACC.freckles(), top: () => ACC.headphones() },
  sol: { hair: 'tousled', eye: '#4a2e1e', fem: false, lip: '#a9576a', extra: (P) => ACC.stubble(P) },
  luna: { hair: 'straight', eye: '#3a2a3a', fem: true, lip: '#d9577a', extra: () => ACC.hoops(2.4) },
  evie: { hair: 'wavy', eye: '#3f7a4a', fem: true, lip: '#d9576a', extra: () => ACC.freckles() + ACC.hoops(2.2), top: () => ACC.flower(68, 26, '#fff', 3.2) },
  rafael: { hair: 'short', eye: '#4a3222', fem: false, lip: '#e6a0a8', mouthOver: true, extra: (P) => ACC.beard(P) },
  vera: { hair: 'wavy', eye: '#3a6a8a', fem: true, lip: '#d9334f', extra: () => ACC.hoops(2.8), top: () => ACC.shades(52, 18, -4) },
};

const BG = { dakota: ['#ffe0ee', '#ffb3d1'], matilde: ['#efe2ff', '#cdb3f2'], juninho: ['#e2f7d8', '#a9de95'], sol: ['#fff0cc', '#ffcf7a'], luna: ['#ffe3f1', '#ffb0d4'], evie: ['#fff3d1', '#ffc98a'], rafael: ['#e3f0ff', '#a9cdf5'], vera: ['#ffe8d6', '#ffb99a'], teco: ['#fff4d9', '#ffd98f'], visitante: ['#ddd6f2', '#9d8fd1'] };

function defs(P, L) {
  return `<defs>
  <radialGradient id="${P}bg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${P.bg[0]}"/><stop offset="1" stop-color="${P.bg[1]}"/></radialGradient>
  <radialGradient id="${P}skin" cx="44%" cy="36%" r="68%"><stop offset="0" stop-color="${shade(L.skin, 0.16)}"/><stop offset=".65" stop-color="${L.skin}"/><stop offset="1" stop-color="${shade(L.skin, -0.14)}"/></radialGradient>
  <linearGradient id="${P}hair" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${shade(L.hair, 0.22)}"/><stop offset=".45" stop-color="${L.hair}"/><stop offset="1" stop-color="${shade(L.hair, -0.25)}"/></linearGradient>
  <linearGradient id="${P}cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(L.cloth, 0.18)}"/><stop offset="1" stop-color="${shade(L.cloth, -0.14)}"/></linearGradient>
  <linearGradient id="${P}knit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece2ec"/></linearGradient>
  <radialGradient id="${P}iris" cx="50%" cy="72%" r="60%"><stop offset="0" stop-color="${shade(P.eye, 0.55)}"/><stop offset=".55" stop-color="${P.eye}"/><stop offset="1" stop-color="${shade(P.eye, -0.45)}"/></radialGradient>
  <radialGradient id="${P}blush"><stop offset="0" stop-color="#ff6f96" stop-opacity=".55"/><stop offset="1" stop-color="#ff6f96" stop-opacity="0"/></radialGradient>
  </defs>`;
}

// Braço apoiado com a mão no queixo (pose da tela inicial, como no mockup)
function chinHand(P, L) {
  const sk = `url(#${P}skin)`, ln = shade(L.skin, -0.22);
  return `<path d="M54 101 L59 81 Q65 75 72 78 L84 101Z" fill="url(#${P}knit)"/><path d="M58.5 83 Q65 78 72.5 81" fill="none" stroke="#e6dce6" stroke-width="1.6"/><path d="M60 92 q5 -2 10 0 M58 98 q6 -2 12 0" stroke="#e6dce6" stroke-width="1.2" fill="none"/>
    <path d="M44 69.5 Q50 75.5 57.5 74.5 L60 80 Q66 79 70.5 77 Q70 71 67.5 67.5 L70.5 61 Q71.5 57.5 69 57 Q67 56.8 65.8 59.6 L64.6 62.4 L65.2 58.6 Q65.2 55.6 62.8 55.8 Q60.8 56.2 60.6 59 L59.6 66.4 Q54 71 44 69.5Z" fill="${sk}"/>
    <path d="M65 63 L67.8 66.6 M60.6 66 Q62.6 68.6 64.8 68.4 M57.5 74.5 Q61 72.5 63.5 70" fill="none" stroke="${ln}" stroke-width=".9" stroke-linecap="round"/>
    <ellipse cx="62.6" cy="57.6" rx="1.1" ry=".7" fill="#ff8fb8"/><ellipse cx="68.7" cy="58.4" rx="1" ry=".65" fill="#ff8fb8"/>`;
}

function human(id, expr, L, pose) {
  const st = STYLE[id];
  const P = Object.assign(new String('p' + ++uid + '-'), st, { skin: L.skin, hair: L.hair, cloth: L.cloth, bg: BG[id], brow: st.brow || shade(L.hair, -0.35) }); // id único dos gradientes
  const hs = HAIR[st.hair], sk = `url(#${P}skin)`;
  return defs(P, L) + `<rect width="100" height="100" fill="url(#${P}bg)"/><circle cx="50" cy="48" r="44" fill="#fff" opacity=".22"/>
    ${hs.back(P)}
    ${(CLOTH[id] || ((Q) => body(Q, `url(#${Q}cloth)`)))(P)}
    <path d="M43 62 L43 76 Q50 80 57 76 L57 62Z" fill="${shade(L.skin, -0.12)}"/><path d="M43 70 Q50 75 57 70 L57 66 Q50 71 43 66Z" fill="${shade(L.skin, -0.25)}" opacity=".5"/>
    <ellipse cx="28.5" cy="51" rx="3.8" ry="5.4" fill="${sk}"/><ellipse cx="71.5" cy="51" rx="3.8" ry="5.4" fill="${sk}"/><path d="M28 48.5 q1.6 2.4 0 4.6 M72 48.5 q-1.6 2.4 0 4.6" fill="none" stroke="${shade(L.skin, -0.22)}" stroke-width="1"/>
    <path d="M50 22 C34 22 27 33 27 46 C27 61 37 71 50 71 C63 71 73 61 73 46 C73 33 66 22 50 22Z" fill="${sk}"/>
    ${face(P, expr)}
    ${st.extra ? st.extra(P) : ''}${st.mouthOver ? (MOUTH[expr] || MOUTH.feliz)(P) : ''}
    ${pose === 'queixo' ? chinHand(P, L) : ''}
    ${hs.front(P)}
    ${st.top ? st.top(P) : ''}`;
}

function dog(expr) {
  const P = 'p' + ++uid + '-', happy = expr === 'feliz' || expr === 'rindo';
  const e = (x) => happy ? `<path d="M${x - 4.5} 50 Q${x} 44 ${x + 4.5} 50" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`
    : `<ellipse cx="${x}" cy="48.5" rx="4.6" ry="5.4" fill="#2a1a14"/><circle cx="${x + 1.6}" cy="46.4" r="1.6" fill="#fff"/><circle cx="${x - 1.2}" cy="50.6" r=".7" fill="#fff"/>`;
  return `<defs><radialGradient id="${P}bg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#fff4d9"/><stop offset="1" stop-color="#ffd98f"/></radialGradient>
    <radialGradient id="${P}fur" cx="42%" cy="34%" r="70%"><stop offset="0" stop-color="#f0bd78"/><stop offset=".7" stop-color="#d9964a"/><stop offset="1" stop-color="#a8672c"/></radialGradient>
    <radialGradient id="${P}wh" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#efe2cf"/></radialGradient></defs>
    <rect width="100" height="100" fill="url(#${P}bg)"/><circle cx="50" cy="48" r="44" fill="#fff" opacity=".22"/>
    <ellipse cx="50" cy="98" rx="32" ry="20" fill="url(#${P}fur)"/><path d="M36 84 Q50 104 64 84 L62 101 L38 101Z" fill="url(#${P}wh)"/>
    <path d="M24 30 C10 34 10 58 18 70 C24 74 30 66 32 52Z" fill="#8f5422"/><path d="M76 30 C90 34 90 58 82 70 C76 74 70 66 68 52Z" fill="#8f5422"/>
    <ellipse cx="50" cy="50" rx="27" ry="27.5" fill="url(#${P}fur)"/>
    <path d="M50 26 C58 36 60 46 58 54 C66 62 64 76 50 78 C36 76 34 62 42 54 C40 46 42 36 50 26Z" fill="url(#${P}wh)"/>
    <ellipse cx="38" cy="46" rx="8" ry="7" fill="#a8672c" opacity=".35"/>
    ${e(39)}${e(61)}${expr === 'bravo' ? `<path d="M34 41 L44 43.5 M66 41 L56 43.5" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>` : `<path d="M35 40.5 Q39 38.5 43 40.5 M57 40.5 Q61 38.5 65 40.5" stroke="#8f5422" stroke-width="1.8" fill="none" stroke-linecap="round"/>`}
    <ellipse cx="50" cy="60" rx="6" ry="4.3" fill="#2a1a14"/><ellipse cx="48.4" cy="58.8" rx="2" ry="1.1" fill="#fff" opacity=".6"/>
    <path d="M50 64 V68 M41.5 67.5 Q50 75 58.5 67.5" fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round"/>
    ${happy ? `<path d="M45.5 70 Q50 86 54.5 70Z" fill="#ff7b93"/><path d="M50 71 V79" stroke="#e45a76" stroke-width="1"/>` : ''}
    <ellipse cx="32" cy="60" rx="5" ry="3" fill="#ff8fa3" opacity=".35"/><ellipse cx="68" cy="60" rx="5" ry="3" fill="#ff8fa3" opacity=".35"/>
    <path d="M28 82 Q50 94 72 82" fill="none" stroke="#e4576b" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="90.5" r="4" fill="#f2b632" stroke="#d49b00" stroke-width=".8"/>`;
}
function mystery() {
  const P = 'p' + ++uid + '-';
  return `<defs><radialGradient id="${P}bg" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#ddd6f2"/><stop offset="1" stop-color="#7d6fb8"/></radialGradient>
    <linearGradient id="${P}cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3d6b"/><stop offset="1" stop-color="#211a35"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#${P}bg)"/>
    <path d="M10 101 C12 74 28 64 36 62 C22 36 32 10 50 10 C68 10 78 36 64 62 C72 64 88 74 90 101Z" fill="url(#${P}cl)"/>
    <ellipse cx="50" cy="46" rx="16" ry="19" fill="#120d20"/>
    <ellipse cx="44" cy="46" rx="2.6" ry="1.6" fill="#ffe08a"/><ellipse cx="56" cy="46" rx="2.6" ry="1.6" fill="#ffe08a"/>
    <path d="M28 66 Q50 80 72 66" fill="none" stroke="#6b5a9a" stroke-width="3"/><text x="50" y="94" text-anchor="middle" font-size="16" font-weight="900" fill="#b9a6ff" font-family="sans-serif">A.</text>`;
}

/** Retrato SVG de um personagem com a expressão pedida. */
export function portrait(id, expr = 'neutro', player, pose) {
  const img = portraitArt(id, expr);
  if (img && !(id === 'dakota' && player && player.custom)) return `<img class="portrait" src="${img}" alt="${CHARACTERS[id].name}" draggable="false">`;
  const L = { ...CHARACTERS[id].look };
  if (id === 'dakota' && player) { L.hair = player.hair; L.skin = player.skin; }
  const inner = L.dog ? dog(expr) : L.mystery ? mystery() : human(id, expr, L, pose);
  const vb = L.dog || L.mystery ? '0 0 100 100' : '7 4 86 86';
  return `<svg class="portrait" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${CHARACTERS[id].name}"><clipPath id="c${uid}"><rect width="100" height="100"/></clipPath><g clip-path="url(#c${uid})">${inner}</g></svg>`;
}
export const EXPRESSIONS = ['feliz', 'rindo', 'neutro', 'triste', 'surpreso', 'bravo'];
