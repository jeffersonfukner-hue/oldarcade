/**
 * Recomendações audiovisuais editoriais associadas ao contexto histórico.
 * Disponibilidade é uma fotografia da consulta em data explícita, NUNCA
 * alegação dinâmica de catálogo atual. Só inserir obras/fontes verificadas.
 * Sem publicidade, comissão ou links de afiliado nesta etapa.
 */
export const historicalScreenings={
 tetris:{
  publishedAt:'2026-11-17',
  checkedAt:'2026-11-17',
  works:[{
   id:'tetris-2023',title:'Tetris',year:2023,type:'Filme',
   description:'Drama inspirado nas negociações de Henk Rogers para levar Tetris ao público mundial. Baseado em fatos reais, com dramatizações; não é documentário.',
   relation:'Sobre a história comercial de Tetris',
   availability:'Brasil · Apple TV (assinatura)',
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
 }
} as const;
