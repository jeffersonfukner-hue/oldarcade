import { setupGlobalLeaderboard } from './globalLeaderboard';
import {centerGameBoard} from './gameViewport';
import { setupGlobalGameCounters } from './globalGameCounters';
type Direction = 'up'|'down'|'left'|'right';
type Point = {x:number;y:number};
type Score = {name:string;score:number;at:number};
const canvas = document.querySelector<HTMLCanvasElement>('#snake-canvas')!;
const ctx = canvas.getContext('2d')!;
const overlay = document.querySelector<HTMLElement>('#game-overlay')!;
const title = document.querySelector<HTMLElement>('#overlay-title')!;
const overlayText = document.querySelector<HTMLElement>('#overlay-text')!;
const startBtn = document.querySelector<HTMLButtonElement>('#start-btn')!;
const pauseBtn = document.querySelector<HTMLButtonElement>('#pause-btn')!;
const fullscreenBtn = document.querySelector<HTMLButtonElement>('#fullscreen-btn')!;
const stage = document.querySelector<HTMLElement>('#game-stage')!;
const gameScreen = document.querySelector<HTMLElement>('#game-screen')!;
const hud = document.querySelector<HTMLElement>('#hud-status')!;
const countValue = document.querySelector<HTMLElement>('#countdown-value')!;
const globalCounters=setupGlobalGameCounters('snake');
const leaderboard=setupGlobalLeaderboard();
const recordModal=document.querySelector<HTMLElement>('#record-modal')!;
const registerForm=document.querySelector<HTMLFormElement>('#record-register')!;
const loginForm=document.querySelector<HTMLFormElement>('#record-login')!;
const recordTabs=document.querySelector<HTMLElement>('#record-auth-tabs')!;
const recordSigned=document.querySelector<HTMLElement>('#record-signed')!;
const recoveryPanel=document.querySelector<HTMLElement>('#record-recovery')!;
let account:{nickname:string}|null=null;
let personalCloudBest=0;
let accountGameRecords:{game:string;score:number}[]=[];
function drawAccountResults(){
 const signed=Boolean(account);
 const local=document.querySelector<HTMLElement>('#local-results')!;
 const cloud=document.querySelector<HTMLElement>('#account-results')!;
 local.hidden=signed;cloud.hidden=!signed;
 text('results-heading',signed?'Meus recordes por jogo':'Ranking local');
 text('results-scope',signed?'Minha conta':'Neste navegador');
 if(!signed)return;
 const scores=new Map(accountGameRecords.map(item=>[item.game,item.score]));
 cloud.querySelectorAll<HTMLElement>('[data-player-game]').forEach(row=>{
  const game=row.dataset.playerGame||'';
  const points=scores.get(game);
  const haveScore=typeof points==='number'&&Number.isFinite(points);
  row.querySelector<HTMLElement>('[data-record-score]')!.textContent=haveScore?points.toLocaleString('pt-BR')+' pontos':'Sem recorde';
  row.querySelector<HTMLElement>('[data-record-action]')!.textContent=haveScore?'Superar meu recorde':'Jogar pela primeira vez';
 });
}

