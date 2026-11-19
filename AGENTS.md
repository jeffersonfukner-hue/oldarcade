> **Contrato obrigatório para todo jogo/modo:** [docs/PADROES_GLOBAIS_DOS_JOGOS.md](docs/PADROES_GLOBAIS_DOS_JOGOS.md). Reutilize componentes e integrações existentes sem exigir repetição de requisitos aprovados.

# OldArcade — regras permanentes para agentes

> Antes de qualquer alteração, ler este arquivo, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e, ao tratar de releases, `docs/VERSIONAMENTO_E_PUBLICACAO.md`.

## Verificação obrigatória antes de qualquer mudança
- Executar o **Checklist obrigatório — mudanças globais e prevenção de regressão** em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` **antes de editar código**. A leitura dos padrões aprovados é uma etapa do trabalho, não depende do proprietário repetir instruções.
- Toda alteração de característica global (visual, countdown, HUD, efeitos, modais, ranking, fullscreen, tipografia, cores) acontece na **fonte compartilhada** e alcança, na mesma PR, todos os jogos e modos consumidores. Proibido corrigir individualmente cada jogo se o comportamento é padrão.
- Conferir lista de consumidores, remover duplicações e criar regressão cruzada antes de considerar a etapa pronta. CI e publicação de Preview são evidências diferentes da aprovação visual do proprietário.

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

## SQL e migrações D1 — fluxo operacional aprovado (17/11/2026)
- Quando uma funcionalidade precisar de migração, entregar imediatamente o SQL exato, pronto para copiar e executar, identificando banco e ambiente; não transformar a entrega do SQL em bloqueio burocrático nem exigir nova discussão sobre o procedimento já aprovado.
- O proprietário **executa manualmente** o SQL no Cloudflare e confirma com "pronto"; o agente nunca executa migrações nem modifica D1 por conta própria. Não assumir que o banco foi atualizado antes da confirmação.
- Depois da confirmação, registrar a aplicação informada em `docs/CONTINUIDADE.md` (separando declaração do proprietário de validação técnica), seguir diretamente para verificações seguras de API/Preview e testes. Não consumir tentativas únicas ou alterar dados sem orientação.
- Preview e produção são ambientes separados. Autorização para SQL em Preview não autoriza produção, merge ou publicação. Fornecer sempre o SQL da revisão efetiva do repositório, sem improvisar esquema.

## Fluxo contínuo: implementação integral, intervenções no momento certo e validação como jogador (17/11/2026)
- **Objetivo central: desenvolvimento sem gargalos artificiais.** O agente conduz implementação, integração, depuração, testes técnicos e documentação até a entrega funcional; o proprietário está disponível para atuar sempre que sua intervenção for necessária para destravar o trabalho.
- **Pedir intervenção imediatamente quando surgir a dependência real**, nunca adiar SQL, permissão, configuração de serviço, escolha de produto, acesso ou outra ação exclusiva do proprietário para o fim da entrega. Entregar naquele momento a instrução operacional completa, objetiva e suficiente, com banco/ambiente/impacto quando aplicável; orientar uma ação por vez quando houver sequência de operações manuais. Após o "pronto", retomar a execução técnica sem reabrir decisões.
- **SQL:** o agente fornece o script integral e fiel à revisão atual assim que for necessário; o proprietário executa manualmente no D1 indicado. Podem existir tantas migrações quanto forem tecnicamente necessárias. Nunca executar SQL no lugar do proprietário ou tomar autorização de Preview como autorização de produção.
- **Evitar testes picados do proprietário.** API, JSON, SQL de verificação, CI, testes unitários, integração e E2E são responsabilidade do agente, sempre que as ferramentas permitirem. Pedir ações técnicas ao proprietário apenas quando realmente indispensáveis e inacessíveis ao agente, sem transformá-las em validação funcional repetitiva.
- **Validação de produto pelo proprietário:** após concluir os componentes da entrega, executar check, build, testes API/integração/E2E desktop/mobile e QA de Preview quando acessível; corrigir regressões e então apresentar uma experiência integrada para ele testar naturalmente **como jogador**, com URL exata e resumo conciso. Se não for possível comprovar algo, declarar a limitação com precisão, sem afirmar CI verde/QA concluído.
- Decisões já aprovadas e padrões globais devem ser reaproveitados. Nenhuma dessas regras autoriza merge, deploy de produção ou alteração de ambiente produtivo sem autorização específica.

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
