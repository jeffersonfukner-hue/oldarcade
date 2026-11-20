# OldArcade — padrões globais obrigatórios de jogos e modos

## REGRA OFICIAL — ranking para todos os jogos; visitantes veem líderes e convite final (19/11/2026)

- **Correção prioritária exigida na Etapa 3, ainda em homologação:** O Pixel Quest foi incorretamente marcado `competitive:false`, ficando ausente da página `/rankings/`, do perfil competitivo e do endpoint de leaderboard. A regra original do Old Arcade é **todos os jogos com classificação**, embora só fases/partidas elegíveis gerem pontos. Ativar `pixel-quest` no catálogo compartilhado e permitir GET público + POST autenticado pela API existente. Ranking Quest v1 = **maior pontuação da fase 1-1 concluída**, não somar campanhas futuras, não registrar derrotas como vitórias. Histórico local é preservado, e a API de ranking não apaga marca antiga.
- **Consultas SEM login obrigatórias:** Top 3, Top 10, líder e nomes dos recordistas são públicos para **todas as modalidades**, inclusive Quest, sem divulgar e-mails ou dados privados. O nome do visitante só aparece no ranking se ele criar/entrar em conta e registrar resultado elegível.
- **Convite final global:** ao terminar uma partida elegível, visitante vê resultado e chamada não bloqueante para **Criar conta / Já tenho conta / Ver líderes**. O convite usa o modal GLOBAL de autenticação e não impede replay, não substitui Game Over, nem deve aparecer para jogador autenticado. Login após resultado elegível pode enviar uma vez automaticamente a marca guardada em memória da aba; não prometer registro sem resposta positiva da API. Testes devem cobrir Snake (3 modos), Tetris (3 modos) e Quest (1).
- **Remover do ranking dentro do jogo:** formulário duplicado, modal próprio e botão “Tentar registrar novamente” e quaisquer CTAs de reenvio redundantes que não funcionem. Consultar ranking nunca deve depender de login. Manter card simples com pódio Top 3, Top 10 sob demanda, posição pessoal se houver, status real de disponibilidade. Não mexer no reenvio **do Desafio Diário de tentativa única**, que tem fluxo e proteções próprios.
- **Estado técnico:** mudanças preparadas na PR #4, aguardar o CI do commit novo e sua homologação visual. Não confundir com conclusão oficial da Etapa 3, nem executar Etapa 4/4B antes do aceite. Sem SQL, merge ou deploy manual. Avaliar futuramente autenticação e antifraude de placares (`verified:false`); não alegar que contas impedem pontuações manipuladas.
- **Backlog preservado:** bugs de recorde local do Quest, recentralização, novos sprites e modalidades, estatísticas expandidas, mídia, páginas institucionais, header, home e imagens continuam na fila. Não encurtar nem sobrepor este backlog.



## Ranking por jogo e navegação editorial (20/11/2026)
- Na página `/rankings/`, renderizar **um card externo por jogo competitivo** e expandir modos internamente, usando o mesmo catálogo de `/conta/`. Cada modo tem classificação independente; Top 3 visível quando aberto, Top 10 sob demanda. As páginas de jogo seguem o mesmo padrão de Top 3/Top 10. Fonte de apresentação reutilizável: `src/scripts/rankingPresentation.ts`.
- Dados do ranking vêm da API de contas; visitante joga mas não se classifica. Não repetir o líder em outro grande card se já aparece no pódio. Não reabrir dados legados do navegador.
- Fila futura SITE-* de header sticky, dropdown Jogos, categorias, home, versão, páginas legais e imagens em `docs/BACKLOG_SITE_UX_E_IMAGENS.md`; **não** implementar durante Etapa 3.


## Contrato técnico vigente — Etapa 3 (19/11/2026)

- Área `Minha conta → Meu desempenho`: **um card por jogo**, com os modos listados dentro. Cada modalidade mantém suas próprias métricas, escalas, ranking e atributos `data-account-record`, `data-account-best`, `data-account-rank`, `data-account-challenge`, `data-account-missions`, `data-account-play`. Pixel Quest não tem ranking global e não pode fingir recordes de conta.
- Classificação competitiva exige sessão de **conta autenticada no servidor**. Visitantes podem jogar e conservar marca privada; **nunca apresentar ranking por nickname solto em armazenamento local**. Dados legados de Snake permanecem intactos no navegador, mas o ranking antigo deixa de ser alimentado/exibido.
- `isLowerBetter` para direção: menor tempo somente em Sprint; **maior tempo em Sobrevivência**; demais jogos maior pontuação. O POST deve usar `improvementOperator`, não `isTimeRanking`, para decidir substituição.
- **Atenção:** sessão validada não significa partida validada; API responde `verified:false` e não prova legitimidade de pontuação. Não afirmar antifraude. Testes da etapa devem abranger autenticação, formatos de valores e mobile.
- Manter a ordem original das 5 etapas e status atualizado no início de `docs/CONTINUIDADE.md`, preservando backlog de refinamentos do usuário. CI e validação visual antecedem a Etapa 4.


## Padrão compartilhado — breadcrumbs e estatísticas por jogo (decisão 19/11/2026)
- **Etapa 2B:** trilhas de navegação renderizadas uma única vez no `src/layouts/Base.astro` por `GameBreadcrumbs.astro`, derivadas de `src/data/breadcrumbs.ts`/catálogo `gameModes.js`. Exibir `Início › Jogos › Tetris › Sprint` e `Início › Jogos › Snake › Aventura`; “Jogos” usa `/#destaques`, link real da home, pois não existe ainda uma página autônoma `/jogos/`. Os jogos base encerram a trilha em Snake/Tetris/Pixel Quest sem repetir o URL do modo Clássico. Em `/conta/`, `/rankings/`, `/sobre/`, `/contato/` e `/privacidade/`: `Início › página`. Home sem trilha. Atual sempre `aria-current="page"` e não clicável. Apenas configurar `BreadcrumbList` quando `Astro.site` tiver URL real, não em `example.invalid`. Respeitar 980px e a usabilidade de toque.
- **Etapa 3 futura:** na página de estatística/perfil, **um card por jogo com modalidades internas**. Não multiplicar card externo por modo, mas conservar métricas e classificações específicas, identificadores/atributos dos elementos dinâmicos, leitura no celular e privacidade/autenticação. Ver `docs/PLANO_PADRONIZACAO.md`.
- Etapa 2 visualmente homologada; Etapa 2B deve receber CI e homologação próprios antes da Etapa 3.


## Plano original preservado e cinema do gênero plataforma — atualização em 19/11/2026

