/** Fonte única de IDs de modalidades, regras de pontuação e competição. */
export const gameModes = Object.freeze({
  snake: Object.freeze({title:'snake',name:'Snake Clássico',tagline:'O desafio original',url:'/jogos/snake/',symbol:'🐍',description:'Cada fruta vale 10 pontos. Supere a maior pontuação registrada.',competitive:true,maxScore:4000,scoreDecimals:3}),
  'snake-adventure': Object.freeze({title:'snake',name:'Snake Aventura',tagline:'Missões e níveis contínuos',url:'/jogos/snake/aventura/',symbol:'🍎',description:'Frutas especiais, novas missões e ranking exclusivo deste modo.',competitive:true,maxScore:4000,scoreDecimals:3}),
  'snake-evolution': Object.freeze({title:'snake',name:'Snake Evolution',tagline:'Poderes e obstáculos dinâmicos',url:'/jogos/snake/evolution/',symbol:'⚡',description:'Bordas progressivas, tiros automáticos e poderes. Ranking próprio.',competitive:true,maxScore:4000,scoreDecimals:3}),
tetris: Object.freeze({title:'tetris',name:'Tetris Clássico',tagline:'Encaixe as peças, limpe as linhas',url:'/jogos/tetris/',symbol:'🧱',description:'Sete formatos, peças em queda, combo de linhas e evolução de velocidade. Jogue sem cadastro.',competitive:true,maxScore:100000000,scoreDecimals:0}),
  'tetris-sprint': Object.freeze({title:'tetris',name:'Tetris Sprint',tagline:'40 linhas, menor tempo',url:'/jogos/tetris/sprint/',symbol:'⏱️',description:'Limpe 40 linhas o mais rápido possível. Ranking por menor tempo de conclusão; tentativas incompletas não pontuam.',competitive:true,maxScore:86400000,scoreDecimals:0,ranking:'time',targetLines:40}),
  'tetris-survival': Object.freeze({title:'tetris',name:'Tetris Sobrevivência',tagline:'Cada segundo mais rápido',url:'/jogos/tetris/sobrevivencia/',symbol:'🔥',description:'A velocidade aumenta a cada 30 segundos. Sobreviva o máximo possível, com ranking independente pelo maior tempo.',competitive:true,maxScore:86400000,scoreDecimals:0,ranking:'survival',speedIntervalMs:30000}),
  'pixel-quest': Object.freeze({title:'pixel-quest',name:'Pixel Quest',tagline:'Fase 1-1 · Trilha Esmeralda',url:'/jogos/pixel-quest/',symbol:'💎',description:'Plataforma original em desenvolvimento: cristais, inimigos, saltos e pontuação experimental local.',competitive:false,maxScore:100000,scoreDecimals:0})
});
export const gameModeIds=Object.freeze(Object.keys(gameModes));
export function gameMode(id){return Object.hasOwn(gameModes,id)?gameModes[id]:null;}
export function competitiveGame(id){return gameMode(id)?.competitive===true;}
export function validGameScore(id,score){
 const mode=gameMode(id);
 if(!mode?.competitive||typeof score!=='number'||!Number.isFinite(score)||score<0||score>mode.maxScore||(mode.ranking==='time'||mode.ranking==='survival')&&score===0)return false;
 const scale=10**mode.scoreDecimals,scaled=score*scale;
 return Number.isSafeInteger(Math.round(scaled))&&Math.abs(scaled-Math.round(scaled))<1e-7;
}
