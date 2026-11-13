// Balanceamento e configuração — tudo ajustável sem tocar na lógica.
export const CFG = {
  saveVersion: 1,
  board: { w: 7, h: 9 },
  energy: { max: 100, regenMs: 90_000 },
  start: { coins: 150, gems: 25, stars: 0, comps: 0 },
  // XP necessário para sair do nível n
  xpForLevel: (n) => Math.round(40 + 35 * Math.pow(n - 1, 1.45)),
  levelUp: { gems: 5, coins: 60, chestEvery: 2 },
  mergeXpFromLevel: 4, // fusões que resultam em nível >= isto rendem XP
  bubble: { chance: 0.06, minLevel: 3, ttlMs: 60_000, popBase: 2 },
  bonusDrop: [['peca:1', 0.05], ['moeda:1', 0.03], ['energia:1', 0.02]],
  unlockCost: (value) => 10 + value * 2,
  inventory: { start: 6, max: 24, costGems: (slots) => 5 + (slots - 6) * 3 },
  orders: { maxActive: 3, maxActiveLvl5: 4, respawnMs: 4000, streakWindowMs: 180_000, streakStep: 0.1, streakMax: 5, timedMs: 600_000, vipChance: 0.15, timedChance: 0.15 },
  genUpgrade: [null, { comps: 6, coins: 150 }, { comps: 14, coins: 400 }, { comps: 28, coins: 900 }, { comps: 50, coins: 2000 }],

  // Layout inicial: '.' vazio, G:tipo gerador, x:id coberto (caixote), l:id preso, id livre
  initialBoard: [
    'x:bau:1 x:doce:2 x:moeda:2 x:pao:3 x:energia:1 x:cafe:3 x:bau:2',
    'x:ingred:2 l:cafe:2 l:pao:1 l:moeda:1 l:ingred:1 l:cha:2 x:peca:1',
    'x:pao:2 l:pao:2 . cafe:1 . l:cafe:1 x:gema:1',
    'x:cha:1 l:ingred:2 pao:1 G:cafe cafe:1 l:pao:1 x:energia:2',
    'x:coringa:1 l:cha:1 G:forno . G:mercado l:ingred:1 x:tesoura:1',
    'x:moeda:1 l:cafe:1 . ingred:1 . l:cha:1 x:doce:1',
    'x:peca:1 l:energia:1 l:pao:1 l:cafe:2 l:ingred:2 l:moeda:1 x:xp:1',
    'x:ingred:3 x:cafe:2 x:xp:1 x:pao:2 x:peca:1 x:cha:3 x:acelerador:1',
    'x:bau:1 x:cha:2 x:gema:1 x:ingred:1 x:moeda:2 x:pao:1 x:bau:1',
  ],
};

export const SHOP = [
  { id: 'energia_p', name: 'Lanche energético', icon: '⚡', desc: '+30 de energia', price: { gems: 6 }, give: { energy: 30 } },
  { id: 'energia_g', name: 'Banquete energético', icon: '🌩️', desc: '+100 de energia', price: { gems: 16 }, give: { energy: 100 } },
  { id: 'bau1', name: 'Presente', icon: '🎁', desc: 'Baú comum com 3 itens', price: { coins: 120 }, give: { items: ['bau:1'] } },
  { id: 'bau2', name: 'Caixote', icon: '📦', desc: 'Baú raro com 4 itens', price: { coins: 320 }, give: { items: ['bau:2'] } },
  { id: 'bau3', name: 'Baú do viajante', icon: '🧳', desc: 'Baú especial com 5 itens', price: { gems: 14 }, give: { items: ['bau:3'] } },
  { id: 'tesoura', name: 'Tesoura', icon: '✂️', desc: 'Divide um item evoluído', price: { gems: 4 }, give: { items: ['tesoura:1'] } },
  { id: 'coringa', name: 'Coringa', icon: '🃏', desc: 'Evolui qualquer item', price: { gems: 8 }, give: { items: ['coringa:1'] } },
  { id: 'acelerador', name: 'Acelerador', icon: '⏱️', desc: 'Recarrega um gerador', price: { gems: 5 }, give: { items: ['acelerador:1'] } },
  { id: 'pecas', name: 'Kit de peças', icon: '🛠️', desc: '+3 peças de oficina', price: { coins: 250 }, give: { comps: 3 } },
  { id: 'pas', name: 'Pás de escavação', icon: '⛏️', desc: '+5 pás para a Caça ao Tesouro', price: { coins: 200 }, give: { shovels: 5 } },
  { id: 'fichas', name: 'Fichas de festival', icon: '🎟️', desc: '+15 fichas do evento', price: { coins: 180 }, give: { tickets: 15 } },
  { id: 'cartas', name: 'Pacote de cartas', icon: '🎴', desc: '3 cartas para o Álbum da Vila', price: { coins: 300 }, give: { cards: 3 } },
];

