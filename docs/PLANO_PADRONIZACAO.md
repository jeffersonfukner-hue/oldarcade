# Old Arcade — Plano aprovado de padronização e melhorias

> **Fonte de verdade para a ordem de execução.** Aprovado pelo proprietário em 19/11/2026. Novas sugestões entram no backlog, sem substituir etapas nem interromper a homologação atual. Consulte também `AGENTS.md`, `PADROES_GLOBAIS_DOS_JOGOS.md` e `CONTINUIDADE.md`. O estado de execução deve ser confirmado pelo HEAD/CI no GitHub, não presumido apenas desta página.

## Plano original — cinco etapas preservadas

| Etapa | Trabalho | Critério de aprovação | Estado conhecido em 19/11/2026 |
| --- | --- | --- | --- |
| **1 — Largura global** | Unificar containers, cabeçalho, conteúdo e rodapé | Mesma largura visual em todas as páginas | **Aprovada visualmente**: máximo 980px, com fullscreen independente |
| **2 — Estrutura editorial** | Padronizar ordem e presença das seções | Nenhuma seção comum esquecida | **Homologada visualmente pelo proprietário em 19/11/2026**. Código-base `2d07fe7`, CI #1044 aprovado |
| **3 — Desempenho e rankings** | Compactar cards, retirar duplicações e melhorar navegação | Dados corretos, sem espaço desperdiçado | **Em execução**, auditoria e primeira implantação na branch, aguardando CI e aceite visual |
| **4 — Conteúdo e identidade** | Padronizar textos, fontes, filmes e Continue jogando | Conteúdo contextual, verdadeiro e consistente | **Na fila**, com SEO de história real, títulos/HTML semânticos e palavras relevantes em negrito moderado |
| **5 — Regressão** | Tipagem, build, API, Playwright, screenshots desktop/mobile | CI aprovado e homologação visual | **Na fila**, após as etapas anteriores |

**Subetapa adicional — 2B: breadcrumbs e navegação contextual.** **Homologada visualmente pelo proprietário e CI #1048 do commit `eb4512a` aprovado.** Um componente global de trilhas acessíveis usa URLs reais do catálogo para os sete modos e nomes estáticos para conta/rankings/páginas institucionais. Página inicial não tem breadcrumb. `BreadcrumbList` JSON-LD somente quando `SITE_URL` configurar domínio válido (fora disso, sem canonical nem JSON-LD de breadcrumbs). Largura mantém 980px, mobile de 320/390px. Testes Playwright obrigatórios e aprovação visual antes da Etapa 3.

**Fila posterior de refinamento dos jogos (trabalho adicional, não substitui a Etapa 5):** HUD expansível de estatísticas em tempo real e totais por item/jogo; progressão de maçãs, peras e uvas no Snake com pontuações próprias a definir; sprites autorais aprimorados onde aplicável; fundo parallax e arte do Pixel Quest; **BUG-QUEST-05: recorde do Pixel Quest não registra**, reproduzir, diagnosticar e corrigir. Consultar os IDs e detalhes do backlog em `CONTINUIDADE.md`. Cada implementação posterior requer sua própria regressão e homologação; não considerar o bug resolvido apenas por constar da fila.

## Etapa 3 — auditoria e implementação inicial (19/11/2026)

- **Etapa 2B aprovada visualmente** e CI #1048 do commit `eb4512a` concluído com sucesso. PR #4 aberta, sem merge nem deploy manual.
- **Autenticação verificada no código:** o POST de `functions/api/games/[game]/leaderboard.js` exige `currentPlayer` e rejeita visitantes com **401**. A classificação pública cruza `player_game_records` com `player_accounts`. Não modificar D1 nem afirmar validação antifraude — o servidor ainda devolve `verified:false`, pois não reconstrói a partida.
- **Organização do perfil:** um card externo por jogo usando `AccountGameStats.astro`, com linhas internas de cada modo e todos os atributos `data-account-*` preservados para consulta por modo. Snake e Tetris exibem métricas individuais; Pixel Quest aparece com aviso de ranking ainda indisponível, sem associar seus recordes privados à conta.
- **Remoção segura do ranking local por nickname:** Snake Clássico/Evolution deixam de mostrar classificação anônima ou guardar novas entradas no `saved.scores`. Históricos antigos continuam no `localStorage` e não são apagados. IDs e formulário legados ficam ocultos temporariamente, sem função competitiva.
- **Defeito de regra no ranking Sobrevivência:** o POST comparava **menor tempo** para todos os modos temporizados, apesar do Sobrevivência premiar **maior tempo**. Corrigido por `improvementOperator` para menor no Sprint e maior no Sobrevivência; testes unitários para todos os modos. Sem migração.
- **Validação necessária:** concluir CI do novo HEAD, inspecionar a tela Meu desempenho (320/390/desktop), ranking autenticado e dados ausentes. Seguir a revisão de rankings compactos, Top 3/Top 10 e duplicações antes da aprovação final da Etapa 3. A Etapa 4, a Etapa 5 e todos os refinamentos/bugs `RF-*` continuam na fila.

