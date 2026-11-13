# HANDOFF — Dakota Vila

Documento para continuar o desenvolvimento em outra sessão (ex.: Claude Code no computador da dona do projeto).
Leia inteiro antes de mexer no código. Atualizado em 13/11/2026.

## 1. Onde está o código

- Repositório: `dayjapinhagshy-sudo/dakelara-site` (GitHub)
- Branch de trabalho: **`ccr-72d8610c-1aw24w`** — todo o jogo está aqui
- PR em rascunho: **#1** → `main` (sem conflitos; o repositório não tem CI)
- Pasta do jogo: `dakota-vila/`. O resto do repositório (`index.html`, `estilo.css`, `privacidade.html`) é o site da Dakelara: **não alterar**.

```bash
git clone https://github.com/dayjapinhagshy-sudo/dakelara-site.git   # ou: git fetch origin
cd dakelara-site
git checkout ccr-72d8610c-1aw24w
git pull
cd dakota-vila
npm start          # http://localhost:8080  (Node 18+; sem npm install, não há dependências)
npm test           # 38 testes do motor (node:test)
```

Teste de interface (opcional, exige Playwright e o servidor rodando em outro terminal):
```bash
npm i -D playwright && npx playwright install chromium
node tests/ui-smoke.mjs [pasta-para-capturas]
```

## 2. O pedido original (resumo)

Jogo **Merge-2** chamado **Dakota Vila**, com a profundidade de sistemas de jogos do gênero (tabuleiro de combinar, pedidos, vila para reformar, história), mas com **universo, personagens, nomes e arte 100% originais** — nada copiado de jogos existentes.
Interface em **português brasileiro**, **vertical para celular**, gratuito, **sem anúncios nem compras obrigatórias**, salvamento local automático, preparado para Android/Windows no futuro.
Direção de arte desejada: **3D cartoon estilizado**, colorido, acolhedor, aparência premium de jogo mobile.

**Referência visual: `docs/mockup.png`** (imagem da própria autora). Mostra: menu com a Dakota apoiada na mão, tabuleiro lilás, vila isométrica com telhados vermelhos e árvores rosadas, galeria de personagens, cena da Dona Matilde abraçando a Dakota, tela "Reformar & Decorar" com Antes/Depois e 3 estilos (Rústico/Tropical/Moderno), cartões de Eventos/Coleções/Oficina.

Regras que a autora definiu: inspecionar antes de criar; não substituir funcionalidade por botão decorativo; não declarar etapa pronta sem teste; não apagar trabalho sem autorização; registrar o que funciona, o que falta e bloqueios.

## 3. Arquitetura

JavaScript puro em ES modules, sem build, sem dependências. Motor separado da interface (o motor roda e é testado no Node, sem DOM).

```
src/data/      conteúdo e balanceamento (SEM lógica) — editar aqui para conteúdo novo
  items.js       25 cadeias / 146 itens, 14 geradores (+1 de evento), saque de baús, itemDef(id)
  config.js      economia, tabuleiro inicial 7×9, loja, conquistas, missões, festival, caça ao tesouro
  world.js       10 personagens (inclui Evie), 24 pedidos escritos, 10 áreas da vila, 3 estilos, álbum, 14 cenas
src/engine/    regras puras
  core.js        estado (newGame), RNG injetável (setRng/seeded), barramento bus, energia, grant, XP/nível
  board.js       motor Merge-2 reutilizável para qualquer state.boards[k]: drop, activate, produce, tick, sell/undo, inventário
  orders.js      pedidos: máquina de estados aguardando ⇄ pronto → entregue | expirado
  meta.js        vila/reformas, história, oficina, loja, login, missões, festival, tesouro, álbum, conquistas
  save.js        localStorage com cópia de segurança, migração de saves antigos, recuperação de corrupção
src/ui/        apresentação
  app.js         cenas (menu/board/village), HUD, diálogos, arrastar-e-soltar, laço de 1 s, autosave; window.__dakota = estado (depuração/testes)
  panels.js      folhas modais (área, inventário, loja, oficina, coleções, eventos, personagens, história, perfil, config, nível, ajuda)
  portraits.js   retratos SVG (6 expressões: feliz, rindo, neutro, triste, surpreso, bravo), Teco (cão) e visitante misterioso
  art.js         vila isométrica, visão ampliada das áreas, interior do restaurante, fundos de cena, VDEFS (gradientes)
  assets.js      troca opcional de arte por PNG via assets/manifest.json
  audio.js       efeitos e música sintetizados com WebAudio
  util.js        helpers ($, esc, fmt, ico, itemFace, bar)
tools/         list-assets.mjs (gera assets/LISTA.md com prompts), build-manifest.mjs (gera manifest.json)
tests/         engine.test.js (38 testes), ui-smoke.mjs (fluxo completo no Chromium)
```

