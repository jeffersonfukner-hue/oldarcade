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