- O **plano aprovado possui cinco etapas e não deve ser substituído por versões resumidas**: (1) Largura global; (2) Estrutura editorial; (3) Desempenho e rankings; (4) Conteúdo e identidade; (5) Regressão. A subetapa **2B (breadcrumbs)** foi acrescentada entre 2 e 3; refinamentos de jogos seguem como fila adicional. Fonte canônica com escopo, critérios de aceite e estado: [PLANO_PADRONIZACAO.md](PLANO_PADRONIZACAO.md).
- **Pixel Quest / História na tela:** o proprietário aprovou também filmes baseados em outros jogos do **gênero plataforma**, ou obras comprovadamente inspiradas por videogames dessa família. A relação é com o gênero/história do tipo de jogo, **não com Pixel Quest como adaptação cinematográfica**. Ex.: *Super Mario Bros. — O Filme* (2023) e *Sonic: O Filme* (2020) são adaptações de outras franquias; *Detona Ralph* (2012) é uma obra original inspirada em arcades. Fontes e critérios no plano. Adicionar a seção no **trabalho editorial da Etapa 4**, com verificação da disponibilidade no Brasil, data da consulta e fontes verificáveis. Não afirmar ausência de filmes relevantes ao Pixel Quest apenas porque não há uma adaptação do próprio título.
- Enquanto não incluídas na fonte editorial `historicalScreenings.ts`, essas obras **não estão implementadas na interface**. Não inventar onde assistir nem usar links comerciais/afiliados sem aprovação.
 
## Proposta pendente: seletor único de modos e troca segura (19/11/2026)

- Reutilizar futuramente `GameModeSwitcher` baseado em `src/data/gameModes.js`, substituindo abas isoladas do Tetris e links soltos do Snake. O contrato serve também para **Pixel Quest quando novas modalidades estiverem disponíveis**. Por enquanto, não mostrar opções desabilitadas ou inexistentes.
- Durante partida ativa, pausada ou contagem regressiva, trocar de modo exige aviso/modal global e confirmação explícita; cancelar preserva estado, sair encerra conscientemente, com alerta reforçado para desafio diário de tentativa única. Modal não substitui validação de tentativas e ranking na API.
- Pixel Quest: ideia futura de **corrida lateral com câmera avançando e jogador obrigado a acompanhar**, além de outras modalidades a estudar. Não inventar nomes/regras definitivos.
- A retomada de jogo depois de rolar a página deve recentralizar o tabuleiro por `centerGameBoard` antes do countdown, conforme regra já aprovada em `docs/ARQUITETURA.md`. Há omissão provável em Snake Clássico/Evolution; investigar e testar todos.
- **Status: proposta documentada, não implementada.** Ver `PLANO_PADRONIZACAO.md` e `CONTINUIDADE.md`; não pular homologação da Etapa 2 nem subetapa 2B.

## Etapa 2 aprovada — seções editoriais e amplitude do texto (19/11/2026)

- **Estrutura oficial única:** `src/components/GamePageSections.astro` organiza no HTML (nunca com CSS `order`) os slots `rankings → share → guide → history → screenings → related → development`, sempre **após o palco/área jogável e seu desempenho auxiliar**. Aplicável ao Snake Clássico/Evolution/Aventura, Tetris Clássico/Sprint/Sobrevivência e Pixel Quest. Diferenças justificadas devem ser declaradas como dados, sem fork de estrutura.
- **Seções presentes em todos:** classificação/estado factual, convite compartilhado, guia, artigo histórico, seção `Continue jogando` com links reais a outros jogos e histórico do desenvolvimento. O jogo só mostra `História na tela` quando há filme/documentário **verificavelmente relacionado ao jogo ou ao seu gênero/contexto histórico**; explicitar essa relação. Não exibir placeholder artificial. O Pixel Quest pode apresentar filmes sobre outras franquias de plataforma na Etapa 4, conforme plano. Para modo sem ranking, exibir a indisponibilidade verdadeira, sem inventar valores; rankings competitivos só com conta.
- **Artigo Snake único:** `SnakeHistory.astro` compartilha o artigo original entre os três modos, preservando textos, fontes e HTML real. `GameRelatedGames.astro` lista outros jogos a partir do catálogo, substituindo mensagens antigas de "mais clássicos estão a caminho". `GameCompetitionNotice.astro` explica recordes locais provisórios do Pixel Quest.
- **Parágrafos:** remover o limite artificial de `85ch` e os estilos que restringem artigos/editoriais a 870px dentro de cards com até 980px; parágrafos devem aproveitar **a largura interna disponível do card**, respeitando apenas o padding e o comportamento responsivo. No fullscreen, proporções e elementos jogáveis são independentes destes estilos.
- **Sem escopo funcional:** não modificar motores, IDs de scripts, pontuação, conta, ranking existente, banco, SEO factual, versão ou regras de jogabilidade nesta etapa. Os ajustes de ranking legados do Snake ficam na Etapa 3; SEO/negritos históricos na Etapa 4.

### Etapa adicional aprovada: navegação e breadcrumbs

- **Etapa 2B — Breadcrumbs e navegação contextual** após homologação visual da Etapa 2, antes da revisão final: trilha de navegação visível e acessível em todas as páginas aplicáveis (ex.: `Início › Jogos › Snake › Aventura`, `Início › Jogos › Tetris › Sprint`, `Início › Rankings`), com último item indicando página atual e links reais. Metadados `BreadcrumbList` JSON-LD apenas quando representarem a navegação visível; URL canônica absoluta somente com domínio público confirmado. Criar **um componente comum**, não breadcrumb hardcoded por página; home não precisa trilha. Garantir responsividade e evitar repetição excessiva de termos para SEO.
- **Outras melhorias do proprietário preservadas no backlog (não executar nesta etapa):** ranking e desempenho sem duplicação e com conta autenticada (Etapa 3); identidade editorial `Old Arcade`, artigos históricos úteis e indexáveis com negritos semânticos moderados, filmes/livros verificados e afiliados apenas quando autorizados (Etapa 4); navegação/links reais `Continue jogando`, controles e layouts compartilhados, histórico do desenvolvimento e padronização global. Não presumir que esta relação exaure sugestões anteriores não recuperadas; consultar `docs/CONTINUIDADE.md` ao retomar.

## Decisões globais aprovadas em 19/11/2026 — aplicação obrigatória

**Largura confortável:** 980px é o limite máximo do conteúdo regular **de todo o portal** (home, jogos/modos, conta, rankings, textos institucionais, cabeçalho e rodapé). Centralizar e usar largura fluida abaixo disso, com margens laterais seguras: 20px por lado no desktop/tablet e 12px em telas de até 580px. Fonte única `--oa-content-width` em `src/styles/global.css`, aplicada a `.shell` e `.oa-game-page`. Não usar 1160/1480px como largura de página. Cada stage do jogo mantém seu tamanho ideal: canvas quadrado Snake, vertical Tetris, 16:9 Pixel Quest; fullscreen continua expandindo com a viewport/altura disponível, nunca fixado em 980px.

**Rankings somente com conta:** jogar é livre, sem autenticação. **Somente quem cria e usa conta autenticada pode ter resultados em rankings competitivos** (independentemente do modo, incluindo o chamado local). O ranking local por nickname sem conta do Snake é legado e deve ser **retirado da interface de classificação na Etapa 3**, preservando dados pessoais/histórico e IDs dependentes até migração segura; NÃO criar rankings novos anônimos nem limpar históricos automaticamente. Recorde local privado no navegador não é classificação de jogadores. Regras, APIs, autenticação e migração de ranking permanecem fora do escopo da Etapa 1.

