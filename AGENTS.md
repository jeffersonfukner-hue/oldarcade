> **Contrato obrigatório para todo jogo/modo:** [docs/PADROES_GLOBAIS_DOS_JOGOS.md](docs/PADROES_GLOBAIS_DOS_JOGOS.md). Reutilize componentes e integrações existentes sem exigir repetição de requisitos aprovados.

# OldArcade — regras permanentes para agentes

## STATUS HOMOLOGADO — Etapa 3 (20/11/2026)
- O proprietário homologou visualmente o convite de cadastro **centralizado na frente do jogo**. O CI #44668666640 do commit `29704a14` terminou com sucesso (tipos, build, API e testes E2E desktop/mobile). A Etapa 3 está concluída tecnicamente na branch do PR #4; não reabrir a decisão visual aprovada.
- Padrão final de todos os sete modos: ranking público para visitantes; convite após partida elegível com destaque para salvar recorde, login/cadastro no modal global sem trocar de página; jogadores já autenticados registram automaticamente; Pixel Quest só registra conclusão de fase. Não confundir teste sintético de fim de jogo do Snake com pontuação real da rotina própria do Snake.
- PR #4 continua draft/aberto, **sem merge nem deploy**. A conclusão da etapa não autoriza publicação. `docs/CONTINUIDADE.md` contém os detalhes e pendências; seções abaixo são histórico de decisão e não revogam esta homologação.


## REGRA OFICIAL — ranking para todos os jogos; visitantes veem líderes e convite final (19/11/2026)

- **Correção prioritária exigida na Etapa 3, ainda em homologação:** O Pixel Quest foi incorretamente marcado `competitive:false`, ficando ausente da página `/rankings/`, do perfil competitivo e do endpoint de leaderboard. A regra original do Old Arcade é **todos os jogos com classificação**, embora só fases/partidas elegíveis gerem pontos. Ativar `pixel-quest` no catálogo compartilhado e permitir GET público + POST autenticado pela API existente. Ranking Quest v1 = **maior pontuação da fase 1-1 concluída**, não somar campanhas futuras, não registrar derrotas como vitórias. Histórico local é preservado, e a API de ranking não apaga marca antiga.
- **Consultas SEM login obrigatórias:** Top 3, Top 10, líder e nomes dos recordistas são públicos para **todas as modalidades**, inclusive Quest, sem divulgar e-mails ou dados privados. O nome do visitante só aparece no ranking se ele criar/entrar em conta e registrar resultado elegível.
- **Convite final global:** ao terminar uma partida elegível, visitante vê resultado e chamada não bloqueante para **Criar conta / Já tenho conta / Ver líderes**. O convite usa o modal GLOBAL de autenticação e não impede replay, não substitui Game Over, nem deve aparecer para jogador autenticado. Login após resultado elegível pode enviar uma vez automaticamente a marca guardada em memória da aba; não prometer registro sem resposta positiva da API. Testes devem cobrir Snake (3 modos), Tetris (3 modos) e Quest (1).
- **Remover do ranking dentro do jogo:** formulário duplicado, modal próprio e botão “Tentar registrar novamente” e quaisquer CTAs de reenvio redundantes que não funcionem. Consultar ranking nunca deve depender de login. Manter card simples com pódio Top 3, Top 10 sob demanda, posição pessoal se houver, status real de disponibilidade. Não mexer no reenvio **do Desafio Diário de tentativa única**, que tem fluxo e proteções próprios.
- **Estado técnico:** mudanças preparadas na PR #4, aguardar o CI do commit novo e sua homologação visual. Não confundir com conclusão oficial da Etapa 3, nem executar Etapa 4/4B antes do aceite. Sem SQL, merge ou deploy manual. Avaliar futuramente autenticação e antifraude de placares (`verified:false`); não alegar que contas impedem pontuações manipuladas.
- **Backlog preservado:** bugs de recorde local do Quest, recentralização, novos sprites e modalidades, estatísticas expandidas, mídia, páginas institucionais, header, home e imagens continuam na fila. Não encurtar nem sobrepor este backlog.



## Fila adicional de site e imagens (20/11/2026)
- Ler [docs/BACKLOG_SITE_UX_E_IMAGENS.md](docs/BACKLOG_SITE_UX_E_IMAGENS.md) antes de tocar em header, home, páginas legais, versões, categorias, compartilhamento ou arte. Esses itens pertencem à Etapa 4 / **4B** posterior, **não** interrompem a Etapa 3.
- Etapa 3 requer um card por jogo (perfil e página de rankings), modos individuais dentro, Top 3 visível no modo escolhido e Top 10 expansível; nenhuma pontuação fictícia ou por nickname sem conta. CI #1051 no commit `a3bd91e` passou; novo HEAD ainda exigirá CI e aceite visual.


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


