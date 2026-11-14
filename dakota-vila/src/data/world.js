// Personagens, pedidos, vila, história e álbum — conteúdo original de Dakota Vila.

export const CHARACTERS = {
  dakota: { name: 'Dakota', role: 'Você', bio: 'Voltou para a vila onde cresceu para reerguer o restaurante da avó.', look: { skin: '#f7cdb0', hair: '#ff5fa2', style: 'long', cloth: '#ff8fb8', acc: ['flower', 'earring', 'shades'] } },
  matilde: { name: 'Dona Matilde', role: 'Avó · 89 anos', bio: 'Fundadora do restaurante Maré Mansa. Guarda receitas — e segredos.', look: { skin: '#f3c6a5', hair: '#e9e6ee', style: 'bun', cloth: '#7a4fb0', acc: ['glasses', 'flower'] } },
  juninho: { name: 'Juninho', role: 'Filho da Dakota · 12 anos', bio: 'Inventor mirim, vive de fone no ouvido e conserta tudo na oficina.', look: { skin: '#e8b48c', hair: '#5a3620', style: 'curly', cloth: '#4fb05a', acc: ['headphones'] } },
  sol: { name: 'Sol', role: 'Amigo de infância', bio: 'Músico e barista. Toca violão no píer ao pôr do sol.', look: { skin: '#d9a273', hair: '#2a2230', style: 'short', cloth: '#f5f1e8', acc: ['stubble'] }, romance: true },
  luna: { name: 'Luna', role: 'Melhor amiga', bio: 'Florista da praça, sabe de todas as novidades da vila.', look: { skin: '#f0c4a4', hair: '#231a2a', style: 'straight', cloth: '#f7a6c8', acc: ['earring'] } },
  evie: { name: 'Evie', role: 'Amiga', bio: 'Fotógrafa e surfista, chegou de mochila para fotografar o farol e acabou ficando. Topa qualquer aventura.', look: { skin: '#f6d2bc', hair: '#c8552e', style: 'wavy', cloth: '#ffd25e', acc: ['freckles', 'earring'] } },
  rafael: { name: 'Rafael', role: 'Chef', bio: 'Chef viajante que parou na vila "por uma semana". Já faz um ano.', look: { skin: '#e0ad82', hair: '#4a2c1a', style: 'short', cloth: '#ffffff', acc: ['beard'] }, romance: true },
  vera: { name: 'Vera', role: 'Rival', bio: 'Empresária elegante que quer comprar a vila inteira para um resort.', look: { skin: '#f5d0b5', hair: '#f0c75e', style: 'wavy', cloth: '#e4576b', acc: ['shades', 'earring'] } },
  teco: { name: 'Teco', role: 'Mascote', bio: 'Vira-lata caramelo com manchas brancas. Fareja confusão de longe.', look: { dog: true } },
  visitante: { name: '???', role: 'Misterioso', bio: 'Alguém anda deixando cartas assinadas apenas com um "A.".', look: { mystery: true } },
};

// Clientes que fazem pedidos (ids de CHARACTERS)
export const CUSTOMERS = ['matilde', 'juninho', 'sol', 'luna', 'evie', 'rafael', 'vera'];

