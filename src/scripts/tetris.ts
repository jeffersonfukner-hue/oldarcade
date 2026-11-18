import {setupGameClock} from './gameClock';
import {centerGameBoard} from './gameViewport';
import {recordGameStart,recordGameScore,recordGameFinish} from './gameEvents';
import {setupGlobalGameCounters} from './globalGameCounters';
import {showScoreFeedback} from './scoreFeedback';
import {setCountdownOverlay} from './gameCountdownOverlay';
import {formatRankingValue} from '../data/rankingRules.js';
import {gameModes} from '../data/gameModes.js';
import {tetrisLevel,tetrisGravityMs} from '../data/tetrisRules.js';
import {seededRandom} from '../data/dailyChallenges.js';

type PieceName='I'|'O'|'T'|'S'|'Z'|'J'|'L';
type Cell=0|PieceName;
type Matrix=Cell[][];
type Falling={name:PieceName;shape:Matrix;x:number;y:number};
type State='ready'|'countdown'|'playing'|'paused'|'over';
const COLS=10,ROWS=20,TILE=30;
const SHAPES:Record<PieceName,Matrix>={
 I:[[0,0,0,0],['I','I','I','I'],[0,0,0,0],[0,0,0,0]],
 O:[['O','O'],['O','O']],
 T:[[0,'T',0],['T','T','T'],[0,0,0]],
 S:[[0,'S','S'],['S','S',0],[0,0,0]],
 Z:[['Z','Z',0],[0,'Z','Z'],[0,0,0]],
 J:[['J',0,0],['J','J','J'],[0,0,0]],
 L:[[0,0,'L'],['L','L','L'],[0,0,0]]
};
const COLORS:Record<PieceName,string>={I:'#55e8fc',O:'#ffe278',T:'#ba8cff',S:'#5df3aa',Z:'#ff748b',J:'#699dff',L:'#ffaf63'};
const node=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=node<HTMLCanvasElement>('tetris-canvas'),ctx=canvas.getContext('2d')!;
const nextCanvas=node<HTMLCanvasElement>('tetris-next'),holdCanvas=node<HTMLCanvasElement>('tetris-hold');
const stage=node<HTMLElement>('tetris-stage'),screen=node<HTMLElement>('tetris-screen'),overlay=node<HTMLElement>('tetris-overlay');
const title=node<HTMLElement>('tetris-overlay-title'),description=node<HTMLElement>('tetris-overlay-text');
const countdown=node<HTMLElement>('tetris-countdown'),startButton=node<HTMLButtonElement>('tetris-start');
const pauseButton=node<HTMLButtonElement>('tetris-pause'),fullscreenButton=node<HTMLButtonElement>('tetris-fullscreen');
const modeId=stage.dataset.gameMode==='tetris-sprint'?'tetris-sprint':stage.dataset.gameMode==='tetris-survival'?'tetris-survival':'tetris';
const sprint=modeId==='tetris-sprint';
const survival=modeId==='tetris-survival';
const timed=sprint||survival;
const TARGET_LINES=gameModes['tetris-sprint'].targetLines;
const counters=setupGlobalGameCounters(modeId,'tetris-global');
const key=survival?'oldarcade:tetris:survival:v1':sprint?'oldarcade:tetris:sprint:v1':'oldarcade:tetris:classic:v1';
let best=0,plays=0;
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');best=Number.isSafeInteger(saved.best)&&saved.best>=0?saved.best:0;plays=Number.isSafeInteger(saved.plays)&&saved.plays>=0?saved.plays:0}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({best,plays}))}catch{}}
type DailyMission={version:number;kind:string;metric:string;target:number|null;timeLimitMs:number|null;title:string;description:string;sequence?:number[]};
type DailyAttempt={date:string;token:string;seed:number;mission?:DailyMission};
type DailyResult={date:string;token:string;score:number;durationMs:number;linesCleared?:number;clearSequence?:number[]};
let dailyAttempt:DailyAttempt|null=null;
let pendingDailyFinish:DailyResult|null=null;
let dailyRandom:()=>number=Math.random;
let dailyRequestPending=false;
let dailyClears:number[]=[];
let board:Cell[][]=[],piece:Falling|null=null,bag:PieceName[]=[],queue:PieceName[]=[];
let reserve:PieceName|null=null,reserveUsed=false,score=0,lines=0,level=1,state:State='ready';
let globalTarget:number|null=null,personalTarget:number|null=null,globalProvisional=false;
let fallTimer=0,countTimer=0,finishSequence=0,fullscreenChanging=false;
let dropFrame=0,dropAnimating=false,dropVisualY:number|null=null;
function stopDropAnimation(){
 if(dropFrame)cancelAnimationFrame(dropFrame);
 dropFrame=0;dropAnimating=false;dropVisualY=null;
 screen.removeAttribute('data-drop-animating');
}
const clock=setupGameClock(screen,()=>state==='playing');
const empty=():Cell[][]=>Array.from({length:ROWS},()=>Array<Cell>(COLS).fill(0));
const clone=(m:Matrix)=>m.map(row=>[...row]);
function shuffleBag(){
 const names:PieceName[]=['I','O','T','S','Z','J','L'];
 for(let i=names.length-1;i>0;i--){const j=Math.floor(dailyRandom()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
 bag.push(...names);
}
function drawNext(){while(queue.length<5){if(!bag.length)shuffleBag();queue.push(bag.shift()!)}}
function collides(p:Falling,dx=0,dy=0,shape=p.shape){
 for(let y=0;y<shape.length;y++)for(let x=0;x<shape[y].length;x++){
  if(!shape[y][x])continue;
  const xx=p.x+x+dx,yy=p.y+y+dy;
  if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true;
 }
 return false;
}
function fresh(name:PieceName):Falling{
 const shape=clone(SHAPES[name]);
 return {name,shape,x:Math.floor((COLS-shape[0].length)/2),y:-1};
}
function spawn(name?:PieceName){
 drawNext();
 piece=fresh(name??queue.shift()!);drawNext();
 if(collides(piece)){finish();return false}
 draw();return true;
}
function rotate(shape:Matrix,ccw=false):Matrix{
 const n=shape.length;
 return Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>ccw?shape[x][n-1-y]:shape[n-1-x][y]));
}
function turn(ccw=false){
 if(state!=='playing'||!piece||dropAnimating)return;
 const rotated=rotate(piece.shape,ccw);
 // Tentativas de deslocamento: paredes laterais e chão, sem atravessar blocos.
 for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1]]){
  if(!collides(piece,dx,dy,rotated)){piece.x+=dx;piece.y+=dy;piece.shape=rotated;draw();return}
 }
}
function move(dx:number){
 if(state!=='playing'||!piece||dropAnimating||collides(piece,dx,0))return;
 piece.x+=dx;draw();
}
const displayBest=()=>timed?(best>0?formatRankingValue(modeId,best):'—'):String(best);
function dailyProgress(){
 if(!dailyAttempt)return;
 document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{game:'tetris',score,linesCleared:lines,clearSequence:[...dailyClears],durationMs:clock.milliseconds()}}));
}
function update(){
 node('tetris-status').textContent=state==='playing'?'● Jogando':state==='paused'?'● Pausado':state==='countdown'?'● Preparando':state==='over'?'● Fim de jogo':'● Pronto';
 node('tetris-score').textContent=survival?formatRankingValue(modeId,clock.milliseconds()):sprint?lines+'/'+TARGET_LINES:String(score);
 node('tetris-best').textContent=personalTarget===null?'—':timed?formatRankingValue(modeId,personalTarget):String(personalTarget);
 node('tetris-lines').textContent=sprint?Math.min(lines,TARGET_LINES)+'/'+TARGET_LINES:String(lines);
 if(!timed)node('tetris-level').textContent=String(level);
 node('tetris-plays').textContent=String(plays);
 node('tetris-local-best').textContent=displayBest();node('tetris-sidebar-level').textContent=sprint?lines+'/'+TARGET_LINES:survival?'Onda '+level:String(level);
 node('tetris-global').textContent=timed?formatRankingValue(modeId,globalTarget):String(globalProvisional?score:globalTarget??'—');node('tetris-provisional').hidden=timed||!globalProvisional;
 dailyProgress();
}
function award(points:number){
 score+=points;
 if(!timed&&!dailyAttempt){if(score>best){best=score;save()};recordGameScore(modeId,score)}
 update();
}
function land(){
 if(!piece||state!=='playing')return;
 if((dailyAttempt?.mission?.version??0)>=2&&dailyAttempt!.mission!.timeLimitMs!==null&&clock.milliseconds()>=dailyAttempt.mission.timeLimitMs){finish(false);return}
 for(let y=0;y<piece.shape.length;y++)for(let x=0;x<piece.shape[y].length;x++){
  if(!piece.shape[y][x])continue;
  const yy=piece.y+y;
  if(yy<0){finish();return}
  board[yy][piece.x+x]=piece.name;
 }
 const completed=board.flatMap((row,y)=>row.every(Boolean)?[y]:[]);
 const remaining=board.filter(row=>row.some(value=>!value));
 const cleared=ROWS-remaining.length;
 if(cleared){
  board=[...Array.from({length:cleared},()=>Array<Cell>(COLS).fill(0)),...remaining];
  lines+=cleared;
  const oldLevel=level;level=tetrisLevel(modeId,lines,clock.milliseconds());
  const points=[0,100,300,500,800][cleared]*oldLevel;
  if((dailyAttempt?.mission?.version??0)>=3)dailyClears.push(cleared);
  if(timed)update();else award(points);
  const dailyMission=dailyAttempt?.mission;
  if(dailyMission&&dailyMission.version>=2&&dailyMission.metric==='score'&&score>=dailyMission.target!){finish(true);return}
  if(dailyMission&&dailyMission.version>=3&&dailyMission.kind==='quads'&&cleared!==4){finish(false);return}
  if(dailyMission&&dailyMission.version>=3&&dailyMission.kind==='sequence'&&cleared!==dailyMission.sequence?.[dailyClears.length-1]){finish(false);return}
  if(dailyMission?.version>=3&&(dailyMission.kind==='quads'||dailyMission.kind==='sequence')&&dailyClears.length===dailyMission.target){finish(true);return}
  if(dailyMission&&dailyMission.version>=2&&dailyMission.metric==='lines'&&lines>=dailyMission.target!){finish(true);return}
  showScoreFeedback(screen,canvas,timed?cleared:points,timed?(cleared===1?'linha eliminada':'linhas eliminadas'):cleared===4?'TETRIS! 4 linhas':cleared===1?'1 linha':cleared+' linhas',completed[0],ROWS);
  // Clássico pontua linhas; Sprint utiliza somente tempo de conclusão.
  if(sprint&&lines>=TARGET_LINES){finish(true);return}
 }else update();
 reserveUsed=false;
 if(spawn())schedule();
}
function drop(hard=false){
 if(state!=='playing'||!piece||dropAnimating)return;
 if(hard){
  let distance=0;
  while(!collides(piece,0,distance+1))distance++;
  window.clearTimeout(fallTimer);
  // A animação é apenas visual: a peça continua sendo validada pela grade
  // e só trava depois que a trajetória termina.
  if(!distance||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   piece.y+=distance;land();return;
  }
  const active=piece,startY=piece.y,targetY=startY+distance;
  const started=performance.now();
  const duration=Math.min(240,Math.max(115,distance*14));
  dropAnimating=true;
  screen.dataset.dropAnimating='true';
  const frame=(now:number)=>{
   if(!dropAnimating||piece!==active||state!=='playing')return;
   const t=Math.min(1,(now-started)/duration);
   dropVisualY=startY+distance*t*t;
   draw();
   if(t<1){dropFrame=requestAnimationFrame(frame);return}
   stopDropAnimation();
   active.y=targetY;
   land();
  };
  dropFrame=requestAnimationFrame(frame);
  return;
 }
 if(!collides(piece,0,1)){piece.y++;draw()}
 else land();
}
function softDrop(){
 if(state!=='playing'||!piece||dropAnimating)return;
 if(!collides(piece,0,1)){piece.y++;draw()}else land();
}
function hold(){
 if(state!=='playing'||!piece||reserveUsed||dropAnimating)return;
 const old=piece.name;
 reserveUsed=true;
 if(reserve){const next=reserve;reserve=old;piece=fresh(next);if(collides(piece)){finish();return}}
 else{reserve=old;if(!spawn())return}
 draw();
}
function speed(){return tetrisGravityMs(modeId,lines,clock.milliseconds())}
function schedule(){
 window.clearTimeout(fallTimer);
 if(state!=='playing')return;
 if(survival){const next=tetrisLevel(modeId,lines,clock.milliseconds());if(next!==level){level=next;update();if(level>=4)screen.dataset.survivalDanger='true';else screen.removeAttribute('data-survival-danger')}}
 fallTimer=window.setTimeout(()=>{if(state!=='playing')return;drop();if(state==='playing')schedule()},speed());
}
function drawTile(context:CanvasRenderingContext2D,x:number,y:number,size:number,name:PieceName,ghost=false){
 const px=x*size,py=y*size;
 context.fillStyle=ghost?'#1f324b':COLORS[name];
 context.fillRect(px+1,py+1,size-2,size-2);
 context.strokeStyle=ghost?COLORS[name]:'#ffffff66';context.lineWidth=ghost?2:1.5;
 context.strokeRect(px+2.5,py+2.5,size-5,size-5);
 if(!ghost){context.fillStyle='#ffffff27';context.fillRect(px+4,py+4,size-8,Math.max(2,size*.16))}
}
function preview(target:HTMLCanvasElement,name:PieceName|null){
 const c=target.getContext('2d')!,size=target.width/5;
 c.clearRect(0,0,target.width,target.height);
 c.fillStyle='#0a1729';c.fillRect(0,0,target.width,target.height);
 if(!name)return;
 const shape=SHAPES[name],offsetX=(5-shape.length)/2,offsetY=(5-shape.length)/2;
 for(let y=0;y<shape.length;y++)for(let x=0;x<shape[y].length;x++)if(shape[y][x])drawTile(c,x+offsetX,y+offsetY,size,name);
}
function draw(){
 ctx.fillStyle='#071a20';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle='#18313f';ctx.lineWidth=.7;
 for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*TILE,0);ctx.lineTo(x*TILE,ROWS*TILE);ctx.stroke()}
 for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*TILE);ctx.lineTo(COLS*TILE,y*TILE);ctx.stroke()}
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x])drawTile(ctx,x,y,TILE,board[y][x] as PieceName);
 if(piece&&state!=='over'){
  let dy=0;while(!collides(piece,0,dy+1))dy++;
  for(let y=0;y<piece.shape.length;y++)for(let x=0;x<piece.shape[y].length;x++){
   if(!piece.shape[y][x])continue;
   const py=piece.y+y;
   if(!dropAnimating&&py+dy>=0)drawTile(ctx,piece.x+x,py+dy,TILE,piece.name,true);
   const visualY=(dropVisualY??piece.y)+y;
   if(visualY>=-1)drawTile(ctx,piece.x+x,visualY,TILE,piece.name);
  }
 }
 preview(nextCanvas,queue[0]??null);preview(holdCanvas,reserve);
}
function celebrate(kind:'defeat'|'mission',message:string,final=false){
 document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:modeId,kind,message,final}}));
}
function show(heading:string,message:string,button:string){
 title.textContent=heading;description.textContent=message;startButton.textContent=button;
 overlay.hidden=false;setCountdownOverlay(overlay,countdown,startButton,false);
}
function countdownStart(first:boolean){
 // Ao esconder o botão de iniciar, remova seu foco: Space não pode
 // ativá-lo novamente por padrão do navegador ao terminar a partida.
 if(document.activeElement===startButton)startButton.blur();
 window.clearTimeout(countTimer);window.clearTimeout(fallTimer);
 state='countdown';overlay.hidden=false;setCountdownOverlay(overlay,countdown,startButton,true);
 title.textContent='Prepare-se';description.textContent=first?'A primeira peça chega em:':'Retomando em:';
 let remaining=3;update();
 const step=()=>{
  countdown.textContent=String(remaining);
  if(remaining===1)countTimer=window.setTimeout(()=>{if(state!=='countdown')return;overlay.hidden=true;setCountdownOverlay(overlay,countdown,startButton,false);state='playing';update();schedule()},1000);
  else countTimer=window.setTimeout(()=>{remaining--;step()},1000);
 };
 step();
}
function start(daily:DailyAttempt|null=null){
 if(dailyRequestPending)return;
 dailyAttempt=daily;
 dailyClears=[];
 if(dailyAttempt)document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'tetris',phase:'playing'}}));dailyRandom=daily?seededRandom(daily.seed):Math.random;
 finishSequence++;stopDropAnimation();window.clearTimeout(fallTimer);window.clearTimeout(countTimer);
 clock.reset();board=empty();bag=[];queue=[];reserve=null;reserveUsed=false;
 piece=null;score=0;lines=0;level=1;globalProvisional=false;screen.removeAttribute('data-survival-danger');drawNext();
 const event=recordGameStart(modeId);counters.recordPlay(event);
 if(!dailyAttempt){plays++;save()}
 spawn();update();centerGameBoard(screen,stage);countdownStart(true);
}
function finish(completed=false){
 if(state==='over')return;
 const sequence=++finishSequence;
 // Amostrar o relógio antes de deixar playing, inclusive no último encaixe.
 const duration=clock.milliseconds();
 state='over';stopDropAnimation();globalProvisional=false;window.clearTimeout(fallTimer);window.clearTimeout(countTimer);
 if(dailyAttempt){
  const attempt=dailyAttempt;
  pendingDailyFinish={date:attempt.date,token:attempt.token,score,durationMs:duration,linesCleared:lines,clearSequence:[...dailyClears]};
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'tetris',phase:'pending'}}));
  try{sessionStorage.setItem('oldarcade:daily:tetris:pending',JSON.stringify(pendingDailyFinish))}catch{}
  dailyAttempt=null;dailyRandom=Math.random;
  update();draw();
  celebrate(completed?'mission':'defeat',completed?'Meta diária alcançada! Registrando seu resultado.':'Desafio encerrado. Seu resultado ficará disponível em Minha Conta.',true);
  void submitDailyFinish();
  window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show(completed?'Meta alcançada!':'Desafio Diário encerrado','Você fez '+score+' pontos e eliminou '+lines+' linhas. Sua tentativa foi utilizada; amanhã haverá outra missão.','▶ Jogar Tetris livre')},4000);
  return;
 }
 if(survival){
  const elapsed=Math.max(1,duration);
  if(elapsed>best){best=elapsed;save()}
  update();draw();
  recordGameScore(modeId,elapsed);
  recordGameFinish(modeId,elapsed,elapsed,{recordDelayMs:6500});
  celebrate('defeat','Você resistiu por '+formatRankingValue(modeId,elapsed)+' e eliminou '+lines+' linhas.',true);
  window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show('Sobrevivência encerrada','Você resistiu por '+formatRankingValue(modeId,elapsed)+' · '+lines+' linhas.','▶ Sobreviver novamente')},4000);
  return;
 }
 if(sprint){
  if(completed){
   const elapsed=Math.max(1,duration);
   if(!best||elapsed<best){best=elapsed;save()}
   update();draw();
   recordGameScore(modeId,elapsed);
   recordGameFinish(modeId,elapsed,elapsed,{recordDelayMs:6500});
   celebrate('mission','40 linhas eliminadas em '+formatRankingValue(modeId,elapsed)+'! Sprint concluído.',true);
   window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show('Sprint concluído','40 linhas em '+formatRankingValue(modeId,elapsed)+'.','▶ Correr novamente')},4000);
  }else{
   update();draw();
   // Tentativas sem 40 linhas não podem ir ao ranking.
   celebrate('defeat','Tentativa encerrada com '+lines+' de 40 linhas. Tente novamente!',true);
   window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show('Sprint não concluído','Você eliminou '+lines+' de 40 linhas.','▶ Tentar novamente')},4000);
  }
  return;
 }
 save();update();draw();
 recordGameFinish(modeId,score,duration,{recordDelayMs:6500});
 celebrate('defeat','Você fez '+score+' pontos e eliminou '+lines+' linhas. Pronto para a revanche?',true);
 window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show('Fim de jogo','Você marcou '+score+' pontos e eliminou '+lines+' linhas.','▶ Jogar novamente')},4000);
}
function pause(){
 if(state==='playing'||state==='countdown'){stopDropAnimation();draw();state='paused';window.clearTimeout(fallTimer);window.clearTimeout(countTimer);show('Jogo pausado','Sua partida está preservada.','▶ Continuar')}
 else if(state==='paused'){centerGameBoard(screen,stage);countdownStart(false)}
 update();
}
async function toggleFullscreen(){
 if(fullscreenChanging)return;
 fullscreenChanging=true;
 const resume=state==='playing'||state==='countdown';
 if(resume){stopDropAnimation();draw();state='paused';window.clearTimeout(fallTimer);window.clearTimeout(countTimer)}
 try{
  if(document.fullscreenElement===stage)await document.exitFullscreen();
  else if(!document.fullscreenElement&&stage.requestFullscreen)await stage.requestFullscreen();
 }catch{/* Navegadores podem recusar fullscreen: a partida não é descartada. */}
 finally{
  fullscreenChanging=false;
  fullscreenButton.textContent=document.fullscreenElement===stage?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
  if(document.fullscreenElement!==stage)centerGameBoard(screen,stage);
  if(resume)countdownStart(false);
 }
}
async function submitDailyFinish(){
 const attempt=pendingDailyFinish;if(!attempt||dailyRequestPending)return;
 dailyRequestPending=true;
 const info=document.querySelector<HTMLElement>('[data-daily-info]');
 if(info)info.textContent='Salvando seu desempenho diário…';
 try{
  const response=await fetch('/api/daily/tetris',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'finish',...attempt})});
  const result=await response.json() as {error?:string;missionSuccess?:boolean|null;mission?:DailyMission};
  if(!response.ok)throw Error(result.error||'Falha ao registrar o desempenho.');
  pendingDailyFinish=null;
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'tetris',phase:'finished'}}));
  try{sessionStorage.removeItem('oldarcade:daily:tetris:pending')}catch{}
  if(info)info.textContent=result.mission?.version===2?(result.missionSuccess?'🏆 Missão cumprida! Resultado salvo em Minha Conta.':'Meta não alcançada. Resultado salvo em Minha Conta.'):'Desafio concluído! Consulte o resultado em Minha Conta.';
  document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'tetris'}}));
  if(startButton.dataset.dailyRetry==='true'){delete startButton.dataset.dailyRetry;startButton.textContent='▶ Jogar Tetris livre'}
 }catch(error){
  if(info)info.textContent=(error instanceof Error?error.message:'Falha ao salvar')+' · Você pode reenviar o resultado, sem refazer a partida.';
  startButton.dataset.dailyRetry='true';
  if(state==='over')startButton.textContent='↻ Reenviar resultado diário';
 }finally{dailyRequestPending=false}
}
document.addEventListener('oldarcade:daily-start-request',event=>{
 const data=(event as CustomEvent<{game:string;date:string}>).detail;
 if(data?.game!=='tetris'||modeId!=='tetris')return;
 const info=document.querySelector<HTMLElement>('[data-daily-info]');
 if(state==='playing'||state==='countdown'||state==='paused'||dailyAttempt||dailyRequestPending){
  if(info)info.textContent='Encerre a partida atual antes de iniciar o Desafio Diário.';
  document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'tetris'}}));return;
 }
 if(pendingDailyFinish){if(info)info.textContent='Reenvie o resultado pendente antes de iniciar outro desafio.';return}
 dailyRequestPending=true;
 if(info)info.textContent='Reservando sua única tentativa…';
 void (async()=>{
  try{
   const response=await fetch('/api/daily/tetris',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',date:data.date})});
   const result=await response.json() as DailyAttempt&{error?:string};
   if(!response.ok)throw Error(result.error||'Não foi possível reservar a tentativa.');
   dailyRequestPending=false;
   start(result);
   document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'tetris'}}));
  }catch(error){
   dailyRequestPending=false;
   if(info)info.textContent=error instanceof Error?error.message:'Não foi possível iniciar o desafio.';
   document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'tetris'}}));
  }
 })();
});
try{
 const pending=JSON.parse(sessionStorage.getItem('oldarcade:daily:tetris:pending')||'null') as DailyResult|null;
 if(pending&&typeof pending.token==='string'&&typeof pending.date==='string'&&Number.isSafeInteger(pending.score)){
  pendingDailyFinish=pending;
  startButton.dataset.dailyRetry='true';
  startButton.textContent='↻ Reenviar resultado diário';
 }
}catch{}
startButton.addEventListener('click',()=>{
 if(startButton.dataset.dailyRetry==='true'){void submitDailyFinish();return}
 if(state==='paused')pause();else start();
});
pauseButton.addEventListener('click',pause);
fullscreenButton.addEventListener('click',()=>{void toggleFullscreen()});
const controls:Record<string,()=>void>={
 left:()=>move(-1),right:()=>move(1),down:softDrop,rotate:()=>turn(),rotateLeft:()=>turn(true),drop:()=>drop(true),hold
};
document.querySelectorAll<HTMLButtonElement>('[data-tetris-control]').forEach(button=>button.addEventListener('click',()=>controls[button.dataset.tetrisControl||'']?.()));
window.addEventListener('keydown',event=>{
 const target=event.target as HTMLElement;
 if(target.closest('input,textarea,select,button,[contenteditable],.mode-account-modal')||event.altKey||event.ctrlKey||event.metaKey)return;
 const code=event.code;
 if(code==='KeyF'&&!event.repeat){event.preventDefault();void toggleFullscreen();return}
 if(code==='KeyP'||code==='Escape'&&document.fullscreenElement!==stage){event.preventDefault();if(state==='playing'||state==='paused'||state==='countdown')pause();return}
 if(code==='Space'&&state!=='playing'){event.preventDefault();if(!event.repeat&&state==='paused')pause();return}
 const actions:Record<string,()=>void>={
 ArrowLeft:controls.left,KeyA:controls.left,ArrowRight:controls.right,KeyD:controls.right,
 ArrowDown:controls.down,KeyS:controls.down,ArrowUp:controls.rotate,KeyX:controls.rotate,KeyW:controls.rotate,
 KeyZ:controls.rotateLeft,Space:controls.drop,KeyC:controls.hold,ShiftLeft:controls.hold,ShiftRight:controls.hold
 };
 const action=actions[code];
 if(action){event.preventDefault();if(state==='playing'&&!(event.repeat&&(code==='Space'||code==='KeyC')))action()}
});
let touch:{x:number;y:number}|null=null;
canvas.addEventListener('touchstart',event=>{if(event.touches.length===1)touch={x:event.touches[0].clientX,y:event.touches[0].clientY}},{passive:true});
canvas.addEventListener('touchend',event=>{
 if(!touch||!event.changedTouches.length)return;
 const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;
 touch=null;
 if(Math.max(Math.abs(dx),Math.abs(dy))<20){turn();return}
 event.preventDefault();
 if(Math.abs(dx)>Math.abs(dy)){const action=dx>0?controls.right:controls.left;for(let i=0;i<Math.min(4,Math.max(1,Math.round(Math.abs(dx)/40)));i++)action()}
 else if(dy>45)controls.drop();else if(dy>0)controls.down();else controls.rotate();
},{passive:false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='playing'||state==='countdown'))pause()});
document.addEventListener('fullscreenchange',()=>{
 fullscreenButton.textContent=document.fullscreenElement===stage?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
 if(fullscreenChanging)return;
 if(state==='playing'||state==='countdown'){stopDropAnimation();draw();state='paused';window.clearTimeout(fallTimer);window.clearTimeout(countTimer);countdownStart(false)}
 if(document.fullscreenElement!==stage)centerGameBoard(screen,stage);
});
document.addEventListener('oldarcade:mode-ranking-updated',event=>{
 const detail=(event as CustomEvent<{game:string;global:number|null;personal:number|null}>).detail;
 if(detail?.game!==modeId)return;
 globalTarget=detail.global;
 personalTarget=detail.personal;
 if(state!=='playing'&&state!=='countdown')globalProvisional=false;
 update();
});
document.addEventListener('oldarcade:mode-record-provisional',event=>{
 const detail=(event as CustomEvent<{game:string}>).detail;
 if(detail?.game!==modeId)return;
 globalProvisional=true;update();
});
document.dispatchEvent(new CustomEvent('oldarcade:mode-ranking-request',{detail:{game:modeId}}));
board=empty();drawNext();draw();update();

// Atualização do cronômetro visual, sem alterar a física nem contar pausas.
if(survival)window.setInterval(()=>{if(state==='playing')update()},250);
// A missão cronometrada encerra no prazo mesmo se o jogador não posicionar nenhuma peça.
window.setInterval(()=>{
 if(state!=='playing'||!dailyAttempt?.mission||dailyAttempt.mission.version<2)return;
 const limit=dailyAttempt.mission.timeLimitMs;
 if(limit!==null&&clock.milliseconds()>=limit)finish(false);
 else dailyProgress();
},180);