## Fila de navegação dos jogos — proposta ainda não implementada (19/11/2026)
- Consolidar no futuro os seletores de modos de Snake/Tetris e novos modos do Pixel Quest em um único componente global alimentado por `gameModes.js`. Modo auto-scroll/corrida lateral do Pixel Quest é **ideia registrada**, não mecânica aprovada para implementação.
- Troca de modo durante `playing`/`paused`/`countdown` exige confirmação sem perda acidental; desafio diário requer alerta de tentativa única. A retomada após ler/rolar artigo deve centralizar o tabuleiro de novo; verificar possível falha no `pause()` do Snake Clássico/Evolution.
- Detalhes e testes planejados em `docs/PLANO_PADRONIZACAO.md` e `docs/CONTINUIDADE.md`. Não alterar código sem entrar na etapa correta. Preservar plano 1–5 e etapa 2B.

## Plano de execução aprovado — preservar ordem
- Ler e cumprir [docs/PLANO_PADRONIZACAO.md](docs/PLANO_PADRONIZACAO.md): cinco etapas originais intactas, Etapa 2B de breadcrumbs, fila separada de refinamentos. **Não confundir a chegada de novas ideias com autorização para pular a homologação da etapa em curso.**
- A seção `História na tela` pode cobrir adaptações de outros jogos do mesmo gênero, desde que a relação editorial seja correta, verificável e não implique adaptação do título original Old Arcade. Para Pixel Quest, esta tarefa pertence à Etapa 4, não à Etapa 2.

## Etapa 2 aprovada — seções editoriais e amplitude do texto (19/11/2026)

- **Estrutura oficial única:** `src/components/GamePageSections.astro` organiza no HTML (nunca com CSS `order`) os slots `rankings → share → guide → history → screenings → related → development`, sempre **após o palco/área jogável e seu desempenho auxiliar**. Aplicável ao Snake Clássico/Evolution/Aventura, Tetris Clássico/Sprint/Sobrevivência e Pixel Quest. Diferenças justificadas devem ser declaradas como dados, sem fork de estrutura.
- **Seções presentes em todos:** classificação/estado factual, convite compartilhado, guia, artigo histórico, seção `Continue jogando` com links reais a outros jogos e histórico do desenvolvimento. O jogo só mostra `História na tela` quando houver filme/documentário **verificado e relacionado ao próprio jogo ou ao gênero**, identificando a natureza da relação; sem placeholder artificial. Filmes inspirados em outros jogos de plataforma podem compor o artigo cultural do Pixel Quest na Etapa 4. Para modo sem ranking, exibir a indisponibilidade verdadeira, sem inventar valores; rankings competitivos só com conta.
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

**Contrato editorial unificado para páginas de jogos:** ordem final planejada após a largura (Etapas 2–4): (1) apresentação/modos, (2) palco/placar, (3) desempenho e ranking compacto, (4) compartilhar, (5) guia, (6) história do jogo ou gênero, (7) filmes/livros verificados **somente se houver itens reais** (nenhum placeholder no Pixel Quest), (8) continue jogando com jogos disponíveis e links reais, (9) bastidores/histórico de desenvolvimento. Implementar por componentes globais; diferentes regras/contadores são dados de cada jogo, não justificativa para cópia da UI. Ranking inexistente exibe estado factual e nunca números fictícios.

**Sequência acordada:** Etapa 1 largura geral → Etapa 2 presença/ordem de seções → Etapa 3 desempenho/ranking e autenticação exclusiva → Etapa 4 conteúdo histórico/SEO, identidade e ligações entre jogos → Etapa 5 testes gerais e homologação. Subetapas exigem tipagem/build/API/Playwright e Preview manual para aceite. Não fazer merge nem deploy por iniciativa do agente; documentar resultados e pendências para o próximo chat.


> Antes de qualquer alteração, ler este arquivo, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e, ao tratar de releases, `docs/VERSIONAMENTO_E_PUBLICACAO.md`.

