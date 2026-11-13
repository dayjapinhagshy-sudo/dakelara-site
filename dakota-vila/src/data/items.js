// Dados de itens e geradores — sem lógica de jogo aqui.
// Cada cadeia é uma lista de [ícone, nome, (quantidade para coletáveis)].
const C = (name, items, extra = {}) => ({ name, kind: 'item', items, ...extra });

export const CHAINS = {
  cafe: C('Cafés', [['🫘', 'Grãos de café'], ['☕', 'Cafezinho'], ['🥛', 'Pingado'], ['🧋', 'Café gelado'], ['🍶', 'Licor de café'], ['🍨', 'Affogato'], ['🧇', 'Café colonial'], ['🏆', 'Café Campeão da Vila']]),
  cha: C('Chás e bebidas', [['🍃', 'Folhas de chá'], ['🍵', 'Chá verde'], ['🫖', 'Bule da vovó'], ['🧉', 'Chimarrão'], ['🧃', 'Suco natural'], ['🥤', 'Vitamina'], ['🍹', 'Drinque tropical'], ['🍸', 'Coquetel Dakota']]),
  ingred: C('Ingredientes', [['🧂', 'Sal'], ['🥚', 'Ovos'], ['🧈', 'Manteiga'], ['🧀', 'Queijo'], ['🫒', 'Azeitonas'], ['🥫', 'Molho da casa'], ['🍚', 'Arroz soltinho'], ['🍝', 'Macarronada']]),
  pao: C('Pães e salgados', [['🌾', 'Trigo'], ['🥖', 'Baguete'], ['🍞', 'Pão de forma'], ['🥐', 'Croissant'], ['🥟', 'Pastel'], ['🥪', 'Sanduíche'], ['🍔', 'Hambúrguer'], ['🍕', 'Pizza da casa']]),
  doce: C('Doces e bolos', [['🍬', 'Bala'], ['🍪', 'Biscoito'], ['🍩', 'Rosquinha'], ['🧁', 'Cupcake'], ['🍮', 'Pudim'], ['🍰', 'Fatia de bolo'], ['🥧', 'Torta'], ['🎂', 'Bolo de festa']]),
  fruta: C('Frutas', [['🍋', 'Limão'], ['🍊', 'Laranja'], ['🍌', 'Banana'], ['🥭', 'Manga'], ['🍍', 'Abacaxi'], ['🥥', 'Coco'], ['🍉', 'Melancia'], ['🧺', 'Cesta de frutas']]),
  mar: C('Frutos do mar', [['🦐', 'Camarão'], ['🐟', 'Sardinha'], ['🦑', 'Lula'], ['🦀', 'Caranguejo'], ['🦞', 'Lagosta'], ['🐙', 'Polvo'], ['🍣', 'Sushi'], ['🍱', 'Banquete do mar']]),
  utens: C('Utensílios', [['🥄', 'Colher'], ['🍴', 'Talheres'], ['🔪', 'Faca do chef'], ['🥣', 'Tigela'], ['🍽️', 'Prato fino'], ['🍳', 'Frigideira'], ['🫕', 'Panela de ferro']]),
  concha: C('Conchas e corais', [['🪨', 'Pedrinha'], ['🐚', 'Concha'], ['🪸', 'Coral'], ['🦪', 'Ostra'], ['🔮', 'Pérola gigante'], ['🔱', 'Tridente antigo'], ['🗿', 'Ídolo da maré']]),
  praia: C('Praia e piscina', [['🩴', 'Chinelo'], ['🕶️', 'Óculos de sol'], ['🧴', 'Protetor solar'], ['👒', 'Chapéu de palha'], ['🏐', 'Bola de vôlei'], ['🛟', 'Boia'], ['⛱️', 'Guarda-sol'], ['⛵', 'Veleiro']]),
  flor: C('Flores', [['🌱', 'Broto'], ['🌿', 'Raminho'], ['🌼', 'Margarida'], ['🌷', 'Tulipa'], ['🌻', 'Girassol'], ['🌹', 'Rosa'], ['🌺', 'Hibisco'], ['💐', 'Buquê']]),
  pet: C('Mimos de pet', [['🦴', 'Osso'], ['🧶', 'Novelo'], ['🥎', 'Bolinha'], ['🎀', 'Laço'], ['🧸', 'Ursinho'], ['🛏️', 'Caminha'], ['🏡', 'Casinha do Teco']]),
  ceram: C('Cerâmica e decoração', [['🧱', 'Argila'], ['🏺', 'Ânfora'], ['🕯️', 'Vela'], ['🪞', 'Espelho'], ['🖼️', 'Quadro'], ['🪑', 'Cadeira'], ['🛋️', 'Sofá'], ['🏮', 'Lanterna da vila']]),
  joia: C('Joias e presentes', [['📿', 'Colar de contas'], ['💍', 'Anel'], ['⌚', 'Relógio'], ['👛', 'Bolsinha'], ['👑', 'Tiara'], ['💎', 'Diamante'], ['🏵️', 'Relíquia da família']]),
  maq: C('Máquinas', [['🔩', 'Parafuso'], ['⚙️', 'Engrenagem'], ['🔧', 'Chave inglesa'], ['🔋', 'Bateria'], ['💡', 'Lâmpada'], ['📻', 'Rádio'], ['📽️', 'Projetor'], ['🎡', 'Roda-gigante']]),
  // Cadeia exclusiva do tabuleiro de evento
  festa: C('Festival', [['🎈', 'Balão'], ['🎏', 'Bandeirola'], ['🎉', 'Confete'], ['🪅', 'Pinhata'], ['🎆', 'Fogos'], ['🎠', 'Carrossel'], ['🎪', 'Circo da Vila']], { event: true }),
  // Coletáveis: toque para receber o recurso
  moeda: { name: 'Moedas', kind: 'collect', res: 'coins', items: [['🪙', 'Moedinha', 5], ['💰', 'Saco de moedas', 15], ['🧧', 'Envelope da sorte', 40], ['🏦', 'Cofre', 100]] },
  energia: { name: 'Energia', kind: 'collect', res: 'energy', items: [['⚡', 'Faísca', 5], ['🌩️', 'Trovão', 12], ['☄️', 'Cometa', 30]] },
  gema: { name: 'Gemas', kind: 'collect', res: 'gems', items: [['💠', 'Lasca de gema', 1], ['🔷', 'Gema', 3], ['🔶', 'Gema dourada', 8]] },
  xp: { name: 'Experiência', kind: 'collect', res: 'xp', items: [['📘', 'Livrinho', 5], ['📚', 'Pilha de livros', 15], ['🎓', 'Diploma', 40]] },
  peca: { name: 'Peças de oficina', kind: 'collect', res: 'comps', items: [['🧩', 'Peça', 1], ['🛠️', 'Kit de peças', 3], ['🗜️', 'Kit mestre', 8]] },
  // Baús: toque para abrir (n itens cada)
  bau: { name: 'Baús e presentes', kind: 'chest', items: [['🎁', 'Presente'], ['📦', 'Caixote'], ['🧳', 'Baú do viajante'], ['💝', 'Tesouro da Vila']] },
  // Ferramentas (arraste sobre o alvo)
  tesoura: { name: 'Ferramentas', kind: 'tool', items: [['✂️', 'Tesoura']], desc: 'Arraste sobre um item evoluído para dividi-lo em dois do nível anterior.' },
  coringa: { name: 'Ferramentas', kind: 'tool', items: [['🃏', 'Coringa']], desc: 'Arraste sobre qualquer item para evoluí-lo um nível.' },
  acelerador: { name: 'Ferramentas', kind: 'tool', items: [['⏱️', 'Acelerador']], desc: 'Arraste sobre um gerador para recarregá-lo na hora.' },
};

