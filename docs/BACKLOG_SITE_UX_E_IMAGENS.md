# Old Arcade — Backlog do site, navegação e imagens (20/11/2026)

> Solicitado pelo proprietário enquanto a Etapa 3 era concluída. **É fila futura, NÃO trabalho realizado.** Plano original intacto: etapas 1/2/2B aprovadas; 3 em revisão final e homologação; depois 4 conteúdo/identidade, **4B navegação/home/categorias e acervo de imagens**, 5 regressão. O mesmo padrão de largura máxima de 980px e fullscreen independente continua válido. Não fazer merge/deploy manual.

## Etapa 4 — conteúdo editorial, institucional e versão

**SITE-01 — Revisar e criar páginas legais.** Verificados `/sobre/`, `/privacidade/`, `/contato/`; não há página `/termos/` no caminho pesquisado. Privacidade afirma erroneamente que cadastro não foi implementado; Contato/Sobre contêm trechos ultrapassados sobre serviços/contadores. Fazer inventário real de autenticação, dados pessoais e localStorage, cookies, Cloudflare/D1, analytics, avisos por e-mail e publicidade antes de escrever **Termos de Uso**, **Política de Privacidade** atualizada, Sobre e suporte. Evitar afirmações de serviços de remoção/recuperação inexistentes. Recomendar revisão jurídica antes de lançamento. Não publicar conteúdo legal fictício ou assumir conformidade sem avaliação.

**SITE-03 — Auditar versões do portal e dos jogos.** `package.json` mostra `0.2.0`, `Base.astro` exibe `v0.2.0-dev`, `gameRegistry.ts` mantém Snake `0.2.0-dev`, Tetris `0.1.0-dev`, Pixel Quest `0.1.0-dev` (valores vistos nesta revisão). Definir critério do portal x jogo; atualizar marcos reais, datas e diário de bordo com informações interessantes e verificáveis. Preservar todo histórico existente, sem inventar versões/lançamentos. Padronizar exibição entre rodapé, Sobre e bastidores do jogo.

**SITE-08 — História do Old Arcade.** Na home, o link "História do arcade" leva para Sobre, que narra **o projeto Old Arcade**, não a história de todos os arcades. Revisar rótulo para "História do Old Arcade" / "Conheça o Old Arcade" e atualizar o conteúdo dessa página na Etapa 4. Não confundir com os artigos históricos dos jogos.

## Etapa 4B — navegação global, compartilhamento, catálogo e home

**SITE-02 — Compartilhamento em redes sociais.** `GameShare.astro` já possui URLs em `gameShare.ts` para WhatsApp, Telegram, Facebook, X, Reddit e Bluesky; atualmente os links são textuais e expansíveis. Trocar por ícones reconhecíveis com `aria-label`, texto acessível, foco visível, toque mobile e links funcionais, mantendo pontuação/URL do jogo no convite e a ação nativa/cópia. **Não inventar compartilhamento direto para Instagram/TikTok** onde não há endpoint adequado; oferecer ação nativa/cópia.

**SITE-05 — Cabeçalho persistente.** Estudar e implementar `position:sticky; top:0` em vez de `position:fixed` (que sai do fluxo), com altura compacta, fundo legível, `z-index` abaixo de overlays e fullscreen, `scroll-margin-top` para âncoras/breadcrumbs, e respeito a teclado e mobile. Testar rolagem ao ler artigos, entrar no jogo, tela cheia e modal de conta para não esconder controles ou tabuleiro.

**SITE-06 — Menu Jogos dropdown.** Hoje `Base.astro` usa link `/#destaques`. Criar um único menu acessível de **jogos** (Snake, Tetris, Pixel Quest) e modalidades existentes usando `gameRegistry.ts`/`gameModes.js`; incluir "Ver todos" para a seção do catálogo. Funcionar por toque, teclado, clique e Escape, com gerenciamento de foco e `aria-expanded`. O navbar mobile atual rola horizontalmente: não deixar menu cortado. A simples abertura não pode interromper uma partida; ao trocar modo durante jogo, respeitar regra RF-MODOS-07.

**SITE-07 — Categorias preparadas para expansão.** Criar catálogo declarativo `gameCategories` ligando jogos a categorias coerentes (arcade, blocos/puzzle, plataforma etc., escolhidas pelo conteúdo verdadeiro). Criar `/categorias/` e páginas detalhadas apenas quando houver **pelo menos um jogo publicado/disponível**; categorias sem jogos ficam ocultas, não cards de "em breve" artificiais. Novos títulos entram automaticamente por categoria. Navegação, breadcrumbs, URLs, filtros e SEO seguem fonte de dados, sem contar modos como jogos.

**SITE-09 — Auditoria/reestudo da home.** Inspecionar hero, contador, biblioteca, sidebar e links inferiores em desktop/mobile. Remover duplicação: hoje Rankings e Minha conta estão no header, no menu lateral e nos links inferiores, além de um atalho de ranking adicional na lateral. O menu lateral só fica se acrescentar função própria (ex.: filtros por categoria/jogos, destaques, atividade contextual), **não como cópia do header**. Reduzir espaço de hero que esconde a biblioteca e permitir descobrir jogos rapidamente. Com o dropdown e categorias, definir a função de cada navegação antes de redesenhar. Manter contadores reais sem inventar métricas, sem colunas/links repetidos.

**SITE-04 — Acervo visual do Old Arcade, imagens uma por uma.** Levantar imagens atuais da hero, cards Snake/Tetris/Pixel Quest, artes de páginas e miniaturas. Especificar guia visual com proporção, cores, composição, tipografia (mínimo texto na imagem), retina e mobile, peso/formatos e copyright. Para **cada imagem**, preparar prompt contextualizado do jogo/site, gerar individualmente em uma sessão dedicada no ChatGPT (o usuário poderá criar com prompts separados), solicitar aprovação visual e somente então integrar em PR com alt text e compressão; manter arte anterior como fallback. Evitar substituir de uma vez todas as imagens ou adicionar mídia externa com licença incerta.

## Critérios gerais e dependências

- **Não** executar itens SITE-* durante a Etapa 3. Cada grupo entra em sua própria PR/subetapa com CI, Preview e aprovação visual.
- Preservar `docs/PLANO_PADRONIZACAO.md`, `AGENTS.md` e `docs/CONTINUIDADE.md` como pontos de continuidade. Documentar o que foi feito e o que continua pendente.
- Na Etapa 4, atualizar também artigos históricos de SEO, palavras relevantes em `<strong>` com moderação, fontes, filmes de jogos do gênero plataforma no Quest, livros e afiliados condicionados a verificação/autorização. Todos os refinamentos de motor/HUD/sprites e bugs do Quest seguem a fila `RF-*` e `BUG-*` em `CONTINUIDADE.md`.
