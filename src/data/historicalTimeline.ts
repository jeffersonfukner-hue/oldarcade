/** Fonte única dos marcos ilustrados. Imagens SVG são desenhos editoriais originais,
 * nunca capturas dos jogos citados. A referência externa fundamenta a data, não a arte. */
export type HistoricalGame='snake'|'tetris'|'pixel-quest';
export type HistoricalScene='trail'|'maze'|'phone'|'snake'|'blocks'|'computer'|'handheld'|'museum'|'ladder'|'barrels'|'scroll'|'forest';
export interface HistoricalMilestone {
 date:string;
 title:string;
 description:string;
 sourceLabel:string;
 sourceUrl:string;
 scene:HistoricalScene;
}
export const historicalTimelines:Record<HistoricalGame,HistoricalMilestone[]>={
 snake:[
  {date:'1976',title:'Blockade',description:'Duas linhas deixam rastros e tornam a arena mais perigosa.',sourceLabel:'Histórico de Snake — Taneli Armanto',sourceUrl:'https://taneliarmanto.com/news/history-of-snake',scene:'trail'},
  {date:'Início dos anos 1980',title:'Variantes de arcade',description:'Novas versões exploram coleta, obstáculos e labirintos.',sourceLabel:'Histórico de Snake — Taneli Armanto',sourceUrl:'https://taneliarmanto.com/news/history-of-snake',scene:'maze'},
  {date:'1997',title:'Nokia 6110',description:'A versão de Taneli Armanto leva a cobrinha aos telefones.',sourceLabel:'Taneli Armanto — FAQ',sourceUrl:'https://taneliarmanto.com/faq',scene:'phone'},
  {date:'Anos 2000',title:'Novos celulares',description:'A mecânica acompanha aparelhos e interfaces móveis.',sourceLabel:'Histórico de Snake — Taneli Armanto',sourceUrl:'https://taneliarmanto.com/news/history-of-snake',scene:'snake'},
  {date:'2015',title:'Snake Rewind',description:'O gênero ganha mais uma interpretação para telas de toque.',sourceLabel:'Histórico de Snake — Taneli Armanto',sourceUrl:'https://taneliarmanto.com/news/history-of-snake',scene:'phone'},
  {date:'Hoje',title:'Snake no navegador',description:'Uma tradição que continua nos jogos independentes de navegador.',sourceLabel:'OldArcade — versão independente',sourceUrl:'/jogos/snake/',scene:'snake'}
 ],
 tetris:[
  {date:'1984',title:'Electronika 60',description:'Alexey Pajitnov cria Tetris com caracteres de texto.',sourceLabel:'The Tetris Company — About',sourceUrl:'https://tetris.com/about',scene:'computer'},
  {date:'Meados dos anos 1980',title:'Microcomputadores',description:'A adaptação para IBM PC amplia a circulação do jogo.',sourceLabel:'Smithsonian — Tetris e Guerra Fria',sourceUrl:'https://americanhistory.si.edu/explore/stories/tetris-fun-cold-war',scene:'blocks'},
  {date:'1989',title:'Game Boy',description:'A versão portátil ajuda a popularizar Tetris mundialmente.',sourceLabel:'The Tetris Company — História',sourceUrl:'https://tetris.com/news/the-history-of-tetris',scene:'handheld'},
  {date:'1996',title:'The Tetris Company',description:'Pajitnov e Henk Rogers consolidam a administração comercial da marca.',sourceLabel:'The Tetris Company — About',sourceUrl:'https://tetris.com/about',scene:'blocks'},
  {date:'2012',title:'MoMA',description:'Tetris entra no acervo de design do museu de Nova York.',sourceLabel:'MoMA — Tetris',sourceUrl:'https://www.moma.org/collection/works/152403',scene:'museum'},
  {date:'Hoje',title:'Novas interpretações',description:'Clássico, Sprint e Sobrevivência continuam a desafiar jogadores.',sourceLabel:'OldArcade — versão independente',sourceUrl:'/jogos/tetris/',scene:'blocks'}
 ],
 'pixel-quest':[
  {date:'1980',title:'Space Panic',description:'Plataformas e escadas em diferentes alturas, antes de o salto dominar o gênero.',sourceLabel:'História dos jogos de plataforma',sourceUrl:'https://code198x.com/vault/genres/platformer/',scene:'ladder'},
  {date:'1981',title:'Donkey Kong',description:'Saltos e obstáculos tornam-se centrais no arcade.',sourceLabel:'Nintendo — história institucional',sourceUrl:'https://www.nintendo.com/en-gb/Hardware/Nintendo-History/Nintendo-History-625945.html',scene:'barrels'},
  {date:'1985',title:'Super Mario Bros.',description:'O avanço lateral revela novos cenários e desafios.',sourceLabel:'Nintendo — história de Mario',sourceUrl:'https://www.nintendo.com/pt-br/explore/characters/mario/history/',scene:'scroll'},
  {date:'Novembro de 2026',title:'Pixel Quest',description:'O OldArcade inicia sua aventura original; a fase 1-1 segue em testes.',sourceLabel:'OldArcade — projeto independente',sourceUrl:'/jogos/pixel-quest/',scene:'forest'}
 ]
};
