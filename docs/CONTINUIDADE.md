
- Disparo Evolution alterado conforme decisão do proprietário: automático e contínuo enquanto power-up ativo (70 ticks, cadência 4 ticks ~0,5s na velocidade base); sem tecla X. Tiro atravessa corpo, para na primeira fruta comum/rara (+10/+50 sem crescimento) ou obstáculo (3 impactos para destruir, dano visual); poderes especiais e Salva-Cobra não são coletados por tiro. Somente Preview experimental. A cadência por ticks acompanha velocidade/slow; balanceamento e testes E2E ainda pendentes.
> **Contrato obrigatório para todo jogo/modo:** [PADROES_GLOBAIS_DOS_JOGOS.md](PADROES_GLOBAIS_DOS_JOGOS.md). Histórico abaixo não substitui os padrões globais vigentes.

# OldArcade — continuidade obrigatória

## Regra global de acesso sem sair da página — 18/11/2026
- **Decisão obrigatória do proprietário:** entrar ou cadastrar-se **nunca** deve redirecionar o jogador para Meu Perfil nem mudar rota/scroll/contexto atual; perfil é página de consulta acessada **apenas por escolha explícita**. Sair do site não requer passar por perfil. A autenticação deve abrir modal no próprio local, e ao concluir fechar modal e continuar exatamente onde estava.
- Implementado `src/components/GlobalAuthModal.astro` e `src/scripts/globalAuth.ts`, instalados uma vez no `src/layouts/Base.astro`. Reutilizam POST `/api/auth/login` e `/api/auth/register`; disparam `oldarcade:account-changed` para atualizar header, ranking, calendários e demais consumidores. Mostram código de recuperação quando cadastro retorna um; sem redirecionamento ou reinicialização do jogo. Links `data-auth-trigger` acionam modal com fallback `/conta/` para navegador sem JS.
- Menu global oferece **Entrar** (modal) enquanto visitante e oculta esse link ao conectar; **Minha conta** é link explícito para perfil. Calendário diário Snake/Tetris abre o mesmo modal quando visitante toca no dia de hoje, e CTA `Entrar ou criar conta` também o utiliza. Depois de entrar, o calendário atualiza elegibilidade na mesma rota. Minha Conta reage a `oldarcade:account-changed` se aberta intencionalmente.
- Calendário compartilhado `src/components/DailyCalendar.astro` redesenhado com cabeçalho arcade, mês, células com estados distinguíveis e maior contraste, legenda e CTA. Estilos `is:global` alcançam dias criados dinamicamente pelo script (Astro scoped CSS anterior não alcançava esses elementos, causando visual cinza de botões desabilitados).
- Testes E2E: `tests/global-auth-modal.spec.ts`, mais testes diários existentes. **Confirmar CI do HEAD e Preview** antes de marcar validado. Sem deploy de produção. Não pedir SQL 0008/0009 outra vez.

## Home arcade — organização e qualidade visual implementadas (2026-11-18)
- **Decisão do proprietário:** a prioridade é o resultado **dentro do site**, com organização e acabamento equivalente ao conceito apresentado, sem insistência em formato PNG versus SVG. Cards e menus precisam ser apresentáveis e consistentes com o perfil já aprovado.
- `src/pages/index.astro`: substituída abertura inchada por hero compacto com identidade arcade; contadores continuam em linha; mantido apenas um destaque rotativo de Desafio Diário; dois cards (Snake e Tetris), cada um com três modos derivados de `gameModes.js`; artes existentes continuam representando a mecânica de forma honesta; links de ranking, conta e história mantidos. Não inserir um card por modalidade.
- `src/styles/global.css`: Home remodelada com bordas e superfícies de `--oa-*` do design system global já usado em Minha Conta; navegação lateral com estado ativo legível; CTA diário dourado e marca de 24h; arte com overlay e letreiro por jogo; botões dos modos com ícone, rótulo e seta; estados hover/focus; layouts de desktop/tablet/celular e movimentos reduzidos. Não duplica a lógica da API.
- Testes legados ajustados para cabeçalhos atuais de Home e Conta; novos testes de catálogo e desafios permanecem. **CI/Preview precisam ser confirmados para HEAD; não declarar aprovação visual do proprietário.**
- GitHub branch `feat/tetris-jogo-002`, PR #2, sem merge nem publicação oficial. SQL 0008 e 0009 confirmados aplicados no Preview; nenhum SQL adicional desta mudança.

