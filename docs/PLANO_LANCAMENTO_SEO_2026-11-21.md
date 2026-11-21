# OldArcade — Auditoria objetiva de jogos e preparação para publicação

**Data:** 21/11/2026 · **Branch:** `feat/layout-unificado-snake-quest` · **Proibição:** sem merge, deploy manual, domínio ou alterações em D1/produção.

## Conclusão de escopo

- **Snake (Clássico/Aventura/Evolution):** motor, interface, convites, resultados, conteúdo e ranking estão cobertos por testes existentes (`tests/snake.spec.ts`, regressões compartilhadas). As artes Snake já foram homologadas. Nenhum defeito novo reproduzido nesta auditoria de código.
- **Tetris (Clássico/Sprint/Sobrevivência):** existem testes de movimentação, pausa, score, classificação e responsividade (`tests/tetris.spec.ts`, regressões compartilhadas). Artes Tetris já homologadas. Nenhum defeito novo reproduzido nesta auditoria de código.
- **Pixel Quest:** `tests/pixel-quest.spec.ts` cobre fase, controles, mobile e navegação. `tests/ranking-guest-invite.spec.ts` cobre registro de conclusão por API simulada. **D1 Preview real** tem dois resultados de Pixel Quest, 674 e 764 pontos (confirmados pelo proprietário em consulta somente leitura em 21/11); não prova 100% de sucesso para novas partidas. **BUG-QUEST-05:** manter como observação/reprodução de falha intermitente, não como impedimento estrutural comprovado.
- **Segurança de rankings:** `verified:false` continua explícito na API; a entrada é autodeclarada, portanto requer política de confiança/antifraude antes de apresentar rankings como verificados. Não mascarar ou invalidar recordes atuais.
- **D1 Preview:** consulta do proprietário confirmou 23 recordes em sete modos, chaves e índices presentes, `best_score_milli` e vínculos de contas existentes. Não solicitar repetição desta verificação. Não acessar dados pessoais. Binding da UI não foi confirmado; não bloquear o trabalho dos jogos por esse ponto enquanto o Preview funcional não apresentar erro real.

## Decisão de produto — lançamento progressivo do Pixel Quest (21/11/2026)

- **MVP público:** lançar OldArcade com **Mundo 1 — Floresta Esmeralda**, fases **1-1, 1-2 e 1-3**, incluindo **chefão ao final de 1-3**. A experiência precisa ser completa e satisfatória por si só; mundo incompleto não deve impedir o lançamento dos três jogos.
- **Atualizações posteriores, sem prometer datas:** **Mundo 2 — Cavernas de Cristal**, cinco fases (2-1 a 2-5), chefão na 2-5; **Mundo 3 — Fortaleza do Portal**, oito fases (3-1 a 3-8), chefão na 3-8. Total planejado: 16 fases, 3 chefões. Mostrar esses mundos como **Em desenvolvimento / Em breve**, sem criar links falsos, prometer conteúdo jogável ou adicionar páginas vazias ao sitemap.
- **Retenção e cadastro:** visitante pode jogar o conteúdo disponível até o final, com avanço entre fases na mesma sessão, sem conta. Recarregar/sair encerra o progresso não salvo. Somente conta autenticada permite persistir e retomar a campanha após retornar; cadastro via modal global, sem sair do jogo e sem bloquear a continuidade do visitante.
- **Novidades opcionais:** oferecer opt-in separado para atualizações sobre os mundos futuros; não tratar criação de conta ou aceite dos Termos como consentimento automático para e-mails de novidades. Evitar prometer notificações até existir mecanismo operacional testado, cancelamento e tratamento de dados correspondente.
- **SEO editorial:** textos sobre os mundos seguintes devem informar que não estão jogáveis e explicar o que está previsto, sem usar páginas isca vazias. Conteúdo do Mundo 1 e dos três jogos deve ser útil, acessível e indexável no lançamento público aprovado.
- **Critério de lançamento:** Mundo 1 completo e testado (inclusive chefão, progressão, recuperação de campanha logada e visita sem login), além dos bloqueadores gerais do portal; mundos 2 e 3 não bloqueiam publicação.
- **Estado nesta data:** decisão registrada documentalmente; nenhuma fase nova ou sistema de notificações implementado por esta entrada.

## SEO — bloqueador real e correção preparada na branch

**Antes:** `public/robots.txt` bloqueava todo o rastreamento e `astro.config.mjs` só gerava sitemap quando `SITE_URL` estivesse definida; páginas usavam `noindex` sem SITE_URL.

**Implementado nesta branch:** 
1. `src/pages/robots.txt.ts` gera `Disallow: /` nos builds não liberados. Quando `SITE_URL` é HTTPS de domínio próprio e `PUBLIC_INDEXING_ENABLED=true`, gera `Allow: /` e declara `Sitemap: <origem>/sitemap-index.xml`.
2. `astro.config.mjs` só habilita `@astrojs/sitemap` com os dois critérios; não permite hostname de Preview `*.pages.dev` ou `example.invalid`.
3. `src/layouts/Base.astro` só emite `index,follow`, canonical e breadcrumbs estruturados quando a liberação explícita está ativa. HTML de Preview permanece `noindex,nofollow`.
4. `tests/seo-launch.spec.ts` cobre noindex de páginas centrais, presença do robots de Preview e ausência de sitemap público sem liberação.

**Atenção operacional:** `PUBLIC_INDEXING_ENABLED` deve ser `true` **somente no build aprovado do domínio canônico**; configure os ambientes separadamente para que nenhum Preview receba essa variável. `SITE_URL` deve ser a URL HTTPS definitiva confirmada pelo proprietário. O comportamento indexável **não foi publicado**. Até a aprovação de produção, o Preview permanece bloqueado. Após o lançamento, conferir o HTML servido, robots, sitemap, HTTP 200, links, canonical, Google Search Console e solicitar rastreamento das URLs canônicas. Não remover proteção antes do aceite.

## Testes e aceite

- CI da PR deve executar `npm run check`, `npm run build`, `npm run test:api` e `npm run test:e2e`. Registrar a execução específica do commit final, não inferir aprovação de builds anteriores.
- Validação manual necessária no Preview para iniciar/pausar/finalizar três jogos em desktop/mobile, login em modal, rankings Top 3/10 e imagens aprovadas. A validação visual é do proprietário.
- **Bloqueadores antes da publicação:** (a) release SEO com domínio definido e preview protegido; (b) aceite visual final; (c) revisão legal/operacional do controlador e política de privacidade; (d) classificação consciente dos riscos de ranking não verificado. Melhorias de navegação/novos jogos não são bloqueadores por si só.
- Conteúdo factual, H1 único, descrições e links internos possuem testes de regressão, mas não significam auditoria completa de todas as páginas pela Search Console.

## Fonte técnica Google Search Central

- https://developers.google.com/search/docs/essentials/technical
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

**Estado:** preparação concluída em branch; sem merge, deploy manual, mudanças de produção ou gravações D1.