**SEO editorial:** artigos históricos completos e úteis são ativos de pesquisa orgânica, não elementos decorativos a remover ou encurtar. Preservar HTML visível/indexável, título/descrição específicos, H1 único, H2/H3 descritivos, links internos relevantes, fontes verificáveis e conteúdo original. Dar destaque semântico com `<strong>` a **termos, nomes, jogos, datas e conceitos historicamente relevantes**, com moderação e sem repetições artificiais ou promessas de posição no Google; negrito não garante ranking. Planejar revisão editorial na Etapa 4, não alterar artigos na Etapa 1.

**Contrato editorial unificado para páginas de jogos:** ordem final planejada após a largura (Etapas 2–4): (1) apresentação/modos, (2) palco/placar, (3) desempenho e ranking compacto, (4) compartilhar, (5) guia, (6) história do jogo ou gênero, (7) filmes/livros verificados **somente se houver itens reais**, incluindo obras de gênero relacionadas ao Pixel Quest e sem placeholders, (8) continue jogando com jogos disponíveis e links reais, (9) bastidores/histórico de desenvolvimento. Implementar por componentes globais; diferentes regras/contadores são dados de cada jogo, não justificativa para cópia da UI. Ranking inexistente exibe estado factual e nunca números fictícios.

**Sequência acordada:** Etapa 1 largura geral → Etapa 2 presença/ordem de seções → Etapa 3 desempenho/ranking e autenticação exclusiva → Etapa 4 conteúdo histórico/SEO, identidade e ligações entre jogos → Etapa 5 testes gerais e homologação. Subetapas exigem tipagem/build/API/Playwright e Preview manual para aceite. Não fazer merge nem deploy por iniciativa do agente; documentar resultados e pendências para o próximo chat.

> **Contrato permanente.** Ler antes de implementar ou modificar qualquer jogo ou modo. Aplica-se automaticamente; o proprietário não precisa repetir regras já aprovadas. Exceções exigem justificativa documentada e aceite. Complementa, sem substituir, AGENTS.md, docs/ARQUITETURA.md, docs/CONTINUIDADE.md e docs/VERSIONAMENTO_E_PUBLICACAO.md.

## Padrão editorial atual — onde assistir a filmes históricos

- Quando houver obra audiovisual **verificavelmente relacionada** a um jogo, incluir no artigo histórico via componente **único** `src/components/HistoricalScreenings.astro`, alimentado por `src/data/historicalScreenings.ts`. Separar história real, dramatização e obra apenas relacionada (ex.: `Man vs Snake` acompanha Nibbler, não a versão Nokia).
- Informar título, ano, tipo, relação histórica, país consultado, plataforma e forma de acesso (assinatura, aluguel, compra ou gratuito com anúncios), com endereço funcional de consulta/visualização e fonte de verificação. Não inventar disponibilidade.
- Fixar a data editorial/consulta em formato legível e `<time datetime>`; a disponibilidade é histórica, **não promessa em tempo real**. Na publicação efetiva do artigo, revalidar o catálogo e registrar a nova data; em futuras revisões, atualizar dados e cronologia, mantendo transparência.
- Sempre disponibilizar **Sugerir correção** para o contato global `/contato/`, preenchendo assunto e jogo sem enviar automaticamente. Não criar um formulário por jogo.
- O componente mostra obras verificadas, não espaços vazios; **sem links de afiliado por enquanto**. Afiliados para livros e audiovisual permanecem backlog independente.

## Padrão editorial futuro — livros, filmes e documentários

- As seções de **história do jogo** podem futuramente apresentar um bloco compartilhado de recomendações culturais, configurado por título (dados, nunca HTML/CSS comercial copiado em cada modo). O bloco é diferente do histórico de versões do OldArcade.
- Conteúdo potencial: livros para compra, filmes/documentários com aluguel, compra ou streaming; somente usar URL de afiliado se um programa oficial/parceiro permitir e houver adesão válida.
- Exigir verificação de obra, edição, plataforma, disponibilidade regional, direitos de imagens e destinação. Identificar publicidade/comissões sem disfarçar recomendações de conteúdo independente; atributos adequados para links patrocinados.
- **Ainda não implementado:** não exibir placeholders vazios nem inserir links de compra sem validação e autorização. A história do Tetris usa `src/components/TetrisHistory.astro` nos três modos; o padrão futuro deve ser reaproveitável também para Snake e os demais jogos.

## Critérios de qualidade de missões — pesquisa e decisão em 18/11/2026

Referências: guia oficial do Tetris Effect: Connected, que traz desafios de precisão (limpar linha em cada colocação) em vez de somente pontuar; Tetris 99, com missões que rendem tickets de personalização; pesquisas sobre design de jogos, que destacam objetivo claro, feedback imediato, desafio adequado e variedade procedural.
- Tetris Effect: https://tetriseffect.game/beginners-community-guide/
- Nintendo / Tetris 99: https://www.nintendo.com/us/store/products/tetris-99-switch/
- Revisão científica dos motivadores de games: https://ieeexplore.ieee.org/document/9173738
- Procedural content e frustração: https://cdn.aaai.org/ojs/12442/12442-52-15970-1-2-20201228.pdf

**Critério de aceite para chamar algo de Desafio Diário:**
1. Tem **verbo de ação específico** (ex.: fazer limpezas apenas de 4 linhas, obedecer ordem, fugir de inimigos), uma **restrição** e condição de vitória/derrota; "fazer mais pontos" sozinho NÃO é desafio.
2. A regra, a próxima ação necessária e o progresso aparecem **junto ao tabuleiro**, sem rolar a página; no Tetris, imediatamente abaixo de **LINHAS**.
3. Uma missão precisa terminar assim que for vencida ou perdida; não continuar indefinidamente com pontuação livre.
4. Deve ser verificável e reproduzível: seed, data, versão e regras concretas. Testes de unidade validam missões de 1000 datas, mas isso NÃO substitui testes de jogabilidade e equilíbrio.
5. Progressão perceptível com variedade de família e dificuldade calibrada; **uma missão diferente não significa missão boa**. Antes da publicação oficial, revisar metas impossíveis, frustrantes ou triviais e fazer QA humano no Preview.
6. Preview permite **laboratório de treino repetível**, sem registrar tentativa no D1, pontuação oficial ou criar ranking. Testar várias missões, ajustar prazer e dificuldade, somente depois aprovar modo diário definitivo.
7. Recompensa e antecipação são backlog (moeda virtual e cosméticos); não lançar monetização nesta etapa.

## Desafio Diário — contrato global aprovado e gerador permanente de missões

