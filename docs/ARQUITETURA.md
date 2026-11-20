> **Contrato obrigatório para todo jogo/modo:** [PADROES_GLOBAIS_DOS_JOGOS.md](PADROES_GLOBAIS_DOS_JOGOS.md). Histórico abaixo não substitui os padrões globais vigentes.

# OldArcade · Arquitetura e critérios de aceite

## Etapa 2 aprovada — seções editoriais e amplitude do texto (19/11/2026)

- **Estrutura oficial única:** `src/components/GamePageSections.astro` organiza no HTML (nunca com CSS `order`) os slots `rankings → share → guide → history → screenings → related → development`, sempre **após o palco/área jogável e seu desempenho auxiliar**. Aplicável ao Snake Clássico/Evolution/Aventura, Tetris Clássico/Sprint/Sobrevivência e Pixel Quest. Diferenças justificadas devem ser declaradas como dados, sem fork de estrutura.
- **Seções presentes em todos:** classificação/estado factual, convite compartilhado, guia, artigo histórico, seção `Continue jogando` com links reais a outros jogos e histórico do desenvolvimento. O jogo só mostra `História na tela` quando existe filme/documentário **verificado** para aquele título. Não exibir placeholder artificial (Pixel Quest não possui título confirmado). Para modo sem ranking, exibir a indisponibilidade verdadeira, sem inventar valores; rankings competitivos só com conta.
- **Artigo Snake único:** `SnakeHistory.astro` compartilha o artigo original entre os três modos, preservando textos, fontes e HTML real. `GameRelatedGames.astro` lista outros jogos a partir do catálogo, substituindo mensagens antigas de "mais clássicos estão a caminho". `GameCompetitionNotice.astro` explica recordes locais provisórios do Pixel Quest.
- **Parágrafos:** remover o limite artificial de `85ch` e os estilos que restringem artigos/editoriais a 870px dentro de cards com até 980px; parágrafos devem aproveitar **a largura interna disponível do card**, respeitando apenas o padding e o comportamento responsivo. No fullscreen, proporções e elementos jogáveis são independentes destes estilos.
- **Sem escopo funcional:** não modificar motores, IDs de scripts, pontuação, conta, ranking existente, banco, SEO factual, versão ou regras de jogabilidade nesta etapa. Os ajustes de ranking legados do Snake ficam na Etapa 3; SEO/negritos históricos na Etapa 4.

### Etapa adicional aprovada: navegação e breadcrumbs

- **Etapa 2B — Breadcrumbs e navegação contextual** após homologação visual da Etapa 2, antes da revisão final: trilha de navegação visível e acessível em todas as páginas aplicáveis (ex.: `Início › Jogos › Snake › Aventura`, `Início › Jogos › Tetris › Sprint`, `Início › Rankings`), com último item indicando página atual e links reais. Metadados `BreadcrumbList` JSON-LD apenas quando representarem a navegação visível; URL canônica absoluta somente com domínio público confirmado. Criar **um componente comum**, não breadcrumb hardcoded por página; home não precisa trilha. Garantir responsividade e evitar repetição excessiva de termos para SEO.
- **Outras melhorias do proprietário preservadas no backlog (não executar nesta etapa):** ranking e desempenho sem duplicação e com conta autenticada (Etapa 3); identidade editorial `Old Arcade`, artigos históricos úteis e indexáveis com negritos semânticos moderados, filmes/livros verificados e afiliados apenas quando autorizados (Etapa 4); navegação/links reais `Continue jogando`, controles e layouts compartilhados, histórico do desenvolvimento e padronização global. Não presumir que esta relação exaure sugestões anteriores não recuperadas; consultar `docs/CONTINUIDADE.md` ao retomar.

