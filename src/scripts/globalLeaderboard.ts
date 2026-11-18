type Entry={nickname:string;score:number;place?:number;rank?:number;achievedAt?:string;durationMs?:number|null};
type Board={available:boolean;top?:Entry[];mine?:Entry|null;myGames?:{game:string;score:number}[];serverNow?:string;verified?:boolean;registeredOnly?:boolean};
function formatDuration(ms?:number|null){if(ms==null)return 'Tempo anterior indisponível';const sec=Math.floor(ms/1000);return Math.floor(sec/60)+'m '+String(sec%60).padStart(2,'0')+'s'}
function localDate(iso?:string){
 if(!iso)return 'Data indisponível';
 const dt=new Date(iso);if(Number.isNaN(dt.getTime()))return 'Data indisponível';
 return new Intl.DateTimeFormat('pt-BR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(dt);
}
export function setupGlobalLeaderboard(game='snake'){
 const body=document.querySelector<HTMLElement>('#global-rank-body')!;
 const status=document.querySelector<HTMLElement>('#global-rank-status')!;
 const best=document.querySelector<HTMLElement>('#global-best')!;
 const challenge=document.querySelector<HTMLElement>('#challenge-text')!;
 const endpoint='/api/games/'+encodeURIComponent(game)+'/leaderboard';
 let lastGlobalScore:number|null=null;
 let loadedGlobal=false;
 let loading=false;
 let queuedRefresh=false;
 let latestBoard:Board|null=null;
 let roundStartBoard:Board|null=null;
 const myResult=document.querySelector<HTMLElement>('#my-global-rank')!;
 const myPosition=document.querySelector<HTMLElement>('#my-global-position')!;
 const myDetail=document.querySelector<HTMLElement>('#my-global-detail')!;
 function drawMine(mine?:Entry|null){
  myResult.hidden=!mine;
  if(!mine){myPosition.textContent='—';myDetail.textContent='';return}
  myPosition.textContent=(mine.rank||'—')+'º lugar';
  myDetail.textContent=mine.nickname+' · '+mine.score+' pontos · '+formatDuration(mine.durationMs)+' · '+localDate(mine.achievedAt);
 }
 function draw(data:Board,source:'initial'|'end'|'submit'='initial'){
  if(data.available)latestBoard=data;
  body.replaceChildren();
  drawMine(data.mine);
  if(data.available)document.dispatchEvent(new CustomEvent('oldarcade:player-game-records',{detail:{records:data.myGames||[]}}));
  const globalScore=data.available&&data.top?.length?data.top[0].score:null;
  if(data.available){
   const previousScore=lastGlobalScore;
   const changed=loadedGlobal&&globalScore!==previousScore;
   lastGlobalScore=globalScore;loadedGlobal=true;
   document.dispatchEvent(new CustomEvent('oldarcade:global-record',{detail:{score:globalScore,previousScore,changed,source}}));
  }
  const personal=data.mine?.score??data.myGames?.find(item=>item.game===game)?.score??null;
  document.dispatchEvent(new CustomEvent('oldarcade:personal-record',{detail:{score:personal,available:data.available}}));
  if(!data.available||!Array.isArray(data.top)){
   best.textContent='—';status.textContent='Ranking global indisponível neste ambiente.';
   challenge.textContent='Bata seu recorde e desafie os melhores jogadores.';return;
  }
  best.textContent=data.top.length?String(data.top[0].score):'—';
  challenge.textContent=data.top.length?'Bata seu recorde ou os '+data.top[0].score+' pontos do líder global!':'Seja o primeiro a registrar um recorde global com conta!';
  status.textContent='Empate: vence o menor tempo jogado. Registros antigos sem tempo ficam atrás dos cronometrados. Pontuações ainda não verificadas contra a partida.';
  if(!data.top.length){
   const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=4;
   cell.textContent='Nenhum recorde de conta registrado. Seja o primeiro!';row.append(cell);body.append(row);return;
  }
  let lastScore:number|undefined,place=0;
  data.top.slice(0,10).forEach((item)=>{
   if(item.score!==lastScore){place++;lastScore=item.score}
   const level=item.rank||place;
   const row=document.createElement('tr');
   row.className=level<=3?'leaderboard-podium podium-'+level:'';
   const pos=document.createElement('td');
   pos.className='leaderboard-position';
   const icon=level===1?'🥇':level===2?'🥈':level===3?'🥉':'';
   pos.textContent=icon+' '+level+'º';
   const nick=document.createElement('td');nick.textContent=item.nickname;
   const score=document.createElement('td');score.textContent=String(item.score);
   const date=document.createElement('td');date.textContent=formatDuration(item.durationMs)+' · '+localDate(item.achievedAt);
   date.className='leaderboard-timestamp';
   row.append(pos,nick,score,date);body.append(row);
  });
 }
 function markRoundStart(){roundStartBoard=latestBoard}
 function relativeElapsed(now:string|undefined,when:string|undefined){
  if(!now||!when)return '';
  const seconds=Math.max(0,Math.floor((Date.parse(now)-Date.parse(when))/1000));
  if(!Number.isFinite(seconds))return '';
  if(seconds<60)return 'há '+seconds+' segundo'+(seconds===1?'':'s');
  if(seconds<3600){const mins=Math.floor(seconds/60);return 'há '+mins+' minuto'+(mins===1?'':'s')}
  const hours=Math.floor(seconds/3600);return 'há '+hours+' hora'+(hours===1?'':'s');
 }
 function summary(current:Board){
  if(!current.available)return 'Não foi possível consultar a classificação.';
  const previous=roundStartBoard;
  const top=current.top?.[0],oldTop=previous?.top?.[0];
  if(top&&previous&&(!oldTop||top.score>oldTop.score)){
   const age=relativeElapsed(current.serverNow,top.achievedAt);
   return top.nickname+' assumiu a liderança com '+top.score+' pontos'+(age?' '+age:'')+'.';
  }
  const wasRank=previous?.mine?.rank,nowRank=current.mine?.rank;
  if(wasRank&&nowRank&&nowRank>wasRank&&previous?.mine?.score===current.mine?.score){
   const n=nowRank-wasRank;
   return 'Você caiu '+n+' posição'+(n===1?'':'ões')+' no ranking: agora está em '+nowRank+'º.';
  }
  if(top)return 'Líder atual: '+top.nickname+', '+top.score+' pontos.';
  return 'Ainda não há recordes de contas cadastradas.';
 }
 async function refresh(source:'initial'|'end'='initial'):Promise<Board|null>{
  if(loading){queuedRefresh=true;return null}
  loading=true;
  try{
   const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error('API indisponível');
   const data=await r.json() as Board;
   draw(data,source);return data;
  }catch{if(!loadedGlobal)draw({available:false});return null}
  finally{
   loading=false;
   if(queuedRefresh){queuedRefresh=false;void refresh('initial')}
  }
 }
 async function submit(score:number,durationMs:number):Promise<Board>{
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score,durationMs})});
  const data=await r.json() as Board&{error?:string};
  if(!r.ok||!data.available)throw Error(data.error||'Não foi possível registrar');
  draw(data,'submit');return data;
 }
 function snapshot():Board|null{return latestBoard}
 void refresh();return {refresh,submit,markRoundStart,summary,elapsed:relativeElapsed,snapshot};
}
