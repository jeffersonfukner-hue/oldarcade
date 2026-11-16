# Contadores globais — ativação apenas no Cloudflare Preview

A implementação está na branch feat/fundacao-snake; ainda não há backend ativo sem configuração do usuário.

1. Em Workers & Pages > D1, criar banco oldarcade-stats-preview.
2. Na aba Console do D1, executar migrations/0001_game_events.sql.
3. Em Workers & Pages > oldarcade > Settings > Bindings, adicionar **D1 database** no ambiente **Preview**, variável OLDARCADE_STATS_DB apontando ao banco criado. NÃO adicionar em Production.
4. Iniciar novo deploy de Preview para aplicar o binding.
5. Conferir o JSON da URL /api/games/snake/stats no Preview. Deve mostrar available:true; em falta de banco, available:false.
6. Testar uma visita por sessão e uma partida por iniciar, sem incremento ao trocar modo tela cheia.

O código não coleta IP, nickname, email ou identificador persistente de usuário. Tokens de eventos aleatórios e horário ficam no D1. A idempotência evita duplicidade acidental, mas não impede manipulação deliberada. Antes de lançar em produção, revisar privacidade, proteção contra abuso e política de retenção.

## Configuração após criação manual do banco
O banco `oldarcade-stats-preview` foi criado, e o Console confirmou a tabela `game_events`.
O `wrangler.jsonc` contém o UUID do banco apenas em `env.preview`, com `env.production.d1_databases` vazio, para evitar conectar o Preview à produção. Nenhuma alteração de binding foi salva pelo dashboard. Verificar na API pública do próximo deploy Preview: `GET /api/games/snake/stats`; resposta `available:true` indica vínculo D1 funcional. Se retornar 503 ou 404, investigar logs do deploy e aplicação da configuração, sem mudar produção.
