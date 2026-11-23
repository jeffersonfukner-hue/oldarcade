import {isTimeRanking,formatRankingValue} from '../data/rankingRules.js';
import {renderRankingPodium} from './rankingPresentation';
type Entry={nickname:string;score:number;rank?:number;achievedAt?:string;durationMs?:number|null};
type Board={available:boolean;top?:Entry[];mine?:Entry|null;error?:string;saved?:boolean;code?:string};
type Result={game:string;score:number;durationMs?:number;recordDelayMs?:number;eligible?:boolean};
const root=document.querySelector<HTMLElement>('[data-mode-ranking]');
if(root){
 const game=root.dataset.game||'',endpoint=game==='pixel-quest'?'/api/quest/rankings/total':'/api/games/'+encodeURIComponent(game)+'/leaderboard';
 const timed=isTimeRanking(game),display=(n:number|null|undefined)=>formatRankingValue(game,n);
 const get=<T extends Element>(name:string)=>root.querySelector<T>('[data-rank-'+name+']')!;
 const body=get<HTMLTableSectionElement>('body'),podium=get<HTMLElement>('podium');
 const global=get<HTMLElement>('global'),personal=get<HTMLElement>('personal');
 const status=get<HTMLElement>('status'),summary=get<HTMLElement>('summary'),mine=get<HTMLElement>('mine');
 const provisional=get<HTMLElement>('provisional');
 let leader:number|null=null,account:string|null=null,round=0,requestVersion=0,personalScore:number|null=null;
 let pending:{points:number;durationMs:number;round:number;sent:boolean}|null=null;
 const fmt=(iso?:string)=>iso&&Number.isFinite(Date.parse(iso))?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium'}).format(new Date(iso)):'—';
 const time=(ms?:number|null)=>ms==null?'Tempo indisponível':Math.floor(ms/60000)+'m '+String(Math.floor(ms/1000)%60).padStart(2,'0')+'s';
 const announce=(data:Board,points:number)=>{
  const best=data.top?.[0];if(!best)return 'Você pode ser o primeiro colocado!';
  if(data.mine?.rank===1)return 'Liderança confirmada!';
  if(best.score===points)return 'Empate com '+best.nickname+'. O critério de desempate determina a posição.';
  const difference=Math.abs(best.score-points);
  return best.nickname+' lidera com '+display(best.score)+'. Diferença para a liderança: '+display(difference)+'.';
 };
 const celebrate=(data:Board)=>{
  if(!data.mine)return;
  const position=data.mine.rank;
  if(position===1)document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game,kind:'leader',message:'Liderança confirmada!'}}));
  else if(position!==undefined&&position<=3)document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game,kind:'podium',rank:position,message:'Você conquistou o '+position+'º lugar!'}}));
 };
 function emit(){
  document.dispatchEvent(new CustomEvent('oldarcade:mode-ranking-updated',{detail:{game,global:leader,personal:personalScore}}));
 }
 function render(data:Board){
  if(!data.available){status.textContent='Ranking indisponível neste ambiente.';podium.textContent='Classificação indisponível.';return}
  leader=data.top?.[0]?.score??null;
  const score=data.mine?.score??null;personalScore=score;
  global.textContent=leader===null?'—':timed?display(leader):String(leader);
  personal.textContent=score===null?'—':timed?display(score):String(score);
  mine.hidden=!data.mine;
  if(data.mine)mine.textContent='Sua posição: '+data.mine.rank+'º · '+data.mine.nickname+' · '+display(data.mine.score);
  renderRankingPodium(podium,data.top||[],value=>display(value));
  body.replaceChildren();
  if(!data.top?.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Ainda não há resultados. Você pode inaugurar o ranking.';tr.append(td);body.append(tr)}
  else data.top.slice(0,10).forEach((entry,i)=>{
   const tr=document.createElement('tr'),position=entry.rank||i+1;
   tr.className=position<=3?'leaderboard-podium podium-'+position:'';
   for(const value of [position+'º',entry.nickname,timed?display(entry.score):String(entry.score),timed?fmt(entry.achievedAt):time(entry.durationMs)+' · '+fmt(entry.achievedAt)]){
    const td=document.createElement('td');td.textContent=value;tr.append(td);
   }body.append(tr);
  });
  status.textContent='Classificação pública por contas cadastradas. Resultados ainda não são verificados pelo servidor contra a execução da partida.';
  provisional.hidden=true;emit();
 }
 async function refresh(){
  const version=++requestVersion;
  try{
   const response=await fetch(endpoint,{cache:'no-store'});
   if(!response.ok)throw Error('Indisponível');
   const data=await response.json() as Board;
   if(version!==requestVersion)return null;
   render(data);return data;
  }catch{
   if(version===requestVersion)status.textContent='Não foi possível consultar o ranking no momento.';
   return null;
  }
 }
 async function submit(result:NonNullable<typeof pending>){
  if(!account||result.sent)return;
  result.sent=true;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:result.points,durationMs:result.durationMs})});
   const data=await response.json() as Board;
   if(!response.ok||!data.available)throw Error(data.error||'O servidor não confirmou a gravação');
   render(data);
   if(result.round===round&&game==='pixel-quest'&&data.saved){
    document.dispatchEvent(new CustomEvent('oldarcade:ranking-confirmed',{
     detail:{game,scope:'total',score:result.points,mine:data.mine??null}
    }));
   }
   if(result.round===round)summary.textContent='Resultado de '+display(result.points)+' enviado. '+announce(data,result.points);
   // A confirmação é automática, sem botões de registro redundantes.
   celebrate(data);
  }catch(error){
   if(result.round===round)summary.textContent='Não foi possível confirmar o registro do resultado: '+(error instanceof Error?error.message:'erro de conexão')+'. Consulte sua classificação antes de jogar novamente.';
   // Não reenviar automaticamente: o servidor pode ter aceito o resultado.
  }
 }
 function connect(player:{nickname:string}|null){
  const previous=account;
  account=player?.nickname??null;
  if(previous!==account){personalScore=null;personal.textContent='—';mine.hidden=true;emit();void refresh()}
  if(account&&pending&&!pending.sent)void submit(pending);
 }
 document.addEventListener('oldarcade:account-changed',e=>connect((e as CustomEvent<{player?:{nickname:string}|null}>).detail?.player??null));
 document.addEventListener('oldarcade:game-started',e=>{
  if((e as CustomEvent<{game:string}>).detail?.game!==game)return;
  round++;pending=null;summary.textContent='';provisional.hidden=true;
 });
 document.addEventListener('oldarcade:game-score',e=>{
  const d=(e as CustomEvent<Result>).detail;
  if(d?.game!==game||!Number.isFinite(d.score))return;
  if(leader!==null&&!timed&&d.score>leader){global.textContent=String(d.score);provisional.hidden=false;provisional.textContent='Marca provisória: '+display(d.score)+' (líder oficial: '+display(leader)+'). Confirmação só ao finalizar com conta.'}
  else{global.textContent=leader===null?'—':timed?display(leader):String(leader);provisional.hidden=true}
 });
 document.addEventListener('oldarcade:game-finished',e=>{
  const d=(e as CustomEvent<Result>).detail;
  if(d?.game!==game||!Number.isFinite(d.score))return;
  if(game==='pixel-quest'&&d.eligible===false){
   pending=null;
   provisional.hidden=true;
   summary.textContent='Fase não concluída: resultado parcial não enviado ao ranking.';
   return;
  }
  const result={points:d.score,durationMs:d.durationMs??0,round,sent:false};
  pending=result;
  if(account)void submit(result);
  else summary.textContent='Sua marca: '+display(result.points)+'. Entre ou crie uma conta para participar do ranking. Os líderes continuam visíveis para todos.';
 });
 document.addEventListener('oldarcade:mode-ranking-request',e=>{
  if((e as CustomEvent<{game:string}>).detail?.game===game)emit();
 });
 async function checkSession(){
  try{
   const response=await fetch('/api/auth/me',{cache:'no-store'});
   if(!response.ok)return;
   const data=await response.json() as {player?:{nickname:string}|null};
   connect(data.player??null);
  }catch{}
 }
 void checkSession();void refresh();
}
