> **Contrato obrigatório para todo jogo/modo:** [docs/PADROES_GLOBAIS_DOS_JOGOS.md](docs/PADROES_GLOBAIS_DOS_JOGOS.md). Reutilize componentes e integrações existentes sem exigir repetição de requisitos aprovados.

# OldArcade — regras permanentes para agentes

> Antes de qualquer alteração, ler este arquivo, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e, ao tratar de releases, `docs/VERSIONAMENTO_E_PUBLICACAO.md`.

## Fonte de verdade e fluxo
- Repositório: `jeffersonfukner-hue/oldarcade`.
- Código, documentação e configurações mudam via GitHub; implementar em branch e PR, com evidências de CI.
- `main` é a base estável. **Não fazer merge, deploy de produção ou vincular domínio sem autorização explícita e atual do proprietário.**
- Cloudflare Pages será usado para Preview de branch, separado do domínio de produção.
- Não usar Lovable; não gastar créditos de serviços externos por iniciativa própria.
- Não reabrir decisões já aprovadas sem motivo técnico concreto.

## Conversa e próxima ação — obrigatório
1. Ao concluir qualquer etapa, informar **o que foi feito**, **o que foi comprovado**, **o que falta** e **a próxima ação exata**.
2. Nunca terminar uma resposta apenas com "aguarde", "vou preparar", "não clique ainda" ou "depois continuamos" sem realizar a ação autorizada ou indicar o passo seguinte.
3. Quando um passo for do usuário, orientar **uma única ação por vez**, aguardar "pronto"/print e então responder com a ação seguinte.
4. Quando o trabalho for do agente, **executar primeiro** e trazer resultado real. Se não puder executar, explicar o bloqueio e oferecer uma alternativa específica.
5. Quando a execução depender de novo turno, apresentar botão "Continuar" com prompt contextual, quando disponível; caso contrário, uma mensagem copiável.
6. Não afirmar teste, Preview, publicação ou ação como concluídos sem evidência. Diferenciar "preparado" de "online" e "CI verde" de "teste manual concluído".
7. Se a conversa alcançar limite de contexto, não tentar improvisar a partir da memória: atualizar `docs/CONTINUIDADE.md`, apresentar link e mensagem de retomada pronta com repo, branch, PR, ambiente, estado, pendências, próxima ação e restrições.
8. Ao iniciar nova conversa, ler esses documentos diretamente do GitHub e verificar a situação atual de branch, PR e Actions antes de agir.

## Segurança e qualidade
- Jogabilidade em primeiro lugar, um jogo por vez, HTML indexável, SEO verdadeiro, história com fontes, sem conteúdo artificial de volume.
- Nicknames e resultados locais não são rankings globais; não apresentar métricas fictícias.
- Sem rastreamento ou AdSense antes de política/consentimento adequado.
- Testes automatizados não substituem validação manual de teclado, tela cheia, dispositivos e Preview.
- Não publicar jogos protegidos por direitos sem licenciamento adequado.
- Versão do portal e versão de cada jogo são distintas. Manter histórico factual e imutável de versões com data e conteúdo.

## Continuidade entre conversas — compromisso operacional
- Após mudanças relevantes, manter o bloco **ESTADO ATUAL PARA NOVO CHAT** no topo de `docs/CONTINUIDADE.md`, com estado verificável, decisões aprovadas, commits, CI, Preview, pendências e próxima ação.
- Nunca deixar o proprietário depender de lembrar decisões ou reexplicar contexto de uma conversa antiga. Documentar também backlog futuro sem implementá-lo prematuramente.
- Na retomada, priorizar esse bloco, mas confirmar o HEAD real e a situação do CI; documentação não substitui verificação técnica.