// 24 pedidos escritos à mão, servidos em ordem; depois deles os pedidos são gerados.
// kind: normal | vip | tempo.  lvl = nível mínimo do jogador.
export const ORDERS = [
  { who: 'matilde', need: [['cafe:2', 1]], line: 'Um cafezinho para começar o dia, minha flor.', lvl: 1 },
  { who: 'juninho', need: [['pao:2', 1]], line: 'Tô com fome! Tem baguete?', lvl: 1 },
  { who: 'luna', need: [['cha:2', 1], ['ingred:2', 1]], line: 'Chá e ovos para o café da floricultura!', lvl: 1 },
  { who: 'sol', need: [['cafe:3', 1]], line: 'Um pingado, do jeitinho que a vó fazia.', lvl: 1 },
  { who: 'matilde', need: [['pao:3', 1], ['ingred:3', 1]], line: 'Pão com manteiga… não existe nada melhor.', lvl: 1 },
  { who: 'rafael', need: [['ingred:4', 1]], line: 'Preciso de um bom queijo para testar uma receita.', lvl: 1 },
  { who: 'juninho', need: [['doce:2', 2]], line: 'Dois biscoitos. É pra… ciência.', lvl: 2 },
  { who: 'luna', need: [['cha:3', 1], ['doce:3', 1]], line: 'Bule de chá e rosquinha: fofoca garantida.', lvl: 2 },
  { who: 'vera', need: [['cafe:4', 1]], line: 'Café gelado. E rápido, meu tempo vale ouro.', lvl: 2, kind: 'tempo' },
  { who: 'sol', need: [['pao:4', 1], ['cafe:2', 2]], line: 'Croissant e café para a banda toda!', lvl: 2 },
  { who: 'rafael', need: [['ingred:5', 1], ['pao:3', 1]], line: 'Azeitonas e pão: a entrada perfeita.', lvl: 2 },
  { who: 'matilde', need: [['doce:4', 1], ['cha:2', 1]], line: 'Um cupcake para adoçar a tarde.', lvl: 2 },
  { who: 'luna', need: [['fruta:3', 1], ['cha:5', 1]], line: 'Banana e suco natural, estou de dieta (hoje).', lvl: 3 },
  { who: 'vera', need: [['doce:5', 1], ['cafe:4', 1]], line: 'Pudim. Não conte a ninguém que eu gostei.', lvl: 3, kind: 'vip' },
  { who: 'juninho', need: [['pao:5', 2]], line: 'Dois pastéis de feira, por favor!', lvl: 3 },
  { who: 'sol', need: [['fruta:4', 1], ['cha:6', 1]], line: 'Manga e vitamina para depois do surfe.', lvl: 3 },
  { who: 'rafael', need: [['ingred:6', 1], ['pao:6', 1]], line: 'Molho da casa e sanduíche: vamos criar um prato novo.', lvl: 4 },
  { who: 'matilde', need: [['flor:4', 1], ['doce:6', 1]], line: 'Tulipas e bolo… hoje faz anos que abri o Maré Mansa.', lvl: 4, kind: 'vip' },
  { who: 'luna', need: [['flor:5', 2]], line: 'Girassóis para a vitrine nova!', lvl: 4 },
  { who: 'vera', need: [['cha:7', 1]], line: 'Um drinque tropical. Estou "avaliando o terreno".', lvl: 5, kind: 'tempo' },
  { who: 'rafael', need: [['mar:4', 1], ['ingred:5', 1]], line: 'Caranguejo fresco! Hoje tem moqueca.', lvl: 5 },
  { who: 'sol', need: [['mar:3', 1], ['fruta:5', 1]], line: 'Lula e abacaxi. Confia.', lvl: 5 },
  { who: 'juninho', need: [['doce:7', 1]], line: 'Uma torta inteira. Divido com o Teco!', lvl: 6 },
  { who: 'matilde', need: [['utens:5', 1], ['mar:5', 1]], line: 'Lagosta no prato fino, como nos velhos tempos.', lvl: 6, kind: 'vip' },
];

// Falas para pedidos gerados
export const ORDER_LINES = {
  matilde: ['Tem um agrado para a vovó?', 'Isso me lembra a cozinha antiga.', 'Capricha, minha menina.'],
  juninho: ['Preciso disso pra uma invenção!', 'Rápido, o Teco tá esperando!', 'Valeu, mãe!'],
  sol: ['Combina com o som de hoje.', 'Pra viagem, vou tocar no píer.', 'Você sempre acerta.'],
  luna: ['A vila inteira está comentando disso!', 'Preciso para a floricultura.', 'Depois te conto uma novidade…'],
  evie: ['Isso vai render uma foto linda!', 'Pra levar no piquenique da praia.', 'Você é demais, amiga!'],
  rafael: ['Ingrediente perfeito, prato perfeito.', 'Estou testando o cardápio novo.', 'O segredo é o frescor.'],
  vera: ['Surpreenda-me, se conseguir.', 'Espero qualidade de resort.', 'Hm. Aceitável.'],
};

