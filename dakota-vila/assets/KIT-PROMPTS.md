# Kit de arte do Dakota Vila: prompts para a IA de imagens

Use este arquivo para pedir as imagens a qualquer IA de imagens (ChatGPT, Gemini, Midjourney, Leonardo, Canva, Firefly…).
A lista completa com todos os 160+ arquivos está em `LISTA.md`. Este kit traz só o primeiro pacote, o que mais muda a cara do jogo.

## Como usar

1. **Anexe `docs/mockup.png`** na conversa com a IA. É a referência de estilo e de rosto dos personagens.
2. Cole o **PROMPT MESTRE** abaixo uma vez, no começo da conversa.
3. Depois peça **uma imagem por vez**, colando o prompt de cada arquivo. Ficar na mesma conversa ajuda a manter os rostos iguais.
4. Salve tudo em **`assets/originais/`** com o nome do arquivo indicado (ex.: `evie-expressoes.png`, `gen-cafe.png`). **Não precisa recortar nem tirar o fundo**: fundo branco liso serve.
5. Rode `npm run recortar`, abra http://localhost:8090/tools/recortar.html e toque em **Processar** e depois em **Salvar no jogo**. A ferramenta recorta as folhas, remove o fundo, enquadra no tamanho certo, salva em `assets/characters|items|areas/` e atualiza o `manifest.json`. (Ou só me avise que eu faço.)

### Folha de expressões (o jeito mais rápido para personagens)

Peça as 6 expressões numa imagem só, numa grade de 3 colunas × 2 linhas, **nesta ordem**:

```
Arquivo <id>-expressoes.png: folha com 6 retratos de <personagem>, mesma roupa e enquadramento do peito para cima,
grade de 3 colunas e 2 linhas, fundo branco liso, sem texto. Linha de cima: feliz sorrindo, rindo com os olhos fechados, calma.
Linha de baixo: triste, surpresa com a boca em O, brava com as sobrancelhas franzidas.
```

Nomes: `dakota-expressoes.png`, `matilde-expressoes.png`, `juninho-expressoes.png`, `sol-expressoes.png`, `luna-expressoes.png`, `evie-expressoes.png`, `rafael-expressoes.png`, `vera-expressoes.png`, `teco-expressoes.png`, `visitante-expressoes.png`.
Se a grade sair diferente (ex.: 2 colunas × 3 linhas), salve como `<id>-expressoes-2x3.png`.

---

## PROMPT MESTRE (cole primeiro)

```
Você vai criar o kit de arte do meu jogo mobile "Dakota Vila", um jogo de combinar itens (merge) numa vila litorânea brasileira.
A imagem anexada é o MOCKUP oficial: siga exatamente esse estilo visual e a aparência dos personagens dele.

Estilo obrigatório em TODAS as imagens:
- render 3D cartoon estilizado de jogo mobile casual premium, cores vibrantes e acolhedoras
- iluminação suave de estúdio, volumes arredondados, sombras macias e brilhos, materiais com aspecto de massinha/vinil
- paleta do mockup: rosa, lilás, dourado, turquesa do mar, telhados vermelhos, árvores de flor rosa
- personagens com olhos grandes e expressivos, proporções fofas mas não infantis (exceto o Juninho, que é criança)
- nada de texto, letras, logotipos ou marca d'água dentro das imagens
- personagens, nomes e cenário 100% originais: não imite personagens nem arte de jogos existentes

Formato:
- personagens: retrato do peito para cima, centralizado, quadrado 1024x1024, fundo transparente (ou degradê rosa bem suave)
- itens e geradores: um objeto só, centralizado, vista 3/4 levemente de cima, quadrado 1024x1024, fundo transparente
- construções da vila: vista isométrica de cima, construção isolada com a base no rodapé da imagem, quadrado 1024x1024, fundo transparente

Vou pedir uma imagem por vez, dizendo o nome do arquivo. Mantenha o mesmo rosto, cabelo e roupa de cada personagem em todas as imagens dele.
Responda só "Pronto" e espere o primeiro pedido.
```