## Contrato de largura e semântica (aprovado 19/11/2026)
- Site inteiro usa a mesma variável CSS `--oa-content-width:980px` com `.shell`; páginas de jogos `.oa-game-page` usam o mesmo token. A largura do conteúdo é fluida até o máximo de 980px e mantém alinhamento entre header, corpo e footer; 20px de respiro lateral em desktop/tablet e 12px em mobile até 580px.
- Este limite **não se aplica ao palco em fullscreen**; aí a resolução/altura disponível comandam a escala, respeitando proporções nativas (Snake 1:1, Tetris 1:2, Quest 16:9) e mantendo HUD/controles presentes.
- Qualquer tela nova entra automaticamente pelo container compartilhado. Verificar 1440/1024/390/320, alinhamento e scroll horizontal; QA visual no Preview é etapa separada do CI.
- Resultados públicos em ranking exigem **conta autenticada**; nickname solto no navegador não qualifica. História real mantém HTML indexável, destaque semântico moderado, fontes e títulos descritivos (sem encher palavras-chave). Mais detalhes em `docs/PADROES_GLOBAIS_DOS_JOGOS.md`.

## Princípios
1. Cada jogo deve funcionar antes de entrar no catálogo.
2. Não reutilizar o código do antigo oldarcade.com.br.
3. GitHub é fonte de verdade; nenhum deploy ou merge sem aprovação.
4. HTML indexável: Astro gera documentos completos para home, jogo e editoriais.
5. SEO honesto: título/descrição exclusivos, estrutura semântica, URL canônica somente com domínio conhecido, sitemap quando SITE_URL configurado, schema apropriado e links internos úteis.
6. Publicidade não pode atrapalhar jogabilidade; respeitar distância recomendada pelo Google (150 px). Não ativar AdSense antes de revisão editorial e política de privacidade.
7. Conteúdo histórico fundamentado em fontes verificáveis e distinguindo a criação do gênero das implementações específicas.
8. Segurança: rankings globais exigem validação de pontuações, rate limit e antifraude; nickname sem conta não prova identidade.
9. Sem números globais fictícios: a primeira versão mostra apenas estatísticas locais.
10. Nova versão no rodapé, vinculável a commit via PUBLIC_APP_VERSION no build.

## Status
- [x] Repositório novo, branch de desenvolvimento isolada.
- [x] Astro estático, home e primeiro jogo Snake.
- [x] Snake jogável, tela cheia somente no painel do jogo, teclado, toque, pausa automática.
- [x] Recorde/ranking local, contadores locais, apelido opcional.
- [x] História, tutorial, fontes, páginas institucionais e estrutura SEO.
- [ ] Testes de build e interação reais executados no ambiente de CI / navegador.
- [ ] Definir domínio definitivo, validar Search Console e gerar sitemap.
- [ ] Cloudflare D1/Workers: visitas e partidas globais por jogo, visitantes pseudônimos, ranking público com validação e antifraude.
- [ ] Painel administrativo real, protegido e com trilha de auditoria.
- [ ] Consentimento, política de privacidade definitiva e revisão para AdSense.
- [ ] Produção, aprovação editorial e publicação.

## Contadores: contrato previsto
Visita de jogo: uma visita por sessão por jogo; evitar duplicar em refresh. Partida: conta no começo efetivo do jogo. Global: soma de eventos aceitos pelo servidor. Jogador: instalação local com ID aleatório, pseudônimo opcional; sem alegar que é uma conta confiável. Um ranking público deve separar pontuações verificadas de submissões não confiáveis.

## Testes mínimos por jogo
Desktop 1440/1024, mobile 390/320, teclado, toque, fullscreen/Esc, pausa em troca de aba, game over, restart, persistência local, acessibilidade e indexabilidade de textos em HTML. Nenhuma métrica global deve aparecer sem API disponível. Teste de links, metatags, robots e sitemap após domínio configurado.

## Observações
O arquivo robots.txt nesta fundação bloqueia crawlers de propósito. Alterar apenas quando houver domínio e autorização de publicação. O site não tem integração AdSense nem backend público ativo.

## Registro permanente por jogo
- Cada jogo recebe um número sequencial fixo, identificador estável e data do primeiro commit de implementação.
- Manter `src/data/gameRegistry.ts` como fonte única de versão, criação e notas históricas. Não editar registros antigos, somente acrescentar novas entradas datadas.
- Versão individual do jogo é independente da versão geral do portal no rodapé.
- Exibir ao final da página, em seção discreta e expansível, sem competir com a área jogável e sem confundir a história do jogo original com a história da nossa implementação.
- Registrar mudanças relevantes após aprovação e testes; não chamar versão de lançamento público antes do deploy.

