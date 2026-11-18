/**
 * Contrato único dos desafios diários. Os títulos habilitados recebem a mesma
 * infraestrutura de calendário, conta, dia e estado, sem duplicar a interface.
 * O dia oficial usa America/Sao_Paulo, calculado no servidor.
 */
export const DAILY_TIME_ZONE='America/Sao_Paulo';
export const DAILY_MODES=Object.freeze({
 snake:Object.freeze({
  title:'Snake',gameMode:'snake',label:'Snake · Desafio Diário',
  path:'/jogos/snake/',rules:'Missão do dia com meta definida, uma tentativa e sequência de frutas igual para todos. A meta muda diariamente.',
  seedVersion:1
 }),
 tetris:Object.freeze({
  title:'Tetris',gameMode:'tetris',label:'Tetris · Desafio Diário',
  path:'/jogos/tetris/',rules:'Missão do dia com meta definida, uma tentativa e sequência de peças igual para todos. A meta muda diariamente.',
  seedVersion:1
 })
});
export function dailyMode(game){return Object.hasOwn(DAILY_MODES,game)?DAILY_MODES[game]:null}
export function dateInSaoPaulo(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:DAILY_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const p=(name)=>parts.find(x=>x.type===name)?.value;
 return p('year')+'-'+p('month')+'-'+p('day');
}
export function validDailyDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date}
export function dailySeed(game,date,seedVersion=1){
 const input=game+'|'+date+'|'+seedVersion;let h=2166136261;
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
 return h>>>0;
}
export function seededRandom(seed){
 let value=seed>>>0;
 return ()=>{value=(value+0x6d2b79f5)|0;let t=Math.imul(value^(value>>>15),1|value);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}
}

/**
 * Missões v2 estreiam em 19/11/2026 para não modificar tentativas v1 já
 * reservadas ou concluídas. Uma data antiga continua usando sua própria versão.
 * Alterar este algoritmo exige uma nova versão/época, nunca editar regras v2
 * retrospectivamente (também servirão ao replay histórico com moedas).
 */
export const DAILY_MISSION_V2_START='2026-11-19';
export const DAILY_MISSION_VERSION=2;
export function dailyVersionForDate(date){
 return typeof date==='string'&&date>=DAILY_MISSION_V2_START?DAILY_MISSION_VERSION:1;
}
export function dailyMission(game,date,version=dailyVersionForDate(date)){
 if(!dailyMode(game)||!validDailyDate(date))return null;
 if(version===1)return Object.freeze({
  version:1,id:'legacy',kind:'legacy',metric:'score',target:null,timeLimitMs:null,
  title:'Partida diária original',description:'Edição anterior: maior pontuação em uma tentativa. Não havia meta de vitória.'
 });
 if(version!==DAILY_MISSION_VERSION)return null;
 const day=Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(DAILY_MISSION_V2_START+'T12:00:00Z'))/86400000);
 const variant=((day+(game==='tetris'?1:0))%3+3)%3; // missões consecutivas nunca repetem o mesmo tipo
 const random=seededRandom(dailySeed(game,date,version));
 const tier=Math.floor(random()*5);
 const variation=Math.floor(random()*5);
 let mission;
 if(game==='snake'){
  if(variant===0){
   const fruits=6+tier*2+variation;
   mission={kind:'harvest',metric:'score',target:fruits*10,timeLimitMs:null,
    title:'Caça às frutas',description:'Coma '+fruits+' frutas sem bater. A missão termina assim que atingir '+(fruits*10)+' pontos.'};
  }else if(variant===1){
   const fruits=5+tier+variation;
   const seconds=55+tier*10+variation*5;
   mission={kind:'rush',metric:'score',target:fruits*10,timeLimitMs:seconds*1000,
    title:'Corrida contra o relógio',description:'Coma '+fruits+' frutas ('+(fruits*10)+' pontos) em até '+seconds+' segundos, sem bater.'};
  }else{
   const seconds=35+tier*10+variation*5;
   mission={kind:'survival',metric:'duration',target:seconds*1000,timeLimitMs:seconds*1000,
    title:'Sobrevivência',description:'Mantenha a cobra viva durante '+seconds+' segundos. Não é necessário comer uma quantidade específica de frutas.'};
  }
 }else{
  if(variant===0){
   const cleared=2+tier+variation;
   mission={kind:'lines',metric:'lines',target:cleared,timeLimitMs:null,
    title:'Mestre das linhas',description:'Elimine '+cleared+' linhas antes de empilhar blocos até o topo.'};
  }else if(variant===1){
   const cleared=2+tier+variation;
   const seconds=65+tier*15+variation*10;
   mission={kind:'rush',metric:'lines',target:cleared,timeLimitMs:seconds*1000,
    title:'Sprint relâmpago',description:'Elimine '+cleared+' linhas em até '+seconds+' segundos.'};
  }else{
   const points=300+tier*200+variation*100;
   mission={kind:'score',metric:'score',target:points,timeLimitMs:null,
    title:'Caça aos pontos',description:'Alcance '+points+' pontos antes do fim da partida.'};
  }
 }
 return Object.freeze({...mission,version,id:'v2-'+game+'-'+date+'-'+mission.kind,
  game,date,difficulty:1+tier%3});
}
/** Resultado da missão calculado no servidor a partir de métricas objetivas. */
export function dailyMissionWon(mission,progress){
 if(!mission||mission.kind==='legacy')return null;
 const {score,durationMs,linesCleared}=progress;
 if(!Number.isSafeInteger(score)||!Number.isSafeInteger(durationMs)||!Number.isSafeInteger(linesCleared))return false;
 if(mission.timeLimitMs!==null&&durationMs>mission.timeLimitMs+1500)return false;
 if(mission.metric==='score')return score>=mission.target;
 if(mission.metric==='duration')return durationMs>=mission.target;
 if(mission.metric==='lines')return linesCleared>=mission.target;
 return false;
}
