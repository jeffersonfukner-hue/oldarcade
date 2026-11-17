/**
 * Registro editorial versionado das implementações do OldArcade.
 * Datas significam marcos de desenvolvimento, não necessariamente publicação.
 * Nunca reescrever entradas históricas; adicionar novas versões.
 */
export const gameRegistry = {
  snake: {
    number: 1,
    name: 'Snake',
    createdAt: '2026-11-15',
    version: '0.2.0-dev',
    milestones: [
      { date: '2026-11-16', mode: 'snake-adventure', title: 'Snake Aventura em desenvolvimento', notes: 'Modalidade independente do Clássico, com missões e níveis contínuos, itens especiais e ranking separado; ainda em validação no Preview.' },
      { date: '2026-11-16', mode: 'snake', title: 'Infraestrutura compartilhada de modos', notes: 'Catálogo único de modalidades, contadores, ranking, HUD e página SEO reutilizáveis, sem alterar o número de jogos.' },
      { date: '2026-11-17', mode: 'snake-evolution', title: 'A cobrinha ganhou inimigos!', notes: 'Caçadores, emboscadores e patrulheiros chegaram ao tabuleiro. Um poder especial pode fazê-los fugir.', commit: 'd1408442' },
      { date: '2026-11-17', mode: 'snake-evolution', title: 'Frutas, poderes e tiros automáticos', notes: 'O Evolution ganhou frutas especiais, obstáculos, disparos e a Salva-Cobra: agora sobreviver exige mais que bons reflexos.', commit: '3a4c7909' },
      { date: '2026-11-17', mode: 'snake', title: 'Cada segundo conta', notes: 'O cronômetro acompanha apenas o tempo de jogo. Em pontuações iguais, vencer mais rápido pode decidir o ranking.', commit: '2e7050ae' },
      { date: '2026-11-17', mode: 'snake-adventure', title: 'As paredes começaram a aparecer', notes: 'Na Aventura, trechos das bordas se fecham conforme a jornada avança, mas os espaços livres ainda permitem passagem.', commit: 'ee6e7e39' },
      { date: '2026-11-17', mode: 'snake', title: 'Mais jogo, menos distração', notes: 'O tabuleiro ganhou protagonismo, com placar lateral no computador e faixa compacta no celular.', commit: 'ef402e3f' },
      { date: '2026-11-17', mode: 'snake', title: 'O arcade agora torce por você', notes: 'Comemorações especiais em 100, 200, 400, 800 pontos e além. Cada nova conquista exige o dobro da anterior.', commit: '8b8aa455' }
    ],
    history: [
      { version: '0.1.0', date: '2026-11-15', notes: 'Primeira implementação de Snake com Canvas, teclado, controles móveis, tela cheia e pontuações locais; fase de testes, ainda sem lançamento público.' },
      { version: '0.2.0-dev', date: '2026-11-16', notes: 'Versão de desenvolvimento: contas, ranking global por jogadores, recorde provisório, efeitos de pontuação e comemorações, melhorias mobile.' }
    ]
  },
  tetris: {
    number: 2,
    name: 'Tetris',
    createdAt: '2026-11-17',
    version: '0.1.0-dev',
    milestones: [
      {date:'2026-11-17',mode:'tetris',title:'O segundo jogo entra no tabuleiro',notes:'Primeira implementação de blocos em queda com sete peças, próxima peça, reserva, peça fantasma e limpeza de linhas; construída com componentes compartilhados e aguardando validação no Preview.'}
    ],
    history: [
      {version:'0.1.0-dev',date:'2026-11-17',notes:'Protótipo jogável do jogo #002, sem lançamento em produção; controles de teclado e toque, pontuação e ranking isolados.'}
    ]
  }
} as const;