## Verificação obrigatória antes de qualquer mudança
- Executar o **Checklist obrigatório — mudanças globais e prevenção de regressão** em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` **antes de editar código**. A leitura dos padrões aprovados é uma etapa do trabalho, não depende do proprietário repetir instruções.
- Toda alteração de característica global (visual, countdown, HUD, efeitos, modais, ranking, fullscreen, tipografia, cores) acontece na **fonte compartilhada** e alcança, na mesma PR, todos os jogos e modos consumidores. Proibido corrigir individualmente cada jogo se o comportamento é padrão.
- Conferir lista de consumidores, remover duplicações e criar regressão cruzada antes de considerar a etapa pronta. CI e publicação de Preview são evidências diferentes da aprovação visual do proprietário.

## Fonte de verdade e fluxo
- Repositório: `jeffersonfukner-hue/oldarcade`.
- Código, documentação e configurações mudam via GitHub; implementar em branch e PR, com evidências de CI.
- `main` é a base estável. **Não fazer merge, deploy de produção ou vincular domínio sem autorização explícita e atual do proprietário.**
- Cloudflare Pages será usado para Preview de branch, separado do domínio de produção.
- Não usar Lovable; não gastar créditos de serviços externos por iniciativa própria.
- Não reabrir decisões já aprovadas sem motivo técnico concreto.

## Conversa e próxima ação — obrigatório
1. Ao concluir qualquer etapa, informar **o que foi feito**, **o que foi comprovado**, **o que falta** e **a próxima ação exata**.
2. Nunca terminar uma resposta apenas com "aguarde", "vou preparar", "não clique ainda" ou "depois continuamos" sem realizar a ação autorizada ou indicar o passo seguinte.
3. Quando um passo for do usuário, orientar **uma única ação por vez**, aguardar "pronto"/print e então responder com a ação seguinte.
4. Quando o trabalho for do agente, **executar primeiro** e trazer resultado real. Se não puder executar, explicar o bloqueio e oferecer uma alternativa específica.
5. Quando a execução depender de novo turno, apresentar botão "Continuar" com prompt contextual, quando disponível; caso contrário, uma mensagem copiável.
6. Não afirmar teste, Preview, publicação ou ação como concluídos sem evidência. Diferenciar "preparado" de "online" e "CI verde" de "teste manual concluído".
7. Se a conversa alcançar limite de contexto, não tentar improvisar a partir da memória: atualizar `docs/CONTINUIDADE.md`, apresentar link e mensagem de retomada pronta com repo, branch, PR, ambiente, estado, pendências, próxima ação e restrições.
8. Ao iniciar nova conversa, ler esses documentos diretamente do GitHub e verificar a situação atual de branch, PR e Actions antes de agir.

## SQL e migrações D1 — fluxo operacional aprovado (17/11/2026)
- Quando uma funcionalidade precisar de migração, entregar imediatamente o SQL exato, pronto para copiar e executar, identificando banco e ambiente; não transformar a entrega do SQL em bloqueio burocrático nem exigir nova discussão sobre o procedimento já aprovado.
- O proprietário **executa manualmente** o SQL no Cloudflare e confirma com "pronto"; o agente nunca executa migrações nem modifica D1 por conta própria. Não assumir que o banco foi atualizado antes da confirmação.
- Depois da confirmação, registrar a aplicação informada em `docs/CONTINUIDADE.md` (separando declaração do proprietário de validação técnica), seguir diretamente para verificações seguras de API/Preview e testes. Não consumir tentativas únicas ou alterar dados sem orientação.
- Preview e produção são ambientes separados. Autorização para SQL em Preview não autoriza produção, merge ou publicação. Fornecer sempre o SQL da revisão efetiva do repositório, sem improvisar esquema.

## Fluxo contínuo: implementação integral, intervenções no momento certo e validação como jogador (17/11/2026)
- **Objetivo central: desenvolvimento sem gargalos artificiais.** O agente conduz implementação, integração, depuração, testes técnicos e documentação até a entrega funcional; o proprietário está disponível para atuar sempre que sua intervenção for necessária para destravar o trabalho.
- **Pedir intervenção imediatamente quando surgir a dependência real**, nunca adiar SQL, permissão, configuração de serviço, escolha de produto, acesso ou outra ação exclusiva do proprietário para o fim da entrega. Entregar naquele momento a instrução operacional completa, objetiva e suficiente, com banco/ambiente/impacto quando aplicável; orientar uma ação por vez quando houver sequência de operações manuais. Após o "pronto", retomar a execução técnica sem reabrir decisões.
- **SQL:** o agente fornece o script integral e fiel à revisão atual assim que for necessário; o proprietário executa manualmente no D1 indicado. Podem existir tantas migrações quanto forem tecnicamente necessárias. Nunca executar SQL no lugar do proprietário ou tomar autorização de Preview como autorização de produção.
- **Evitar testes picados do proprietário.** API, JSON, SQL de verificação, CI, testes unitários, integração e E2E são responsabilidade do agente, sempre que as ferramentas permitirem. Pedir ações técnicas ao proprietário apenas quando realmente indispensáveis e inacessíveis ao agente, sem transformá-las em validação funcional repetitiva.
- **Validação de produto pelo proprietário:** após concluir os componentes da entrega, executar check, build, testes API/integração/E2E desktop/mobile e QA de Preview quando acessível; corrigir regressões e então apresentar uma experiência integrada para ele testar naturalmente **como jogador**, com URL exata e resumo conciso. Se não for possível comprovar algo, declarar a limitação com precisão, sem afirmar CI verde/QA concluído.
- Decisões já aprovadas e padrões globais devem ser reaproveitados. Nenhuma dessas regras autoriza merge, deploy de produção ou alteração de ambiente produtivo sem autorização específica.

## Segurança e qualidade
- Jogabilidade em primeiro lugar, um jogo por vez, HTML indexável, SEO verdadeiro, história com fontes, sem conteúdo artificial de volume.
- Nicknames e resultados locais não são rankings globais; não apresentar métricas fictícias.
- Sem rastreamento ou AdSense antes de política/consentimento adequado.
- Testes automatizados não substituem validação manual de teclado, tela cheia, dispositivos e Preview.
- Não publicar jogos protegidos por direitos sem licenciamento adequado.
- Versão do portal e versão de cada jogo são distintas. Manter histórico factual e imutável de versões com data e conteúdo.

## Continuidade entre conversas — compromisso operacional
- Após mudanças relevantes, manter o bloco **ESTADO ATUAL PARA NOVO CHAT** no topo de `docs/CONTINUIDADE.md`, com estado verificável, decisões aprovadas, commits, CI, Preview, pendências e próxima ação.
- Nunca deixar o proprietário depender de lembrar decisões ou reexplicar contexto de uma conversa antiga. Documentar também backlog futuro sem implementá-lo prematuramente.
- Na retomada, priorizar esse bloco, mas confirmar o HEAD real e a situação do CI; documentação não substitui verificação técnica.


## CI-ECONOMY-01 — política de execução de testes (23/11/2026)
- Política global solicitada pelo proprietário para todos os projetos. Modo padrão ECONÔMICO: fora de casa ou sem confirmação de runner local disponível. Franquia GitHub Actions compartilhada atualmente equivalente a US$ 12/mês; orçamento adicional zero. Conferir saldo e bloqueio de excedentes antes de executar quando houver dúvida; nunca autorizar cobrança.
- No modo ECONÔMICO, agrupar mudanças e commits quando possível, evitar CI para documentação isolada, usar filtros de caminhos, cache de dependências, cancelamento de execuções obsoletas e reexecutar somente jobs necessários. Preservar testes obrigatórios e não liberar deploy sem validação integral. Preferir testes locais gratuitos disponíveis; não disparar workflows redundantes.
- Modo LOCAL: ativar quando o proprietário informar que está em casa e o runner Mac mini estiver instalado, online e verificado. Executar testes, lint, TypeScript, builds e retestes com a frequência tecnicamente necessária, sem economizar minutos de GitHub-hosted runners porque o processamento deve ocorrer no runner próprio. Não confundir modo LOCAL com autorização para consumir franquia remota ou serviços pagos.
- Runner planejado: Linux ARM64 em VM isolada no Mac mini; sem compartilhamento de arquivos pessoais, credenciais de produção, privilégios de deploy ou acesso administrativo ao hospedeiro. Restringir a código confiável de repositórios privados e verificar compatibilidade; não executar PRs externos não confiáveis. Se o runner estiver offline, voltar ao modo ECONÔMICO sem fallback automático para jobs hospedados. Quando o proprietário informar que saiu de casa, retornar ao modo ECONÔMICO. Não presumir disponibilidade pela localização.
- Em ambos os modos, manter evidências de testes, SHA, CI e registro de atividades. Sem merge, deploy, escrita no banco ou gastos sem autorização específica. A política documental não altera automaticamente os workflows. Implantação do runner e adaptação dos workflows ainda pendentes.
