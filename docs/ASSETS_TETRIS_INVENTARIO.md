## ESTADO VIGENTE — 13 imagens Tetris integradas na branch (20/11/2026)

- **Transferência confirmada:** os quatro PNGs restantes (`tetris-cover.png`, `sprint.png`, `survival.png`, `tetris-film-history.png`) foram encontrados na branch do PR #4; os respectivos SHA-1 de blobs Git coincidem exatamente com os hashes calculados sobre os PNGs originais dentro do ZIP aprovado. Os 9 arquivos anteriores já estavam confirmados, totalizando 13/13.
- **Aplicação realizada exclusivamente no Tetris:** `src/pages/index.astro` passou a usar a capa do Tetris; seis marcos em `src/data/historicalTimeline.ts` referenciam ilustrações históricas; `src/components/TetrisGame.astro` integra imagens no guia Clássico, Sprint e Sobrevivência; `src/components/HistoricalScreenings.astro` exibe imagem original de contexto do filme (2023), não um pôster; `src/components/TetrisEditorialArt.astro` é o componente para imagens, alt e legendas. Nenhuma mecânica, ranking ou imagem Pixel Quest foi alterada nesta integração.
- **Testes:** regressão Playwright acrescentada/atualizada em `tests/editorial-history.spec.ts` para verificar carregamento real, alt, timeline e ausência de overflow em 1280px e 320px. **Execução de build e Playwright ainda não comprovada**: container sem resolução DNS de github.com; aguardar resultado do CI exatamente no HEAD desta branch. Não presumir sucesso.
- **Homologação visual:** pendente do proprietário via ambiente de teste Cloudflare Pages; nenhuma publicação realizada por esta assistência. Sem merge/deploy.
- **Próxima etapa:** verificar CI do HEAD, resolver eventuais falhas, então homologação visual das páginas Tetris; Pixel Quest só depois.

## ESTADO ATUAL — lote Tetris completo aprovado, conferência GitHub (20/11/2026)
- **13 imagens homologadas individualmente:** capa, nove imagens do primeiro lote, Sprint, Sobrevivência e contexto histórico do filme *Tetris* (2023). A última foi aprovada expressamente nesta conversa. Não alterar nem substituir arquivos sem novo aceite.
- **9 PNGs do primeiro lote já estão no repositório** na branch `feat/layout-unificado-snake-quest`. Verificou-se igualdade byte a byte indireta com ZIP local calculando Git blob SHA-1, exatamente igual ao GitHub para cada um dos 9.
- **4 PNGs ainda ausentes na branch:** `public/images/games/tetris-cover.png`, `public/images/editorial/tetris/sprint.png`, `public/images/editorial/tetris/survival.png`, `public/images/editorial/tetris/tetris-film-history.png`.
- **ZIP exclusivo de transferência manual** `oldarcade-tetris-4-imagens-restantes-aprovadas.zip`, SHA-256 `75eb17d7ddddac83e5a9948db96849f82b86e4da285bf461105e3b1a3edecb2c` (8.956.462 bytes). Inclui 4 PNGs individuais com caminhos finais e `manifest.json` com SHA-256 e Git blob SHA-1 conferidos.
- **Futuro:** após upload, verificar quatro hashes Git; só então implementar integrações das 13 imagens no Tetris e testes de regressão; usuário homologa visualmente usando deploy controlado no Cloudflare Pages. Nenhuma alteração no Tetris foi feita nesta etapa. Sem merge/deploy.

## Atualização — ilustração Sobrevivência apresentada (20/11/2026)
- Arte individual de Sobrevivência gerada e apresentada para avaliação do proprietário. **Não homologada, nem enviada ao GitHub, nem aplicada ao site.**
- A criação da arte individual sobre o filme *Tetris* (2023) falhou na ferramenta de imagens. **Arquivo final não gerado.** Não substituir pela composição descartada.
- Sprint permanece aprovado, sem modificação de seus bytes. A versão original do lote 1 permanece aprovada.
- Próximo checkpoint depende da aprovação visual da arte Sobrevivência e de nova solicitação para geração do item sobre o filme.
- Sem merge ou deploy.

## Atualização — Sprint aprovado; Sobrevivência e cinema ainda pendentes (20/11/2026)
- Proprietário aprovou expressamente a **ilustração individual do Sprint** apresentada anteriormente. Manter esse arquivo original como aprovado, sem recriação, alteração ou recompressão.
- Lote 1: nove imagens históricas/editoriais aprovadas e organizadas em ZIP; ainda não há prova de upload binário ao GitHub.
- Uma tentativa de gerar Sobrevivência e referência ao filme Tetris (2023) produziu **imagem composta com texto e elementos de pôster**, incompatível com o contrato de ilustrações individuais sem texto. **Descartada como arte final, não aprovada e não aplicada.**
- Continuam pendentes duas artes individuais, isoladas e originais: `public/images/editorial/tetris/survival.png` e `public/images/editorial/tetris/tetris-film-history.png`. A arte cultural deve ser interpretação original e não pôster oficial.
- Sem merge, deploy ou alteração no site.