let globalBest:number|null=null;
let globalKnown=false;
let provisionalGlobal=false;
let roundBeatGlobal=false;
let recoveryCode='';
let roundPersonalTarget=0;
let didCelebratePersonal=false;
const alertNode=document.querySelector<HTMLElement>('#record-live-alert')!;
let alertTimeout:number|undefined;
let currentAlertPriority=0;
function announceRecord(message:string,type:'personal'|'global'|'rival'){
 const priority=type==='global'?3:type==='rival'?2:1;
 if(!alertNode.hidden&&priority<currentAlertPriority)return;
 window.clearTimeout(alertTimeout);
 currentAlertPriority=priority;
 alertNode.textContent=message;
 alertNode.dataset.kind=type;
 alertNode.hidden=false;
 alertTimeout=window.setTimeout(()=>{alertNode.hidden=true;alertNode.textContent='';currentAlertPriority=0},3600);
}
const celebrationLayer=document.querySelector<HTMLElement>('#record-celebration-layer')!;
let celebrationTokens:number[]=[];
function celebrate(kind:'personal'|'global'){
 const boardClass='celebrate-'+kind;
 gameScreen.classList.remove(boardClass);
 const target=document.querySelector<HTMLElement>(kind==='global'?'#hud-global-best':'#hud-best')!;
 target.classList.remove(boardClass);
 // Reinicia a animação mesmo em partidas consecutivas.
 void gameScreen.offsetWidth;
 gameScreen.classList.add(boardClass);target.classList.add(boardClass);
 const duration=kind==='global'?2200:1600;
 const timeout=window.setTimeout(()=>{
  gameScreen.classList.remove(boardClass);target.classList.remove(boardClass);
 },duration);
 celebrationTokens.push(timeout);
 // Efeito exclusivamente visual, sem requests, com modo de movimento reduzido respeitado.
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const count=kind==='global'?22:11;
 for(let i=0;i<count;i++){
  const spark=document.createElement('i');
  spark.className='record-spark '+kind;
  spark.style.setProperty('--x',(12+Math.random()*76).toFixed(1)+'%');
  spark.style.setProperty('--y',(14+Math.random()*50).toFixed(1)+'%');
  spark.style.setProperty('--dx',((Math.random()-.5)*170).toFixed(0)+'px');
  spark.style.setProperty('--dy',(-35-Math.random()*100).toFixed(0)+'px');
  spark.style.setProperty('--delay',Math.round(Math.random()*340)+'ms');
  celebrationLayer.append(spark);
  spark.addEventListener('animationend',()=>spark.remove(),{once:true});
  celebrationTokens.push(window.setTimeout(()=>spark.remove(),duration+300));
 }
}
function resetCelebrations(){
 celebrationTokens.forEach(t=>window.clearTimeout(t));celebrationTokens=[];
 celebrationLayer.replaceChildren();
 gameScreen.classList.remove('celebrate-personal','celebrate-global');
 document.querySelector('#hud-best')?.classList.remove('celebrate-personal');
 document.querySelector('#hud-global-best')?.classList.remove('celebrate-global');
}
function resetAnnouncements(){window.clearTimeout(alertTimeout);alertNode.hidden=true;alertNode.textContent='';currentAlertPriority=0}
const recordStatus=document.querySelector<HTMLElement>('#record-modal-status')!;
let modalOpen=false;
const size=20, cell=canvas.width/size;
const key='oldarcade:snake:v1';
type Saved={best:number;plays:number;visits:number;nickname:string;scores:Score[];lastVisit:string};
function read():Saved {try{const raw=JSON.parse(localStorage.getItem(key)||'{}');return {best:Number(raw.best)||0,plays:Number(raw.plays)||0,visits:Number(raw.visits)||0,nickname:String(raw.nickname||'').slice(0,18),scores:Array.isArray(raw.scores)?raw.scores.filter((entry:Score)=>entry&&typeof entry.name==='string'&&entry.name.trim()&&entry.name!=='Anônimo'&&Number.isFinite(entry.score)).slice(0,20):[],lastVisit:String(raw.lastVisit||'')}}catch{return {best:0,plays:0,visits:0,nickname:'',scores:[],lastVisit:''}}}
let saved=read();
const sessionKey=key+':session';
try{if(!sessionStorage.getItem(sessionKey)){saved.visits++;sessionStorage.setItem(sessionKey,'1')}}catch{saved.visits++}
function store(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}}
store();
let snake:Point[]=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];
let direction:Direction='right',next:Direction='right',food:Point={x:14,y:10},score=0;
let state:'ready'|'playing'|'paused'|'countdown'|'over'='ready',timer:number|undefined;
let countdownTimer:number|undefined;
let changingFullscreen=false;
let fallbackFullscreen=false;
let wasNativeFullscreen=false;
const floatLayer=document.querySelector<HTMLElement>('#score-float-layer')!;
function setStatus(value:string){hud.textContent='● '+value}
function text(id:string,value:string){const el=document.getElementById(id);if(el)el.textContent=value}
function refresh(){const best=Math.max(saved.best,personalCloudBest);
 const shownGlobal=provisionalGlobal?score:globalBest;
 text('hud-global-best',shownGlobal===null?'—':String(shownGlobal));
 text('global-best',shownGlobal===null?'—':String(shownGlobal));
 text('hud-global-label',provisionalGlobal?'Recorde global (provisório):':'Recorde global:');
 text('global-best-label',provisionalGlobal?'Recorde global (provisório)':'Recorde global (contas)');text('score',String(score));text('best',String(best));text('hud-score',String(score));text('hud-best',String(best));text('plays',String(saved.plays));text('visits',String(saved.visits));const body=document.getElementById('rank-body')!;body.replaceChildren();if(!saved.scores.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='Salve um nickname e jogue uma partida para aparecer no ranking.';tr.append(td);body.append(tr)}else saved.scores.slice(0,10).forEach((entry,i)=>{const tr=document.createElement('tr');[String(i+1),entry.name,String(entry.score)].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td)});body.append(tr)})}
