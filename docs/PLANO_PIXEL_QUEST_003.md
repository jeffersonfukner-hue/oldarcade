# OldArcade — Jogo #003: Pixel Quest (plano técnico)

**Situação:** planejamento, sem jogo implementado. **Nome provisório:** Pixel Quest; verificar disponibilidade do nome antes de publicação.  
**Base técnica:** branch `feat/tetris-jogo-002`, ainda não integrada à `main`.  
**Branch de planejamento:** `feat/pixel-quest-jogo-003`.  
**Meta:** terceiro e último título antes de preparar lançamento, SEO e avaliação Google Search Console/AdSense. **Desafio Diário permanece congelado.**

## 1. Escopo e identidade

Plataforma lateral 2D original, com corrida, saltos, plataformas, obstáculos e progressão por fases. Pode aproveitar convenções genéricas do gênero, **não** personagens, nomes, trilhas, sprites, fases ou arte de Mario/Nintendo. Personagem: explorador original (nome/visual a definir ao produzir arte). Direção de arte: pixel art 16-bit com floresta, cristais e máquinas; assets próprios ou licenciados e créditos verificáveis. Sem engine externa paga.

**Escopo de lançamento planejado:** 3 mundos × 2 fases (6 fases). **Primeira entrega jogável:** somente fase 1-1, para validar física antes de produzir as demais. Não expandir escopo para editor de mapas, multiplayer, modo diário, loja, monetização interna ou ferramentas complexas.

## 2. Arquitetura proposta

Astro estático + TypeScript + Canvas 2D; loop com `requestAnimationFrame` e **simulação de passo fixo 1/60 s**, acumulador com limite máximo para evitar salto da física após aba suspensa; interpolação apenas visual se necessária. Mundo e colisões em **pixels inteiros ou floating point estável**, câmera desacoplada do jogador. Assets pré-carregados; manter placeholder geométrico na primeira fase para não bloquear a física.

| Responsabilidade | Arquivo proposto | Contrato |
|---|---|---|
| Página, SEO e artigo original | `src/pages/jogos/pixel-quest.astro` | `GamePage.astro` + HTML semântico |
| Composição do jogo | `src/components/PixelQuestGame.astro` | `GameHud`, `GameRanking`, `GameShare`, `data-arcade-viewport` |
| Orquestração e estado | `src/scripts/pixelQuest/index.ts` | ready / countdown / playing / paused / won / lost |
| Física e colisões | `src/scripts/pixelQuest/physics.ts` | funções puras sem DOM, AABB/swept por eixo |
| Entrada | `src/scripts/pixelQuest/input.ts` | teclado e touch; liberar teclas ao perder foco |
| Câmera e desenho | `src/scripts/pixelQuest/render.ts` | Canvas 2D com escala pixel-perfect e câmera lateral |
| Carregamento e validação de fases | `src/scripts/pixelQuest/levels.ts` | mapa tipado e verificação de spawn, saída e limites |
| Dados da primeira fase | `src/data/pixelQuest/level-1-1.ts` | tiles + entidades em dados, sem lógica de DOM |
| Testes | `tests-api/pixel-quest-physics.test.mjs`, `tests/pixel-quest.spec.ts` | motor puro + E2E desktop/mobile |

