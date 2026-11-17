type Entry={nickname:string;score:number;rank?:number;achievedAt?:string};
type Board={available:boolean;top?:Entry[];mine?:Entry|null;error?:string;saved?:boolean;code?:string};
type Result={game:string;score:number};
const root=document.querySelector<HTMLElement>('[data-mode-ranking]');
if(root){
 const game=root.dataset.game||'',endpoint='/api/games/'+encodeURIComponent(game)+'/leaderboard';
 const get=<T extends Element>(s:string)=>root.querySelector<T>('[data-rank-'+s+']')!;
 const body=get<HTMLTableSectionElement>('body'),global=get<HTMLElement>('global'),personal=get<HTMLElement>('personal'),provisional=get<HTMLElement>('provisional');
 const status=get<HTMLElement>('status'),summary=get<HTMLElement>('summary'),mine=get<HTMLElement>('mine');
 const authButton=get<HTMLButtonElement>('auth-button'),modal=get<HTMLElement>('modal'),hint=get<HTMLElement>('hint');
 const login=get<HTMLFormElement>('login-form'),register=get<HTMLFormElement>('register-form'),authStatus=get<HTMLElement>('auth-status');
 const recovery=get<HTMLElement>('recovery'),recoveryCode=get<HTMLElement>('code');
 let top:number|null=null,score=0,played=false,provisionalRecord=false,account:string|null=null;
 let pendingScore:number|null=null,round=0,roundPersonal=0,personalCelebrated=false;
 const celebrate=(kind:'personal'|'mission'|'podium'|'leader'|'rival',message:string)=>document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game,kind,message}}));
 const retry=get<HTMLButtonElement>('retry');
 function setPending(points:number){pendingScore=points;retry.hidden=false;retry.textContent='Tentar registrar '+points+' pontos novamente'}
 function clearPending(){pendingScore=null;retry.hidden=true}
 const fmt=(iso?:string)=>iso&&Number.isFinite(Date.parse(iso))?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium'}).format(new Date(iso)):'—';
 function render(data:Board){
  if(!data.available){status.textContent='Ranking indisponível neste ambiente.';return}
  top=data.top?.[0]?.score??null;
  global.textContent=String(provisionalRecord?score:top??'—');
  if(!provisionalRecord)provisional.hidden=true;
  personal.textContent=data.mine?String(data.mine.score):'—';
  if(!played)roundPersonal=data.mine?.score??0;
  mine.hidden=!data.mine;
  if(data.mine)mine.textContent='Sua posição: '+data.mine.rank+'º · '+data.mine.nickname+' · '+data.mine.score+' pontos';
  body.replaceChildren();
  if(!data.top?.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Nenhum recorde de conta registrado. Seja o primeiro!';tr.append(td);body.append(tr)}
  else data.top.slice(0,10).forEach((e,i)=>{
   const tr=document.createElement('tr'),position=e.rank||i+1;
   tr.className=position<=3?'leaderboard-podium podium-'+position:'';
   for(const value of [(position===1?'🥇 ':position===2?'🥈 ':position===3?'🥉 ':'')+position+'º',e.nickname,String(e.score),fmt(e.achievedAt)]){
    const td=document.createElement('td');td.textContent=value;tr.append(td)
   }body.append(tr);
  });
  status.textContent='Em empate, vence quem registrou primeiro. Horário local. Pontuações ainda não verificadas contra a partida.';
  document.dispatchEvent(new CustomEvent('oldarcade:mode-ranking-updated',{detail:{game,global:top,personal:data.mine?.score||0}}));
 }
 async function refresh(){
  try{const r=await fetch(endpoint,{cache:'no-store'});if(!r.ok)throw Error('Indisponível');const data=await r.json() as Board;render(data);return data}
  catch{status.textContent='Ranking indisponível neste ambiente.';return null}
 }
 async function submit(points:number){
  const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:points})});
  const data=await r.json() as Board;
  if(!r.ok||!data.available){if(data.saved){const updated=await refresh();if(updated?.available){render(updated);return updated}throw Error('Gravação aceita pelo banco, mas o ranking ainda não pôde ser consultado. Não reenvie a pontuação.')}throw Error(data.error||'Não foi possível registrar')}
  render(data);return data;
 }
 function celebrateFinal(data:Board,points:number){
  if(!data.available||!data.mine)return;
  const leader=data.top?.[0];
  if(data.mine.rank===1&&leader?.nickname===data.mine.nickname){celebrate('leader','Liderança confirmada! Agora é defender o topo.');return}
  if(data.mine.rank<=3){celebrate('podium','Você está entre os três melhores!');return}
  if(leader&&leader.score>points&&provisionalRecord){celebrate('rival','Sua liderança foi provisória! '+leader.nickname+' já está na frente. Vai deixar assim?')}
 }
 function announce(data:Board,points:number){
  const leader=data.top?.[0];
  if(!leader)return 'Nenhum líder registrado.';
  if(data.mine?.rank===1&&data.mine.score>=points)return '🏆 Novo campeão! Sua liderança foi confirmada com '+data.mine.score+' pontos.';
  if(leader.score>points)return '⚡ '+leader.nickname+' lidera com '+leader.score+' pontos. Faltaram '+(leader.score-points)+' pontos para alcançar a liderança. Tente novamente!';
  if(leader.score===points)return 'Empate! '+leader.nickname+' registrou primeiro.';
  return 'Líder atual: '+leader.nickname+' · '+leader.score+' pontos.';
 }
 const close=()=>{modal.hidden=true;authButton.focus({preventScroll:true})};
 const open=()=>{if(account)return;modal.hidden=false;hint.textContent=played?'Você marcou '+score+' pontos. Conecte-se para registrar esse resultado.':'Entre ou crie uma conta para disputar o ranking.';login.querySelector<HTMLInputElement>('input')?.focus({preventScroll:true})};
 authButton.addEventListener('click',open);
 get<HTMLButtonElement>('close').addEventListener('click',close);
 const toggle=(kind:'login'|'register')=>{login.hidden=kind!=='login';register.hidden=kind!=='register';(kind==='login'?login:register).querySelector<HTMLInputElement>('input')?.focus()};
 get<HTMLButtonElement>('login-tab').addEventListener('click',()=>toggle('login'));
 get<HTMLButtonElement>('register-tab').addEventListener('click',()=>toggle('register'));
 get<HTMLButtonElement>('done').addEventListener('click',()=>{recovery.hidden=true;close()});
 async function accountCheck(){
  try{const r=await fetch('/api/auth/me',{cache:'no-store'});if(!r.ok)return;const data=await r.json() as {player?:{nickname:string}|null};if(data.player)connect(data.player.nickname)}
  catch{}
 }
 function connect(name:string){account=name;authButton.textContent='Conectado como '+name;authButton.disabled=true}
 for(const [kind,form] of [['login',login],['register',register]] as const){
  form.addEventListener('submit',async e=>{
   e.preventDefault();const btn=form.querySelector<HTMLButtonElement>('button[type=submit]')!;btn.disabled=true;
   authStatus.textContent='Autenticando…';const formData=new FormData(form);
   const fields=Object.fromEntries(formData.entries());
   if(kind==='register')Object.assign(fields,{recordEmailOptIn:false});
   try{
    const r=await fetch('/api/auth/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
    const data=await r.json() as {player?:{nickname:string};error?:string;recoveryCode?:string};
    if(!r.ok||!data.player)throw Error(data.error||'Falha no acesso');
    connect(data.player.nickname);
    document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:data.player}}));
    if(played){try{const result=await submit(score);clearPending();summary.textContent=announce(result,score);celebrateFinal(result,score)}catch(err){setPending(score);summary.textContent='Seus '+score+' pontos estão preservados nesta página. '+(err instanceof Error?err.message:'Falha ao registrar')+'. Tente novamente.';throw err}}
    authStatus.textContent=played?'Resultado registrado.':'Conta conectada.';
    if(data.recoveryCode){get<HTMLElement>('code').textContent=data.recoveryCode;recovery.hidden=false}else close();
   }catch(err){authStatus.textContent=err instanceof Error?err.message:'Falha no acesso'}
   finally{btn.disabled=false}
  });
 }
 document.addEventListener('oldarcade:game-started',event=>{
  const d=(event as CustomEvent<{game:string}>).detail;if(d?.game!==game)return;
  round++;played=false;score=0;personalCelebrated=false;provisionalRecord=false;clearPending();summary.textContent='';provisional.hidden=true;global.textContent=String(top??'—');
 });
 document.addEventListener('oldarcade:game-score',event=>{
  const d=(event as CustomEvent<Result>).detail;
  if(d?.game!==game||!Number.isFinite(d.score)||Math.abs(d.score*1000-Math.round(d.score*1000))>1e-7)return;score=d.score;
  if(!personalCelebrated&&score>roundPersonal){personalCelebrated=true;celebrate('personal','Você superou sua melhor marca! Continue assim.')}
  if(top!==null&&score>top){
   global.textContent=String(score);provisional.hidden=false;
   if(!provisionalRecord){provisionalRecord=true;document.dispatchEvent(new CustomEvent('oldarcade:mode-record-provisional',{detail:{game,score}}))}
  }else if(provisionalRecord){provisionalRecord=false;provisional.hidden=true;global.textContent=String(top??'—')}
 });
 async function finishResult(points:number,sequence:number){
  await accountPromise;
  if(sequence!==round)return;
  if(account){
   try{const data=await submit(points);if(sequence!==round)return;clearPending();summary.textContent=announce(data,points);celebrateFinal(data,points)}
   catch(err){if(sequence!==round)return;const message=err instanceof Error?err.message:'erro desconhecido';if(message.includes('Não reenvie')){clearPending()}else{setPending(points)}summary.textContent='Seus '+points+' pontos foram preservados nesta página. Não foi possível confirmar o registro: '+message}
  }else{
   const data=await refresh();if(sequence!==round)return;
   summary.textContent=data?'Você marcou '+points+' pontos. '+announce(data,points)+' Faça login para registrar o resultado.':'Você marcou '+points+' pontos. Ranking indisponível; resultado não registrado.';
   open();
  }
  provisionalRecord=false;provisional.hidden=true;global.textContent=String(top??'—');
 }
 retry.addEventListener('click',async()=>{
  if(pendingScore===null)return;
  const points=pendingScore;retry.disabled=true;retry.textContent='Registrando…';
  try{
   const data=await submit(points);clearPending();summary.textContent=announce(data,points);celebrateFinal(data,points)
  }catch(err){setPending(points);summary.textContent='Registro ainda pendente: '+(err instanceof Error?err.message:'erro desconhecido')}
  finally{retry.disabled=false}
 });
 document.addEventListener('oldarcade:game-finished',event=>{
  const d=(event as CustomEvent<Result>).detail;if(d?.game!==game)return;
  score=d.score;played=true;
  void finishResult(score,round);
 });
 const accountPromise=accountCheck();void refresh();
}
