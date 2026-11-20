/**
 * Recomendações audiovisuais editoriais associadas ao contexto histórico.
 * Disponibilidade é uma fotografia da consulta em data explícita, NUNCA
 * alegação dinâmica de catálogo atual. Só inserir obras/fontes verificadas.
 * Sem publicidade, comissão ou links de afiliado nesta etapa.
 */
export const historicalScreenings={
 tetris:{
  publishedAt:'2026-11-17',
  checkedAt:'2026-11-20',
  works:[{
   id:'tetris-2023',title:'Tetris',year:2023,type:'Filme',
   description:'Drama inspirado nas negociações de Henk Rogers para levar Tetris ao público mundial. Baseado em fatos reais, com dramatizações; não é documentário.',
   relation:'Sobre a história comercial de Tetris',
   availability:'Brasil · Apple TV (assinatura); outras opções de aluguel ou compra podem existir',
   watchUrl:'https://tv.apple.com/br/movie/tetris/umc.cmc.4evmgcam356pzgxs2l7a18d7b',
   sourceUrl:'https://www.apple.com/br/tv-pr/originals/tetris/'
  }]
 },
 snake:{
  publishedAt:'2026-11-17',
  checkedAt:'2026-11-17',
  works:[{
   id:'man-vs-snake',title:'Man vs Snake: The Long and Twisted Tale of Nibbler',year:2015,type:'Documentário',
   description:'Acompanha Tim McVey em sua busca por um recorde de Nibbler, jogo de arcade da família de jogos de cobra. Não é um filme sobre a versão do Snake criada para os celulares Nokia.',
   relation:'Sobre Nibbler, um parente histórico do Snake',
   availability:'Brasil · Filmzie ou Plex (grátis com anúncios, conforme consulta)',
   watchUrl:'https://br.justwatch.com/br/filme/man-vs-snake',
   sourceUrl:'https://br.justwatch.com/br/filme/man-vs-snake'
  }]
 },
 'pixel-quest':{
  publishedAt:'2026-11-20',
  checkedAt:'2026-11-20',
  works:[
   {
    id:'mario-2023',title:'Super Mario Bros. O Filme',year:2023,type:'Animação',
    description:'Adaptação cinematográfica do universo de Mario, um dos personagens ligados à história dos jogos de plataforma. Não adapta Pixel Quest nem participa de sua história fictícia.',
    relation:'Filme baseado na franquia Mario, referência cultural do gênero plataforma',
    availability:'Disponibilidade no Brasil não confirmada nesta revisão; consulte as opções atuais',
    watchUrl:'https://br.justwatch.com/br/filme/super-mario-bros-the-movie',
    sourceUrl:'https://www.nintendo.com/jp/movie/super-mario-bros/index.html'
   },
   {
    id:'sonic-2020',title:'Sonic: O Filme',year:2020,type:'Filme',
    description:'Adaptação da franquia Sonic, da Sega, que ajudou a popularizar aventuras de ação e plataforma. Não é um filme sobre Pixel Quest.',
    relation:'Filme de outra franquia de jogos de plataforma',
    availability:'Disponibilidade no Brasil não confirmada nesta revisão; consulte as opções atuais',
    watchUrl:'https://www.sega.co.jp/en/release/220216_1.html',
    sourceUrl:'https://www.sega.co.jp/en/release/220216_1.html'
   }
  ]
 }
} as const;
