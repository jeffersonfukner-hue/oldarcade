
- Disparo Evolution alterado conforme decisão do proprietário: automático e contínuo enquanto power-up ativo (70 ticks, cadência 4 ticks ~0,5s na velocidade base); sem tecla X. Tiro atravessa corpo, para na primeira fruta comum/rara (+10/+50 sem crescimento) ou obstáculo (3 impactos para destruir, dano visual); poderes especiais e Salva-Cobra não são coletados por tiro. Somente Preview experimental. A cadência por ticks acompanha velocidade/slow; balanceamento e testes E2E ainda pendentes.
> **Contrato obrigatório para todo jogo/modo:** [PADROES_GLOBAIS_DOS_JOGOS.md](PADROES_GLOBAIS_DOS_JOGOS.md). Histórico abaixo não substitui os padrões globais vigentes.

# OldArcade — continuidade obrigatória

## Correção estrutural — 17/11/2026 · marcos de pontuação reutilizáveis
- **Problema confirmado em código:** Clássico/Evolution exibiam mensagens de 100/200/400/800/... pontos com `funMoment()` (texto grande e partículas na posição da cobra); Aventura copiava a mesma lista e exibia `notify()`, um banner legado fixo no topo. A regra de componentes compartilhados estava sendo violada.
- **Correção GitHub:** `src/scripts/snakeMilestones.ts` centraliza os textos/limiares, `nextSnakeMilestone()` e `showSnakeMoment()`. `src/scripts/snake.ts` (Clássico/Evolution) e `src/scripts/snakeAdventure.ts` (Aventura) consomem o **mesmo código** de detecção e o mesmo efeito visual. Commits `867d1eb4`, `06ba7edd`, `2d0fea27`.
- **Escopo:** marcos 100, 200, 400, 800, 1600, 3200, 6400, 12800 e 25600; o aviso `notify()` no Aventura permanece só para o evento distinto de marca global provisória. Nenhuma alteração de pontuação, progressão, missões, recordes ou mecânica.
- **Padrão reafirmado:** animações/limiares/mensagens compartilháveis do mesmo evento pertencem a um único módulo; jogos e modos somente fornecem dados e contexto de exibição, sem cópias. Uma alteração do componente comum deve refletir nos três modos.
- **Teste adicional:** commit `51e1765e` elimina intermitência nos E2E Aventura/Clássico da tecla Espaço causada por `scroll-behavior: smooth` durante `scrollTo(0,0)` no preparo do teste. Em #229, Aventura falhou com `Expected 634 / Received 0` por essa transição assíncrona. Ajuste exclusivo do teste, não da jogabilidade.
- **Validação:** CI dos commits acima ainda pendente no momento desta anotação. O proprietário realiza exclusivamente o aceite **visual** no Preview; agente cuida de código, CI e testes automatizados, sem confundir deploy com aceite visual. Sem merge, publicação em produção, alterações SQL ou Lovable.
- **Próxima ação:** obter CI verde do HEAD, entregar Preview da branch ao proprietário com instrução curta para comparar marcos de 100/200/400 nos três modos; registrar feedback sem validar visualmente em nome dele.


## Verificação objetiva — 17/11/2026 · CI e Cloudflare Preview
- GitHub Actions workflow #225 (run `44018611072`, commit `2b749fe7`) **success**: tipos, build, API e Playwright aprovados (101 passed, 1 skipped; desktop/mobile Chromium), pacote `oldarcade-preview` gerado. Evidência: https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/44018611072
- Workflows #223 (`1dcb7e99`) e #224 (`fa68e697`) falharam nos mesmos testes legados, antes das correções do #225; não são a referência de aceite atual.
- Na PR #1, o comentário do bot Cloudflare informa **deploy de Preview bem-sucedido** do commit `76a9be3` no endereço https://a87c5242.oldarcade-17c.pages.dev ; alias da branch https://feat-fundacao-snake.oldarcade-17c.pages.dev ; evidência https://github.com/jeffersonfukner-hue/oldarcade/pull/1#issuecomment-6904416005. Essa confirmação é de deploy, **não** de inspeção visual/jogabilidade; acesso por consulta web retornou indisponível.
- `docs/PREVIEW.md` corrigido no commit `15e298b4` para refletir o deploy real e manter QA humano pendente. HEAD agora é posterior ao `76a9be36`; conferir seu CI antes de declarar verde.
- QA pendente: inspecionar realmente o Preview Aventura em desktop 1440/1024 e mobile 390/320, controles e fullscreen, feedback de itens e mensagens, testar iPhone/Safari quando possível. Nenhuma alteração de banco, merge, produção ou Lovable autorizada/realizada.
- Próxima ação: confirmar CI do HEAD e obter evidências visuais/interativas do Preview, sem assumir que o sucesso do deploy comprova o comportamento.


## Complemento visual — 17/11/2026
- Commit `a9bc2bbe`: itens especiais com duração no Snake Aventura passam a mostrar um anel de tempo restante no canvas, reutilizando a linguagem visual do Evolution (sem alterar duração, coleta ou pontuação). QA visual Preview pendente.

## Continuação de execução — 17/11/2026 · testes e refinamento visual
- Commit `2b749fe7`: atualização de testes Playwright antigos em `tests/snake.spec.ts`: mensagens de ranking conforme regra atual de desempate por tempo; recorde pessoal só é celebrado quando supera marca positiva anterior; recorde global provisório exige líder anterior positivo; cenários Aventura testam travessia livre e ausência de polling, sem simular derrota onde não há parede. Testes ainda dependem de CI para confirmação.
- Commit `51c98622`: ajuste do banner secundário do Aventura para aviso compacto, translúcido, sem captura de interação, com variação de prioridade e reinício de animação usando classe CSS existente. Celebrações principais continuam no componente global `gameCelebration.ts`; nenhuma alteração de regras, missões, pontuação ou ranking.
- CI #223 para `1dcb7e99`, #224 para `fa68e697` e novo CI para `2b749fe7` estavam em andamento na última consulta. O commit visual `51c98622` precisa ter seu workflow conferido. Não afirmar CI verde sem conclusão registrada.
- QA Preview Cloudflare e validação visual humana continuam pendentes; ausência de alteração em D1, main, produção ou Lovable.
- Próxima ação: revisar o resultado do workflow do HEAD, corrigir somente falhas comprovadas, validar os efeitos do Aventura em 1440/1024/390/320 e registrar captura e aceite do Preview.

## Atualização de execução — 17/11/2026 · modernização visual Aventura
- Commit `1dcb7e99` na branch `feat/fundacao-snake`: Aventura usa somente celebração global para subir nível e para derrota (sem banners duplicados); nova partida emite `oldarcade:game-started` para limpar efeitos pendentes; overlay de reinício é apresentado após 4 s, alinhado à duração da celebração final compartilhada. Mecânica, níveis, missões, pontuação, contadores e API de ranking preservados.
- CI anterior, commit `898118648`, workflow #222 (`44014165809`): build, tipagem e testes de API passaram; Playwright 89 passou, 12 falharam, 1 ignorado. Falhas repetidas desktop/mobile: quatro cenários Clássico (consulta/recorde) e dois Aventura (fim de jogo). Nos dois testes Aventura, a expectativa de derrota após apenas `ArrowUp` é incompatível com a regra vigente de travessia de bordas livres: não remover wrap para satisfazer o teste; reescrever cenários para colisão determinística. Verificar logs completos para demais causas Clássico.
- **Ainda pendente:** checar CI do novo commit, corrigir testes E2E legados com base nas regras atuais, aferir responsividade/efeitos no Preview Cloudflare e validar visualmente com o proprietário. Não afirmar CI verde ou Preview pronto. Sem SQL, merge ou publicação.
- Próxima ação: investigar cada falha E2E, atualizar teste de colisão do Aventura sem modificar sua jogabilidade e repetir CI; depois abrir URL real do Preview da branch para QA.