// Tabelas de saque dos baús por nível: n = quantidade, loot = [cadeia, nível mín, nível máx, peso]
export const CHEST_LOOT = {
  1: { n: 3, loot: [['moeda', 1, 2, 30], ['energia', 1, 1, 20], ['$chain', 1, 2, 40], ['peca', 1, 1, 10]] },
  2: { n: 4, loot: [['moeda', 1, 3, 25], ['energia', 1, 2, 20], ['$chain', 2, 3, 35], ['peca', 1, 2, 12], ['gema', 1, 1, 8]] },
  3: { n: 5, loot: [['moeda', 2, 3, 20], ['energia', 2, 3, 20], ['$chain', 2, 4, 30], ['peca', 1, 2, 12], ['gema', 1, 2, 10], ['coringa', 1, 1, 4], ['tesoura', 1, 1, 4]] },
  4: { n: 7, loot: [['moeda', 3, 4, 18], ['energia', 2, 3, 18], ['$chain', 3, 5, 30], ['peca', 2, 3, 12], ['gema', 2, 3, 12], ['coringa', 1, 1, 5], ['acelerador', 1, 1, 5]] },
};

// Geradores: mode manual (toque, gasta energia) ou auto (produz sozinho com o tempo).
// levels[n-1] = { charges, cd (s de recarga), lv (pesos dos níveis produzidos), every (s, só auto) }
const LV = [[100], [86, 14], [74, 21, 5], [64, 25, 9, 2], [54, 28, 13, 5]];
const manual = (charges, cd) => LV.map((lv, i) => ({ charges: charges + i * 3, cd: Math.round(cd * (1 - i * 0.12)), lv }));
const auto = (charges, cd, every) => LV.map((lv, i) => ({ charges: charges + i, cd: Math.round(cd * (1 - i * 0.12)), every: Math.round(every * (1 - i * 0.1)), lv }));