- **Exclusivo para jogadores autenticados:** visitante visualiza calendário e **objetivo da missão antes de entrar**, com convite que abre o modal global sem mudar de página/rolagem. A conta gratuita guarda histórico, vitória/derrota e permite participar; não habilitar tentativas por simples verificação no front-end.
- **Uma tentativa oficial por conta/jogo/dia** (`America/Sao_Paulo`), conferida e reservada pelo servidor com chave única; fechar/recarregar/abandonar não concede replay. Ao concluir, resultado e métricas ficam na mesma tentativa. Falha de gravação permite **somente reenviar o resultado pendente**, não iniciar outra partida.
- **Objetivo, vitória e derrota são fundamentais.** Uma partida Clássica com data e seed não basta para ser chamada de desafio. Exibir a meta e as condições antes de consumir a tentativa, status objetivo durante o jogo, progresso e resultado no calendário e em Minha Conta. Cada missão tem critérios explícitos e um fim controlado pelo motor.
- **Repetição após derrota — componente global:** Snake, Tetris e jogos futuros devem usar `src/scripts/dailyMissionReplay.ts` para oferecer **Tentar desafio novamente**, jamais iniciar jogo livre com painel de missão ativo. A tentativa oficial solicita novo token ao servidor para **a mesma data**; treino repete a mesma missão e seed sem D1. Resultado pendente exige reenvio, não nova partida. Vitória não permite repetição; iniciar jogo livre limpa a missão e seu tracker. Cobertura cruzada E2E obrigatória.\n- **Gerador permanente e determinístico:** `src/data/dailyChallenges.js` é a fonte única de definição das missões, metas, dificuldade, configuração de obstáculos e sequências. Mesma data/jogo/versão produz a mesma missão e seed para todos; famílias de desafios alternam e parâmetros variam automaticamente por 100, 500, 1.000+ dias. Não depende de inclusão manual diária. Não prometer missão matematicamente inédita todos os dias: tipos e metas podem eventualmente voltar a ocorrer.
- **Preservação histórica:** datas até 18/11/2026 são v1 (formato inicial sem meta de vitória), 19/11/2026 é v2, a partir de 20/11/2026 é v3. Nunca reescrever a implementação publicada de uma versão; toda mudança futura cria nova versão com data de início. Histórico/replay futuro deve usar versão da data, inclusive seeds e critérios originais.
- **Tetris Diário:** famílias atuais incluem eliminar linhas, metas de pontuação, sprint com tempo, limpezas de **exatamente quatro linhas** (1, 2 ou 3 encerram com derrota) e sequência obrigatória de limpezas (ex.: 1 → 4 → 3 → 3 → 2). Sequência e **próximo número ficam destacados ao lado do tabuleiro**; a API valida o histórico de limpezas enviado e registra a vitória/derrota. Missões devem preservar o controle e física real do jogo.
- **Snake Diário:** famílias atuais incluem caça de frutas, corrida contra o tempo, sobrevivência, labirinto com obstáculos e desafios com inimigos, obstáculos, frutas e prazo. Obstáculos/inimigos utilizam posições determinísticas e somente são habilitados no desafio apropriado, sem alterar o Snake Clássico livre; não criar jogos separados por missão.
- **Infraestrutura e segurança:** `DailyCalendar.astro`, `DailyHistory.astro`, `dailyCalendar.ts` e `dailyChallenges.js` são compartilhados entre jogos; cada motor só fornece progresso/mecânica. Histórico privado e sucesso da missão são consultados por conta autenticada; não misturar recordes do Clássico. Não promover classificação competitiva de missões como antifraude verificado enquanto o servidor não reproduzir/atestar a jogada.
- **Migrações:** proprietário confirmou execução manual da `0008` (tabela das tentativas) e `0010` (colunas de linhas/sucesso) no **D1 Preview**; `0009` também foi confirmada anteriormente. Não solicitar repetição sem evidência nova. Produção não autorizada, sem merge/publicação automática.
- **Futuro opcional:** desbloqueio de replay **recreativo** de desafios anteriores com moeda do site é backlog, não reabre a tentativa oficial nem modifica ranking; ver `docs/BACKLOG_MOEDA_ARCADE.md`.

## Piloto do HUD contextual compacto — Tetris (19/11/2026)
- A página do jogo tem duas camadas: `GameStageHeader.astro` (título + botões de pausa e fullscreen, com indicadores opcionais) e corpo com tabuleiro e barra contextual à direita. O cabeçalho mantém o mesmo limite horizontal do conjunto jogável, inclusive em tela cheia.
- `GameHud.astro` tem prop **`compact` opcional**. Ícones + valores substituem rótulos extensos; `title`/rótulos acessíveis preservam significado; IDs são mantidos para não afetar scripts. Padrão antigo continua disponível para Snake/Pixel Quest sem regressão.
- No Tetris Clássico, Sprint e Sobrevivência: Próxima, Reserva, Linhas, missão (se ativa) e placar compacto aparecem no **mesmo grupo lateral**, em vez de um HUD independente no canto oposto do card. O cronômetro é inserido pelo módulo comum, não duplicado.
- Testes de layout devem confirmar o cabeçalho e o HUD em todas as modalidades, sem perder canvas 10×20, pausa, fullscreen, contagem e ranking. Expandir este visual para Snake/Pixel Quest só após aceite visual do piloto no Preview manual.

## Contrato global de informação secundária — revisão 19/11/2026
- `GameGuide.astro` é a estrutura visual única para instruções; conteúdo permanece específico à mecânica.
- `GameDevelopmentHistory.astro` lê `gameRegistry.ts` (única fonte de versões, datas e marcos), sem histórico por cópia de HTML.
- `GameShare.astro` mostra ações essenciais diretamente e redes adicionais apenas após expandir, sem remover destinos.
- Placar de partida e recorde ficam no HUD. Estatísticas secundárias aparecem em painéis `.oa-performance-panel`; identificadores antigos necessários a scripts podem permanecer ocultos em `.oa-metric-bridge` sem criar contadores duplicados.
- Ranking distingue global (conta, não verificado contra partida) de local (navegador); manter tabelas e botões de registro acessíveis.
- Seções editoriais ocupam os mesmos limites do palco, mas parágrafos mantêm extensão confortável por linha. O formato do tabuleiro de cada jogo nunca deve ser distorcido para preencher espaço.

## Checklist obrigatório — mudanças globais e prevenção de regressão

**Regra de manutenção:** qualquer comportamento, aparência, animação, texto recorrente ou interação declarada como **padrão** pertence a um único componente, módulo, token ou contrato compartilhado. Alterações nesse padrão propagam-se automaticamente a **todos os jogos/modos existentes e futuros**, sem copiar código ou CSS entre páginas. A única configuração por jogo são seus dados e diferenças reais de mecânica, explicitamente documentadas.

Antes de modificar qualquer tela ou jogo, preencher e verificar mentalmente este checklist; quando houver PR, registrar os itens aplicáveis em sua descrição/continuidade:

