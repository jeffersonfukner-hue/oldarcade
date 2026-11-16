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
