# HANDOFF — Dakota Vila

Documento para continuar o desenvolvimento em outra sessão ou em outra conta do Claude.
Leia inteiro antes de mexer no código. **Atualizado em 13/11/2026 (noite).**

## 0. Resumo rápido

- O jogo funciona por completo e **toda a arte já é 3D**: 10 personagens × 6 expressões, 161 itens e geradores, 10 áreas da vila nos 4 estados, interior do restaurante, Dakota da tela inicial.
- A tela está fiel ao mockup: menu, barra lateral do tabuleiro, Antes/Depois na reforma, cartões de eventos.
- Tudo está no GitHub, na branch `ccr-72d8610c-1aw24w` (PR #1, rascunho). **Último commit: `fc83531`**. 38 testes passando.
- **Próximo passo sugerido:** interior da cafeteria (seção 5, item 1).

## 1. Onde está o código

- Repositório: `dayjapinhagshy-sudo/dakelara-site` (GitHub)
- Branch de trabalho: **`ccr-72d8610c-1aw24w`**: todo o jogo está aqui
- PR em rascunho: **#1** → `main` (sem conflitos; o repositório não tem CI). **Não mesclar sem pedido explícito da autora.**
- Pasta do jogo: `dakota-vila/`. O resto do repositório (`index.html`, `estilo.css`, `privacidade.html`) é o site da Dakelara: **não alterar**.
- No PC da autora: `D:\DAKELARA VILA DAKOTA\dakelara-site` (clone já feito). As imagens que ela gera ficam em `D:\DAKELARA VILA DAKOTA\dakota vila png` e às vezes soltas em `D:\DAKELARA VILA DAKOTA`.

```bash
git clone https://github.com/dayjapinhagshy-sudo/dakelara-site.git   # se ainda não tiver
cd dakelara-site
git checkout ccr-72d8610c-1aw24w
git pull
cd dakota-vila
npm start          # jogo em http://localhost:8080  (Node 18+; sem npm install, não há dependências)
npm test           # 38 testes do motor (node:test)
npm run recortar   # ferramenta de recorte de arte em http://localhost:8090/tools/recortar.html
```

**Para a autora (sem terminal):** dois cliques em `dakota-vila/Iniciar Dakota Vila.bat` (há um atalho em `D:\DAKELARA VILA DAKOTA\Iniciar Dakota Vila.lnk`). Ele liga o jogo, abre no PC e mostra os endereços para o celular: Wi-Fi de casa (`http://<IP da rede>:8080`) e Tailscale (`http://100.x.x.x:8080`, funciona fora de casa com o Tailscale ligado no celular). O Firewall do Windows já permite o Node. Se o jogo já estiver ligado, só abre o navegador. O progresso do celular é separado do PC (salvo no navegador de cada aparelho).

Teste de interface (opcional, exige Playwright e o servidor rodando em outro terminal):
```bash
npm i -D playwright && npx playwright install chromium
node tests/ui-smoke.mjs [pasta-para-capturas]
```

## 2. O pedido original (resumo)

Jogo **Merge-2** chamado **Dakota Vila**, com a profundidade de sistemas de jogos do gênero (tabuleiro de combinar, pedidos, vila para reformar, história), mas com **universo, personagens, nomes e arte 100% originais**: nada copiado de jogos existentes.
Interface em **português brasileiro**, **vertical para celular**, gratuito, **sem anúncios nem compras obrigatórias**, salvamento local automático, preparado para Android/Windows no futuro.
Direção de arte: **3D cartoon estilizado**, colorido, acolhedor, aparência premium de jogo mobile.

**Referência visual: `docs/mockup.png`** (imagem da própria autora).

Regras que a autora definiu: inspecionar antes de criar; não substituir funcionalidade por botão decorativo; não declarar etapa pronta sem teste; não apagar trabalho sem autorização; registrar o que funciona, o que falta e bloqueios.

## 3. Arquitetura

JavaScript puro em ES modules, sem build, sem dependências. Motor separado da interface (o motor roda e é testado no Node, sem DOM).

```
src/data/      conteúdo e balanceamento (SEM lógica): editar aqui para conteúdo novo
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
  app.js         cenas (menu/board/village), HUD, barra lateral (sideRail), diálogos, arrastar-e-soltar, laço de 1 s, autosave; window.__dakota = estado
  panels.js      folhas modais (área com Antes/Depois, inventário, loja, oficina, coleções, eventos com cartões, personagens, história, perfil, config, nível, ajuda)
  portraits.js   retratos (imagem do manifesto sobre o degradê BG do personagem, ou SVG com 6 expressões); pose "queixo" do menu
  art.js         vila isométrica, visão ampliada, interior (imagem por etapa/estilo ou SVG), xícara e pose do menu, VDEFS
  assets.js      lê assets/manifest.json: itemArt, portraitArt, areaArt, interiorArt, menuArt
  audio.js       efeitos e música sintetizados com WebAudio
  util.js        helpers ($, esc, fmt, ico, itemFace, bar)
tools/
  recortar.mjs/.html/.js   ferramenta de recorte (seção 6)
  build-manifest.mjs       gera assets/manifest.json a partir de assets/characters|items|areas
  list-assets.mjs          gera assets/LISTA.md (lista completa de imagens aceitas)
tests/         engine.test.js (38 testes), ui-smoke.mjs (fluxo completo no Chromium)
```

Convenções:
- IDs de item: `cadeia:nível` (ex. `cafe:3`), geradores `gen:tipo` (ex. `gen:cafe`).
- Funções do motor retornam `{ ok: true, type, ... }` ou `{ ok: false, why }`; a interface traduz `why` em `FAIL` (app.js).
- Toda ação da interface passa por `commit(r)` (atualiza pedidos, redesenha, efeitos, `flow()` para cenas/avisos).
- Textos de interface e comentários em português. Sem dependências externas sem necessidade.
- O teste `dados: todas as referências são válidas` pega IDs quebrados e **ícones repetidos**: rode `npm test` após editar `src/data/`.
- Os arquivos do repositório têm fim de linha CRLF no Windows (git `autocrlf`). Ao editar por script, preserve CRLF.

## 4. O que está funcional (testado)

- Merge-2 completo: mover/trocar/combinar, caixotes e presos, bolhas, baús de 4 raridades, coletáveis, tesoura/coringa/acelerador, vender/descartar/desfazer, inventário expansível, caixa de entrada.
- 14 geradores (11 manuais, 3 automáticos), 5 níveis cada; Oficina para evoluir com peças.
- Pedidos: 24 escritos + gerados; normal/VIP/com prazo/do dia/da semana; sequência com bônus; afinidade por cliente. Quem já recebeu um pedido aparece como conhecido na galeria.
- Vila isométrica: 10 áreas em 4 estados, 3 estilos por etapa; restaurante com interior em 6 etapas.
- **Fiel ao mockup:** menu com a Dakota apoiada na mão + cappuccino; barra lateral no tabuleiro (mochila (aceita arrastar item), entrada, missões, próxima reforma, loja); reforma com **Antes → Depois** e "Escolha um estilo"; cartões ilustrados em Eventos (Festival com balão, Álbum com %, Oficina, Missões, Tesouro).
- **Arte 3D completa** (WebP transparente): retratos 512 px, itens 256 px, áreas 768 px, interior 768×512, `dakota-menu` 1024×1536. Total ~10 MB.
- Personagens: Dakota (protagonista), Dona Matilde (avó da Dakota), **Juninho (filho da Dakota, como o filho da autora; a Matilde é a bisa dele)**, Sol, Luna (melhor amiga), **Evie (amiga, fotógrafa e surfista, ruiva; criada a pedido da autora)**, Rafael, Vera, Teco, visitante misterioso.
- História: 14 cenas em 3 capítulos, escolhas, histórico; protagonista personalizável (se personalizada, usa o retrato SVG).
- Eventos: login de 7 dias, missões, festival semanal com tabuleiro próprio, caça ao tesouro, Álbum, conquistas.
- Salvamento automático + exportar/importar save. Layout verificado em 320×568, 375×812 e 1280×800.

## 5. O que falta / próximos passos (em ordem sugerida)

1. ~~Interior da cafeteria~~ **feito em 13/11** (3 estilos em 3D). Próximo: interior de outras áreas. No código: `interior: true` + etapas de dentro (`piso`, `parede`, `moveis`, `decor`) em `AREAS` (world.js); `interiorKey`/`interiorSvg` em art.js já funcionam para qualquer área com imagens `areas/<id>-dentro-*.webp`. Hoje só o restaurante tem SVG de interior; para outra área sem imagem, criar um fallback. Pedidos para a IA no formato do restaurante (seção 6).
2. **História:** completar o capítulo 3 (farol, Aurora/"A.") e cenas para mercado, pousada, parque, salão e casas; **cenas com a Evie** (ela ainda não aparece em nenhuma cena); desfechos de romance (Sol/Rafael têm `romance: true`).
3. **Eventos** sazonais e de decoração com conteúdo próprio (hoje o festival só troca nome/ícone).
4. **Modo offline** (service worker) e empacotamento **Android/Windows** (Capacitor / Tauri).
5. Ícones da barra lateral e da barra inferior ainda são emojis: poderiam ganhar imagens 3D.
6. Balanceamento com jogadores reais (`src/data/config.js`).
7. Teste de interface (`tests/ui-smoke.mjs`) não foi rodado depois das mudanças de hoje (precisa baixar o Chromium do Playwright); os seletores já foram atualizados (`.rail [data-name="inventario"]`).

**Outra conversa em andamento:** a autora abriu uma sessão separada para levar a ferramenta de recorte para o outro app dela, o "Dakelara PS". Não faz parte deste repositório.

## 6. Pipeline de arte em imagem

**Como a autora trabalha:** ela usa a IA de imagens "GPT Image 2.6 Flare". Essa IA entende melhor **pedidos simples, em linguagem do dia a dia**, com até 6 imagens por pedido (o `assets/KIT-PROMPTS.md` formal demais não funcionou bem). Exemplo de pedido que funcionou:

> Agora a mesma sala limpa, mesmo ângulo, 4 imagens numa grade 2x2 mostrando a reforma em estilo MODERNO, uma etapa somando com a outra: em cima à esquerda: só o piso novo… Sem texto, sem pessoas.

Ela salva as imagens com qualquer nome na pasta `D:\DAKELARA VILA DAKOTA\dakota vila png` (ou solta em `D:\DAKELARA VILA DAKOTA`) e avisa. O fluxo é:

1. Copiar as imagens novas para `dakota-vila/assets/originais/_entrada/NN.png` (numeração seguida; o próximo número é **85**) e anotar a origem em `assets/originais/_entrada-mapa.txt`.
2. Ver as imagens (o jeito mais rápido é uma folha de miniaturas no navegador) e identificar cada objeto.
3. Descrever cada folha em `assets/originais/_folhas.json`:
   - `{"modo": "grade", "cols": 3, "rows": 2, "nomes": [...]}`: corta em grade (personagens 3×2, prédios 2×2). `"limpar": true` descarta lascas do vizinho.
   - `{"modo": "itens", "nomes": [...]}`: acha cada objeto pela transparência, em ordem de leitura (linhas de cima para baixo, esquerda para a direita). `"-"` pula um objeto.
4. `npm run recortar` → abrir http://localhost:8090/tools/recortar.html → **Processar** (confere as prévias) → **Salvar no jogo** (salva WebP e roda o manifesto).
5. Conferir no jogo e fazer commit.

**Nomes aceitos** (sem extensão): personagens `dakota`, `dakota-rindo` (`rindo|neutro|triste|surpreso|bravo`), `dakota-menu`; itens `cafe-3`, `gen-cafe`; áreas `restaurante-abandonado|limpo|reformado|decorado`; interiores `restaurante-dentro-0` (abandonado), `-dentro-1` (limpo), `-dentro-<piso|parede|moveis|decor>-<rustico|tropical|moderno>`; **paisagem da vila** `vila-fundo` (ilha inteira; tira o branco/xadrez em volta e encaixa em 1600×1000 sem cortar; substitui mar, grama, calçadas e barcos desenhados; as calçadas dela estão em `FUNDO_PATHS` em art.js e os prédios foram posicionados fora delas) e enfeites `enfeite-palmeira|arvore-rosa|arvore-verde|flores|poste|farol` (384 px, base no rodapé); **fundos de tela** verticais `fundo-menu`, `fundo-conversa`, `fundo-conversa-dentro`, `fundo-tabuleiro` (900×1600, a imagem inteira, sem tirar fundo) e `mesa-menu` (mesa na frente da Dakota da tela inicial; altura ajustável por `--mesa-top` no CSS). Lista completa: `assets/LISTA.md`.

**Importante:** `assets/originais/` **não vai para o git** (`.gitignore`; são ~90 MB). Numa conta/PC novo essa pasta não existe; só os WebP finais em `assets/characters|items|areas` estão no repositório. Para reprocessar algo, é preciso a imagem original da autora.

O que não tiver imagem continua com a arte gerada por código. Áreas na vila: `drawArea` em art.js (largura `150 * a.size * k`).

## 7. Cuidados

- A autora escreve em português, de forma informal, e não é programadora: responder em português simples, sem jargão.
- Antes de cada `git push`, perguntar. Ela costuma aprovar com "Sim, enviar".
- Este PC não tem identidade git configurada: os commits foram feitos com `git -c user.name="dakotaelara" -c user.email=<e-mail da conta>`, sem mudar a configuração.
- Apagar arquivos da autora só com pedido dela, e preferir a **Lixeira** (PowerShell `Microsoft.VisualBasic.FileIO.FileSystem.DeleteFile(..., 'SendToRecycleBin')`). Nunca apagar `mockeup.png`.
- `window.__dakota` expõe o estado de propósito (usado pelo teste de interface); manter.
- O laço de 1 s redesenha a tela; `renderModal` preserva o que está sendo digitado em `<input>`/`<textarea>` com `id`. Campos novos precisam de `id`.
- Nunca usar o nome de jogos comerciais ou copiar arte deles; personagens e nomes são originais.
- Commits na branch `ccr-72d8610c-1aw24w`; o PR #1 é rascunho e não deve ser mesclado sem pedido explícito da autora.

## 8. Prompt para colar na nova sessão

> Estou continuando o jogo Dakota Vila. No repositório dakelara-site (no meu PC: `D:\DAKELARA VILA DAKOTA\dakelara-site`; se não existir, clone `https://github.com/dayjapinhagshy-sudo/dakelara-site`), faça `git checkout ccr-72d8610c-1aw24w && git pull`, leia `dakota-vila/HANDOFF.md` inteiro e veja `dakota-vila/docs/mockup.png`. Rode `npm test` e `npm start` em `dakota-vila/` para confirmar que está tudo funcionando. Depois siga a seção 5 do HANDOFF. Fale comigo em português simples. Teste cada etapa antes de dizer que está pronta, faça commit na mesma branch e me pergunte antes de enviar para o GitHub.