## Design System global e perfil estatístico — implementação concreta (17/11/2026)
- O proprietário constatou inconsistência visual entre cards, bordas e layouts em Home, Perfil e demais páginas; **regra aprovada é identidade visual única do site inteiro**, não desenhos pontuais. Documentação anterior já exigia componentes reutilizáveis, portanto executar, não reabrir discussão.
- Implementado em `src/styles/global.css`: tokens de superfícies, contornos, cores, cantos, sombras e cards compartilhados; aplicado a `.panel`, `.game-card`, `.home-game-card`, `.rankings-panel`, `.account-record-card`, `.account-kpi`, `.account-settings`, `.daily-history-entry`; botões coerentes, responsividade global.
- Reorganizado `src/pages/conta.astro` em **dashboard**: identidade do jogador, 3 KPIs (modalidades com recorde, lideranças #1, pódios Top 3), grupos Snake/Tetris de cards homogêneos, recorde pessoal e posição global em destaque, próximo desafio em texto curto, missões em detalhes recolhíveis, CTA por modo. Histórico diário preservado; preferências de e-mail ficam em seção posterior e distinta. Dados reais vêm de endpoints atuais; sem números inventados; KPIs zeram ao trocar sessão.
- Corrigidos testes legados da Home que exigiam um card por modalidade, incompatíveis com a decisão explícita de um card por título. Adicionado `tests/account-dashboard.spec.ts` para desktop e celular; **validar CI do HEAD, não declarar aprovado sem conclusão**.
- Arte raster premium ainda não foi efetivamente substituída no repositório; SVGs anteriores são provisórios. Não afirmar que a imagem gerada em conversa esteja no site. Sem merge ou publicação oficial.
- O trabalho foi realizado em commits da branch `feat/tetris-jogo-002`. O proprietário faz QA final como jogador, não teste fragmentado ou conferência de JSON. SQLs 0008/0009 já confirmados como aplicados no D1 Preview.

## Home consolidada, logo provisória e SQL 0009 confirmado (17/11/2026)
- O proprietário confirmou **SQL 0009 executado no D1 Preview**. Não solicitar novamente; registro baseado na confirmação do proprietário, não numa leitura direta do banco. SQL 0008 já havia sido confirmado. Produção não autorizada.
- Home anteriormente sobrecarregada com um card por modo: agora **um card por título**, Snake e Tetris, cada um com três links de modos obtidos do catálogo central `gameModes.js`. Arte vetorial original reutilizável em `public/images/snake-arcade.svg` e `tetris-arcade.svg`; responsividade em `src/styles/global.css`. Preservar header, atividades compactas, SEO verdadeiro, contadores e navegação.
- Novo `src/scripts/homeDaily.ts` monta **um destaque diário único** usando `DAILY_MODES` e respostas GET de `/api/daily/{game}`, sem POST nem gasto de tentativa na Home. Visitante vê convite gratuito; usuário autenticado só vê jogos ainda não iniciados naquele dia. Consumiu uma tentativa (started ou finished) → aquele jogo sai do destaque; usou ambos → nenhuma campanha do dia. Em visitas sucessivas, alterna entre jogos elegíveis via `sessionStorage`, sem repetir se há outra opção; se falhar consulta de algum jogo, não anuncia disponibilidade fictícia.
- Logo provisória OldArcade: `public/images/oldarcade-mark.svg`, adicionada no `src/layouts/Base.astro` (cabeçalho global) e CSS. Conceito de gabinete/controle arcade neon; pode ser trocada após validação visual do proprietário.
- E2E `tests/home-catalog-daily.spec.ts` cobre dois cards/seis modos, visitante, participante com um desafio consumido, participante com ambos consumidos e presença da nova marca. **CI/Preview da revisão final ainda devem ser verificados antes de declarar conclusão e pedir validação como jogador.**
- Commits da implementação na PR #2 sem merge, Lovable ou publicação de produção. Próxima ação técnica: conferir CI do HEAD e revisar quaisquer falhas, depois entregar um único fluxo de teste de jogador.

## Fluxo operacional definitivo — sem gargalos, proprietário participa quando necessário (17/11/2026)
- **Esclarecimento do proprietário:** não é proibido pedir novos SQLs, acessos, configurações, decisões ou outras intervenções. Pelo contrário: **pedir imediatamente quando a ação se tornar necessária**, com instruções objetivas; ele executa e o desenvolvimento continua. Não acumular dependências para o final nem interromper o avanço por formalidades.
- Diferenciar **intervenção operacional indispensável** (o proprietário atua na hora para destravar) de **testes técnicos fragmentados** (responsabilidade do agente; não terceirizar logs, JSONs, APIs, código, CI e depuração ao proprietário).
- Concluir interface, backend, integração, contratos globais, regressões e testes técnicos antes da **validação de experiência do jogador**, que o proprietário faz como usuário final com entrega consolidada. Caso exista bloqueio que só ele possa resolver, avisar assim que for identificado, não esperar a entrega.
- SQL 0008 do Desafio Diário Snake **já executado manualmente pelo proprietário no D1 Preview**, segundo sua confirmação. Não pedir de novo; somente validar funcionamento. Produção continua dependente de autorização separada.
- Esta regra está em `AGENTS.md` e prevalece sobre interpretações anteriores como "nenhum SQL adicional" ou "somente intervenção ao final". Sem merge ou publicação automática.

## Entrega integrada — Desafio Diário Tetris e preferências de e-mail (17/11/2026)
- **Solicitação:** disponibilizar Desafio Diário também no Tetris, não apenas Snake. Visitantes devem vê-lo e, ao tentar participar, receber explicação amigável: jogar é livre; conta gratuita é benefício para ranking, histórico e uma tentativa diária. Cadastro e perfil precisam permitir inserir e-mail opcional e selecionar separadamente avisos de recorde superado e novo desafio diário.
- **Tetris Diário preparado na branch `feat/tetris-jogo-002`:** `src/data/dailyChallenges.js` habilita `tetris` com mesma API/seed/calendário/histórico de Snake; `TetrisGame.astro` inclui calendário no Clássico e links nos modos Sprint/Sobrevivência; `src/scripts/tetris.ts` troca o embaralhamento por gerador determinístico somente na tentativa diária, exige confirmação do POST atômico antes de iniciar e grava resultado uma vez no endpoint diário, isolando-o dos recordes locais/globais do Tetris livre. `functions/api/daily/[game].js` valida limites de pontos de Tetris próprios. Uma tentativa abandonada não é reaberta. Não há ranking diário público, apenas histórico privado.
- **Convite para visitantes compartilhado:** `DailyCalendar.astro` e `dailyCalendar.ts` mostram benefícios; tocar/clicar no dia atual sem login abre aviso e acesso gratuito à conta. Reaproveitado pelo Snake e Tetris.
- **E-mail e preferências:** cadastro em `conta.astro`, formulário de ranking compartilhado e formulário inline do Snake; edição posterior no perfil via `/api/account/preferences` com sessão autenticada e verificação de origem. Preferências são independentes, sem enviar mensagens ainda. Mudança de e-mail invalida confirmação anterior; confirmação de e-mail e envio dependem de infraestrutura separada. **Não insinuar que avisos serão enviados imediatamente.**
- **SQL 0009 necessário no Preview:** arquivo `migrations/0009_daily_email_preferences.sql` com `ALTER TABLE player_accounts ADD COLUMN daily_email_opt_in ...`. SQL foi entregue ao proprietário durante a implementação; **aplicação confirmada pelo proprietário nesta conversa**. O SQL 0008 foi confirmado aplicado anteriormente. Sem executar SQL pelo agente; produção exige autorização distinta.
- **Testes adicionados:** `tests-api/email-preferences.test.mjs`, cobertura Tetris em `tests-api/daily-challenges.test.mjs`, `tests/tetris-daily.spec.ts`. Verificar GitHub Actions HEAD e corrigir eventuais falhas; CI verde e QA manual ainda não confirmados. Não convidar usuário a testes fragmentados: entregar Preview integrado ao jogador após correções.
- **Fluxo de continuidade:** SQL 0009 já foi aplicado segundo confirmação do proprietário; não pedir novamente; confirmar testes/Preview e seguir. Nenhum merge ou deploy de produção autorizado.

## ESTADO ATUAL PARA NOVO CHAT — SQL diário e validação (17/11/2026)
- **Migração 0008:** o proprietário confirmou "pronto" após receber o SQL integral de `migrations/0008_daily_challenges.sql` e executá-lo manualmente no Cloudflare D1 `oldarcade-stats-preview`. **Aplicação informada pelo proprietário; leitura/funcionamento real da tabela ainda não verificados por API.** Não executar novamente sem necessidade comprovada. Produção continua sem autorização.
- **Regra permanente de SQL aprovada:** enviar imediatamente o SQL fiel ao arquivo da branch sempre que chegar a etapa necessária, indicar banco e ambiente; proprietário cola/executa, responde "pronto" e então avançamos sem renegociar o procedimento. Agente não executa SQL por conta própria. Regra também registrada no `AGENTS.md`.
- **CI PR #2 HEAD antes deste registro:** revisão `90f6a4a`, Actions `44196695046` e `44196686578` falharam na etapa Playwright, apesar de tipos, build e API aprovados. 148 testes de navegador passaram, 4 falharam (texto capitalizado "Não é" no histórico Snake versus regex minúsculo; link "Sugerir uma correção sobre filmes ou plataformas" versus teste que busca nome curto exato/regex não contígua), 1 teste Snake Aventura instável. Essas falhas **não comprovam problema específico no diário**.
- **Preview do commit 90f6a4a comprovado pelo check Cloudflare:** `https://f89334a0.oldarcade-17c.pages.dev/jogos/snake/`; alias da branch `https://feat-tetris-jogo-002.oldarcade-17c.pages.dev/jogos/snake/`. Deploy não equivale a QA do desafio.
- **Próxima etapa:** validar consulta GET do calendário e histórico autenticado no Preview sem gastar tentativa; depois, em conta de teste e com ciência do proprietário, testar a reserva de uma tentativa única e o registro de seu encerramento. Corrigir as falhas de CI e reexecutar testes antes de aceite. Não mesclar/publicar nem executar SQL de produção.


## Desafio Diário — piloto Snake com login obrigatório (17/11/2026)
- **Pedido:** antes de publicar oficialmente e antes do jogo #003, criar componente global de Desafio Diário, primeiro Snake e depois Tetris. Calendário para cada dia, uma única tentativa por conta/jogo/dia, sem reabrir desafios jogados; somente dados históricos de desempenho no perfil. **Reforço expresso do proprietário:** desafio do dia SOMENTE LOGADO.
- Padrão de implementação: `src/data/dailyChallenges.js` (habilitação por jogo, data oficial `America/Sao_Paulo`, seed determinística com versão); `DailyCalendar.astro`/`dailyCalendar.ts` (calendário mensal, dias passados/futuros bloqueados, acesso público à consulta mas início somente logado); `DailyHistory.astro` em Minha Conta (somente participação e desempenho da conta autenticada). Snake Clássico mantém jogo livre separado.
- **Backend preparado; migração 0008 aplicada manualmente no D1 Preview segundo confirmação do proprietário (validação de API pendente):** `functions/api/daily/[game].js` exige sessão autenticada para POST, verifica origem, data de Brasília, usa INSERT atômico `ON CONFLICT DO NOTHING` por `(game,challenge_date,player_id)`, retorna seed e token aleatório para a única tentativa, conclui uma vez com token e mesma conta. `functions/api/daily/profile.js` devolve histórico privado, exigindo login. `migrations/0008_daily_challenges.sql` **arquivo criado e aplicação no D1 Preview informada em 17/11/2026**; produção requer autorização independente.
- Snake `src/scripts/snake.ts` utiliza o mesmo motor do Clássico, frutas determinísticas durante desafio, não salva score nos recordes locais/nuvem normais, consome tentativa apenas após POST confirmado; fim manda score/tempo exclusivamente à API diária, com reenvio de resultado pendente na sessão (nunca replay). Partidas normais continuam livres.
- Limitação conhecida de segurança: apenas validação estrutural de score e token na API; para leaderboard diário público/produção competitiva é necessário antifraude/verificação de replay ou modelo confiável antes de afirmar resultado auditado. **Neste piloto, resultados são históricos privados, não ranking diário público.**
- Testes adicionados `tests-api/daily-challenges.test.mjs` e `tests/daily-challenge.spec.ts`: login obrigatório, tentativa única e fim único, data do servidor, seed fixa, calendário, troca de usuário. CI do HEAD e QA visual continuam pendentes.
- **Próxima validação:** verificar API/calendário de Preview após confirmação de SQL 0008 aplicado manualmente; testar tentativa real apenas com usuário ciente de que é consumida. Tetris Diário ainda não implementado; só depois do Snake ser validado. Sem merge, produção, SQL adicional automático ou Lovable.

## Filmes históricos verificados e sugestões de correção (17/11/2026)
- Solicitação do proprietário: ao falar da história de um jogo, acrescentar filme/documentário **se existir**, onde assistir **no Brasil na data da publicação/consulta editorial** e aviso de que o catálogo pode mudar em anos; oferecer link para sugerir correções. **Afiliados e livros continuam apenas como implementação futura**.
- Verificado em 17/11/2026: `Tetris` (2023), dramatização sobre Henk Rogers e direitos do jogo, no **Apple TV brasileiro** (página oficial `https://tv.apple.com/br/movie/tetris/umc.cmc.4evmgcam356pzgxs2l7a18d7b`). `Man vs Snake: The Long and Twisted Tale of Nibbler` (2015) é sobre Nibbler, parente histórico da mecânica de cobra, **não** é história do Snake da Nokia; JustWatch Brasil indicou **Filmzie/Plex gratuitamente com anúncios** (`https://br.justwatch.com/br/filme/man-vs-snake`). Availability deve ser revisada na publicação posterior.
- Implementação reutilizável: `src/data/historicalScreenings.ts` guarda dados por jogo, fonte e datas fixas; `src/components/HistoricalScreenings.astro` apresenta obra, modalidade de acesso, data e aviso; `TetrisGame.astro` mostra em todos os três modos, `snake.astro` no clássico. `contato.astro` pré-preenche sugestões com assunto e jogo usando o contato/WhatsApp existente, sujeito à confirmação do usuário. Sem banco, cron nem envio automático.
- Regressão: `tests/historical-screenings.spec.ts` valida ambos os conteúdos, os três modos do Tetris, datas estáticas e navegação até o contato. CI e aprovação visual do Preview permanecem pendentes até confirmação. Sem merge/produção/D1/Lovable.


## BACKLOG — indicações culturais e links de afiliado nas histórias dos jogos (17/11/2026)
- **Status: implementação futura, não ativar agora.** Solicitação do proprietário para os textos de história/origem dos jogos, iniciando pelo Tetris e aplicável também a Snake e próximos jogos.
- Reservar no contrato editorial um **bloco reutilizável** de "Para conhecer mais" ou "Livros, filmes e documentários", alimentado por dados de cada título. Permitir livros para compra via links de afiliado; filmes/documentários com opções legítimas de aluguel, compra ou streaming, usando afiliação **somente quando o programa efetivamente existir e permitir esse destino**.
- Antes de implementar: pesquisar parceiros e condições vigentes, disponibilidade regional no Brasil, títulos e edições corretos, direitos de uso de capas/imagens, atualização de catálogos e manutenção de links. Não inventar títulos, ofertas, preços, disponibilidade ou links de afiliado.
- Mostrar claramente indicação editorial versus publicidade, sinalizar links que geram comissão e aplicar `rel="sponsored noopener noreferrer"` quando couber. Não comprometer navegação, SEO educativo, acessibilidade ou responsividade.
- **Nada de área vazia no Preview/produção:** o ponto de extensão fica documentado nos componentes históricos; só renderizar seção com indicações verificadas. Nenhuma conta/afiliação cadastrada, link comercial ou publicação autorizada nesta etapa.


## Tetris Sobrevivência #002 — terceiro modo (17/11/2026)
- Proprietário aprovou implementar **Sobrevivência após gostar do Sprint**, enquanto ele valida a correção global de sessão ao usar Voltar. Não há autorização de merge, produção ou D1/SQL.
- Nova URL em Preview: `/jogos/tetris/sobrevivencia/`, modo competitivo `tetris-survival`; não aumenta número de jogos (continua Tetris #002) nem altera versões editoriais aprovadas. Os três modos usam `src/components/TetrisGame.astro` e `src/scripts/tetris.ts`, mesmo tabuleiro, controles, contagem, relógio, pausa, reserva, fullscreen e HUD.
- **Mecânica:** toda onda começa em função do **tempo efetivo**, subindo a cada 30.000 ms. `src/data/tetrisRules.js` centraliza nível e gravidade para Clássico (por linhas), Sprint (fixa) e Sobrevivência (por tempo): 900 ms de início, fator 0,82 por onda, limite 70 ms; reforço de perigo visual a partir da onda 4. Pausas e contagem não acumulam tempo. Sobrevivência acaba quando a peça não consegue entrar/encaixar no tabuleiro. Linhas liberam espaço, mas **não são a métrica do ranking**.
- **Competição:** `gameModes.js` define `ranking:'survival'` e `speedIntervalMs:30000`; `rankingRules.js` suporta métricas de tempo com direções distintas; API de leaderboard já existente ordena e atualiza Sobrevivência por **maior duração**, enquanto Sprint continua por **menor duração** e Clássico por **pontos**. O resultado válido é o tempo efetivo inteiro em milissegundos, idêntico a `durationMs`, positivo; empate por registro mais antigo (sem inventar critério de linhas não persistido na D1). Nenhuma migração nem alteração em banco. Id separado garante recordes e contadores independentes.
- `GameRanking`, página geral de rankings, Minha Conta e compartilhamento recebem a métrica pelo catálogo, sem bifurcar componentes. Tela específica apresenta descrição real de Sobrevivência, destaque de perigo e três abas.
- Testes: `tests-api/tetris-survival.test.mjs` cobre comparação/ordenação ASC e DESC, validações e ondas; `tests/tetris-survival.spec.ts` cobre rota, navegação, HUD, pausa, recorde de partida encerrada e fullscreen ultrawide. Contratos de catálogo e SEO recebem novo modo.
- **Antes de declarar pronto:** acompanhar CI HEAD, revisar regressões e confirmação do Preview Cloudflare; teste visual e aprovação permanecem com proprietário. Sem Lovable, SQL/D1, merge ou produção.

## Sessão restaurada ao navegar Voltar — Sprint e todas as páginas (17/11/2026)
- Proprietário validou positivamente o Tetris Sprint, mas relatou: após entrar como outro usuário e pressionar Voltar, o navegador mostrava o nickname da conta anterior. Problema **global de autenticação/navegação**, não da mecânica Sprint.
- Causa: o navegador pode restaurar uma tela a partir do BFCache (Back/Forward Cache) sem rodar de novo o script de inicialização; `src/scripts/accountIdentity.ts` consultava `/api/auth/me` somente na primeira montagem. O `modeRanking.ts` também precisa receber a atualização para descartar recorde da conta anterior.
- Solução compartilhada: `accountIdentity.ts` agora trata `pageshow.persisted`, invalida imediatamente nome/recorde antigo via `oldarcade:account-changed`, refaz a consulta com `cache:'no-store'` e propaga a sessão corrente em novo evento de identidade. Controla versão de requisição para impedir que resposta antiga sobreponha a mais recente. `src/pages/conta.astro` consome `oldarcade:session-refreshed` para atualizar também o formulário/painel ao voltar; sem criar solução por jogo.
- Testes `tests/account-navigation.spec.ts`: simulam troca de Conta A→B ao voltar para Sprint e logout ao voltar para Minha conta, conferindo nickname, botão de conta e tempo do ranking. Teste preexistente `tests/tetris.spec.ts` corrigido para simular logout de verdade (a resposta mockada não pode continuar retornando Conta B).
- **Pendente:** verificar CI do HEAD e aprovação visual do proprietário no Preview. Nenhuma alteração em D1, produção, merge ou Lovable.


## Incidente de sessão — recorde local confundido com recorde de conta (17/11/2026)
- Proprietário identificou nos prints do **Tetris Clássico** (durante implementação de Sprint, sem relação causal com Sprint): ao trocar de conta no mesmo navegador, o HUD ainda mostrava 33.700 da sessão/dispositivo anterior, enquanto ranking da conta nova mostrava 3.400.
- Causa confirmada: `src/scripts/tetris.ts` usava `localStorage` (melhor pontuação **local**, de todo o dispositivo) como fonte do `tetris-best` rotulado indevidamente “Recorde pessoal”. O registro do servidor já era independente por usuário; era falha de apresentação, não prova de gravação cruzada no D1.
- Alterações: `tetris-best` passa a renderizar o `personal` retornado pelo evento compartilhado `oldarcade:mode-ranking-updated` do servidor (ou `—` sem marca autenticada), e `tetris-local-best` continua explicitamente identificado como “melhor ... local” (`fee7d0e9`, `d23a38b3`). `modeRanking.ts` invalida imediatamente o recorde anterior em `oldarcade:account-changed`, faz novo GET e impede resposta antiga de sobrescrever a sessão nova (`9b8a6c26`). O contrato passou a fornecer `personal:null` quando não há marca.
- Regressão `tests/tetris.spec.ts` simula trocar de Conta A 33.700 para Conta B 3.400 com cache local 33.700, depois sair da conta. Exige que o HUD mostre 3.400 e depois `—`, preservando 33.700 apenas no campo **local** (`f956a634`, `d5e3d8e0`). Não zerar cache local nem atribuir um recorde local a uma conta.
- Validação pendente: CI HEAD e visual do proprietário no Preview. Nenhum merge, produção, SQL/D1 ou Lovable. Sprint segue desenvolvimento separado; Sobrevivência ainda não iniciado.


## Tetris Sprint #002 — modo em validação (17/11/2026)
- **Aprovação de escopo:** implementar somente Sprint (40 linhas no menor tempo); validar visualmente antes de desenvolver Sobrevivência. Sobrevivência continua **pendente** e não deve ser implementada antecipadamente.
- Branch de Preview existente: `feat/tetris-jogo-002`, PR #2. Preservar Clássico `/jogos/tetris/`; novo Sprint `/jogos/tetris/sprint/` com modo competitivo `tetris-sprint`.
- Mecânica compartilhada: um único `src/components/TetrisGame.astro` + `src/scripts/tetris.ts` para os dois modos. O Sprint utiliza os mesmos blocos, reserva, ghost, animação do hard drop, countdown, controles desktop/mobile, tela cheia, efeitos e relógio efetivo; velocidade fixa, meta configurada no catálogo `targetLines:40`, tempo parando em pausas e transições; falha por tabuleiro lotado não dispara registro.
- **Ranking compartilhado ampliado:** `src/data/rankingRules.js` e `ranking:'time'` definem o menor resultado; API D1 de leaderboard existente usa ordenação `ASC` e comparação de UPDATE `<` para Sprint, mantendo `DESC` e `>` no Clássico; os valores de tempo são ms inteiros positivos e devem coincidir com `durationMs`. Mesma tabela, sem migração. `GameRanking`, `GameHud`, rankings gerais, conta e compartilhamento recebem a métrica declarativamente. Classificação exclusiva da conta e do ID `tetris-sprint`.
- SEO da rota, histórico editorial e contador globais por modalidade reutilizados. Tetris continua sendo jogo #002 (Sprint **não** soma outro título). Clássico mantém pontuação por linhas, sem alterações de regra.
- Cobertura: `tests-api/tetris-sprint.test.mjs` (critério, formato, API e validação); `tests/tetris-sprint.spec.ts` (página, navegação, teclado, pausa, ranking, não registrar tentativa incompleta e fullscreen ultrawide); contratos atualizados em `tests-api/game-modes.test.mjs` e `game-page-contract.test.mjs`. A verificação CI e Preview da última revisão deve ser checada antes de declarar sucesso. Validação visual é exclusiva do proprietário.
- **Restrições:** sem merge, deploy de produção, SQL/D1, Lovable ou créditos. Próxima ação: confirmar CI, passar link Preview Sprint para teste do proprietário, não iniciar Sobrevivência.


## PENDENTE — observabilidade e relatórios de produção (planejar depois)
- **Status:** backlog, não implementar agora. Solicitação do proprietário em 17/11/2026, inspirada no monitoramento do Chueire Imóveis e KitCasaPré.
- **Alertas críticos por e-mail:** avisar rapidamente sobre indisponibilidade de jogos/site, falhas de autenticação, erros em API/Cloudflare/D1 e impossibilidade de registrar resultados/rankings. Registrar contexto mínimo (momento, ambiente, jogo/fluxo, erro, frequência), agrupar repetições e evitar exposição de dados pessoais.
- **Relatório diário às 18h (America/Sao_Paulo):** resumo de visitas, partidas iniciadas/concluídas quando mensuráveis, jogos mais usados, recordes, falhas e saúde geral, diferenciando Preview de produção.
- **Arquitetura antes da implementação:** avaliar Cloudflare Workers/Cron Triggers, serviço de envio e verificação de saúde externa/independente; usar componente/serviço compartilhado, custo mínimo, controle de alertas e confirmação de entrega; definir destinatário, limites, política de retenção e critérios de severidade antes de ativar.
- **Critérios de aceite futuros:** testar falha simulada sem e-mail real no Preview; deduplicação, retry e relatório diário no fuso correto; monitoramento não deve depender exclusivamente do serviço afetado; somente ativar envio real e deploy de produção com autorização expressa.


## Tetris #002 — Space após Game Over e recorde autenticado não enviado (17/11/2026)
- **Evidência do proprietário no Preview:** com a conta conectada, após pressionar Espaço sucessivamente até Game Over, a partida recomeçou sem intenção. Screenshot mostrou **melhor local 33.700**, **recorde global 3.400** e **ranking da conta 3.400**. O número local por si só não comprova que uma partida de 33.700 foi gravada no servidor, pois é máximo persistido em `localStorage` e pode ter sido obtido sob regra antiga.
- **Causa confirmada no código:** `src/scripts/tetris.ts` executava `start()` ao receber `Space` em estado `over`; `src/scripts/modeRanking.ts` aguardava 6.500 ms **antes** de tentar `submit()`, e se `round` mudasse descartava o resultado antes do POST. Isso permite perda da marca mesmo logado.
- **Correções:** `7a378e82` separa submissão autenticada (imediata, sem atraso e não cancelada por rodada nova) da abertura do login anônimo (atraso visual preservado). Uma falha no POST mantém a opção de tentar novamente mesmo após reiniciar. Sincronização de sessão acompanha evento `oldarcade:account-changed`. `b4607fc9` reserva Space para queda durante jogo e retomada de pausa, nunca início automático após Game Over. `3760d3c9` remove o foco do botão ao começar a contagem, evitando ativação involuntária por Space nativo.
- **Regressão Playwright:** `6697f106`, `ed53f60e` simulam usuário autenticado, resultado de 33.700 com atraso visual 6.500 ms e nova partida imediatamente; exigem exatamente um POST válido e pontuação atualizada antes de 3s. `68b19fbb` joga até Game Over e verifica que Space repetido não reinicia a rodada. `560c5e94` adia **somente a celebração do pódio**, preservando a mensagem de Game Over de 4s mesmo que o servidor confirme a pontuação antes.
- **Validação pendente:** CI do HEAD, Cloudflare Preview atualizado e teste visual do proprietário. Não houve consultas ou alterações no D1, merge, deploy em produção ou Lovable. **Não reenviar automaticamente antigos recordes de `localStorage`**.


## Contrato global + checklist obrigatório — 17/11/2026
- O proprietário reiterou que **já havia aprovado** reutilização de componentes; não deve precisar repetir. Falha de processo do agente: editar páginas individualmente antes de consultar o modelo. A partir desta revisão, `AGENTS.md` aponta explicitamente para o checklist obrigatório, registrado em `docs/PADROES_GLOBAIS_DOS_JOGOS.md`.
- Contagem regressiva 3–2–1 corrigida na **fonte compartilhada**: `src/scripts/gameCountdownOverlay.ts` + `src/styles/global.css`; durante contagem ficam ocultos título, descrição e ação (incluindo botão `.btn` que ignorava `hidden`), permanecendo somente número animado. Consumidores integrados: Snake Clássico, Evolution, Aventura e Tetris, sem cópia do estilo entre jogos.
- Testes de regressão incluem contagem exclusiva no Tetris (`tests/tetris.spec.ts`) e verificação cruzada de Clássico/Evolution/Aventura (`tests/snake.spec.ts`, `562b5421`). **Conferir CI do HEAD e validação visual exclusiva do proprietário; não supor sucesso antes disso**.
- Qualquer mudança de padrão deve ser feita uma vez no componente global e propagada a todos os consumidores na mesma PR. Não houve merge, publicação em produção, SQL/D1 nem Lovable.


## Fullscreen global — arquitetura, não remendos (17/11/2026)
- Feedback do proprietário em monitor **ultrawide**: tela cheia de Tetris e Snake distorcia os tabuleiros/cortava controles. Orientação explícita: não criar correções isoladas por jogo; seguir componentes e padrões reutilizáveis.
- Diagnóstico: CSS global pressupunha Canvas quadrado em todo jogo, inclusive Tetris vertical. Regras de grid dependiam da largura total do monitor e havia regras especiais `#adventure-stage` e fullscreen do Snake/Tetris divergentes.
- **Solução compartilhada** em `src/styles/global.css` (`c8cdd839`, `78148acb`, `c9fcfc85`): contrato único `data-arcade-viewport`, `data-board-shape` e classes `oa-board-slot`/`oa-board-surface`. CSS define tamanho máximo e proporção nativa da superfície, restringe pela altura útil da viewport, centraliza área jogável e HUD e mantém controles visíveis. `square` = Snake (Clássico/Evolution/Aventura), `portrait` = Tetris (10×20). Novos jogos declaram a forma, sem reescrever fullscreen. As regras pontuais de fullscreen adicionadas em Tetris e Snake nesta sessão foram retiradas em favor do contrato único.
- Arquivos Astro dos quatro modos apenas marcam stage/slot/surface com atributos/classes; Tetris mantém estilos específicos somente para peças/próxima/reserva e sua composição. Padrão consolidado em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` (`5a1b8f2e`).
- E2E para `2560×900` adicionados no Tetris (`60ad723f`) e Snake Clássico/Evolution (`c058c88d`). **Evidência necessária:** CI do HEAD e validação visual exclusiva do proprietário em ultrawide, monitor normal e celular. Não afirmar resolução completa sem isso. Sem merge, produção, SQL, Lovable.


## Tetris #002 — pódio real, 4 linhas sem missão e temporização do game over (17/11/2026)
- Feedback visual do proprietário: ao eliminar quatro linhas, o Clássico exibia simultaneamente pontuação e “MISSÃO CUMPRIDA”, apesar de não haver missões; modal de registro aparecia cedo demais após efeito de Game Over; ao fazer login, pódio mostrava “TOP 3” mesmo para 2º colocado e efeito ficava atrás do botão “Jogar novamente”.
- `src/scripts/gameEvents.ts`: `recordGameFinish` aceita `{recordDelayMs}` opcional, preservando chamada compartilhada e comportamento padrão do Snake (`b6172d9c`, `72fa870d`).
- `src/scripts/tetris.ts`: retirada de `celebrate('mission')` para quatro linhas e mudança de nível; permanece o efeito global de pontos (`+800 · TETRIS! 4 linhas` no nível 1), HUD de nível e pontuação apenas por linhas. Término emite `oldarcade:game-finished` com `recordDelayMs:6500`, preservando celebração de derrota de 4s e tela de revanche antes do login. Commit `db632c35`.
- `src/scripts/modeRanking.ts`: atraso limitado e opt-in em `finishResult()`; Snake continua com atraso zero (`efb31b19`). Comemoração de pódio usa `data.mine.rank` (2º/3º), e é mostrada após fechar o modal, incluindo percurso com código de recuperação (`c8da982d`).
- `src/scripts/gameCelebration.ts` e `src/components/GamePage.astro`: card compartilhado exibe título específico de posição, medalha de prata para 2º; pódio e liderança ficam numa camada **fixa** de primeiro plano da viewport, independentemente do botão de revanche, scroll ou modal anterior (`a10689e6`, `5bc7c683`, `ae0033dd`). E2E de rank 2, atraso do modal e login de vice-líder: `tests/tetris.spec.ts` (`3ce2dfce`, `05c01c31`, `54c0c1f8`).
- Pendente: observar CI do HEAD, validar visualmente no Preview com proprietário e registrar evidências. Sem merge, produção, SQL, Lovable.


## Tetris #002 — queda suave e pontuação por linhas (17/11/2026)
- **Feedback do proprietário no Preview:** Espaço parecia teletransporte; placar subia a cada descida, contradizendo o objetivo de pontuar só por linhas; faltava efeito de pontos sobre o tabuleiro ao limpar linhas.
- **Causa comprovada no código anterior:** `drop(true)` chamava `award(steps*2)` para cada célula da queda instantânea e movia a peça em um `while` sem frames; `softDrop()` chamava `award(1)` por célula. Assim, movimentos geravam pontos sem linhas eliminadas.
- **Correção em `src/scripts/tetris.ts` (commit `6354fa26`):** Espaço faz animação de descida por `requestAnimationFrame` com interpolação acelerada de ~115–240ms; ao terminar, a peça trava na grade e dispara limpeza de linhas normalmente. Durante a animação, novos movimentos/rotações/reserva ficam bloqueados para evitar colisões indevidas, e pausa/troca de tela cheia/reinício cancelam a animação. `prefers-reduced-motion` mantém queda imediata. Movimentos, reserva, descida suave e queda rápida dão **zero pontos**; apenas `land()` após limpar 1/2/3/4 linhas pontua 100/300/500/800 vezes o nível. Cronômetro, ranking, HUD e contadores globais preservados.
- **Feedback visual reutilizável:** `src/scripts/scoreFeedback.ts` (commit `4d27030e`) usa a animação `.score-float` já existente no CSS global para mostrar `+N · X linha(s)` próximo da linha eliminada, sem overlay bloqueante ou duplicação de estilo.
- Explicações de pontuação e controles atualizadas em `src/pages/jogos/tetris.astro` (`ee230200`). E2E atualizado com verificação de animação via observação de atributo, ausência de pontos por movimento/queda e preservação de pausa/retomada (`0eef08a5`). Expectativa antiga com link ambíguo entre hero e card corrigida no teste (`11705da0`).
- **Próximo passo:** verificar CI do HEAD e entregar Preview da branch para validação **visual exclusiva do proprietário**, especialmente suavidade, popup de pontos e pontuação zero até a primeira linha. Sem merge, produção, SQL ou Lovable.


## Home — destaque automático do jogo novo (17/11/2026)
- Decisão permanente do proprietário: **o destaque principal da Home pertence sempre ao título mais novo**, não ao modo mais recém-criado. Seleção automática pelo maior `number` em `src/data/gameRegistry.ts`, sem fixar Snake/Tetris no hero. O nome, chamada, link e símbolo da novidade usam o catálogo; cards são ordenados com jogos novos primeiro. Snake e seus modos continuam disponíveis.
- Implementação na branch `feat/tetris-jogo-002`: `src/pages/index.astro` no commit `37a4d610`; E2E atualizados para novo destaque no `fcdb10aa` e `8bc22cc2`. Regra registrada em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` no commit `11681a78`.
- **Validação:** aguardar conclusão do CI do HEAD; confirmação visual é exclusiva do proprietário. Não houve merge, produção, SQL ou Lovable. A branch deve permanecer apta a Preview Cloudflare.


## Atualização de evidências — 17/11/2026 · Tetris #002 e ranking global
- No HEAD inicial `a3d30393`, CI #271 (`44107726974`) terminou com 107 passed / 2 failed / 1 skipped, CI #272 (`44107743814`) com 108 passed / 1 failed / 1 skipped. As falhas restantes são exclusivamente do teste `Tetris integra recorde global real sem misturar ranking do Snake`: o ranking retornou 120, mas o HUD `#tetris-global` permaneceu “—”, indicando condição de ordem entre scripts. Evidência: https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/44107743814
- Implementado contrato compartilhado `oldarcade:mode-ranking-request` em `src/scripts/modeRanking.ts` (commit `05537249`): emite o snapshot de ranking consultado para HUDs iniciados depois do GET, sem novo polling ou requisições. `src/scripts/tetris.ts` solicita snapshot após registrar listeners (`0b37ab8b`), preservando atualizações da API e sem copiar a lógica de ranking.
- CI #275/`44111255333` e #276/`44111267712` da alteração funcional `0b37ab8b`: tipos, build e API aprovados na verificação intermediária; Playwright ainda em andamento. **Não declarar sucesso até conclusão do HEAD.**
- Cloudflare Pages: PR #2 ainda **não** registrou comentário de deploy nem confirmação de Preview no momento da checagem. Não reutilizar link do Snake nem inferir alias da branch como URL validada. Validação visual segue exclusivamente com o proprietário.
- Restrições respeitadas: nenhuma alteração em `main`, merge, produção, D1/SQL ou Lovable. Próxima ação: confirmar conclusão do CI e localizar evidência oficial do deploy da branch antes de fornecer o link para teste visual.

## ESTADO ATUAL — Tetris jogo #002 (17/11/2026)
- Branch **`feat/tetris-jogo-002`**, derivada da integração Snake `feat/fundacao-snake` no commit `e46ac2c0`. Não alterar `main` nem publicar produção. Esta branch é Preview; qualquer alteração adicional no Snake segue seu fluxo original.
- Tetris registrado com **ID `tetris`**, título número **002**, versão de desenvolvimento `0.1.0-dev`, ranking independente e rota `/jogos/tetris/`. Registro em `src/data/gameRegistry.ts` e `src/data/gameModes.js`; jogos disponíveis = 2 títulos, modalidades não incrementam quantidade de jogos.
- Jogabilidade própria em `src/scripts/tetris.ts`: tabuleiro 10×20, sete peças e sorteio por pacote de sete, próxima peça, reserva limitada a uma troca por peça, sombra de queda, rotações com deslocamento junto às bordas, descida suave/instantânea, eliminação de 1–4 linhas, multiplicador por nível, velocidade progressiva e fim ao bloquear o topo. Estado salvo localmente para melhor pontuação e partidas; sem ativar banco ou SQL.
- Página `src/pages/jogos/tetris.astro`: usa **GamePage, GameHud, GameRanking e GameShare**. Contadores de visita/partida seguem `setupGlobalGameCounters` e `recordGameStart`; pontuação e fim usam `recordGameScore`/`recordGameFinish`, celebração global via `oldarcade:celebrate`. Contagem 3–2–1, pausa, cronômetro efetivo, fullscreen F/Esc, auto-pausa quando aba fica oculta, teclas e botões de celular; nenhuma cópia de ranking/celebração.
- Home atualizada para exibir Tetris com card próprio sem duplicar modos, total correto de jogos; ranking dedicado /rankings/ e conta já são derivados do catálogo. Textos SEO revisados.
- Testes `tests/tetris.spec.ts` incluídos para catálogo e SEO, componentes, teclado, queda, pausa/retomada, contadores e fullscreen; `tests-api/game-modes.test.mjs` atualizado para catálogo aberto a novos jogos (erro inicial de expectativa fixa de três modos foi identificado e corrigido); E2E Snake que fixava contagem em um título atualizado.
- **PR de desenvolvimento:** https://github.com/jeffersonfukner-hue/oldarcade/pull/2 (draft, base `feat/fundacao-snake`; não mesclar). O projeto de Preview da branch ainda não foi confirmado por comentário do bot Cloudflare.
- **CI — evidência de investigação:** workflows iniciais falharam por expectativa fixa de três modos no teste API (corrigida), contagem fixa de 1 título no E2E Snake (corrigida) e clique de saída de fullscreen Tetris interceptado pelo HUD (log #259: `game-hud intercepts pointer events`; corrigido com z-index do cabeçalho no commit `62912345`). A intermitência no E2E Aventura foi causada por comparação de `scrollY` apesar da centralização intencional; teste atualizado para verificar `preventDefault` da tecla Espaço (`2b9c4aaa`), sem mudar jogabilidade. **Reexecutar CI do HEAD.**
- **Integração adicional:** Tetris escuta eventos globais `oldarcade:mode-ranking-updated` e `oldarcade:mode-record-provisional` para manter o HUD de recorde global e o indicador provisório sincronizados (`a60b64d6`), com teste dedicado (`f8f9d306`).
- **Limitações de validação:** CI da nova branch deve ser verificado até conclusão; testes escritos e compilação não significam aceite final. **Validação visual é exclusivamente do proprietário** no Preview Cloudflare. Confirmar Preview da *nova branch* em vez de reaproveitar URL da branch Snake. Se Preview não existir, documentar bloqueio sem afirmar que está online.
- **Próximo passo:** verificar workflow e corrigir regressões; fornecer URL do Preview da branch para validação visual do proprietário. Sem merge, publicação, SQL ou Lovable.


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