export const GENERATORS = {
  cafe: { name: 'Cafeteira', icon: '☕', mode: 'manual', energy: 1, drops: [['cafe', 62], ['cha', 38]], levels: manual(12, 150), unlock: 1 },
  forno: { name: 'Forno a lenha', icon: '🥨', mode: 'manual', energy: 1, drops: [['pao', 100]], levels: manual(12, 150), unlock: 1 },
  mercado: { name: 'Sacola de mercado', icon: '🛍️', mode: 'manual', energy: 1, drops: [['ingred', 100]], levels: manual(12, 150), unlock: 1 },
  doces: { name: 'Batedeira', icon: '🍭', mode: 'manual', energy: 1, drops: [['doce', 100]], levels: manual(10, 180), unlock: 2 },
  pomar: { name: 'Pomar', icon: '🌳', mode: 'auto', energy: 0, drops: [['fruta', 100]], levels: auto(5, 300, 40), unlock: 3 },
  canteiro: { name: 'Canteiro', icon: '🪴', mode: 'auto', energy: 0, drops: [['flor', 100]], levels: auto(5, 300, 45), unlock: 4 },
  pesca: { name: 'Vara de pesca', icon: '🎣', mode: 'manual', energy: 1, drops: [['mar', 100]], levels: manual(10, 200), unlock: 5 },
  armario: { name: 'Armário da cozinha', icon: '🗄️', mode: 'manual', energy: 1, drops: [['utens', 100]], levels: manual(10, 200), unlock: 6 },
  baldinho: { name: 'Baldinho de praia', icon: '🪣', mode: 'manual', energy: 1, drops: [['concha', 100]], levels: manual(10, 220), unlock: 7 },
  mochila: { name: 'Mochila de praia', icon: '🎒', mode: 'manual', energy: 1, drops: [['praia', 100]], levels: manual(10, 220), unlock: 8 },
  cantinho: { name: 'Cantinho do Teco', icon: '🐶', mode: 'auto', energy: 0, drops: [['pet', 100]], levels: auto(4, 360, 60), unlock: 9 },
  torno: { name: 'Torno de cerâmica', icon: '⚱️', mode: 'manual', energy: 1, drops: [['ceram', 100]], levels: manual(9, 240), unlock: 10 },
  portajoias: { name: 'Porta-joias', icon: '👝', mode: 'manual', energy: 2, drops: [['joia', 100]], levels: manual(8, 300), unlock: 11 },
  bancada: { name: 'Bancada de máquinas', icon: '🏭', mode: 'manual', energy: 2, drops: [['maq', 100]], levels: manual(8, 300), unlock: 12 },
  // Gerador do tabuleiro de evento (usa fichas em vez de energia)
  festa: { name: 'Caixa de festa', icon: '🎊', mode: 'manual', energy: 1, drops: [['festa', 100]], levels: manual(999, 1), unlock: 99, event: true },
};

export const RARITY = ['comum', 'raro', 'especial', 'lendário'];

const cache = new Map();
/** Resolve um id "cadeia:nível" (ou "gen:tipo") para sua definição completa. */
export function itemDef(id) {
  let d = cache.get(id);
  if (d) return d;
  const [chain, lv] = id.split(':');
  if (chain === 'gen') {
    const g = GENERATORS[lv];
    if (!g) throw new Error('Gerador desconhecido: ' + id);
    d = { id, chain: 'gen', gen: lv, level: 1, max: 1, icon: g.icon, name: g.name, kind: 'gen', value: 0, rarity: 2, mergeable: false };
  } else {
    const c = CHAINS[chain];
    const level = +lv;
    if (!c || !c.items[level - 1]) throw new Error('Item desconhecido: ' + id);
    const [icon, name, amount] = c.items[level - 1];
    const max = c.items.length;
    const f = level / max;
    d = {
      id, chain, level, max, icon, name, kind: c.kind, res: c.res, amount,
      chainName: c.name, desc: c.desc,
      value: c.kind === 'item' ? Math.round(3 * Math.pow(1.9, level - 1)) : 0,
      rarity: level === max && max > 1 ? 3 : f > 0.65 ? 2 : f > 0.4 ? 1 : 0,
      mergeable: c.kind !== 'tool' && level < max,
      next: level < max ? `${chain}:${level + 1}` : null,
      prev: level > 1 ? `${chain}:${level - 1}` : null,
    };
  }
  cache.set(id, d);
  return d;
}

/** Cadeia -> id do gerador que a produz. */
export const CHAIN_GEN = {};
for (const [g, def] of Object.entries(GENERATORS)) for (const [c] of def.drops) CHAIN_GEN[c] = g;

export const allItemIds = () => Object.entries(CHAINS).flatMap(([c, d]) => d.items.map((_, i) => `${c}:${i + 1}`));
