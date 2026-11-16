# OldArcade — versões, rastreabilidade e publicação

## Identificadores separados
- Versão do site: versão geral, discreta no rodapé, associada ao código efetivamente publicado.
- Versão do jogo: `src/data/gameRegistry.ts`, com número sequencial permanente, data de criação e notas por versão (ex.: Snake Jogo #001, v0.1.0).
- **Não** incrementar versões só porque um commit, sincronização ou CI ocorreu.
- Entradas do histórico são fatos editoriais do desenvolvimento. Nunca reescrever um lançamento antigo como se fosse novo.

## Regras de release
1. Desenvolver na branch e abrir/manter PR; rodar CI e validar Preview.
2. Registrar mudanças do jogo apenas quando a entrega for consolidada; distinguir "versão de testes" de "publicada".
3. Preparar versão do portal após aceite da entrega, sem publicar automaticamente.
4. Somente o proprietário autoriza merge e publicação. Uma versão preparada **não** prova que está no ar.
5. Após implantação, verificar a URL e registrar commit, versão, data, ambiente e evidência em `docs/CONTINUIDADE.md`.
6. Falha de deploy não gera nova versão por si só.

## Cloudflare
- `main` representa a branch de produção técnica do projeto Pages; Preview de features deve apontar para branches independentes.
- Antes de configurar um deploy automático que atinja uma URL pública, explicar exatamente que URL ficará acessível, que conteúdo irá aparecer e pedir autorização explícita.
- Não adicionar domínio customizado antes da aprovação.
- O `robots.txt` atual bloqueia indexação intencionalmente; mudar somente na preparação de publicação pública com revisão do SEO.
