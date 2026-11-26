import {isTimeRanking,isLowerBetter,formatRankingValue} from '../data/rankingRules.js';
import {renderRankingPodium} from './rankingPresentation';
type RankEntry={nickname:string;score:number;rank?:number;achievedAt?:string};
type RankData={available:boolean;top?:RankEntry[]};
document.querySelectorAll<HTMLElement>('[data-rank-page-mode]').forEach(section=>{
 const game=section.dataset.rankPageMode||'';
 const timed=isTimeRanking(game),lowerBetter=isLowerBetter(game);
 const value=(v:number)=>formatRankingValue(game,v);
 const get=<T extends Element>(s:string)=>section.querySelector<T>('[data-rank-'+s+']')!;
 const podium=get<HTMLElement>('podium'),table=get<HTMLTableSectionElement>('table'),status=get<HTMLElement>('status');
 const challengeMessage=get<HTMLElement>('challenge-message');
 const date=(iso?:string)=>{
  const d=new Date(iso||'');return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d);
 };
 function cell(row:HTMLTableRowElement,value:string){const td=document.createElement('td');td.textContent=value;row.append(td)}
 function render(data:RankData){
  if(!data.available||!Array.isArray(data.top)){status.textContent='Ranking indisponível neste ambiente.';podium.textContent='Classificação indisponível.';table.replaceChildren();return}
  table.replaceChildren();
  const entries=data.top.slice(0,10);
  const leader=entries[0];
  if(leader){
   challengeMessage.textContent=(timed?(lowerBetter?'O menor tempo a superar é ':'O maior tempo a superar é '):'A marca a superar é ')+value(leader.score)+'. Você aceita o desafio?';
  }else{
   challengeMessage.textContent='O primeiro lugar ainda está aberto. Entre no jogo e tente conquistá-lo.';
  }
  renderRankingPodium(podium,entries,value);
  for(const [index,entry] of entries.entries()){
   const row=document.createElement('tr');
   for(const v of [(entry.rank??index+1)+'º',entry.nickname,value(entry.score),date(entry.achievedAt)])cell(row,v);
   table.append(row);
  }
  if(!entries.length){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Nenhum recorde registrado.';row.append(td);table.append(row)}
  status.textContent=timed?(lowerBetter?'Ranking por menor tempo em 40 linhas.':'Ranking por maior tempo de sobrevivência.')+' Empates pelo registro mais antigo.':'Ranking real da conta · melhor pontuação por jogador · empate por ordem de registro.';
 }
 void(async()=>{
  try{
   const endpoint=game==='pixel-quest'?'/api/quest/rankings/total':'/api/games/'+encodeURIComponent(game)+'/leaderboard';
   const res=await fetch(endpoint,{cache:'no-store'});
   if(!res.ok)throw Error('Indisponível');
   render(await res.json() as RankData);
  }catch{render({available:false})}
 })();
});

// A URL antiga por modalidade continua abrindo o painel correto, mesmo que não seja o primeiro.
function openReferencedMode(){
 const target=window.location.hash.slice(1);
 if(!target)return;
 const el=document.getElementById(target);
 if(el instanceof HTMLDetailsElement&&el.matches('[data-ranking-mode-details]'))el.open=true;
}
window.addEventListener('hashchange',openReferencedMode);
openReferencedMode();
