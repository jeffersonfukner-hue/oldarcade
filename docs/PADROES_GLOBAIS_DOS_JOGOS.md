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
