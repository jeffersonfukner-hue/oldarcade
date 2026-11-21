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
| Capa | Fase 1-1 real, personagem do projeto, cristais, plataformas e portal | `public/images/games/pixel-quest-cover.png` | Pendente de aprovação individual |
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