export const STYLES = {
  rustico: { name: 'Rústico', wall: '#e8cfa6', wall2: '#cfae7c', roof: '#b5523a', trim: '#7a4a2a', floor: '#c98f5a', floor2: '#a8713f', accent: '#d9833a', furn: '#8a5a33', cloth: '#f3e3c3' },
  tropical: { name: 'Tropical', wall: '#ffd6e4', wall2: '#f7a8c6', roof: '#ff7f6e', trim: '#2fb5a5', floor: '#ffe9c9', floor2: '#ffcf8f', accent: '#ffcc33', furn: '#f08fb0', cloth: '#ffffff' },
  moderno: { name: 'Moderno', wall: '#f4f6fa', wall2: '#d5dbe6', roof: '#4a5b78', trim: '#2c3850', floor: '#dfe5ee', floor2: '#b9c4d4', accent: '#6c8cff', furn: '#5b6b88', cloth: '#eef2f8' },
};

// Áreas da vila. type define o desenho; pos em coordenadas isométricas da grade.
// steps: cada etapa custa estrelas; `choice` abre a escolha de estilo; `scene` dispara história.
const generic = (c1, c2, c3) => [
  { id: 'limpar', name: 'Limpar o terreno', stars: c1 },
  { id: 'estilo', name: 'Reformar', stars: c2, choice: 'estilo' },
  { id: 'decor', name: 'Decorar', stars: c3, choice: 'decor' },
];
export const AREAS = [
  { id: 'restaurante', name: 'Restaurante Maré Mansa', icon: '🍽️', type: 'building', pos: [6.13, 2.74], size: 1.25, lvl: 1, interior: true, steps: [
    { id: 'limpar', name: 'Retirar o entulho', stars: 2, scene: 'r_limpar' },
    { id: 'piso', name: 'Trocar o piso', stars: 4, choice: 'piso', scene: 'r_piso' },
    { id: 'parede', name: 'Pintar as paredes', stars: 5, choice: 'parede', scene: 'r_parede' },
    { id: 'moveis', name: 'Mesas e cadeiras', stars: 7, choice: 'moveis', scene: 'r_moveis' },
    { id: 'decor', name: 'Decoração do salão', stars: 9, choice: 'decor', scene: 'r_decor' },
    { id: 'estilo', name: 'Fachada e letreiro', stars: 12, choice: 'estilo', scene: 'r_fachada' },
  ] },
  { id: 'cafeteria', name: 'Cafeteria & Confeitaria', icon: '☕', type: 'building', pos: [3.02, 5.85], size: 0.95, lvl: 2, interior: true, steps: [
    { id: 'limpar', name: 'Limpar o terreno', stars: 5, scene: 'caf_1' },
    { id: 'piso', name: 'Trocar o piso', stars: 6, choice: 'piso' },
    { id: 'parede', name: 'Pintar as paredes', stars: 6, choice: 'parede' },
    { id: 'moveis', name: 'Balcão e mesinhas', stars: 7, choice: 'moveis' },
    { id: 'decor', name: 'Vitrine e decoração', stars: 8, choice: 'decor' },
    { id: 'estilo', name: 'Fachada e letreiro', stars: 10, choice: 'estilo', scene: 'caf_2' },
  ] },
  { id: 'praca', name: 'Praça da Fonte', icon: '⛲', type: 'plaza', pos: [1.45, 4.03], size: 1.1, lvl: 3, steps: [
    { id: 'limpar', name: 'Limpar o terreno', stars: 8, scene: 'praca_1' }, { id: 'estilo', name: 'Reformar', stars: 12, choice: 'estilo' }, { id: 'decor', name: 'Decorar', stars: 16, choice: 'decor' }] },
  { id: 'casas', name: 'Casas dos Moradores', icon: '🏠', type: 'houses', pos: [1.37, 7.5], size: 1, lvl: 4, steps: generic(10, 15, 20) },
  { id: 'praia', name: 'Praia do Sossego', icon: '🏖️', type: 'beach', pos: [8.06, 10.81], size: 1.3, lvl: 5, steps: [
    { id: 'limpar', name: 'Limpar o terreno', stars: 12, scene: 'praia_1' }, { id: 'estilo', name: 'Reformar', stars: 18, choice: 'estilo' }, { id: 'decor', name: 'Decorar', stars: 24, choice: 'decor' }] },
  { id: 'pier', name: 'Porto e Píer', icon: '⚓', type: 'pier', pos: [13.23, 5.16], size: 1, lvl: 6, steps: [
    { id: 'limpar', name: 'Limpar o terreno', stars: 14, scene: 'pier_1' }, { id: 'estilo', name: 'Reformar', stars: 20, choice: 'estilo' }, { id: 'decor', name: 'Decorar', stars: 28, choice: 'decor' }] },
  { id: 'mercado', name: 'Mercado e Lojas', icon: '🛒', type: 'building', pos: [8.15, 0.89], size: 1, lvl: 7, steps: generic(16, 24, 32) },
  { id: 'pousada', name: 'Hotel Pousada', icon: '🏨', type: 'building', pos: [9.6, 6.85], size: 1.1, tall: true, lvl: 8, steps: generic(18, 28, 36) },
  { id: 'parque', name: 'Parque das Mangueiras', icon: '🎠', type: 'park', pos: [10.97, 4.84], size: 1.1, lvl: 9, steps: generic(20, 30, 40) },
  { id: 'salao', name: 'Salão de Festas', icon: '🎉', type: 'building', pos: [4.76, 10.73], size: 1, lvl: 10, steps: generic(24, 36, 48) },
];

