type RankEntry={nickname:string;score:number;rank?:number;achievedAt?:string};
type RankData={available:boolean;top?:RankEntry[]};
document.querySelectorAll<HTMLElement>('[data-rank-page-mode]').forEach(section=>{
 const game=section.dataset.rankPageMode||'';
 const get=<T extends Element>(s:string)=>section.querySelector<T>('[data-rank-'+s+']')!;
 const podium=get<HTMLElement>('podium'),table=get<HTMLTableSectionElement>('table'),status=get<HTMLElement>('status');
 const leaderName=get<HTMLElement>('leader-name'),leaderScore=get<HTMLElement>('leader-score'),challengeMessage=get<HTMLElement>('challenge-message');
 const date=(iso?:string)=>{
  const d=new Date(iso||'');return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d);
 };
 function cell(row:HTMLTableRowElement,value:string){const td=document.createElement('td');td.textContent=value;row.append(td)}
 function render(data:RankData){
  if(!data.available||!Array.isArray(data.top)){status.textContent='Ranking indisponível neste ambiente.';podium.textContent='Classificação indisponível.';table.replaceChildren();return}
  podium.replaceChildren();table.replaceChildren();
  const entries=data.top.slice(0,10);
  const leader=entries[0];
  if(leader){
   leaderName.textContent=leader.nickname;leaderScore.textContent=leader.score.toLocaleString('pt-BR')+' pontos';
   challengeMessage.textContent='A marca a superar é '+leader.score.toLocaleString('pt-BR')+' pontos. Você aceita o desafio?';
  }else{
   leaderName.textContent='Seja o primeiro!';leaderScore.textContent='Sem recorde registrado';
   challengeMessage.textContent='O primeiro lugar ainda está aberto. Entre no jogo e tente conquistá-lo.';
  }
  const medals=['🥇','🥈','🥉'];
  for(const [index,entry] of entries.slice(0,3).entries()){
   const card=document.createElement('article');card.className='rankings-podium-card podium-'+(index+1);
   const icon=document.createElement('span');icon.textContent=medals[index];
   const nickname=document.createElement('strong');nickname.textContent=entry.nickname;
   const score=document.createElement('span');score.textContent=entry.score.toLocaleString('pt-BR')+' pontos';
   card.append(icon,nickname,score);podium.append(card);
  }
  if(!entries.length){const empty=document.createElement('p');empty.className='small muted';empty.textContent='Ainda não há jogadores classificados.';podium.append(empty)}
  for(const [index,entry] of entries.entries()){
   const row=document.createElement('tr');
   for(const v of [(entry.rank??index+1)+'º',entry.nickname,entry.score.toLocaleString('pt-BR'),date(entry.achievedAt)])cell(row,v);
   table.append(row);
  }
  if(!entries.length){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Nenhum recorde registrado.';row.append(td);table.append(row)}
  status.textContent='Ranking real da conta · melhor pontuação por jogador · empate por ordem de registro.';
 }
 void(async()=>{
  try{
   const res=await fetch('/api/games/'+encodeURIComponent(game)+'/leaderboard',{cache:'no-store'});
   if(!res.ok)throw Error('Indisponível');
   render(await res.json() as RankData);
  }catch{render({available:false})}
 })();
});
