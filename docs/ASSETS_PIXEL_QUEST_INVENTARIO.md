## ESTADO VIGENTE — quatro WebP aprovados (21/11/2026)

- Aprovação posterior do proprietário na conversa de criação de imagens: **capa, Como Jogar, Checkpoint e Exploração e Progressão**. Este aceite mais recente prevalece sobre os estados históricos de aprovação parcial abaixo, que permanecem preservados para rastreabilidade.
- Arquivos presentes na branch `feat/layout-unificado-snake-quest`: `public/images/games/pixel-quest.webp`, `public/images/editorial/pixel-quest/how-to-play.webp`, `checkpoint.webp` e `progression.webp`.
- Integração: home usa a capa WebP; guia do Pixel Quest exibe as três artes por componente editorial reutilizável, com textos alternativos e legendas. Artes AVIF da linha do tempo permanecem intactas.
- Teste Playwright adicionado para presença e carregamento das quatro imagens em desktop (1280px) e celular (320px), com verificação de overflow; execução depende do CI. Sem merge ou deploy.

## FECHAMENTO DE ESCOPO VISUAL — 21/11/2026
- **Não gerar novas ilustrações para completar volume.** Revisão de `src/components/PixelQuestGame.astro`, `PixelQuestHistory.astro`, `src/data/historicalTimeline.ts` e `src/pages/index.astro`: o guia já explica regras, controles, checkpoint e pontuação em texto; quatro marcos históricos já usam imagens AVIF; único uso novo obrigatório na home é a capa, que atualmente aponta para SVG legado.
- Pacote escolhido pelo proprietário contém exclusivamente `pixel-quest-cover.png` (capa definitiva) e `checkpoint-enemies.png` (editorial selecionada). `how-to-play.png` e outras cenas redundantes ficam descartadas.
- Para finalizar: upload manual do ZIP descompactado no GitHub, respeitando caminhos internos; conferir hashes, integrar capa no card da home e imagem editorial no guia; rodar checks/CI, apresentar preview para validação. **Sem merge ou deploy pela assistência.**
- O conteúdo histórico anterior do inventário permanece como registro cronológico, mas seus estados preliminares de proposta/pendência foram superados por esta decisão.

## CORREÇÃO FINAL DO PACOTE PIXEL QUEST — somente imagens aceitas (20/11/2026)
- O proprietário rejeitou a inclusão de imagens repetitivas/pendentes. O ZIP anterior com `PENDENTE_DE_APROVACAO/how-to-play.png` **não deve ser usado**.
- **Pacote limpo:** `oldarcade-pixel-quest-somente-aprovadas.zip`; SHA-256 `31f0ba278f4e484bf03daf20da99dee33d18ac470a382053fd96bbbec594aab1`. Dois PNGs originais não modificados, mais `MANIFESTO.json`.
- **Capa definitiva aprovada:** `public/images/games/pixel-quest-cover.png`, SHA-256 `4f69be97eae06b40247b48645e87fa728e780e26928d18282b4c3c1cdd49c5ff`.
- **Imagem destinada pelo proprietário a checkpoint/inimigos/pontuação:** `public/images/editorial/pixel-quest/checkpoint-enemies.png`, SHA-256 `08d81756c6a7531bd1efd44e9e9ca8ea4463a0d0ca76a7b8127788af206c3abb`. Registrar como **selecionada para esse uso**, sem afirmar que todo o conjunto editorial foi homologado.
- **Descartada:** `how-to-play.png` e variações visuais quase idênticas à capa. Não colocar no ZIP aprovado, não subir nem aplicar.
- As 4 artes históricas já estão no repositório e não precisam de download/reenviar. Nenhum merge/deploy.

## DECISÃO DEFINITIVA MAIS RECENTE — capa Pixel Quest (20/11/2026)
- **Capa aprovada DEFINITIVAMENTE pelo proprietário:** a imagem mais recente, `pixel_quest_moonlit_crystal_valley.png`, **substitui a capa anteriormente escolhida**. A aprovação provisória registrada abaixo é histórica e foi explicitamente superada pela frase: "pode substituir a anterior, essa eh a aprovada".
- PNG original preservado sem edição: **1672 × 941**, SHA-256 `4f69be97eae06b40247b48645e87fa728e780e26928d18282b4c3c1cdd49c5ff`. Destino final: `public/images/games/pixel-quest-cover.png`. ZIP de transferência: `oldarcade-pixel-quest-capa-aprovada.zip`, SHA-256 `56c980f0d5085a1fb1473557175dd88c43fe3351fb5cc7c9fb89a4083f4ded3e`.
- **Conferência GitHub:** o destino ainda não existe na branch `feat/layout-unificado-snake-quest`, portanto é necessário upload do PNG original antes de integrá-lo à home. Não afirmar arquivo enviado ou site alterado.
- A versão de capa anterior fica **substituída como escolha**, preservada apenas como histórico, sem validade para publicação.
- Os demais editoriais de Pixel Quest **não estão aprovados**. Não gerar novas imagens, não fazer merge nem deploy sem solicitação.