function draw(){ctx.fillStyle='#071a20';ctx.fillRect(0,0,600,600);ctx.strokeStyle='#122c32';ctx.lineWidth=1;for(let n=0;n<=size;n++){ctx.beginPath();ctx.moveTo(n*cell,0);ctx.lineTo(n*cell,600);ctx.moveTo(0,n*cell);ctx.lineTo(600,n*cell);ctx.stroke()}ctx.fillStyle='#ff657c';ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*.35,0,Math.PI*2);ctx.fill();snake.forEach((piece,i)=>{ctx.fillStyle=i===0?'#a0ffd0':'#46dca2';ctx.fillRect(piece.x*cell+2,piece.y*cell+2,cell-4,cell-4)});}
function floatPoints(at:Point,amount:number){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const board=canvas.getBoundingClientRect();
 const container=gameScreen.getBoundingClientRect();
 if(!board.width||!board.height)return;
 const item=document.createElement('span');
 item.className='score-float';
 item.textContent='+'+amount;
 item.style.left=(board.left-container.left+(at.x+.5)*(board.width/size))+'px';
 item.style.top=(board.top-container.top+(at.y+.5)*(board.height/size))+'px';
 floatLayer.append(item);
 item.addEventListener('animationend',()=>item.remove(),{once:true});
 window.setTimeout(()=>item.remove(),1100);
}
function placeFood(){const free:Point[]=[];for(let x=0;x<size;x++)for(let y=0;y<size;y++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});if(!free.length){end(true);return}food=free[Math.floor(Math.random()*free.length)]}
function schedule(){window.clearTimeout(timer);if(state==='playing')timer=window.setTimeout(tick,Math.max(75,155-Math.floor(score/50)*8))}
function tick(){if(state!=='playing')return;direction=next;const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=delta[direction];const head={x:snake[0].x+d.x,y:snake[0].y+d.y};const eating=head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);if(head.x<0||head.x>=size||head.y<0||head.y>=size||body.some(p=>p.x===head.x&&p.y===head.y)){end(false);return}snake.unshift(head);if(eating){score+=10;floatPoints(head,10);
 if(score>saved.best){saved.best=score;store()}
 if(!didCelebratePersonal&&score>roundPersonalTarget){
  didCelebratePersonal=true;
  celebrate('personal');
  announceRecord('🏅 Recorde pessoal superado!','personal');
 }
 if(globalKnown&&(globalBest===null||score>globalBest)&&!provisionalGlobal){
  provisionalGlobal=true;
  roundBeatGlobal=true;
  celebrate('global');
  announceRecord('🏆 Você superou a meta global! Liderança provisória.','global');
 }
 placeFood();if(state!=='playing'){draw();return}}else snake.pop();draw();refresh();schedule()}