## Atualização — primeiro lote de 9 imagens APROVADO
- Aprovação expressa do proprietário nesta conversa: "aprovado primeiro lote".
- Os 9 PNGs originais de 1672×941 foram copiados byte a byte para a árvore prevista; manifesto e ZIP verificados por SHA-256, **sem upload ao GitHub e sem aplicação ao site**.
- ZIP local: `oldarcade-tetris-lote-1-aprovado.zip`, SHA-256 `040dbc10021effd918e178bf6710e64a1f9b94f34373b2fddd73681d6e93aa85`.
- Arquivos e hashes:
  - `public/images/history/tetris/electronika-1984.png`: `d25f5f72f357dfd7471adcbdfa1bd6c4d2d05033fe01f7be96ff2a80cb7c9e65`
  - `public/images/history/tetris/home-computers-1980s.png`: `af14de7b9e7d2d6379b49489440feed5c31e63980bc9f7b4d58ee525ef27ae4e`
  - `public/images/history/tetris/game-boy-1989.png`: `69515b620f575667cf91fe4c7494f459f0e344865425809a70faf3a4669c5a40`
  - `public/images/history/tetris/licensing-1996.png`: `ba9cd1aa502affb926937de80c8dae32222d47d7f9514c1928b15ea63503a568`
  - `public/images/history/tetris/moma-2012.png`: `5dd967036208bd96555462dafe3d7f3ffd1ee78181430999c5a4d67db7a6984d`
  - `public/images/history/tetris/browser-today.png`: `e9d8f13bfbc7efd56c00ed4cf60cb57368a7c95639253f397c0c48a6245f597c`
  - `public/images/editorial/tetris/how-to-play.png`: `81fed251a714f09fc961847a11c30bfb5c7fc733b8de09cf08f7e9d5ee03c108`
  - `public/images/editorial/tetris/controls.png`: `2df583957bc268ba1b0d9a82782461762ab195b86ae7d59d06b89e5f97c114f9`
  - `public/images/editorial/tetris/strategy.png`: `5c48610373d12c218e5b015f6c90e630de43f58ebfdd9c656a176e8e02d3525c`
- **Segundo lote pendente de apresentação e aprovação:** Sprint, Sobrevivência e filme Tetris (2023). Capa já aprovada separadamente.
- Preservar o histórico abaixo como inventário inicial; o estado "pendente" nas entradas 2–10 abaixo refere-se a momento anterior ao aceite.

---

# Tetris — inventário de artes premium (20/11/2026)

## Estado e limites
- Snake: 15 imagens integradas, homologação visual expressa pelo proprietário em 20/11/2026. Sem merge/deploy pela conexão GitHub.
- Tetris: fase de elaboração e apresentação INDIVIDUAL de imagens, **não aprovadas ainda**, não aplicadas ao site. Padrão global pixel art premium homologado.
- Base inspecionada: `src/components/TetrisGame.astro`, `src/components/TetrisHistory.astro`, `src/data/historicalTimeline.ts`, `src/data/historicalScreenings.ts`.
- O tabuleiro real tem 10 colunas × 20 linhas; modos Clássico (linhas/pontos), Sprint (40 linhas/menor tempo) e Sobrevivência (acelera a cada 30 segundos). HUD, rankings e controles não devem receber arte decorativa.

## Imagens individuais propostas, com destinos planejados
| # | Tema | Destino proposto | Estado |
|---|---|---|---|
| 1 | Capa representativa do jogo real | `public/images/games/tetris-cover.png` | Gerada para análise, NÃO aprovada nem enviada ao GitHub |
| 2 | 1984 — Electronika 60 (caracteres, sem falsa captura) | `public/images/history/tetris/electronika-1984.png` | Pendente |
| 3 | Anos 1980 — microcomputadores / IBM PC | `public/images/history/tetris/home-computers-1980s.png` | Pendente |
| 4 | 1989 — versão portátil / Game Boy | `public/images/history/tetris/game-boy-1989.png` | Pendente |
| 5 | 1996 — direitos e The Tetris Company | `public/images/history/tetris/licensing-1996.png` | Pendente |
| 6 | 2012 — Tetris e o MoMA | `public/images/history/tetris/moma-2012.png` | Pendente |
| 7 | Hoje — interpretações web do Tetris | `public/images/history/tetris/browser-today.png` | Pendente |
| 8 | Guia — como jogar e completar linhas | `public/images/editorial/tetris/how-to-play.png` | Pendente |
| 9 | Guia — controles, rotação, reserva | `public/images/editorial/tetris/controls.png` | Pendente |
| 10 | Guia — estratégia e quatro linhas | `public/images/editorial/tetris/strategy.png` | Pendente |
| 11 | Modo Sprint — objetivo 40 linhas | `public/images/editorial/tetris/sprint.png` | Pendente |
| 12 | Modo Sobrevivência — aceleração progressiva | `public/images/editorial/tetris/survival.png` | Pendente |
| 13 | Filme Tetris (2023), contexto histórico não pôster | `public/images/editorial/tetris/tetris-film-history.png` | Pendente |

## Primeira imagem gerada nesta sessão
- Capa em pixel art premium, 1672 × 941 px, PNG, 1.874.368 bytes.
- SHA-256 do arquivo local: `2eccebcdd53588e134dd8da5f8dc48e3b5bd6d0325b9bf8bf697ca187644806e`.
- A arte está no ambiente da conversa para revisão; **não no GitHub**. Qualquer aprovação deve vincular esse arquivo específico; não recortar/recomprimir sem autorização.
- As demais artes não foram geradas nem aprovadas nesta etapa.

## Checkpoint
Apresentar e homologar cada arquivo individual; manter a correspondência com textos/mecânicas reais; somente após autorização explícita subir PNGs e vinculá-los ao site. Nunca fazer merge/deploy automaticamente.
