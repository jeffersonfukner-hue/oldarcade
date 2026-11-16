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
