## TET-08 — evidência local reproduzida (25/11/2026)
- Node v22.16.0: `node --test tests-api/*.test.mjs` em cópia parcial de nove arquivos com Git blob SHA idêntico ao commit 8b6d1ad699a1d7f524fe3543988d9753c2692530. Primeira execução 8/8; ampliada com tetris-progress.test.mjs, 11/11, zero falhas, TAP duration_ms 152.557344 (tempo do executor, não duração de trabalho). Cobertura de regras, contadores, desbloqueio, limite, resistência, ranking, HTTP 503 sem banco e 401 sem sessão. Não é teste de integração D1 nem de navegador; correções TS ainda não verificadas em execução.
- Clone HTTPS local falhou por DNS (Could not resolve host: github.com); check/build/E2E completos pendentes. Não liberar Preview. Nenhum CI remoto, D1, merge ou deploy. Migração 0012 aditiva ainda não aplicada. Tempo de trabalho não registrado.

## TET-08 — correções de integração (25/11/2026)
- Limpeza proibida na resistência encerra antes de creditar linhas/pontos; envio v2 tem trava de concorrência, reinício descarta pendência e troca de identidade invalida resultado da rodada. Botão de vitória seleciona próxima missão se desbloqueada. Revisão estática, testes ainda pendentes; os oito resultados relatados anteriormente não possuem evidência de execução recuperada e não são certificados. Sem CI, merge, deploy, D1 ou gastos. Tempo não registrado.

## TET-06/07 integração — 25/11/2026
- Progresso da conta derivado de recordes de missões v2 confirmados, sequência validada no POST; visitantes mantêm progresso local separado, sem importação automática de vitórias antigas. GET de progresso autenticado. Ranking global e perfil recebem seletor compartilhado v2 dentro do card Tetris. Convite pós-missão reutiliza modal global sem evento de resultado Sprint legado. Corrigida validação das eliminações de resistência.
- Testes adicionais criados; validação integral pendente. Migração 0012 ainda não aplicada. Sem merge, deploy, D1 ou CI disparado. Tempo não registrado.

## TET-06/07 — 25/11/2026
- Campanha salva localmente com chave versionada e validação de prefixo; não sincroniza entre contas/dispositivos. Ranking v2 independente, por modo/missão, com GET público, POST autenticado e same-origin; pontuação por combos e tempo em colunas próprias. Sprint/C1/C7 menor tempo; sobrevivência/extras maior tempo; demais maior pontuação; desempates pelo outro indicador e data. Resultados autorrelatados (sem antifraude/replay), sem alterar registros antigos.
- Migração 0012 preparada, NÃO aplicada; ranking v2 indisponível até autorização e aplicação no Preview. Interface v2 nas páginas dos jogos; agregação na página global/perfil e convite integrado pós-missão ainda pendentes. Testes unitários criados; build/E2E/CI não executados. Commit preparado sem mover branch ativa. Sem deploy/merge/D1/gastos. Tempo não registrado.

## TET-04/05 — 25/11/2026
- Motor paramétrico de missões, oito missões de campanha sequencial e quatro extras livres integrados ao motor de Tetris. Seletor na rota Sprint existente; Sprint original permanece disponível com ranking legado. Missões não submetem resultados ao ranking Sprint. Progresso apenas em memória da sessão até TET-06; sem D1. Metas/limites são parâmetros iniciais para calibração.
- Testes unitários adicionados (ainda sem execução integral). CI não disparado; commit preparado sem mover PR ativo. TET-06/07/08 pendentes: persistência, ranking versionado, testes completos, revisão de layout e Preview. Tempo não registrado.

## TET-01 a TET-03 — 25/11/2026
- Progressão híbrida homologada: campanha sequencial e extras livres; primeira missão 40 linhas com limite de tempo; metas e limites ajustáveis. Preservar desafio diário suspenso.
- Código preparado: motor único de estatísticas por eliminação simultânea (100/200/400/800), contadores reiniciados por partida e painel compartilhado pelos três modos. Pontos de combo são paralelos ao placar legado, sem mudar ranking, recordes locais, eventos ou D1. No mobile estreito, painel abaixo do tabuleiro.
- TET-04 a TET-08 pendentes: motor de missões, persistência, ranking versionado, integração de tempo e testes. Não mesclar pontuações incompatíveis. Testes unitários adicionados, ainda não executados no repositório; build e QA pendentes. CI-ECONOMY-01: não atualizar PR aberto sem confirmar orçamento e gatilhos; nenhum deploy.
- Base: `851b20180a727841290c440f10e494cff5ec8a76`. Tempo de trabalho não registrado.

## PIXEL QUEST — bloqueio de registro público após derrota (23/11/2026)
- Detectado durante auditoria do placar: apesar da remoção do `stageRanks.record` no ramo de derrota, o evento global `oldarcade:game-finished` continuava acionando `modeRanking.ts` e `gameEndAccountInvite.ts`, possibilitando POST indevido do total parcial e convite falso para salvar marca.
- A conclusão de fase agora envia evento com `eligible:true`; derrota envia `eligible:false`, que o ranking compartilhado descarta e informa "Fase não concluída". Convite de registro é suprimido para derrota, sem remover o evento global de encerramento utilizado pelas demais integrações. Jogos não Quest preservam contrato antigo.
- Teste de regressão adicionado. Nenhum D1, merge, deploy, créditos pagos ou mudança de classificação em produção.

## PIXEL QUEST — HUD e placar coerentes com respawn (23/11/2026)
- Captura de homologação 1-2: HUD da fase 770, overlay campanha 2488, topo do canvas mostrava total 770; erro confirmado: chamada periódica a `drawPlatformScene` omitira o valor acumulado. Corrigida passagem explícita do total de fases anteriores e preservada a regra de não duplicar pontos da fase já concluída.
- Remover progresso de "Inimigos restantes" porque reaparecem; substituir por número informativo "Inimigos ativos agora" sem barra ou promessa de esgotamento. Manter barra de cristais obrigatórios.
- Total de eliminações exibido no HUD deve ser a soma dos quatro tipos na sessão atual, incluindo respawns; não misturar com a contagem de IDs únicos persistida no progresso salvo. A contagem por tipo não é reconstruída para sessões restauradas: tela identifica explicitamente o escopo de sessão.
- Exibir "Pontos da fase" e "Total da campanha" separadamente, com os mesmos dados da renderização. Tela de derrota discrimina a fase e o total parcial; **não registra marca pública ou recorde local para fase perdida**, nem confirma posição de ranking. Recordes da fase só são enviados após vitória, conforme `AGENTS.md`.
- Testes atualizados para layout e contratos do placar; conferir CI integral. Sem merge, deploy, D1 ou custos.

## PIXEL QUEST — respawn, contadores e corrida ao portal (23/11/2026)
- **Painel direito:** quatro ícones desenhados com os MESMOS sprites do jogo e quantidade de eliminações por espécie; contador contabiliza respawns e acumula somente enquanto a campanha está em andamento nesta sessão. Progresso restaurado do servidor não inclui breakdown histórico, que não deve ser inventado.
- **Respawn:** por espécie, patrulheiro 20s, corredor 24s, saltador 18s, sentinela 30s de tempo de partida ativo. Reaparecem na posição original, quando o jogador não está muito próximo; não entram em ciclos de pontuação automática. Cada eliminação concede pontos normais + possível combo. Campo `enemies` persistido preserva a contagem de IDs únicos derrotados por fase (até 30), sem quebrar a semântica legada; o contador visual registra todas as eliminações.
- **Portal:** ao coletar todas as gemas (e derrotar Guardião na 1-3), registrar instante da abertura e janela de graça proporcional à distância até a saída (mínimo 18s, distância / 160 px/s + 8s). Enquanto estiver no prazo não há multa adicional; depois, 12 pontos negativos por segundo completo de atraso, desconto somente ao concluir, pontuação final nunca abaixo de zero. O bônus de tempo existente continua. Aviso animado "PORTAL ABERTO! CORRA!" e contador no HUD/canvas; não altera as condições homologadas para abrir o portal.
- **Persistência:** contratos de progresso cliente/API ampliam somente o teto de pontuação para 1.000.000, igual ao ranking v2, pois eliminações repetidas podem exceder 10.000; nenhuma migração ou alteração do D1. Versões antigas continuam válidas. Ver CI do commit e teste visual.

## PIXEL QUEST — COMBO AÉREO (23/11/2026)
- O proprietário identificou duas eliminações de inimigos sem tocar o chão como combo legítimo. Regra implementada: contar pisões consecutivos até pouso; a primeira eliminação recebe apenas pontos normais, a segunda inicia COMBO x2 com bônus +30, terceira x3 com +60, crescendo +30 por eliminação até teto +150 por pisão. O power-up de pontos dobrados multiplica o bônus pela mesma função de pontuação existente.
- Contador reinicia no chão, em dano/escudo consumido, queda, morte e criação de fase. Não contabilizar cristais nem golpes no Guardião como eliminações de combo. Exibir texto de combo acima do personagem com o mesmo feedback global, preservando rankings/persistência.
- **Evidências:** `src/scripts/pixelQuest/gameplay.ts`, `src/scripts/scoreFeedback.ts`, `tests-api/pixel-quest-combat-v3.test.mjs`; validar CI do commit da entrega e testar no Preview sem merge/deploy pelo agente.

## PIXEL QUEST — refinamento homologável do balão multicolorido (23/11/2026)
- **Preservar o visual aprovado do balão.** O deslocamento foi desvinculado do término de 10,5 s do evento ambiental: ele surge pequeno pela direita, aproxima-se até aproximadamente 1,5×, mantém essa dimensão por um trecho e se afasta gradualmente; só é removido depois de cruzar inteiramente a borda esquerda.
- **Vento e câmera:** deriva lenta própria, com rajadas suaves e determinísticas; o avanço da câmera acrescenta pequeno efeito de parallax à esquerda. Parado, o jogador observa apenas a deriva pelo vento. Mudanças bruscas de câmera na troca de fase não teletransportam o balão. Pausa congela o relógio simulado e, portanto, o voo.
- **Exclusividade de eventos:** enquanto um balão estiver visível não mostrar outro evento especial, mantendo as demais animações e o ciclo dia/noite intactos.
- **Arquivos:** `src/scripts/pixelQuest/worldAtmosphere.ts`, `render.ts` e `tests-api/pixel-quest-atmosphere.test.mjs`. Verificar CI do commit novo; sem merge, deploy ou alterações no D1.

## PIXEL QUEST — ajuste visual do terreno e amanhecer (23/11/2026)
- **Solicitação:** remover o aspecto de grade dos blocos de solo e plataformas; suavizar a passagem da penumbra do início da campanha ao dia claro, sem mudança brusca ao primeiro movimento.
- **Implementação:** retirar exclusivamente o `strokeRect` aplicado a cada tile, preservando colisões, grama, texturas e geografia; substituir o limiar binário de cores de montanhas/árvores por interpolação contínua usando luminosidade da lua; acrescentar paradas intermediárias do céu às 06:00, 07:30 e 09:30, com interpolação suave baseada em tempo fracionário contínuo.
- **Preservação:** relógio global de 240 segundos por dia, início 06:00, tempo de campanha entre fases, pausas, sol e lua, ranking, D1 e HUD inalterados; nenhum deploy ou merge por esta alteração.
- **Validação:** testes para gradação do amanhecer e ausência de contornos por tile. Conferir CI do novo commit e depois homologação visual no Preview.

## PIXEL QUEST — cenário vivo, pontuação dupla e recordes provisórios (23/11/2026)
- **Feedback do proprietário:** ciclo solar contínuo foi bem recebido. Homologado preservar o HUD lateral direito e espelhar no topo interno do canvas **vida, dia/hora, fase, pontuação atual da fase e total acumulado da campanha**, usando o mesmo estado da partida, sem segunda gravação ou nova tabela.
- **Regra temporal imprescindível:** o relógio do mundo é único em toda a campanha, independente da posição do player. Uma fase encerrada às 12h30 leva a próxima a iniciar às 12h30, sem reinício; introdução/contagem/pausa não consomem o tempo do mundo. Só uma campanha nova reinicia o relógio. O Guardião pode ser enfrentado de dia ou de noite. Recuperação de progresso registrado soma os tempos das fases concluídas.
- **Céu e fauna:** posições separadas de sol e lua, ambos surgindo à esquerda e desaparecendo à direita, com sobreposição/fade suave em amanhecer e anoitecer. Estrelas e faixa de Via Láctea na noite; uma experiência especial ocasional por vez. Dia: pássaros, balões, aviões ou jatos. Noite: coruja, olhos piscando, silhueta de animal, estrela cadente ou meteorito decorativo. Meteorito com efeito de impacto VISUAL, não dano ao jogador. Tudo procedimental em Canvas 2D, sem assets/SQL/serviços adicionais.
- **Ranking e feedback:** comparar o placar de jogo com uma fotografia do ranking público capturada no início da campanha e preservada ao trocar fases; ranking por fase tem fotografia própria a cada início de fase. Recorde pessoal recebe feedback; 3º lugar mensagem 'Boa posição'; 2º 'Excelente'; 1º fogos. Essas comemorações são **provisórias**, pois dados concorrentes podem ter mudado; ao concluir, comparar a resposta efetiva do servidor, informar posição confirmada ou que outro jogador ultrapassou a marca. Não reivindicar liderança oficial sem resposta positiva de POST. Visitantes podem ver líderes mas não publicar marca sem conta. Não modificar critérios ou dados históricos de ranking.
- **Arquivos:** `src/scripts/pixelQuest/worldClock.ts`, `worldAtmosphere.ts`, `render.ts`, `index.ts`, `rankingMilestones.ts`, `rankingVisuals.ts`, `questRunRankings.ts`, `src/scripts/modeRanking.ts` e testes `tests-api/pixel-quest-atmosphere.test.mjs`, `pixel-quest-ranking-milestones.test.mjs`, `pixel-quest-world-time-victory.test.mjs`.
- **Comprovação:** commit de código `3dc332e2151f8d72a0a1b887ec16b46a3cb9e020`, CI GitHub Actions **#1279**, conclusão **success** (tipagem, build, testes Node/API, Playwright desktop/mobile, pacote de Preview de CI): https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/45236597295
- **Pendências:** deploy MANUAL pelo proprietário exclusivamente no Cloudflare Preview e homologação de visuais, hora nas transições, variação ambiental e celebrações; não houve deploy, merge, alteração D1 ou uso de serviços pagos nesta rodada.

## Pixel Quest — animações de vitória e relógio no canvas (23/11/2026)
- **Homologação de layout:** preservar integralmente o HUD lateral direito; dentro do canvas, espelhar uma faixa compacta de **vidas, dia/hora, fase e pontos**, alimentada pelo **mesmo estado** (run/nível), sem criar novo placar nem consultas/API adicionais.
- **Ciclo solar:** cenário deixa de depender do deslocamento horizontal. O relógio do mundo incrementa somente durante o jogo ativo; pausa, contagem, introdução e tela de fim não avançam; deslocar-se para trás nunca reverte o sol. Dia de 240 segundos efetivos, início às 06:00; amanhecer, dia, pôr do sol e noite; contador DIA N e hora no canvas. O relógio atravessa fases e retoma com soma dos tempos salvos das fases concluídas, sem exigência de migração SQL. Simulação local, custo extra de infraestrutura **zero**.
- **Guardião:** ao receber o golpe final, bônus +250 uma única vez, corpo pisca e cresce (primeiros 650ms), depois explode em fragmentos/fogos e confetes; destaque '+250 PONTOS' no próprio canvas. Toda a celebração dura ~2,6 s e suspende os movimentos e o tempo efetivo de pontuação. O portal continua exigindo TODAS as gemas e o Guardião derrotado; a celebração não conclui automaticamente a fase. Inimigos comuns podem encolher ao morrer, sem duplicar pontos.
- **Respeitar performance/acessibilidade:** efeitos procedurais com Canvas 2D e sem imagens/rede/serviços pagos; reduzir intensidade visual quando o usuário optar por menos movimento em revisão posterior. Regra de recordes já definida não foi alterada. Nenhum deploy/merge.
- **Evidências de código:** `src/scripts/pixelQuest/worldClock.ts`, `src/scripts/pixelQuest/victoryEffects.ts`, `src/scripts/pixelQuest/gameplay.ts`, `src/scripts/pixelQuest/render.ts`, `src/scripts/pixelQuest/index.ts`, `tests-api/pixel-quest-world-time-victory.test.mjs`.
- **Situação:** implementação versionada, CI do commit final deve ser confirmado e homologação visual/jogável pendente; não afirmar deploy.

## REGRA HOMOLOGADA — progresso Pixel Quest / Guardião (23/11/2026)
- **Fases 1/3 e 2/3:** coletar todas as gemas para liberar o portal; matar inimigos comuns é opcional e rende pontuação para rankings por fase e geral.
- **Fase 3/3:** coletar todas as gemas **e derrotar o Guardião** para concluir Mundo 1 e habilitar passagem para outro mundo (quando implementado). Matar os inimigos comuns não é obrigatório.
- **Confirmação técnica:** `portalUnlocked()` já usa exatamente esse contrato; não remover a condição do Guardião. Teste de regressão em `tests-api/pixel-quest-combat-v3.test.mjs`.
- **Estado:** Mundos 2 e 3 ainda não implementados; concluir 3/3 significa concluir o Mundo 1, não afirmar que a transição para Mundo 2 já é jogável.

## PIXEL QUEST — revisão de dificuldade solicitada após homologação parcial 60% (23/11/2026)
- Solicitação do proprietário: variar inimigos, acrescentar mais inimigos, efeito de pontuação acima da cabeça do personagem seguindo padrão do OldArcade, power-ups, maior dificuldade, plataformas com rotas de ida e retorno e cristais/inimigos sobre plataformas elevadas. Visuais atuais avaliados como melhora aproximada de 60%, **não homologados definitivamente**.
- Implementado na branch de desenvolvimento: quatro classes de inimigos (patrulheiro, corredor, saltador e sentinela); proteção de beirada para patrulha, escudo (absorve um ataque), coração (recupera vida) e bônus dobrado por 10 segundos; flutuação da pontuação usando o componente global `score-float`; recompensas de tipos de inimigo por dificuldade. Fases contêm 13, 19 e 22 inimigos e 16, 19 e 21 cristais, respectivamente; desafio de retorno destacado na fase 1-2: patamares nas linhas 13 → 11 → 9 → 8 e retorno até cristal alto à esquerda na linha 8.
- **Pontuação:** a vitória passa a reconciliar os pontos reais obtidos nos eventos de jogo mais bônus de tempo, sem sobrescrever os pontos de power-ups/inimigos diferenciados. Os rankings v2 preservam suas chaves e dados anteriores; novo balanceamento gera pontuação potencial diferente, sujeita à homologação. Nenhuma migração D1 solicitada para este lote.
- **Operação:** commits permitidos; proprietário faz Cloudflare Preview manual somente após indicação expressa. Não fazer merge, deploy nem modificar D1.
- **Verificações:** CI GitHub Actions #1239 **aprovado** para o commit de código `3ab370e849a5f654606609a65815bbb71a287779` (tipagem, build, API, Playwright desktop/mobile). https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/45106423560. Jogabilidade ainda depende de homologação no Preview pelo proprietário. Nenhum deploy/merge realizado pelo agente.

## ATUALIZAÇÃO DE EXECUÇÃO — Pixel Quest Mundo 1 (22/11/2026)
- **Regra operacional do proprietário:** commits no GitHub estão autorizados; **build/deploy do Cloudflare somente manual pelo proprietário**, quando indicar o commit e após terminar o lote. Não confundir commit com publicação.
- **Branch isolada de desenvolvimento:** `feat/pixel-quest-mundo1-finalizacao`, criada a partir de `feat/layout-unificado-snake-quest`; sem merge, sem publicação ou D1 alterado.
- **Implementado na branch:** mapas 1-1/1-2/1-3 expandidos (300/366/425 colunas, 14/17/19 cristais, 6/9/11 patrulheiros), solo terroso com grama, plataformas unidirecionais, chefão de cinco vidas com aviso/investida/recuperação, rankings v2 por fase e total, pontuação de derrota no total, endpoint de progresso autenticado e migração 0011 **somente versionada**.
- **Regras preservadas:** visitante joga sem conta; rankings antigos de 1-1 permanecem na chave legada; ranking na página é o total, HUD usa classificação da fase; novidades não têm opt-in automático.
- **Testes:** arquivos de regressão atualizados e novos testes Node adicionados, **não executados contra o HEAD remoto ainda**; pacote de referência local executou testes offline de mapas, limites matemáticos, classificação/progresso simulados e sintaxe, mas essa evidência não substitui CI/E2E nem teste visual.
- **Pendências de lançamento:** validar CI/Playwright sem consumir Cloudflare, corrigir defeitos, homologar nível de dificuldade, garantir salvamento em D1 Preview após autorização de migração e só então indicar commit para deploy manual.

## CORREÇÃO FINAL DO PACOTE PIXEL QUEST — somente imagens aceitas (20/11/2026)
- O proprietário rejeitou a inclusão de imagens repetitivas/pendentes. O ZIP anterior com `PENDENTE_DE_APROVACAO/how-to-play.png` **não deve ser usado**.
- **Pacote limpo:** `oldarcade-pixel-quest-somente-aprovadas.zip`; SHA-256 `31f0ba278f4e484bf03daf20da99dee33d18ac470a382053fd96bbbec594aab1`. Dois PNGs originais não modificados, mais `MANIFESTO.json`.
- **Capa definitiva aprovada:** `public/images/games/pixel-quest-cover.png`, SHA-256 `4f69be97eae06b40247b48645e87fa728e780e26928d18282b4c3c1cdd49c5ff`.
- **Imagem destinada pelo proprietário a checkpoint/inimigos/pontuação:** `public/images/editorial/pixel-quest/checkpoint-enemies.png`, SHA-256 `08d81756c6a7531bd1efd44e9e9ca8ea4463a0d0ca76a7b8127788af206c3abb`. Registrar como **selecionada para esse uso**, sem afirmar que todo o conjunto editorial foi homologado.
- **Descartada:** `how-to-play.png` e variações visuais quase idênticas à capa. Não colocar no ZIP aprovado, não subir nem aplicar.
- As 4 artes históricas já estão no repositório e não precisam de download/reenviar. Nenhum merge/deploy.

## DECISÃO DEFINITIVA MAIS RECENTE — capa Pixel Quest (20/11/2026)
- **Capa aprovada DEFINITIVAMENTE pelo proprietário:** a imagem mais recente, `pixel_quest_moonlit_crystal_valley.png`, **substitui a capa anteriormente escolhida**. A aprovação provisória registrada abaixo é histórica e foi explicitamente superada pela frase: "pode substituir a anterior, essa eh a aprovada".
- PNG original preservado sem edição: **1672 × 941**, SHA-256 `4f69be97eae06b40247b48645e87fa728e780e26928d18282b4c3c1cdd49c5ff`. Destino final: `public/images/games/pixel-quest-cover.png`. ZIP de transferência: `oldarcade-pixel-quest-capa-aprovada.zip`, SHA-256 `56c980f0d5085a1fb1473557175dd88c43fe3351fb5cc7c9fb89a4083f4ded3e`.
- **Conferência GitHub:** o destino ainda não existe na branch `feat/layout-unificado-snake-quest`, portanto é necessário upload do PNG original antes de integrá-lo à home. Não afirmar arquivo enviado ou site alterado.
- A versão de capa anterior fica **substituída como escolha**, preservada apenas como histórico, sem validade para publicação.
- Os demais editoriais de Pixel Quest **não estão aprovados**. Não gerar novas imagens, não fazer merge nem deploy sem solicitação.

## DECISÃO MAIS RECENTE — capa Pixel Quest aprovada provisoriamente (20/11/2026)
- O proprietário declarou **"aprovada por hora"** sobre a última imagem apresentada, de paisagem mais ampla com personagem amarelo em primeiro plano, cristais, ponte e portal roxo, arquivo de conversa `pixel_quest_moonlit_crystal_valley.png`.
- **Status: aprovação visual PROVISÓRIA**, não homologação definitiva nem autorização para substituição automática ou deploy. A capa anteriormente aprovada deve permanecer preservada como versão anterior; não apagar nem afirmar revogação.
- **Como jogar:** não aprovada. **Checkpoint, inimigos e pontuação:** a última arte foi destinada pelo proprietário a esse tema; não houve nova confirmação de aprovação individual. Ambas permanecem pendentes de homologação.
- **Nenhuma imagem nova aplicada ao código do site** por este registro. Não fazer merge nem deploy.

## CORREÇÃO DE HOMOLOGAÇÃO — Pixel Quest (20/11/2026)
- **SOMENTE a capa do Pixel Quest foi aprovada expressamente pelo proprietário.** A arte do guia `how-to-play` foi apenas apresentada e **NÃO foi aprovada**. A arte de checkpoint/inimigos/pontuação não foi concluída como arquivo individual; os painéis compostos gerados são **rejeitados como arte final e NÃO aprovados**.
- As quatro imagens históricas AVIF são legado já existente, **sem nova homologação** neste lote.
- Não enviar, aplicar ou substituir imagens editoriais não aprovadas; nenhuma imagem do Pixel Quest foi integrada nesta etapa. Manter Snake e Tetris homologados.

## HOMOLOGAÇÃO — Tetris visual aprovado; CI em correção (20/11/2026)
- Proprietário informou expressamente "homologado" após integração das 13 imagens Tetris e visualização no ambiente de teste Cloudflare Pages. **Homologação visual Tetris confirmada e preservada.** Snake já homologado. Próximo título: Pixel Quest.
- **CI comprovado:** o workflow de commit `d7413919b7` foi concluído com *failure* na etapa Playwright; falhas: testes legados ainda esperavam capas SVG de Snake/Tetris, carregamento lazy de imagem Pixel Quest não acionado na verificação e localizador ambíguo para "Tetris (2023)" após adição da legenda ilustrativa. Não declarar CI aprovado.
- Correções aplicadas somente aos testes `tests/home-catalog-daily.spec.ts`, `tests/historical-screenings.spec.ts` e `tests/editorial-history.spec.ts`, na mesma branch, sem alterar arte ou comportamento homologados. Verificar novo CI do commit HEAD e corrigir eventuais problemas reais.
- **Pixel Quest:** já existem quatro artes AVIF de timeline no GitHub, vinculadas ao código. Elas são **legado existente**, não o novo lote integral. Inventariar capa e textos específicos antes de criar imagens; não duplicar artes úteis já existentes nem reabrir homologações.
- Nenhum merge ou deploy realizado pela assistência.

## ESTADO VIGENTE — 13 imagens Tetris integradas na branch (20/11/2026)