## ESTADO ATUAL PARA NOVO CHAT — 16/11/2026 (ler primeiro)
- Mensagens progressivas especiais por pontuação (100, 500, 1300, 2500, 5000, 10000) em Clássico/Evolution e Aventura, mantendo demais eventos; sem SQL. QA pendente.

- HUD Snake Clássico/Evolution/Aventura reestruturado para painel lateral 20%, tabuleiro 80%; cronômetro movido ao HUD compartilhado; mobile usa faixa compacta acima; sem SQL. Validar Preview, CI, fullscreen e mobile.

- Correção visual: paredes do Clássico agora contornam o canvas pelo lado externo via outline, sem cobrir grid; no Aventura, segmentos de paredes progressivas são DOM overlay posicionados fora da área útil, preservando passagem onde não há parede. QA Preview pendente.

- Pedido visual: Clássico SEM avisos textuais, com paredes fixas nas quatro bordas usando exatamente a linguagem visual Evolution (#cf79ee, espessura 22% da célula). Aventura atravessa bordas livres e perde somente ao tentar cruzar segmentos de parede perimetral, que surgem progressivamente junto com as barreiras dos níveis; paredes também em #cf79ee. Evolution inalterado. QA pendente.

- Clássico: aviso explícito de derrota ao tocar qualquer borda no início e acima do tabuleiro; moldura de alerta âmbar nas quatro laterais. Evolution mantém bordas atravessáveis. Sem mudança na mecânica.

- 17/11: usuário confirmou PRAGMA `duration_ms INTEGER` no D1 Preview. API de leaderboard agora persiste duração em milissegundos, desempata por menor tempo (antigos NULL depois dos cronometrados), UI exibe duração; os três modos enviam tempo efetivo excluindo pausa/contagem. QA e CI ainda necessários. Banco de produção NÃO migrado. SQL sempre entregue na mesma etapa quando necessário.

- Regra operacional explícita do proprietário (17/11): toda mudança que necessite SQL deve entregar script executável para aplicação manual no servidor na MESMA etapa, com banco-alvo, verificação e aviso de dependência; não deixar migração esquecida. SQL de duração `migrations/0007_record_duration.sql` para Preview foi entregue ao usuário; NÃO aplicado pelo agente. API e ranking ainda precisam ser adaptados antes de ativar desempate por tempo.

- Cronômetro de tempo jogado nos três modos via componente compartilhado `src/scripts/gameClock.ts`: tempo ativo em mm:ss, pausa/contagem regressiva excluídas. Desempate global por duração **pendente**: precisa persistir tempo na API/D1 e migrar ranking, proibido alterar banco sem autorização explícita. Inimigos Evolution implementados após 10.000 pontos: hunter persegue cabeça, ambusher antecipa direção, wanderer patrulha; até três inimigos por patamar. Contato com cabeça causa derrota; corpo não sofre ataque. Power-up scare temporário faz inimigos fugirem e permite eliminá-los por contato com a cabeça. Exige QA no Preview. Sem merge/produção.

- Feedback 16/11: elogios durante partida agora a cada 100 pontos (antes 30), tipografia maior. Evolution saiu do modo de progressão acelerada: `EVOLUTION_FAST_TEST=false`, marcos originais 0/100/250/600/1500/4000/10000; sem alterar velocidade da cobra, tiros ou padrões compartilhados. Sem merge/produção.

- Feedback aprovado: primeira pontuação NÃO supera recorde pessoal/global inexistente. Efeitos de recorde só quando havia marca positiva anterior e foi superada; recorde global requer marca global conhecida positiva. Celebrações lúdicas independentes do ranking: mensagens variadas a cada 30 pontos e salvamentos de power-ups no último instante, não bloqueantes. Evolução permanece em Preview da branch.

- Feedback: cobra Evolution acelera cedo demais. Ajustado somente Evolution: início 210 ms, aceleração de 7 ms por 100 pontos de pico, mínimo 145 ms; Clássico preservado.

- Ajuste solicitado de jogabilidade Evolution: progressão de teste menos acelerada (marcos 0/30/60/90/130/170/220), tiros são projéteis visíveis com deslocamento de 2 células por tick (não laser instantâneo); obstáculos internos e bordas preservam cor fixa ao sofrer dano. Sem rota de Preview dentro de Preview: testar `/jogos/snake/evolution/` no Preview da branch. Não publicar produção.

- Evolution como terceiro modo em `/jogos/snake/evolution/` no Preview: página própria, gameModes `snake-evolution`, ranking/recordes/contadores/conta compartilhados com isolamento por modo, GameShare e HUD herdados da página do Snake; mecânicas continuam com limiares rápidos de teste. Não há migração D1, merge ou produção. CI/Preview ainda precisam de verificação. Corrigida chamada ausente `celebrate('global')` que fazia falhar o teste E2E de partículas de recorde global; adicionados testes de rota Evolution, isolamento de leaderboard e contadores. Arquivos principais: `src/pages/jogos/snake/evolution.astro`, `src/scripts/snake.ts`, `src/scripts/globalLeaderboard.ts`.

- Acesso direto Evolution no Preview: botão `⚡ Jogar Snake Evolution (teste)` na hero do Clássico, somente em `*.oldarcade-17c.pages.dev`; no Evolution botão muda para voltar ao Clássico, título/HUD identificam o modo. Não exige editar URL manualmente. Pendente CI e conferência do deploy.

- Usuário **validou animação Game Over**. Nova regra Evolution: sem bordas inicialmente (wrap), segmentos de parede aparecem progressivamente, bloqueiam travessia, 3 tiros destroem temporariamente e regeneram após 90 ticks; obstáculos internos 3 tiros e destruição definitiva, surgimento periódico com limite de 8. `EVOLUTION_FAST_TEST=true` concentra desbloqueios em 0–100 pontos, reversível para patamares originais; não modificar Clássico normal. **CI e teste real pendentes**.

- Revisão de CI do commit `a5d13d58`: falha no `astro check` por `rival` indefinido em `gameCelebration.ts:39`; corrigida no commit `2d4653c3` junto da centralização final. Preview aberto `7bc91236.oldarcade-17c.pages.dev/jogos/snake/` mostra jogo normal, mas leitura de aba não executa interação, portanto não comprova mecânicas Evolution. O teste experimental exige `?evolution=1` em subdomínio de Preview.
- Revisão estática Evolution: frutas simultâneas (+10), raras (+50, expiram após 38 ticks), slow, obstáculos e disparo X; Salva-Cobra exige >=30 e cobra >=12, perigo <=1 saída, custo -30/3 segmentos. Ajustada escolha da Salva-Cobra para células alcançáveis em até 12 passos, evitando aparição completamente desconectada; temporizadores por tick de jogo (não segundos de relógio). Não há submissão/registro de partida em `end()` e `start()` experimentais, mas o HUD ainda mostra ranking oficial para comparação. Pendente validação E2E e CI do novo HEAD.

- Repositório `jeffersonfukner-hue/oldarcade`; branch de integração `feat/fundacao-snake`; PR #1. Somente jogo #001 Snake, com modos Clássico (`snake`) e Aventura (`snake-adventure`). **Não criar jogo #002/#003 sem aprovação.**
- O proprietário **validou** a experiência do painel universal `/conta/` com recordes, CTA contextual e missões pessoais derivadas de `mine`/`top` da API; não inventar histórico de partidas ou recompensas. Header/sidebar exibem nickname autenticado.
- Rankings por modo e página `/rankings/` são compartilhados; posições e liderança confirmadas dependem da API. Pontuação atual é autodeclarada (`verified:false`); não alegar antifraude.
- Celebrações globais: `src/scripts/gameCelebration.ts` + `src/components/GamePage.astro` via evento `oldarcade:celebrate`. Efeitos: recorde pessoal, missão, Top 3, liderança confirmada, rival/revanche. Clássico também tem efeitos locais anteriores. Aventura utiliza `modeRanking.ts` e eventos de pontuação. **Não afirmar ultrapassagem em tempo real ou “20 segundos” sem dados confiáveis.** O aviso de revanche foi pensado para resultado final em que uma liderança provisória não se confirma.
- Simulador visual de cinco comemorações: painel “🧪 Testar comemorações · Preview” somente em subdomínios `<hash>.oldarcade-17c.pages.dev` (não no domínio principal de Pages ou domínio personalizado). Não altera dados/contadores/rankings. Testar especialmente celular, movimento reduzido, Escape e botão de revanche.
- Backlog **apenas futuro**, seção 13 de `docs/PADROES_GLOBAIS_DOS_JOGOS.md`: área administrativa por jogo/modo para pontuação, metas, mensagens, incentivos, animações, duração, prévia, versionamento e auditoria. **Não implementar agora**.
- Histórico recente: `b2a33142` missões de conta (CI success); `d953b6c4` celebrações (CI falhou em tipagem TS); `b7b6cb2` simulador; `f1c32bf` correção de tipagem; `30c1eed9` documentação do backlog administrativo. **Verificar o CI e Preview atuais antes de declarar sucesso**. O proprietário ainda não validou visualmente o simulador.
- Correção subsequente solicitada pelo proprietário: duplicação de aviso de recorde no Clássico identificada em `announceRecord` + `oldarcade:celebrate`. Removido o aviso local redundante para recorde pessoal; animação global agora é inserida no tabuleiro e usa explosão breve central (escala e opacidade máxima 50%) sem cartão/botão. Pendente CI e teste visual no Preview.
- Ajuste solicitado pelo proprietário em 16/11: recorde e partículas devem ser semitransparentes, compactos e não bloquear o jogo em andamento. CSS global ajustado para avisos no topo sem backdrop, sem captura de toque; rival pós-partida mantém modal. Verificar no Preview se o botão “Continuar jogando” observado vem de outro componente do Clássico/Aventura e corrigir se ainda bloquear.
- Piloto do Motor de Personalidade Arcade: catálogo temático compartilhado `src/scripts/arcadePersonality.ts`; Snake Clássico emite provocação de perigo quando cobra >=12, pontuação >=30 e <=1 saída imediata (sem alterar mecânica); simulador Preview inclui perigo e Salva-Cobra (esta última é apenas visual; fruta não implementada). Cooldown de 15s para mensagens reais. `GamePage.astro` reparado: commit anterior tinha CSS duplicado após `</Base>`, causando CI vermelho. Validar CI e Preview após este commit.
- Ajustes solicitados após validação visual: mensagens temáticas longas exibidas por 2,7s; meta global provisória agora usa animação compartilhada (sem banner antigo); após derrota ou vitória, aguardar resultado de ranking, mostrar animação final por 4s e só então revelar reinício/modal de conta. `GamePage.astro` recebeu estilo próprio de resultado final. Testes existentes de aviso pessoal/global atualizados; demais testes de tempo/modal podem precisar de ajuste. Conferir CI do HEAD e Preview antes de aprovação.
- Experimento Snake Evolution implementado como opt-in **somente Preview** via `?evolution=1` no Clássico: múltiplas frutas comuns, raras com expiração, encolhimento -30/3 quando em perigo e >=30, slow, obstáculos progressivos e disparo X (4.000+), marcos 0/100/250/600/1500/4000/10000. **Sem envio de placares/partidas ao ranking ou contadores no modo experimental**; Clássico normal permanece intacto. Verificar CI, jogabilidade, balanceamento, fluxo de fim e segurança do isolamento antes de aprovar.
- Correção de posicionamento da animação final: `gameCelebration.ts` agora insere o overlay final no próprio `#game-screen` (não mais no pai do componente/página), e `.oa-celebration.is-final` usa posicionamento absoluto relativo ao tabuleiro. Corrigida também referência TS inválida a `rival` no reinício de animação. Pendente CI e validação visual no Preview em desktop/mobile/fullscreen.
- Próxima ação técnica: conferir Actions do HEAD, corrigir falhas se existirem e localizar Preview do commit atual; depois usuário testa os cinco botões e aprova visualmente. Sem merge, publicação, SQL, D1, alterações de Cloudflare/domínio ou Lovable.
- Método: GitHub como fonte de verdade, uma entrega por commit quando possível para reduzir builds Cloudflare, validação pelo proprietário, documentação atualizada e botão de continuação com contexto. Não reabrir decisões aprovadas.
- **Regra de continuidade:** a cada marco funcional ou antes de trocar de chat, atualizar este bloco (estado, commits, CI, validações, pendências, próxima ação), mantendo fatos distintos de hipóteses. Novo chat deve ler AGENTS.md, este documento, ARQUITETURA.md, PADROES_GLOBAIS_DOS_JOGOS.md e VERSIONAMENTO_E_PUBLICACAO.md e conferir HEAD/Actions antes de qualquer mudança.


## ATUALIZAÇÃO — missões contextuais no painel universal (16/11/2026)
- O painel `/conta/` passa a sugerir missões por modalidade competitiva a partir de `mine` e `top` do leaderboard existente: primeira pontuação, superar recorde, Top 3, liderança. Não cria pontos, recompensas, badges persistidos ou histórico fictício.
- A conta é gerada pelo catálogo de jogos e modalidades; não fixar títulos futuros. CI e Preview desta entrega pendentes de validação.


## ATUALIZAÇÃO — contrato de eventos e conta (16/11/2026)
- CI do commit 599f868e: run 43986553860 **success**; proprietário aprovou o histórico visual no Preview do Aventura.
- Padronização em desenvolvimento: funções compartilhadas `recordGameScore` e `recordGameFinish` centralizam a emissão dos eventos usados pelo ranking/compartilhamento; eventos preservam nomes e payload existentes. Snake Clássico continua com sua lógica própria de ranking, sem alteração de mecânica.
- Compartilhamento passa a aceitar pontuações decimais válidas (até 3 casas), conforme contrato global; login/cadastro no modal de ranking emite evento de identidade para atualizar cabeçalho e menu sem reload.
- CI e Preview deste commit precisam ser verificados. Sem D1, SQL, produção, merge, domínio, Cloudflare ou Lovable.


## ATUALIZAÇÃO — histórico de modalidades e redução de deploys (16/11/2026)
- Cloudflare Pages exibia 151 deploys em 11 páginas; fonte observada no painel. Preview automático na branch `feat/fundacao-snake`; produção `main` isolada. A contagem de deploys não equivale a versões.
- CI run 43984742315, commit 45cea7e, **success**.
- Registrados marcos de desenvolvimento do Snake Aventura e infraestrutura compartilhada no catálogo, sem inventar uma nova versão nem contar modo como jogo. Histórico do modo visível na página Aventura e histórico geral no Clássico.
- Processo: usar commits multi-arquivo por entrega para diminuir builds/deploys. Configuração automática Cloudflare não alterada; sem SQL, merge ou produção.


## ATUALIZAÇÃO — HUD compartilhado e contagem correta (16/11/2026)
- Contagem inequívoca: **1 jogo (#001 Snake), 2 modos (Clássico e Aventura)**. Jogo #002 e jogo #003 não iniciados; meta são 3 títulos distintos antes de migração do domínio.
- CI comprovado do commit b5e88ae: run 43981972989 **success**. Run 43983568736 (commit 680fb357) estava em execução na última consulta; commits posteriores precisam de CI próprio.
- `src/components/GameHud.astro` criado e adotado nas duas páginas do Snake, mantendo IDs e scripts existentes; teste de contrato adicionado em `tests-api/game-page-contract.test.mjs`.
- Home passa a obter modalidades e nomes de todos os títulos cadastrados, sem filtro fixo para Snake. O número de jogos disponíveis continua baseado em `gameRegistry.ts`.
- Próximos passos: confirmar CI do commit mais recente, verificar visual e interações no Preview, consolidar interface de eventos/conta/compartilhamento sem mexer nas regras dos modos. Sem SQL, produção, merge, deploy ou Lovable.


## ATUALIZAÇÃO — integração de páginas e CI (16/11/2026)
- **CI verde comprovado**: run 43981972989, commit b5e88ae (tipos, build, testes de API e navegador). Os commits posteriores exigem novo CI verde.
- Home agora usa `gameModes.js` para montar cartões do Snake e continua contando títulos por `gameRegistry.ts` (não soma modos como jogos).
- `src/components/GamePage.astro` é a estrutura compartilhada para SEO real, JSON-LD, caminho canônico e exigência de modalidade/título cadastrados. As duas páginas Snake a consomem, preservando HTML e scripts de jogabilidade existentes.
- Teste novo `tests-api/game-page-contract.test.mjs` verifica páginas de modos e presença do contrato SEO. Último commit conhecido: a107adcf. Validar seu CI antes de declarar pronto.
- Próximas pendências: HUD e integração de partida em componentes reutilizáveis sem alterar comportamento aprovado; integração de conta/compartilhamento por contrato; Preview visual desktop/mobile e API Clássico após D1 0006. Não iniciar jogo #002 sem aprovação, não alterar produção ou D1.


## ATUALIZAÇÃO — padronização para próximos jogos (16/11/2026)
- Migração 0006 executada **pelo proprietário somente no D1 Preview**. Consulta após migração: Snake Clássico 3 jogadores/maior 320; Aventura 3 jogadores/maior 395. Preview `7eb40424.oldarcade-17c.pages.dev` exibiu Top 3 Aventura (395, 360, 350). Não foi realizado POST decimal real nem validado o Clássico após migração; não modificar dados para testar.
- CI anterior do Snake: run 43979027142, commit 8658fa1, **success**. A refatoração posterior tem CI independente pendente.
- Nova fonte central de IDs/modos: `src/data/gameModes.js`. APIs de ranking/contadores, `gameEvents.ts` e `src/pages/rankings.astro` passam a consumir o catálogo. Testes de contrato: `tests-api/game-modes.test.mjs`. O catálogo editorial de títulos e versões permanece em `src/data/gameRegistry.ts`.
- Ainda pendente: CI verde do commit mais recente, integração do catálogo na Home e template de página/HUD/SEO, validação visual do Preview. Não criar jogo #002 sem nova autorização. Nenhum merge, publicação ou mudança em produção.


## BACKLOG — modos do Snake e Desafio Diário (registrado em 16/11/2026)
- **Clássico:** preservar a mecânica aprovada, sem misturar itens, barreiras ou progressão dos modos alternativos.
- **Aventura:** partida contínua com níveis, missões, frutas e poderes; evoluir por etapas, incluindo barreiras progressivas e eventuais itens que ajudem ou atrapalhem. A implementação e os testes de cada etapa serão tratados separadamente.
- **Desafio:** modalidade própria com mapas, barreiras e dificuldades, com classificação separada do Clássico e do Aventura. Planejamento somente; definir regras e escopo antes de codificar.
- **Desafio Diário:** modalidade futura com **o mesmo mapa/desafio para todos os participantes no mesmo dia** e **ranking diário independente**. Definir antes de implementar a geração determinística do desafio, fuso/data de virada, regras de tentativas, desempate, antifraude e custo de consultas/gravações no D1. Não ativar automaticamente nem apresentar como funcionalidade disponível.
- **Ordem de trabalho:** concluir e validar o Aventura em etapas; depois revisar e priorizar os demais modos, inclusive Desafio e Desafio Diário, um por vez com aprovação do proprietário. Não iniciar o jogo #002 nem publicar novos modos por conta própria.

## BACKLOG — indicações rastreáveis e recompensas futuras (registrado em 16/11/2026)
- Ideia do proprietário: cada jogador poderá compartilhar **um código/link de indicação próprio** em convites, para identificar quem mais trouxe amigos ao OldArcade e eventualmente premiar bons indicadores, **se o projeto crescer**. Isso é somente backlog: não ativar agora, não prometer prêmios, não gastar D1 ou gerar rastreamento sem aprovação específica.
- Diferenciar convites compartilhados (impossíveis de confirmar por app), cliques recebidos, novos jogadores que realmente jogaram e contas novas válidas. Não atribuir indicação apenas por abrir link. Preferir **contas autenticadas** e identificador de referência aleatório/opaco, nunca nome, e-mail ou ID sequencial no endereço.
- Projetar deduplicação, limite de atribuição, prevenção de autoindicação/fraude/múltiplas contas, consentimento e privacidade LGPD, prazo de retenção e condições claras antes de quaisquer rankings ou recompensas. Não registrar IP/contato por padrão nem disparar tracking de terceiros. Vincular ao futuro painel de métricas somente após autorização.
- Manter o compartilhamento atual sem códigos e sem rastreio de indicação; planejar evoluir o componente reutilizável GameShare apenas quando a etapa for aprovada.


## ESTADO ATUAL — 16/11/2026 (leia antes das seções históricas abaixo)
- **Rankings centralizados:** home agora possui um único menu `Rankings` e link `/rankings/`. Página dedicada compara Snake Clássico e Aventura em seções independentes com líder real, pontuação a superar, Top 3, Top 10 expansível, botão direto para desafiar o recorde. Usa a API existente apenas 1 GET por modo; sem polling, sem dados fictícios, nenhum D1 extra.
- **Nickname global:** `accountIdentity.ts` lê `/api/auth/me` ao carregar páginas e atualiza `[data-player-name]` no header e no card lateral; conta emite `oldarcade:account-changed` após login/cadastro/logout para refletir estado sem refresh. Sem login conserva "Minha conta". Não expõe dados além do nickname da própria sessão.

- **Home aprovada pelo usuário para implementação: opção 3 — foco no jogador.** Dashboard com menu lateral para jogos/rankings/conta, hero reduzida, dois cards reais para os modos Clássico/Aventura do único Snake (#001), três contadores compactos na mesma faixa, links para recordes e história. Não anunciar conquistas/novos jogos que não existem, não inventar ranking geral. Design responsivo com navegação horizontal no mobile, jogos visíveis sem rolagem excessiva. Nenhum ajuste em D1 e produção.

- **Hero validada e simplificada:** exibir apenas Jogos disponíveis, Visitas ao site e Total de partidas, em faixa fluida sem cartões. Removido indicador `Jogos jogados` por redundância com Jogos disponíveis, sem apagar registros existentes do D1. O backend pode continuar a computar o indicador para uso administrativo futuro, mas a hero não o consulta nem exibe.

- **Padrão de centralização do tabuleiro:** utilitário único `src/scripts/gameViewport.ts`, adotado por Clássico e Aventura. Ao iniciar, ao retomar e ao sair da tela cheia, reposiciona tabuleiro no centro visível quando possível, com proteção para fullscreen e sem modificar a partida; jogo mantém countdown 3–2–1 após fullscreen. Nunca reinventar esse comportamento a cada jogo. CSS fullscreen com `min-height:0` para caber nas alturas limitadas; testes mobile associados.

- **Padrão obrigatório por jogo/modo competitivo:** ao criar um jogo ou modo novo, reaproveitar desde o primeiro Preview: Top 10 por conta, podium individual, desempate cronológico, recorde pessoal, recorde global, liderança provisória durante partida, confirmação após registrar ao fim, cadastro/login opcional na tela pós-partida, resultados distintos por modo, HUD responsivo, compartilhamento, versionamento, contadores aplicáveis, testes desktop/mobile e acessibilidade. Não esperar o usuário lembrar essas funcionalidades; avaliar exceções documentadas quando não fizerem sentido. O modo Clássico continua intacto.
- **Aventura ranking:** backend aceita `snake` e `snake-adventure` usando `player_game_records.game` (sem migração). Novo componente `GameRanking.astro` + `modeRanking.ts` traz Top 10, posição própria, registro opcional da conta, aviso provisório e verificação no fim. Consulta na entrada + uma no fim (POST autenticado ou GET anônimo). `/api/auth/me` consulta sessão separadamente na entrada; sem polling. Ranking Aventura e Clássico isolados; pontuações ainda autodeclaradas, não antifraude. Não publicar antes do aceite.
- **Ponto de revisão do backlog:** após validação e consolidação do primeiro Aventura completo (com ranking, itens, barreiras e níveis), antes de iniciar o segundo jogo do catálogo, apresentar ao proprietário as ideias pendentes em grupos (implementar / adiar / eliminar), incluindo códigos de indicação e recompensas. Não ativar nem descartar automaticamente.

- **Snake Aventura em implementação/Preview, não publicado:** rota isolada `/jogos/snake/aventura/`, três níveis contínuos na mesma partida (1: cinco maçãs e 50 pontos; 2: uma dourada e 150 pontos; 3: três itens especiais e 300 pontos; depois sobrevivência). Maçã +10, dourada +50 e cristal +10 com lentidão temporária. Evolução exige simultaneamente missão e pontuação, mantém cobrinha/pontos, usa countdown 3–2–1 ao iniciar/retomar, teclado/gesto/toque, progresso local separado (`oldarcade:snake:adventure:v1`). Sem POST de recorde global nem alteração da mecânica do Clássico; **modo experimental não conta como um segundo jogo publicado**. Barreiras, veneno, dados globais do Aventura e modalidades de treino ficam para fases seguintes.
- **Compartilhamento:** o componente GameShare aceita `gamePath` opcional para apontar ao endereço correto de cada modo, sem incluir o código de indicação futuro. Aventura compartilha apenas seu resultado local, sem alegar recorde oficial.

- **Compartilhar/desafiar amigos:** componente reutilizável `src/components/GameShare.astro` + `src/scripts/gameShare.ts`, instalado no Snake. Oferece Web Share API, WhatsApp, Telegram, Facebook, X, Reddit, Bluesky e copiar convite. Antes do fim, convite genérico; após fim, inclui pontos **reais da partida**, sem afirmar verificação global ou expor apelido/conta. Usa URL da página do ambiente atual, incluindo Preview; não presume domínio de produção. Não adiciona requisições para servidor ou scripts sociais. Testes E2E cobrem URLs, score e orçamento de consultas.

- **Retomada de pausa:** botão Continuar (do jogo ou sobreposição) e atalho Espaço agora sempre iniciam o countdown existente 3–2–1 antes de retomar movimento, preservando cobra, pontuação e partida; testes automatizados atualizados. Não há requisições adicionais nem alterações na produção.
- **Fonte da verdade:** repositório `jeffersonfukner-hue/oldarcade`, branch `feat/fundacao-snake`, PR #1. A `main` é produção técnica neutra e **não deve ser mesclada nem publicada sem autorização atual**. Fluxo exclusivamente GitHub → CI → Cloudflare Preview → aprovação humana. Sem Lovable e sem créditos.
- **Última etapa aprovada pelo usuário:** commit `522b836`: busca do ranking na entrada e na conclusão da partida, sem polling durante jogo; placar de contas; avisos de variação com horários fundamentados. Implementadas e testadas (ainda exigem aceite humano no Preview) animações verde para recorde pessoal e dourada para meta global no commit `3be8f7d`.
- **Nova decisão expressa:** ultrapassar a meta global faz o HUD e lateral exibirem imediatamente o valor da partida como **provisório**. Ao término, a resposta ao POST autenticado determina se é líder oficial, empatou mas perdeu por ordem cronológica ou outro jogador tem pontuação superior. Para anônimos, somente o GET ao fim, sem reivindicar registro oficial. Sem consultas extras durante a partida. Efeito global dourado e pessoal verde preservados.
- **Ranking:** Top 10 único por conta e posição pessoal fora do Top 10, desempate cronológico por milissegundos do servidor. Recordes legados anônimos são testes antigos, ignorar em UI; não apagar D1 por conta própria.
- **Cadastro:** nickname permite espaço (`Vovo do 3D`), senha mínima 8, e-mail opcional, hash PBKDF2 de 100 mil iterações. Migrações `0003` e `0004` foram aplicadas pelo usuário ao D1 de Preview; teste real com conta e gravação deve ser revalidado quando houver alteração. Nenhuma migração nova desta etapa.
- **Produto:** Snake clássico sem alteração da lógica; +10 flutua ao comer fruta; HUD pessoal/global; efeitos de recorde; cadastro pelo modal de game-over. Backlog: modos, níveis, dificuldade, frutas e obstáculos em modos adicionais; não misturar ao clássico.
- **Hero / novos contadores:** quatro indicadores fluidos, sem cartões individuais (ajuste solicitado e enviado na branch); 1 jogo disponível no Preview via registro editorial, visitas ao site (uma por sessão de navegador), jogos jogados (quantidade de títulos distintos com partidas), total de partidas (soma dos eventos de início de jogo). Usa `game_events` D1 existente, `game='site', kind='visit'`, sem migração; novo endpoint `/api/site/stats`, uma gravação por sessão, leitura na hero. Sem números fictícios em caso de falha.
- **Recordes por jogo na conta:** ao conectar, a seção "Ranking local" mostra "Meus recordes por jogo" com as melhores pontuações da conta para todos os títulos do catálogo e link para jogar/superar; ao desconectar, preserva ranking local do navegador. Dados retornados na mesma resposta GET/POST de ranking do Snake (D1 `player_game_records` por `player_id`), sem consulta HTTP extra nem migração. Conforme outros jogos forem publicados, serão incluídos no catálogo e na seção.
- **Versionamento:** portal agora v0.2.0-dev lido do package.json, jogo Snake v0.2.0-dev do gameRegistry, histórico anterior imutável. Nenhum deles representa publicação na main ou release de produção.
- **Pendência:** verificar o CI da alteração atual e validar o Preview, especialmente ultrapassagem provisória, confirmação da própria liderança, empate cronológico e ultrapassagem por outro usuário. Não afirmar deploy ou produção sem evidência.
- **Retomada em outra conversa:** ler `AGENTS.md`, este arquivo, `docs/ARQUITETURA.md` e `docs/VERSIONAMENTO_E_PUBLICACAO.md` da branch `feat/fundacao-snake`. Conferir HEAD e Actions antes de agir. Pedir apenas uma ação humana por vez. Conteúdo abaixo é **histórico**, pode conter status desatualizados; esta seção prevalece.


> Leia este arquivo e `AGENTS.md` ao retomar. **Verifique o estado real no GitHub antes de considerar informações abaixo atuais.**

**Repositório:** `jeffersonfukner-hue/oldarcade`  
**Branch de trabalho:** `feat/fundacao-snake`  
**PR:** [#1 — Fundação OldArcade: home, SEO inicial e Snake jogável](https://github.com/jeffersonfukner-hue/oldarcade/pull/1) — rascunho, não mesclada  
**Última verificação antes desta atualização:** [Actions #43779228548](https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/43779228548) — success, commit `7da2542`.

## Objetivo
Criar do zero um site de jogos retrô com foco real em jogabilidade, história documentada, SEO rastreável, futura monetização com AdSense e administração, adicionando um jogo por vez. Nenhum domínio de produção foi autorizado.

## Feito e verificado
- Repositório GitHub novo e PR #1 em branch isolada.
- Home, páginas institucionais, Snake em Canvas, fullscreen do painel, controles, recordes/ranking **locais**, tutorial e história documentada.
- Registro histórico individual: Snake = Jogo #001, v0.1.0, iniciado em 15/11/2026; arquivo fonte `src/data/gameRegistry.ts`.
- Astro estático e CI de build, tipos e Playwright desktop/mobile.
- CI da implementação e registro histórico aprovado; pacote ZIP de Preview gerado pelo GitHub Actions em execução anterior. A URL pública de Preview **não** foi configurada.

## Ambiente Cloudflare — posição atual (15/11/2026, noite BRT)
O usuário criou o projeto Pages `oldarcade` conectado ao GitHub, com domínio técnico `https://oldarcade-17c.pages.dev`, `main` como branch de produção e configuração de build Astro, `npm run build`, saída `dist`.
- Deploy de produção técnica da `main` **concluído** na Cloudflare, exibindo exclusivamente página provisória neutra; não contém Snake e não utiliza domínio personalizado.
- Aviso de Git desconectado foi resolvido pelo usuário ao reautorizar a integração GitHub/Cloudflare.
- Em Settings > Branch control, usuário salvou `Custom branches` e `Include Preview branches = feat/fundacao-snake` (sem exclusões); produção continua em `main`.
- A última captura da aba Deployments mostra **apenas** um deploy de `main`. Ainda não há Preview de `feat/fundacao-snake`.
- A atualização desta documentação na branch de feature é destinada a disparar o primeiro build automático do Preview. Confirmar se Cloudflare registrou a nova implantação; se não, investigar opções de deployments antes de alterar a configuração.
- Não fazer merge da PR #1 e não adicionar domínio personalizado.

## Nova etapa: jogabilidade como padrão reutilizável
- Usuário aprovou a estética atual do Snake e solicitou HUD dentro da tela cheia, atalho F, pausa ao alternar modos e contagem 3–2–1.
- Implementação enviada na branch de desenvolvimento; validar CI, Preview Cloudflare e comportamento real antes de considerar aprovada.
- Mobile: layout responsivo e testes Chromium existem, mas ainda falta validação em telefone real.
- Contadores globais continuam pendentes de backend Cloudflare; nunca anunciar métricas locais como globais.
- Preview já criado na Cloudflare: https://3ebc7d78.oldarcade-17c.pages.dev/jogos/snake/ (URL da versão anterior, não usar como evidência de novo build).

## Validação do usuário e novo ajuste
- Usuário aprovou HUD, atalho F e as duas contagens regressivas 3–2–1 em Preview.
- Problema identificado: ao sair do modo tela cheia, o scroll posicionava textos acima do tabuleiro; jogador tinha de usar o mouse.
- Ajuste na branch: centralização programática do tabuleiro ao sair do modo tela cheia, preservando a contagem regressiva. Confirmar CI e validação manual no Preview antes de encerrar.

## Ajuste: início da partida (16/11/2026)
- O usuário confirmou que centralizar ao sair da tela cheia funcionou, e elogiou os dois countdowns.
- Solicitou centralização também ao clicar em **Começar partida**, sem tela cheia, e contagem 3–2–1 no início de toda partida.
- Implementação adiciona chamada de centralização existente e reutiliza beginCountdown com mensagem diferenciada para primeira partida. CI e Preview ainda precisam de confirmação.
- Cloudflare Pages registra deploys e URLs específicas por implantação, permite rollback de deploy de produção, mas não de preview (docs oficiais); não há limpeza automática configurada por nós.

## Mobile: controle por deslizar e toque duplo (16/11/2026)
- Usuário relatou que duplo toque provoca zoom acidental e quer comandar a cobrinha deslizando o dedo, mantendo os botões.
- Autorizou bloquear zoom fora do tabuleiro; abordagem adotada: bloquear apenas duplo toque no documento inteiro por `touch-action: manipulation`, preservando pinça de dois dedos para acessibilidade; `touch-action: none` somente no tabuleiro.
- Implementado controle swipe na região de jogo com limiar de 22 px e sem rolagem durante gesto. Aguardando CI e teste do usuário no iPhone para aprovar.

## Ajuste de visibilidade durante countdown (16/11/2026)
- Usuário solicitou que botão Começar/Jogar novamente fique oculto durante 3–2–1. O JavaScript já usava atributo hidden, mas a classe CSS .btn podia prevalecer; adicionado seletor específico `#start-btn[hidden]{display:none}` e teste automatizado.


## Contadores globais do Snake — 16/11/2026
- Código de UI, Pages Functions, migração D1 e testes implementados somente em feat/fundacao-snake.
- Banco Cloudflare não foi criado automaticamente. Próximo passo: criar D1 oldarcade-stats-preview, aplicar migrations/0001_game_events.sql e vincular a variável OLDARCADE_STATS_DB na configuração **Preview**, nunca produção.
- Sem binding, números exibidos como indisponíveis; nenhuma métrica fictícia. IDs aleatórios sem login e eventos armazenados sem IP; antifraude robusto e retenção a definir.
- Não dar merge nem adicionar domínio; após CI, orientar uma ação por turno no Cloudflare.

## Cloudflare D1 Preview — ID e configuração registrados
- Usuário criou `oldarcade-stats-preview` e executou a migração SQL; confirmou `game_events` no Console.
- Database ID informado pelo usuário: `2e849e43-9441-4ef0-8a24-e5a7d2dff074`.
- A tela Settings > Bindings não mostrava seletor de Preview. Não salvamos nenhum binding pelo dashboard.
- Adicionado `wrangler.jsonc` com `env.preview.d1_databases` definindo `OLDARCADE_STATS_DB`, e `env.production.d1_databases=[]`. Sem binding no nível raiz.
- Cloudflare Pages usará a configuração deste arquivo como fonte de verdade no deploy da branch; verificar no deploy do Preview se a API `/api/games/snake/stats` retorna `available:true` antes de considerar vínculo concluído.
- A publicação do `main` não foi acionada; não alterar produção.

## Regra de nickname para ranking local (16/11/2026)
- Pedido do usuário: salvar nickname já informado e mostrar score no ranking somente se o jogador tiver nickname, independentemente do apelido escolhido.
- O nickname já persistia em localStorage; a regra agora exige nome não vazio para gravar resultados locais e filtra entradas legadas 'Anônimo'/vazias.
- Partidas sem nickname continuam sendo contadas nos totais globais e recordes próprios. Não existe conta de usuário nem ranking global; isso exigiria identificação segura e validação de score.
- Testes E2E atualizados para garantir filtragem e persistência. Ainda verificar CI e Preview.

## Ranking global de recordes — etapa em desenvolvimento
- Usuário confirmou os contadores reais D1 `visits:2, plays:1`, solicitou ranking global que incentive retorno, destaque o líder e modal de registro opcional no final do jogo.
- Implementação preparou API, tabela D1, modal, Top 10 e mensagem de desafio, sem usar plano pago; requer executar `migrations/0002_game_leaderboard.sql` no banco Preview.
- Nickname salvo no navegador e score autodeclarado; não é login/verificação de pontuação. Não mesclar em produção.
- Corrigido teste E2E anterior que regravava localStorage em cada reload.
- Após CI, verificar comportamento visual e orientar usuário com uma ação por vez.

## Complemento e orçamento
- Usuário definiu que a primeira meta do AdSense é ao menos cobrir hospedagem, domínio e banco. Sem upgrade pago agora; avaliar se a viralização justificar os US$ 5 ou uma migração futura.
- No modal, se a partida acabou sem nickname anterior e o jogador registra o resultado global, a mesma pontuação passa também ao ranking local com o nickname informado.
- Testes adicionais verificam desafio público e nickname renderizado como texto, sem HTML injetado.

## Contato, suporte e futura autenticação (16/11/2026)
- O usuário aprovou conta com nickname e senha, e-mail **opcional** no cadastro e código de recuperação gerado uma vez. Jogar deve permanecer sem login.
- Se houver e-mail cadastrado, recuperação futura será feita **exclusivamente** por link de redefinição ou código temporário de uso único enviado ao e-mail previamente associado à conta; não aceitar apenas uma declaração de e-mail ou WhatsApp como prova de titularidade. Se perder todos os fatores de recuperação, não transferir a conta automaticamente.
- Contato inicial: formulário com motivos, inclusive recuperação, abrindo WhatsApp `+55 43 99865-0196` com mensagem preenchida. Número centralizado em `src/config/support.ts` para configuração futura via painel administrativo.
- Formulário de contato criado agora, **sem captura ou envio de e-mail pelo site**, sem simular conta já implementada. Cadastro seguro e recuperação por e-mail são trabalho futuro, sujeito a banco, autenticação e serviço de e-mail.
- O usuário pretende manter custos no plano gratuito até monetização e tráfego justificarem upgrade.

## Backend de conta e tela inicial — desenvolvimento (novembro 2026)
- Branch `feat/fundacao-snake` recebeu migração `0003_player_accounts.sql` (ainda NÃO executada no D1) e rota `/api/auth/register|login|logout|me`.
- Login por nickname único (normalizado), senha PBKDF2 SHA-256 210 mil iterações, salt aleatório; token de sessão enviado em cookie `HttpOnly; Secure; SameSite=Strict`, armazenado como hash no D1; limite básico de tentativas de login por nickname.
- E-mail opcional é armazenado como **não verificado**. Não pode ser usado para entregar conta até existir confirmação do endereço. Código de recuperação exibido uma única vez; hash salvo, porém fluxo de recuperação ainda não implementado.
- Tela `/conta/` para criar conta, entrar e sair, e exibir o código de recuperação. A criação ficará indisponível enquanto a migração D1 não for aplicada.
- **Ainda não migrar recordes antigos** nem permitir supor que o ranking global recreativo use contas; futura etapa deve ligar pontuações à sessão autenticada e impedir publicação anônima.
- Após CI e testes, orientar migração única no D1 Preview; não modificar produção.

## Pendências prioritárias
1. Confirmar novo deploy Cloudflare Pages **Preview** da branch `feat/fundacao-snake` e recuperar URL gerada; não inventar URL.
2. Validar Snake no navegador humano, especialmente tecla Esc, mobile, ranking local e conteúdo.
3. Futuro: métricas/rankings globais com Cloudflare, administração segura, revisão de privacidade/SEO/AdSense. Não antecipar implementação sem validar jogo piloto.

## Formato obrigatório ao finalizar uma etapa
**Feito:** ações concretas executadas.  
**Verificado:** CI, URLs ou testes confirmados (com link).  
**Pendente:** itens que realmente restam.  
**Próxima ação:** uma instrução operacional única para o usuário ou botão contextual "Continuar", nunca apenas "aguarde".

## Mensagem de retomada para novo chat
> Continue o OldArcade em `jeffersonfukner-hue/oldarcade`. Antes de agir, leia `AGENTS.md`, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e `docs/VERSIONAMENTO_E_PUBLICACAO.md` na branch `feat/fundacao-snake`; confira PR #1 e os GitHub Actions. Cloudflare Pages já publicou a página neutra na main e a opção Preview da branch feat/fundacao-snake está salva; verificar se o primeiro deploy Preview apareceu após o commit de documentação. Respeite a regra de não publicar nem mesclar sem autorização, execute trabalhos de GitHub antes de pedir próximo passo e oriente a interface uma ação por resposta.

## Placar, desempates e feedback (solicitado em 16/11/2026)
- O usuário confirmou: cada jogador ocupa posição individual no ranking, mesmo empatando pontuação; desempate por horário de conquista mais antigo, com instante do servidor e precisão em milissegundos; posição pessoal fora Top 10 é exibida separadamente.
- Registrar 10 primeiros e destaque visual 1º/2º/3º individuais (não agrupar empate numa mesma posição). Explicar a regra na UI.
- BUG relatado: placar do jogo exibia recorde zero apesar do recorde da lateral. Atualizar ambos simultaneamente, incluindo durante partida assim que ultrapassar recorde anterior; distinguir recorde pessoal do recorde global da comunidade.
- Animações de ultrapassagem do próprio recorde, conquista de liderança e demais melhorias são backlog posterior, não incluir nessa correção.
- Cadastro embutido no modal pós-partida, jogar sem login; somente contas registradas enviam ao ranking global.
- Migração `migrations/0004_player_records.sql` ainda depende de aplicação MANUAL no D1 Preview. Até lá endpoint de ranking novo não funcionará; não fingir disponibilidade nem mexer produção.

## Ajuste de cadastro (16/11/2026)
- Relato do usuário no Preview: nickname `Vovo do 3D` rejeitado por espaços; após removê-los, API respondeu genericamente que não conseguiu criar a conta.
- Alteração de regra autorizada: permitir espaços internos em nicknames (normalizar espaços consecutivos) e aceitar senhas com **mínimo de 8 caracteres**, mantendo máximo 128 e derivação criptográfica PBKDF2.
- Cadastro API passa a retornar código técnico resumido do estágio em erro (sem dados pessoais) e log de servidor para diagnosticar falha real. **Causa original do erro de cadastro não confirmada ainda.** Não alegar correção completa sem novo teste real no D1.

## Evolução visual e modos futuros (16/11/2026)
- No Snake, mostrar recorde pessoal e recorde global atual de **contas cadastradas** lado a lado no HUD; distinguir claramente da marca histórica anônima, armazenada na tabela legada.
- Renderizar +10 subindo e desaparecendo quando recolher fruta, sem mudar pontuação, velocidade ou regras.
- Backlog aprovado para avaliar após teste: celebrações distintas para superar recorde pessoal e global, frutas com pontuações/efeitos diferentes, níveis, dificuldades, obstáculos e modos alternativos. Manter um modo clássico idêntico à mecânica já aprovada, sem introduzir automaticamente as features em todos os modos.
- Relato visual: ranking vazio após mudança para tabela `player_game_records`. Recordes antigos continuam em `game_leaderboard`; exibir maior pontuação legada separadamente, sem atribuir identidade nem posição a uma conta.

## Correção crítica de cadastro: limite PBKDF2 Cloudflare (16/11/2026)
- Causa identificada na revisão do backend: `functions/api/_lib/auth.js` estava configurado com 210.000 iterações de PBKDF2, mas WebCrypto do Cloudflare Workers rejeita contagens superiores a 100.000 (`NotSupportedError`). O erro era absorvido pelo `catch` no registro e devolvido como erro genérico.
- Corrigido para 100.000 iterações, salt individual aleatório e senha jamais em texto puro. Testes automatizados cobrem cálculo determinístico. Confirmar registro real no Preview; não confundir CI verde com verificação D1 concluída.

## Regras live aprovadas (16/11/2026)
- Recordes legados não interessam mais para exibição nem consulta: permanecerão guardados em `game_leaderboard` sem migrar ou apagar por padrão.
- HUD durante a partida acompanha recorde pessoal e global de contas no D1. Conquistas são anunciadas **uma vez por limiar por partida**: "Recorde pessoal superado!" e "Recorde global ultrapassado!". O resultado do próprio jogador durante a partida é provisório; o recorde oficial só é persistido após o fim de partida com conta autenticada.
- Consulta do ranking a cada 10 segundos somente durante a partida e com aba visível (e na volta à aba), sem conexões persistentes nem custo de infraestrutura adicional conhecido. Se um terceiro registrar pontuação maior, avisar jogador em andamento e atualizar placar. Não prometer instantaneidade de WebSockets; existe latência de até ~10 s.
- Diferenças entre fonte D1 e recorde da partida: avisos temporários não representam confirmação ou verificação contra cheating. No futuro validar servidores e adversários para ranking competitivo.

- Complemento: detectar mudança na posição individual do jogador autenticado (rank piorou desde última consulta), avisando-o mesmo quando a liderança global permanece a mesma.

## Proteção da franquia gratuita (16/11/2026)
- O usuário apontou corretamente que consultas a cada 10 segundos podem esgotar a franquia gratuita de Workers/Pages Functions e leituras D1.
- Na fase piloto, limitar a **no máximo duas atualizações periódicas do ranking por partida**, com intervalo de 120 segundos em vez de 10 segundos. A retomada de aba compartilha o mesmo orçamento, sem consultas ilimitadas. Mantidas consulta inicial da página e gravação ao final do jogo.
- Portanto, não anunciar atualização instantânea: resultados de terceiros podem demorar a chegar ou só aparecer após nova partida. Para tempo real em escala, projetar cache compartilhado, push, controle de custos e monitoramento de limites ANTES de ativar polling rápido.

## Consulta somente no encerramento (16/11/2026)
- Decisão final substitui polling de 10s e 120s: nenhuma consulta periódica ou por troca de aba durante a partida. GET inicial para mostrar referência; ao terminar, um GET se anônimo ou POST se autenticado (POST já retorna ranking atual).
- Resumo no fim compara líder/pontuação e posição individual entre início e fim. Exibe nickname e tempo desde a conquista pelo horário do servidor D1, quando há dados suficientes. Não afirmar tempo exato em liderança sem histórico auditável.
- Se o jogador não estiver autenticado, mostra resultado da checagem no modal de cadastro. Fluxo precisa ser validado no Preview D1.

## Celebrações Snake — implementação seguinte à validação de `522b836` (16/11/2026)
- Conquista de recorde pessoal: brilho verde no tabuleiro/HUD, partículas verdes e mensagem existente de recorde pessoal. Conquista de meta global: brilho dourado mais forte e partículas douradas, mensagem de recorde global ultrapassado. Quando ambos coincidem, os dois efeitos são disparados, mantendo prioridade do aviso global.
- Efeitos são client-side, não alteram placar, registros ou consultas de Cloudflare; movimentos são suprimidos quando usuário seleciona `prefers-reduced-motion: reduce`; overlays não capturam toque/click.
- Reutilizar os gatilhos já existentes (somente ao ultrapassar valores, uma vez por limiar na rodada); limpar timers e partículas ao reiniciar.

## Pontuações decimais — desenvolvimento em 16/11/2026
- Aprovado pelo proprietário: até três casas decimais para todos os jogos, sem restrição de múltiplos no D1.
- Migração **0006_decimal_scores.sql preparada, NÃO EXECUTADA**: troca `best_score INTEGER` por `best_score_milli INTEGER` (milésimos exatos); copia registros existentes multiplicando por 1000; preserva jogador, modalidade, timestamp, PK, FK e índice. Aplicar somente em `oldarcade-stats-preview` após backup e conferência. Migração 0005 foi aplicada manualmente no Preview; não repetir.
- API de leaderboard reconhece esquema antigo e novo via PRAGMA, permitindo rankings inteiros existentes até executar 0006. No novo esquema converte milésimos em número decimal na resposta e usa milésimos para ordenação e empate. Até a migração, valores fracionários são recusados explicitamente; pontuações inteiras dos Snake continuam funcionais.
- Validação de entrada numérica até 3 casas e intervalo 0–4000 (limite provisório de API atual, revisar por jogo futuro); a pontuação segue autodeclarada pelo cliente, não é antifraude.
- Componente compartilhado `modeRanking.ts` recebe decimais; testes de contrato e migração atualizados.
- **Pendente:** conferir GitHub Actions e E2E, backup e execução manual 0006 no D1 Preview, validação de preservação e valores decimais no ambiente real. Não executar em produção nem publicar/merge sem autorização.