Convenções:
- IDs de item: `cadeia:nível` (ex. `cafe:3`), geradores `gen:tipo` (ex. `gen:cafe`).
- Funções do motor retornam `{ ok: true, type, ... }` ou `{ ok: false, why }`; a interface traduz `why` em `FAIL` (app.js).
- Toda ação da interface passa por `commit(r)` (atualiza pedidos, redesenha, efeitos, `flow()` para cenas/avisos).
- Textos de interface e comentários em português. Sem dependências externas sem necessidade.
- O teste `dados: todas as referências são válidas` pega IDs quebrados e **ícones repetidos** entre itens — rode `npm test` após editar `src/data/`.

## 4. O que está funcional (testado)

- Merge-2 completo: mover/trocar/combinar, caixotes (`covered`) e presos (`locked`), bolhas temporárias, baús de 4 raridades, coletáveis (moeda/energia/gema/XP/peça), tesoura/coringa/acelerador, vender/descartar/desfazer, inventário expansível, caixa de entrada.
- 14 geradores (11 manuais, 3 automáticos), 5 níveis cada, cargas e recarga; Oficina para evoluir com peças 🧩.
- Pedidos: 24 escritos + gerados; normal/VIP/com prazo/do dia/da semana; sequência com bônus; afinidade por cliente.
- Vila isométrica: 10 áreas em 4 estados (abandonado → limpo → reformado → decorado), 3 estilos por etapa, troca de estilo salva; restaurante com interior em 6 etapas (piso, parede, móveis, decoração, fachada).
- História: 14 cenas em 3 capítulos, escolhas que mudam afinidade, histórico para rever, cenas com quem fala + quem ouve; protagonista personalizável (nome, cabelo, pele).
- Eventos: login de 7 dias, missões diárias/semanais, festival semanal (tabuleiro 5×5 com fichas 🎟️, passe gratuito, placar simulado), caça ao tesouro (pás), Álbum da Vila, conquistas.
- Economia: energia com regeneração (também offline), moedas, gemas, estrelas, XP/níveis, loja.
- Salvamento automático + exportar/importar save. Layout verificado de 320×568 a 1280×800.
- Arte trocável por PNG (ver seção 6).

## 5. O que falta / próximos passos (em ordem sugerida)

1. **Arte 3D real (prioridade da autora)** — *em 13/11/2026 entrou a 1ª leva: 10 personagens × 6 expressões, 156 itens e geradores, 9 áreas × 4 estados. 2ª leva (mesmo dia): os 5 itens que faltavam, o `salao` nos 4 estados e `dakota-menu` (tela inicial). **Todos os 161 itens/geradores, 10 personagens e 10 áreas têm imagem.** Falta só arte para os interiores (hoje desenhados em SVG). O mapeamento folha → nomes fica em `assets/originais/_folhas.json` (a pasta originais não vai para o git).* A arte atual é SVG com degradês (semi-3D) e itens com emojis do sistema. O caminho combinado: gerar imagens em estilo render 3D cartoon e soltar em `assets/`. Começar pelos 9 retratos, depois os 14 geradores e as primeiras cadeias (café, pães, ingredientes, doces). Ver seção 6.
2. ~~Mais fiel ao mockup~~ **feito em 13/11/2026**: menu com a Dakota apoiada na mão + cappuccino (ou `characters/dakota-menu.png`); barra lateral no tabuleiro (mochila, entrada, missões, próxima reforma, loja); reforma com **Antes → Depois** e "Escolha um estilo"; cartões ilustrados em Eventos (Festival com balão, Álbum com %, Oficina com geradores, Missões, Tesouro).
3. Interiores reformáveis para outras áreas (cafeteria primeiro) — `interiorSvg` em art.js e `interior: true` + etapas em `AREAS` (world.js).
4. História: completar o capítulo 3 (farol, Aurora) e cenas para mercado, pousada, parque, salão e casas; desfechos de romance (Sol/Rafael têm `romance: true`).
5. Eventos sazonais e de decoração com conteúdo próprio (hoje o festival só troca nome/ícone).
6. Modo offline (service worker) e empacotamento Android/Windows (Capacitor / Tauri).
7. Balanceamento com jogadores reais (`src/data/config.js`).