function cancelCountdown(){window.clearTimeout(countdownTimer);countValue.hidden=true;startBtn.hidden=false}
function show(headline:string,description:string,button:string){cancelCountdown();title.textContent=headline;overlayText.textContent=description;startBtn.textContent=button;overlay.hidden=false}
function start(){cancelCountdown();window.clearTimeout(timer);snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];direction='right';next='right';score=0;food={x:14,y:10};roundPersonalTarget=Math.max(saved.best,personalCloudBest);
 didCelebratePersonal=false;provisionalGlobal=false;roundBeatGlobal=false;
 resetAnnouncements();resetCelebrations();text('record-end-summary','');leaderboard.markRoundStart();floatLayer.replaceChildren();saved.plays++;store();globalCounters.recordPlay();draw();refresh();centerGameAfterExit();beginCountdown('A partida começa em:')}
function end(won:boolean){
 state='over';setStatus(won?'Vitória':'Fim de jogo');window.clearTimeout(timer);
 if(score>saved.best)saved.best=score;
 if(saved.nickname.trim()){
  saved.scores.push({name:saved.nickname.trim(),score,at:Date.now()});
  saved.scores.sort((a,b)=>b.score-a.score||a.at-b.at);saved.scores=saved.scores.slice(0,20);
 }
 store();refresh();
 document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'snake',score}}));
 show(won?'Tabuleiro completo!':'Fim de jogo',`Você marcou ${score} pontos. Conferindo a classificação atual…`,'▶ Jogar novamente');
 void finishRound();
}
function confirmedResult(result:ReturnType<typeof leaderboard.snapshot>,submittedScore:number,wasProvisional:boolean){
 provisionalGlobal=false;
 refresh();
 if(!result||!result.available)return 'Não foi possível confirmar a classificação.';
 const leader=result.top?.[0];
 if(!leader)return 'Ainda não há líder registrado.';
 const mine=result.mine;
 if(mine?.rank===1&&mine.score===leader.score&&mine.nickname===leader.nickname){
  return wasProvisional&&leader.score===submittedScore
   ?'🏆 Novo recorde global confirmado! Você assumiu a liderança com '+leader.score+' pontos!'
   :'🏆 Você continua em 1º lugar com '+leader.score+' pontos.';
 }
 if(wasProvisional){
  const ago=leaderboard.elapsed(result.serverNow,leader.achievedAt);
  if(leader.score>submittedScore)return '⚡ Você fez '+submittedScore+' pontos, mas '+leader.nickname+' chegou a '+leader.score+(ago?' '+ago:'')+'. Continue tentando!';
  if(leader.score===submittedScore)return '⚡ Empate em '+submittedScore+' pontos! '+leader.nickname+' permanece à frente por ter registrado primeiro.';
 }
 return leaderboard.summary(result);
}

async function finishRound(){
 if(!account)await checkAccount();
 if(account){
  try{
   const wasProvisional=roundBeatGlobal;
   const result=await leaderboard.submit(score);
   text('overlay-text',confirmedResult(result,score,wasProvisional));
  }catch(error){
   provisionalGlobal=false;refresh();
   text('overlay-text',`Você marcou ${score} pontos, mas não foi possível confirmar o recorde: ${error instanceof Error?error.message:'erro de conexão'}.`);
  }
 }else{
  const wasProvisional=roundBeatGlobal;
  const result=await leaderboard.refresh('end');
  provisionalGlobal=false;refresh();
  if(result)text('overlay-text',wasProvisional?'Você superou a meta durante a partida, mas precisa cadastrar uma conta para registrar o resultado. '+leaderboard.summary(result):`Você marcou ${score} pontos. ${leaderboard.summary(result)}`);
  openRecordModal();
  if(result)text('record-end-summary',leaderboard.summary(result));
 }
}

function pause(){if(state==='playing'){state='paused';window.clearTimeout(timer);show('Jogo pausado','A partida está preservada.','▶ Continuar');setStatus('Pausado');pauseBtn.textContent='Continuar'}else if(state==='paused'){beginCountdown('A partida será retomada em:')}}
function turn(d:Direction){if(state!=='playing')return;const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};if(d!==opposite[direction])next=d}