- [ ] **Consultar modelo aprovado:** ler `AGENTS.md`, `docs/PADROES_GLOBAIS_DOS_JOGOS.md`, `docs/ARQUITETURA.md`, `docs/CONTINUIDADE.md` e o componente atual. Identificar o comportamento validado pelo proprietário antes de implementar.
- [ ] **Classificar:** a mudança pertence ao **padrão global** (ex.: cor, tipografia, botões, modal, countdown, recordes, fullscreen, celebrações) ou à **mecânica exclusiva** de um jogo? Não presumir exceção.
- [ ] **Mapear consumidores:** localizar todos os jogos, modos e páginas que usam o componente (inclusive Clássico, Evolution, Aventura e Tetris). Registrar quem será afetado, sem depender de lista manual fixa para o futuro.
- [ ] **Alterar uma única fonte de verdade:** modificar componente/estilo/serviço compartilhado. Se uma regra duplicada estiver impedindo a propagação, removê-la e integrar seu consumidor ao padrão; evitar CSS por ID, forks e soluções locais.
- [ ] **Propagar imediatamente:** todos os consumidores do padrão devem usar a implementação atualizada **na mesma PR**. Se existirem 100 jogos, os 100 recebem automaticamente a mudança pelo componente comum, sem tarefa de migração manual por jogo.
- [ ] **Preservar diferenças legítimas:** dimensões do tabuleiro, controles próprios, pontuação e regras competitivas são parâmetros/dados declarativos, não motivo para duplicar o componente.
- [ ] **Cobrir com testes cruzados:** testar o caso alterado em pelo menos um representante de cada variante real e garantir que os demais consumidores continuam ligados ao componente. Incluir desktop/mobile, acessibilidade e fullscreen quando aplicável.
- [ ] **Comparar Preview com padrão aprovado:** CI verde comprova automação, não substitui validação visual do proprietário. Verificar estados inicial, execução, pausa, retomada, fim e ranking para mudanças de fluxo.
- [ ] **Documentar evidências e continuidade:** atualizar o contrato quando aprimorado, registrar arquivos/commits/testes/pendências na PR, sem criar versões ou alegar publicação sem evidência. Merge e produção permanecem exclusivos do proprietário.

**Exemplo vinculante:** mudar a cor da fonte da contagem regressiva significa editar seu estilo global uma vez; não criar regras próprias para Snake, Tetris ou novos títulos. A contagem 3–2–1 mostra **somente a animação/número** durante início, retomada e transições, com botões/títulos/explicações ocultos pelo componente compartilhado.

## 1. Identificação, catálogo e versões
- Cada **jogo** possui ID estável, número sequencial fixo, data de criação, versão individual e histórico imutável em `src/data/gameRegistry.ts`.
- **Modos** são variantes do mesmo título; não aumentam a contagem de jogos disponíveis. Podem ter IDs competitivos e recordes próprios.
- **Destaque principal da Home** = sempre o título com o maior número sequencial (`number`) no `gameRegistry`; o link, nome, símbolo, chamada e primeira posição dos cards vêm automaticamente do catálogo, nunca de jogo fixo no HTML. Todos os títulos anteriores continuam acessíveis. Modos novos de um título antigo não substituem o destaque do jogo mais recente.
- Versão do portal e versão do jogo são independentes; não aumentar por commit/CI. Exibir histórico discreto e expansível, distinguindo desenvolvimento de publicação.
- Preservar regras do Clássico ao evoluir Aventura/Desafio; não misturar pontuações nem regras.

## 2. Contadores — contrato de todos os jogos/modos
- **Jogos disponíveis** = títulos efetivos no catálogo, sem duplicar modos.
- **Visitas ao site** = uma visita por sessão do navegador, em qualquer página; não significa pessoas únicas ou pageviews.
- **Total de partidas** = soma de TODOS os eventos de início real de partida de TODOS os jogos e modos, inclusive anônimos. Nunca filtrar por título ou modalidade.
- **Visitas por jogo/modo** = uma visita por sessão por identificador, com token idempotente. Partida = início de uma nova rodada, não pausa, retomada, troca de tela cheia ou mudança de nível.
- Usar `recordGameStart(game)` e `recordGlobalPlay(game,eventId)` em `src/scripts/gameEvents.ts`, com um ID de evento único por início; os IDs permitidos são tipados e devem ser ampliados quando surgir novo jogo/modo.
- O Clássico usa `setupGlobalGameCounters` para mostrar seus próprios números, mas registra o início pelo mesmo contrato. O Aventura registra pelo mesmo contrato sem depender da Home.
- `/api/site/stats` agrega eventos `game_events` por `kind='play'` de todos os identificadores diferentes de `site`; a Home não registra partidas, apenas consulta totais. Não criar números fictícios ou zerar D1 em falha.
- Cloudflare D1 Preview é a fonte global; validar origem, formato, UUID e idempotência. Não confundir isso com proteção antifraude.
- Qualquer novo jogo/modo **deve** passar por teste que prove que uma partida aumenta o agregado do portal em 1 e pausa/retomada não aumenta.

## 3. Ranking e recordes por modo competitivo
- Top 10 por conta, pódio Top 3, uma melhor marca por conta, desempate cronológico em milissegundos do servidor, posição individual e recordes pessoal/global no HUD.
- **Critério competitivo declarativo por modo:** o catálogo (`src/data/gameModes.js`) identifica pontuação maior como padrão ou `ranking:'time'` para menor tempo, mantendo o mesmo `GameRanking`, página geral, conta, compartilhamento e endpoint D1. `src/data/rankingRules.js` formata valores e compara marcas; a API ordena e atualiza o melhor registro pelo sentido configurado. Modos podem usar `ranking:'time'` (menor tempo, Sprint) ou `ranking:'survival'` (maior tempo, Sobrevivência); a unidade dos dois é milissegundos inteiros e a apresentação é a mesma, sem alterar o banco. Tempos Sprint são milissegundos inteiros positivos, apresentados como `m:ss.mmm`. Empates de tempo preservam a marca mais antiga. Tentativas que não cumprem objetivo explícito **não podem disparar evento de registro competitivo**. Não inverter valores ou criar outro ranking isolado.
- Liderança provisória ao ultrapassar meta global conhecida; efeito dourado, efeito verde para recorde pessoal; confirmar oficialmente só pela resposta do servidor ao encerrar. Empates respeitam conquista anterior.
- Cadastro/login opcional no pós-jogo; visitantes jogam livremente. Ranking de cada modo isolado por ID; componentes `GameRanking.astro`/`GameShare.astro` e API compartilhada de leaderboard, sem tabela duplicada.
- GET de ranking na entrada; GET final anônimo ou POST final autenticado, sem polling durante partida. Não afirmar pontuação verificada quando é autodeclarada; prever antifraude antes de competição pública.
- `/rankings/` apresenta cada modalidade competitiva com líder, Top 3, Top 10 expansível, horário e desafio. Conta mostra melhores resultados próprios, sem expor dados alheios.

### Layout compartilhado dos jogos (revisão de 19/11/2026 — aguardando aceite visual)
- Todos os modos Snake (Clássico, Aventura, Evolution), os três Tetris e Pixel Quest usam `GameLayout.astro`. O contrato estrutural `.oa-game-layout` em `src/styles/global.css` coloca **jogo primeiro em largura plena** e **painel secundário abaixo**, não concorrendo com a largura do canvas.
- Dentro do stage, `.arcade-game-layout` controla o **HUD à direita** no desktop e **compacto acima** do tabuleiro no mobile; textos editoriais, estatísticas secundárias e histórico permanecem abaixo. Não reconstruir a estrutura por jogo, não duplicar mudanças de grid em CSS local.
- Os formatos são parâmetros `data-board-shape="square|portrait|landscape"`; dimensões específicas pertencem ao contrato global (`--oa-board-aspect`, `--oa-board-max`, `--oa-slot-max`). Tetris conserva controles/peças/reserva/área de missão como elementos próprios, sem alterar suas regras.
- Ferramenta de comemorações no Preview disponível apenas com parâmetro de URL `?celebration-lab=1`, para não ocupar a tela normal do jogador. Desafio Diário segue suspenso; não alterar mecânica, ranking, registro de partidas nem versões ao migrar layout.
- Validar teclado, touch, desktop 1440/1024 e mobile 390/320, tela cheia e saída, carregamento, recordes e não regressão. O CI não representa aceite visual; deploy de Preview exclusivamente manual pelo proprietário.

