// Escreve assets/LISTA.md: todas as imagens que o jogo aceita, com nome de arquivo e prompt sugerido.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CHAINS, GENERATORS, itemDef, allItemIds } from '../src/data/items.js';
import { CHARACTERS, AREAS, STYLES } from '../src/data/world.js';

const STYLE = 'estilo render 3D cartoon de jogo mobile casual, cores vibrantes e acolhedoras, iluminação suave de estúdio, sombras e brilhos com volume, contornos arredondados';
const ITEM = `ícone de jogo merge, objeto único centralizado, vista 3/4 levemente de cima, ${STYLE}, fundo transparente, sem texto, 512x512`;
const LOOK = {
  dakota: 'jovem mulher de 24 anos, cabelo longo ondulado e volumoso cor-de-rosa com coque alto, óculos de sol sobre a cabeça, flor amarela no cabelo, brincos de argola dourados, pinta perto da boca, olhos castanhos grandes, blusa de tricô branca ombro a ombro e jardineira rosa, colar com pingente de coração',
  matilde: 'senhora de 89 anos, cabelo branco cacheado em coque com flores cor-de-rosa, óculos redondos dourados, vestido roxo escuro florido, colar de pérolas, rosto gentil e sorridente',
  juninho: 'menino de 12 anos, cabelo castanho bem cacheado, sardas, fones de ouvido grandes laranja, moletom verde com cordões',
  sol: 'homem de 26 anos, cabelo preto curto e ondulado, barba por fazer, camisa branca aberta no colarinho, fones de ouvido pretos no pescoço, sorriso tranquilo',
  luna: 'mulher de 24 anos, cabelo preto longo e liso repartido ao meio, blusa rosa, pequenos brincos de argola, olhar simpático',
  rafael: 'homem de 30 anos, cabelo castanho com topete, barba cheia bem aparada, dólmã branca de chef com lenço vermelho',
  vera: 'mulher elegante de 30 anos, cabelo loiro ondulado volumoso, óculos de sol sobre a cabeça, blusa vermelha decotada, batom vermelho, brincos dourados, expressão confiante',
  teco: 'cachorro vira-lata caramelo com manchas brancas no focinho e peito, orelhas caídas, coleira vermelha com medalha dourada, língua de fora',
  visitante: 'figura misteriosa encapuzada com capa roxo-escura, rosto na sombra, olhos brilhando amarelo',
};
const EXPR = { feliz: 'sorriso aberto', rindo: 'rindo com os olhos fechados', neutro: 'expressão calma', triste: 'expressão triste, sobrancelhas caídas', surpreso: 'expressão de surpresa, boca em O', bravo: 'expressão zangada, sobrancelhas franzidas' };
const ST = { abandonado: 'abandonada e desgastada, janelas fechadas com tábuas, telhado quebrado, mato crescendo', limpo: 'limpa e consertada, paredes creme e telhado de telha vermelha, ainda simples', reformado: 'reformada, cores alegres, venezianas, floreiras nas janelas', decorado: 'totalmente decorada, toldo listrado, varal de luzes, plantas e flores, placa com o nome' };

let md = `# Lista de artes do Dakota Vila\n\nColoque cada imagem com o **nome de arquivo** indicado na pasta indicada e rode \`npm run assets\`.\nQualquer imagem que faltar continua com a arte gerada por código. Prompts em português; para geradores que funcionam melhor em inglês, traduza mantendo o trecho de estilo igual em todas as imagens.\n\nEstilo base (repita em todos os prompts para manter consistência):\n> ${STYLE}\n\n`;
md += `## Personagens — pasta \`assets/characters/\` (PNG 512×512, fundo transparente ou degradê suave)\n\nUm arquivo \`<id>.png\` já basta; arquivos por expressão (\`<id>-rindo.png\`) são opcionais.\n\n| Arquivo | Prompt |\n|---|---|\n`;
for (const [id, c] of Object.entries(CHARACTERS)) {
  md += `| \`${id}.png\` | Retrato busto de ${c.name}: ${LOOK[id]}, ${EXPR.feliz}, ${STYLE}, enquadramento do peito para cima |\n`;
  for (const [e, d] of Object.entries(EXPR)) if (e !== 'feliz') md += `| \`${id}-${e}.png\` | mesmo personagem e enquadramento, ${d} |\n`;
}
md += `\n## Vila — pasta \`assets/areas/\` (PNG 1024×1024, fundo transparente, construção isolada em vista isométrica, base no rodapé da imagem)\n\n| Arquivo | Prompt |\n|---|---|\n`;
for (const a of AREAS) for (const [st, d] of Object.entries(ST)) md += `| \`${a.id}-${st}.png\` | ${a.name} em vista isométrica de cima, ${d}, ${STYLE}, fundo transparente |\n`;
md += `\nObservação: na vila, o estilo escolhido (${Object.values(STYLES).map((s) => s.name).join(', ')}) só altera a arte gerada por código; uma imagem por estado vale para qualquer estilo.\n`;
md += `\n## Itens — pasta \`assets/items/\` (PNG 512×512, fundo transparente)\n\nPrompt de cada item: **"<descrição>, ${ITEM}"**. Mantenha a mesma iluminação e ângulo em toda a cadeia; níveis mais altos devem parecer mais ricos e brilhantes.\n\n`;
for (const [g, def] of Object.entries(GENERATORS)) md += `- \`gen-${g}.png\` — gerador: ${def.name} (objeto especial com moldura dourada)\n`;
for (const [chain, c] of Object.entries(CHAINS)) {
  md += `\n### ${c.name}\n`;
  c.items.forEach((_, i) => { const d = itemDef(`${chain}:${i + 1}`); md += `- \`${chain}-${i + 1}.png\` — ${d.name} (nível ${i + 1}/${c.items.length})\n`; });
}
md += `\nTotal: ${allItemIds().length} itens, ${Object.keys(GENERATORS).length} geradores, ${Object.keys(CHARACTERS).length} personagens, ${AREAS.length * 4} imagens de vila.\n`;
writeFileSync(fileURLToPath(new URL('../assets/LISTA.md', import.meta.url)), md);
console.log('assets/LISTA.md atualizado');