## Etapa 3 — estatísticas agrupadas por JOGO (nova decisão de 19/11/2026)

- **Regra de UX aprovada:** em “Minha conta → Meu desempenho” e em outras páginas com estatísticas de jogadores, **um card principal por jogo**, não um card independente para cada modalidade. Ex.: card **Snake** contém subseções Clássico, Aventura e Evolution; card **Tetris** contém Clássico, Sprint e Sobrevivência. Novos jogos/modos seguem automaticamente o catálogo, sem HTML duplicado.
- **Dentro do card:** resumo do jogo e detalhes por modalidade em abas acessíveis, linhas ou acordeões compactos, priorizando mobile. Preservar métricas específicas de cada modalidade, recorde pessoal, posição global, metas e botão jogar. Não combinar artificialmente pontuações, tempos ou rankings incompatíveis de modos diferentes.
- **Fonte atual verificada:** `src/pages/conta.astro` já usa `groups=Object.entries(gameRegistry)` e monta uma seção por jogo, mas `group.modes.map(...)` gera cada `<article class="account-record-card" data-account-record={id}>` como **card separado**. Reestruturar para **um card por jogo** contendo unidades internas por modo, preservando os atributos `data-account-record`, `data-account-best`, `data-account-rank`, `data-account-challenge`, `data-account-missions` e `data-account-play` usados pelo carregamento assíncrono.
- **Escopo:** executar junto da Etapa 3, não na 2B. Verificar também outros painéis de estatísticas e resultados para aplicar a mesma regra global. Persistência, ranking de contas, APIs e IDs não devem regredir. Cobrir 320/390/desktop, estado carregando/sem dados e autenticação.

## História na tela — Pixel Quest e obras do gênero plataforma

**Decisão complementar do proprietário:** a seção cultural do Pixel Quest pode abordar filmes baseados em **outros jogos de plataforma** ou inspirados no universo de jogos desse estilo, e não apenas adaptações do próprio Pixel Quest. Pixel Quest é uma criação original; nunca apresentar filme de Mario ou Sonic como adaptação do Pixel Quest.

**Exemplos editoriais com relação verificada, ainda não cadastrados na interface:**
- *Super Mario Bros. — O Filme* (2023) — adaptação do universo Super Mario, confirmada por Nintendo e Illumination; candidato contextual à história de jogos de plataforma. Fonte: https://www.nintendo.co.jp/corporate/release/en/2023/230310.html
- *Sonic: O Filme* (2020) — adaptação da franquia de videogames Sonic da Sega. Fonte: https://www.sega.co.jp/en/release/220216_1.html
- *Detona Ralph* (2012) — filme original ambientado em mundos de arcade; **inspirado por videogames**, não adaptação de um jogo preexistente com o mesmo nome. Fonte contextual: https://investor.activision.com/node/20266

Na **Etapa 4**, verificar editorialmente a relevância de cada obra, disponibilidade legal no Brasil, forma de acesso, link funcional e data exata da consulta. Incluir relações claras (adaptação de outro jogo, inspiração no gênero, documentário etc.) e data de publicação/consulta no componente compartilhado `HistoricalScreenings.astro`, ampliando o tipo de dados para Pixel Quest. **Não inventar plataformas, afirmar disponibilidade atual sem verificar, exibir filmes sem relação real, preencher placeholders nem colocar links afiliados sem autorização.**

