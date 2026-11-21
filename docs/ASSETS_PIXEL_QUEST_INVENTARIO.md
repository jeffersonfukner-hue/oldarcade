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
