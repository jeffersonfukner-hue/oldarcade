import {DAILY_MODES} from '../data/dailyChallenges.js';
type DailyResponse={today:string;days:Array<{date:string;status:'started'|'finished'}>;account:{nickname:string}|null};
const root=document.querySelector<HTMLElement>('[data-home-daily]');
if(root){
 const name=root.querySelector<HTMLElement>('[data-home-daily-name]')!;
 const message=root.querySelector<HTMLElement>('[data-home-daily-copy]')!;
 const action=root.querySelector<HTMLAnchorElement>('[data-home-daily-link]')!;
 let sequence=0;
 const refresh=async()=>{
  const current=++sequence;
  root.hidden=true;
  const games=Object.entries(DAILY_MODES);
  try{
   // Não expor informação privada: respostas só contêm participação da conta autenticada.
   const data=await Promise.all(games.map(async ([game])=>{
    const response=await fetch('/api/daily/'+encodeURIComponent(game),{cache:'no-store'});
    if(!response.ok)throw Error('Calendário indisponível');
    return response.json() as Promise<DailyResponse>;
   }));
   if(current!==sequence)return;
   const eligible=games.flatMap(([game,config],i)=>{
    const state=data[i];
    if(!state?.today)return [];
    if(state.account&&state.days?.some(day=>day.date===state.today))return [];
    return [{game,config,loggedIn:!!state.account}];
   });
   if(!eligible.length)return;
   // A cada entrada, escolher entre os desafios ainda disponíveis.
   // Alternar de fato entre os jogos quando ambos estão disponíveis, sem
   // repetir o destaque visto na visita anterior desta sessão.
   let previous='';
   try{previous=sessionStorage.getItem('oldarcade:home:last-daily')||''}catch{}
   const candidates=eligible.length>1?eligible.filter(entry=>entry.game!==previous):eligible;
   const chosen=candidates[Math.floor(Math.random()*candidates.length)];
   try{sessionStorage.setItem('oldarcade:home:last-daily',chosen.game)}catch{}
   name.textContent=chosen.config.title;
   message.textContent=chosen.loggedIn
    ?'Seu desafio de hoje está disponível. Uma tentativa, mesma sequência para todos. Mostre do que é capaz!'
    :'Consegue superar o desafio de hoje? Jogar é grátis. Crie uma conta para guardar seu histórico e participar dos desafios e rankings.';
   action.href=chosen.config.path+'#daily-title-'+chosen.game;
   action.textContent=chosen.loggedIn?'▶ Participar do desafio':'🎯 Descobrir o desafio';
   root.hidden=false;
  }catch{if(current===sequence)root.hidden=true}
 };
 document.addEventListener('oldarcade:account-changed',()=>void refresh());
 document.addEventListener('oldarcade:daily-status-changed',()=>void refresh());
 window.addEventListener('pageshow',event=>{if(event.persisted)void refresh()});
 void refresh();
}