## Refinamento futuro — seletor global de modos (proposta aguardando aprovação visual)

**Decisão de arquitetura:** a experiência de selecionar modalidades deve ser comum a todos os jogos, **inclusive Pixel Quest quando houver vários modos**. Não criar opções clicáveis de modalidades ainda inexistentes. As opções devem vir do catálogo `src/data/gameModes.js` (IDs, URLs, estado de disponibilidade, regras e nomes) e usar um componente reutilizável proposto `GameModeSwitcher.astro`.

**Composição visual proposta:** abaixo da apresentação do jogo e antes do palco, uma faixa compacta intitulada **Modo de jogo**, com guias de mesmo tamanho e destaque claro para a opção atual:
- Snake: **Clássico | Aventura | Evolution**.
- Tetris: **Clássico | Sprint | Sobrevivência**.
- Pixel Quest: **Aventura** (atual, sem guias falsas enquanto for o único modo) e, futuramente, modalidades adicionais. **Primeira ideia expressa pelo proprietário:** corrida com deslocamento automático do cenário/câmera, em que o jogador deve continuar avançando para não ficar para trás (um tipo de *auto-scroller/runner*). Outras variações serão estudadas e definidas antes de implementar, com objetivos, controles, regras, fases e rankings próprios. **Não declarar nomes ou mecânicas finais aprovados**.

**Segurança da troca:** na ausência de partida ativa, navegar diretamente. Se há partida **jogando, pausada ou em contagem regressiva**, interceptar a seleção de outro modo e abrir modal compartilhado acessível: “Trocar de modo? Sua partida atual será encerrada”. Ações: **Continuar nesta partida** (cancelar troca, preservar a partida; se estava pausada, manter pausada; se estava executando, voltar com 3–2–1) e **Sair e trocar de modo** (sair conscientemente, sem registrar partida incompleta como recorde). Se houver **Desafio Diário de tentativa única**, advertir explicitamente sobre perda da tentativa e não permitir reentrada indevida. Implementar somente com integração correta aos motores de estado dos jogos e testes desktop/mobile, teclado, toque e fluxo de foco/Esc.

**Diferença verificada no código atual:** Tetris usa `.tetris-mode-nav` com guias `aria-current="page"`; Snake usa links soltos e variáveis no `hero` (Aventura, Evolution e Clássico), por isso precisam ser substituídos pelo mesmo padrão. No Pixel Quest, a proposta vale para futuras modalidades sem exibir links inexistentes.

**Bug de recentralização ao retomar:** proprietário relata que, após pausar e rolar a página para ler o artigo, clicar em continuar não traz o tabuleiro de volta ao centro. Inspeção de `src/scripts/snake.ts` encontrou `pause()` → `beginCountdown()` no estado pausado, sem `centerGameBoard()`, embora `start()` centralize. O Snake Aventura e o Tetris já chamam centralização ao retomar; conferir também Quest. Registrar e reproduzir com teste “pausar → rolar para o artigo → retomar → tabuleiro visível centralizado antes do 3–2–1”, corrigindo pela rotina compartilhada, sem deslocar a página enquanto o usuário apenas lê.

**Fila:** esta é uma proposta de refinamento/navegação e um defeito reportado; **não substitui as etapas 1–5 nem a subetapa 2B**. A Etapa 2 permanece aguardando homologação visual. Nenhuma implementação de modos, modal ou correção de centralização foi feita neste registro documental.

## Regras operacionais

- Cada etapa deve ser implementada, testada e homologada separadamente quando houver decisão visual do proprietário; novas ideias entram na fila.
- Manter os princípios de uma fonte compartilhada de componentes e de preservação de IDs, lógica dos jogos, contas, rankings e dados existentes.
- Os cinco números do plano original não devem ser renumerados nem trocados por uma ordem improvisada. O breadcrumb é **2B**; refinamentos constituem uma frente adicional separada.
- GitHub repo `jeffersonfukner-hue/oldarcade`, branch `feat/layout-unificado-snake-quest`, PR #4. **Sem merge nem deploy manual/produção sem autorização.** Commits podem disparar CI e Preview automático conforme configuração existente; confirmar revisão acessível no Preview.