## 6. Pipeline de arte em imagem

**Recorte automático:** as imagens da IA vão para `assets/originais/` (folhas `<id>-expressoes.png` em grade 3×2, ou um arquivo por imagem). `npm run recortar` → http://localhost:8090/tools/recortar.html recorta, remove o fundo liso (inclusive o xadrez falso), enquadra (retrato 512, item 512, área 1024, `dakota-menu` 1024×1536), salva e roda o manifesto. Os PNG têm fundo transparente; os retratos em imagem ganham o degradê do personagem (`BG` em portraits.js). Primeiros retratos reais: Evie (6 expressões).

**Kit para a IA de imagens: `assets/KIT-PROMPTS.md`** (prompt mestre + pacotes em ordem de prioridade, com o mockup anexado como referência). A lista completa continua em `assets/LISTA.md`.

```bash
npm run assets:lista   # gera assets/LISTA.md: nome de arquivo + prompt de estilo 3D para cada imagem
# salvar PNGs em assets/characters/, assets/areas/, assets/items/
npm run assets         # gera assets/manifest.json a partir dos arquivos encontrados
```

Nomes: `characters/dakota.png` (ou `dakota-rindo.png` por expressão), `areas/restaurante-decorado.png` (estados: abandonado, limpo, reformado, decorado), `items/cafe-3.png`, `items/gen-cafe.png`.
O que não tiver imagem continua com a arte gerada. Se a protagonista for personalizada (cabelo/pele diferente do padrão, `player.custom`), o retrato SVG é usado.
Tamanhos sugeridos: retratos 512×512, itens 512×512 fundo transparente, áreas 1024×1024 fundo transparente com a base no rodapé. Áreas são desenhadas por `drawArea` em art.js (`<image>` com largura `230 * a.size`) — ajuste ali se o enquadramento ficar errado.
Na sessão em nuvem não havia gerador de imagens disponível (conector recusado pelo proxy). Num PC, a autora pode gerar as imagens em qualquer ferramenta, ou a sessão pode usar uma API/ferramenta de imagens que estiver disponível lá.

## 7. Cuidados

- Emojis dos itens dependem da fonte de emoji do sistema (Windows/Android/iOS mostram desenhos diferentes) — mais um motivo para os PNGs.
- `window.__dakota` expõe o estado de propósito (usado pelo teste de interface); manter.
- O laço de 1 s redesenha a tela; `renderModal` preserva o que está sendo digitado em `<input>`/`<textarea>` com `id`. Campos novos precisam de `id`.
- Nunca usar o nome de jogos comerciais ou copiar arte deles nos assets; personagens e nomes são originais.
- Commits na branch `ccr-72d8610c-1aw24w`; o PR #1 é rascunho e não deve ser mesclado sem pedido explícito da autora.

## 8. Prompt para colar na nova sessão

> Estou continuando o jogo Dakota Vila. Faça `git checkout ccr-72d8610c-1aw24w && git pull` no repositório dakelara-site, leia `dakota-vila/HANDOFF.md` e `dakota-vila/README.md` e veja a referência visual em `dakota-vila/docs/mockup.png`. Rode `npm start` e `npm test` em `dakota-vila/` para confirmar que está tudo funcionando. Depois siga a seção 5 do HANDOFF, começando pela arte 3D (item 1) e pelos ajustes de fidelidade ao mockup (item 2). Teste cada etapa antes de dizer que está pronta e faça commit na mesma branch.
