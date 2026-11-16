type Entry={nickname:string;score:number;place?:number;rank?:number;achievedAt?:string};
type Board={available:boolean;top?:Entry[];mine?:Entry|null;verified?:boolean;registeredOnly?:boolean};
function localDate(iso?:string){
 if(!iso)return 'Data indisponível';
 const dt=new Date(iso);if(Number.isNaN(dt.getTime()))return 'Data indisponível';
 return new Intl.DateTimeFormat('pt-BR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(dt);
}
export function setupGlobalLeaderboard(){
 const body=document.querySelector<HTMLElement>('#global-rank-body')!;
 const status=document.querySelector<HTMLElement>('#global-rank-status')!;
 const best=document.querySelector<HTMLElement>('#global-best')!;
 const challenge=document.querySelector<HTMLElement>('#challenge-text')!;
 const endpoint='/api/games/snake/leaderboard';
 let lastGlobalScore:number|null=null;
 let loadedGlobal=false;
 let loading=false;
 let lastPersonalRank:number|null=null;
 let loadedPersonalRank=false;
 const myResult=document.querySelector<HTMLElement>('#my-global-rank')!;
 const myPosition=document.querySelector<HTMLElement>('#my-global-position')!;
 const myDetail=document.querySelector<HTMLElement>('#my-global-detail')!;
 function drawMine(mine?:Entry|null){
  myResult.hidden=!mine;
  if(!mine){myPosition.textContent='—';myDetail.textContent='';return}
  myPosition.textContent=(mine.rank||'—')+'º lugar';
  myDetail.textContent=mine.nickname+' · '+mine.score+' pontos · '+localDate(mine.achievedAt);
 }
 function draw(data:Board,source:'initial'|'poll'|'submit'='initial'){
  body.replaceChildren();
  drawMine(data.mine);
  if(data.available){
   const rank=data.mine?.rank??null;
   if(source==='poll'&&loadedPersonalRank&&rank!==null&&lastPersonalRank!==null&&rank>lastPersonalRank){
    document.dispatchEvent(new CustomEvent('oldarcade:rank-change',{detail:{rank,previousRank:lastPersonalRank}}));
   }
   lastPersonalRank=rank;loadedPersonalRank=true;
  }
  const globalScore=data.available&&data.top?.length?data.top[0].score:null;
  if(data.available){
   const previousScore=lastGlobalScore;
   const changed=loadedGlobal&&globalScore!==previousScore;
   lastGlobalScore=globalScore;loadedGlobal=true;
   document.dispatchEvent(new CustomEvent('oldarcade:global-record',{detail:{score:globalScore,previousScore,changed,source}}));
  }
  document.dispatchEvent(new CustomEvent('oldarcade:personal-record',{detail:{score:data.mine?.score||0}}));
  if(!data.available||!Array.isArray(data.top)){
   best.textContent='—';status.textContent='Ranking global indisponível neste ambiente.';
   challenge.textContent='Bata seu recorde e desafie os melhores jogadores.';return;
  }
  best.textContent=data.top.length?String(data.top[0].score):'—';
  challenge.textContent=data.top.length?'Bata seu recorde ou os '+data.top[0].score+' pontos do líder global!':'Seja o primeiro a registrar um recorde global com conta!';
  status.textContent='Cada jogador ocupa uma posição. Em empate, vence quem chegou antes. Horário local. Pontuações ainda não verificadas contra a partida.';
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
   const date=document.createElement('td');date.textContent=localDate(item.achievedAt);
   date.className='leaderboard-timestamp';
   row.append(pos,nick,score,date);body.append(row);
  });
 }
 async function refresh(source:'initial'|'poll'='initial'){
  if(loading)return;
  loading=true;
  try{
   const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error('API indisponível');
   draw(await r.json() as Board,source);
  }catch{if(!loadedGlobal)draw({available:false})}
  finally{loading=false}
 }
 async function submit(score:number){
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score})});
  const data=await r.json() as Board&{error?:string};
  if(!r.ok||!data.available)throw Error(data.error||'Não foi possível registrar');
  draw(data,'submit');
 }
 void refresh();return {refresh,submit};
}