function beginCountdown(description='A partida será retomada em:'){
 cancelCountdown();window.clearTimeout(timer);
 state='countdown';setStatus('Preparando');
 title.textContent='Prepare-se';overlayText.textContent=description;
 overlay.hidden=false;startBtn.hidden=true;countValue.hidden=false;
 let remaining=3;
 function step(){
  countValue.textContent=String(remaining);setStatus('Retomando em '+remaining);
  if(remaining===1){
   countdownTimer=window.setTimeout(()=>{countValue.hidden=true;startBtn.hidden=false;overlay.hidden=true;state='playing';setStatus('Jogando');pauseBtn.textContent='Pausar';schedule()},1000);
  }else{remaining--;countdownTimer=window.setTimeout(step,1000)}
 }
 step();
}
// Restaura o foco visual do tabuleiro quando o navegador sai da tela cheia.
function centerGameAfterExit(){
 centerGameBoard(gameScreen,stage,()=>fallbackFullscreen);
}
function fullActive(){return document.fullscreenElement===stage||fallbackFullscreen}
function updateFullButton(){
 fullscreenBtn.textContent=fullActive()?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
 fullscreenBtn.setAttribute('aria-label',fullActive()?'Sair da tela cheia do jogo':'Ativar tela cheia do jogo');
}
async function toggleFullscreen(){
 if(changingFullscreen)return;
 changingFullscreen=true;
 const resume=state==='playing'||state==='countdown';
 if(resume){cancelCountdown();state='paused';window.clearTimeout(timer);setStatus('Pausado')}
 try{
  if(document.fullscreenElement===stage)await document.exitFullscreen();
  else if(fallbackFullscreen){fallbackFullscreen=false;stage.classList.remove('game-stage-fallback');document.body.classList.remove('game-fallback-active')}
  else {
   try{await stage.requestFullscreen()}
   catch{fallbackFullscreen=true;stage.classList.add('game-stage-fallback');document.body.classList.add('game-fallback-active')}
  }
 }finally{
  changingFullscreen=false;wasNativeFullscreen=document.fullscreenElement===stage;updateFullButton();
  if(!fullActive())centerGameAfterExit();
  if(resume)beginCountdown();
 }
}

// Deslizamento no tabuleiro: sem rolagem da página nem zoom acidental.
// Não capturamos gestos na área de botões ou em outros elementos do site.
let gestureStart: {x:number;y:number}|null=null;
gameScreen.addEventListener('touchstart',event=>{
 if(event.touches.length!==1||state!=='playing'){gestureStart=null;return}
 gestureStart={x:event.touches[0].clientX,y:event.touches[0].clientY};
},{passive:true});
gameScreen.addEventListener('touchmove',event=>{
 if(gestureStart&&event.cancelable)event.preventDefault();
},{passive:false});
gameScreen.addEventListener('touchend',event=>{
 if(!gestureStart||state!=='playing'){gestureStart=null;return}
 const start=gestureStart;gestureStart=null;
 if(event.changedTouches.length!==1)return;
 const dx=event.changedTouches[0].clientX-start.x;
 const dy=event.changedTouches[0].clientY-start.y;
 if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
 turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
 if(event.cancelable)event.preventDefault();
},{passive:false});
gameScreen.addEventListener('touchcancel',()=>{gestureStart=null});