## 4. UX, HUD e partida
- Jogabilidade em primeiro lugar; HUD legível em janela e tela cheia com estado, pontos e recordes. Botão e tecla `F` para fullscreen, `Esc` para sair; pausa por Espaço quando aplicável.
- Countdown visível 3–2–1 em **toda** nova partida, retomada e transição de fullscreen; preservar posição, pontuação e efeitos ao pausar.
- Usar `centerGameBoard` de `src/scripts/gameViewport.ts` ao começar, retomar e sair da tela cheia. Não duplicar scroll/centralização.
- **Layout de tela cheia é compartilhado:** cada stage declara `data-arcade-viewport` e `data-board-shape="square|portrait"`; a área recebe `oa-board-slot`, a superfície real recebe `oa-board-surface`. `src/styles/global.css` define o único contrato de dimensionamento, sempre pela proporção nativa e altura útil da janela, inclusive ultrawide. Nunca adicionar remendos de fullscreen por ID de jogo; novos jogos somente declaram a forma ou parâmetros. HUD, controles e progressos devem permanecer visíveis sem esticar Canvas.
- Pausar automaticamente quando a aba fica oculta; reinício limpa efeitos e timers da rodada anterior. Respeitar `prefers-reduced-motion`.
- Adaptar mecânicas ao jogo; não copiar regras específicas do Snake para outros gêneros.

## 5. Mobile e acessibilidade
- Responsividade, HUD e botões acessíveis. Testar desktop 1440/1024 e mobile 390/320, incluindo aparelho real.
- Onde houver tabuleiro gestual: swipe horizontal/vertical com limiar, impedir scroll só na área jogável, preservar scroll externo e zoom por pinça; `touch-action: manipulation` para reduzir zoom por toque duplo.
- Validar teclado, toque, fullscreen/Esc, troca de aba, game over, reinício, persistência, contraste e textos acessíveis. Emulação Chromium não comprova Safari iOS.

## 6. Identidade, privacidade e compartilhamento
- Jogar sem conta. Nickname autenticado sincronizado no header/sidebar via `accountIdentity.ts`; nickname local não prova identidade. Não expor e-mail, senha, cookie ou ID nos convites.
- Compartilhar via `GameShare.astro`: Web Share, WhatsApp, Telegram, Facebook, X, Reddit, Bluesky e copiar. URL do ambiente atual e pontuação real somente após encerramento, sem alegar recorde oficial.
- E-mail de conta opcional, recuperação protegida; não habilitar rastreamento, indicações rastreáveis ou AdSense sem projeto/consentimento/aprovação próprios.

## 7. Site, SEO e conteúdo
- Home compacta com **Jogos disponíveis / Visitas ao site / Total de partidas**, links reais para modos e rankings, nickname correto e sem métricas inventadas.
- HTML pesquisável e honesto, metadados exclusivos, conteúdo educativo real e histórico com fontes. Sem jogos protegidos sem licença; não indexar Preview indevidamente.
- Layout responsivo e componentes reutilizáveis; não reinventar HUD, ranking, contadores, compartilhamento ou viewport para cada jogo.

## 8. Checklist de aceite obrigatório por jogo/modo
- [ ] ID de título/modo e catálogo corretos, sem duplicar jogo disponível
- [ ] Início de partida registrado uma vez pelo contrato compartilhado, inclusive anônimo
- [ ] Total da Home agrega todos os modos; visitas deduplicadas; API indisponível não gera números falsos
- [ ] Pausa, retomada, fullscreen, níveis e reload não geram partidas extras
- [ ] Ranking separado, Top 10/Top 3, recordes e confirmação final, quando competitivo
- [ ] HUD, 3–2–1, centralização, teclado, toque, mobile e acessibilidade
- [ ] Compartilhamento correto, conta opcional, privacidade e SEO
- [ ] Testes de API, build, tipos, E2E desktop/mobile e validação visual humana no Cloudflare Preview
- [ ] Documentação e histórico atualizados após aceite; sem merge/publicação sem autorização

## 9. Fluxo de trabalho
GitHub branch/PR → testes GitHub Actions → Cloudflare Preview → validação visual pelo proprietário → aprovação expressa para eventual merge/publicação. **Nunca Lovable, créditos, domínio ou produção sem autorização.** Informar o que foi feito, comprovado, pendente e uma próxima ação. Se o contexto se esgotar, atualizar `docs/CONTINUIDADE.md` antes de retomar.

## 10. Notas de auditoria
- Em 16/11/2026, foi identificado registro de partidas diferente entre Clássico e Aventura; a refatoração passa a usar `gameEvents.ts`.
- Trechos antigos de `CONTINUIDADE.md` e `ARQUITETURA.md` descrevem protótipos já superados (três níveis, gelo +10, ranking indisponível). São históricos, não especificação vigente; regras atuais devem ser verificadas no código e registradas após validação.
- A API de partidas usa allowlist explícita: incluir novo modo antes de lançá-lo. O agregado do portal é independente dessa lista e soma todos os eventos válidos.

## Regra global de armazenamento de pontuações (16/11/2026)
- A tabela D1 compartilhada de recordes deve aceitar pontuações inteiras e decimais não negativas, sem `score % 5`, `score % 10` ou outra regra de incremento de um jogo no esquema SQL. Usar representação decimal exata (valor escalonado inteiro ou decimal canônico com ordenação numérica comprovada), com precisão/escala e limites definidos por modalidade; não usar `REAL` sem análise de precisão e ordenação.
- O jogo define como a pontuação é calculada; a API do modo valida a entrada e seus limites. Não confundir armazenamento genérico com a validação de cada modalidade.
- A restrição de múltiplos de 10 na migração 0004 e sua substituição por múltiplos de 5 na 0005 são dívida técnica identificada. A migração 0005 já foi executada manualmente no D1 Preview: não reaplicá-la. Preparar uma migração subsequente, após backup, para suportar decimais exatos e retirar a regra de múltiplos do banco, preservando dados, chave, FK, ordenação e índice; adaptar API, apresentação e testes antes de executar. Não aplicar em produção sem aprovação.

