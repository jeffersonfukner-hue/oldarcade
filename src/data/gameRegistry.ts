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
      { date: '2026-11-16', mode: 'snake', title: 'Infraestrutura compartilhada de modos', notes: 'Catálogo único de modalidades, contadores, ranking, HUD e página SEO reutilizáveis, sem alterar o número de jogos.' }
    ],
    history: [
      { version: '0.1.0', date: '2026-11-15', notes: 'Primeira implementação de Snake com Canvas, teclado, controles móveis, tela cheia e pontuações locais; fase de testes, ainda sem lançamento público.' },
      { version: '0.2.0-dev', date: '2026-11-16', notes: 'Versão de desenvolvimento: contas, ranking global por jogadores, recorde provisório, efeitos de pontuação e comemorações, melhorias mobile.' }
    ]
  }
} as const;
