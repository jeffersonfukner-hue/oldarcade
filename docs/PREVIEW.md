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

## Preview público isolado (pendente de conexão)
Para disponibilizar uma URL temporária do tipo `<branch>.<projeto>.pages.dev`, é necessário conectar este GitHub a um projeto Cloudflare Pages e configurar o comando `npm run build`, saída `dist` e branch de produção `main`. Isso precisa de uma configuração inicial na conta Cloudflare; este repositório não tem credenciais para fazer essa conexão automaticamente. **Não vincule o domínio de produção ainda.**

## Bloqueios intencionais
- `robots.txt` desabilita a indexação nesta fase.
- Sem anúncios, Cloudflare D1 ou ranking global.
- Não fazer merge ou publicação sem autorização.
