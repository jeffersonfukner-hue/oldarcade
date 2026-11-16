# OldArcade — continuidade obrigatória

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