// Álbum da Vila: 3 coleções de 6 cartas
export const ALBUM = [
  { id: 'sabores', name: 'Sabores da Vila', reward: { gems: 15, items: ['bau:3'] }, cards: [['☕', 'Primeiro café'], ['🥐', 'Fornada da manhã'], ['🎂', 'Bolo da vovó'], ['🍤', 'Petisco do píer'], ['🍹', 'Brinde ao pôr do sol'], ['🍝', 'Almoço de domingo']] },
  { id: 'paisagens', name: 'Paisagens', reward: { gems: 15, energy: 60 }, cards: [['🌅', 'Nascer do sol'], ['🏖️', 'Praia do Sossego'], ['⛲', 'A velha fonte'], ['🗼', 'Farol apagado'], ['🌴', 'Coqueiral'], ['🌈', 'Depois da chuva']] },
  { id: 'memorias', name: 'Memórias', reward: { gems: 25, items: ['bau:4'] }, cards: [['📷', 'Foto antiga'], ['💌', 'Carta de "A."'], ['🗝️', 'Chave do farol'], ['📖', 'Caderno de receitas'], ['🎸', 'Violão do Sol'], ['🐾', 'Pegadas do Teco']] },
];

// História. Linha: [quem, expressão, texto] ou { escolha: [{ t, rel: {id: n}, resp: [quem, expr, texto] }] }
export const CHAPTERS = [
  { id: 1, name: 'A volta para casa' },
  { id: 2, name: 'Cartas sem remetente' },
  { id: 3, name: 'Maré de mudanças' },
];
export const SCENES = {
  intro: { cap: 1, title: 'De volta à Dakota Vila', bg: 'vila', lines: [
    ['matilde', 'rindo', 'Minha menina… ver você de volta em Dakota Vila é a maior alegria do meu coração!'],
    ['dakota', 'feliz', 'Vó! Que saudade. A vila continua linda… mas o que aconteceu com o Maré Mansa?'],
    ['matilde', 'triste', 'Depois da tempestade do ano passado, fechei as portas. Sozinha eu não dava conta.'],
    ['teco', 'feliz', 'Au! Au!'],
    ['dakota', 'surpreso', 'Teco! Você ainda lembra de mim!'],
    ['matilde', 'feliz', 'Vamos reconstruir essa vila juntas? Comece atendendo os vizinhos — cada pedido rende estrelas para a reforma.'],
    { escolha: [
      { t: 'Vamos! Mãos à obra.', rel: { matilde: 1 }, resp: ['matilde', 'rindo', 'Essa é a minha neta!'] },
      { t: 'Antes, um café. Depois, o mundo.', rel: { matilde: 1 }, resp: ['matilde', 'rindo', 'Puxou a mim. A cafeteira ainda funciona!'] },
    ] },
    ['juninho', 'feliz', 'Bisa! Eu também vim! A mãe disse que aqui tem uma oficina velha só esperando por mim.'],
    ['matilde', 'rindo', 'Meu bisneto inventor! Com vocês dois aqui, essa vila vai voltar a ter vida.'],
  ] },
  r_limpar: { cap: 1, title: 'Poeira e lembranças', bg: 'interior', lines: [
    ['dakota', 'neutro', 'Ufa. Dez sacos de entulho depois… dá pra ver o chão de novo.'],
    ['juninho', 'feliz', 'Mãe! Achei isso atrás do balcão: uma caixa de lata toda enferrujada.'],
    ['dakota', 'surpreso', 'Tem um caderno de receitas dentro… e faltam várias páginas.'],
    ['matilde', 'surpreso', 'Meu caderno! Achei que a tempestade tinha levado. As páginas… alguém arrancou.'],
    ['juninho', 'neutro', 'Mistério! Eu investigo. Digo, depois do lanche.'],
  ] },
  r_piso: { cap: 1, title: 'Chão novo, visita velha', bg: 'interior', lines: [
    ['sol', 'feliz', 'Olha só quem voltou! A vila ficou mais colorida de repente.'],
    ['dakota', 'feliz', 'Sol! Você ainda toca no píer?'],
    ['sol', 'rindo', 'Todo fim de tarde. Guardei seu lugar na primeira fila por… uns sete anos.'],
    { escolha: [
      { t: 'Então hoje eu vou cobrar esse lugar.', rel: { sol: 2 }, resp: ['sol', 'feliz', 'Combinado. Levo o violão, você leva o café.'] },
      { t: 'Primeiro me ajuda com esse piso?', rel: { sol: 1 }, resp: ['sol', 'rindo', 'Trabalho braçal em troca de café? Fechado.'] },
    ] },
  ] },
  r_parede: { cap: 1, title: 'Uma proposta', bg: 'interior', lines: [
    ['vera', 'neutro', 'Então é verdade. Alguém resolveu brincar de restaurante nesta ruína.'],
    ['dakota', 'neutro', 'Posso ajudar? Ainda não abrimos.'],
    ['vera', 'feliz', 'Vera Albuquerque. Estou comprando os terrenos da orla para um resort. Faço uma oferta generosa pelo seu.'],
    ['matilde', 'bravo', 'O Maré Mansa não está à venda. Nem hoje, nem nunca.'],
    { escolha: [
      { t: 'A resposta é não. Mas o café é por conta da casa.', rel: { vera: 1, matilde: 1 }, resp: ['vera', 'surpreso', 'Hm. Gentileza estratégica. Interessante.'] },
      { t: 'Pode ir embora. A vila não é mercadoria.', rel: { matilde: 2 }, resp: ['vera', 'neutro', 'Todo mundo tem um preço, querida. Eu volto.'] },
    ] },
  ] },
  r_moveis: { cap: 1, title: 'O chef que ficou', bg: 'interior', lines: [
    ['rafael', 'feliz', 'Com licença. Disseram que aqui vai reabrir a melhor cozinha do litoral.'],
    ['dakota', 'surpreso', 'Disseram? Quem?'],
    ['rafael', 'rindo', 'Uma senhora de óculos, um menino de fone e um cachorro. O cachorro foi o mais convincente.'],
    ['rafael', 'neutro', 'Sou Rafael. Cozinho. Se precisar de um chef, trabalho por comida boa e uma janela para o mar.'],
    { escolha: [
      { t: 'Contratado. A janela é toda sua.', rel: { rafael: 2 }, resp: ['rafael', 'feliz', 'Então amanhã eu trago as facas. E um prato para você provar.'] },
      { t: 'Faz um teste primeiro: o prato favorito da vó.', rel: { rafael: 1, matilde: 1 }, resp: ['rafael', 'rindo', 'Desafio aceito. Mas vou precisar daquele caderno de receitas…'] },
    ] },
  ] },
  r_decor: { cap: 1, title: 'A primeira carta', bg: 'interior', lines: [
    ['luna', 'feliz', 'Trouxe flores para a inauguração! E uma fofoca: tinha um envelope preso na sua porta.'],
    ['dakota', 'surpreso', '"Para a neta da Matilde. O que você procura não se perdeu na tempestade. — A."'],
    ['luna', 'surpreso', 'Quem é "A."? Ai, que delícia de mistério!'],
    ['matilde', 'triste', '…'],
    ['dakota', 'neutro', 'Vó? A senhora conhece essa letra?'],
    ['matilde', 'neutro', 'Uma coisa de cada vez, minha flor. Primeiro a gente abre as portas.'],
  ] },
  r_fachada: { cap: 1, title: 'Reinauguração', bg: 'vila', lines: [
    ['matilde', 'rindo', 'O letreiro aceso de novo… achei que nunca mais veria isso.'],
    ['sol', 'feliz', 'Casa cheia, hein? A vila inteira veio.'],
    ['rafael', 'feliz', 'Cozinha pronta, chef a postos.'],
    ['vera', 'neutro', 'Bonitinho. Vamos ver quanto tempo dura.'],
    ['teco', 'bravo', 'Grrr…'],
    ['dakota', 'feliz', 'O Maré Mansa está aberto! E isso é só o começo — a vila toda vai voltar a brilhar.'],
    ['visitante', 'neutro', '(Do outro lado da rua, alguém observa a festa… e deixa outro envelope na caixa de correio.)'],
  ] },
  caf_1: { cap: 2, title: 'A cafeteria esquecida', bg: 'vila', lines: [
    ['luna', 'feliz', 'Essa cafeteria era o ponto de encontro da vila. Sua avó e a sócia dela faziam os melhores doces!'],
    ['dakota', 'surpreso', 'Sócia? A vó nunca falou de sócia nenhuma.'],
    ['luna', 'surpreso', 'Ops. Eu e minha boca grande…'],
    ['juninho', 'feliz', 'Achei outra página do caderno debaixo do balcão! Receita de "Bolo das Duas Amigas".'],
    ['dakota', 'neutro', 'Assinada por Matilde e… "Aurora". A.'],
  ] },
  caf_2: { cap: 2, title: 'Aurora', bg: 'interior', lines: [
    ['dakota', 'neutro', 'Vó, quem é Aurora?'],
    ['matilde', 'triste', 'Minha melhor amiga. Abrimos tudo juntas. Brigamos por uma bobagem — e ela foi embora há trinta anos.'],
    ['matilde', 'neutro', 'Ela levou metade do caderno. Disse que só devolveria quando eu pedisse desculpas.'],
    { escolha: [
      { t: 'Nunca é tarde para pedir desculpas, vó.', rel: { matilde: 2 }, resp: ['matilde', 'feliz', 'Você fala igualzinho à sua mãe. Talvez… talvez tenha razão.'] },
      { t: 'Eu vou encontrá-la. Deixa comigo.', rel: { matilde: 1, juninho: 1 }, resp: ['matilde', 'surpreso', 'Teimosa. Também puxou a mim.'] },
    ] },
  ] },
  praca_1: { cap: 2, title: 'A fonte dos pedidos', bg: 'vila', lines: [
    ['sol', 'feliz', 'Lembra? A gente jogava moedas aqui e pedia para nunca sair da vila.'],
    ['dakota', 'rindo', 'E eu fui a primeira a ir embora. Péssima fonte.'],
    ['sol', 'neutro', 'Ou ótima. Você voltou.'],
    ['teco', 'feliz', 'Au! (Teco cava ao pé da fonte e desenterra uma chave antiga.)'],
    ['dakota', 'surpreso', 'Uma chave… com um farol gravado.'],
  ] },
  lvl3: { cap: 1, title: 'A oficina do Juninho', bg: 'vila', lines: [
    ['juninho', 'feliz', 'Mãe! Montei a Oficina Dakota. Me traz peças 🧩 que eu deixo seus geradores turbinados!'],
    ['dakota', 'feliz', 'Você é um gênio, filho.'],
    ['juninho', 'rindo', 'Eu sei. Ah, e plantei um pomar pra você. Ele dá fruta sozinho!'],
  ] },
  lvl5: { cap: 2, title: 'Jantar de negócios', bg: 'interior', lines: [
    ['vera', 'feliz', 'Vim jantar. Não me olhe assim, até rivais precisam comer.'],
    ['rafael', 'neutro', 'Mesa para uma. Hoje tem peixe fresco.'],
    ['vera', 'neutro', 'Sabe, Dakota… eu cresci numa vila assim. Ela não existe mais. Viraram um estacionamento.'],
    { escolha: [
      { t: 'Então você sabe o que estamos protegendo.', rel: { vera: 2 }, resp: ['vera', 'triste', '…Não me faça gostar de você. Atrapalha os negócios.'] },
      { t: 'E agora quer fazer o mesmo com a nossa?', rel: { vera: -1, rafael: 1 }, resp: ['vera', 'bravo', 'Eu quero garantir que alguém lucre antes que tudo desabe. Só isso.'] },
    ] },
  ] },
  praia_1: { cap: 3, title: 'Pegadas na areia', bg: 'vila', lines: [
    ['dakota', 'neutro', 'A praia limpa fica tão bonita… espera. Essas pegadas vão até o farol.'],
    ['rafael', 'neutro', 'O farol está fechado desde antes de eu chegar. Dizem que alguém acende uma luz lá, às vezes.'],
    { escolha: [
      { t: 'Vem comigo investigar?', rel: { rafael: 2 }, resp: ['rafael', 'feliz', 'Levo lanche. Toda boa investigação precisa de lanche.'] },
      { t: 'Vou chamar o Sol, ele conhece o caminho.', rel: { sol: 2 }, resp: ['rafael', 'rindo', 'Justo. Eu cuido da cozinha — e do Teco.'] },
    ] },
  ] },
  pier_1: { cap: 3, title: 'O visitante do píer', bg: 'vila', lines: [
    ['visitante', 'neutro', 'Você tem os olhos da Matilde. E a teimosia também, pelo visto.'],
    ['dakota', 'surpreso', 'Aurora?'],
    ['visitante', 'neutro', 'Ainda não, menina. Reforme o píer, reacenda a vila. Quando o farol voltar a brilhar, eu apareço — com o resto do caderno.'],
    ['dakota', 'feliz', 'Então é uma promessa.'],
    ['teco', 'feliz', 'Au!'],
  ] },
};

// Cenas disparadas ao atingir nível
export const LEVEL_SCENES = { 3: 'lvl3', 5: 'lvl5' };