## Padrão UX de jogabilidade — piloto Snake
- HUD visível em janela e tela cheia: estado (pronto/jogando/pausado/contagem/fim), pontos e recorde.
- Tecla `F` alterna tela cheia sem desviar dos controles; botão visível oferece operação equivalente.
- Durante uma partida, mudar o modo pausa a simulação e retoma automaticamente somente após contagem visível 3–2–1; trocar de aba mantém pausa.
- Botões de toque e fallback de tela cheia precisam de validação em aparelhos reais.
- Reutilizar este contrato e CSS para os próximos jogos, substituindo somente a lógica da partida.
- Contadores globais seguem pendentes: exigem backend compartilhado no Cloudflare; métricas locais não devem ser rotuladas como globais.

## Retorno ao modo janela — padrão aprovado
- Ao sair da tela cheia, recentralizar automaticamente a área jogável na viewport, sem exigir mouse ou rolagem manual.
- Preservar countdown de 3–2–1 na entrada e saída; ambos foram aprovados visualmente pelo usuário.
- Validar a centralização em desktop e mobile; o componente genérico será extraído após a certificação do jogo piloto.

## Padrão adicional de início de partida
- Todo clique em começar/recomeçar deve recentralizar o tabuleiro, inclusive fora de tela cheia.
- Nova partida exibe 3–2–1 antes do primeiro tick, usando a mesma contagem das transições de fullscreen.
- Não duplicar contagem de partidas ao efetuar apenas troca de modo ou retomada.

## Controle mobile por gesto — padrão solicitado
- Aplicar `touch-action: manipulation` no documento para evitar zoom acidental por toque duplo, preservando ampliação por pinça com dois dedos.
- Tabuleiro captura swipe vertical/horizontal com limiar de movimento e impede rolagem durante a jogada; botões direcionais continuam disponíveis.
- Gestos fora do tabuleiro mantêm rolagem normal; não desabilitar pinça de acessibilidade globalmente.
- Testar em iPhone real; testes em Chromium emulado não comprovam comportamento do Safari iOS.

## Contadores globais (piloto, somente Preview)
- Pages Function em functions/api/games/[game]/stats.js, acessando D1 pela variável OLDARCADE_STATS_DB.
- Migração em migrations/0001_game_events.sql, aplicada somente no banco de Preview.
- Visitas uma por sessão/aba, token aleatório em sessionStorage e UNIQUE no D1; partidas por início real, sem duplicar ao retomar.
- Se API indisponível, não inventar valores; mostrar traço e status.
- Nenhum IP/nickname/cookie persistente é armazenado no D1; tokens aleatórios e timestamp dos eventos ficam armazenados.
- Idempotência e validação de origem não equivalem a proteção antifraude; reforçar antes de lançamento público.

## Ranking e identificação opcional — regra aprovada (Preview)
- Qualquer visitante pode jogar e contribuir para os totais globais de visitas e partidas.
- Somente resultados de partidas com nickname não vazio entram no ranking **local**. Resultados antigos com nome Anônimo ou vazio são filtrados da visualização e dos dados salvos quando a página carregar.
- Nickname digitado e salvo persiste neste navegador entre visitas, mas não é login nem identidade global. Alterar nickname não altera o nome já registrado em resultados anteriores.
- Não publicar ranking global até existir mecanismo de pontuação verificável e proteção contra fraude.

## Ranking global recreativo do Snake (Preview)
- Migração D1 em migrations/0002_game_leaderboard.sql; usuário deve executar somente no D1 de Preview.
- Modal após fim da partida pede registro opcional do resultado; nickname salvo previamente é preenchido.
- Ranking público Top 10 e recorde global destacado, provocando o jogador a superar o recorde.
- Uma melhor pontuação por ID aleatório de instalação. Nickname não é conta, pontuação enviada pelo cliente não é verificável: ranking recreativo, sem garantia de autenticidade.
- Antes da liberação pública é necessário reforçar antifraude, limites de envio, moderação e política de retenção.

