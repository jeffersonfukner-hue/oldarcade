# OldArcade — padrões globais obrigatórios de jogos e modos

> **Contrato permanente.** Ler antes de implementar ou modificar qualquer jogo ou modo. Aplica-se automaticamente; o proprietário não precisa repetir regras já aprovadas. Exceções exigem justificativa documentada e aceite. Complementa, sem substituir, AGENTS.md, docs/ARQUITETURA.md, docs/CONTINUIDADE.md e docs/VERSIONAMENTO_E_PUBLICACAO.md.

## 1. Identificação, catálogo e versões
- Cada **jogo** possui ID estável, número sequencial fixo, data de criação, versão individual e histórico imutável em `src/data/gameRegistry.ts`.
- **Modos** são variantes do mesmo título; não aumentam a contagem de jogos disponíveis. Podem ter IDs competitivos e recordes próprios.
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
- Liderança provisória ao ultrapassar meta global conhecida; efeito dourado, efeito verde para recorde pessoal; confirmar oficialmente só pela resposta do servidor ao encerrar. Empates respeitam conquista anterior.
- Cadastro/login opcional no pós-jogo; visitantes jogam livremente. Ranking de cada modo isolado por ID; componentes `GameRanking.astro`/`GameShare.astro` e API compartilhada de leaderboard, sem tabela duplicada.
- GET de ranking na entrada; GET final anônimo ou POST final autenticado, sem polling durante partida. Não afirmar pontuação verificada quando é autodeclarada; prever antifraude antes de competição pública.
- `/rankings/` apresenta cada modalidade competitiva com líder, Top 3, Top 10 expansível, horário e desafio. Conta mostra melhores resultados próprios, sem expor dados alheios.

## 4. UX, HUD e partida
- Jogabilidade em primeiro lugar; HUD legível em janela e tela cheia com estado, pontos e recordes. Botão e tecla `F` para fullscreen, `Esc` para sair; pausa por Espaço quando aplicável.
- Countdown visível 3–2–1 em **toda** nova partida, retomada e transição de fullscreen; preservar posição, pontuação e efeitos ao pausar.
- Usar `centerGameBoard` de `src/scripts/gameViewport.ts` ao começar, retomar e sair da tela cheia. Não duplicar scroll/centralização.
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