function setModalStatus(value:string){recordStatus.textContent=value}
function showAuth(which:'register'|'login'){
 const login=which==='login';
 registerForm.hidden=login;loginForm.hidden=!login;
 document.querySelector<HTMLButtonElement>('#record-tab-register')!.setAttribute('aria-pressed',String(!login));
 document.querySelector<HTMLButtonElement>('#record-tab-login')!.setAttribute('aria-pressed',String(login));
 setModalStatus('');
 if(modalOpen)document.querySelector<HTMLInputElement>(login?'#record-login-nick':'#record-register-nick')!.focus({preventScroll:true});
}
async function checkAccount(){
 try{
  const res=await fetch('/api/auth/me',{cache:'no-store'});
  if(!res.ok){account=null;drawAccountResults();return}
  const result=await res.json() as {player?:{nickname:string}|null};
  account=result.player||null;
  if(account)document.querySelector<HTMLElement>('#record-signed-nick')!.textContent=account.nickname;
  drawAccountResults();
 }catch{account=null;drawAccountResults()}
}
async function saveRecord(showModalOnError=true){
 try{
  const wasProvisional=roundBeatGlobal;
  const result=await leaderboard.submit(score);
  text('record-end-summary',confirmedResult(result,score,wasProvisional));
  if(account){saved.nickname=account.nickname;store();refresh()}
  if(modalOpen&&!recoveryCode)closeRecordModal();
 }catch(error){
  const message=error instanceof Error?error.message:'Não foi possível registrar.';
  if(showModalOnError&&!modalOpen)openRecordModal();
  if(modalOpen)setModalStatus(message);
 }
}
function openRecordModal(){
 recordTabs.hidden=!!account;registerForm.hidden=!!account;loginForm.hidden=true;recordSigned.hidden=!account;
 if(account)document.querySelector<HTMLElement>('#record-signed-nick')!.textContent=account.nickname;
 showAuth('register');
 if(account){recordTabs.hidden=true;registerForm.hidden=true;recordSigned.hidden=false}
 else{recordTabs.hidden=false;registerForm.hidden=false;recordSigned.hidden=true}
 recoveryPanel.hidden=true;recoveryCode='';setModalStatus('');
 text('record-modal-score',`Você marcou ${score} pontos. Quer tentar o ranking global?`);
 recordModal.hidden=false;modalOpen=true;
 (account?document.querySelector<HTMLButtonElement>('#record-save'):document.querySelector<HTMLInputElement>('#record-register-nick'))!.focus({preventScroll:true});
}

// Mantém o foco somente nos controles do modal enquanto ele estiver aberto.
recordModal.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||!modalOpen)return;
 const focusable=Array.from(recordModal.querySelectorAll<HTMLElement>(
  'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]'
 )).filter(el=>!el.closest('[hidden]')&&el.getClientRects().length>0);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable[focusable.length-1];
 if(event.shiftKey&&(document.activeElement===first||!recordModal.contains(document.activeElement))){event.preventDefault();last.focus()}
 else if(!event.shiftKey&&(document.activeElement===last||!recordModal.contains(document.activeElement))){event.preventDefault();first.focus()}
});