## DECISÃO MAIS RECENTE — capa Pixel Quest aprovada provisoriamente (20/11/2026)
- O proprietário declarou **"aprovada por hora"** sobre a última imagem apresentada, de paisagem mais ampla com personagem amarelo em primeiro plano, cristais, ponte e portal roxo, arquivo de conversa `pixel_quest_moonlit_crystal_valley.png`.
- **Status: aprovação visual PROVISÓRIA**, não homologação definitiva nem autorização para substituição automática ou deploy. A capa anteriormente aprovada deve permanecer preservada como versão anterior; não apagar nem afirmar revogação.
- **Como jogar:** não aprovada. **Checkpoint, inimigos e pontuação:** a última arte foi destinada pelo proprietário a esse tema; não houve nova confirmação de aprovação individual. Ambas permanecem pendentes de homologação.
- **Nenhuma imagem nova aplicada ao código do site** por este registro. Não fazer merge nem deploy.

## CORREÇÃO DE HOMOLOGAÇÃO — Pixel Quest (20/11/2026)
- **SOMENTE a capa do Pixel Quest foi aprovada expressamente pelo proprietário.** A arte do guia `how-to-play` foi apenas apresentada e **NÃO foi aprovada**. A arte de checkpoint/inimigos/pontuação não foi concluída como arquivo individual; os painéis compostos gerados são **rejeitados como arte final e NÃO aprovados**.
- As quatro imagens históricas AVIF são legado já existente, **sem nova homologação** neste lote.
- Não enviar, aplicar ou substituir imagens editoriais não aprovadas; nenhuma imagem do Pixel Quest foi integrada nesta etapa. Manter Snake e Tetris homologados.

## Registro histórico da proposta de capa (antes da homologação)
- Ilustração individual premium do Pixel Quest gerada e apresentada nesta conversa, representando personagem amarelo, cristais ciano, inimigos rosa, plataformas com grama, checkpoint e portal bloqueado.
- **Estado atualizado pela correção prioritária acima: capa homologada pelo proprietário, mas não enviada ao GitHub.** Conservar a arte gerada sem aplicar, recortar ou substituir antes do aceite.
- O novo fundo de floresta é interpretação artística editorial, não screenshot nem novo cenário implementado.
- Correções de testes após CI Tetris falho estão na mesma branch, aguardando nova confirmação.

# Pixel Quest — inventário de imagens e aprovação

## Estado vigente (20/11/2026)
- Snake (15 imagens) e Tetris (13 imagens) homologados visualmente pelo proprietário. **Não reabrir homologações**.
- Pixel Quest é o terceiro e último título da sequência de artes premium aprovada.
- Quatro imagens AVIF já estão referenciadas nos marcos históricos de `src/data/historicalTimeline.ts` (Space Panic 1980, Donkey Kong 1981, Super Mario Bros. 1985, Pixel Quest iniciado em 2026). **Esses arquivos são legado visual existente; nenhuma aprovação nova ou substituição é presumida.**
- Base factual de Pixel Quest: tabuleiro horizontal 640 × 360; fase 1-1 da Floresta/Trilha Esmeralda; seis cristais para liberar o portal, três patrulheiros, checkpoint, plataformas, vidas e salto variável. História do gênero referenciada separadamente. Atualização de jogo NÃO autorizada neste lote.
- Direção aprovada: pixel art premium, imagens individuais sem texto; artes históricas como interpretações originais, não screenshots de títulos comerciais.
- Não adicionar imagens em HUD, ranking, botões ou formulários.

## Inventário de ilustrações a avaliar
| Grupo | Tema | Caminho planejado | Estado |
|---|---|---|---|
| Capa | Fase 1-1 real, personagem do projeto, cristais, plataformas e portal | `public/images/games/pixel-quest-cover.png` | **Aprovada pelo proprietário; upload pendente** |
| Editorial | Como jogar: avançar, saltar e coletar seis cristais | `public/images/editorial/pixel-quest/how-to-play.png` | Pendente |
| Editorial | Checkpoint, inimigos patrulheiros, corações e pontuação | `public/images/editorial/pixel-quest/checkpoint-enemies.png` | Pendente |
| Histórico | Space Panic (1980) | `public/images/history/space-panic-1980.avif` | Arte existente, conferir necessidade de nova aprovação antes de substituição |
| Histórico | Donkey Kong (1981) | `public/images/history/donkey-kong-1981.avif` | Arte existente, preservar |
| Histórico | Super Mario Bros. (1985) | `public/images/history/super-mario-bros-1985.avif` | Arte existente, preservar |
| Histórico | Pixel Quest (nov. 2026) | `public/images/history/pixel-quest-2026.avif` | Arte existente, preservar |
| Cinema | Referências a filmes de Mario e Sonic, sem sugerir adaptação de Pixel Quest | A avaliar, evitar pôsteres e redundância | Não aprovado |

## Procedimento
1. Avaliar imagens novas individualmente na conversa, preservar bytes originais e hashes quando aprovadas.
2. Salvar na branch `feat/layout-unificado-snake-quest` do PR #4 somente após aprovação; se upload binário exigir intervenção, entregar ZIP com estrutura exata.
3. Conferir arquivos e hashes no GitHub, integrar apenas as imagens aprovadas, executar testes.
4. Homologação visual pelo proprietário no ambiente de teste Cloudflare Pages. **Sem merge/deploy pela assistência.**

## Bloqueio CI anterior
O CI do commit `d7413919b7` falhou no Playwright, e os testes foram ajustados na branch. Não declarar sucesso sem conferir o novo HEAD.
