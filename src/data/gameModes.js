/** Fonte única de IDs de modalidades, regras de pontuação e competição. */
export const gameModes = Object.freeze({
  snake: Object.freeze({title:'snake',name:'Snake Clássico',tagline:'O desafio original',url:'/jogos/snake/',symbol:'🐍',description:'Cada fruta vale 10 pontos. Supere a maior pontuação registrada.',competitive:true,maxScore:4000,scoreDecimals:3}),
  'snake-adventure': Object.freeze({title:'snake',name:'Snake Aventura',tagline:'Missões e níveis contínuos',url:'/jogos/snake/aventura/',symbol:'🍎',description:'Frutas especiais, novas missões e ranking exclusivo deste modo.',competitive:true,maxScore:4000,scoreDecimals:3})
});
export const gameModeIds=Object.freeze(Object.keys(gameModes));
export function gameMode(id){return Object.hasOwn(gameModes,id)?gameModes[id]:null;}
export function competitiveGame(id){return gameMode(id)?.competitive===true;}
export function validGameScore(id,score){
 const mode=gameMode(id);
 if(!mode?.competitive||typeof score!=='number'||!Number.isFinite(score)||score<0||score>mode.maxScore)return false;
 const scale=10**mode.scoreDecimals,scaled=score*scale;
 return Number.isSafeInteger(Math.round(scaled))&&Math.abs(scaled-Math.round(scaled))<1e-7;
}