function closeRecordModal(){
 recordModal.hidden=true;modalOpen=false;
 startBtn.focus({preventScroll:true});
}
document.querySelector<HTMLButtonElement>('#record-skip')!.addEventListener('click',closeRecordModal);
document.querySelector<HTMLButtonElement>('#record-tab-register')!.addEventListener('click',()=>showAuth('register'));
document.querySelector<HTMLButtonElement>('#record-tab-login')!.addEventListener('click',()=>showAuth('login'));
document.querySelector<HTMLButtonElement>('#record-save')!.addEventListener('click',()=>{void saveRecord()});
async function authAndRecord(kind:'register'|'login',fields:Record<string,string|boolean>,form:HTMLFormElement){
 const button=form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
 button.disabled=true;setModalStatus('Validando seus dados…');
 try{
  const response=await fetch('/api/auth/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
  const result=await response.json() as {error?:string;player?:{nickname:string};recoveryCode?:string};
  if(!response.ok||!result.player)throw Error(result.error||'Falha na autenticação');
  account=result.player;saved.nickname=account.nickname;store();refresh();drawAccountResults();
  recordTabs.hidden=true;registerForm.hidden=true;loginForm.hidden=true;recordSigned.hidden=false;
  document.querySelector<HTMLElement>('#record-signed-nick')!.textContent=account.nickname;
  if(result.recoveryCode){
   recoveryCode=result.recoveryCode;
   recoveryPanel.hidden=false;
   document.querySelector<HTMLElement>('#record-recovery-code')!.textContent=recoveryCode;
  }
  setModalStatus('Conta conectada. Registrando seu resultado…');
  const wasProvisional=roundBeatGlobal;
  const rankingResult=await leaderboard.submit(score);
  text('record-end-summary',confirmedResult(rankingResult,score,wasProvisional));
  setModalStatus(result.recoveryCode?'Recorde registrado! Guarde o código antes de continuar.':'Recorde registrado!');
  if(!recoveryCode)closeRecordModal();
  form.reset();
 }catch(error){setModalStatus(error instanceof Error?error.message:'Falha ao entrar ou registrar')}
 finally{button.disabled=false}
}
registerForm.addEventListener('submit',e=>{
 e.preventDefault();
 void authAndRecord('register',{
  nickname:document.querySelector<HTMLInputElement>('#record-register-nick')!.value,
  email:document.querySelector<HTMLInputElement>('#record-register-email')!.value,
  password:document.querySelector<HTMLInputElement>('#record-register-pass')!.value,
  recordEmailOptIn:document.querySelector<HTMLInputElement>('#record-register-alert')!.checked
 },registerForm);
});
loginForm.addEventListener('submit',e=>{
 e.preventDefault();
 void authAndRecord('login',{
  nickname:document.querySelector<HTMLInputElement>('#record-login-nick')!.value,
  password:document.querySelector<HTMLInputElement>('#record-login-pass')!.value
 },loginForm);
});
document.querySelector<HTMLButtonElement>('#record-copy-code')!.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(recoveryCode);setModalStatus('Código copiado. Guarde-o em local seguro.')}
 catch{setModalStatus('Copie o código manualmente e guarde-o em local seguro.')}
});
document.querySelector<HTMLButtonElement>('#record-recovery-done')!.addEventListener('click',()=>{
 recoveryCode='';recoveryPanel.hidden=true;document.querySelector<HTMLElement>('#record-recovery-code')!.textContent='';closeRecordModal();
});
document.addEventListener('oldarcade:global-record',event=>{
 const detail=(event as CustomEvent<{score:number|null;previousScore:number|null;changed:boolean;source:string}>).detail;
 const value=detail?.score;
 globalBest=typeof value==='number'&&Number.isFinite(value)?value:null;
 globalKnown=true;
 refresh();

});
document.addEventListener('oldarcade:player-game-records',event=>{
 accountGameRecords=(event as CustomEvent<{records:{game:string;score:number}[]}>).detail.records;
 drawAccountResults();
});
document.addEventListener('oldarcade:personal-record',event=>{
 const detail=(event as CustomEvent<{score:number}>).detail;
 personalCloudBest=Number(detail?.score)||0;
 refresh();
});
void checkAccount();
// Consultar somente na entrada da página e ao final da partida.

startBtn.addEventListener('click',()=>state==='paused'?pause():start());
pauseBtn.addEventListener('click',pause);
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>turn(btn.dataset.direction as Direction)));
window.addEventListener('keydown',e=>{if(modalOpen)return;if(e.target instanceof HTMLInputElement)return;const map:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(e.key.toLowerCase()==='f'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();void toggleFullscreen()}else if(map[e.key]&&state==='playing'){e.preventDefault();turn(map[e.key])}else if(e.code==='Space'&&(state==='playing'||state==='paused')){e.preventDefault();pause()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
fullscreenBtn.addEventListener('click',()=>{void toggleFullscreen()});
document.addEventListener('fullscreenchange',()=>{
 const nativeNow=document.fullscreenElement===stage;
 if(!changingFullscreen&&wasNativeFullscreen&&!nativeNow){
  centerGameAfterExit();
 }
 if(!changingFullscreen&&wasNativeFullscreen&&!nativeNow&&(state==='playing'||state==='countdown')){
  cancelCountdown();window.clearTimeout(timer);state='paused';beginCountdown();
 }
 wasNativeFullscreen=nativeNow;updateFullButton();
});
window.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&fallbackFullscreen){event.preventDefault();void toggleFullscreen()}
});
const form=document.querySelector<HTMLFormElement>('#nickname-form')!,nick=document.querySelector<HTMLInputElement>('#nickname')!;nick.value=saved.nickname;
form.addEventListener('submit',e=>{e.preventDefault();saved.nickname=nick.value.trim().replace(/[<>]/g,'').slice(0,18);store();text('nick-status',saved.nickname?'Nickname salvo neste navegador. As próximas pontuações entrarão no ranking com esse nome.':'Nickname removido. Partidas sem nickname não entram no ranking.');});
refresh();draw();drawAccountResults();
