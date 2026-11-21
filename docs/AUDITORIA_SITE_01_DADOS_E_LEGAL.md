# SITE-01 — Inventário de dados e limites editoriais (20/11/2026)

> Auditoria de código para as páginas do ambiente de desenvolvimento. Não substitui auditoria de infraestrutura, avaliação de segurança, parecer jurídico ou verificação de produção. Nenhuma migração ou alteração no banco foi executada.

## Recursos verificados

| Recurso | Implementação observada | Referência |
| --- | --- | --- |
| Cadastro de jogador | Nickname, senha e e-mail opcional; hash de senha PBKDF2 + salt, hash de código de recuperação | `functions/api/auth/[action].js`, `functions/api/_lib/auth.js` |
| Login/sessão | Cookie `oldarcade_session` HttpOnly/Secure/SameSite=Strict, Max-Age 30 dias; token de sessão armazenado como hash no D1; logout invalida sessão quando a requisição conclui | `functions/api/_lib/auth.js`, `functions/api/auth/[action].js` |
| Perfil/notificações | E-mail opcional, marca de confirmação e escolhas de avisos; entrega indisponível (`deliveryAvailable:false`) | `functions/api/account/preferences.js` |
| Recuperação | Código exibido uma vez ao cadastrar, mas sem endpoint público de redefinição; não oferecer fluxo de e-mail inexistente | `functions/api/auth/[action].js`, `src/pages/conta.astro` |
| Rankings | GET público de nomes e placares; POST exige conta, guarda melhor pontuação por modalidade, tempo e data; `verified:false` | `functions/api/games/[game]/leaderboard.js` |
| Visitas/partidas | UUIDs de evento em `sessionStorage`; eventos agregados no D1 `game_events`; mensagens honestas quando ambiente não tem banco | `src/scripts/siteCounters.ts`, `src/scripts/globalGameCounters.ts`, APIs de stats |
| Dados locais dos jogos | Progresso, recordes e preferências locais usados por modos de jogo; limpeza local não equivale a exclusão de conta do servidor | Scripts dos jogos e `src/pages/conta.astro` |
| Contato | Mensagem composta no navegador; usuário decide encaminhar pelo link `wa.me`; não há formulário de envio por backend próprio | `src/pages/contato.astro`, `src/config/support.ts` |

## Alterações editoriais da SITE-01

- `/privacidade/`: corrigidas afirmações de conta inexistente, uso do D1 e cookie, dados públicos do ranking, escolhas do jogador e limites de atendimento.
- `/termos/`: página nova sobre uso de jogos gratuitos, conta, resultados recreativos, conteúdo, indisponibilidade de Preview e links externos.
- `/sobre/`: removida afirmação de métricas apenas locais e adicionadas referências ao cadastro e à privacidade.
- `/contato/`: removida promessa de redefinição por e-mail; canal de solicitações de privacidade e avisos para não compartilhar segredos.
- Rodapé: link para Termos de Uso; testes Playwright em `tests/site-legal.spec.ts`.

## Pendências obrigatórias antes do lançamento oficial

1. Confirmar titularidade/controlador e contato apropriado de privacidade; não inventar CNPJ, endereço ou responsável.
2. Verificar política de retenção, expiração e exclusão de registros no D1 e em serviços de infraestrutura, assim como backup/logs; a validade do cookie não equivale à retenção dos dados.
3. Definir e implementar fluxo real de atendimento a solicitações de acesso, correção e exclusão com verificação de titularidade.
4. Validar fornecedores, coleta de logs/endereços IP, analytics e publicidade na configuração de infraestrutura que efetivamente será publicada; não inferir ausência de processamento externo apenas pelo código do repositório.
5. Revisão jurídica de Termos/Privacidade antes da publicação oficial.
6. Homologação visual e CI da SITE-01, sem confundir com autorização de merge/deploy.

## Escopo intocado

Sem alteração dos motores, placares, desafios diários, autenticação real, tabelas, migrations, dados de produção, Etapa 4B ou etapas aprovadas. PR #4 permanece draft e sem merge/deploy.