**Integrações obrigatórias já existentes:** `gameRegistry.ts` (somente quando houver fase funcional, título #003 e versão dev), `gameModes.js` (ID `pixel-quest`), `GamePage.astro`, `GameHud.astro`, `GameRanking.astro`, `GameShare.astro`, `gameEvents.ts` (uma partida por início real), `gameViewport.ts` e contrato visual de `global.css`. Não copiar implementações de countdown, modal, fullscreen, contador, ranking ou celebração. Conferir que o backend de placares reconhece ID novo na allowlist compartilhada **antes** de habilitar ranking em produção; não inventar ou gravar resultados enquanto não estiver integrado.

**Regra de catálogo:** não incluir jogo #003 na Home nem aumentar contador de jogos antes da primeira fase ser jogável e aprovada; modalidade e título não são sinônimos. Não mudar dados já existentes de Snake/Tetris.

## 3. Física e jogabilidade piloto (parâmetros iniciais, sujeitos a teste)

- Referencial: tiles de **32×32 unidades**, jogador **22×29**, sem escala na física; viewport lógica de **640×360** (Canvas ajustado de modo responsivo, sem distorção; preservar área útil e avaliar HUD/controles).
- Movimento lateral: velocidade máxima **180 unidades/s**, aceleração de chão **1.400 unidades/s²**, desaceleração **1.800 unidades/s²**; no ar, controle parcial.
- Gravidade **1.100 unidades/s²**; salto inicial **−390 unidades/s**; velocidade terminal **650 unidades/s**.
- Qualidade do controle: `coyote time` **90 ms**, `jump buffer` **100 ms**, salto curto ao soltar botão cedo. Não permitir pulo duplo no MVP.
- Colisão: volumes AABB; resolver movimento **X, depois Y** com varredura das tiles percorridas para evitar atravessar paredes; contato de baixo contra plataforma causa pouso; colisão lateral não causa pouso.
- Câmera horizontal acompanha com zona morta e `clamp` nos limites do mapa; deslocamento vertical apenas se o desenho exigir e sem sacudir a tela.
- Dano e fim: jogador começa com **3 corações**; inimigo/obstáculo desconta 1 e dá **1 s de invulnerabilidade**, queda em abismo retorna ao último checkpoint descontando 1; **0 corações = game over**, botão reiniciar fase.
- Inimigos do piloto: **1 espécie terrestre de patrulha**, movimento entre limites, colisão lateral causa dano, contato por cima derrota inimigo e impulsiona jogador. Sem IA complexa.
- Coletáveis: **cristais** de pontuação, contados uma vez. Fase termina ao tocar o portal quando alcançável. Placar = cristais × 10 + inimigos vencidos × 50 + bônus de conclusão fixo (proposta, registrar regra antes de ranking).
- Sem relógio competitivo na primeira entrega; apresentar tempo jogado apenas se contador real existir e não avançar na pausa.
- Teclado: **A/D ou ←/→** para mover, **Espaço/↑/W** para saltar, **P** pausa, **F** fullscreen; em mobile, botões esquerda, direita e salto com simultaneidade/multitoque. Não bloquear rolagem da página fora do Canvas. `Esc` segue padrão global de fullscreen.
- Estados e efeitos: countdown global 3–2–1 no início/retomada/fullscreen, aba oculta pausa, sem avanço de tempo/jogabilidade em pausa; animações respeitam `prefers-reduced-motion`.

Valores numéricos são **pontos de partida para calibragem**, não características aprovadas nem testes realizados.

## 4. Primeira fase — 1-1, Trilha Esmeralda

**Objetivo:** ensinar mover, saltar, coletar e alcançar um portal. Deve durar cerca de 1–3 minutos para quem está aprendendo (meta de design a validar, não medição). **Mapa inicial:** 96 colunas × 18 linhas de tiles (3.072 × 576 unidades); chão principal na faixa inferior. Áreas de segurança antes de saltos. Saída acessível sem coletar tudo.

| Trecho / colunas | Situação proposta |
|---|---|
| 0–15 | Spawn no chão estável; 3 cristais à frente e sinal visual de controles |
| 16–31 | Plataformas baixas; primeiro inimigo patrulheiro em espaço plano |
| 32–47 | Primeiro vão **curto** e ponte de plataformas; coletáveis conduzem trajetória |
| 48–63 | Checkpoint visível em chão seguro; plataforma em altura intermediária |
| 64–79 | Segundo vão curto, 2 inimigos separados, cristais opcionais acima |
| 80–95 | Terreno seguro, portal de saída e tela de conclusão |

**Formato de mapa (dados, não CSS):**
```ts
type Tile = 0 | 1 | 2; // vazio, sólido, semissólido
type Spawn = {kind:'player'|'crystal'|'patroller'|'checkpoint'|'exit';x:number;y:number};
type Level = {id:string;world:string;width:number;height:number;tileSize:32;tiles:Tile[][];entities:Spawn[]};
```
- Coordenadas de entidades em unidades de mundo; validação do mapa: largura/altura consistentes, sem entity fora de limites, exatamente **1 spawn e 1 saída**, sem posições iniciais dentro de sólidos, checkpoint válido.
- Organizar o mapa por trechos legíveis (ou linhas de símbolos convertidas por parser testado) e definir geometrias reais durante implementação; não preencher agora 1.728 tiles sem ter motor/prototipagem.
- **Checkpoint único** após primeiro salto; ao morrer/retomar não duplicar cristais obtidos nem permitir bônus repetidos por um mesmo evento.
- Porta de saída encerra simulação antes de exibir resultado; não iniciar fase seguinte sem decisão explícita do jogador.

## 5. Sequência de entregas e critérios objetivos

**Etapa A — fundação jogável:** motor puro, 1 mapa inicial, render geométrico, andar/saltar, colisões, câmera, HUD/pausa/countdown/fullscreen. Testes: velocidade independente de FPS; nenhuma travessia de paredes; salto curto/longo; pausa congela posição; câmera respeita limites; touchscreen sem scroll indevido.

**Etapa B — fase completa 1-1:** checkpoint, danos/invulnerabilidade, patrulha, cristais, portal, vitória/game over/reinício. Testes: colisão por cima vs lateral; queda e respawn; 0 vidas encerra; score e coletáveis idempotentes; terminar não conta partida extra; desktop 1440/1024 e mobile 390/320.

**Etapa C — integração do portal:** registrar #003 e modo após jogável; metadados e texto histórico originais com fontes, contadores e eventos globais, ranking somente se API/validação coerentes, conta e compartilhamento; execução GitHub Actions direcionada e depois suíte completa **uma vez por entrega**, sem iniciar ciclo de commits individuais.

**Etapa D — seis fases e polimento:** expandir para 3 mundos × 2 fases com dados, novas combinações e arte/áudio originais. Não criar novas mecânicas por fase sem necessidade; validar equilíbrio com testes antes de publicar.

**Critério de pronto da fase 1-1:** alcançar portal tanto no teclado quanto em touch; sem travamento/atravessar plataformas; pausa/retomada/fullscreen preservam posição e pontuação; fim/restart não duplicam contadores; viewport sem overflow a 320/390/1024/1440; testes direcionados e build aprovados. QA em aparelho real e Preview dependem de validação posterior do proprietário.

## 6. Restrições operacionais

- Planejamento não altera jogo, catálogo, banco ou produção; nenhum SQL é necessário nesta etapa.
- GitHub é fonte de verdade; branch exclusiva sem merge ou publicação. Cloudflare controlada exclusivamente pelo proprietário, com builds de Preview desligados durante desenvolvimento. Futuro Preview local quando estiver no computador.
- Sem serviços pagos, Lovable ou reativação de Desafio Diário.
- Risco técnico principal: o #003 requer motor completamente novo de física, câmera e tilemap; **não** reescrever padrões globais já compartilhados.
- Risco de marca/direitos: "Pixel Quest" é provisório; identidade e audiovisual precisam ser independentes dos jogos Nintendo e nome revisado antes da publicação.

## 7. Próxima ação

Implementar **somente a Etapa A** na mesma branch, começando por física pura testável e mapa 1-1 de blocos temporários. Revisar os resultados da Etapa A antes de adicionar inimigos, arte ou as outras fases.
