# OldArcade — backlog futuro: moeda virtual e recompensas

**Situação:** ideia aprovada para registro em 18/11/2026. **Não implementada.** Não criar tabelas, saldo, cobrança, interfaces de compra ou gastar créditos de serviços externos antes de decidir detalhes e autorizar o desenvolvimento.

## Visão do produto
Criar uma moeda própria do OldArcade, conquistada por participação e desempenho, para desbloquear benefícios e experiências adicionais. O objetivo inicial é incentivar o retorno e a exploração dos jogos, sem bloquear o acesso gratuito normal.

## Possibilidades a avaliar
1. **Ganhar moedas sem pagar:** participação em Desafios Diários, conquistas por jogo, metas pessoais, frequência saudável e marcos de habilidade. Quantidades, limites e critérios ainda precisam ser definidos; evitar recompensar volume artificial de partidas ou incentivar tempo excessivo de uso.
2. **Usar moedas:** desbloquear **replay recreativo de Desafios Diários de datas anteriores**, modos/temas opcionais, desafios extras, personalização de avatar/perfil e outros benefícios futuros, conforme aprovação do proprietário.
3. **Moeda vendida futuramente:** considerar pacotes de moedas adquiríveis por dinheiro real apenas em uma fase posterior, depois de confirmar utilidade, economia, controles de abuso, política de reembolso, tributação, consumidor e exigências legais pertinentes. **Venda não está aprovada nem ativa.**

## Condições técnicas e integridade do jogo
- O Desafio Diário oficial continua com **uma tentativa autenticada por jogo/dia**, já prevista no contrato global. **Uma moeda jamais reabre, apaga nem substitui essa tentativa.**
- O acesso a desafio anterior comprado com moedas seria uma **partida de replay separada, identificada como recreativa**, usando o seed e a versão histórica apropriados quando tecnicamente suportados, **sem alterar a tentativa oficial, o histórico competitivo ou os rankings**. Regras históricas e compatibilidade entre versões precisam ser preservadas ou o replay deve ser marcado como indisponível.
- Persistir carteira e movimentações no servidor com ledger auditável, operações atômicas/idempotentes, verificação de autenticação, limites e proteção contra duplicações/fraudes. Não confiar em saldo do cliente nem permitir saldos negativos/acertos silenciosos.
- Se houver compra real: separar créditos gratuitos e pagos caso exigido pela política comercial; planejar cancelamento/reembolso, privacidade, prevenção a fraude e tratamento de menores antes do lançamento.
- Definir nomenclatura, ícone, saldo inicial, regras de ganho/custo, validade, transferências (presumidamente não), recuperação de conta, natureza não sacável e termos transparentes **antes de codificar**.
- Não vincular valor monetário a resultados competitivos oficiais. Evitar mecanismos de sorte com pagamento, apostas ou venda de vantagem nos rankings.
- Construir como sistema compartilhado para qualquer jogo atual ou futuro, não criar carteira individual por modalidade. Design consistente com Home e Minha Conta.

## Ordem sugerida (a ser aprovada futuramente)
1. Definir economia, recompensas e benefícios, sem dinheiro real.
2. Implementar carteira gratuita, histórico de créditos/débitos e antifraude com testes.
3. Introduzir replay recreativo de desafios anteriores, claramente separado da competição.
4. Avaliar outros desbloqueios e experiência de usuário.
5. Só então estudar venda de moeda, provedores, obrigações legais e modelo comercial.

**Não impactar o bloqueio atual do D1:** resolver primeiro a ausência da tabela `daily_challenge_attempts` no banco Preview antes de evoluir a funcionalidade.
