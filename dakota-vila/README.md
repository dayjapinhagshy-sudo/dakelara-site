# Dakota Vila

Jogo Merge-2 com vila isométrica, reformas e história episódica. Universo, personagens, textos e arte são originais.
Feito em JavaScript puro (ES modules), sem etapa de build e sem dependências — roda em qualquer navegador moderno, no celular ou no computador.

## Como jogar

```bash
cd dakota-vila
npm start          # abre em http://localhost:8080
```

Também funciona em qualquer hospedagem estática (por exemplo GitHub Pages: `…/dakota-vila/`).
Precisa de Node 18+ apenas para o servidor local e para os testes.

## Testes

```bash
npm test                      # 37 testes do motor (node:test, sem dependências)
node tests/ui-smoke.mjs       # fluxo completo em Chromium (requer Playwright e `npm start` rodando)
```

## Arquitetura

```
src/data/     conteúdo e balanceamento (sem lógica)
  items.js      cadeias de itens, geradores, saque dos baús
  config.js     economia, tabuleiro inicial, loja, conquistas, missões, festival, caça ao tesouro
  world.js      personagens, pedidos, áreas da vila, estilos, álbum, cenas da história
src/engine/   regras puras, testáveis em Node (não tocam no DOM)
  core.js       estado, RNG injetável, barramento de eventos, energia, recompensas, níveis
  board.js      motor Merge-2 reutilizável (qualquer tabuleiro em state.boards)
  orders.js     pedidos — máquina de estados aguardando ⇄ pronto → entregue | expirado
  meta.js       vila/reformas, história, oficina, loja, login, missões, festival, tesouro, álbum
  save.js       salvar/carregar com cópia de segurança, migração e recuperação de corrupção
src/ui/       apresentação
  app.js        cenas (menu, tabuleiro, vila), HUD, diálogos, arrastar-e-soltar, salvamento automático
  panels.js     folhas modais (vila, oficina, loja, coleções, eventos, personagens…)
  art.js        arte em SVG gerada por código (retratos com expressões, vila, interior)
  audio.js      efeitos e música sintetizados com WebAudio
```

Para ajustar o jogo, edite só `src/data/`: novos itens, geradores, pedidos, áreas, cenas e valores de economia
não exigem mudanças na lógica. Os testes de integridade (`dados: …`) acusam referências quebradas.

## O que está funcional

- **Merge-2**: grade 7×9 configurável; arrastar, mover, trocar e combinar; 25 cadeias com 146 itens em 4 raridades;
  caixotes cobertos e itens presos; bolhas temporárias; tesoura, coringa e acelerador; baús de 4 raridades;
  moedas/energia/gemas/XP/peças coletáveis e combináveis; vender, descartar e desfazer; inventário expansível;
  caixa de entrada para recompensas; painel de informações com a cadeia de cada item.
- **14 geradores** (11 manuais, 3 automáticos) com 5 níveis cada, cargas, recarga e probabilidades; **Oficina Dakota** para evoluí-los com peças.
- **Pedidos**: 24 escritos à mão + geração contínua; normais, VIP, com prazo, do dia e da semana; bônus de sequência; afinidade com clientes.
- **Vila isométrica** com 10 áreas (restaurante, cafeteria, praça, casas, praia, píer, mercado, pousada, parque, salão) em 4 estados
  (abandonado → limpo → reformado → decorado), 3 estilos por etapa, visão ampliada, troca de estilo salva. O restaurante tem interior com 6 etapas.
- **História**: 9 personagens, 14 cenas em 3 capítulos, expressões, escolhas que afetam afinidade, histórico para rever; protagonista personalizável.
- **Eventos**: login de 7 dias, missões diárias e semanais, festival semanal rotativo com passe gratuito e tabuleiro próprio (fichas em vez de energia),
  caça ao tesouro (pás), Álbum da Vila, calendário.
- **Economia**: energia com regeneração (inclusive offline), moedas, gemas, estrelas, XP/níveis, loja, 14 conquistas. Gratuito, sem anúncios nem compras.
- **Salvamento automático** local, exportar/importar save. Interface em português, vertical, de 320 px até desktop. Manifesto PWA.

## Limitações conhecidas (ainda não implementado)

- **Arte dos itens**: os ícones dos itens usam os emojis coloridos do sistema dentro de molduras próprias — são um substituto provisório,
  não a arte 3D cartoon final. Retratos, vila e interiores são SVG original gerado por código, em estilo flat (não 3D).
- **Reformas com interior** só no restaurante; as outras 9 áreas têm exterior com 3 etapas.
- **História** vai até o início do capítulo 3; mercado, pousada, parque, salão e casas ainda não têm cenas próprias. Romance existe só como afinidade e escolhas de diálogo.
- **Placar do festival** é simulado no aparelho (não há servidor nem ranking on-line).
- **Eventos de decoração** e eventos sazonais com conteúdo próprio não existem; o festival troca apenas nome e ícone a cada semana.
- **Android/Windows**: o jogo é uma página web instalável (PWA); empacotar com Capacitor/Tauri ainda não foi feito. Não há service worker (sem modo offline instalado).
- Balanceamento é uma primeira passada, não testada com jogadores.
