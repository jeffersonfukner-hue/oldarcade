type Stats={available:boolean;siteVisits?:number;gamesPlayed?:number;totalPlays?:number};
const visitKey='oldarcade:site:visit:v1';
const doneKey='oldarcade:site:recorded:v1';
let id:string;
let recorded=false;
try{
 id=sessionStorage.getItem(visitKey)||crypto.randomUUID();
 sessionStorage.setItem(visitKey,id);
 recorded=sessionStorage.getItem(doneKey)==='yes';
}catch{id=crypto.randomUUID()}
const fields={
 visits:document.getElementById('hero-site-visits'),
 played:document.getElementById('hero-games-played'),
 plays:document.getElementById('hero-total-plays')
};
const status=document.getElementById('hero-stats-status');
async function run(){
 const isHome=Boolean(fields.visits);
 if(recorded&&!isHome)return;
 try{
  const res=await fetch('/api/site/stats',recorded?{method:'GET',cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId:id})});
  if(!res.ok)throw new Error('Dados indisponíveis');
  const data=await res.json() as Stats;
  if(!data.available||![data.siteVisits,data.gamesPlayed,data.totalPlays].every(Number.isSafeInteger))throw Error('Dados incompletos');
  if(!recorded){recorded=true;try{sessionStorage.setItem(doneKey,'yes')}catch{}}
  if(isHome){
   fields.visits!.textContent=data.siteVisits!.toLocaleString('pt-BR');
   fields.played!.textContent=data.gamesPlayed!.toLocaleString('pt-BR');
   fields.plays!.textContent=data.totalPlays!.toLocaleString('pt-BR');
   if(status)status.textContent='Visitas por sessão; jogos jogados = títulos que já tiveram partidas.';
  }
 }catch{
  if(isHome&&status)status.textContent='Contadores indisponíveis neste ambiente. Não exibimos números estimados.';
 }
}
void run();