- **Transferência confirmada:** os quatro PNGs restantes (`tetris-cover.png`, `sprint.png`, `survival.png`, `tetris-film-history.png`) foram encontrados na branch do PR #4; os respectivos SHA-1 de blobs Git coincidem exatamente com os hashes calculados sobre os PNGs originais dentro do ZIP aprovado. Os 9 arquivos anteriores já estavam confirmados, totalizando 13/13.
- **Aplicação realizada exclusivamente no Tetris:** `src/pages/index.astro` passou a usar a capa do Tetris; seis marcos em `src/data/historicalTimeline.ts` referenciam ilustrações históricas; `src/components/TetrisGame.astro` integra imagens no guia Clássico, Sprint e Sobrevivência; `src/components/HistoricalScreenings.astro` exibe imagem original de contexto do filme (2023), não um pôster; `src/components/TetrisEditorialArt.astro` é o componente para imagens, alt e legendas. Nenhuma mecânica, ranking ou imagem Pixel Quest foi alterada nesta integração.
- **Testes:** regressão Playwright acrescentada/atualizada em `tests/editorial-history.spec.ts` para verificar carregamento real, alt, timeline e ausência de overflow em 1280px e 320px. **Execução de build e Playwright ainda não comprovada**: container sem resolução DNS de github.com; aguardar resultado do CI exatamente no HEAD desta branch. Não presumir sucesso.
- **Homologação visual:** pendente do proprietário via ambiente de teste Cloudflare Pages; nenhuma publicação realizada por esta assistência. Sem merge/deploy.
- **Próxima etapa:** verificar CI do HEAD, resolver eventuais falhas, então homologação visual das páginas Tetris; Pixel Quest só depois.

## ESTADO PRIORITÁRIO — homologação das artes Tetris (20/11/2026)
- **13 imagens homologadas individualmente:** capa, nove imagens do primeiro lote, Sprint, Sobrevivência e contexto histórico do filme *Tetris* (2023). A última foi aprovada expressamente nesta conversa. Não alterar nem substituir arquivos sem novo aceite.
- **9 PNGs do primeiro lote já estão no repositório** na branch `feat/layout-unificado-snake-quest`. Verificou-se igualdade byte a byte indireta com ZIP local calculando Git blob SHA-1, exatamente igual ao GitHub para cada um dos 9.
- **4 PNGs ainda ausentes na branch:** `public/images/games/tetris-cover.png`, `public/images/editorial/tetris/sprint.png`, `public/images/editorial/tetris/survival.png`, `public/images/editorial/tetris/tetris-film-history.png`.
- **ZIP exclusivo de transferência manual** `oldarcade-tetris-4-imagens-restantes-aprovadas.zip`, SHA-256 `75eb17d7ddddac83e5a9948db96849f82b86e4da285bf461105e3b1a3edecb2c` (8.956.462 bytes). Inclui 4 PNGs individuais com caminhos finais e `manifest.json` com SHA-256 e Git blob SHA-1 conferidos.
- **Futuro:** após upload, verificar quatro hashes Git; só então implementar integrações das 13 imagens no Tetris e testes de regressão; usuário homologa visualmente usando deploy controlado no Cloudflare Pages. Nenhuma alteração no Tetris foi feita nesta etapa. Sem merge/deploy.

## ATUALIZAÇÃO — Lote Tetris 1 homologado (20/11/2026)
- Proprietário aprovou expressamente as 9 ilustrações do primeiro lote: seis marcos da timeline e três editoriais (como jogar, controles, estratégia). PNGs individuais originais preservados e conferidos por SHA-256, ZIP `oldarcade-tetris-lote-1-aprovado.zip` (SHA-256 `040dbc10021effd918e178bf6710e64a1f9b94f34373b2fddd73681d6e93aa85`). Destinos/hash no documento `docs/ASSETS_TETRIS_INVENTARIO.md`.
- Arquivos **não enviados ao GitHub** e **não aplicados**; upload manual está previsto. Não confundir criação do registro documental com commit binário.
- Lote restante: Sprint, Sobrevivência e referência cultural ao filme Tetris 2023. Primeira proposta de Sprint foi gerada para revisão, **sem homologação**; outras saídas do gerador que não atenderam aos temas não devem ser tratadas como imagens aprovadas.
- Sem merge/deploy.

## ESTADO ATUAL — Snake homologado visualmente; início do lote Tetris (20/11/2026)
- **Homologação visual EXPRESSA do Snake:** proprietário informou "homologado. pode ir pro tetris" após conferir a versão no Cloudflare Pages. O aceite cobre a integração visual das 15 imagens do Snake. Não confundir com certificação de SHA-256 byte a byte ou CI do HEAD, que continuam sem evidência suficiente; não desfazer homologação.
- **Próxima fase autorizada:** Tetris (#002), no padrão pixel art premium já homologado; inventário a partir de `TetrisGame.astro`, `TetrisHistory.astro`, `historicalTimeline.ts` e `historicalScreenings.ts`. Criar e apresentar arquivos individuais para aprovação antes de transferir/aplicar ao site. Três modos reais: Clássico, Sprint 40 linhas, Sobrevivência (aceleração a cada 30 segundos). Seis marcos históricos existentes: Electronika 60 (1984), microcomputadores (anos 1980), Game Boy (1989), The Tetris Company (1996), MoMA (2012), interpretações atuais; referência cultural ao filme Tetris (2023).
- **Restrições:** não tocar no Pixel Quest, não fazer merge/deploy, nem afirmar testes que não rodaram.

## ATUALIZAÇÃO PRIORITÁRIA — lote Snake completo integrado (20/11/2026)

- **15 de 15 PNGs presentes no GitHub** na branch do PR #4, todos com SHA Git de blob recuperado (12 originais mais `adventure-missions.png`, `evolution-powers.png`, `nibbler-documentary.png`). O texto histórico abaixo que diz que não houve upload refere-se a uma fase anterior.
- **Integração restrita ao Snake executada na branch**: capa home, seis marcos históricos, guia Clássico, Aventura e Evolution e referência cultural ao documentário. Nenhuma imagem foi recriada. Tetris e Pixel Quest não tiveram imagens substituídas.
- **Validação pendente:** teste de regressão e CI do HEAD; avaliação visual desktop/mobile pelo proprietário. O SHA-256 original dos arquivos não foi refeito a partir dos bytes remotos; presença no GitHub não deve ser confundida com integridade byte a byte comprovada.
- **Restrições:** não fazer merge ou deploy; não avançar ao Tetris antes de homologação visual do Snake.


- Disparo Evolution alterado conforme decisão do proprietário: automático e contínuo enquanto power-up ativo (70 ticks, cadência 4 ticks ~0,5s na velocidade base); sem tecla X. Tiro atravessa corpo, para na primeira fruta comum/rara (+10/+50 sem crescimento) ou obstáculo (3 impactos para destruir, dano visual); poderes especiais e Salva-Cobra não são coletados por tiro. Somente Preview experimental. A cadência por ticks acompanha velocidade/slow; balanceamento e testes E2E ainda pendentes.
> **Contrato obrigatório para todo jogo/modo:** [PADROES_GLOBAIS_DOS_JOGOS.md](PADROES_GLOBAIS_DOS_JOGOS.md). Histórico abaixo não substitui os padrões globais vigentes.

# OldArcade — continuidade obrigatória

## ESTADO ATUAL — pacote Snake / 12 PNGs aprovados (20/11/2026)
- **Aprovação visual concedida aos 12 arquivos individuais.** Conferidos 12 PNGs originais por SHA-256 e cópias sem alterações, agrupados em ZIP com caminhos futuros e manifesto; registro oficial de nomes/hashes/destinos em [docs/ASSETS_SNAKE_APROVADOS.md](ASSETS_SNAKE_APROVADOS.md).
- **IMPORTANTE: nenhum dos 12 PNGs foi inserido no repositório GitHub.** O commit `38d9814` contém **apenas documentação**, não as imagens. GitHub plugin disponível não aceita bytes de um arquivo local e a rede do container não alcança github.com. ZIP de transferência está nesta conversa. Capa já estava preservada no acervo pessoal; os demais PNGs fazem parte do ZIP da conversa.
- **Inventário dos textos:** o pacote cobre capa, seis eventos históricos, três temas de guia e os dois modos adicionais. Lacunas editoriais sugeridas antes de Tetris: guia específico das frutas/missões no Aventura; poderes/inimigos do Evolution; referência cultural Nibbler/filme `Man vs Snake`. Evitar inserir imagens em HUD/ranking/formulários. Nenhum novo asset complementar foi homologado.
- **Próximo passo:** transferência GitHub de bytes aprovados, SHA-256 pós-upload e commit de assets, ou seguir com aprovação do lote complementar sem alegar upload; somente aplicar imagens às páginas após a conclusão dos três jogos e autorização. Sem merge/deploy.



## ESTADO ATUAL — Snake: arte de capa aprovada, demais textos em inventário (20/11/2026)
- **Aprovação expressa:** imagem única `neon_pixel_snake_chasing_apple.png` (1672×941, PNG, 1.434.767 bytes, SHA-256 `e24e03a8c208a995288cfc955efa35238b74fb9bac66b5d7f995bfd2bf113e6f`). Salva sem alterar os bytes no acervo persistente do ChatGPT, caminho `/OldArcade/assets-aprovados/Snake/snake-capa-aprovada.png`. **Ainda NÃO está no repositório GitHub**, pois as ações GitHub disponíveis permitem criar arquivo UTF-8 ou blob a partir de conteúdo de texto/base64, mas não aceitam diretamente o arquivo binário montado. Não afirmar que o upload GitHub foi concluído.
- **Destino GitHub quando houver upload de bytes:** `public/images/games/snake-cover.png`; somente salvar, sem alterar `src/pages/index.astro` ou aplicar no site até aprovação global dos assets.
- **Nova instrução do proprietário:** ilustrar **todos os textos editoriais aplicáveis**, não apenas a linha do tempo. Inventário Snake: capa/card, introdução, guia Como jogar, controles, regras, conteúdos de Clássico/Evolution/Aventura, história e seus seis marcos, filmes/documentários citados, referências e histórico de desenvolvimento quando útil. **Não decorar HUD, rankings, formulários, navegação ou botões**: acessibilidade e funcionalidade são prioritárias. Cada arte deve corresponder ao conteúdo real, ser arquivo individual, sem texto embutido e com proporção final verificável; créditos e legendas são HTML do site, não impressos na arte.
- **Trabalho desta conversa:** inspeção somente leitura de código e arte existente, aprovação original recuperada, uma arte experimental da era de arcade Blockade (1976) gerada para revisão, sem aprovação e sem upload, outras tentativas genéricas de Snake não devem ser confundidas com ilustrações históricas aprovadas. A sequência de aprovações Snake → Tetris → Pixel Quest permanece vigente.
- **Não fazer merge/deploy.** Preservar decisões antigas. CI só pode ser considerado aprovado para commits específicos conferidos.


## DIREÇÃO ARTÍSTICA APROVADA E NOVO FLUXO DE ASSETS — 20/11/2026
- Variação **2 — pixel art premium** HOMOLOGADA como **padrão artístico global**. Já aprovou **o estilo**, NÃO os arquivos de cada título.
- **Ordem obrigatória:** 1) Snake (arte representativa da implementação atual + seis marcos históricos), apresentar imagens → aguardar aprovação → somente então salvar em assets do GitHub; 2) Tetris (arte principal + seis marcos), aprovação → salvar; 3) Pixel Quest (arte principal + quatro marcos), aprovação → salvar. Cada lote é um checkpoint independente.
- **Somente depois de confirmar os três lotes no repositório** iniciar, com autorização do proprietário, nova fase de troca das imagens do site. Não substituir os SVGs/cartões por novos arquivos antes disso. Quatro imagens de timeline Pixel Quest criadas/ligadas antes desta decisão são **legado existente**; não confundir com nova coleção homologada.
- Arte principal deve representar o **jogo real atualmente implementado** (conferir homepage, canvas e modos no repositório), não personagens ou cenários imaginados. Imagens históricas são **ilustrações editoriais originais**, sem se passar por capturas dos jogos antigos; legenda e link de fonte no site, quando aplicado.
- PR #4, branch `feat/layout-unificado-snake-quest`, sem merge/deploy. Não alterar decisões homologadas de etapas anteriores.


## ESTADO ATUAL — artes premium da timeline Pixel Quest (20/11/2026)
- **Quatro imagens premium reais foram integradas à branch do PR #4**, em `public/images/history/`, utilizando as quatro artes ilustrativas previamente geradas na conversa, com recorte da cena e otimização em AVIF. O componente único `HistoricalTimeline.astro` agora exibe essas imagens nas quatro entradas de Pixel Quest e mantém SVG como fallback somente nos marcos ainda sem raster próprio (Snake e Tetris).
- **Contrato global preservado:** imagem + legenda de ilustração autoral (não screenshot) + link da fonte histórica; dados declarativos em `historicalTimeline.ts`. Teste Playwright atualizado para verificar carregamento real da imagem e manter cobertura dos três jogos. O código atual não altera motores, pontuação, conta ou ranking.
- **Ainda pendentes:** artes premium específicas para Snake e Tetris (não confundir com os quatro arquivos do Pixel Quest), CI atualizado e homologação visual; **não declarar todos os jogos com arte premium já concluídos**. CI anterior #44805062229 foi aprovado antes da importação. Sem merge/deploy.


## ESTADO ATUAL — Etapa 4 / padrão global de timelines ilustradas (20/11/2026)
- **Solicitação expressa:** imagens históricas com legenda e fonte **para todos os jogos**, não só Pixel Quest. Implementados `src/components/HistoricalTimeline.astro` e `src/data/historicalTimeline.ts`, consumidos por Snake, Tetris e Pixel Quest com os mesmos estilos, SVGs editoriais originais, fontes históricas clicáveis e responsividade. Testes globais adicionados a `tests/editorial-history.spec.ts`.
- **Distinção obrigatória:** os desenhos vetoriais são **ilustrações, não screenshots, capas ou assets comerciais**. As imagens raster premium geradas no ChatGPT anteriormente não foram carregadas no repositório; continuam referências para refinamento visual posterior. Não alegar que esses arquivos foram integrados ou que o Pixel Quest já usa sprites premium no motor.
- **Aguardam:** CI do HEAD e validação visual; preservar homologações anteriores e não executar merge/deploy. Biblioteca de links SITE-09, futuro arcade inspirado em Space Panic e ART-QUEST-01 continuam documentados no backlog.


## ESTADO ATUAL — Etapa 4 / linha do tempo do Pixel Quest (20/11/2026)
- **Solicitação expressa executada na branch do PR #4:** `src/components/PixelQuestHistory.astro` agora inclui o mesmo título de linha do tempo resumida e a mesma classe visual `ol.timeline` do Snake. Quatro marcos factuais: Space Panic (1980), Donkey Kong (1981), Super Mario Bros. (1985) e início de desenvolvimento do Pixel Quest (novembro/2026).
- **Regressão adicionada:** `tests/editorial-history.spec.ts` verifica os quatro marcos e layout desktop/mobile de 320px, e preserva a timeline do Snake. Aguardar CI do HEAD e validação visual; não declarar homologação automaticamente.
- **Preservação:** histórico e filmes existentes, SITE-01/SITE-03/SITE-08, rankings e modalidades, Etapa 4B e Etapa 5 intactos. Sem merge/deploy.


## ESTADO ATUAL PARA NOVO CHAT — Etapa 4 / auditoria editorial dos jogos (20/11/2026)
- **Auditoria editorial IMPLEMENTADA E VALIDADA TECNICAMENTE; aguarda aceite visual do proprietário.** CI #44778401183 concluído com **success** no commit `eef05c6709be9914c749501938f113217227f517` (tipagem, build, testes API, Playwright desktop/mobile). CI inicial #44777354708 falhou em quatro expectativas legadas de testes, atualizadas sem reverter o comportamento editorial. CI documental anterior `#44769169922` aprovado no commit `ed75bd4b`. Histórias de Snake, Tetris e Pixel Quest foram confrontadas com fontes externas: site de Taneli Armanto e MoMA, Tetris Company, MoMA, Apple, SEGA e Nintendo. O corpo das narrativas históricas existente foi preservado; fontes foram complementadas sem confundir o jogo original com o projeto independente OldArcade.
- **Cinema com contexto:** `historicalScreenings.ts` e `HistoricalScreenings.astro` agora atendem **Snake, Tetris e Pixel Quest**. Para o Pixel Quest, **Super Mario Bros. O Filme (2023)** e **Sonic: O Filme (2020)** são explicitamente obras de outras franquias, não adaptações de Pixel Quest. Fontes oficiais Nintendo/SEGA e consultas de exibição identificadas em links distintos. A disponibilidade específica no Brasil para esses dois filmes fica **não confirmada**, evitando promessa de streaming.
- **Transparência:** consultas de Tetris/Snake renovadas em 20/11/2026 com catálogos JustWatch Brasil; `publishedAt` anterior preservado; `checkedAt` reflete a nova revisão. O componente distingue fonte cultural de serviço para consultar onde assistir, declara ausência de afiliados e mantém o link de correções. Sem links de afiliados, ofertas ou serviços fictícios.
- **Teste de regressão:** `tests/editorial-history.spec.ts` cobre páginas de todos os jogos, links de fonte e exibição, datas, aviso comercial, correções e relação explícita de filmes com outras franquias no mobile. CI confirmado; aguardar somente homologação visual. Não alterar decisões aprovadas de SITE-01, SITE-03, SITE-08 e etapas 1–3.
- **PR #4 draft, sem merge, deploy ou alterações no banco.** Etapa 4B e Etapa 5 permanecem futuras, separadas do aceite desta revisão editorial.


## ESTADO ATUAL PARA NOVO CHAT — Etapa 4 / SITE-08 (20/11/2026)
- **SITE-08 CONCLUÍDA E HOMOLOGADA VISUALMENTE PELO PROPRIETÁRIO EM 20/11/2026; CI #44764104075 APROVADO (success) no commit de código `51e0e06f`:** na home, a chamada editorial agora se chama **História do OldArcade** e leva diretamente à âncora `/sobre/#historia-oldarcade`. Na página Sobre, uma seção específica esclarece a origem do projeto (Snake, Tetris, Pixel Quest), distingue o projeto da história de todos os arcades e encaminha para o diário de bordo e o catálogo de jogos.
- **Sem reescrever o passado:** marcos e versões da SITE-03, que já foi homologada, permanecem intocados; textos legais e conta homologados na SITE-01 também foram preservados. Histórias dos jogos e filmes seguem como frente editorial distinta, sem reivindicação de marcas de terceiros ou de lançamentos em produção.
- **Teste SITE-08:** `tests/site-identity.spec.ts` confere rotulagem, link/âncora, três jogos, distinção editorial, diário de bordo e navegação 320px. CI #44764104075 concluído com sucesso, incluindo os testes de navegador; homologação visual confirmada pelo proprietário. Não reabrir decisões homologadas sem nova solicitação.
- PR #4 continua draft, sem merge/deploy, sem mudanças em D1, mecânicas de jogos, ranking, autenticação ou infraestrutura. **Próxima prioridade da Etapa 4:** auditoria factual e editorial dos artigos históricos de Snake, Tetris e Pixel Quest, suas fontes e referências culturais (livros/filmes), sem inventar disponibilidade de streaming ou programas de afiliados; a Etapa 4B e Etapa 5 continuam separadas.