> **Atenção:** depois do "Pronto", a IA fica esperando. Mande logo em seguida o primeiro pedido, começando com **"Arquivo dakota.png: …"** (prompt na tabela abaixo), e depois um pedido por mensagem.

---

## Pacote 1: personagens (`assets/characters/`)

Cole: **"Arquivo `<nome>`: <prompt>"**. Primeiro faça o retrato principal de cada um. As expressões (`-rindo`, `-triste`…) são opcionais e estão em `LISTA.md`.

| Arquivo | Prompt |
|---|---|
| `dakota.png` | Dakota, a protagonista, igual ao mockup: jovem mulher de 24 anos, cabelo longo ondulado e volumoso cor-de-rosa com coque alto, óculos de sol sobre a cabeça, flor amarela (plumeria) no cabelo, brincos de argola dourados, pinta perto da boca, olhos castanhos grandes, blusa de tricô branca ombro a ombro e jardineira rosa, colar com pingente de coração, sorriso aberto e acolhedor |
| `dakota-menu.png` | Dakota para a tela inicial, igual ao mockup: mesma personagem, meio corpo, apoiada com o queixo na mão e o cotovelo numa mesa, sorriso sonhador, olhando para a frente; xícara de cappuccino com desenho de coração na espuma em primeiro plano; flores rosa; **retrato vertical 1024x1536**, fundo transparente |
| `matilde.png` | Dona Matilde, avó da Dakota, 89 anos: cabelo branco cacheado em coque com flores cor-de-rosa, óculos redondos dourados, vestido roxo escuro florido, colar de pérolas, rosto gentil e sorridente |
| `juninho.png` | Juninho, primo de 12 anos: cabelo castanho bem cacheado, sardas, fones de ouvido grandes laranja, moletom verde com cordões, sorriso travesso |
| `sol.png` | Sol, amigo de infância, 26 anos, músico e barista: cabelo preto curto e ondulado, barba por fazer, camisa branca aberta no colarinho, fones de ouvido pretos no pescoço, sorriso tranquilo |
| `luna.png` | Luna, melhor amiga, 24 anos, florista: cabelo preto longo e liso repartido ao meio, blusa rosa, pequenos brincos de argola, olhar simpático |
| `evie.png` | Evie, amiga da Dakota, 24 anos, fotógrafa e surfista: cabelo ruivo acobreado longo e ondulado, sardas no nariz e bochechas, olhos verdes, regata amarela com camisa xadrez amarrada na cintura, câmera fotográfica pendurada no pescoço, pequena flor branca no cabelo, sorriso aventureiro |
| `rafael.png` | Rafael, chef, 30 anos: cabelo castanho com topete, barba cheia bem aparada, dólmã branca de chef com lenço vermelho no pescoço, sorriso confiante |
| `vera.png` | Vera, a rival, 30 anos, empresária elegante: cabelo loiro ondulado volumoso, óculos de sol sobre a cabeça, blusa vermelha, batom vermelho, brincos dourados, expressão confiante e um pouco convencida |
| `teco.png` | Teco, o mascote: cachorro vira-lata caramelo com manchas brancas no focinho e no peito, orelhas caídas, coleira vermelha com medalha dourada, língua de fora, muito feliz |
| `visitante.png` | Visitante misterioso: figura encapuzada com capa roxo-escura, rosto na sombra, só os olhos brilhando em amarelo, clima de mistério fofo |

## Pacote 2: geradores (`assets/items/`)

Os geradores são os objetos que criam itens no tabuleiro. Prompt: **"Arquivo `<nome>`: ícone de gerador do jogo, <descrição>, objeto especial e caprichado com detalhes dourados"**.

