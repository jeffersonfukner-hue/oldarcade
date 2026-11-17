# Como executar e testar o Preview

## GitHub Actions (automático)
A branch `feat/fundacao-snake` gera o pacote `oldarcade-preview` após o build e os testes de navegador serem aprovados. Abra a execução verde em **Actions > Verificações > Artifacts** e baixe o ZIP. Ele contém o site estático, **não** uma URL pública.

## Preview local (sem deploy)
No computador, com Node.js 22 instalado:

```bash
git clone https://github.com/jeffersonfukner-hue/oldarcade.git
cd oldarcade
git switch feat/fundacao-snake
npm install
npm run dev
```

Abra `http://localhost:4321/jogos/snake/`. O site fica disponível apenas no computador local. Para testar o ZIP do Actions, extraia-o e execute um servidor estático dentro da pasta extraída (por exemplo, `npx serve .`); links foram construídos para raiz do servidor e não para o protocolo `file://`.

## Preview público isolado (conectado ao Cloudflare Pages)
A PR #1 recebe deploys automáticos de Preview pelo projeto Cloudflare Pages `oldarcade-17c`, independentes da produção. Em 17/11/2026, o comentário automático da PR confirmou **deploy bem-sucedido** do commit `76a9be3`:
- Deploy imutável dessa revisão: https://a87c5242.oldarcade-17c.pages.dev/jogos/snake/aventura/
- Alias da branch (pode apontar para revisão mais recente): https://feat-fundacao-snake.oldarcade-17c.pages.dev/jogos/snake/aventura/
- Evidência: https://github.com/jeffersonfukner-hue/oldarcade/pull/1#issuecomment-6904416005

**Deploy bem-sucedido não comprova jogo validado.** Conferir visualmente desktop 1440/1024, mobile 390/320, teclado, toque, tela cheia, entrada/saída, animações, níveis e recordes; documentar resultado e navegador. A leitura automatizada do endereço retornou acesso indisponível na ferramenta de consulta usada, portanto esta etapa ainda não validou visualmente o site. **Não vincular domínio nem publicar produção sem autorização.**

## Bloqueios intencionais
- `robots.txt` desabilita a indexação nesta fase.
- Sem anúncios, Cloudflare D1 ou ranking global.
- Não fazer merge ou publicação sem autorização.
