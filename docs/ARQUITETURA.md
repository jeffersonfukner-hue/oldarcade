# OldArcade · Arquitetura e critérios de aceite

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