## 9. Painel universal do jogador (obrigatório)
- `/conta/` deve construir automaticamente os grupos de jogos a partir de `gameRegistry.ts` e suas modalidades competitivas de `gameModes.js`; é proibido fixar Snake, Tetris ou qualquer outro título no componente de perfil.
- Para cada modalidade cadastrada, consultar o leaderboard autenticado e mostrar a melhor pontuação e posição da sessão, ou `Sem recorde` quando não houver registro; indisponibilidade não é zero.
- Agrupar modalidades pelo título, sem contá-las como jogos separados. Jogos novos entram na conta sem alterar o código da página, desde que registrem título, modalidade competitiva e utilizem a API compartilhada de recordes.
- Não afirmar total de partidas por jogador, jogos visitados ou tempo jogado sem eventos autenticados específicos: os contadores atuais são agregados por sessão/modo e não demonstram histórico pessoal de interação.
- Limpar resultados na saída e ignorar respostas de requisições anteriores à troca de conta. Não divulgar dados de outros jogadores como se fossem pessoais.

## 10. Missões pessoais contextuais (sem premiação fictícia)
- Cada modalidade competitiva do painel `/conta/` oferece missões calculadas exclusivamente do leaderboard autenticado: primeira pontuação, superar a própria marca, buscar Top 3 ou defender liderança.
- O alvo do Top 3 pode mostrar a pontuação do terceiro colocado quando a API a fornecer; é uma referência atual, não garantia de posição ou recompensa.
- Missões são sugestões de próximo desafio, não conquistas persistidas ou tarefas com recompensa; nunca afirmar missão concluída sem evento individual comprovado.
- Na ausência de dados, mostrar indisponibilidade, não pontuação zero. Não exigir alterações por jogo na página de conta.

## 11. Celebrações globais e revanche
- O componente global de celebração pertence a `GamePage.astro` e responde ao evento `oldarcade:celebrate`; mensagens curtas, visuais vibrantes, sem bloquear a partida e respeitando movimento reduzido.
- Recorde pessoal pode ser celebrado durante a rodada; liderança e pódio só após confirmação da API. Não afirmar liderança duradoura nem segundos específicos sem evidência temporal.
- Quando uma liderança provisória não se confirma porque há um rival à frente, mostrar convite provocativo para revanche com ação direta de jogar novamente. Não fabricar notificações de ultrapassagem em tempo real: a consulta ocorre no encerramento.

## 12. Simulador de celebrações no Preview
- O painel `celebration-test-panel` é exibido exclusivamente em subdomínios de Preview `*.oldarcade-17c.pages.dev`, nunca no domínio principal de Pages nem em domínio personalizado.
- Os cinco botões disparam o evento visual `oldarcade:celebrate` usado pelos jogos; não chamam APIs nem escrevem em D1. Não representam conquistas reais.
- Validar em desktop e mobile, incluindo redução de movimento, botão de revanche e fechamento com Escape.

## 13. Backlog futuro — configurações de jogos pelo painel administrativo (não implementar agora)
- Criar área administrativa autenticada, com permissões e trilha de auditoria, para configurar cada jogo e modalidade sem editar código: parâmetros de pontuação e metas, textos de incentivo/provocação, tipos de celebração, animações, duração e intensidade dos efeitos.
- Separar configurações globais reutilizáveis de ajustes específicos por jogo/modo; preservar os padrões e permitir exceções explícitas.
- Validar dados e limites no servidor, versionar alterações, oferecer prévia/teste antes de ativar e opção de restaurar padrões. Mudanças de regras de pontuação que afetem comparabilidade exigem política de versionamento e rankings históricos.
- Não permitir que o painel injete scripts arbitrários; animações e mensagens devem usar opções seguras pré-definidas. Acesso restrito a administradores autorizados.
- **Somente planejamento:** não criar telas, endpoints, tabelas ou migrações nesta etapa. Retomar quando o proprietário autorizar a implementação administrativa.

## 14. Celebrações durante a partida — não bloquear jogabilidade (aprovado em 16/11/2026)
- Recorde pessoal, missão, pódio e liderança: avisos compactos, semitransparentes, com partículas discretas, próximos à parte superior da viewport. Nunca colocar fundo escuro de tela inteira, capturar cliques/toques ou exigir botão Continuar enquanto a partida estiver rodando.
- Somente a provocação de revanche após resultado final pode usar destaque/modal interativo com botão Jogar novamente. Manter a distinção entre aviso durante partida e encerramento.
- Validar em Clássico e Aventura, incluindo mobile e tela cheia; não interromper o loop do jogo nem ocultar o tabuleiro.

## 15. Comemoração arcade aprovada — efeito breve no centro do tabuleiro
- Para conquistas durante a partida, mostrar uma única animação global dentro do tabuleiro: texto surge pequeno e apagado, cresce, chega a aproximadamente 50% de opacidade e some em ~1,35 s, com estrelas/partículas discretas. Sem cartão, modal, backdrop, clique ou botão de continuar; o loop do jogo permanece ativo.
- Remover avisos redundantes por modalidade (no Clássico, não emitir também `record-live-alert` para recorde pessoal). Manter o efeito de partículas já existente, evitando sobreposição de mensagens.
- Revanche após o fim da partida continua sendo um caso separado, com CTA interativo.

## 16. Proposta em avaliação — evolução progressiva do Snake Clássico (16/11/2026)
- Ideia do proprietário: manter fruta comum sempre presente (+10 pontos), adicionar frutas especiais com pontuação maior e tempo de permanência limitado, incentivando decisão entre rota segura e recompensa arriscada.
- Introduzir power-ups temporários (reduzir velocidade, encurtar cobra, disparar para destruir obstáculos ou coletar frutas à distância), obstáculos progressivos e recompensas conforme pontuação. Evitar geração sobre cobra, colisões inevitáveis e metas inalcançáveis.
- **Proposta inicial ainda não aprovada para implementação:** 0–90 pontos: tradicional; 100–290: frutas +30; 300–590: frutas +50 e desaceleração; 600–990: obstáculos e encurtamento; 1000–1490: frutas +100 e disparos; 1500+: desafio escalável. Frutas especiais expiram em ~5–8 s, a calibrar com velocidade e distância.
- **Decisão pendente:** como preservar o significado de “Clássico” e a comparabilidade dos rankings existentes ao introduzir regras e pontuações novas. Considerar modo próprio ou versão competitiva distinta antes de alterar a jogabilidade atual. Nenhuma mudança de mecânica autorizada neste registro.

### Refinamento solicitado pelo proprietário — 16/11/2026 (substitui marcos lineares anteriores)
- Frutas comuns (+10 pontos inicialmente) devem continuar surgindo periodicamente **mesmo que as anteriores não tenham sido consumidas**; múltiplas frutas coexistem no tabuleiro. Definir limite de itens simultâneos e regras de posicionamento para preservar células livres e jogabilidade.
- Coletar mais frutas comuns acelera o crescimento da cobra: risco/recompensa é uma decisão do jogador, não só da velocidade do jogo.
- Frutas especiais de redução de comprimento compensam o crescimento; balancear quantidade de segmentos removidos, tamanho mínimo da cobra, raridade e eventual pontuação.
- Progressão de desbloqueios com marcos aproximadamente geométricos, não intervalos fixos de 200–300 pontos. **Exemplo provisório**: 0, 100, 250, 600, 1500, 4000, 10000+ pontos; desbloqueios: múltiplas frutas, bônus temporários, encurtamento, obstáculos, outros power-ups, disparos e combinações avançadas. Esses números NÃO foram aprovados nem implementados.
- A frequência de spawn, limite de frutas simultâneas, crescimento, temporizadores e dificuldade devem ser calibrados por fase, com salvaguardas para não tornar o tabuleiro impossível. Diferenciar progressão exponencial de marcos de aumento desenfreado de dificuldade.
- A decisão de manter a evolução no Clássico ou criar modo separado, e o versionamento dos rankings, continuam pendentes. Não alterar a mecânica sem essa decisão.