| Arquivo | Descrição |
|---|---|
| `gen-cafe.png` | cafeteira expresso retrô rosa e dourada soltando vapor |
| `gen-forno.png` | forno a lenha de tijolinhos com pão saindo |
| `gen-mercado.png` | sacola de feira de palha cheia de compras |
| `gen-doces.png` | batedeira de bolo rosa com tigela de massa |
| `gen-pomar.png` | arvorezinha frutífera num vaso com laranjas |
| `gen-canteiro.png` | canteiro de madeira com mudinhas e flores |
| `gen-pesca.png` | vara de pesca com molinete e baldinho |
| `gen-armario.png` | armário de cozinha de madeira pintado de turquesa, portas entreabertas |
| `gen-baldinho.png` | baldinho de praia com pazinha e conchas |
| `gen-mochila.png` | mochila de praia colorida com toalha enrolada |
| `gen-cantinho.png` | caminha de cachorro com ossinho e bolinha |
| `gen-torno.png` | torno de cerâmica com vaso de barro sendo moldado |
| `gen-portajoias.png` | porta-joias aberto com colares e brilhos |
| `gen-bancada.png` | bancada de ferramentas com engrenagens e chave inglesa |
| `gen-festa.png` | caixa de presente de festa com laço e confetes |

## Pacote 3: primeiros itens (`assets/items/`)

Prompt: **"Arquivo `<nome>`: ícone de item do jogo, <nome do item>"**. Em cada cadeia, quanto maior o número, mais rico e brilhante o item deve parecer.

- **Café:** `cafe-1.png` grãos de café · `cafe-2.png` cafezinho · `cafe-3.png` pingado · `cafe-4.png` café gelado · `cafe-5.png` licor de café · `cafe-6.png` affogato · `cafe-7.png` café colonial · `cafe-8.png` troféu de café campeão da vila
- **Pães:** `pao-1.png` ramo de trigo · `pao-2.png` baguete · `pao-3.png` pão de forma · `pao-4.png` croissant · `pao-5.png` pastel · `pao-6.png` sanduíche · `pao-7.png` hambúrguer · `pao-8.png` pizza da casa
- **Ingredientes:** `ingred-1.png` saleiro · `ingred-2.png` ovos · `ingred-3.png` manteiga · `ingred-4.png` queijo · `ingred-5.png` azeitonas · `ingred-6.png` molho da casa · `ingred-7.png` arroz soltinho · `ingred-8.png` macarronada
- **Doces:** `doce-1.png` bala · `doce-2.png` biscoito · `doce-3.png` rosquinha · `doce-4.png` cupcake · `doce-5.png` pudim · `doce-6.png` fatia de bolo · `doce-7.png` torta · `doce-8.png` bolo de festa de vários andares

## Pacote 4: vila (`assets/areas/`)

Prompt: **"Arquivo `<nome>`: construção da vila em vista isométrica, <descrição>"**. Os quatro estados de cada lugar devem ser **a mesma construção, do mesmo ângulo**, mudando só o estado. É isso que aparece no "Antes e Depois" da reforma.

| Arquivo | Descrição |
|---|---|
| `restaurante-abandonado.png` | Restaurante Maré Mansa, casarão de praia de dois andares, abandonado: janelas fechadas com tábuas, telhado quebrado, mato crescendo |
| `restaurante-limpo.png` | o mesmo restaurante limpo e consertado, paredes creme, telhado de telha vermelha, ainda simples |
| `restaurante-reformado.png` | o mesmo restaurante reformado, cores alegres, venezianas, floreiras nas janelas |
| `restaurante-decorado.png` | o mesmo restaurante totalmente decorado: toldo listrado, mesas com guarda-sol, varal de luzes, plantas e flores |
| `cafeteria-abandonado.png` | Cafeteria & Confeitaria, sobradinho de esquina, abandonada: tábuas nas janelas, telhado quebrado, mato |
| `cafeteria-limpo.png` | a mesma cafeteria limpa e consertada, paredes creme, telhado vermelho |
| `cafeteria-reformado.png` | a mesma cafeteria reformada, fachada rosa, venezianas, floreiras |
| `cafeteria-decorado.png` | a mesma cafeteria decorada: toldo listrado rosa e branco, mesinhas na calçada, xícara gigante na placa, flores |

As outras oito áreas (praça, casas, praia, píer, mercado, pousada, parque, salão) seguem o mesmo padrão e estão em `LISTA.md`.
