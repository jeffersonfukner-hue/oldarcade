# Old Arcade — Plano aprovado de padronização e melhorias

> **Fonte de verdade para a ordem de execução.** Aprovado pelo proprietário em 19/11/2026. Novas sugestões entram no backlog, sem substituir etapas nem interromper a homologação atual. Consulte também `AGENTS.md`, `PADROES_GLOBAIS_DOS_JOGOS.md` e `CONTINUIDADE.md`. O estado de execução deve ser confirmado pelo HEAD/CI no GitHub, não presumido apenas desta página.

## Plano original — cinco etapas preservadas

| Etapa | Trabalho | Critério de aprovação | Estado conhecido em 19/11/2026 |
| --- | --- | --- | --- |
| **1 — Largura global** | Unificar containers, cabeçalho, conteúdo e rodapé | Mesma largura visual em todas as páginas | **Aprovada visualmente**: máximo 980px, com fullscreen independente |
| **2 — Estrutura editorial** | Padronizar ordem e presença das seções | Nenhuma seção comum esquecida | **Implementada, CI #1044 aprovado (246 passed; 50 skipped), aguardando homologação visual** do commit `2d07fe7` |
| **3 — Desempenho e rankings** | Compactar cards, retirar duplicações e melhorar navegação | Dados corretos, sem espaço desperdiçado | **Na fila**, incluindo exclusivamente contas autenticadas nos rankings e retirada segura do ranking local por nickname |
| **4 — Conteúdo e identidade** | Padronizar textos, fontes, filmes e Continue jogando | Conteúdo contextual, verdadeiro e consistente | **Na fila**, com SEO de história real, títulos/HTML semânticos e palavras relevantes em negrito moderado |
| **5 — Regressão** | Tipagem, build, API, Playwright, screenshots desktop/mobile | CI aprovado e homologação visual | **Na fila**, após as etapas anteriores |

**Subetapa adicional — 2B: breadcrumbs e navegação contextual.** Executar **após homologar a Etapa 2** e antes da Etapa 3. Criar um componente comum de trilhas acessíveis, usando caminhos reais e, quando apropriado e corretamente configurado, dados estruturados `BreadcrumbList`; não duplicar componentes entre jogos.

**Fila posterior de refinamento dos jogos (trabalho adicional, não substitui a Etapa 5):** HUD expansível de estatísticas em tempo real e totais por item/jogo; progressão de maçãs, peras e uvas no Snake com pontuações próprias a definir; sprites autorais aprimorados onde aplicável; fundo parallax e arte do Pixel Quest; **BUG-QUEST-05: recorde do Pixel Quest não registra**, reproduzir, diagnosticar e corrigir. Consultar os IDs e detalhes do backlog em `CONTINUIDADE.md`. Cada implementação posterior requer sua própria regressão e homologação; não considerar o bug resolvido apenas por constar da fila.

## História na tela — Pixel Quest e obras do gênero plataforma

**Decisão complementar do proprietário:** a seção cultural do Pixel Quest pode abordar filmes baseados em **outros jogos de plataforma** ou inspirados no universo de jogos desse estilo, e não apenas adaptações do próprio Pixel Quest. Pixel Quest é uma criação original; nunca apresentar filme de Mario ou Sonic como adaptação do Pixel Quest.

**Exemplos editoriais com relação verificada, ainda não cadastrados na interface:**
- *Super Mario Bros. — O Filme* (2023) — adaptação do universo Super Mario, confirmada por Nintendo e Illumination; candidato contextual à história de jogos de plataforma. Fonte: https://www.nintendo.co.jp/corporate/release/en/2023/230310.html
- *Sonic: O Filme* (2020) — adaptação da franquia de videogames Sonic da Sega. Fonte: https://www.sega.co.jp/en/release/220216_1.html
- *Detona Ralph* (2012) — filme original ambientado em mundos de arcade; **inspirado por videogames**, não adaptação de um jogo preexistente com o mesmo nome. Fonte contextual: https://investor.activision.com/node/20266

Na **Etapa 4**, verificar editorialmente a relevância de cada obra, disponibilidade legal no Brasil, forma de acesso, link funcional e data exata da consulta. Incluir relações claras (adaptação de outro jogo, inspiração no gênero, documentário etc.) e data de publicação/consulta no componente compartilhado `HistoricalScreenings.astro`, ampliando o tipo de dados para Pixel Quest. **Não inventar plataformas, afirmar disponibilidade atual sem verificar, exibir filmes sem relação real, preencher placeholders nem colocar links afiliados sem autorização.**

## Regras operacionais

- Cada etapa deve ser implementada, testada e homologada separadamente quando houver decisão visual do proprietário; novas ideias entram na fila.
- Manter os princípios de uma fonte compartilhada de componentes e de preservação de IDs, lógica dos jogos, contas, rankings e dados existentes.
- Os cinco números do plano original não devem ser renumerados nem trocados por uma ordem improvisada. O breadcrumb é **2B**; refinamentos constituem uma frente adicional separada.
- GitHub repo `jeffersonfukner-hue/oldarcade`, branch `feat/layout-unificado-snake-quest`, PR #4. **Sem merge nem deploy manual/produção sem autorização.** Commits podem disparar CI e Preview automático conforme configuração existente; confirmar revisão acessível no Preview.