### Regra confirmada pelo proprietário — fruta de encolhimento (16/11/2026)
- Ao coletar fruta de encolhimento, a cobra fica menor **e a pontuação atual da partida diminui**: sobrevivência em troca de pontos. Não é bônus gratuito.
- Valores propostos para calibragem (ainda não aprovados): reduzir 3 segmentos e descontar 30 pontos, respeitando comprimento mínimo de 3 e pontuação mínima zero. Recordes históricos registrados nunca são apagados por essa penalidade.
- Esta confirmação não autoriza implementação imediata nem resolve a decisão de modo/ranking pendente.

### Regra de elegibilidade — fruta de encolhimento (16/11/2026)
- **Confirmado pelo proprietário:** a fruta de encolhimento só pode surgir se a pontuação atual da partida for de **no mínimo 30 pontos**. A condição usa a pontuação atual, não o recorde histórico ou a maior pontuação atingida na partida.
- Salvaguarda proposta, ainda não confirmada: se a pontuação cair abaixo de 30 enquanto a fruta estiver no tabuleiro, remover a fruta. Manter custo exato e quantidade de segmentos como parâmetros pendentes de balanceamento.

### Refinamento conceitual — fruta de emergência (16/11/2026)
- O proprietário sugeriu que a fruta de encolhimento apareça **somente quando a situação estiver perigosa**, e não por spawn comum aleatório. A elegibilidade mínima de 30 pontos permanece.
- Proposta técnica para posterior aprovação: indicador de perigo considera comprimento relativo ao espaço livre, obstáculos, acessibilidade e rotas de fuga a partir da cabeça. Se o perigo estiver alto, oferecer temporariamente fruta de emergência em posição alcançável; coletá-la sacrifica pontos em troca de encurtamento. Evitar garantia automática de sobrevivência ou aparição em posição impossível.
- Nome provisório sugerido: “Salva-Cobra”. Limiares de perigo, duração e frequência ainda precisam de balanceamento. Não implementar antes da decisão sobre modo e rankings.

### Provocações visuais da fruta de emergência — aprovado conceitualmente (16/11/2026)
- Quando a fruta de emergência “Salva-Cobra” surgir em situação crítica, apresentar uma frase divertida em estilo de celebração arcade/Candy Crush, no centro do tabuleiro: cresce, brilha/pisca brevemente, tem partículas discretas e desaparece automaticamente sem interromper controles ou o jogo.
- Frase favorita do proprietário: **“Tá apertando, campeão? Sacrifica uns pontinhos aí!”**. Outras candidatas: “Essa cobra tá precisando de uma dieta!”, “30 pontinhos ou a vida? Escolhe!”, “Coragem, campeão! Ainda dá pra escapar!”. Evitar repetição imediata e excesso de avisos simultâneos.
- Mensagem deve ser visualmente discreta/translúcida conforme o padrão de animação aprovado; não confundir com modal nem exigir clique. A mecânica de emergência continua apenas planejada, sem autorização de implementação neste registro.

## 17. Padrão global — Motor de Personalidade Arcade (aprovado conceitualmente em 16/11/2026)
- **Aplicável a todos os jogos e modos**, conforme gênero, tema, mecânicas e identidade de cada jogo. Reutilizar infraestrutura de eventos e efeitos, **não** as mesmas mensagens em todos os jogos.
- Eventos possíveis conforme pertinência: recorde, liderança, missão, perigo, power-up, recuperação, derrota, revanche e outros marcos específicos. Não exigir que todo jogo implemente todos os eventos.
- Cada jogo define catálogo próprio de mensagens, humor, ícones, cores, partículas, sons opcionais, duração e gatilhos contextuais. Exemplos: Snake “Tá apertando, campeão?” ao oferecer Salva-Cobra; corrida “Segura esse volante!” em situação de perigo. Exemplos de corrida são ilustrativos, **não autorizam criar outro jogo**.
- Efeitos durante a partida: texto breve central, crescimento e desaparecimento, transparência e partículas discretas, sem modal, botão, backdrop, captura de toque ou pausa. Mensagens de resultado final podem ter tratamento separado.
- Evitar mensagens repetitivas ou simultâneas: prioridade entre eventos, intervalo mínimo (cooldown), variação de frases, cancelamento de mensagens obsoletas e preferência por eventos relevantes. Respeitar movimento reduzido e acessibilidade.
- Evolução futura: parametrização por jogo/modo no painel administrativo previsto na seção 13, com prévia, auditoria e controle de versões. **Somente diretriz registrada agora; não implementar motor nem novos jogos sem aprovação.**

## 18. Piloto autorizado de progressão (sem contaminar ranking)
- Snake Evolution em teste opt-in na URL do Clássico com `?evolution=1`, apenas host de Preview. Frutas comuns coexistentes; frutas raras temporizadas; progressão geométrica provisória; encolhimento com custo 30 pontos e 3 segmentos, somente quando perigo e pontuação >=30; obstáculos, lentidão e disparos X. Valores provisórios até validação de jogo.
- Modo experimental não envia score, partida ou recorde a API/armazenamento competitivo. Não alterar ranking legado, versão oficial ou produção até decisão sobre modo próprio e política de versionamento.

### Disparo automático (decisão do proprietário, piloto Evolution)
- Enquanto power-up ativo, cobra dispara indiscriminadamente para frente, sem tecla/botão. Cadência inicial de 4 ticks (~0,5 s em velocidade base), duração 70 ticks (~10 s na velocidade base), sujeita ao ritmo de jogo.
- Fruta comum/rara: 1 tiro, concede pontos sem crescer. Obstáculo: 3 tiros para destruir; exibir dano progressivo. Projétil atravessa corpo da cobra e desaparece na borda; não aciona outros power-ups nem Salva-Cobra.
- Ajustar equilíbrio após teste real; não afetar ranking oficial.

### Bordas progressivas — piloto Evolution
- Começa sem paredes: atravessar a borda teletransporta para a borda oposta, mantendo direção.
- Trechos de parede surgem gradualmente nas quatro bordas; colidir ao tentar atravessar um trecho ativo encerra a partida. Cada trecho resiste a 3 tiros, desaparece temporariamente e regenera depois de 90 ticks.
- Obstáculos internos não regeneram: destruídos após 3 tiros, substituídos periodicamente por novos em posições livres, com teto de 8.
- Teste acelerado temporário (`EVOLUTION_FAST_TEST=true`): todas as melhorias destravadas entre 0 e 100 pontos; depois restaurar `false` mediante solicitação do proprietário.
