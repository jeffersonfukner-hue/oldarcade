# OldArcade — continuidade obrigatória

> Leia este arquivo e `AGENTS.md` ao retomar. **Verifique o estado real no GitHub antes de considerar informações abaixo atuais.**

**Repositório:** `jeffersonfukner-hue/oldarcade`  
**Branch de trabalho:** `feat/fundacao-snake`  
**PR:** [#1 — Fundação OldArcade: home, SEO inicial e Snake jogável](https://github.com/jeffersonfukner-hue/oldarcade/pull/1) — rascunho, não mesclada  
**Última verificação antes desta atualização:** [Actions #43779228548](https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/43779228548) — success, commit `7da2542`.

## Objetivo
Criar do zero um site de jogos retrô com foco real em jogabilidade, história documentada, SEO rastreável, futura monetização com AdSense e administração, adicionando um jogo por vez. Nenhum domínio de produção foi autorizado.

## Feito e verificado
- Repositório GitHub novo e PR #1 em branch isolada.
- Home, páginas institucionais, Snake em Canvas, fullscreen do painel, controles, recordes/ranking **locais**, tutorial e história documentada.
- Registro histórico individual: Snake = Jogo #001, v0.1.0, iniciado em 15/11/2026; arquivo fonte `src/data/gameRegistry.ts`.
- Astro estático e CI de build, tipos e Playwright desktop/mobile.
- CI da implementação e registro histórico aprovado; pacote ZIP de Preview gerado pelo GitHub Actions em execução anterior. A URL pública de Preview **não** foi configurada.

## Ambiente Cloudflare — posição exata da conversa
O usuário está na tela de **Cloudflare Pages: Set up builds and deployments** com:
- GitHub: `jeffersonfukner-hue/oldarcade`
- Project name: `oldarcade` (URL sugerida `oldarcade-17c.pages.dev`)
- Production branch: `main`
- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: padrão
- Botão `Save and Deploy` **ainda não clicado**.

**Decisão de segurança:** não autorizar o botão enquanto não houver um plano real para a primeira implantação. `main` contém apenas README e **não tem aplicação Astro**. Conectar esse repositório sem preparar a branch base pode falhar no primeiro build. Não transferir a produção para a branch de desenvolvimento para "facilitar". Não vincular domínio. A próxima etapa técnica deve resolver a implantação inicial isolada e explicar o impacto ao usuário antes de qualquer clique.

## Pendências prioritárias
1. Preparar a implantação inicial do Pages sem publicar Snake na branch `main` e sem domínio de produção. Uma opção é criar uma **página provisória neutra** em `main` após autorização do usuário para essa publicação inicial em `pages.dev`, mantendo Snake somente na branch `feat/fundacao-snake`. Não confundir URL `pages.dev` de produção técnica com o domínio de produção do usuário.
2. Completar conexão do Pages e confirmar URL de **branch preview** sem deploy da branch de desenvolvimento como produção.
3. Validar Snake no navegador humano, especialmente tecla Esc, mobile, ranking local e conteúdo.
4. Futuro: métricas/rankings globais com Cloudflare, administração segura, revisão de privacidade/SEO/AdSense. Não antecipar implementação sem validar jogo piloto.

## Formato obrigatório ao finalizar uma etapa
**Feito:** ações concretas executadas.  
**Verificado:** CI, URLs ou testes confirmados (com link).  
**Pendente:** itens que realmente restam.  
**Próxima ação:** uma instrução operacional única para o usuário ou botão contextual "Continuar", nunca apenas "aguarde".

## Mensagem de retomada para novo chat
> Continue o OldArcade em `jeffersonfukner-hue/oldarcade`. Antes de agir, leia `AGENTS.md`, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e `docs/VERSIONAMENTO_E_PUBLICACAO.md` na branch `feat/fundacao-snake`; confira PR #1 e os GitHub Actions. Estamos configurando Cloudflare Pages, e o usuário está na tela de configuração com `main` como branch de produção e o botão Save and Deploy ainda não clicado. Respeite a regra de não publicar nem mesclar sem autorização, execute trabalhos de GitHub antes de pedir próximo passo e oriente a interface uma ação por resposta.