## Requisitos de identidade e recuperação (a implementar)
- O jogo não exige login; apenas registro de recordes futuros será associado a uma conta autenticada de nickname único e senha.
- E-mail **opcional** no cadastro, persistido apenas com consentimento para recuperação. Código de recuperação gerado pelo servidor uma única vez na criação da conta, com hash guardado no banco.
- Se houver e-mail confirmado, recuperação por link ou código temporário de uso único emitido pelo servidor e enviado ao e-mail cadastrado. Nunca revelar conta ou senha apenas com dados do formulário ou chamada ao WhatsApp. Solicitação administrativa não autoriza reset manual sem verificação.
- Formulário de contato abre WhatsApp do suporte (número configurado em `src/config/support.ts`); painel administrativo poderá editar o destino no futuro. Enquanto não houver infraestrutura de contas/e-mail, formulário informa que recuperação automatizada ainda não existe.

## Conta de jogador (primeira etapa)
- Tabela `player_accounts` reserva nickname sem distinção entre maiúsculas e minúsculas; e-mail opcional ainda sem verificação. Contas não são necessárias para jogar.
- Senhas derivadas via WebCrypto/PBKDF2 com salt e sessões em cookies HttpOnly. Código de recuperação apenas hash no banco, exibição uma única vez.
- Recuperação por e-mail NÃO ativada até existir prova de controle do endereço; contatos via WhatsApp não conferem acesso.
- O ranking global recreativo ainda é legado por instalação, e não está vinculado às contas. Vincular numa etapa separada com bloqueio da publicação anônima e validação de abuso.

## Padrão atual de recordes do Snake (novembro/2026)
- Ranking oficial exclusivamente por conta no D1 Preview: POST do fim da partida e tabela `player_game_records`, sem migrar recordes anônimos legados.
- Durante a partida, ultrapassar o recorde global conhecido apresenta **meta global provisoriamente superada**, com número do placar sendo atualizado localmente e animação dourada. A confirmação de liderança é exclusivamente com resultado da API ao fim da partida.
- Se outra pessoa lidera por maior score, mostrar nome/score e tempo desde o registro quando disponível; em empate, respeitar ordem da conquista no servidor. Um anônimo nunca tem liderança oficial, mesmo que ultrapasse a meta local.
- Sem polling no jogo nem nova requisição para o efeito; apenas consulta na entrada e encerramento (POST único para autenticados, GET se anônimos).

## Indicadores globais do portal e versões de desenvolvimento
- Todos os indicadores de sessões/partidas são derivados de `game_events` no D1 de Preview. Visita do portal = 1 evento `site/visit` por sessão do navegador, registrado pela navegação em qualquer página; não representa pessoa única nem pageview. Partida = evento `play` no início de cada jogo; jogos jogados = quantidade de títulos distintos que têm ao menos uma partida. Jogos disponíveis = número de títulos efetivamente oferecidos no registro do site, não lançamentos em produção.
- Página inicial não inventa números quando D1 indisponível; solicita dados via API própria e exibe ausência como traço.
- Versões atuais de desenvolvimento: portal em package.json e Snake em gameRegistry, cada uma com versionamento independente; `-dev` indica não publicado oficialmente.

## Histórico de recordes por conta no jogo
- A sessão autenticada recebe lista de melhores pontuações por jogo via a mesma resposta do ranking atual, consultando `player_game_records` filtrada pelo jogador da sessão. O front-end exibe somente jogos existentes no catálogo editorial e oferece atalho para superar cada recorde; se nunca jogou, informa "Sem recorde". Nunca mostra recordes de outra conta nem simula recordes de jogos futuros.
- Sem sessão válida, o ranking local do navegador permanece; sem consultas periódicas nem nova migração do D1.

