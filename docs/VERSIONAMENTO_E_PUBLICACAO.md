> **Contrato obrigatório para todo jogo/modo:** [PADROES_GLOBAIS_DOS_JOGOS.md](PADROES_GLOBAIS_DOS_JOGOS.md). Histórico abaixo não substitui os padrões globais vigentes.

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

## Marcos de modalidades sem inflar versões
- O Snake é **um jogo (#001)**, com modos Clássico e Aventura; novas modalidades não recebem número de jogo.
- Manter em `gameRegistry.ts` um histórico de versões do título **e** marcos datados das modalidades, com descrições factuais. O histórico de modos pode crescer sem incrementar a versão do jogo ou do portal.
- Uma versão de jogo/portal só muda quando uma entrega funcional é consolidada e aprovada; cada commit, CI ou Preview não é uma versão. Não alterar notas antigas retroativamente.
- O rodapé indica a versão do pacote do portal em desenvolvimento; não representa a quantidade de deploys Cloudflare nem lançamento público.

## Redução de deploys de Preview
- Cloudflare Pages está conectado ao GitHub com deploy automático de branch. Commits sucessivos podem gerar muitos Previews sem constituir releases.
- **Padrão de trabalho:** reunir arquivos relacionados em um único commit por entrega e verificar CI antes de enviar outra correção; preferir commit multi-arquivo, evitando commits por arquivo.
- Não desabilitar deploy automático, alterar branch de produção, configurações Cloudflare ou domínio sem uma decisão separada e aprovação explícita.
