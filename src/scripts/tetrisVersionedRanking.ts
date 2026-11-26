import {tetrisScopes} from '../data/tetrisRanking.js';
type Result={points:number;durationMs:number;counts:number[]};
type Entry={nickname:string;points:number;durationMs:number;rank:number};
type Board={available:boolean;top?:Entry[];mine?:{points:number;durationMs:number}|null;saved?:boolean};
export function setupTetrisVersionedRanking(defaultScope:string){
 const root=document.querySelector<HTMLElement>('[data-tetris-v2-ranking]');
 if(!root)return {select:(_scope:string)=>{},finish:(_scope:string,_result:Result)=>{}};
 const status=root.querySelector<HTMLElement>('[data-tetris-v2-status]')!;
 const list=root.querySelector<HTMLOListElement>('ol')!;
 const own=root.querySelector<HTMLElement>('[data-tetris-v2-mine]')!;
 let scope=defaultScope,revision=0,pending:{scope:string;result:Result}|null=null;
 const endpoint=(s:string)=>'/api/tetris/rankings/'+encodeURIComponent(s);
 const format=(r:{points:number;durationMs:number})=>r.points+' pts · '+(r.durationMs/1000).toFixed(3)+' s';
 function render(data:Board){
  list.replaceChildren();own.textContent='';
  if(!data.available){status.textContent='Ranking v2 indisponível neste ambiente.';return;}
  status.textContent=data.top?.length?'Classificação v2 · resultados não verificados contra a partida.':'Ainda não há resultados v2.';
  for(const row of data.top??[]){const li=document.createElement('li');li.textContent=row.rank+'º · '+row.nickname+' · '+format(row);list.append(li);}
  if(data.mine)own.textContent='Seu recorde: '+format(data.mine);
 }
 async function refresh(){
  const v=++revision;list.replaceChildren();own.textContent='';status.textContent='Consultando ranking v2…';
  try{const response=await fetch(endpoint(scope),{cache:'no-store'});const data=await response.json() as Board;if(v===revision)render(data);}catch{if(v===revision)render({available:false});}
 }
 async function submit(){
  if(!pending)return;
  const item=pending;
  try{
   const response=await fetch(endpoint(item.scope),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item.result)});
   if(pending!==item)return;
   if(response.status===401){status.textContent='Entre na sua conta para registrar o resultado v2.';return;}
   const data=await response.json() as Board;
   pending=null;
   if(response.ok&&data.saved)document.dispatchEvent(new CustomEvent('oldarcade:tetris-v2-saved'));
   if(scope===item.scope){if(response.ok&&data.saved){++revision;render(data);}else status.textContent='Registro v2 não confirmado.';}
  }catch{if(pending===item){pending=null;status.textContent='Registro v2 não confirmado.';}}
 }
 document.addEventListener('oldarcade:account-changed',e=>{
  const player=(e as CustomEvent<{player?:unknown}>).detail?.player;
  own.textContent='';void refresh();if(player)void submit();else pending=null;
 });
 void refresh();
 return {select(next:string){if(!tetrisScopes.includes(next)||next===scope)return;scope=next;pending=null;void refresh();},finish(next:string,result:Result){if(next!==scope)return;pending={scope:next,result};void submit();}};
}
