# OldArcade — Auditoria BUG-QUEST-05 / SEC-RANKING / D1 / LEGAL

**Data:** 21/11/2026 · **Escopo:** somente análise de código da branch `feat/layout-unificado-snake-quest`. **Sem acesso ao D1 real, sem consultas ao banco, sem merge/deploy.**

## Critério de evidência

- **Comprovado no código:** comportamento diretamente sustentado por arquivos da branch.
- **Dependente de teste:** fluxo real de navegador, sessão ou D1, ainda sem prova nesta auditoria.
- **Decisão pendente:** mudança arquitetural ou jurídica que não pode ser considerada aprovada automaticamente.
- Homologações das Etapas 1/2/2B/3, imagens Snake/Tetris/Pixel Quest, login por modal, Top 3/Top 10 e ranking público não devem ser reabertas.

## BUG-QUEST-05 — recorde do Pixel Quest

**Comprovado:** `src/scripts/pixelQuest/index.ts` calcula o resultado somente em `finish(true)`, chama `recordCompletedLevel`, atualiza o HUD local e emite `oldarcade:game-finished` com `game:'pixel-quest'`, pontuação e `durationMs` inteiro arredondado. `src/scripts/pixelQuest/records.ts` persiste melhor pontuação local por fase; `src/data/gameModes.js` marca Pixel Quest competitivo. A API exige conta para POST.

**Não comprovado:** persistência após vitória real com sessão autenticada no D1 Preview; atualização da posição pessoal após recarregar a página; comportamento quando sessão expira ou D1 está indisponível; integridade do evento na integração compartilhada. Testes existentes de fase/controle não bastam para fechar o relato de recorde não registrado. O registro histórico da Etapa 3 indica regressões sintéticas corrigidas, não substitui teste completo no D1 real.

**Ação:** reproduzir vitória e derrota, conferir requisições/respostas GET/POST e o fluxo de ranking sem perder a sessão/modal; teste automatizado com mock deve ser distinto de teste D1. Não trocar ranking nem mexer no cálculo sem falha reproduzida.

## SEC-RANKING — risco ALTO comprovado

**Comprovado:** `functions/api/games/[game]/leaderboard.js` valida origem, conta, formato, limites e duração, mas recebe `score` e `durationMs` declarados pelo cliente e não recebe/revalida prova da partida. Retorna `verified:false`. Uma conta válida pode tentar enviar pontuações sintéticas dentro dos limites aceitos. Autenticação não equivale a antifraude. A API faz UPSERT do melhor resultado e sinaliza separadamente falha de gravação e de releitura.

**Proteções existentes:** mesmo domínio via `Origin`, cookie HttpOnly/Secure/SameSite=Strict, sessão persistida por hash, parâmetros SQL vinculados, validação de modalidade e limite; não remover. O código não demonstra rate limiting específico no POST de ranking, nem trilha de verificação de partidas. Não afirmar exploração no ambiente real sem teste.

**Decisão arquitetural necessária:** definir validação server-side por modalidade, emissão de sessão/tentativa não reutilizável, limites plausíveis por motor, auditoria de submissões e tratamento de resultados antigos não verificados. Não implementar antifraude fictício que apenas esconda `verified:false`, nem invalidar recordes homologados. Planejar migração D1/rollback e testes antes de qualquer mudança de schema.

## D1 — validação real PENDENTE

**Comprovado no código:** binding exigido `OLDARCADE_STATS_DB`; consultas para `player_accounts`, `player_sessions`, `player_game_records`; `scoreColumn` detecta `best_score_milli` ou `best_score`. Sem binding, leaderboard responde 503. A camada de gravação usa UPSERT e distingue `RECORD_WRITE_FAILED` e `RANKING_REFRESH_FAILED`.

**Não verificado:** bindings reais de Preview/produção, migrações aplicadas, índices, integridade, tempo de resposta, permissões, erros/duplicação, disponibilidade e consistência dos dados. **Nenhuma conexão D1 foi utilizada nesta auditoria.**

**Validação segura sugerida (somente leitura):** conferir identificador do banco Preview e bindings Pages; `PRAGMA table_info('player_game_records')`, `PRAGMA index_list('player_game_records')`, contagens agregadas de tabelas e amostra anonimizada de estados sem e-mail/senha/token. Testes de gravação devem ocorrer apenas com autorização separada e conta de teste em Preview, nunca em produção.

## LEGAL — revisão para lançamento PENDENTE

**Comprovado:** `src/pages/privacidade.astro` e `src/pages/termos.astro` existem, documentam contas, cookies, ranking recreativo e limitações reais do serviço. `docs/AUDITORIA_SITE_01_DADOS_E_LEGAL.md` já identifica lacunas de retenção, titular/controlador, privacidade, exclusão, fornecedores e revisão jurídica. Não substituir páginas homologadas sem constatar divergência.

**Pendências:** identificar controlador e canal de privacidade; mapear ciclo de vida/retenção do D1/logs/backups; processo de solicitações de titulares; avaliação de fornecedores, analytics e publicidade; revisão jurídica final antes do lançamento. A existência das páginas não comprova adequação à LGPD.

## Ordem de execução recomendada

1. **BUG-QUEST-05 / D1 Preview:** instrumentar teste não destrutivo e reproduzir com conta de teste, separando mocks de persistência real.
2. **SEC-RANKING:** desenhar antifraude por modalidade, com critérios verificáveis, registro de tentativas e testes de segurança; submeter mudanças de esquema e impacto aos recordes para autorização explícita.
3. **LEGAL:** preencher dados reais de controlador/fornecedores e política de retenção, depois revisar juridicamente as páginas antes de publicação.
4. Após cada alteração autorizada: check, build, API, E2E desktop/mobile, CI no commit e validação visual do proprietário.

**Estado desta auditoria:** sem bug novo reproduzido em execução; risco arquitetural SEC-RANKING confirmado no código; demais verificações dependentes de ambiente externo. Sem merge, deploy ou modificações de banco.
