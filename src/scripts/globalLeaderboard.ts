type Board={available:boolean;top?:{nickname:string;score:number}[];verified?:boolean};
export function setupGlobalLeaderboard(){
 const body=document.querySelector<HTMLElement>('#global-rank-body')!;
 const status=document.querySelector<HTMLElement>('#global-rank-status')!;
 const best=document.querySelector<HTMLElement>('#global-best')!;
 const challenge=document.querySelector<HTMLElement>('#challenge-text')!;
 const endpoint='/api/games/snake/leaderboard';
 const key='oldarcade:snake:player-id';
 let playerId:string;
 try{playerId=localStorage.getItem(key)||crypto.randomUUID();localStorage.setItem(key,playerId)}
 catch{playerId=crypto.randomUUID()}
 function draw(data:Board){
  body.replaceChildren();
  if(!data.available||!Array.isArray(data.top)){
   best.textContent='—';status.textContent='Ranking global indisponível neste ambiente.';
   challenge.textContent='Bata seu recorde e desafie os melhores jogadores.';
   return;
  }
  best.textContent=data.top.length?String(data.top[0].score):'—';
  challenge.textContent=data.top.length?'Bata seu recorde ou os '+data.top[0].score+' pontos do líder global!':'Seja o primeiro a registrar um recorde global!';
  status.textContent='Ranking recreativo: pontuações declaradas, ainda não verificadas.';
  if(!data.top.length){
   const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='Nenhum recorde registrado. Seja o primeiro!';row.append(cell);body.append(row);
  }
  data.top.slice(0,10).forEach((item,i)=>{
   const row=document.createElement('tr');
   [String(i+1),item.nickname,String(item.score)].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell)});
   body.append(row);
  });
 }
 async function refresh(){
  try{const r=await fetch(endpoint);if(!r.ok)throw Error('API indisponível');draw(await r.json() as Board)}
  catch{draw({available:false})}
 }
 async function submit(nickname:string,score:number){
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({playerId,nickname,score})});
  const data=await r.json() as Board&{error?:string};
  if(!r.ok||!data.available)throw Error(data.error||'Não foi possível registrar');
  draw(data);
 }
 void refresh();
 return {refresh,submit};
}
