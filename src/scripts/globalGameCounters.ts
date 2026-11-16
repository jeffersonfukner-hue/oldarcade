type Totals={available:boolean;visits?:number;plays?:number};
export function setupGlobalGameCounters(game:string){
 const visits=document.getElementById('global-visits')!;
 const plays=document.getElementById('global-plays')!;
 const info=document.getElementById('global-stats-status')!;
 const endpoint='/api/games/'+encodeURIComponent(game)+'/stats';
 let mostRecent=0;
 async function send(kind:'visit'|'play',eventId:string){
  const seq=++mostRecent;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,eventId})});
   if(!response.ok)throw Error('API não ativa');
   const data=await response.json() as Totals;
   if(seq!==mostRecent)return;
   if(!data.available||!Number.isSafeInteger(data.visits)||!Number.isSafeInteger(data.plays))throw Error('Dados ausentes');
   visits.textContent=String(data.visits);plays.textContent=String(data.plays);
   info.textContent='Totais de todos os jogadores.';
  }catch{
   if(seq===mostRecent){visits.textContent='—';plays.textContent='—';info.textContent='Contadores globais ainda indisponíveis no Preview.'}
  }
 }
 const key='oldarcade:global:visit:'+game;
 let token:string;
 try{token=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,token)}
 catch{token=crypto.randomUUID()}
 void send('visit',token);
 return {recordPlay:(eventId:string)=>{void send('play',eventId)}};
}
