import {tetrisScopes,tetrisRankOrder} from '../data/tetrisRanking.js';
import {missions} from '../data/tetrisMissions.js';
import {renderRankingPodium} from './rankingPresentation';
import {formatRankingValue} from '../data/rankingRules.js';
type Result={points:number;durationMs:number;counts:number[]};
type Entry={nickname:string;points:number;durationMs:number;rank:number};
type Board={available:boolean;top?:Entry[];mine?:{points:number;durationMs:number}|null;saved?:boolean};
export function setupTetrisVersionedRanking(defaultScope:string){
 const element=document.querySelector<HTMLElement>('[data-tetris-unified=true]');
 if(!element)return {begin:()=>{},select:(_scope:string)=>{},finish:(_scope:string,_result:Result)=>{}};
 const root:HTMLElement=element;
 const get=<T extends HTMLElement>(name:string)=>root.querySelector<T>('[data-rank-'+name+']')!;
 const status=get('status'),body=get('body'),podium=get('podium'),own=get('mine');
 const heading=get('heading'),description=get('description'),primary=get('primary'),secondary=get('secondary');
 const choice=root.querySelector<HTMLSelectElement>('[data-tetris-rank-view]')!;
 const original={heading:heading.textContent!,description:description.textContent!,primary:primary.textContent!,secondary:secondary.textContent!};
 const isCurrent=()=>root.dataset.tetrisView==='current';
 const time=(ms:number)=>formatRankingValue('tetris-sprint',ms);
 const missionBest=document.getElementById('tetris-mission-best'),missionTime=document.getElementById('tetris-mission-time');
 const hudBest=document.getElementById('tetris-best'),hudGlobal=document.getElementById('tetris-global');
 const label=(element:HTMLElement|null,value:string)=>{const metric=element?.closest('.oa-hud-metric');if(metric){metric.setAttribute('title',value);metric.setAttribute('aria-label',value);const label=metric.querySelector('.oa-hud-label');if(label)label.textContent=value;}};

 const filter=root.querySelector<HTMLSelectElement>('[data-tetris-rank-scope]');
 let gameScope=defaultScope,scope=defaultScope,revision=0,hudRevision=0,pending:{scope:string;result:Result;busy:boolean}|null=null;
 let identity:string|null|undefined=undefined;
 const endpoint=(s:string)=>'/api/tetris/rankings/'+encodeURIComponent(s);
 const format=(r:{points:number;durationMs:number})=>r.points+' pts · '+time(r.durationMs);
 const timeFirst=(key=scope)=>tetrisRankOrder(key)?.[0].startsWith('duration_ms')??false;
 const metric=(key:string,r:{points:number;durationMs:number}|null|undefined)=>r?(timeFirst(key)?time(r.durationMs):String(r.points)):'—';
 function renderHud(data:Board,key:string){
  if(key!==gameScope||key===defaultScope)return;
  label(hudBest,'Recorde da missão');label(hudGlobal,'Líder da missão');
  if(hudBest)hudBest.textContent=metric(key,data.available?data.mine:null);
  if(hudGlobal)hudGlobal.textContent=metric(key,data.available?data.top?.[0]:null);
  if(missionBest)missionBest.textContent=data.available&&data.mine?data.mine.points+' pts':'—';
  if(missionTime)missionTime.textContent=data.available&&data.mine?time(data.mine.durationMs):'—';
 }
 async function refreshHud(){
  const key=gameScope,rev=++hudRevision;
  if(key===defaultScope)return;
  renderHud({available:false},key);
  if(key===scope&&isCurrent())return;
  try{const response=await fetch(endpoint(key),{cache:'no-store'});const data=await response.json() as Board;if(rev===hudRevision)renderHud(data,key);}catch{}
 }
 function headings(){
  heading.textContent='Ranking global — '+(missions.find(m=>m.id===scope)?.title??original.heading.replace('Ranking global — ',''));
  description.textContent=(timeFirst()?(tetrisRankOrder(scope)?.[0].endsWith('ASC')?'Vence o menor tempo.':'Vence o maior tempo.'):'Vence a maior pontuação.')+' Desempate pelo segundo indicador. Somente contas registram resultados.';
  primary.textContent=timeFirst()?'Tempo':'Pontos';secondary.textContent=timeFirst()?'Pontos':'Tempo';
 }
 function clear(){
  body.replaceChildren();podium.replaceChildren();own.hidden=true;own.textContent='';
  get('personal').textContent='—';get('global').textContent='—';get('provisional').hidden=true;
 }

 function render(data:Board){
  if(!isCurrent())return;
  clear();headings();
  if(!data.available){status.textContent='Ranking indisponível neste ambiente.';podium.textContent='Classificação indisponível.';return;}
  status.textContent=data.top?.length?'Classificação pública por contas cadastradas. Resultados não verificados contra a partida.':'Ainda não há resultados.';
  renderRankingPodium(podium,(data.top??[]).map((row,i)=>({nickname:row.nickname,score:i})),i=>format(data.top![i]));
  for(const row of data.top??[]){const tr=document.createElement('tr');tr.className=row.rank<=3?'leaderboard-podium podium-'+row.rank:'';for(const value of [row.rank+'º',row.nickname,timeFirst()?time(row.durationMs):String(row.points),timeFirst()?String(row.points):time(row.durationMs)]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}
  if(data.mine){own.hidden=false;own.textContent='Seu recorde: '+format(data.mine);}
  renderHud(data,scope);
  if(scope!==defaultScope){get('personal').textContent=metric(scope,data.mine);get('global').textContent=metric(scope,data.top?.[0]);}
 }
 async function refresh(){
  const rev=++revision;if(isCurrent()){clear();headings();status.textContent='Consultando classificação…';}
  try{const response=await fetch(endpoint(scope),{cache:'no-store'});const data=await response.json() as Board;if(rev===revision)render(data);}catch{if(rev===revision)render({available:false});}
 }
 function showView(current:boolean){
  root.dataset.tetrisView=current?'current':'legacy';
  choice.value=current?'current':'legacy';
  if(current){headings();void refresh();}
  else{++revision;heading.textContent=original.heading;description.textContent=original.description;primary.textContent=original.primary;secondary.textContent=original.secondary;clear();document.dispatchEvent(new CustomEvent('oldarcade:tetris-history-view'));}
 }
 choice.addEventListener('change',()=>showView(choice.value==='current'));
 filter?.addEventListener('change',()=>{scope=filter.value==='follow'?gameScope:filter.value;showView(true);});
 async function submit(){
  if(!pending||pending.busy)return;
  const item=pending;item.busy=true;const submittedIdentity=identity;
  try{
   const response=await fetch(endpoint(item.scope),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item.result)});
   if(pending!==item)return;
   if(response.status===401){item.busy=false;status.textContent='Entre na sua conta para registrar o resultado.';if(identity&&identity!==submittedIdentity)void submit();return;}
   const data=await response.json() as Board;
   pending=null;
   if(response.ok&&data.saved)document.dispatchEvent(new CustomEvent('oldarcade:tetris-v2-saved'));
   if(response.ok&&data.saved)renderHud(data,item.scope);
   if(scope===item.scope){if(response.ok&&data.saved){++revision;render(data);}else status.textContent='Registro não confirmado.';}
  }catch{if(pending===item){pending=null;status.textContent='Registro não confirmado.';}}
 }
 document.addEventListener('oldarcade:account-changed',e=>{
  const player=(e as CustomEvent<{player?:{id?:string;nickname?:string}|null}>).detail?.player;
  const next=player?.id??player?.nickname??null;
  if(identity&&identity!==next)pending=null;
  identity=next;
  own.textContent='';void refresh();void refreshHud();if(player)void submit();
 });
 showView(false);void refresh();
 return {begin(){if(!pending?.busy)pending=null;},select(next:string){if(!tetrisScopes.includes(next)||next===gameScope)return;gameScope=next;if(!filter||filter.value==='follow'){scope=next;showView(scope!==defaultScope||choice.value==='current');}choice.disabled=!!filter||scope!==defaultScope;choice.closest<HTMLElement>('[data-tetris-ranking-choice]')!.hidden=!!filter||scope!==defaultScope;void refreshHud();},finish(next:string,result:Result){if(next!==gameScope)return;pending={scope:next,result,busy:false};void submit();}};
}