## ESTADO ATUAL PARA NOVO CHAT — Etapa 4 / SITE-03 (20/11/2026)
- **SITE-03 CONCLUÍDA E HOMOLOGADA VISUALMENTE PELO PROPRIETÁRIO EM 20/11/2026.** CI funcional #44671411568 aprovado no commit `d31f4406`; CI documental #44672139189 aprovado no commit `60db580c`. Não reabrir a homologação sem solicitação explícita. Versão do portal mantida em `v0.2.0-dev` (base `package.json`), Snake `v0.2.0-dev`, Tetris e Pixel Quest `v0.1.0-dev` (fonte `gameRegistry.ts`). Nenhuma versão foi inventada, incrementada nem declarada como publicação oficial.
- **Fonte canônica:** `src/data/portalHistory.ts` fornece versão do portal, marcos de desenvolvimento auditados com links de commit e histórico imutável. `Base.astro` e `sobre.astro` exibem exatamente a mesma versão. A página Sobre também apresenta versões próprias dos três jogos. `GameDevelopmentHistory.astro` oferece links de commits quando presentes no registro do jogo, mantendo todos os históricos anteriores.
- **Referências auditadas no GitHub:** commits `102503cf`, `3a4c7909`, `ef402e3f`, `633e6f03`, `29704a14` recuperados com título correspondente ao marco registrado. Testes: `tests/site-versions.spec.ts` cobrem versões independentes, cronologia, links e mobile.
- **Proteções:** SITE-01 permanece homologada (CI #44670407963 aprovado). Sem mudanças de motor, contadores, rankings, dados, esquema D1, segurança, merge ou deploy. SITE-08, restante da Etapa 4, Etapa 4B e Etapa 5 continuam na fila. CI funcional #44671411568 confirmado como success; qualquer novo commit documental precisará de sua própria verificação. Homologação visual da SITE-03 confirmada pelo proprietário em 20/11/2026; próxima frente da Etapa 4 é SITE-08 (história e identidade do OldArcade), seguida da revisão editorial dos artigos e referências culturais. SITE-04 e demais itens de navegação/home/imagens continuam reservados à Etapa 4B.


## ESTADO ATUAL PARA NOVO CHAT — Etapa 4 / SITE-01 (20/11/2026)
- **Etapa 3 homologada visualmente e CI documental #44669327081 aprovado** (commit anterior `43244be3`), PR #4 draft, sem merge/deploy.
- **SITE-01 IMPLEMENTADA E HOMOLOGADA VISUALMENTE PELO PROPRIETÁRIO (20/11/2026):** CI #44670407963 concluído com **success** no commit funcional/documental `954931a53b77aabba279f7cbc7f215443c6db170`. Atualizadas `/privacidade/`, `/sobre/`, `/contato/`; criada `/termos/` e link no rodapé; contato passa a incluir solicitações de privacidade e não promete redefinição automática por e-mail. Testes E2E `tests/site-legal.spec.ts` incluídos. Não reabrir esta homologação sem nova solicitação.
- **Inventário técnico e riscos de lançamento:** `docs/AUDITORIA_SITE_01_DADOS_E_LEGAL.md`. Conta e sessão em D1, cookie HttpOnly/Secure/SameSite=Strict 30 dias, placares públicos por nickname, UUIDs de contador, dados locais, e-mail opcional e preferências sem envio. Sem fluxo público de recuperação automática ou exclusão de conta; não inventar serviços nem alegar conformidade legal.
- **Pendências:** avaliação jurídica/operacional e confirmação de responsável/prazos de dados antes de lançamento oficial; a aprovação técnica/visual não equivale a revisão jurídica. SITE-03 (versões), SITE-08 (história) e artigos/cinema continuam na Etapa 4; SITE-02/04/05/06/07/09 são Etapa 4B separada. Não antecipar Etapa 5 nem publicar automaticamente.


## ESTADO ATUAL PARA NOVO CHAT — Etapa 3 homologada (20/11/2026)
- **Etapa 3 de desempenho e rankings: concluída tecnicamente nesta branch e homologada visualmente pelo proprietário.** GitHub Actions run **#44668666640** no commit de código `29704a1403cd483fb6fee54b97f765e5bcd21a30`: conclusão **success** em check/tipos, build, testes API e navegador desktop/mobile. URL: https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/44668666640 . Este registro documental é posterior ao commit testado; conferir o CI do novo HEAD documental antes de qualquer integração.
- **Interface homologada:** convite de fim de partida centralizado SOBRE o jogo, fundo escurecido, destaque para "Salvar meu recorde · Criar conta", ações "Já tenho conta", "Ver os líderes" e "Agora não"; usa autenticação global em modal, permanece na URL e pode ser fechado. Padrão compartilhado para os sete modos: Snake Clássico, Aventura, Evolution; Tetris Clássico, Sprint, Sobrevivência; Pixel Quest. Não voltar ao toast no canto nem redirecionar para /conta/.
- **Rankings:** Top 3 público e Top 10 expansível por modalidade, card por jogo na listagem geral e em Meu desempenho, modo/recorde individualizados. Apenas contas autenticadas participam dos rankings; visitantes veem a classificação. Pixel Quest integra `/rankings/` e só envia pontuação competitiva de **fase 1-1 concluída** (não derrotas); o tempo enviado é arredondado para milissegundos inteiros. Registro automático para conta autenticada após resultado elegível. Não alegar persistência se a API não confirmar.
- **Regressões corrigidas e testadas:** ausência do evento de vitória no Pixel Quest, duração fracionária incompatível com API; testes de convite em todas as modalidades e login em modal; em Snake Clássico/Evolution os testes distinguem evento sintético do fluxo próprio de pontuação, sem forçar POST artificial. A validação E2E usa respostas simuladas nos endpoints e não substitui testes D1 de produção.
- **Limites/pêndencias mantidos:** leaderboard ainda recebe resultados autodeclarados pelo navegador (`verified:false`); antifraude e integração/monitoramento do D1 real exigem trabalho separado. Backlog de melhorias dos jogos, conteúdo/SEO, home/header, imagens e regressão geral permanece integralmente preservado. A Etapa 4/4B só deve começar como frente própria; Etapa 5 segue planejada.
- **Estado de entrega:** PR #4 `feat/layout-unificado-snake-quest` permanece **aberto/draft e sem merge**, nenhum deploy, SQL ou mudança em produção autorizado/executado. A aprovação visual/técnica não equivale a autorização para publicar. Próxima ação: conferir CI do HEAD documental e preparar a transição controlada para a Etapa 4 sem alterar produção.


## REGRA OFICIAL — ranking para todos os jogos; visitantes veem líderes e convite final (19/11/2026)

- **Correção prioritária exigida na Etapa 3, ainda em homologação:** O Pixel Quest foi incorretamente marcado `competitive:false`, ficando ausente da página `/rankings/`, do perfil competitivo e do endpoint de leaderboard. A regra original do Old Arcade é **todos os jogos com classificação**, embora só fases/partidas elegíveis gerem pontos. Ativar `pixel-quest` no catálogo compartilhado e permitir GET público + POST autenticado pela API existente. Ranking Quest v1 = **maior pontuação da fase 1-1 concluída**, não somar campanhas futuras, não registrar derrotas como vitórias. Histórico local é preservado, e a API de ranking não apaga marca antiga.
- **Consultas SEM login obrigatórias:** Top 3, Top 10, líder e nomes dos recordistas são públicos para **todas as modalidades**, inclusive Quest, sem divulgar e-mails ou dados privados. O nome do visitante só aparece no ranking se ele criar/entrar em conta e registrar resultado elegível.
- **Convite final global:** ao terminar uma partida elegível, visitante vê resultado e chamada não bloqueante para **Criar conta / Já tenho conta / Ver líderes**. O convite usa o modal GLOBAL de autenticação e não impede replay, não substitui Game Over, nem deve aparecer para jogador autenticado. Login após resultado elegível pode enviar uma vez automaticamente a marca guardada em memória da aba; não prometer registro sem resposta positiva da API. Testes devem cobrir Snake (3 modos), Tetris (3 modos) e Quest (1).
- **Remover do ranking dentro do jogo:** formulário duplicado, modal próprio e botão “Tentar registrar novamente” e quaisquer CTAs de reenvio redundantes que não funcionem. Consultar ranking nunca deve depender de login. Manter card simples com pódio Top 3, Top 10 sob demanda, posição pessoal se houver, status real de disponibilidade. Não mexer no reenvio **do Desafio Diário de tentativa única**, que tem fluxo e proteções próprios.
- **Estado técnico:** mudanças preparadas na PR #4, aguardar o CI do commit novo e sua homologação visual. Não confundir com conclusão oficial da Etapa 3, nem executar Etapa 4/4B antes do aceite. Sem SQL, merge ou deploy manual. Avaliar futuramente autenticação e antifraude de placares (`verified:false`); não alegar que contas impedem pontuações manipuladas.
- **Backlog preservado:** bugs de recorde local do Quest, recentralização, novos sprites e modalidades, estatísticas expandidas, mídia, páginas institucionais, header, home e imagens continuam na fila. Não encurtar nem sobrepor este backlog.



## ESTADO ATUALIZADO — revisão final da Etapa 3 (20/11/2026)
- **CI #1051 aprovado no commit `a3bd91e`** (278 passed, 50 skipped). Etapas 1, 2 e 2B já aprovadas visualmente. PR #4 permanece aberta/draft sem merge e sem deploy manual.
- **Etapa 3: últimas mudanças no código desta branch:** página de rankings agora organiza modos sob **um card por jogo** (Snake e Tetris), preserva APIs, URLs `#ranking-<modo>` e regras independentes. Mostrar Top 3 por modo expandido e Top 10 sob demanda tanto no índice quanto dentro dos jogos; usar renderizador único. Manter ranking competitivo somente com conta; Quest sem competição fictícia. **Aguardar CI do novo HEAD e homologação visual.**
- **Nova fila SITE-01/02/03/04/05/06/07/08/09 documentada em [BACKLOG_SITE_UX_E_IMAGENS.md](BACKLOG_SITE_UX_E_IMAGENS.md)**, dividida entre Etapa 4 (institucional, legal, versões) e **Etapa 4B** (header sticky, dropdown Jogos, categorias, home, redes sociais e imagens). Não implementar enquanto a Etapa 3 não estiver validada.
- Todos os refinamentos e bugs de jogos previamente pedidos continuam abaixo. Não alterar dados do banco, branch principal ou publicação.


## ESTADO VIGENTE — Etapa 3: auditoria e implementação inicial (19/11/2026)

- **Etapas 1, 2 e 2B aprovadas visualmente pelo proprietário.** CI #1048 do commit `eb4512a` concluído com sucesso. Repositório `jeffersonfukner-hue/oldarcade`, PR #4 draft, branch `feat/layout-unificado-snake-quest`, sem merge.
- **Escopo executado no código da Etapa 3:** componente `AccountGameStats.astro` agrupa **um card por jogo** e linhas internas por modalidade, sem soma fictícia; preserva `data-account-record` e hooks de metas/recordes/posição. Inclui Pixel Quest como jogo sem ranking global, sem inventar resultados de conta.
- **Autenticação validada por inspeção de `functions/api/games/[game]/leaderboard.js`:** POST exige `currentPlayer`; anônimos recebem 401. Snake Clássico/Evolution param de exibir ranking local por nickname e de gravar novas entradas `saved.scores` de usuários sem conta, **mantendo histórico local antigo**. A marca privada do navegador permanece. Nenhum SQL ou modificação de banco executada.
- **Correção de ranking Sobrevivência:** API usava `isTimeRanking` para melhorar recorde como menor tempo, mas Sobrevivência exige **maior tempo**. `improvementOperator` agora usa `isLowerBetter` e ganhou testes de regressão; Sprint segue menor tempo. Não alterar D1.
- **Limitação existente, NÃO resolvida:** o endpoint recebe pontuação fornecida pelo cliente e sinaliza `verified:false`; login obrigatório não é mecanismo antifraude. Manter anotação para auditoria posterior sem alegar proteção completa.
- **Próxima ação:** conferir CI do novo commit, corrigir falhas na mesma branch, homologar cards por jogo e exclusão da classificação local; depois revisar Top 3, Top 10 e redundâncias dos rankings públicos para encerrar a Etapa 3. Etapa 4 e 5 e RF-JOGOS-01 / RF-SNAKE-02 / RF-VISUAL-03 / RF-QUEST-04 / BUG-QUEST-05 / RF-MODOS-06/07 / RF-QUEST-08 / BUG-UX-09 permanecem pendentes e documentadas abaixo.
- **Ordem de prioridade documental:** este bloco é o estado atual; entradas mais antigas registram histórico da época, não cancelam aprovações recentes.


## ESTADO ATUAL — Etapa 2 homologada; 2B breadcrumbs e estatísticas por jogo (19/11/2026)
- **Proprietário homologou visualmente a Etapa 2.** Seguir a Etapa 2B de breadcrumbs sem esperar nova aprovação da Etapa 2. Etapa 1 (980px) também homologada.
- **2B implementada no código desta PR:** `src/data/breadcrumbs.ts` determina trilhas das páginas pela URL real em `gameModes.js`; `src/components/GameBreadcrumbs.astro` compartilha HTML acessível entre jogos e páginas institucionais; `src/layouts/Base.astro` centraliza a renderização no início do `main` e dados estruturados `BreadcrumbList` apenas com `SITE_URL` válido. CSS global preserva 980px e adapta 320/390px. Nenhuma alteração de lógica, recordes, APIs ou banco. Ver CI do HEAD antes de declarar validação técnica.
- **Nova exigência para Etapa 3, CONFIRMADA pelo proprietário:** um único **card por jogo** na página de estatísticas/Meu desempenho, contendo os dados de **todas as modalidades dentro**. Hoje `src/pages/conta.astro` agrupa por jogo mas gera um card por modo; reorganizar mantendo `data-account-record` e demais IDs/atributos usados pelo script, rankings independentes por modo e zero somas artificiais entre escalas diferentes. Regra extensível a novos jogos/modos. Ler `docs/PLANO_PADRONIZACAO.md`.
- **Próximo passo ao concluir CI:** homologação visual 2B (breadcrumbs em Snake/Tetris/Quest/rankings/conta/mobile); depois iniciar Etapa 3, sem merge/deploy. Backlog de troca segura de modo, refinamentos de sprites, estatísticas live, bugs Quest e recentralização permanece intacto.


## FILA DE UX DOS JOGOS — Modalidades e retorno ao tabuleiro (19/11/2026)

- **RF-MODOS-06 — Padrão único de seleção de modo, proposta:** avaliar `GameModeSwitcher.astro` alimentado por `src/data/gameModes.js`; mesma faixa compacta `Modo de jogo` para Snake (Clássico/Aventura/Evolution), Tetris (Clássico/Sprint/Sobrevivência) e futuros jogos com múltiplos modos. Seleção atual destacada, opções clicáveis com URL real e responsividade/acessibilidade; não publicar botões de modos inexistentes.
- **RF-MODOS-07 — Confirmação contra saída acidental:** interceptar escolha de outra modalidade durante `playing`, `paused` ou `countdown`, congelar com segurança e abrir modal acessível `Continuar nesta partida` / `Sair e trocar de modo`. Ao cancelar, preservar exato progresso e restaurar estado anterior (se estava em execução, retomar com 3–2–1; se estava pausado, continuar pausado). Aviso especial de **Desafio Diário de tentativa única**. Não registrar tentativa não concluída como recorde. Validar todos os motores antes de aplicar.
- **RF-QUEST-08 — Novas modalidades Pixel Quest:** usuário mencionou explicitamente modo com **cenário/câmera avançando automaticamente** e obrigação de o personagem continuar para a frente (*auto-scroller/runner*). Outras variantes interessantes ficam para estudo; ainda não definir nomes, rankings, metas, velocidade ou regras. Quando houver mais de um modo de Quest, apresentar no mesmo seletor global; por ora não criar guias fictícias. Cada modo futuro deve ter regras/estatísticas/recordes próprios segundo as normas de conta.
- **BUG-UX-09 — Retomada sem recentralizar:** usuário pausa, rola a página e, ao retomar, tabuleiro não volta ao centro. Em Snake Clássico/Evolution, `src/scripts/snake.ts` faz `beginCountdown()` sem chamar `centerGameBoard()` em `pause()` no ramo `state==='paused'`; início já centraliza. Verificar todos os jogos antes de concluir causa universal; reproduzir e corrigir usando `src/scripts/gameViewport.ts`, com teste desktop/mobile. Não rolar ao apenas pausar ou ler artigo; recentralizar quando retomar/iniciar voluntariamente.
- **Situação:** planejamento e investigação estática, **nada implementado ou validado no navegador** nesta atualização. Arquivo [PLANO_PADRONIZACAO.md](PLANO_PADRONIZACAO.md) detalha UI, segurança e fila. Etapa 2 continua aguardando homologação visual, depois 2B breadcrumbs, 3 desempenho/rankings, 4 conteúdo/identidade, 5 regressão, além destes refinamentos.

## REGRA VIGENTE — plano original, etapa atual e filmes do Pixel Quest (19/11/2026)
- **Não perder as cinco etapas aprovadas pelo proprietário**: 1 largura global (**homologada**); 2 estrutura editorial (**código implementado e CI #1044 aprovado, pendente de homologação visual**); 3 desempenho e rankings; 4 conteúdo e identidade; 5 regressão geral. Inserir **2B breadcrumbs** após homologar Etapa 2. Novas solicitações de refinamento entram na fila sem renumerar o plano. Ver [PLANO_PADRONIZACAO.md](PLANO_PADRONIZACAO.md).
- **Correção editorial do proprietário:** há filmes associados a **outras franquias de jogos de plataforma** que podem enriquecer a seção audiovisual do Pixel Quest. Não são filmes do próprio Pixel Quest; evitar declarar que não há filmes pertinentes ao gênero. Obras candidatas verificadas: *Super Mario Bros. — O Filme* (2023), *Sonic: O Filme* (2020) e *Detona Ralph* (2012, inspiração arcade, não adaptação de um jogo específico). **Somente Etapa 4**: investigar e registrar fontes, disponibilidade no Brasil, links e data; nenhum dado de streaming foi confirmado nesta etapa. Não adicionar filmes à interface agora.
- A Etapa 2 ainda não foi aprovada visualmente pelo proprietário; o CI anterior de código `2d07fe7` teve **246 passed, 50 skipped**. Commit documental subsequente `b365b67` adicionou o backlog de refinamentos e bug Quest. Não declarar essas melhorias implementadas nem antecipar breadcrumbs.

## BACKLOG — Refinamentos dos jogos e bug Pixel Quest (solicitados em 19/11/2026; NÃO IMPLEMENTADOS)

**Regra de fila do proprietário:** novas observações entram na sequência de trabalho, não interrompem a etapa em homologação. Etapa 2 editorial está implementada no commit `2d07fe7` (CI #1044 aprovado: 246 passed, 50 skipped), **aguardando aprovação visual**. Depois, Etapa 2B de breadcrumbs, Etapas 3 (desempenho/rankings), 4 (conteúdo/identidade), 5 (regressão final); os refinamentos abaixo ficam em fila separada conforme prioridades a definir. Não afirmar que os itens abaixo foram corrigidos.

- **RF-JOGOS-01 — Estatísticas detalhadas, extensíveis e em tempo real (todos os jogos aplicáveis):** os motores devem coletar o máximo de métricas úteis e verdadeiras de cada mecânica, com nomes/valores de eventos coerentes, sem contagem duplicada e com atenção ao desempenho. Exemplo Snake: maçãs, peras, uvas, cada tipo de power-up, total de pontos acumulado por tipo de fruta/item e totais por partida; expandir para modalidades/jogos conforme seus eventos. No HUD lateral, ao lado do placar, incluir botão/ícone acessível de **Estatísticas** para expandir/recolher detalhes; se expandido, os números atualizam durante a partida. Preferir um componente global configurável por jogo, mantendo placar e canvas compactos e legíveis; não confundir dados por partida com históricos ou métricas globais. Desenhar persistência somente após definição dos agregados e privacidade.
- **RF-SNAKE-02 — Variedade progressiva de frutas:** introduzir frutas com pontos diferentes (maçã no início; outras como pera e uva surgem depois gradualmente e com intervalos maiores). Definir tabela de pontuação e condições/probabilidades depois de avaliar regras dos três modos Snake e compatibilidade com poderes/missões/rankings; não inventar valores ou alterar regras competitivas sem aprovação.
- **RF-VISUAL-03 — Sprites melhores:** avaliar substituir geometria simples por sprites autorais mais trabalhados em todos os jogos aos quais faça sentido; preservar legibilidade, colisões, proporções, desempenho, arte consistente, mobile e eventuais restrições de copyright.
- **RF-QUEST-04 — Fundo parallax e arte Pixel Quest:** adicionar profundidade/parallax ao cenário de árvores, melhorar visual do cenário e personagens e aplicar o padrão de sprites de RF-VISUAL-03. Fazer teste de acessibilidade (`prefers-reduced-motion`), desempenho e câmera/colisões antes de homologar.
- **BUG-QUEST-05 — Recorde do Pixel Quest não registra (relato do proprietário):** investigar fluxo real do fim de fase → cálculo de resultado → persistência local/conta → HUD e atualização da interface. Reproduzir com teste de navegador e condições de vitória/perda; distinguir recorde de fase, campanha e ranking global (este **não existe** para Quest). Não prometer correção antes de identificar causa; não modificar registro de outros jogos nem banco por suposição. Classificar como bug funcional prioritário na fila de refinamento, mas **sem interromper a Etapa 2**.

**Sequência que deve ser preservada:** homologação visual da Etapa 2 → Etapa 2B breadcrumbs → Etapa 3 desempenho/ranking (somente contas) → Etapa 4 conteúdo/SEO e filmes do gênero plataforma → Etapa 5 regressão geral; refinamentos dos jogos e BUG-QUEST-05 ficam em fila adicional, sem substituírem o plano original. Se o bug impedir a homologação do próprio Quest, registrar reprovação específica, sem declarar a Etapa 2 aprovada automaticamente. Não fazer merge/deploy em produção sem autorização.

## ESTADO ATUAL PARA NOVO CHAT — Etapa 2 editorial (19/11/2026)
- **Etapa 1 de largura 980px aprovada visualmente pelo proprietário** após CI #1040 no commit `c7f4cd1`. Largura permanente via `--oa-content-width` continua válida para home, jogos, rankings e conta.
- **Etapa 2 solicitada e implementada no código desta branch:** `GamePageSections.astro` coordena ordem semântica igual entre todos os 7 modos: ranking/estado → compartilhar → guia → história → filmes verificados se houver → Continue jogando → bastidores. `SnakeHistory.astro` remove duplicação de história; `GameRelatedGames.astro` aponta outros títulos reais; `GameCompetitionNotice.astro` exibe estado factual do ranking indisponível no Pixel Quest. Filmes Snake inseridos também em Evolution/Aventura. Nenhuma mecânica, IDs, backend ou banco alterados.
- **Correção do texto:** remover `max-width:85ch` e largura editorial menor que a seção; respeitar 980px com padding interno para parágrafos, sem reduzir o fullscreen. Testar largura textual em desktop e mobile.
- **Novo escopo adicional aprovado:** Etapa 2B de breadcrumbs reutilizáveis e navegação contextual, incluindo JSON-LD BreadcrumbList quando houver domínio canônico válido; não executado na Etapa 2. Outras melhorias anteriormente sugeridas permanecem no backlog de rankings/desempenho e conteúdo histórico/SEO. O usuário pediu registrar sugestões nos .md para novos chats.
- **Regra de competição:** somente contas autenticadas entram em rankings (Etapa 3 corrigirá recursos locais legados do Snake sem apagar dados). Qualquer visitante pode jogar. Pixel Quest não tem ranking global oficial; não fingir dados.
- **GitHub:** `jeffersonfukner-hue/oldarcade`; branch `feat/layout-unificado-snake-quest`; PR #4 draft. Consultar HEAD e CI atualizado na próxima conversa: etapa 2 deve passar no Actions e dependerá de homologação visual antes da 2B/Etapa 3.
- **Não autorizado:** merge, deploy, mudanças no Cloudflare, SQL em D1, alteração de produção, reinício do Desafio Diário ou lançamento de jogo #004.


## ESTADO ATUAL PARA NOVO CHAT — padronização de largura (19/11/2026)
- **Aprovação do proprietário:** plano global de padronização aprovado com três complementos obrigatórios: (1) ranking só de contas autenticadas, (2) história relevante para SEO com `<strong>` criterioso em termos relevantes, sem keyword stuffing, (3) decisões preservadas nos .md para todos os chats futuros. Ver contrato no início de `docs/PADROES_GLOBAIS_DOS_JOGOS.md` e em `AGENTS.md`.
- **Etapa 1 em implementação nesta PR:** `--oa-content-width:980px` controla home, páginas de jogos e modos, rankings, conta e todas as outras páginas via `.shell`/`.oa-game-page`. Centralização com 20px laterais (desktop/tablet) e 12px (mobile até 580px); proporções nativas e fullscreen preservados. Testes de larguras para 1440/1024/390/320 e estabilidade de fullscreen devem rodar no CI.
- **GitHub:** repo `jeffersonfukner-hue/oldarcade`; PR #4 draft, branch `feat/layout-unificado-snake-quest` sobre `feat/pixel-quest-jogo-003`. Consultar HEAD real e GitHub Actions ao retomar; o estado do CI de qualquer commit novo precisa ser confirmado. O commit anterior de layout `4573e95` tinha CI aprovado (217 passed, 49 skipped).
- **Escopo futuro já aprovado, NÃO executado nesta etapa:** seções editoriais na ordem global (apresentação → jogo → desempenho/ranking → compartilhamento → guia → história → audiovisual verificado → continue jogando → bastidores), depois compactação de rankings/perfil (e retirada do ranking local sem conta) e SEO dos artigos históricos. **Não** criar conteúdos/filmes fictícios, não modificar mecânica, pontuação, IDs de scripts ou banco sem etapa específica.
- **Preview:** CI e artifact não provam deploy. Não fazer merge, publicação ou alteração de Cloudflare/produção pelo agente; para homologação solicitar confirmação do commit exato no Preview e prints do proprietário.
- **Outros bloqueadores preservados:** bug de ranking do Tetris Sobrevivência (maior tempo e desempate por linhas) permanece pendente até trabalho específico, como registrado abaixo; Desafio Diário segue oculto, sem retomada nesta frente.


## PENDENTE — painéis de ranking, desempenho e identidade visual (19/11/2026)
- **Escopo: layout, não regras de pontuação.** Observações adiantadas pelo proprietário durante o ajuste global de cabeçalho + HUD do Tetris. Não interromper o trabalho em andamento e não iniciar jogo #004 sem terminar a revisão dos três jogos.
- **Problema observado:** cartão "Seu desempenho" / "Resumo de partidas locais" ocupa uma faixa extensa, com grandes espaços entre estatísticas, duplicando informações importantes que já estão no HUD. Não expor métricas secundárias extensas na página do jogo se puderem estar somente em "Minha Conta" / perfil. **Não apagar os dados nem remover IDs que os scripts atualizam**; primeiro verificar quem depende dos valores.
- **Composição a avaliar após terminar o layout do palco:** (preferência inicial) deixar ranking global e um resumo *realmente curto* lado a lado, em duas colunas desktop e uma coluna mobile; outra opção é retirar o resumo do jogo, mantendo apenas o ranking e os dados completos na conta. Evitar duplicar recorde da conta, pontos da partida e recorde global entre HUD e cartões. Proporção do tabuleiro e comportamento de ranking devem ser preservados.
- **Marca correta para texto editorial:** **Old Arcade** (duas palavras), e não "OldArcade" corrido em títulos como "Desafio OldArcade", "Comunidade OldArcade" e textos informativos. **Exceção visual explícita:** logotipo e wordmark podem ser `OLDARCADE`/OldArcade unidos, com **Old** em branco e **Arcade** na cor de destaque/tema, como no cabeçalho atual (`src/layouts/Base.astro`). Preferir componente de identidade reutilizável quando aplicável, sem modificar nomes técnicos, URLs, IDs ou referências jurídicas de forma automática.
- **Fontes confirmadas em 19/11/2026:** `src/components/GameRanking.astro` e `SnakeGlobalRanking.astro` apresentam "Desafio OldArcade"; `SnakePerformance.astro` exibe partidas/visitas locais, global e nickname; `TetrisGame.astro` exibe resumo separado e `GameHud` compacto no palco; `Base.astro` já usa palavra unida com duas cores. Não classificar essa revisão como implementada: apenas documentada.
- **Critérios de aceite do futuro ajuste:** um layout compartilhado para Snake, Tetris e Pixel Quest; rankings legíveis e acessíveis; nenhum dado duplicado fora do HUD; nenhuma lacuna excessiva em widescreen; responsividade 320/390/desktop; perfil e ranking permanecem funcionais; tipagem/build/API/E2E e homologação visual. Não fazer deploy/merge; Preview somente por deploy manual do proprietário.
- **Ordem:** terminar o layout principal do Tetris e homologar a estrutura global → compactar ou mover desempenho conforme solução escolhida e padronizar marca → corrigir bloqueador de ranking do Sobrevivência registrado abaixo → revisar três jogos existentes → só então jogo #004.



## BLOQUEADOR — Tetris Sobrevivência: classificação por duração + linhas (registrado em 19/11/2026)
- **Prioridade: P0 antes de iniciar qualquer jogo #004.** Proprietário pediu **registrar agora, corrigir depois que o layout global estiver resolvido**, sem interromper a implementação do cabeçalho/HUD compacto compartilhado. Não declarar problema resolvido sem correção e testes.
- **Regra definida:** modo Sobrevivência ordena por **maior tempo efetivo sobrevivido** (milissegundos) e, **somente para duração empatada**, por **maior quantidade de linhas eliminadas**. Exemplo: 3:56.xxx e 30 linhas fica à frente de exatamente 3:56.xxx e 29 linhas; empate em tempo e linhas exige desempate determinístico documentado (priorizar registro mais antigo conforme regra global se mantida). Não confundir este modo com Tetris Sprint, que vence pelo menor tempo.
- **Bug real informado pelo jogador:** após encerrar uma partida, o bloco do ranking mostra "Ranking global — Melhor tempo 3:04" apesar de existir recorde superior, aproximadamente **3:56 com 30 linhas**. Revisar a fonte do valor exibido no final, classificação do endpoint, refresh/cache e estados do HUD/recorde de conta/global. O jogador mencionou apresentação tanto em "3:56.704" quanto em "3:56 e 34 centésimos"; usar o valor exato persistido no banco para asserções, não presumir qual fração está correta.
- **Diagnóstico inicial do código, somente leitura:** `src/data/rankingRules.js` já define Sobrevivência como *maior tempo vence* (`isLowerBetter=false`), e `src/scripts/tetris.ts` envia o tempo em milissegundos como `score`; porém a gravação `recordGameFinish(modeId,elapsed,elapsed)` **não passa linhas** no registro de ranking, e o modelo `Entry` de `src/scripts/modeRanking.ts` não expõe `linesCleared`. Assim, o desempate por linhas ainda não está implementado ponta a ponta. A causa concreta da exibição de 3:04 requer rastreio do endpoint/banco, não afirmar diagnóstico definitivo com base apenas no front-end.
- **Critérios de aceite para a futura correção:** (1) Top 10, topo global no HUD, resumo pós-partida, Minha Conta e perfil usam a mesma classificação correta; (2) 3:56.xxx supera 3:04.xxx independentemente das linhas; (3) tempos exatamente iguais classificam 30 linhas acima de 29; (4) formato de tempo mantém milissegundos reais, sem truncamento que falseie empates; (5) atualizar payload, persistência/consulta e testes unitários/API/E2E, incluindo usuários distintos, empates e atualização do placar; (6) migração D1, se necessária, só entregar SQL para aplicação **manual pelo usuário no Preview**, nunca executar nem alterar produção; (7) preservar modos Clássico e Sprint e não reiniciar recordes existentes.
- **Sequência de trabalho:** concluir layout/HUD compacto iniciado no Tetris → corrigir bug funcional Sobrevivência → revisar e testar cada modalidade dos 3 jogos existentes → só então iniciar o próximo jogo. Deploy de Preview exclusivamente manual; sem merge nem deploy por agente.



## Tetris: cabeçalho e HUD compacto junto ao tabuleiro — 19/11/2026
- Piloto aprovada conceitualmente pelo proprietário: cabeçalho global `GameStageHeader.astro` (título, pausa, fullscreen) e painel contextual adaptável. `GameHud.astro` ganha prop opcional `compact` com ícones, títulos/nomes acessíveis e IDs intactos.
- Clássico, Sprint e Sobrevivência têm Próxima/Reserva/Linhas e HUD na mesma coluna ao lado do tabuleiro; regras, próxima peça, reserva, rankings, cronômetro e controles preservados. Layout do stage centralizado com largura adequada, evitando dispersão no widescreen.
- Snake/Pixel Quest ainda conservam visual anterior (mesmo componente aceita HUD padrão). Após teste e aceite do piloto, expandir para todos os jogos.
- Sem deploy, merge, créditos ou banco. CI e aprovação visual do Preview ainda necessários.



## Ajuste de centralização do conjunto jogável — 19/11/2026
- Após comparar prints dos três jogos, Snake e Pixel Quest já utilizam o espaço adequado. O Tetris mantinha desbalanceamento entre tabuleiro + prévia/reserva e HUD.
- Contrato global do `oa-board-slot` agora centraliza qualquer conjunto jogável. O grupo Tetris usa grid explícito (tabuleiro 10×20 limitado a 320px; coluna de próxima peça, reserva e linhas de até 200px), ocupando até 540px sem expandir ou distorcer o canvas. Layout móvel mantém coluna estreita para peças.
- Removidos overrides finais conflitantes para Tetris. Nenhuma regra da partida, ranking ou API alterada. Teste geométrico cross-viewport (1440, 1024, 820, 390 e 320px) adicionado; CI e Preview ainda precisam confirmar.



## Revisão editorial global — 19/11/2026 (segunda revisão)
- Após análise dos 15 prints, padronizados guias via `GameGuide.astro`, seções de histórico via `GameDevelopmentHistory.astro`, cards de compartilhamento e os painéis informativos; cada jogo mantém regras/formatos próprios.
- Histórico de versões/marcos permanece exclusivamente em `gameRegistry.ts`: nenhum marco histórico foi reescrito, nenhuma versão foi incrementada artificialmente. Snake Aventura filtra marcos desse modo e usa o mesmo histórico de versões do jogo #001.
- Snake Clássico e Evolution agora usam `SnakePerformance.astro` e `SnakeGlobalRanking.astro`; IDs antigos permanecem para scripts sem reintroduzir campos visuais duplicados. Dados locais não são apresentados como recordes oficiais.
- Tetris mantém próxima peça, reserva, pontuação, contador e espaço de missão no palco; painel inferior prioriza partidas e comunidade, evitando repetir o nível e as regras. O tabuleiro mantém proporção retrato.
- Pixel Quest separa resumo curto da fase e instruções/pontuação completa, sem repetir três vezes a regra dos cristais.
- Compartilhamento unificado: botão nativo e copiar convite evidentes; redes ficam em painel expansível, preservando todos os links de participação.
- A revisão é apenas de layout e apresentação; não houve mudança no banco de dados, pontuação, físico dos motores ou publicação. Validação CI e aceite de Preview são etapas separadas; deploy manual somente pelo usuário.



## Layout global Snake · Tetris · Pixel Quest — 19/11/2026
- A segunda rodada passou em 194 testes; uma falha de 320px do Tetris foi identificada na seção de ranking (título + pill sem quebra) e no teste legado dos botões inferiores que devem ficar ocultos em desktop. CSS global de quebra em 320px e teste sensível ao tipo de ponteiro ajustados; CI final pendente.

- Auditoria: `game-layout` de Snake/Pixel Quest ainda dividia a página com coluna editorial; `TetrisGame.astro` continha grid próprio e HUD divergente. Capturas anteriores indicavam tabuleiro pequeno, HUD/controles excessivos e recorde secundário. Não alterar a mecânica dos jogos para tratar apresentação.
- Implementado em `GameLayout.astro` e `global.css`: palco em largura plena, HUD ao lado do canvas, cartões com informação contextual abaixo; contratos de proporção quadrada, retrato e paisagem. Todos os 3 modos Snake, 3 modos Tetris e Pixel Quest migrados na mesma branch. `gameRegistry.ts` e histórico não mudaram.
- Comemorações laboratoriais deixam de aparecer no Preview comum; somente com `?celebration-lab=1`. Ferramenta não registra placares, apenas efeitos.
- Testes cruzados acrescentados para sete modos, 320/390, 820 e ultrawide. Primeira rodada: 191 aprovações e um teste legado ainda fixado em 660 px, ajustado para 760 px; testagem de placar Aventura alterada para não exigir número congelado durante movimento. CI final precisa ser conferido, e Preview ainda deve ser validado. Sem publicar, deploy ou merge; proprietário mantém controle integral do deploy manual.



## Pixel Quest — card na Home e histórico de versões preservado (19/11/2026)
- Integrado como **jogo #003**, com card clicável na Home e rota de jogo, arte SVG própria. A Home passa a contabilizar os três jogos reais.
- Fonte de verdade de versão em `gameRegistry.ts`: **v0.1.0-dev**, data inicial 19/11/2026, marcos históricos datados de implementações já realizadas. Histórico mostrado na página, sem criar nova versão para cada commit nem perder versões futuras.
- Página agora usa `GamePage.astro`, `GameShare.astro`, instruções, artigo histórico sobre o gênero separado dos bastidores da implementação e links de fontes verificáveis. Modo permanece **não competitivo** na API enquanto ranking global não for entregue; pontuação local não deve fingir ranking oficial.
- Card e renderização editorial cobertos por E2E. Validar CI e Preview antes de homologar. Sem merge/deploy de produção e sem reativar Desafio Diário.



## Pixel Quest — barras e regras provisórias de pontuação (19/11/2026)
- Barras de cristais e inimigos na coluna lateral do HUD: preenchimento aumenta com coleta/pisão; número restante decresce (6→0, 3→0). Componente reutilizável `GameProgressBar.astro` inserido por slot opcional no `GameHud.astro`, sem alterar Snake/Tetris.
- **Proposta de pontuação v1, em teste:** cristal +10, inimigo derrotado +50, conclusão do portal +100, bônus de tempo efetivo `max(0, 500 - 2 × segundos completos)`. Tempo pausado/countdown não conta. Recorde somente após portal liberado e fase concluída; desistência/derrota não qualificam.
- `scoring.ts` calcula pontuação de fase e soma de níveis sem duplicar ID; `records.ts` guarda *somente marcas locais experimentais* por fase e por conjunto de níveis concluídos (atualmente campanha de 1 fase), com chave versionada. Não existe ranking geral online ou autenticação de pontuação desta fase; integração oficial é etapa posterior e exigirá validação do servidor/versão das regras. Não confundir recorde local com posição global.
- Testes de pontuação e de barra inicial incluídos. Validar GitHub CI e Preview. Sem deploy/merge; Desafio Diário permanece oculto.



## Pixel Quest — correção da semântica dos indicadores (19/11/2026)
- Esclarecimento do proprietário: separar **Total de inimigos derrotados** (acumulado da campanha entre fases) e **Derrotados neste nível** (zera ao entrar no próximo). Manter **Inimigos no nível** (restantes/total) e **Cristais no nível** (coletados/total).
- `gameplay.ts`: `createRun(level,cumulativeBeforeLevel=0)`, `levelDefeated(run)`, `totalDefeated(run)`. A próxima fase, quando implementada, deve receber o acumulado da fase anterior; nova campanha começa do zero. **Atualmente só existe a fase 1-1; a transição ainda não foi implementada**, portanto acumulado e derrotados no nível coincidem nesta fase. Não foi criada persistência entre sessões ou novos níveis fictícios.
- A regra de portal liberado **somente após todos os cristais** permanece. HUD global reutilizado sem mudanças para Snake/Tetris. Testes regressivos para transferência entre fases e HUD atualizados.

## Pixel Quest — dois contadores de inimigos e portal condicionado (19/11/2026)
- **Total derrotados**: número de inimigos vencidos na partida atual (0 ao reiniciar); **Inimigos no nível**: restantes/total da fase (inicialmente 3/3), decresce com pisões e não exige derrotar todos para concluir.
- Portal somente fica ativo após coletar **todos os cristais** da fase. Antes disso, tocar o portal não vence nem concede bônus; há texto de status e diferenciação visual de portal bloqueado/liberado.
- HUD compartilhado ganhou segundo indicador *opcional*, sem modificar os consumidores Snake/Tetris. Testes unitários/E2E atualizados; CI deve ser conferido antes de declarar validado.

## Pixel Quest — contador de inimigos derrotados (19/11/2026)
- Pedido do proprietário: usar espaço livre ao lado do canvas para mostrar inimigos derrotados.
- `GameHud.astro` aceita estatística opcional reutilizável (`statId`/`statLabel`); apenas Pixel Quest a utiliza por enquanto, sem alterar a apresentação de Snake/Tetris.
- `PixelQuestGame.astro` exibe **Inimigos derrotados** na coluna de HUD, em formato `derrotados/total`; `pixelQuest/index.ts` atualiza a partir de `run.enemies[].alive` em tempo real e reinicia em nova partida. Sem novo contador persistente nem alteração de API.
- Teste E2E do HUD inicial e teste unitário da contagem após pisão adicionados. Validar no GitHub CI e no Preview.

## Pixel Quest — reação aos inimigos corrigida (19/11/2026)
- Relato do proprietário após jogar Preview: encostar lateralmente em inimigo teletransportava instantaneamente para o começo; expectativa de plataforma clássica: **pular sobre a cabeça derrota o inimigo**.
- `src/scripts/pixelQuest/gameplay.ts`: contato lateral desconta um coração, aplica recuo + invulnerabilidade e **mantém localização**; pisão descendente atravessando o topo derrota inimigo (+50) com impulso para o próximo salto; **somente cair em abismo** volta ao checkpoint com perda de vida.
- Testes regressivos alterados em `tests-api/pixel-quest-gameplay.test.mjs` para colisão lateral, pisão, queda e preservação de pontuação; validar CI/Preview antes de declarar correção visual homologada.
- A reorganização do HUD/tabuleiro segue **pendente no componente global**, para os três jogos, sem remendos exclusivos do Pixel Quest.

## Pixel Quest #003 — Etapa A implementada (19/11/2026)
- **Branch:** `feat/pixel-quest-jogo-003`. Protótipo acessível em rota não listada `/jogos/pixel-quest/` no ambiente de desenvolvimento, **sem** cadastrar jogo #003 na Home e **sem** API/placar/contadores competitivos, conforme fase C planejada.
- Código: `src/scripts/pixelQuest/{levels,physics,input,render,index}.ts`, mapa `src/data/pixelQuest/level-1-1.ts`, componente `src/components/PixelQuestGame.astro`, rota Astro e testes `tests/pixel-quest.spec.ts` e `tests-api/pixel-quest-physics.test.mjs`.
- Fase 1-1 geométrica 96×18 tiles; física a 60Hz, colisões com subpassos, salto curto, coyote time, jump buffer, câmera limitada, teclado/touch, pausa e fullscreen. HUD, `setCountdownOverlay` e `centerGameBoard` reutilizados. Cristais/inimigos/checkpoint/portal são **visuais apenas** até Etapa B.
- **Verificação executada:** 7 casos de física sobre código TS convertido para JS em execução isolada passaram (chão, andar, salto, pouso, abismo, parede e câmera); 11 verificações de presença/integração estática passaram. Suíte de testes adicionada ao repositório; **build Astro e E2E no navegador não executados** porque branch ainda não está em PR e não há checkout local acessível. Não chamar esta etapa de certificada.
- **Próxima ação:** obter evidência de build/testes em ambiente acessível sem Cloudflare, corrigir somente falhas relevantes da Etapa A e então construir a Etapa B. Não reabrir Desafio Diário.

## Jogo #003 — Pixel Quest: planejamento registrado (19/11/2026)
- Branch exclusiva: `feat/pixel-quest-jogo-003`, derivada de `feat/tetris-jogo-002` (ainda não mesclada à `main`).
- Plano técnico completo em [PLANO_PIXEL_QUEST_003.md](PLANO_PIXEL_QUEST_003.md). Sem jogo implementado, sem alteração de catálogo, APIs, banco, Cloudflare, Preview ou produção.
- Proposta: plataforma lateral original Canvas 2D + TypeScript, física fixed timestep, colisões, câmera, dados de tilemap, controles teclado/touch; reutilização obrigatória de HUD, countdown, fullscreen, viewport, ranking, contadores, celebrações e SEO compartilhados.
- Piloto 1-1 Trilha Esmeralda: 96×18 tiles, terreno de aprendizado, cristais, patrulheiro, dois saltos, checkpoint, portal; valores de física ainda sujeitos a testes. Escopo futuro de lançamento: 3 mundos × 2 fases.
- **Próxima ação:** implementar apenas motor básico + primeira fase geométrica (Etapa A do plano) e testes direcionados; manter Desafio Diário congelado. Publicação e ativação de Preview permanecem exclusivamente com proprietário.

## ESTADO ATUAL PARA NOVO CHAT — lançamento com 3 jogos (19/11/2026)
- **Decisão mais recente do proprietário:** Desafio Diário foi **adiado**, sem nova implementação ou depuração por enquanto; priorizar 3 jogos funcionais, SEO e aprovação no Google Search Console/AdSense. O jogo #003 será um jogo de **plataforma inspirado na mecânica de Mario**, com personagens, arte, áudio, nomes e fases **originais** para evitar uso indevido de propriedade intelectual.
- **Ocultação do Desafio Diário:** flag única `src/data/featureFlags.ts`, `DAILY_CHALLENGES_ENABLED=false`; remove da interface pública calendários de Snake/Tetris, convite na Home, histórico no perfil, chamadas da API de calendário disparadas pela interface e opções de e-mail diário na conta/login. Código, APIs, migrações e testes do recurso ficam preservados para uso futuro; testes E2E diários legados foram marcados como `test.skip`. Novo teste ativo `tests/daily-feature-hidden.spec.ts` cobre ausência nas páginas e ausência de requisições diárias.
- **Fluxo Cloudflare decidido pelo proprietário:** ele próprio liga/desliga builds de Preview conforme a fase; durante desenvolvimento intenso ficam desligados; quando ele estiver em casa será preparado Preview local. Nunca alterar Cloudflare, publicar, fazer merge ou executar SQL por conta própria.
- **Branch:** `feat/tetris-jogo-002`; alterações da ocultação ainda precisam de CI e validação do proprietário antes de merge/publicação. Problemas remanescentes no CI não devem puxar o trabalho de volta a um ciclo de correções infinitas; tratar separadamente somente falhas que bloqueiem o lançamento.
- **Próxima ação:** conferir CI da ocultação; iniciar planejamento e implementação do terceiro e último jogo pré-lançamento em frente/branch próprias, obedecendo padrões globais, sem copiar propriedade intelectual de Mario/Nintendo.



## Padrão global de repetição do Desafio Diário (18/11/2026)
- **Correção passou de pontual a global:** módulo único `src/scripts/dailyMissionReplay.ts`, integrado em Snake e Tetris na branch `feat/tetris-jogo-002`.
- Após **derrota** registrada, botão pergunta se deseja repetir e solicita nova reserva da **mesma data/missão** via evento global; no laboratório de treino, repete mesma missão/seed sem D1. Após vitória, não há replay. Resultado pendente exige reenvio antes de nova partida.
- Ao começar jogo **livre**, ambos os motores emitem seleção de missão nula e fase `idle`, evitando tracker diário enganoso durante modo clássico.
- Testes cruzados Playwright em `tests/daily-challenge.spec.ts` (Snake) e `tests/tetris-daily.spec.ts` (Tetris). Verificação GitHub Actions ainda pendente; Preview visual/funcional pertence ao proprietário. Sem merge, deploy ou alteração de D1.


## Tetris Diário — reinício após derrota (18/11/2026)
- Relato do proprietário: após errar uma missão de sequência, botão do overlay iniciava Tetris Clássico, mas a missão permanecia visível, dando falsa impressão de continuação do Desafio Diário.
- Corrigido em `src/scripts/tetris.ts`: ao salvar derrota na API, overlay pergunta se deseja tentar a missão novamente; o botão reaproveita `oldarcade:daily-start-request` com a mesma data, solicitando novo token/seed ao servidor. Não inicia Clássico por engano. No laboratório de treino, o reinício reaproveita missão e seed sem acessar D1; iniciar Clássico limpa seleção da missão/tracker.
- API já suportava várias tentativas da mesma missão até vitória, mantendo uma única linha de desafio no banco (conflito por conta/jogo/data). Não considerar uma derrota como vitória ou como nova missão do dia.
- Teste Playwright adicionado em `tests/tetris-daily.spec.ts`: falhar, oferecer reinício e voltar ao countdown da mesma missão. CI no commit `13e46b71` ainda pendente de conclusão na última consulta; o proprietário valida o Preview visualmente. Sem merge ou produção.


## Snake — controles e recorde autenticado (18/11/2026)
- O proprietário mostrou 3 capturas: controles direcionais ocupando espaço desnecessário abaixo do jogo em desktop; estando autenticado, o Snake mostrava **Recorde pessoal: 0** e **Recorde local: 0**, embora houvesse recordes por conta.
- Em `src/pages/jogos/snake.astro`, controles de direção são ocultados **somente com ponteiro fino e hover (mouse/desktop)**; dispositivos de toque continuam com botões e gestos. O campo lateral tem ID próprio `snake-best-label` para diferenciar estado autenticado de local.
- Em `src/scripts/snake.ts`, quando há conta ativa, HUD e lateral usam o recorde da **conta**, não máximo misturado entre localStorage e banco. Sem recorde na conta exibe **—**, não 0 inventado; sem conta permanece “Recorde local”. Após `oldarcade:account-changed`, reconsulta autenticação e ranking. Falha de ranking não apaga recorde confirmado.
- Em `src/scripts/globalLeaderboard.ts`, o evento de recorde pessoal usa `mine.score` ou fallback `myGames`; consultas simultâneas enfileiram atualização posterior à autenticação, impedindo que resultado anônimo pré-login fique na tela.
- E2E Snake adicionado para troca de conta anon→autenticado (recorde 340), ausência de recorde (“—”) e ocultação dos controles conforme tipo de ponteiro. Verificar CI e Preview do HEAD antes da aprovação; sem merge, produção, Lovable, Work nem ações D1.

## Snake em tela cheia — edição histórica não é desafio (18/11/2026)
- Print real: Snake em tela cheia com **"Partida diária original"**, texto "Não havia meta de vitória", HUD **"Frutas: 0/0"**, placar 100 em 29s e faixa de missão ocupando toda a largura. Trata-se da **versão v1** da missão de 18/11/2026, intencionalmente sem meta; **não inventar meta retroativamente**, nem exibir contagem vazia como missão. O usuário espera desafio real nas missões novas.
- `src/scripts/dailyCalendar.ts` agora identifica `mission.kind==='legacy'` e **oculta tracker e contador** em vez de mostrar 0/0. Escuta evento `oldarcade:daily-mission-selected` emitido pelo início real de Snake e Tetris, de modo que o HUD segue a **missão da partida**, e não a selecionada no calendário nem o laboratório do Preview. Durante partida v1, indicador muda para **"PARTIDA DIÁRIA HISTÓRICA"** e a descrição informa explicitamente "sem desafio". A renderização do calendário no Preview não substitui a missão histórica por uma missão de treino enquanto a partida estiver em andamento.
- Tela cheia Snake: `src/pages/jogos/snake.astro` limita largura do painel de missão ao conjunto tabuleiro+placar e compacta o cartão, responsivo. E2E cobre edição histórica sem contador e largura do cartão em modo de tela cheia simulado.
- A aplicação continua no GitHub em `feat/tetris-jogo-002`; verificar CI e QA visual antes de aprovação. Não publicar produção, não mexer D1 ou Lovable, não usar Work.

## Snake Diário — localização do painel e inconsistência 0/7 (18/11/2026)
- Proprietário apontou no print de Snake: cartão "Corrida contra o relógio" em **coluna errada**, dentro das estatísticas secundárias "Seu desempenho" à direita do jogo; overlay mostrava vitória 70 pontos em 17s, mas o cartão exibia **Frutas: 0/7**.
- Correção na branch `feat/tetris-jogo-002`: `src/pages/jogos/snake.astro` cria `[data-daily-mission-sidebar]` dentro de `#game-stage` **entre cabeçalho e tabuleiro**, ocupando largura da coluna principal e com CSS responsivo; remove atributo do `aside` de desempenho. Estatísticas permanecem independentes.
- Em `src/scripts/snake.ts`, `end(won)` emite `oldarcade:daily-progress` final **antes** de limpar o estado da missão; `src/scripts/dailyCalendar.ts` guarda `finalPracticeProgress` entre a mensagem de encerramento e a próxima partida e não reinicia o cartão em 0/x imediatamente após a vitória. Nova missão e iniciar teste zeram o progresso.
- E2E adiciona verificação do contêiner no palco principal e 7/7 quando recebe score 70. Verificar CI no HEAD antes de dizer que passou; Preview e teste real ainda pendentes.
- Contexto de aceite: a missão deve ter destaque no **palco do jogo**, jamais na lateral de estatísticas; resultado final e contador precisam concordar. Sem Work/Lovable/merge/publicação.

## Correção crítica das missões — 18/11/2026
- Relato com evidência: no Tetris, missão "Duplas perfeitas" marcou **5/4 etapas** e chegou a aparentar conclusão após derrota; no Snake, o jogador iniciou missão diária mas **o objetivo não aparecia na área do jogo**.
- **Causa real:** `src/scripts/tetris.ts` só verificava conclusão/erro de sequência em `kind==='sequence'`, mas a biblioteca produz `kind==='singles'`, `'doubles'`, `'timed-sequence'`; todas usam `metric==='sequence'`. Correção: aplicar verificação por **métrica**, com derrota imediata em limpeza fora de ordem e vitória no número exato de etapas. O sucesso no laboratório também requer `finish(completed=true)`, não apenas comparar contadores após a derrota.
- O HUD em `src/scripts/dailyCalendar.ts` limita visualização de progresso a `meta` (nunca mostrar **5/4**) e indica dados excedidos como tentativa não concluída. O painel Snake agora é inserido **antes das estatísticas**, permanecendo visível logo no início da lateral, inclusive em missões especiais.
- Treino Snake: `end(won=false)` (colisão/fim) não pode gerar vitória mesmo se o placar estiver alto; eventos de resultado de treino distinguem sucesso e derrota para liberar o botão de tentar novamente. O laboratório do Preview é repetível, não consome tentativa oficial.
- Novos testes E2E: Snake mostrando missão no primeiro elemento da lateral e progresso de frutas; Tetris impedindo 5/4. Testes existentes de API foram ajustados aos contratos atuais de missão recebida até completar. **CI do HEAD precisa confirmar; não afirmar validação final sem resultado.**
- O proprietário **não quer Work** para este fluxo; executar GitHub pelo chat, sem Lovable, sem merge nem deploy de produção. Evitar voltar a sugerir Work por reflexo.
 
## Missões diárias variáveis automaticamente — 18/11/2026 (implementação na PR #2)
- Pedido do proprietário: o Desafio Diário não pode ser apenas jogar Clássico; deve apresentar **meta objetiva, vitória/derrota e variedade autossustentável por 100, 500, 1.000+ dias**, sem cadastro manual de desafios. Novas ideias: Tetris apenas limpar 4 linhas (limpezas de 1/2/3 causam derrota), sequência exata de limpezas visível com destaque na lateral; Snake obstáculos, inimigos, objetivos combinados.
- O proprietário confirmou **SQL 0010 já executado no D1 Preview `oldarcade-stats-preview`**: adicionadas colunas `lines_cleared` e `mission_success` na tabela `daily_challenge_attempts`. Não solicitar novamente. Produção não alterada.
- Gerador único em `src/data/dailyChallenges.js`: versões históricas: v1 até 18/11 (partida original sem meta); v2 em 19/11 (meta de frutas, tempo, sobrevivência; linhas, sprint, pontos); **v3 a partir de 20/11/2026**, com 5 famílias por jogo (Snake coleta, corrida, sobrevivência, labirinto com obstáculos, perseguição com inimigos/obstáculos; Tetris linhas, sprint, pontos, somente Tetris de 4 linhas, sequência exata). Mesma missão/data/seed para todos, alternância de famílias e variações de metas/dificuldade determinísticas. **Nunca reescrever regra de versão antiga após publicar**, pois sustenta futuro replay recreativo.
- API em `functions/api/daily/[game].js`: GET expõe `mission` pública antes do início, inclusive visitantes; POST start usa versão do dia e fornece a missão, preservando regra de uma tentativa. POST finish lê `seed_version` da tentativa e calcula `missionSuccess` de forma determinística; v3 Tetris verifica array `clearSequence` (somente números 1..4, soma igual a linhas reportadas, ordem exata), sem nova coluna ou SQL. Existe proteção SQL `SELECT lines_cleared, mission_success ... LIMIT 0` antes de reservar v2. Pontuações/séries ainda não são reproduzidas/verificadas por simulação no servidor: não exibir rankings competitivos oficiais de missões até implementar antitrapaça.
- `snake.ts`: vitórias por frutas/tempo sobrevivido; missões com obstáculos e inimigos em posições determinísticas pelo seed, sem mudar Clássico livre; comunica progresso. `tetris.ts`: metas de pontos/linhas, missões temporizadas, somente quádruplas e sequências exatas; envia array de limpezas e progresso; partidas livres permanecem intactas.
- `DailyCalendar.astro` e `dailyCalendar.ts`: objetivo detalhado ANTES de consumir tentativa; painel de progresso inserido dinamicamente em `[data-daily-mission-sidebar]` ao lado de tabuleiro Snake/Tetris; numera a sequência, evidencia próxima limpeza, estados de missão. `DailyHistory.astro` e API de perfil apresentam vitória/derrota/missão/linhas.
- Testes API incluem simulação determinística de 1000 dias e regras de vitória. **Verificar CI/Preview do HEAD; nenhuma aprovação visual ou QA real declarada.** Sem merge, sem deploy oficial, sem novos SQLs. Futuro: ampliar biblioteca de objetivos, metas compostas e checagem de plausibilidade/antifraude, sem alterar versões históricas.

## D1 Preview — correção da tabela ausente confirmada pelo proprietário (18/11/2026)
- Proprietário respondeu **"pronto"** após receber o SQL fiel ao arquivo `migrations/0008_daily_challenges.sql` com `CREATE TABLE IF NOT EXISTS daily_challenge_attempts` e `CREATE INDEX IF NOT EXISTS idx_daily_challenge_profile` para executar manualmente no banco **`oldarcade-stats-preview`**. Registrar como **execução informada pelo proprietário**; verificação direta da existência da tabela neste ambiente ainda não realizada. NÃO solicitar execução da 0008 novamente.
- O diagnóstico anterior foi consistente: antes dessa execução, o proprietário mostrou `SELECT name FROM sqlite_master WHERE type='table' AND name='daily_challenge_attempts';` retornando zero linhas; o calendário de logado ficava bloqueado por consulta de histórico. Após aplicação, conferir GET de calendário **autenticado** e condições de elegibilidade sem consumir tentativa; somente depois validar partida oficial com o jogador.
- Nenhuma operação feita no D1 pelo agente; produção NÃO tocada. Migração 0009 informada aplicada anteriormente, não pedir novamente.
- Durante inspeção de CI, detectada falha E2E de login: teste anterior rolava a página 500 px e clicava em link do header fora da viewport, causando scroll automático do navegador antes de abrir modal (teste mediu deslocamento como se viesse do login). Teste ajustado para separar clique normal no header e abertura do modal por evento no ponto atual; não mudou lógica de autenticação. Conferir CI do HEAD.
- Ideia da moeda virtual permanece backlog em `docs/BACKLOG_MOEDA_ARCADE.md`, não implementada.

## Resultado confirmado do D1 e backlog de moeda — 18/11/2026
- **Prova direta fornecida pelo proprietário:** no Console do banco D1 que consultou, `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'daily_challenge_attempts';` retornou **nenhuma linha**. Portanto, a tabela `daily_challenge_attempts` NÃO EXISTE nesse banco consultado; o bloqueio na consulta autenticada é esperado. Isso substitui as suposições anteriores de que a migração 0008 estava corretamente aplicada nesse D1: o proprietário havia informado aplicação, mas a verificação atual demonstra a ausência da tabela. **Não afirmar que o Preview tem a tabela até confirmação de aplicação e verificação.**
- **Próxima ação manual necessária:** executar no D1 `oldarcade-stats-preview` **somente** as instruções `CREATE TABLE IF NOT EXISTS daily_challenge_attempts` e `CREATE INDEX IF NOT EXISTS idx_daily_challenge_profile` de `migrations/0008_daily_challenges.sql`, copiadas fielmente, sem executar produção. O usuário executa e confirma; o agente não altera D1 diretamente. A criação não remove dados nem consome tentativas, mas exige verificar que o console aponta para o banco Preview correto.
- **Ideia futura registrada, não implementada:** moeda virtual do OldArcade ganha por metas/participação, usada para desbloquear replay **recreativo** de desafios antigos e outras funcionalidades. Mais à frente, estudar venda de moeda, mas sem autorização de pagamentos agora. O replay não substitui nem reabre a tentativa diária oficial e não altera ranking/histórico competitivo. Fonte detalhada: [BACKLOG_MOEDA_ARCADE.md](BACKLOG_MOEDA_ARCADE.md). Nenhum código, migração ou cobrança dessa ideia foi criado.
- Continua sem autorização de merge, produção ou Lovable. A prioridade atual permanece destravar os Desafios Diários Snake e Tetris no D1 Preview e validá-los como jogador.

## Investigação D1 — screenshot de 18/11/2026: calendário bloqueado em conta logada
- Evidência recebida do jogador: no Tetris Diário, sessão autenticada mostra calendário com data de hoje, mas aviso "Não foi possível verificar seu desafio / O histórico de tentativas está indisponível"; NÃO há prova de que a tentativa foi iniciada ou concluída. O bloqueio é fail-safe após exceção do SELECT privado.
- Código revisado: `migrations/0008_daily_challenges.sql` cria `daily_challenge_attempts` com `challenge_date`, `outcome`, `score`, `duration_ms`; API executa `SELECT challenge_date,outcome,score,duration_ms FROM daily_challenge_attempts WHERE game=? AND player_id=? AND challenge_date>=? AND challenge_date<?`. Os nomes batem com migração. Autenticação e acesso ao D1 existem, pois a conta é retornada. A falha está na consulta ao histórico/tabela ou binding de banco da instância do Preview. Ainda NÃO confirmamos a causa direta do D1 real.
- Commit `87e1844`: API registra erro no log do Cloudflare com código `SCHEMA_MISSING` se o erro for `no such table: daily_challenge_attempts`, e `HISTORY_QUERY_FAILED` nos demais; resposta de leitura apresenta `errorCode` e mensagem distinta, sem expor stack/token, e preserva bloqueio de tentativa. Teste correspondente no commit `eb6529f4`.
- **Intervenção pedida ao proprietário imediatamente:** executar SQL **somente leitura** no D1 `oldarcade-stats-preview`, Console: `SELECT name FROM sqlite_master WHERE type='table' AND name='daily_challenge_attempts';` e informar se retornou nome ou vazio. NÃO reaplicar 0008/0009, NÃO inserir, apagar ou resetar tentativas. Se tabela existe no D1 esperado, verificar binding efetivo do Cloudflare Pages Preview; se não existe, preparar reparo exato no banco conectado, com intervenção do proprietário, sem tocar produção.
- Nenhum merge ou publicação de produção; CI do HEAD em avaliação.

## Desafio Diário — estados, objetivo e transparência de tentativa (18/11/2026)
- Proprietário relatou que, mesmo com calendário visível, ele **parecia já jogado**, sem objetivo claro, sem dizer se partida está acontecendo, terminou ou se foi uma falha. Não considerar concluída uma tentativa apenas por ela estar marcada `started`.
- `DailyCalendar.astro` agora explica objetivo real: **Snake Clássico / Tetris Clássico**, buscar maior pontuação, mesma sequência de frutas/peças por data, uma tentativa; card de estado grande e visível acima do calendário. `dailyCalendar.ts` apresenta estados independentes: **disponível**, **em andamento**, **tentativa iniciada mas sem conclusão confirmada**, **resultado pendente**, **concluído**, **histórico indisponível**, visitante e datas anteriores. Estado `started` sozinho NÃO afirma conclusão. Se DB falhar, não simula que a pessoa já jogou; mostra indisponibilidade e bloqueia nova partida (fail-safe).
- Motores `snake.ts` e `tetris.ts` enviam `oldarcade:daily-phase` em início real, após fim pendente e após envio confirmado; selo `data-daily-play-indicator` aparece junto do tabuleiro enquanto jogo diário está ativo. O botão de iniciar some assim que o motor iniciar, antes mesmo do GET seguinte, impedindo duplo clique.
- GET privado `/api/daily/{game}` devolve pontos e duração **somente para a própria conta** nos resultados `finished`; card informa pontuação quando a consulta confirma. Na Home, `historyAvailable:false` remove desafio da vitrine em vez de anunciar algo que não pode ser iniciado.
- Cobertura API e E2E atualizada. CI ainda precisa confirmar HEAD. Não autorizar replay nem resetar tentativas existentes; nenhuma migração nova. Produção não autorizada.

## Bug do calendário somente quando logado — 18/11/2026
- Relatado pelo proprietário: calendário diário permanece em carregamento quando **autenticado**, mas abre ao sair da conta. O bug **já ocorria antes da implementação do modal global de login**; portanto, não atribuir sua origem ao modal.
- Investigação: GET `/api/daily/[game]` anteriormente usava `currentPlayer` (que consulta também colunas opcionais de preferências) e depois `daily_challenge_attempts`. O caminho público não lia o histórico; qualquer exceção do caminho autenticado devolvia 503, impedindo renderização. **A causa exata no D1 Preview não foi verificada por consulta direta.**
- Correções na branch: GET e POST usam `dailyPlayer` que lê da sessão somente ID e nickname, via `sessionCookie` compartilhado; GET devolve calendário público/identidade mesmo quando histórico falha, com `historyAvailable:false` e aviso explícito. O cliente `dailyCalendar.ts` sempre renderiza dias ao receber esse retorno, mas **bloqueia desafio** quando o histórico não pôde ser verificado (sem risco de permitir replay). Falha de rede deixa mensagem legível, não carregamento infinito.
- Regressões: `tests-api/daily-challenges.test.mjs` verifica GET autenticado e tabela indisponível; `tests/daily-challenge.spec.ts` garante mês e dias renderizados com botão desativado. Confirmar CI/Preview HEAD antes de marcar validado com sessão real.
- Migrações 0008 e 0009 foram confirmadas executadas pelo proprietário no D1 Preview; não solicitar reexecução sem evidência nova e aprovação. Sem merge nem publicação de produção.

## Regra global de acesso sem sair da página — 18/11/2026
- **Decisão obrigatória do proprietário:** entrar ou cadastrar-se **nunca** deve redirecionar o jogador para Meu Perfil nem mudar rota/scroll/contexto atual; perfil é página de consulta acessada **apenas por escolha explícita**. Sair do site não requer passar por perfil. A autenticação deve abrir modal no próprio local, e ao concluir fechar modal e continuar exatamente onde estava.
- Implementado `src/components/GlobalAuthModal.astro` e `src/scripts/globalAuth.ts`, instalados uma vez no `src/layouts/Base.astro`. Reutilizam POST `/api/auth/login` e `/api/auth/register`; disparam `oldarcade:account-changed` para atualizar header, ranking, calendários e demais consumidores. Mostram código de recuperação quando cadastro retorna um; sem redirecionamento ou reinicialização do jogo. Links `data-auth-trigger` acionam modal com fallback `/conta/` para navegador sem JS.
- Menu global oferece **Entrar** (modal) enquanto visitante e oculta esse link ao conectar; **Minha conta** é link explícito para perfil. Calendário diário Snake/Tetris abre o mesmo modal quando visitante toca no dia de hoje, e CTA `Entrar ou criar conta` também o utiliza. Depois de entrar, o calendário atualiza elegibilidade na mesma rota. Minha Conta reage a `oldarcade:account-changed` se aberta intencionalmente.
- Calendário compartilhado `src/components/DailyCalendar.astro` redesenhado com cabeçalho arcade, mês, células com estados distinguíveis e maior contraste, legenda e CTA. Estilos `is:global` alcançam dias criados dinamicamente pelo script (Astro scoped CSS anterior não alcançava esses elementos, causando visual cinza de botões desabilitados).
- Testes E2E: `tests/global-auth-modal.spec.ts`, mais testes diários existentes. **Confirmar CI do HEAD e Preview** antes de marcar validado. Sem deploy de produção. Não pedir SQL 0008/0009 outra vez.

## Home arcade — organização e qualidade visual implementadas (2026-11-18)
- **Decisão do proprietário:** a prioridade é o resultado **dentro do site**, com organização e acabamento equivalente ao conceito apresentado, sem insistência em formato PNG versus SVG. Cards e menus precisam ser apresentáveis e consistentes com o perfil já aprovado.
- `src/pages/index.astro`: substituída abertura inchada por hero compacto com identidade arcade; contadores continuam em linha; mantido apenas um destaque rotativo de Desafio Diário; dois cards (Snake e Tetris), cada um com três modos derivados de `gameModes.js`; artes existentes continuam representando a mecânica de forma honesta; links de ranking, conta e história mantidos. Não inserir um card por modalidade.
- `src/styles/global.css`: Home remodelada com bordas e superfícies de `--oa-*` do design system global já usado em Minha Conta; navegação lateral com estado ativo legível; CTA diário dourado e marca de 24h; arte com overlay e letreiro por jogo; botões dos modos com ícone, rótulo e seta; estados hover/focus; layouts de desktop/tablet/celular e movimentos reduzidos. Não duplica a lógica da API.
- Testes legados ajustados para cabeçalhos atuais de Home e Conta; novos testes de catálogo e desafios permanecem. **CI/Preview precisam ser confirmados para HEAD; não declarar aprovação visual do proprietário.**
- GitHub branch `feat/tetris-jogo-002`, PR #2, sem merge nem publicação oficial. SQL 0008 e 0009 confirmados aplicados no Preview; nenhum SQL adicional desta mudança.

## Design System global e perfil estatístico — implementação concreta (17/11/2026)
- O proprietário constatou inconsistência visual entre cards, bordas e layouts em Home, Perfil e demais páginas; **regra aprovada é identidade visual única do site inteiro**, não desenhos pontuais. Documentação anterior já exigia componentes reutilizáveis, portanto executar, não reabrir discussão.
- Implementado em `src/styles/global.css`: tokens de superfícies, contornos, cores, cantos, sombras e cards compartilhados; aplicado a `.panel`, `.game-card`, `.home-game-card`, `.rankings-panel`, `.account-record-card`, `.account-kpi`, `.account-settings`, `.daily-history-entry`; botões coerentes, responsividade global.
- Reorganizado `src/pages/conta.astro` em **dashboard**: identidade do jogador, 3 KPIs (modalidades com recorde, lideranças #1, pódios Top 3), grupos Snake/Tetris de cards homogêneos, recorde pessoal e posição global em destaque, próximo desafio em texto curto, missões em detalhes recolhíveis, CTA por modo. Histórico diário preservado; preferências de e-mail ficam em seção posterior e distinta. Dados reais vêm de endpoints atuais; sem números inventados; KPIs zeram ao trocar sessão.
- Corrigidos testes legados da Home que exigiam um card por modalidade, incompatíveis com a decisão explícita de um card por título. Adicionado `tests/account-dashboard.spec.ts` para desktop e celular; **validar CI do HEAD, não declarar aprovado sem conclusão**.
- Arte raster premium ainda não foi efetivamente substituída no repositório; SVGs anteriores são provisórios. Não afirmar que a imagem gerada em conversa esteja no site. Sem merge ou publicação oficial.
- O trabalho foi realizado em commits da branch `feat/tetris-jogo-002`. O proprietário faz QA final como jogador, não teste fragmentado ou conferência de JSON. SQLs 0008/0009 já confirmados como aplicados no D1 Preview.

## Home consolidada, logo provisória e SQL 0009 confirmado (17/11/2026)
- O proprietário confirmou **SQL 0009 executado no D1 Preview**. Não solicitar novamente; registro baseado na confirmação do proprietário, não numa leitura direta do banco. SQL 0008 já havia sido confirmado. Produção não autorizada.
- Home anteriormente sobrecarregada com um card por modo: agora **um card por título**, Snake e Tetris, cada um com três links de modos obtidos do catálogo central `gameModes.js`. Arte vetorial original reutilizável em `public/images/snake-arcade.svg` e `tetris-arcade.svg`; responsividade em `src/styles/global.css`. Preservar header, atividades compactas, SEO verdadeiro, contadores e navegação.
- Novo `src/scripts/homeDaily.ts` monta **um destaque diário único** usando `DAILY_MODES` e respostas GET de `/api/daily/{game}`, sem POST nem gasto de tentativa na Home. Visitante vê convite gratuito; usuário autenticado só vê jogos ainda não iniciados naquele dia. Consumiu uma tentativa (started ou finished) → aquele jogo sai do destaque; usou ambos → nenhuma campanha do dia. Em visitas sucessivas, alterna entre jogos elegíveis via `sessionStorage`, sem repetir se há outra opção; se falhar consulta de algum jogo, não anuncia disponibilidade fictícia.
- Logo provisória OldArcade: `public/images/oldarcade-mark.svg`, adicionada no `src/layouts/Base.astro` (cabeçalho global) e CSS. Conceito de gabinete/controle arcade neon; pode ser trocada após validação visual do proprietário.
- E2E `tests/home-catalog-daily.spec.ts` cobre dois cards/seis modos, visitante, participante com um desafio consumido, participante com ambos consumidos e presença da nova marca. **CI/Preview da revisão final ainda devem ser verificados antes de declarar conclusão e pedir validação como jogador.**
- Commits da implementação na PR #2 sem merge, Lovable ou publicação de produção. Próxima ação técnica: conferir CI do HEAD e revisar quaisquer falhas, depois entregar um único fluxo de teste de jogador.

## Fluxo operacional definitivo — sem gargalos, proprietário participa quando necessário (17/11/2026)
- **Esclarecimento do proprietário:** não é proibido pedir novos SQLs, acessos, configurações, decisões ou outras intervenções. Pelo contrário: **pedir imediatamente quando a ação se tornar necessária**, com instruções objetivas; ele executa e o desenvolvimento continua. Não acumular dependências para o final nem interromper o avanço por formalidades.
- Diferenciar **intervenção operacional indispensável** (o proprietário atua na hora para destravar) de **testes técnicos fragmentados** (responsabilidade do agente; não terceirizar logs, JSONs, APIs, código, CI e depuração ao proprietário).
- Concluir interface, backend, integração, contratos globais, regressões e testes técnicos antes da **validação de experiência do jogador**, que o proprietário faz como usuário final com entrega consolidada. Caso exista bloqueio que só ele possa resolver, avisar assim que for identificado, não esperar a entrega.
- SQL 0008 do Desafio Diário Snake **já executado manualmente pelo proprietário no D1 Preview**, segundo sua confirmação. Não pedir de novo; somente validar funcionamento. Produção continua dependente de autorização separada.
- Esta regra está em `AGENTS.md` e prevalece sobre interpretações anteriores como "nenhum SQL adicional" ou "somente intervenção ao final". Sem merge ou publicação automática.

## Entrega integrada — Desafio Diário Tetris e preferências de e-mail (17/11/2026)
- **Solicitação:** disponibilizar Desafio Diário também no Tetris, não apenas Snake. Visitantes devem vê-lo e, ao tentar participar, receber explicação amigável: jogar é livre; conta gratuita é benefício para ranking, histórico e uma tentativa diária. Cadastro e perfil precisam permitir inserir e-mail opcional e selecionar separadamente avisos de recorde superado e novo desafio diário.
- **Tetris Diário preparado na branch `feat/tetris-jogo-002`:** `src/data/dailyChallenges.js` habilita `tetris` com mesma API/seed/calendário/histórico de Snake; `TetrisGame.astro` inclui calendário no Clássico e links nos modos Sprint/Sobrevivência; `src/scripts/tetris.ts` troca o embaralhamento por gerador determinístico somente na tentativa diária, exige confirmação do POST atômico antes de iniciar e grava resultado uma vez no endpoint diário, isolando-o dos recordes locais/globais do Tetris livre. `functions/api/daily/[game].js` valida limites de pontos de Tetris próprios. Uma tentativa abandonada não é reaberta. Não há ranking diário público, apenas histórico privado.
- **Convite para visitantes compartilhado:** `DailyCalendar.astro` e `dailyCalendar.ts` mostram benefícios; tocar/clicar no dia atual sem login abre aviso e acesso gratuito à conta. Reaproveitado pelo Snake e Tetris.
- **E-mail e preferências:** cadastro em `conta.astro`, formulário de ranking compartilhado e formulário inline do Snake; edição posterior no perfil via `/api/account/preferences` com sessão autenticada e verificação de origem. Preferências são independentes, sem enviar mensagens ainda. Mudança de e-mail invalida confirmação anterior; confirmação de e-mail e envio dependem de infraestrutura separada. **Não insinuar que avisos serão enviados imediatamente.**
- **SQL 0009 necessário no Preview:** arquivo `migrations/0009_daily_email_preferences.sql` com `ALTER TABLE player_accounts ADD COLUMN daily_email_opt_in ...`. SQL foi entregue ao proprietário durante a implementação; **aplicação confirmada pelo proprietário nesta conversa**. O SQL 0008 foi confirmado aplicado anteriormente. Sem executar SQL pelo agente; produção exige autorização distinta.
- **Testes adicionados:** `tests-api/email-preferences.test.mjs`, cobertura Tetris em `tests-api/daily-challenges.test.mjs`, `tests/tetris-daily.spec.ts`. Verificar GitHub Actions HEAD e corrigir eventuais falhas; CI verde e QA manual ainda não confirmados. Não convidar usuário a testes fragmentados: entregar Preview integrado ao jogador após correções.
- **Fluxo de continuidade:** SQL 0009 já foi aplicado segundo confirmação do proprietário; não pedir novamente; confirmar testes/Preview e seguir. Nenhum merge ou deploy de produção autorizado.

## ESTADO ATUAL PARA NOVO CHAT — SQL diário e validação (17/11/2026)
- **Migração 0008:** o proprietário confirmou "pronto" após receber o SQL integral de `migrations/0008_daily_challenges.sql` e executá-lo manualmente no Cloudflare D1 `oldarcade-stats-preview`. **Aplicação informada pelo proprietário; leitura/funcionamento real da tabela ainda não verificados por API.** Não executar novamente sem necessidade comprovada. Produção continua sem autorização.
- **Regra permanente de SQL aprovada:** enviar imediatamente o SQL fiel ao arquivo da branch sempre que chegar a etapa necessária, indicar banco e ambiente; proprietário cola/executa, responde "pronto" e então avançamos sem renegociar o procedimento. Agente não executa SQL por conta própria. Regra também registrada no `AGENTS.md`.
- **CI PR #2 HEAD antes deste registro:** revisão `90f6a4a`, Actions `44196695046` e `44196686578` falharam na etapa Playwright, apesar de tipos, build e API aprovados. 148 testes de navegador passaram, 4 falharam (texto capitalizado "Não é" no histórico Snake versus regex minúsculo; link "Sugerir uma correção sobre filmes ou plataformas" versus teste que busca nome curto exato/regex não contígua), 1 teste Snake Aventura instável. Essas falhas **não comprovam problema específico no diário**.
- **Preview do commit 90f6a4a comprovado pelo check Cloudflare:** `https://f89334a0.oldarcade-17c.pages.dev/jogos/snake/`; alias da branch `https://feat-tetris-jogo-002.oldarcade-17c.pages.dev/jogos/snake/`. Deploy não equivale a QA do desafio.
- **Próxima etapa:** validar consulta GET do calendário e histórico autenticado no Preview sem gastar tentativa; depois, em conta de teste e com ciência do proprietário, testar a reserva de uma tentativa única e o registro de seu encerramento. Corrigir as falhas de CI e reexecutar testes antes de aceite. Não mesclar/publicar nem executar SQL de produção.


## Desafio Diário — piloto Snake com login obrigatório (17/11/2026)
- **Pedido:** antes de publicar oficialmente e antes do jogo #003, criar componente global de Desafio Diário, primeiro Snake e depois Tetris. Calendário para cada dia, uma única tentativa por conta/jogo/dia, sem reabrir desafios jogados; somente dados históricos de desempenho no perfil. **Reforço expresso do proprietário:** desafio do dia SOMENTE LOGADO.
- Padrão de implementação: `src/data/dailyChallenges.js` (habilitação por jogo, data oficial `America/Sao_Paulo`, seed determinística com versão); `DailyCalendar.astro`/`dailyCalendar.ts` (calendário mensal, dias passados/futuros bloqueados, acesso público à consulta mas início somente logado); `DailyHistory.astro` em Minha Conta (somente participação e desempenho da conta autenticada). Snake Clássico mantém jogo livre separado.
- **Backend preparado; migração 0008 aplicada manualmente no D1 Preview segundo confirmação do proprietário (validação de API pendente):** `functions/api/daily/[game].js` exige sessão autenticada para POST, verifica origem, data de Brasília, usa INSERT atômico `ON CONFLICT DO NOTHING` por `(game,challenge_date,player_id)`, retorna seed e token aleatório para a única tentativa, conclui uma vez com token e mesma conta. `functions/api/daily/profile.js` devolve histórico privado, exigindo login. `migrations/0008_daily_challenges.sql` **arquivo criado e aplicação no D1 Preview informada em 17/11/2026**; produção requer autorização independente.
- Snake `src/scripts/snake.ts` utiliza o mesmo motor do Clássico, frutas determinísticas durante desafio, não salva score nos recordes locais/nuvem normais, consome tentativa apenas após POST confirmado; fim manda score/tempo exclusivamente à API diária, com reenvio de resultado pendente na sessão (nunca replay). Partidas normais continuam livres.
- Limitação conhecida de segurança: apenas validação estrutural de score e token na API; para leaderboard diário público/produção competitiva é necessário antifraude/verificação de replay ou modelo confiável antes de afirmar resultado auditado. **Neste piloto, resultados são históricos privados, não ranking diário público.**
- Testes adicionados `tests-api/daily-challenges.test.mjs` e `tests/daily-challenge.spec.ts`: login obrigatório, tentativa única e fim único, data do servidor, seed fixa, calendário, troca de usuário. CI do HEAD e QA visual continuam pendentes.
- **Próxima validação:** verificar API/calendário de Preview após confirmação de SQL 0008 aplicado manualmente; testar tentativa real apenas com usuário ciente de que é consumida. Tetris Diário ainda não implementado; só depois do Snake ser validado. Sem merge, produção, SQL adicional automático ou Lovable.

## Filmes históricos verificados e sugestões de correção (17/11/2026)
- Solicitação do proprietário: ao falar da história de um jogo, acrescentar filme/documentário **se existir**, onde assistir **no Brasil na data da publicação/consulta editorial** e aviso de que o catálogo pode mudar em anos; oferecer link para sugerir correções. **Afiliados e livros continuam apenas como implementação futura**.
- Verificado em 17/11/2026: `Tetris` (2023), dramatização sobre Henk Rogers e direitos do jogo, no **Apple TV brasileiro** (página oficial `https://tv.apple.com/br/movie/tetris/umc.cmc.4evmgcam356pzgxs2l7a18d7b`). `Man vs Snake: The Long and Twisted Tale of Nibbler` (2015) é sobre Nibbler, parente histórico da mecânica de cobra, **não** é história do Snake da Nokia; JustWatch Brasil indicou **Filmzie/Plex gratuitamente com anúncios** (`https://br.justwatch.com/br/filme/man-vs-snake`). Availability deve ser revisada na publicação posterior.
- Implementação reutilizável: `src/data/historicalScreenings.ts` guarda dados por jogo, fonte e datas fixas; `src/components/HistoricalScreenings.astro` apresenta obra, modalidade de acesso, data e aviso; `TetrisGame.astro` mostra em todos os três modos, `snake.astro` no clássico. `contato.astro` pré-preenche sugestões com assunto e jogo usando o contato/WhatsApp existente, sujeito à confirmação do usuário. Sem banco, cron nem envio automático.
- Regressão: `tests/historical-screenings.spec.ts` valida ambos os conteúdos, os três modos do Tetris, datas estáticas e navegação até o contato. CI e aprovação visual do Preview permanecem pendentes até confirmação. Sem merge/produção/D1/Lovable.


## BACKLOG — indicações culturais e links de afiliado nas histórias dos jogos (17/11/2026)
- **Status: implementação futura, não ativar agora.** Solicitação do proprietário para os textos de história/origem dos jogos, iniciando pelo Tetris e aplicável também a Snake e próximos jogos.
- Reservar no contrato editorial um **bloco reutilizável** de "Para conhecer mais" ou "Livros, filmes e documentários", alimentado por dados de cada título. Permitir livros para compra via links de afiliado; filmes/documentários com opções legítimas de aluguel, compra ou streaming, usando afiliação **somente quando o programa efetivamente existir e permitir esse destino**.
- Antes de implementar: pesquisar parceiros e condições vigentes, disponibilidade regional no Brasil, títulos e edições corretos, direitos de uso de capas/imagens, atualização de catálogos e manutenção de links. Não inventar títulos, ofertas, preços, disponibilidade ou links de afiliado.
- Mostrar claramente indicação editorial versus publicidade, sinalizar links que geram comissão e aplicar `rel="sponsored noopener noreferrer"` quando couber. Não comprometer navegação, SEO educativo, acessibilidade ou responsividade.
- **Nada de área vazia no Preview/produção:** o ponto de extensão fica documentado nos componentes históricos; só renderizar seção com indicações verificadas. Nenhuma conta/afiliação cadastrada, link comercial ou publicação autorizada nesta etapa.


## Tetris Sobrevivência #002 — terceiro modo (17/11/2026)
- Proprietário aprovou implementar **Sobrevivência após gostar do Sprint**, enquanto ele valida a correção global de sessão ao usar Voltar. Não há autorização de merge, produção ou D1/SQL.
- Nova URL em Preview: `/jogos/tetris/sobrevivencia/`, modo competitivo `tetris-survival`; não aumenta número de jogos (continua Tetris #002) nem altera versões editoriais aprovadas. Os três modos usam `src/components/TetrisGame.astro` e `src/scripts/tetris.ts`, mesmo tabuleiro, controles, contagem, relógio, pausa, reserva, fullscreen e HUD.
- **Mecânica:** toda onda começa em função do **tempo efetivo**, subindo a cada 30.000 ms. `src/data/tetrisRules.js` centraliza nível e gravidade para Clássico (por linhas), Sprint (fixa) e Sobrevivência (por tempo): 900 ms de início, fator 0,82 por onda, limite 70 ms; reforço de perigo visual a partir da onda 4. Pausas e contagem não acumulam tempo. Sobrevivência acaba quando a peça não consegue entrar/encaixar no tabuleiro. Linhas liberam espaço, mas **não são a métrica do ranking**.
- **Competição:** `gameModes.js` define `ranking:'survival'` e `speedIntervalMs:30000`; `rankingRules.js` suporta métricas de tempo com direções distintas; API de leaderboard já existente ordena e atualiza Sobrevivência por **maior duração**, enquanto Sprint continua por **menor duração** e Clássico por **pontos**. O resultado válido é o tempo efetivo inteiro em milissegundos, idêntico a `durationMs`, positivo; empate por registro mais antigo (sem inventar critério de linhas não persistido na D1). Nenhuma migração nem alteração em banco. Id separado garante recordes e contadores independentes.
- `GameRanking`, página geral de rankings, Minha Conta e compartilhamento recebem a métrica pelo catálogo, sem bifurcar componentes. Tela específica apresenta descrição real de Sobrevivência, destaque de perigo e três abas.
- Testes: `tests-api/tetris-survival.test.mjs` cobre comparação/ordenação ASC e DESC, validações e ondas; `tests/tetris-survival.spec.ts` cobre rota, navegação, HUD, pausa, recorde de partida encerrada e fullscreen ultrawide. Contratos de catálogo e SEO recebem novo modo.
- **Antes de declarar pronto:** acompanhar CI HEAD, revisar regressões e confirmação do Preview Cloudflare; teste visual e aprovação permanecem com proprietário. Sem Lovable, SQL/D1, merge ou produção.

## Sessão restaurada ao navegar Voltar — Sprint e todas as páginas (17/11/2026)
- Proprietário validou positivamente o Tetris Sprint, mas relatou: após entrar como outro usuário e pressionar Voltar, o navegador mostrava o nickname da conta anterior. Problema **global de autenticação/navegação**, não da mecânica Sprint.
- Causa: o navegador pode restaurar uma tela a partir do BFCache (Back/Forward Cache) sem rodar de novo o script de inicialização; `src/scripts/accountIdentity.ts` consultava `/api/auth/me` somente na primeira montagem. O `modeRanking.ts` também precisa receber a atualização para descartar recorde da conta anterior.
- Solução compartilhada: `accountIdentity.ts` agora trata `pageshow.persisted`, invalida imediatamente nome/recorde antigo via `oldarcade:account-changed`, refaz a consulta com `cache:'no-store'` e propaga a sessão corrente em novo evento de identidade. Controla versão de requisição para impedir que resposta antiga sobreponha a mais recente. `src/pages/conta.astro` consome `oldarcade:session-refreshed` para atualizar também o formulário/painel ao voltar; sem criar solução por jogo.
- Testes `tests/account-navigation.spec.ts`: simulam troca de Conta A→B ao voltar para Sprint e logout ao voltar para Minha conta, conferindo nickname, botão de conta e tempo do ranking. Teste preexistente `tests/tetris.spec.ts` corrigido para simular logout de verdade (a resposta mockada não pode continuar retornando Conta B).
- **Pendente:** verificar CI do HEAD e aprovação visual do proprietário no Preview. Nenhuma alteração em D1, produção, merge ou Lovable.


## Incidente de sessão — recorde local confundido com recorde de conta (17/11/2026)
- Proprietário identificou nos prints do **Tetris Clássico** (durante implementação de Sprint, sem relação causal com Sprint): ao trocar de conta no mesmo navegador, o HUD ainda mostrava 33.700 da sessão/dispositivo anterior, enquanto ranking da conta nova mostrava 3.400.
- Causa confirmada: `src/scripts/tetris.ts` usava `localStorage` (melhor pontuação **local**, de todo o dispositivo) como fonte do `tetris-best` rotulado indevidamente “Recorde pessoal”. O registro do servidor já era independente por usuário; era falha de apresentação, não prova de gravação cruzada no D1.
- Alterações: `tetris-best` passa a renderizar o `personal` retornado pelo evento compartilhado `oldarcade:mode-ranking-updated` do servidor (ou `—` sem marca autenticada), e `tetris-local-best` continua explicitamente identificado como “melhor ... local” (`fee7d0e9`, `d23a38b3`). `modeRanking.ts` invalida imediatamente o recorde anterior em `oldarcade:account-changed`, faz novo GET e impede resposta antiga de sobrescrever a sessão nova (`9b8a6c26`). O contrato passou a fornecer `personal:null` quando não há marca.
- Regressão `tests/tetris.spec.ts` simula trocar de Conta A 33.700 para Conta B 3.400 com cache local 33.700, depois sair da conta. Exige que o HUD mostre 3.400 e depois `—`, preservando 33.700 apenas no campo **local** (`f956a634`, `d5e3d8e0`). Não zerar cache local nem atribuir um recorde local a uma conta.
- Validação pendente: CI HEAD e visual do proprietário no Preview. Nenhum merge, produção, SQL/D1 ou Lovable. Sprint segue desenvolvimento separado; Sobrevivência ainda não iniciado.


## Tetris Sprint #002 — modo em validação (17/11/2026)
- **Aprovação de escopo:** implementar somente Sprint (40 linhas no menor tempo); validar visualmente antes de desenvolver Sobrevivência. Sobrevivência continua **pendente** e não deve ser implementada antecipadamente.
- Branch de Preview existente: `feat/tetris-jogo-002`, PR #2. Preservar Clássico `/jogos/tetris/`; novo Sprint `/jogos/tetris/sprint/` com modo competitivo `tetris-sprint`.
- Mecânica compartilhada: um único `src/components/TetrisGame.astro` + `src/scripts/tetris.ts` para os dois modos. O Sprint utiliza os mesmos blocos, reserva, ghost, animação do hard drop, countdown, controles desktop/mobile, tela cheia, efeitos e relógio efetivo; velocidade fixa, meta configurada no catálogo `targetLines:40`, tempo parando em pausas e transições; falha por tabuleiro lotado não dispara registro.
- **Ranking compartilhado ampliado:** `src/data/rankingRules.js` e `ranking:'time'` definem o menor resultado; API D1 de leaderboard existente usa ordenação `ASC` e comparação de UPDATE `<` para Sprint, mantendo `DESC` e `>` no Clássico; os valores de tempo são ms inteiros positivos e devem coincidir com `durationMs`. Mesma tabela, sem migração. `GameRanking`, `GameHud`, rankings gerais, conta e compartilhamento recebem a métrica declarativamente. Classificação exclusiva da conta e do ID `tetris-sprint`.
- SEO da rota, histórico editorial e contador globais por modalidade reutilizados. Tetris continua sendo jogo #002 (Sprint **não** soma outro título). Clássico mantém pontuação por linhas, sem alterações de regra.
- Cobertura: `tests-api/tetris-sprint.test.mjs` (critério, formato, API e validação); `tests/tetris-sprint.spec.ts` (página, navegação, teclado, pausa, ranking, não registrar tentativa incompleta e fullscreen ultrawide); contratos atualizados em `tests-api/game-modes.test.mjs` e `game-page-contract.test.mjs`. A verificação CI e Preview da última revisão deve ser checada antes de declarar sucesso. Validação visual é exclusiva do proprietário.
- **Restrições:** sem merge, deploy de produção, SQL/D1, Lovable ou créditos. Próxima ação: confirmar CI, passar link Preview Sprint para teste do proprietário, não iniciar Sobrevivência.


## PENDENTE — observabilidade e relatórios de produção (planejar depois)
- **Status:** backlog, não implementar agora. Solicitação do proprietário em 17/11/2026, inspirada no monitoramento do Chueire Imóveis e KitCasaPré.
- **Alertas críticos por e-mail:** avisar rapidamente sobre indisponibilidade de jogos/site, falhas de autenticação, erros em API/Cloudflare/D1 e impossibilidade de registrar resultados/rankings. Registrar contexto mínimo (momento, ambiente, jogo/fluxo, erro, frequência), agrupar repetições e evitar exposição de dados pessoais.
- **Relatório diário às 18h (America/Sao_Paulo):** resumo de visitas, partidas iniciadas/concluídas quando mensuráveis, jogos mais usados, recordes, falhas e saúde geral, diferenciando Preview de produção.
- **Arquitetura antes da implementação:** avaliar Cloudflare Workers/Cron Triggers, serviço de envio e verificação de saúde externa/independente; usar componente/serviço compartilhado, custo mínimo, controle de alertas e confirmação de entrega; definir destinatário, limites, política de retenção e critérios de severidade antes de ativar.
- **Critérios de aceite futuros:** testar falha simulada sem e-mail real no Preview; deduplicação, retry e relatório diário no fuso correto; monitoramento não deve depender exclusivamente do serviço afetado; somente ativar envio real e deploy de produção com autorização expressa.


## Tetris #002 — Space após Game Over e recorde autenticado não enviado (17/11/2026)
- **Evidência do proprietário no Preview:** com a conta conectada, após pressionar Espaço sucessivamente até Game Over, a partida recomeçou sem intenção. Screenshot mostrou **melhor local 33.700**, **recorde global 3.400** e **ranking da conta 3.400**. O número local por si só não comprova que uma partida de 33.700 foi gravada no servidor, pois é máximo persistido em `localStorage` e pode ter sido obtido sob regra antiga.
- **Causa confirmada no código:** `src/scripts/tetris.ts` executava `start()` ao receber `Space` em estado `over`; `src/scripts/modeRanking.ts` aguardava 6.500 ms **antes** de tentar `submit()`, e se `round` mudasse descartava o resultado antes do POST. Isso permite perda da marca mesmo logado.
- **Correções:** `7a378e82` separa submissão autenticada (imediata, sem atraso e não cancelada por rodada nova) da abertura do login anônimo (atraso visual preservado). Uma falha no POST mantém a opção de tentar novamente mesmo após reiniciar. Sincronização de sessão acompanha evento `oldarcade:account-changed`. `b4607fc9` reserva Space para queda durante jogo e retomada de pausa, nunca início automático após Game Over. `3760d3c9` remove o foco do botão ao começar a contagem, evitando ativação involuntária por Space nativo.
- **Regressão Playwright:** `6697f106`, `ed53f60e` simulam usuário autenticado, resultado de 33.700 com atraso visual 6.500 ms e nova partida imediatamente; exigem exatamente um POST válido e pontuação atualizada antes de 3s. `68b19fbb` joga até Game Over e verifica que Space repetido não reinicia a rodada. `560c5e94` adia **somente a celebração do pódio**, preservando a mensagem de Game Over de 4s mesmo que o servidor confirme a pontuação antes.
- **Validação pendente:** CI do HEAD, Cloudflare Preview atualizado e teste visual do proprietário. Não houve consultas ou alterações no D1, merge, deploy em produção ou Lovable. **Não reenviar automaticamente antigos recordes de `localStorage`**.


## Contrato global + checklist obrigatório — 17/11/2026
- O proprietário reiterou que **já havia aprovado** reutilização de componentes; não deve precisar repetir. Falha de processo do agente: editar páginas individualmente antes de consultar o modelo. A partir desta revisão, `AGENTS.md` aponta explicitamente para o checklist obrigatório, registrado em `docs/PADROES_GLOBAIS_DOS_JOGOS.md`.
- Contagem regressiva 3–2–1 corrigida na **fonte compartilhada**: `src/scripts/gameCountdownOverlay.ts` + `src/styles/global.css`; durante contagem ficam ocultos título, descrição e ação (incluindo botão `.btn` que ignorava `hidden`), permanecendo somente número animado. Consumidores integrados: Snake Clássico, Evolution, Aventura e Tetris, sem cópia do estilo entre jogos.
- Testes de regressão incluem contagem exclusiva no Tetris (`tests/tetris.spec.ts`) e verificação cruzada de Clássico/Evolution/Aventura (`tests/snake.spec.ts`, `562b5421`). **Conferir CI do HEAD e validação visual exclusiva do proprietário; não supor sucesso antes disso**.
- Qualquer mudança de padrão deve ser feita uma vez no componente global e propagada a todos os consumidores na mesma PR. Não houve merge, publicação em produção, SQL/D1 nem Lovable.


## Fullscreen global — arquitetura, não remendos (17/11/2026)
- Feedback do proprietário em monitor **ultrawide**: tela cheia de Tetris e Snake distorcia os tabuleiros/cortava controles. Orientação explícita: não criar correções isoladas por jogo; seguir componentes e padrões reutilizáveis.
- Diagnóstico: CSS global pressupunha Canvas quadrado em todo jogo, inclusive Tetris vertical. Regras de grid dependiam da largura total do monitor e havia regras especiais `#adventure-stage` e fullscreen do Snake/Tetris divergentes.
- **Solução compartilhada** em `src/styles/global.css` (`c8cdd839`, `78148acb`, `c9fcfc85`): contrato único `data-arcade-viewport`, `data-board-shape` e classes `oa-board-slot`/`oa-board-surface`. CSS define tamanho máximo e proporção nativa da superfície, restringe pela altura útil da viewport, centraliza área jogável e HUD e mantém controles visíveis. `square` = Snake (Clássico/Evolution/Aventura), `portrait` = Tetris (10×20). Novos jogos declaram a forma, sem reescrever fullscreen. As regras pontuais de fullscreen adicionadas em Tetris e Snake nesta sessão foram retiradas em favor do contrato único.
- Arquivos Astro dos quatro modos apenas marcam stage/slot/surface com atributos/classes; Tetris mantém estilos específicos somente para peças/próxima/reserva e sua composição. Padrão consolidado em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` (`5a1b8f2e`).
- E2E para `2560×900` adicionados no Tetris (`60ad723f`) e Snake Clássico/Evolution (`c058c88d`). **Evidência necessária:** CI do HEAD e validação visual exclusiva do proprietário em ultrawide, monitor normal e celular. Não afirmar resolução completa sem isso. Sem merge, produção, SQL, Lovable.


## Tetris #002 — pódio real, 4 linhas sem missão e temporização do game over (17/11/2026)
- Feedback visual do proprietário: ao eliminar quatro linhas, o Clássico exibia simultaneamente pontuação e “MISSÃO CUMPRIDA”, apesar de não haver missões; modal de registro aparecia cedo demais após efeito de Game Over; ao fazer login, pódio mostrava “TOP 3” mesmo para 2º colocado e efeito ficava atrás do botão “Jogar novamente”.
- `src/scripts/gameEvents.ts`: `recordGameFinish` aceita `{recordDelayMs}` opcional, preservando chamada compartilhada e comportamento padrão do Snake (`b6172d9c`, `72fa870d`).
- `src/scripts/tetris.ts`: retirada de `celebrate('mission')` para quatro linhas e mudança de nível; permanece o efeito global de pontos (`+800 · TETRIS! 4 linhas` no nível 1), HUD de nível e pontuação apenas por linhas. Término emite `oldarcade:game-finished` com `recordDelayMs:6500`, preservando celebração de derrota de 4s e tela de revanche antes do login. Commit `db632c35`.
- `src/scripts/modeRanking.ts`: atraso limitado e opt-in em `finishResult()`; Snake continua com atraso zero (`efb31b19`). Comemoração de pódio usa `data.mine.rank` (2º/3º), e é mostrada após fechar o modal, incluindo percurso com código de recuperação (`c8da982d`).
- `src/scripts/gameCelebration.ts` e `src/components/GamePage.astro`: card compartilhado exibe título específico de posição, medalha de prata para 2º; pódio e liderança ficam numa camada **fixa** de primeiro plano da viewport, independentemente do botão de revanche, scroll ou modal anterior (`a10689e6`, `5bc7c683`, `ae0033dd`). E2E de rank 2, atraso do modal e login de vice-líder: `tests/tetris.spec.ts` (`3ce2dfce`, `05c01c31`, `54c0c1f8`).
- Pendente: observar CI do HEAD, validar visualmente no Preview com proprietário e registrar evidências. Sem merge, produção, SQL, Lovable.


## Tetris #002 — queda suave e pontuação por linhas (17/11/2026)
- **Feedback do proprietário no Preview:** Espaço parecia teletransporte; placar subia a cada descida, contradizendo o objetivo de pontuar só por linhas; faltava efeito de pontos sobre o tabuleiro ao limpar linhas.
- **Causa comprovada no código anterior:** `drop(true)` chamava `award(steps*2)` para cada célula da queda instantânea e movia a peça em um `while` sem frames; `softDrop()` chamava `award(1)` por célula. Assim, movimentos geravam pontos sem linhas eliminadas.
- **Correção em `src/scripts/tetris.ts` (commit `6354fa26`):** Espaço faz animação de descida por `requestAnimationFrame` com interpolação acelerada de ~115–240ms; ao terminar, a peça trava na grade e dispara limpeza de linhas normalmente. Durante a animação, novos movimentos/rotações/reserva ficam bloqueados para evitar colisões indevidas, e pausa/troca de tela cheia/reinício cancelam a animação. `prefers-reduced-motion` mantém queda imediata. Movimentos, reserva, descida suave e queda rápida dão **zero pontos**; apenas `land()` após limpar 1/2/3/4 linhas pontua 100/300/500/800 vezes o nível. Cronômetro, ranking, HUD e contadores globais preservados.
- **Feedback visual reutilizável:** `src/scripts/scoreFeedback.ts` (commit `4d27030e`) usa a animação `.score-float` já existente no CSS global para mostrar `+N · X linha(s)` próximo da linha eliminada, sem overlay bloqueante ou duplicação de estilo.
- Explicações de pontuação e controles atualizadas em `src/pages/jogos/tetris.astro` (`ee230200`). E2E atualizado com verificação de animação via observação de atributo, ausência de pontos por movimento/queda e preservação de pausa/retomada (`0eef08a5`). Expectativa antiga com link ambíguo entre hero e card corrigida no teste (`11705da0`).
- **Próximo passo:** verificar CI do HEAD e entregar Preview da branch para validação **visual exclusiva do proprietário**, especialmente suavidade, popup de pontos e pontuação zero até a primeira linha. Sem merge, produção, SQL ou Lovable.


## Home — destaque automático do jogo novo (17/11/2026)
- Decisão permanente do proprietário: **o destaque principal da Home pertence sempre ao título mais novo**, não ao modo mais recém-criado. Seleção automática pelo maior `number` em `src/data/gameRegistry.ts`, sem fixar Snake/Tetris no hero. O nome, chamada, link e símbolo da novidade usam o catálogo; cards são ordenados com jogos novos primeiro. Snake e seus modos continuam disponíveis.
- Implementação na branch `feat/tetris-jogo-002`: `src/pages/index.astro` no commit `37a4d610`; E2E atualizados para novo destaque no `fcdb10aa` e `8bc22cc2`. Regra registrada em `docs/PADROES_GLOBAIS_DOS_JOGOS.md` no commit `11681a78`.
- **Validação:** aguardar conclusão do CI do HEAD; confirmação visual é exclusiva do proprietário. Não houve merge, produção, SQL ou Lovable. A branch deve permanecer apta a Preview Cloudflare.


## Atualização de evidências — 17/11/2026 · Tetris #002 e ranking global
- No HEAD inicial `a3d30393`, CI #271 (`44107726974`) terminou com 107 passed / 2 failed / 1 skipped, CI #272 (`44107743814`) com 108 passed / 1 failed / 1 skipped. As falhas restantes são exclusivamente do teste `Tetris integra recorde global real sem misturar ranking do Snake`: o ranking retornou 120, mas o HUD `#tetris-global` permaneceu “—”, indicando condição de ordem entre scripts. Evidência: https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/44107743814
- Implementado contrato compartilhado `oldarcade:mode-ranking-request` em `src/scripts/modeRanking.ts` (commit `05537249`): emite o snapshot de ranking consultado para HUDs iniciados depois do GET, sem novo polling ou requisições. `src/scripts/tetris.ts` solicita snapshot após registrar listeners (`0b37ab8b`), preservando atualizações da API e sem copiar a lógica de ranking.
- CI #275/`44111255333` e #276/`44111267712` da alteração funcional `0b37ab8b`: tipos, build e API aprovados na verificação intermediária; Playwright ainda em andamento. **Não declarar sucesso até conclusão do HEAD.**
- Cloudflare Pages: PR #2 ainda **não** registrou comentário de deploy nem confirmação de Preview no momento da checagem. Não reutilizar link do Snake nem inferir alias da branch como URL validada. Validação visual segue exclusivamente com o proprietário.
- Restrições respeitadas: nenhuma alteração em `main`, merge, produção, D1/SQL ou Lovable. Próxima ação: confirmar conclusão do CI e localizar evidência oficial do deploy da branch antes de fornecer o link para teste visual.

## ESTADO ATUAL — Tetris jogo #002 (17/11/2026)
- Branch **`feat/tetris-jogo-002`**, derivada da integração Snake `feat/fundacao-snake` no commit `e46ac2c0`. Não alterar `main` nem publicar produção. Esta branch é Preview; qualquer alteração adicional no Snake segue seu fluxo original.
- Tetris registrado com **ID `tetris`**, título número **002**, versão de desenvolvimento `0.1.0-dev`, ranking independente e rota `/jogos/tetris/`. Registro em `src/data/gameRegistry.ts` e `src/data/gameModes.js`; jogos disponíveis = 2 títulos, modalidades não incrementam quantidade de jogos.
- Jogabilidade própria em `src/scripts/tetris.ts`: tabuleiro 10×20, sete peças e sorteio por pacote de sete, próxima peça, reserva limitada a uma troca por peça, sombra de queda, rotações com deslocamento junto às bordas, descida suave/instantânea, eliminação de 1–4 linhas, multiplicador por nível, velocidade progressiva e fim ao bloquear o topo. Estado salvo localmente para melhor pontuação e partidas; sem ativar banco ou SQL.
- Página `src/pages/jogos/tetris.astro`: usa **GamePage, GameHud, GameRanking e GameShare**. Contadores de visita/partida seguem `setupGlobalGameCounters` e `recordGameStart`; pontuação e fim usam `recordGameScore`/`recordGameFinish`, celebração global via `oldarcade:celebrate`. Contagem 3–2–1, pausa, cronômetro efetivo, fullscreen F/Esc, auto-pausa quando aba fica oculta, teclas e botões de celular; nenhuma cópia de ranking/celebração.
- Home atualizada para exibir Tetris com card próprio sem duplicar modos, total correto de jogos; ranking dedicado /rankings/ e conta já são derivados do catálogo. Textos SEO revisados.
- Testes `tests/tetris.spec.ts` incluídos para catálogo e SEO, componentes, teclado, queda, pausa/retomada, contadores e fullscreen; `tests-api/game-modes.test.mjs` atualizado para catálogo aberto a novos jogos (erro inicial de expectativa fixa de três modos foi identificado e corrigido); E2E Snake que fixava contagem em um título atualizado.
- **PR de desenvolvimento:** https://github.com/jeffersonfukner-hue/oldarcade/pull/2 (draft, base `feat/fundacao-snake`; não mesclar). O projeto de Preview da branch ainda não foi confirmado por comentário do bot Cloudflare.
- **CI — evidência de investigação:** workflows iniciais falharam por expectativa fixa de três modos no teste API (corrigida), contagem fixa de 1 título no E2E Snake (corrigida) e clique de saída de fullscreen Tetris interceptado pelo HUD (log #259: `game-hud intercepts pointer events`; corrigido com z-index do cabeçalho no commit `62912345`). A intermitência no E2E Aventura foi causada por comparação de `scrollY` apesar da centralização intencional; teste atualizado para verificar `preventDefault` da tecla Espaço (`2b9c4aaa`), sem mudar jogabilidade. **Reexecutar CI do HEAD.**
- **Integração adicional:** Tetris escuta eventos globais `oldarcade:mode-ranking-updated` e `oldarcade:mode-record-provisional` para manter o HUD de recorde global e o indicador provisório sincronizados (`a60b64d6`), com teste dedicado (`f8f9d306`).
- **Limitações de validação:** CI da nova branch deve ser verificado até conclusão; testes escritos e compilação não significam aceite final. **Validação visual é exclusivamente do proprietário** no Preview Cloudflare. Confirmar Preview da *nova branch* em vez de reaproveitar URL da branch Snake. Se Preview não existir, documentar bloqueio sem afirmar que está online.
- **Próximo passo:** verificar workflow e corrigir regressões; fornecer URL do Preview da branch para validação visual do proprietário. Sem merge, publicação, SQL ou Lovable.


## Correção estrutural — 17/11/2026 · marcos de pontuação reutilizáveis
- **Problema confirmado em código:** Clássico/Evolution exibiam mensagens de 100/200/400/800/... pontos com `funMoment()` (texto grande e partículas na posição da cobra); Aventura copiava a mesma lista e exibia `notify()`, um banner legado fixo no topo. A regra de componentes compartilhados estava sendo violada.
- **Correção GitHub:** `src/scripts/snakeMilestones.ts` centraliza os textos/limiares, `nextSnakeMilestone()` e `showSnakeMoment()`. `src/scripts/snake.ts` (Clássico/Evolution) e `src/scripts/snakeAdventure.ts` (Aventura) consomem o **mesmo código** de detecção e o mesmo efeito visual. Commits `867d1eb4`, `06ba7edd`, `2d0fea27`.
- **Escopo:** marcos 100, 200, 400, 800, 1600, 3200, 6400, 12800 e 25600; o aviso `notify()` no Aventura permanece só para o evento distinto de marca global provisória. Nenhuma alteração de pontuação, progressão, missões, recordes ou mecânica.
- **Padrão reafirmado:** animações/limiares/mensagens compartilháveis do mesmo evento pertencem a um único módulo; jogos e modos somente fornecem dados e contexto de exibição, sem cópias. Uma alteração do componente comum deve refletir nos três modos.
- **Teste adicional:** commit `51e1765e` elimina intermitência nos E2E Aventura/Clássico da tecla Espaço causada por `scroll-behavior: smooth` durante `scrollTo(0,0)` no preparo do teste. Em #229, Aventura falhou com `Expected 634 / Received 0` por essa transição assíncrona. Ajuste exclusivo do teste, não da jogabilidade.
- **Validação:** CI dos commits acima ainda pendente no momento desta anotação. O proprietário realiza exclusivamente o aceite **visual** no Preview; agente cuida de código, CI e testes automatizados, sem confundir deploy com aceite visual. Sem merge, publicação em produção, alterações SQL ou Lovable.
- **Próxima ação:** obter CI verde do HEAD, entregar Preview da branch ao proprietário com instrução curta para comparar marcos de 100/200/400 nos três modos; registrar feedback sem validar visualmente em nome dele.


## Verificação objetiva — 17/11/2026 · CI e Cloudflare Preview
- GitHub Actions workflow #225 (run `44018611072`, commit `2b749fe7`) **success**: tipos, build, API e Playwright aprovados (101 passed, 1 skipped; desktop/mobile Chromium), pacote `oldarcade-preview` gerado. Evidência: https://github.com/jeffersonfukner-hue/oldarcade/actions/runs/44018611072
- Workflows #223 (`1dcb7e99`) e #224 (`fa68e697`) falharam nos mesmos testes legados, antes das correções do #225; não são a referência de aceite atual.
- Na PR #1, o comentário do bot Cloudflare informa **deploy de Preview bem-sucedido** do commit `76a9be3` no endereço https://a87c5242.oldarcade-17c.pages.dev ; alias da branch https://feat-fundacao-snake.oldarcade-17c.pages.dev ; evidência https://github.com/jeffersonfukner-hue/oldarcade/pull/1#issuecomment-6904416005. Essa confirmação é de deploy, **não** de inspeção visual/jogabilidade; acesso por consulta web retornou indisponível.
- `docs/PREVIEW.md` corrigido no commit `15e298b4` para refletir o deploy real e manter QA humano pendente. HEAD agora é posterior ao `76a9be36`; conferir seu CI antes de declarar verde.
- QA pendente: inspecionar realmente o Preview Aventura em desktop 1440/1024 e mobile 390/320, controles e fullscreen, feedback de itens e mensagens, testar iPhone/Safari quando possível. Nenhuma alteração de banco, merge, produção ou Lovable autorizada/realizada.
- Próxima ação: confirmar CI do HEAD e obter evidências visuais/interativas do Preview, sem assumir que o sucesso do deploy comprova o comportamento.


## Complemento visual — 17/11/2026
- Commit `a9bc2bbe`: itens especiais com duração no Snake Aventura passam a mostrar um anel de tempo restante no canvas, reutilizando a linguagem visual do Evolution (sem alterar duração, coleta ou pontuação). QA visual Preview pendente.

## Continuação de execução — 17/11/2026 · testes e refinamento visual
- Commit `2b749fe7`: atualização de testes Playwright antigos em `tests/snake.spec.ts`: mensagens de ranking conforme regra atual de desempate por tempo; recorde pessoal só é celebrado quando supera marca positiva anterior; recorde global provisório exige líder anterior positivo; cenários Aventura testam travessia livre e ausência de polling, sem simular derrota onde não há parede. Testes ainda dependem de CI para confirmação.
- Commit `51c98622`: ajuste do banner secundário do Aventura para aviso compacto, translúcido, sem captura de interação, com variação de prioridade e reinício de animação usando classe CSS existente. Celebrações principais continuam no componente global `gameCelebration.ts`; nenhuma alteração de regras, missões, pontuação ou ranking.
- CI #223 para `1dcb7e99`, #224 para `fa68e697` e novo CI para `2b749fe7` estavam em andamento na última consulta. O commit visual `51c98622` precisa ter seu workflow conferido. Não afirmar CI verde sem conclusão registrada.
- QA Preview Cloudflare e validação visual humana continuam pendentes; ausência de alteração em D1, main, produção ou Lovable.
- Próxima ação: revisar o resultado do workflow do HEAD, corrigir somente falhas comprovadas, validar os efeitos do Aventura em 1440/1024/390/320 e registrar captura e aceite do Preview.

## Atualização de execução — 17/11/2026 · modernização visual Aventura
- Commit `1dcb7e99` na branch `feat/fundacao-snake`: Aventura usa somente celebração global para subir nível e para derrota (sem banners duplicados); nova partida emite `oldarcade:game-started` para limpar efeitos pendentes; overlay de reinício é apresentado após 4 s, alinhado à duração da celebração final compartilhada. Mecânica, níveis, missões, pontuação, contadores e API de ranking preservados.
- CI anterior, commit `898118648`, workflow #222 (`44014165809`): build, tipagem e testes de API passaram; Playwright 89 passou, 12 falharam, 1 ignorado. Falhas repetidas desktop/mobile: quatro cenários Clássico (consulta/recorde) e dois Aventura (fim de jogo). Nos dois testes Aventura, a expectativa de derrota após apenas `ArrowUp` é incompatível com a regra vigente de travessia de bordas livres: não remover wrap para satisfazer o teste; reescrever cenários para colisão determinística. Verificar logs completos para demais causas Clássico.
- **Ainda pendente:** checar CI do novo commit, corrigir testes E2E legados com base nas regras atuais, aferir responsividade/efeitos no Preview Cloudflare e validar visualmente com o proprietário. Não afirmar CI verde ou Preview pronto. Sem SQL, merge ou publicação.
- Próxima ação: investigar cada falha E2E, atualizar teste de colisão do Aventura sem modificar sua jogabilidade e repetir CI; depois abrir URL real do Preview da branch para QA.



## ESTADO ATUAL PARA NOVO CHAT — 16/11/2026 (ler primeiro)
- Mensagens progressivas especiais por pontuação (100, 500, 1300, 2500, 5000, 10000) em Clássico/Evolution e Aventura, mantendo demais eventos; sem SQL. QA pendente.

- HUD Snake Clássico/Evolution/Aventura reestruturado para painel lateral 20%, tabuleiro 80%; cronômetro movido ao HUD compartilhado; mobile usa faixa compacta acima; sem SQL. Validar Preview, CI, fullscreen e mobile.

- Correção visual: paredes do Clássico agora contornam o canvas pelo lado externo via outline, sem cobrir grid; no Aventura, segmentos de paredes progressivas são DOM overlay posicionados fora da área útil, preservando passagem onde não há parede. QA Preview pendente.

- Pedido visual: Clássico SEM avisos textuais, com paredes fixas nas quatro bordas usando exatamente a linguagem visual Evolution (#cf79ee, espessura 22% da célula). Aventura atravessa bordas livres e perde somente ao tentar cruzar segmentos de parede perimetral, que surgem progressivamente junto com as barreiras dos níveis; paredes também em #cf79ee. Evolution inalterado. QA pendente.

- Clássico: aviso explícito de derrota ao tocar qualquer borda no início e acima do tabuleiro; moldura de alerta âmbar nas quatro laterais. Evolution mantém bordas atravessáveis. Sem mudança na mecânica.

- 17/11: usuário confirmou PRAGMA `duration_ms INTEGER` no D1 Preview. API de leaderboard agora persiste duração em milissegundos, desempata por menor tempo (antigos NULL depois dos cronometrados), UI exibe duração; os três modos enviam tempo efetivo excluindo pausa/contagem. QA e CI ainda necessários. Banco de produção NÃO migrado. SQL sempre entregue na mesma etapa quando necessário.

- Regra operacional explícita do proprietário (17/11): toda mudança que necessite SQL deve entregar script executável para aplicação manual no servidor na MESMA etapa, com banco-alvo, verificação e aviso de dependência; não deixar migração esquecida. SQL de duração `migrations/0007_record_duration.sql` para Preview foi entregue ao usuário; NÃO aplicado pelo agente. API e ranking ainda precisam ser adaptados antes de ativar desempate por tempo.

- Cronômetro de tempo jogado nos três modos via componente compartilhado `src/scripts/gameClock.ts`: tempo ativo em mm:ss, pausa/contagem regressiva excluídas. Desempate global por duração **pendente**: precisa persistir tempo na API/D1 e migrar ranking, proibido alterar banco sem autorização explícita. Inimigos Evolution implementados após 10.000 pontos: hunter persegue cabeça, ambusher antecipa direção, wanderer patrulha; até três inimigos por patamar. Contato com cabeça causa derrota; corpo não sofre ataque. Power-up scare temporário faz inimigos fugirem e permite eliminá-los por contato com a cabeça. Exige QA no Preview. Sem merge/produção.

- Feedback 16/11: elogios durante partida agora a cada 100 pontos (antes 30), tipografia maior. Evolution saiu do modo de progressão acelerada: `EVOLUTION_FAST_TEST=false`, marcos originais 0/100/250/600/1500/4000/10000; sem alterar velocidade da cobra, tiros ou padrões compartilhados. Sem merge/produção.

- Feedback aprovado: primeira pontuação NÃO supera recorde pessoal/global inexistente. Efeitos de recorde só quando havia marca positiva anterior e foi superada; recorde global requer marca global conhecida positiva. Celebrações lúdicas independentes do ranking: mensagens variadas a cada 30 pontos e salvamentos de power-ups no último instante, não bloqueantes. Evolução permanece em Preview da branch.

- Feedback: cobra Evolution acelera cedo demais. Ajustado somente Evolution: início 210 ms, aceleração de 7 ms por 100 pontos de pico, mínimo 145 ms; Clássico preservado.

- Ajuste solicitado de jogabilidade Evolution: progressão de teste menos acelerada (marcos 0/30/60/90/130/170/220), tiros são projéteis visíveis com deslocamento de 2 células por tick (não laser instantâneo); obstáculos internos e bordas preservam cor fixa ao sofrer dano. Sem rota de Preview dentro de Preview: testar `/jogos/snake/evolution/` no Preview da branch. Não publicar produção.

- Evolution como terceiro modo em `/jogos/snake/evolution/` no Preview: página própria, gameModes `snake-evolution`, ranking/recordes/contadores/conta compartilhados com isolamento por modo, GameShare e HUD herdados da página do Snake; mecânicas continuam com limiares rápidos de teste. Não há migração D1, merge ou produção. CI/Preview ainda precisam de verificação. Corrigida chamada ausente `celebrate('global')` que fazia falhar o teste E2E de partículas de recorde global; adicionados testes de rota Evolution, isolamento de leaderboard e contadores. Arquivos principais: `src/pages/jogos/snake/evolution.astro`, `src/scripts/snake.ts`, `src/scripts/globalLeaderboard.ts`.

- Acesso direto Evolution no Preview: botão `⚡ Jogar Snake Evolution (teste)` na hero do Clássico, somente em `*.oldarcade-17c.pages.dev`; no Evolution botão muda para voltar ao Clássico, título/HUD identificam o modo. Não exige editar URL manualmente. Pendente CI e conferência do deploy.

- Usuário **validou animação Game Over**. Nova regra Evolution: sem bordas inicialmente (wrap), segmentos de parede aparecem progressivamente, bloqueiam travessia, 3 tiros destroem temporariamente e regeneram após 90 ticks; obstáculos internos 3 tiros e destruição definitiva, surgimento periódico com limite de 8. `EVOLUTION_FAST_TEST=true` concentra desbloqueios em 0–100 pontos, reversível para patamares originais; não modificar Clássico normal. **CI e teste real pendentes**.

- Revisão de CI do commit `a5d13d58`: falha no `astro check` por `rival` indefinido em `gameCelebration.ts:39`; corrigida no commit `2d4653c3` junto da centralização final. Preview aberto `7bc91236.oldarcade-17c.pages.dev/jogos/snake/` mostra jogo normal, mas leitura de aba não executa interação, portanto não comprova mecânicas Evolution. O teste experimental exige `?evolution=1` em subdomínio de Preview.
- Revisão estática Evolution: frutas simultâneas (+10), raras (+50, expiram após 38 ticks), slow, obstáculos e disparo X; Salva-Cobra exige >=30 e cobra >=12, perigo <=1 saída, custo -30/3 segmentos. Ajustada escolha da Salva-Cobra para células alcançáveis em até 12 passos, evitando aparição completamente desconectada; temporizadores por tick de jogo (não segundos de relógio). Não há submissão/registro de partida em `end()` e `start()` experimentais, mas o HUD ainda mostra ranking oficial para comparação. Pendente validação E2E e CI do novo HEAD.

- Repositório `jeffersonfukner-hue/oldarcade`; branch de integração `feat/fundacao-snake`; PR #1. Somente jogo #001 Snake, com modos Clássico (`snake`) e Aventura (`snake-adventure`). **Não criar jogo #002/#003 sem aprovação.**
- O proprietário **validou** a experiência do painel universal `/conta/` com recordes, CTA contextual e missões pessoais derivadas de `mine`/`top` da API; não inventar histórico de partidas ou recompensas. Header/sidebar exibem nickname autenticado.
- Rankings por modo e página `/rankings/` são compartilhados; posições e liderança confirmadas dependem da API. Pontuação atual é autodeclarada (`verified:false`); não alegar antifraude.
- Celebrações globais: `src/scripts/gameCelebration.ts` + `src/components/GamePage.astro` via evento `oldarcade:celebrate`. Efeitos: recorde pessoal, missão, Top 3, liderança confirmada, rival/revanche. Clássico também tem efeitos locais anteriores. Aventura utiliza `modeRanking.ts` e eventos de pontuação. **Não afirmar ultrapassagem em tempo real ou “20 segundos” sem dados confiáveis.** O aviso de revanche foi pensado para resultado final em que uma liderança provisória não se confirma.
- Simulador visual de cinco comemorações: painel “🧪 Testar comemorações · Preview” somente em subdomínios `<hash>.oldarcade-17c.pages.dev` (não no domínio principal de Pages ou domínio personalizado). Não altera dados/contadores/rankings. Testar especialmente celular, movimento reduzido, Escape e botão de revanche.
- Backlog **apenas futuro**, seção 13 de `docs/PADROES_GLOBAIS_DOS_JOGOS.md`: área administrativa por jogo/modo para pontuação, metas, mensagens, incentivos, animações, duração, prévia, versionamento e auditoria. **Não implementar agora**.
- Histórico recente: `b2a33142` missões de conta (CI success); `d953b6c4` celebrações (CI falhou em tipagem TS); `b7b6cb2` simulador; `f1c32bf` correção de tipagem; `30c1eed9` documentação do backlog administrativo. **Verificar o CI e Preview atuais antes de declarar sucesso**. O proprietário ainda não validou visualmente o simulador.
- Correção subsequente solicitada pelo proprietário: duplicação de aviso de recorde no Clássico identificada em `announceRecord` + `oldarcade:celebrate`. Removido o aviso local redundante para recorde pessoal; animação global agora é inserida no tabuleiro e usa explosão breve central (escala e opacidade máxima 50%) sem cartão/botão. Pendente CI e teste visual no Preview.
- Ajuste solicitado pelo proprietário em 16/11: recorde e partículas devem ser semitransparentes, compactos e não bloquear o jogo em andamento. CSS global ajustado para avisos no topo sem backdrop, sem captura de toque; rival pós-partida mantém modal. Verificar no Preview se o botão “Continuar jogando” observado vem de outro componente do Clássico/Aventura e corrigir se ainda bloquear.
- Piloto do Motor de Personalidade Arcade: catálogo temático compartilhado `src/scripts/arcadePersonality.ts`; Snake Clássico emite provocação de perigo quando cobra >=12, pontuação >=30 e <=1 saída imediata (sem alterar mecânica); simulador Preview inclui perigo e Salva-Cobra (esta última é apenas visual; fruta não implementada). Cooldown de 15s para mensagens reais. `GamePage.astro` reparado: commit anterior tinha CSS duplicado após `</Base>`, causando CI vermelho. Validar CI e Preview após este commit.
- Ajustes solicitados após validação visual: mensagens temáticas longas exibidas por 2,7s; meta global provisória agora usa animação compartilhada (sem banner antigo); após derrota ou vitória, aguardar resultado de ranking, mostrar animação final por 4s e só então revelar reinício/modal de conta. `GamePage.astro` recebeu estilo próprio de resultado final. Testes existentes de aviso pessoal/global atualizados; demais testes de tempo/modal podem precisar de ajuste. Conferir CI do HEAD e Preview antes de aprovação.
- Experimento Snake Evolution implementado como opt-in **somente Preview** via `?evolution=1` no Clássico: múltiplas frutas comuns, raras com expiração, encolhimento -30/3 quando em perigo e >=30, slow, obstáculos progressivos e disparo X (4.000+), marcos 0/100/250/600/1500/4000/10000. **Sem envio de placares/partidas ao ranking ou contadores no modo experimental**; Clássico normal permanece intacto. Verificar CI, jogabilidade, balanceamento, fluxo de fim e segurança do isolamento antes de aprovar.
- Correção de posicionamento da animação final: `gameCelebration.ts` agora insere o overlay final no próprio `#game-screen` (não mais no pai do componente/página), e `.oa-celebration.is-final` usa posicionamento absoluto relativo ao tabuleiro. Corrigida também referência TS inválida a `rival` no reinício de animação. Pendente CI e validação visual no Preview em desktop/mobile/fullscreen.
- Próxima ação técnica: conferir Actions do HEAD, corrigir falhas se existirem e localizar Preview do commit atual; depois usuário testa os cinco botões e aprova visualmente. Sem merge, publicação, SQL, D1, alterações de Cloudflare/domínio ou Lovable.
- Método: GitHub como fonte de verdade, uma entrega por commit quando possível para reduzir builds Cloudflare, validação pelo proprietário, documentação atualizada e botão de continuação com contexto. Não reabrir decisões aprovadas.
- **Regra de continuidade:** a cada marco funcional ou antes de trocar de chat, atualizar este bloco (estado, commits, CI, validações, pendências, próxima ação), mantendo fatos distintos de hipóteses. Novo chat deve ler AGENTS.md, este documento, ARQUITETURA.md, PADROES_GLOBAIS_DOS_JOGOS.md e VERSIONAMENTO_E_PUBLICACAO.md e conferir HEAD/Actions antes de qualquer mudança.


## ATUALIZAÇÃO — missões contextuais no painel universal (16/11/2026)
- O painel `/conta/` passa a sugerir missões por modalidade competitiva a partir de `mine` e `top` do leaderboard existente: primeira pontuação, superar recorde, Top 3, liderança. Não cria pontos, recompensas, badges persistidos ou histórico fictício.
- A conta é gerada pelo catálogo de jogos e modalidades; não fixar títulos futuros. CI e Preview desta entrega pendentes de validação.


## ATUALIZAÇÃO — contrato de eventos e conta (16/11/2026)
- CI do commit 599f868e: run 43986553860 **success**; proprietário aprovou o histórico visual no Preview do Aventura.
- Padronização em desenvolvimento: funções compartilhadas `recordGameScore` e `recordGameFinish` centralizam a emissão dos eventos usados pelo ranking/compartilhamento; eventos preservam nomes e payload existentes. Snake Clássico continua com sua lógica própria de ranking, sem alteração de mecânica.
- Compartilhamento passa a aceitar pontuações decimais válidas (até 3 casas), conforme contrato global; login/cadastro no modal de ranking emite evento de identidade para atualizar cabeçalho e menu sem reload.
- CI e Preview deste commit precisam ser verificados. Sem D1, SQL, produção, merge, domínio, Cloudflare ou Lovable.


## ATUALIZAÇÃO — histórico de modalidades e redução de deploys (16/11/2026)
- Cloudflare Pages exibia 151 deploys em 11 páginas; fonte observada no painel. Preview automático na branch `feat/fundacao-snake`; produção `main` isolada. A contagem de deploys não equivale a versões.
- CI run 43984742315, commit 45cea7e, **success**.
- Registrados marcos de desenvolvimento do Snake Aventura e infraestrutura compartilhada no catálogo, sem inventar uma nova versão nem contar modo como jogo. Histórico do modo visível na página Aventura e histórico geral no Clássico.
- Processo: usar commits multi-arquivo por entrega para diminuir builds/deploys. Configuração automática Cloudflare não alterada; sem SQL, merge ou produção.


## ATUALIZAÇÃO — HUD compartilhado e contagem correta (16/11/2026)
- Contagem inequívoca: **1 jogo (#001 Snake), 2 modos (Clássico e Aventura)**. Jogo #002 e jogo #003 não iniciados; meta são 3 títulos distintos antes de migração do domínio.
- CI comprovado do commit b5e88ae: run 43981972989 **success**. Run 43983568736 (commit 680fb357) estava em execução na última consulta; commits posteriores precisam de CI próprio.
- `src/components/GameHud.astro` criado e adotado nas duas páginas do Snake, mantendo IDs e scripts existentes; teste de contrato adicionado em `tests-api/game-page-contract.test.mjs`.
- Home passa a obter modalidades e nomes de todos os títulos cadastrados, sem filtro fixo para Snake. O número de jogos disponíveis continua baseado em `gameRegistry.ts`.
- Próximos passos: confirmar CI do commit mais recente, verificar visual e interações no Preview, consolidar interface de eventos/conta/compartilhamento sem mexer nas regras dos modos. Sem SQL, produção, merge, deploy ou Lovable.


## ATUALIZAÇÃO — integração de páginas e CI (16/11/2026)
- **CI verde comprovado**: run 43981972989, commit b5e88ae (tipos, build, testes de API e navegador). Os commits posteriores exigem novo CI verde.
- Home agora usa `gameModes.js` para montar cartões do Snake e continua contando títulos por `gameRegistry.ts` (não soma modos como jogos).
- `src/components/GamePage.astro` é a estrutura compartilhada para SEO real, JSON-LD, caminho canônico e exigência de modalidade/título cadastrados. As duas páginas Snake a consomem, preservando HTML e scripts de jogabilidade existentes.
- Teste novo `tests-api/game-page-contract.test.mjs` verifica páginas de modos e presença do contrato SEO. Último commit conhecido: a107adcf. Validar seu CI antes de declarar pronto.
- Próximas pendências: HUD e integração de partida em componentes reutilizáveis sem alterar comportamento aprovado; integração de conta/compartilhamento por contrato; Preview visual desktop/mobile e API Clássico após D1 0006. Não iniciar jogo #002 sem aprovação, não alterar produção ou D1.


## ATUALIZAÇÃO — padronização para próximos jogos (16/11/2026)
- Migração 0006 executada **pelo proprietário somente no D1 Preview**. Consulta após migração: Snake Clássico 3 jogadores/maior 320; Aventura 3 jogadores/maior 395. Preview `7eb40424.oldarcade-17c.pages.dev` exibiu Top 3 Aventura (395, 360, 350). Não foi realizado POST decimal real nem validado o Clássico após migração; não modificar dados para testar.
- CI anterior do Snake: run 43979027142, commit 8658fa1, **success**. A refatoração posterior tem CI independente pendente.
- Nova fonte central de IDs/modos: `src/data/gameModes.js`. APIs de ranking/contadores, `gameEvents.ts` e `src/pages/rankings.astro` passam a consumir o catálogo. Testes de contrato: `tests-api/game-modes.test.mjs`. O catálogo editorial de títulos e versões permanece em `src/data/gameRegistry.ts`.
- Ainda pendente: CI verde do commit mais recente, integração do catálogo na Home e template de página/HUD/SEO, validação visual do Preview. Não criar jogo #002 sem nova autorização. Nenhum merge, publicação ou mudança em produção.


## BACKLOG — modos do Snake e Desafio Diário (registrado em 16/11/2026)
- **Clássico:** preservar a mecânica aprovada, sem misturar itens, barreiras ou progressão dos modos alternativos.
- **Aventura:** partida contínua com níveis, missões, frutas e poderes; evoluir por etapas, incluindo barreiras progressivas e eventuais itens que ajudem ou atrapalhem. A implementação e os testes de cada etapa serão tratados separadamente.
- **Desafio:** modalidade própria com mapas, barreiras e dificuldades, com classificação separada do Clássico e do Aventura. Planejamento somente; definir regras e escopo antes de codificar.
- **Desafio Diário:** modalidade futura com **o mesmo mapa/desafio para todos os participantes no mesmo dia** e **ranking diário independente**. Definir antes de implementar a geração determinística do desafio, fuso/data de virada, regras de tentativas, desempate, antifraude e custo de consultas/gravações no D1. Não ativar automaticamente nem apresentar como funcionalidade disponível.
- **Ordem de trabalho:** concluir e validar o Aventura em etapas; depois revisar e priorizar os demais modos, inclusive Desafio e Desafio Diário, um por vez com aprovação do proprietário. Não iniciar o jogo #002 nem publicar novos modos por conta própria.

## BACKLOG — indicações rastreáveis e recompensas futuras (registrado em 16/11/2026)
- Ideia do proprietário: cada jogador poderá compartilhar **um código/link de indicação próprio** em convites, para identificar quem mais trouxe amigos ao OldArcade e eventualmente premiar bons indicadores, **se o projeto crescer**. Isso é somente backlog: não ativar agora, não prometer prêmios, não gastar D1 ou gerar rastreamento sem aprovação específica.
- Diferenciar convites compartilhados (impossíveis de confirmar por app), cliques recebidos, novos jogadores que realmente jogaram e contas novas válidas. Não atribuir indicação apenas por abrir link. Preferir **contas autenticadas** e identificador de referência aleatório/opaco, nunca nome, e-mail ou ID sequencial no endereço.
- Projetar deduplicação, limite de atribuição, prevenção de autoindicação/fraude/múltiplas contas, consentimento e privacidade LGPD, prazo de retenção e condições claras antes de quaisquer rankings ou recompensas. Não registrar IP/contato por padrão nem disparar tracking de terceiros. Vincular ao futuro painel de métricas somente após autorização.
- Manter o compartilhamento atual sem códigos e sem rastreio de indicação; planejar evoluir o componente reutilizável GameShare apenas quando a etapa for aprovada.


## ESTADO ATUAL — 16/11/2026 (leia antes das seções históricas abaixo)
- **Rankings centralizados:** home agora possui um único menu `Rankings` e link `/rankings/`. Página dedicada compara Snake Clássico e Aventura em seções independentes com líder real, pontuação a superar, Top 3, Top 10 expansível, botão direto para desafiar o recorde. Usa a API existente apenas 1 GET por modo; sem polling, sem dados fictícios, nenhum D1 extra.
- **Nickname global:** `accountIdentity.ts` lê `/api/auth/me` ao carregar páginas e atualiza `[data-player-name]` no header e no card lateral; conta emite `oldarcade:account-changed` após login/cadastro/logout para refletir estado sem refresh. Sem login conserva "Minha conta". Não expõe dados além do nickname da própria sessão.

- **Home aprovada pelo usuário para implementação: opção 3 — foco no jogador.** Dashboard com menu lateral para jogos/rankings/conta, hero reduzida, dois cards reais para os modos Clássico/Aventura do único Snake (#001), três contadores compactos na mesma faixa, links para recordes e história. Não anunciar conquistas/novos jogos que não existem, não inventar ranking geral. Design responsivo com navegação horizontal no mobile, jogos visíveis sem rolagem excessiva. Nenhum ajuste em D1 e produção.

- **Hero validada e simplificada:** exibir apenas Jogos disponíveis, Visitas ao site e Total de partidas, em faixa fluida sem cartões. Removido indicador `Jogos jogados` por redundância com Jogos disponíveis, sem apagar registros existentes do D1. O backend pode continuar a computar o indicador para uso administrativo futuro, mas a hero não o consulta nem exibe.

- **Padrão de centralização do tabuleiro:** utilitário único `src/scripts/gameViewport.ts`, adotado por Clássico e Aventura. Ao iniciar, ao retomar e ao sair da tela cheia, reposiciona tabuleiro no centro visível quando possível, com proteção para fullscreen e sem modificar a partida; jogo mantém countdown 3–2–1 após fullscreen. Nunca reinventar esse comportamento a cada jogo. CSS fullscreen com `min-height:0` para caber nas alturas limitadas; testes mobile associados.

- **Padrão obrigatório por jogo/modo competitivo:** ao criar um jogo ou modo novo, reaproveitar desde o primeiro Preview: Top 10 por conta, podium individual, desempate cronológico, recorde pessoal, recorde global, liderança provisória durante partida, confirmação após registrar ao fim, cadastro/login opcional na tela pós-partida, resultados distintos por modo, HUD responsivo, compartilhamento, versionamento, contadores aplicáveis, testes desktop/mobile e acessibilidade. Não esperar o usuário lembrar essas funcionalidades; avaliar exceções documentadas quando não fizerem sentido. O modo Clássico continua intacto.
- **Aventura ranking:** backend aceita `snake` e `snake-adventure` usando `player_game_records.game` (sem migração). Novo componente `GameRanking.astro` + `modeRanking.ts` traz Top 10, posição própria, registro opcional da conta, aviso provisório e verificação no fim. Consulta na entrada + uma no fim (POST autenticado ou GET anônimo). `/api/auth/me` consulta sessão separadamente na entrada; sem polling. Ranking Aventura e Clássico isolados; pontuações ainda autodeclaradas, não antifraude. Não publicar antes do aceite.
- **Ponto de revisão do backlog:** após validação e consolidação do primeiro Aventura completo (com ranking, itens, barreiras e níveis), antes de iniciar o segundo jogo do catálogo, apresentar ao proprietário as ideias pendentes em grupos (implementar / adiar / eliminar), incluindo códigos de indicação e recompensas. Não ativar nem descartar automaticamente.

- **Snake Aventura em implementação/Preview, não publicado:** rota isolada `/jogos/snake/aventura/`, três níveis contínuos na mesma partida (1: cinco maçãs e 50 pontos; 2: uma dourada e 150 pontos; 3: três itens especiais e 300 pontos; depois sobrevivência). Maçã +10, dourada +50 e cristal +10 com lentidão temporária. Evolução exige simultaneamente missão e pontuação, mantém cobrinha/pontos, usa countdown 3–2–1 ao iniciar/retomar, teclado/gesto/toque, progresso local separado (`oldarcade:snake:adventure:v1`). Sem POST de recorde global nem alteração da mecânica do Clássico; **modo experimental não conta como um segundo jogo publicado**. Barreiras, veneno, dados globais do Aventura e modalidades de treino ficam para fases seguintes.
- **Compartilhamento:** o componente GameShare aceita `gamePath` opcional para apontar ao endereço correto de cada modo, sem incluir o código de indicação futuro. Aventura compartilha apenas seu resultado local, sem alegar recorde oficial.

- **Compartilhar/desafiar amigos:** componente reutilizável `src/components/GameShare.astro` + `src/scripts/gameShare.ts`, instalado no Snake. Oferece Web Share API, WhatsApp, Telegram, Facebook, X, Reddit, Bluesky e copiar convite. Antes do fim, convite genérico; após fim, inclui pontos **reais da partida**, sem afirmar verificação global ou expor apelido/conta. Usa URL da página do ambiente atual, incluindo Preview; não presume domínio de produção. Não adiciona requisições para servidor ou scripts sociais. Testes E2E cobrem URLs, score e orçamento de consultas.

- **Retomada de pausa:** botão Continuar (do jogo ou sobreposição) e atalho Espaço agora sempre iniciam o countdown existente 3–2–1 antes de retomar movimento, preservando cobra, pontuação e partida; testes automatizados atualizados. Não há requisições adicionais nem alterações na produção.
- **Fonte da verdade:** repositório `jeffersonfukner-hue/oldarcade`, branch `feat/fundacao-snake`, PR #1. A `main` é produção técnica neutra e **não deve ser mesclada nem publicada sem autorização atual**. Fluxo exclusivamente GitHub → CI → Cloudflare Preview → aprovação humana. Sem Lovable e sem créditos.
- **Última etapa aprovada pelo usuário:** commit `522b836`: busca do ranking na entrada e na conclusão da partida, sem polling durante jogo; placar de contas; avisos de variação com horários fundamentados. Implementadas e testadas (ainda exigem aceite humano no Preview) animações verde para recorde pessoal e dourada para meta global no commit `3be8f7d`.
- **Nova decisão expressa:** ultrapassar a meta global faz o HUD e lateral exibirem imediatamente o valor da partida como **provisório**. Ao término, a resposta ao POST autenticado determina se é líder oficial, empatou mas perdeu por ordem cronológica ou outro jogador tem pontuação superior. Para anônimos, somente o GET ao fim, sem reivindicar registro oficial. Sem consultas extras durante a partida. Efeito global dourado e pessoal verde preservados.
- **Ranking:** Top 10 único por conta e posição pessoal fora do Top 10, desempate cronológico por milissegundos do servidor. Recordes legados anônimos são testes antigos, ignorar em UI; não apagar D1 por conta própria.
- **Cadastro:** nickname permite espaço (`Vovo do 3D`), senha mínima 8, e-mail opcional, hash PBKDF2 de 100 mil iterações. Migrações `0003` e `0004` foram aplicadas pelo usuário ao D1 de Preview; teste real com conta e gravação deve ser revalidado quando houver alteração. Nenhuma migração nova desta etapa.
- **Produto:** Snake clássico sem alteração da lógica; +10 flutua ao comer fruta; HUD pessoal/global; efeitos de recorde; cadastro pelo modal de game-over. Backlog: modos, níveis, dificuldade, frutas e obstáculos em modos adicionais; não misturar ao clássico.
- **Hero / novos contadores:** quatro indicadores fluidos, sem cartões individuais (ajuste solicitado e enviado na branch); 1 jogo disponível no Preview via registro editorial, visitas ao site (uma por sessão de navegador), jogos jogados (quantidade de títulos distintos com partidas), total de partidas (soma dos eventos de início de jogo). Usa `game_events` D1 existente, `game='site', kind='visit'`, sem migração; novo endpoint `/api/site/stats`, uma gravação por sessão, leitura na hero. Sem números fictícios em caso de falha.
- **Recordes por jogo na conta:** ao conectar, a seção "Ranking local" mostra "Meus recordes por jogo" com as melhores pontuações da conta para todos os títulos do catálogo e link para jogar/superar; ao desconectar, preserva ranking local do navegador. Dados retornados na mesma resposta GET/POST de ranking do Snake (D1 `player_game_records` por `player_id`), sem consulta HTTP extra nem migração. Conforme outros jogos forem publicados, serão incluídos no catálogo e na seção.
- **Versionamento:** portal agora v0.2.0-dev lido do package.json, jogo Snake v0.2.0-dev do gameRegistry, histórico anterior imutável. Nenhum deles representa publicação na main ou release de produção.
- **Pendência:** verificar o CI da alteração atual e validar o Preview, especialmente ultrapassagem provisória, confirmação da própria liderança, empate cronológico e ultrapassagem por outro usuário. Não afirmar deploy ou produção sem evidência.
- **Retomada em outra conversa:** ler `AGENTS.md`, este arquivo, `docs/ARQUITETURA.md` e `docs/VERSIONAMENTO_E_PUBLICACAO.md` da branch `feat/fundacao-snake`. Conferir HEAD e Actions antes de agir. Pedir apenas uma ação humana por vez. Conteúdo abaixo é **histórico**, pode conter status desatualizados; esta seção prevalece.


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

## Ambiente Cloudflare — posição atual (15/11/2026, noite BRT)
O usuário criou o projeto Pages `oldarcade` conectado ao GitHub, com domínio técnico `https://oldarcade-17c.pages.dev`, `main` como branch de produção e configuração de build Astro, `npm run build`, saída `dist`.
- Deploy de produção técnica da `main` **concluído** na Cloudflare, exibindo exclusivamente página provisória neutra; não contém Snake e não utiliza domínio personalizado.
- Aviso de Git desconectado foi resolvido pelo usuário ao reautorizar a integração GitHub/Cloudflare.
- Em Settings > Branch control, usuário salvou `Custom branches` e `Include Preview branches = feat/fundacao-snake` (sem exclusões); produção continua em `main`.
- A última captura da aba Deployments mostra **apenas** um deploy de `main`. Ainda não há Preview de `feat/fundacao-snake`.
- A atualização desta documentação na branch de feature é destinada a disparar o primeiro build automático do Preview. Confirmar se Cloudflare registrou a nova implantação; se não, investigar opções de deployments antes de alterar a configuração.
- Não fazer merge da PR #1 e não adicionar domínio personalizado.

## Nova etapa: jogabilidade como padrão reutilizável
- Usuário aprovou a estética atual do Snake e solicitou HUD dentro da tela cheia, atalho F, pausa ao alternar modos e contagem 3–2–1.
- Implementação enviada na branch de desenvolvimento; validar CI, Preview Cloudflare e comportamento real antes de considerar aprovada.
- Mobile: layout responsivo e testes Chromium existem, mas ainda falta validação em telefone real.
- Contadores globais continuam pendentes de backend Cloudflare; nunca anunciar métricas locais como globais.
- Preview já criado na Cloudflare: https://3ebc7d78.oldarcade-17c.pages.dev/jogos/snake/ (URL da versão anterior, não usar como evidência de novo build).

## Validação do usuário e novo ajuste
- Usuário aprovou HUD, atalho F e as duas contagens regressivas 3–2–1 em Preview.
- Problema identificado: ao sair do modo tela cheia, o scroll posicionava textos acima do tabuleiro; jogador tinha de usar o mouse.
- Ajuste na branch: centralização programática do tabuleiro ao sair do modo tela cheia, preservando a contagem regressiva. Confirmar CI e validação manual no Preview antes de encerrar.

## Ajuste: início da partida (16/11/2026)
- O usuário confirmou que centralizar ao sair da tela cheia funcionou, e elogiou os dois countdowns.
- Solicitou centralização também ao clicar em **Começar partida**, sem tela cheia, e contagem 3–2–1 no início de toda partida.
- Implementação adiciona chamada de centralização existente e reutiliza beginCountdown com mensagem diferenciada para primeira partida. CI e Preview ainda precisam de confirmação.
- Cloudflare Pages registra deploys e URLs específicas por implantação, permite rollback de deploy de produção, mas não de preview (docs oficiais); não há limpeza automática configurada por nós.

## Mobile: controle por deslizar e toque duplo (16/11/2026)
- Usuário relatou que duplo toque provoca zoom acidental e quer comandar a cobrinha deslizando o dedo, mantendo os botões.
- Autorizou bloquear zoom fora do tabuleiro; abordagem adotada: bloquear apenas duplo toque no documento inteiro por `touch-action: manipulation`, preservando pinça de dois dedos para acessibilidade; `touch-action: none` somente no tabuleiro.
- Implementado controle swipe na região de jogo com limiar de 22 px e sem rolagem durante gesto. Aguardando CI e teste do usuário no iPhone para aprovar.

## Ajuste de visibilidade durante countdown (16/11/2026)
- Usuário solicitou que botão Começar/Jogar novamente fique oculto durante 3–2–1. O JavaScript já usava atributo hidden, mas a classe CSS .btn podia prevalecer; adicionado seletor específico `#start-btn[hidden]{display:none}` e teste automatizado.


## Contadores globais do Snake — 16/11/2026
- Código de UI, Pages Functions, migração D1 e testes implementados somente em feat/fundacao-snake.
- Banco Cloudflare não foi criado automaticamente. Próximo passo: criar D1 oldarcade-stats-preview, aplicar migrations/0001_game_events.sql e vincular a variável OLDARCADE_STATS_DB na configuração **Preview**, nunca produção.
- Sem binding, números exibidos como indisponíveis; nenhuma métrica fictícia. IDs aleatórios sem login e eventos armazenados sem IP; antifraude robusto e retenção a definir.
- Não dar merge nem adicionar domínio; após CI, orientar uma ação por turno no Cloudflare.

## Cloudflare D1 Preview — ID e configuração registrados
- Usuário criou `oldarcade-stats-preview` e executou a migração SQL; confirmou `game_events` no Console.
- Database ID informado pelo usuário: `2e849e43-9441-4ef0-8a24-e5a7d2dff074`.
- A tela Settings > Bindings não mostrava seletor de Preview. Não salvamos nenhum binding pelo dashboard.
- Adicionado `wrangler.jsonc` com `env.preview.d1_databases` definindo `OLDARCADE_STATS_DB`, e `env.production.d1_databases=[]`. Sem binding no nível raiz.
- Cloudflare Pages usará a configuração deste arquivo como fonte de verdade no deploy da branch; verificar no deploy do Preview se a API `/api/games/snake/stats` retorna `available:true` antes de considerar vínculo concluído.
- A publicação do `main` não foi acionada; não alterar produção.

## Regra de nickname para ranking local (16/11/2026)
- Pedido do usuário: salvar nickname já informado e mostrar score no ranking somente se o jogador tiver nickname, independentemente do apelido escolhido.
- O nickname já persistia em localStorage; a regra agora exige nome não vazio para gravar resultados locais e filtra entradas legadas 'Anônimo'/vazias.
- Partidas sem nickname continuam sendo contadas nos totais globais e recordes próprios. Não existe conta de usuário nem ranking global; isso exigiria identificação segura e validação de score.
- Testes E2E atualizados para garantir filtragem e persistência. Ainda verificar CI e Preview.

## Ranking global de recordes — etapa em desenvolvimento
- Usuário confirmou os contadores reais D1 `visits:2, plays:1`, solicitou ranking global que incentive retorno, destaque o líder e modal de registro opcional no final do jogo.
- Implementação preparou API, tabela D1, modal, Top 10 e mensagem de desafio, sem usar plano pago; requer executar `migrations/0002_game_leaderboard.sql` no banco Preview.
- Nickname salvo no navegador e score autodeclarado; não é login/verificação de pontuação. Não mesclar em produção.
- Corrigido teste E2E anterior que regravava localStorage em cada reload.
- Após CI, verificar comportamento visual e orientar usuário com uma ação por vez.

## Complemento e orçamento
- Usuário definiu que a primeira meta do AdSense é ao menos cobrir hospedagem, domínio e banco. Sem upgrade pago agora; avaliar se a viralização justificar os US$ 5 ou uma migração futura.
- No modal, se a partida acabou sem nickname anterior e o jogador registra o resultado global, a mesma pontuação passa também ao ranking local com o nickname informado.
- Testes adicionais verificam desafio público e nickname renderizado como texto, sem HTML injetado.

## Contato, suporte e futura autenticação (16/11/2026)
- O usuário aprovou conta com nickname e senha, e-mail **opcional** no cadastro e código de recuperação gerado uma vez. Jogar deve permanecer sem login.
- Se houver e-mail cadastrado, recuperação futura será feita **exclusivamente** por link de redefinição ou código temporário de uso único enviado ao e-mail previamente associado à conta; não aceitar apenas uma declaração de e-mail ou WhatsApp como prova de titularidade. Se perder todos os fatores de recuperação, não transferir a conta automaticamente.
- Contato inicial: formulário com motivos, inclusive recuperação, abrindo WhatsApp `+55 43 99865-0196` com mensagem preenchida. Número centralizado em `src/config/support.ts` para configuração futura via painel administrativo.
- Formulário de contato criado agora, **sem captura ou envio de e-mail pelo site**, sem simular conta já implementada. Cadastro seguro e recuperação por e-mail são trabalho futuro, sujeito a banco, autenticação e serviço de e-mail.
- O usuário pretende manter custos no plano gratuito até monetização e tráfego justificarem upgrade.

## Backend de conta e tela inicial — desenvolvimento (novembro 2026)
- Branch `feat/fundacao-snake` recebeu migração `0003_player_accounts.sql` (ainda NÃO executada no D1) e rota `/api/auth/register|login|logout|me`.
- Login por nickname único (normalizado), senha PBKDF2 SHA-256 210 mil iterações, salt aleatório; token de sessão enviado em cookie `HttpOnly; Secure; SameSite=Strict`, armazenado como hash no D1; limite básico de tentativas de login por nickname.
- E-mail opcional é armazenado como **não verificado**. Não pode ser usado para entregar conta até existir confirmação do endereço. Código de recuperação exibido uma única vez; hash salvo, porém fluxo de recuperação ainda não implementado.
- Tela `/conta/` para criar conta, entrar e sair, e exibir o código de recuperação. A criação ficará indisponível enquanto a migração D1 não for aplicada.
- **Ainda não migrar recordes antigos** nem permitir supor que o ranking global recreativo use contas; futura etapa deve ligar pontuações à sessão autenticada e impedir publicação anônima.
- Após CI e testes, orientar migração única no D1 Preview; não modificar produção.

## Pendências prioritárias
1. Confirmar novo deploy Cloudflare Pages **Preview** da branch `feat/fundacao-snake` e recuperar URL gerada; não inventar URL.
2. Validar Snake no navegador humano, especialmente tecla Esc, mobile, ranking local e conteúdo.
3. Futuro: métricas/rankings globais com Cloudflare, administração segura, revisão de privacidade/SEO/AdSense. Não antecipar implementação sem validar jogo piloto.

## Formato obrigatório ao finalizar uma etapa
**Feito:** ações concretas executadas.  
**Verificado:** CI, URLs ou testes confirmados (com link).  
**Pendente:** itens que realmente restam.  
**Próxima ação:** uma instrução operacional única para o usuário ou botão contextual "Continuar", nunca apenas "aguarde".

## Mensagem de retomada para novo chat
> Continue o OldArcade em `jeffersonfukner-hue/oldarcade`. Antes de agir, leia `AGENTS.md`, `docs/CONTINUIDADE.md`, `docs/ARQUITETURA.md` e `docs/VERSIONAMENTO_E_PUBLICACAO.md` na branch `feat/fundacao-snake`; confira PR #1 e os GitHub Actions. Cloudflare Pages já publicou a página neutra na main e a opção Preview da branch feat/fundacao-snake está salva; verificar se o primeiro deploy Preview apareceu após o commit de documentação. Respeite a regra de não publicar nem mesclar sem autorização, execute trabalhos de GitHub antes de pedir próximo passo e oriente a interface uma ação por resposta.

## Placar, desempates e feedback (solicitado em 16/11/2026)
- O usuário confirmou: cada jogador ocupa posição individual no ranking, mesmo empatando pontuação; desempate por horário de conquista mais antigo, com instante do servidor e precisão em milissegundos; posição pessoal fora Top 10 é exibida separadamente.
- Registrar 10 primeiros e destaque visual 1º/2º/3º individuais (não agrupar empate numa mesma posição). Explicar a regra na UI.
- BUG relatado: placar do jogo exibia recorde zero apesar do recorde da lateral. Atualizar ambos simultaneamente, incluindo durante partida assim que ultrapassar recorde anterior; distinguir recorde pessoal do recorde global da comunidade.
- Animações de ultrapassagem do próprio recorde, conquista de liderança e demais melhorias são backlog posterior, não incluir nessa correção.
- Cadastro embutido no modal pós-partida, jogar sem login; somente contas registradas enviam ao ranking global.
- Migração `migrations/0004_player_records.sql` ainda depende de aplicação MANUAL no D1 Preview. Até lá endpoint de ranking novo não funcionará; não fingir disponibilidade nem mexer produção.

## Ajuste de cadastro (16/11/2026)
- Relato do usuário no Preview: nickname `Vovo do 3D` rejeitado por espaços; após removê-los, API respondeu genericamente que não conseguiu criar a conta.
- Alteração de regra autorizada: permitir espaços internos em nicknames (normalizar espaços consecutivos) e aceitar senhas com **mínimo de 8 caracteres**, mantendo máximo 128 e derivação criptográfica PBKDF2.
- Cadastro API passa a retornar código técnico resumido do estágio em erro (sem dados pessoais) e log de servidor para diagnosticar falha real. **Causa original do erro de cadastro não confirmada ainda.** Não alegar correção completa sem novo teste real no D1.

## Evolução visual e modos futuros (16/11/2026)
- No Snake, mostrar recorde pessoal e recorde global atual de **contas cadastradas** lado a lado no HUD; distinguir claramente da marca histórica anônima, armazenada na tabela legada.
- Renderizar +10 subindo e desaparecendo quando recolher fruta, sem mudar pontuação, velocidade ou regras.
- Backlog aprovado para avaliar após teste: celebrações distintas para superar recorde pessoal e global, frutas com pontuações/efeitos diferentes, níveis, dificuldades, obstáculos e modos alternativos. Manter um modo clássico idêntico à mecânica já aprovada, sem introduzir automaticamente as features em todos os modos.
- Relato visual: ranking vazio após mudança para tabela `player_game_records`. Recordes antigos continuam em `game_leaderboard`; exibir maior pontuação legada separadamente, sem atribuir identidade nem posição a uma conta.

## Correção crítica de cadastro: limite PBKDF2 Cloudflare (16/11/2026)
- Causa identificada na revisão do backend: `functions/api/_lib/auth.js` estava configurado com 210.000 iterações de PBKDF2, mas WebCrypto do Cloudflare Workers rejeita contagens superiores a 100.000 (`NotSupportedError`). O erro era absorvido pelo `catch` no registro e devolvido como erro genérico.
- Corrigido para 100.000 iterações, salt individual aleatório e senha jamais em texto puro. Testes automatizados cobrem cálculo determinístico. Confirmar registro real no Preview; não confundir CI verde com verificação D1 concluída.

## Regras live aprovadas (16/11/2026)
- Recordes legados não interessam mais para exibição nem consulta: permanecerão guardados em `game_leaderboard` sem migrar ou apagar por padrão.
- HUD durante a partida acompanha recorde pessoal e global de contas no D1. Conquistas são anunciadas **uma vez por limiar por partida**: "Recorde pessoal superado!" e "Recorde global ultrapassado!". O resultado do próprio jogador durante a partida é provisório; o recorde oficial só é persistido após o fim de partida com conta autenticada.
- Consulta do ranking a cada 10 segundos somente durante a partida e com aba visível (e na volta à aba), sem conexões persistentes nem custo de infraestrutura adicional conhecido. Se um terceiro registrar pontuação maior, avisar jogador em andamento e atualizar placar. Não prometer instantaneidade de WebSockets; existe latência de até ~10 s.
- Diferenças entre fonte D1 e recorde da partida: avisos temporários não representam confirmação ou verificação contra cheating. No futuro validar servidores e adversários para ranking competitivo.

- Complemento: detectar mudança na posição individual do jogador autenticado (rank piorou desde última consulta), avisando-o mesmo quando a liderança global permanece a mesma.

## Proteção da franquia gratuita (16/11/2026)
- O usuário apontou corretamente que consultas a cada 10 segundos podem esgotar a franquia gratuita de Workers/Pages Functions e leituras D1.
- Na fase piloto, limitar a **no máximo duas atualizações periódicas do ranking por partida**, com intervalo de 120 segundos em vez de 10 segundos. A retomada de aba compartilha o mesmo orçamento, sem consultas ilimitadas. Mantidas consulta inicial da página e gravação ao final do jogo.
- Portanto, não anunciar atualização instantânea: resultados de terceiros podem demorar a chegar ou só aparecer após nova partida. Para tempo real em escala, projetar cache compartilhado, push, controle de custos e monitoramento de limites ANTES de ativar polling rápido.

## Consulta somente no encerramento (16/11/2026)
- Decisão final substitui polling de 10s e 120s: nenhuma consulta periódica ou por troca de aba durante a partida. GET inicial para mostrar referência; ao terminar, um GET se anônimo ou POST se autenticado (POST já retorna ranking atual).
- Resumo no fim compara líder/pontuação e posição individual entre início e fim. Exibe nickname e tempo desde a conquista pelo horário do servidor D1, quando há dados suficientes. Não afirmar tempo exato em liderança sem histórico auditável.
- Se o jogador não estiver autenticado, mostra resultado da checagem no modal de cadastro. Fluxo precisa ser validado no Preview D1.

## Celebrações Snake — implementação seguinte à validação de `522b836` (16/11/2026)
- Conquista de recorde pessoal: brilho verde no tabuleiro/HUD, partículas verdes e mensagem existente de recorde pessoal. Conquista de meta global: brilho dourado mais forte e partículas douradas, mensagem de recorde global ultrapassado. Quando ambos coincidem, os dois efeitos são disparados, mantendo prioridade do aviso global.
- Efeitos são client-side, não alteram placar, registros ou consultas de Cloudflare; movimentos são suprimidos quando usuário seleciona `prefers-reduced-motion: reduce`; overlays não capturam toque/click.
- Reutilizar os gatilhos já existentes (somente ao ultrapassar valores, uma vez por limiar na rodada); limpar timers e partículas ao reiniciar.

## Pontuações decimais — desenvolvimento em 16/11/2026
- Aprovado pelo proprietário: até três casas decimais para todos os jogos, sem restrição de múltiplos no D1.
- Migração **0006_decimal_scores.sql preparada, NÃO EXECUTADA**: troca `best_score INTEGER` por `best_score_milli INTEGER` (milésimos exatos); copia registros existentes multiplicando por 1000; preserva jogador, modalidade, timestamp, PK, FK e índice. Aplicar somente em `oldarcade-stats-preview` após backup e conferência. Migração 0005 foi aplicada manualmente no Preview; não repetir.
- API de leaderboard reconhece esquema antigo e novo via PRAGMA, permitindo rankings inteiros existentes até executar 0006. No novo esquema converte milésimos em número decimal na resposta e usa milésimos para ordenação e empate. Até a migração, valores fracionários são recusados explicitamente; pontuações inteiras dos Snake continuam funcionais.
- Validação de entrada numérica até 3 casas e intervalo 0–4000 (limite provisório de API atual, revisar por jogo futuro); a pontuação segue autodeclarada pelo cliente, não é antifraude.
- Componente compartilhado `modeRanking.ts` recebe decimais; testes de contrato e migração atualizados.
- **Pendente:** conferir GitHub Actions e E2E, backup e execução manual 0006 no D1 Preview, validação de preservação e valores decimais no ambiente real. Não executar em produção nem publicar/merge sem autorização.