## Compartilhamento social por jogo
- Cada jogo pode renderizar `GameShare.astro` com slug/nome, sem SDKs sociais e sem requerer login. URLs estáveis no caminho `/jogos/:slug/`, usando origem do ambiente aberto. Compartilhadores por URL: WhatsApp, Telegram, Facebook, X, Reddit e Bluesky; Web Share API nativa quando presente, além de copiar texto de convite.
- Exibir score apenas quando notificado pelo evento local `oldarcade:game-finished` daquela partida. Esse score é autorrelatado/visual; **não** alegar recorde verificado, classificação nem identidade autenticada. Nunca incluir cookie/token/e-mail no convite.
- Em Preview, o convite contém a URL do Preview. Substituir automaticamente pela URL do domínio de produção quando for publicado; garantir OG metadata antes do lançamento para cartões nas redes que não aceitam texto customizado.

## Modo Aventura do Snake — protótipo experimental
- Rota independente `/jogos/snake/aventura/`, sem alterar código das regras do Clássico nem misturar pontuações/recordes globais. Mantém jogo #001; não é outro jogo publicado.
- Três metas dentro de uma única partida: nível 1 (5 maçãs e 50 pontos); nível 2 (1 dourada e 150 pontos); nível 3 (3 itens especiais coletados no nível 3 e 300 pontos); após completar, modo sobrevivência continua. Ambos requisitos necessários em cada transição, sem reset de corpo/pontuação.
- Itens: maçã +10, dourada +50 e duração limitada, cristal +10 e desaceleração limitada. Itens especiais não se sobrepõem entre si, à comida comum nem ao corpo da cobrinha. Pausar/conteúdo oculto preserva partida e faz countdown ao retomar; temporizadores de itens são baseados em ticks para não expirarem durante a pausa.
- LocalStorage separado `oldarcade:snake:adventure:v1` guarda recorde, maior nível e total de partidas locais. **Nenhum envio de pontuação ao D1, nem ranking global** até projetar identificador de modo no backend e antifraude. Também não aumentar contadores globais de Snake Clássico por usar protótipo experimental.

## Padrão de produto reaproveitável: classificação por modo
- Uma vez que o jogo/mode permita pontuação competitiva, deve contar com ranking Top 10 de contas, uma posição por jogador, desempate por timestamp em milissegundos, registro opcional ao terminar, recorde pessoal/global no HUD, aviso provisório durante jogo, confronto oficial no fim, compartilhamento e testes. Usar componentes comuns, especialmente `GameRanking.astro`, `GameShare.astro`, e endpoint `/api/games/:game/leaderboard` com allowlist, não duplicar tabela nem misturar regras de modos diferentes.
- Snake Aventura usa chave `snake-adventure` da mesma tabela D1 (nenhuma migração), e mantém recorde local separado, além do ranking oficial da conta. O contador de títulos publicados não aumenta por acrescentar modo de jogo. A pontuação continua declarada pelo cliente e precisa de proteção antes da liberação pública competitiva.
- Revisar backlog junto com proprietário depois de estabilizar o Aventura completo, antes do jogo #002: ativar, adiar ou eliminar cada ideia, com atenção especial a referências rastreáveis.

## Centralização de jogos: padrão obrigatório e reutilizável
- Use `centerGameBoard` em `src/scripts/gameViewport.ts` para manter tabuleiro no centro vertical da viewport durante início, retomada e saída de fullscreen, como já validado no Clássico. Componentes de jogo não devem replicar manualmente lógica de scroll e correções fullscreen. Aplicar testes em viewport mobile, inclusive ao sair de fullscreen e depois do countdown; não alterar regras do jogo por causa de posicionamento.

## Padrões de navegação — rankings e identidade de jogador
- Navegação única `Rankings` leva a `/rankings/`, onde cada jogo/modo competitivo é apresentado em seção com líder, Top 3, Top 10 expansível, horário e botão Jogar/Desafiar. Dados vêm da API existente do modo; ausência de banco mostra indisponibilidade, sem números fictícios. Ao introduzir novos jogos, acrescentar sua classificação ao catálogo da página.
- Header e sidebar devem exibir nickname da sessão autenticada por `accountIdentity.ts`, nunca valor inventado ou enviado pelo navegador como parâmetro da URL. Sincronizar após login/cadastro/logout pelo evento de conta, e após navegação usando `/api/auth/me`. Não expor e-mail ou IDs.