export const ACHIEVEMENTS = [
  { id: 'm50', name: 'Mãos habilidosas', desc: 'Faça 50 combinações', stat: 'merges', goal: 50, reward: { gems: 5 } },
  { id: 'm500', name: 'Mestre das combinações', desc: 'Faça 500 combinações', stat: 'merges', goal: 500, reward: { gems: 20 } },
  { id: 'm2000', name: 'Lenda do Merge', desc: 'Faça 2000 combinações', stat: 'merges', goal: 2000, reward: { gems: 50, items: ['bau:4'] } },
  { id: 'd10', name: 'Bom atendimento', desc: 'Entregue 10 pedidos', stat: 'deliveries', goal: 10, reward: { gems: 5 } },
  { id: 'd100', name: 'Queridinha da vila', desc: 'Entregue 100 pedidos', stat: 'deliveries', goal: 100, reward: { gems: 25, items: ['bau:3'] } },
  { id: 'g200', name: 'Produção a todo vapor', desc: 'Gere 200 itens', stat: 'generated', goal: 200, reward: { coins: 300 } },
  { id: 'c2000', name: 'Cofrinho cheio', desc: 'Ganhe 2000 moedas', stat: 'coinsEarned', goal: 2000, reward: { gems: 10 } },
  { id: 'b10', name: 'Caçadora de baús', desc: 'Abra 10 baús', stat: 'chests', goal: 10, reward: { items: ['bau:2'] } },
  { id: 'r5', name: 'Mãos à obra', desc: 'Conclua 5 etapas de reforma', stat: 'renovations', goal: 5, reward: { gems: 10 } },
  { id: 'r20', name: 'Arquiteta da vila', desc: 'Conclua 20 etapas de reforma', stat: 'renovations', goal: 20, reward: { gems: 40 } },
  { id: 'dc40', name: 'Curiosa', desc: 'Descubra 40 itens', stat: 'discovered', goal: 40, reward: { gems: 10 } },
  { id: 'dc100', name: 'Enciclopédia da Vila', desc: 'Descubra 100 itens', stat: 'discovered', goal: 100, reward: { gems: 40, items: ['bau:4'] } },
  { id: 't5', name: 'Arqueóloga', desc: 'Encontre 5 tesouros', stat: 'treasures', goal: 5, reward: { gems: 15 } },
  { id: 's5', name: 'Em chamas', desc: 'Alcance uma sequência de 5 entregas', stat: 'bestStreak', goal: 5, reward: { gems: 8 } },
];

export const LOGIN_REWARDS = [
  { coins: 50 }, { energy: 30 }, { gems: 3 }, { items: ['bau:1'], shovels: 3 }, { coins: 150, comps: 2 }, { gems: 6, tickets: 10 }, { items: ['bau:3', 'coringa:1'], gems: 10 },
];

// Missões diárias/semanais: sorteadas de forma determinística pelo dia/semana.
export const TASK_POOL = {
  daily: [
    { id: 'dm', text: 'Faça {n} combinações', stat: 'merges', n: 30, reward: { coins: 60, xp: 10 } },
    { id: 'dd', text: 'Entregue {n} pedidos', stat: 'deliveries', n: 4, reward: { gems: 2, xp: 15 } },
    { id: 'dg', text: 'Gere {n} itens', stat: 'generated', n: 40, reward: { energy: 20 } },
    { id: 'dv', text: 'Venda {n} itens', stat: 'sold', n: 5, reward: { coins: 50 } },
    { id: 'dc', text: 'Colete {n} moedas', stat: 'coinsEarned', n: 200, reward: { comps: 2 } },
    { id: 'db', text: 'Abra {n} baú', stat: 'chests', n: 1, reward: { shovels: 2, xp: 10 } },
  ],
  weekly: [
    { id: 'wm', text: 'Faça {n} combinações', stat: 'merges', n: 250, reward: { gems: 10 } },
    { id: 'wd', text: 'Entregue {n} pedidos', stat: 'deliveries', n: 25, reward: { items: ['bau:3'] } },
    { id: 'wr', text: 'Conclua {n} etapas de reforma', stat: 'renovations', n: 3, reward: { gems: 8, coins: 200 } },
    { id: 'wt', text: 'Encontre {n} tesouro', stat: 'treasures', n: 1, reward: { cards: 2, gems: 4 } },
    { id: 'wg', text: 'Gere {n} itens', stat: 'generated', n: 300, reward: { energy: 60, comps: 4 } },
  ],
};

// Eventos semanais rotativos. Pontos vêm de entregas e do tabuleiro de evento.
export const FESTIVALS = [
  { id: 'festival', name: 'Festival da Vila', icon: '🎈', desc: 'Entregue pedidos e combine itens de festa para somar pontos.' },
  { id: 'mare', name: 'Semana da Maré', icon: '🌊', desc: 'A maré trouxe novidades! Some pontos e suba no placar.' },
  { id: 'flores', name: 'Feira das Flores', icon: '🌸', desc: 'A vila floresceu. Ganhe pontos atendendo os moradores.' },
];
export const FESTIVAL = {
  milestones: [
    { pts: 15, reward: { coins: 80 } }, { pts: 40, reward: { energy: 30 } }, { pts: 80, reward: { gems: 5, cards: 1 } },
    { pts: 140, reward: { items: ['bau:2'], comps: 3 } }, { pts: 220, reward: { gems: 10, items: ['coringa:1'] } },
    { pts: 320, reward: { items: ['bau:3'], cards: 2 } }, { pts: 450, reward: { gems: 25, items: ['bau:4'] } },
  ],
  tickets: { max: 30, regenMs: 180_000 },
  board: { w: 5, h: 5 },
  ticketsPerDelivery: 2,
  // Moradores simulados localmente (não há ranking on-line)
  bots: [['Dona Matilde', 0.55], ['Sol', 0.8], ['Luna', 0.7], ['Rafael', 0.95], ['Vera', 1.15], ['Juninho', 0.35]],
  botMax: 380,
};

export const HUNT = {
  size: 5, treasures: 3, shovelsStart: 5, shovelPerDelivery: 1,
  prize: { gems: 8, coins: 150, items: ['bau:3'], cards: 1 },
  finds: [['nada', 50], ['coins', 26], ['energy', 14], ['gems', 6], ['comps', 4]],
  findAmount: { coins: 25, energy: 8, gems: 1, comps: 1 },
};
