import {setupGameClock} from './gameClock';
import {centerGameBoard} from './gameViewport';
import {recordGameStart,recordGameScore,recordGameFinish} from './gameEvents';
import {setupGlobalGameCounters} from './globalGameCounters';

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
const counters=setupGlobalGameCounters('tetris','tetris-global');
const key='oldarcade:tetris:classic:v1';
let best=0,plays=0;
try{const saved=JSON.parse(localStorage.getItem(key)||'{}');best=Number.isSafeInteger(saved.best)&&saved.best>=0?saved.best:0;plays=Number.isSafeInteger(saved.plays)&&saved.plays>=0?saved.plays:0}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({best,plays}))}catch{}}
let board:Cell[][]=[],piece:Falling|null=null,bag:PieceName[]=[],queue:PieceName[]=[];
let reserve:PieceName|null=null,reserveUsed=false,score=0,lines=0,level=1,state:State='ready';
let fallTimer=0,countTimer=0,finishSequence=0,fullscreenChanging=false;
const clock=setupGameClock(screen,()=>state==='playing');
const empty=():Cell[][]=>Array.from({length:ROWS},()=>Array<Cell>(COLS).fill(0));
const clone=(m:Matrix)=>m.map(row=>[...row]);
function shuffleBag(){
 const names:PieceName[]=['I','O','T','S','Z','J','L'];
 for(let i=names.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[names[i],names[j]]=[names[j],names[i]]}
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
 if(state!=='playing'||!piece)return;
 const rotated=rotate(piece.shape,ccw);
 // Tentativas de deslocamento: paredes laterais e chão, sem atravessar blocos.
 for(const [dx,dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1]]){
  if(!collides(piece,dx,dy,rotated)){piece.x+=dx;piece.y+=dy;piece.shape=rotated;draw();return}
 }
}
function move(dx:number){
 if(state!=='playing'||!piece||collides(piece,dx,0))return;
 piece.x+=dx;draw();
}
function update(){
 node('tetris-status').textContent=state==='playing'?'● Jogando':state==='paused'?'● Pausado':state==='countdown'?'● Preparando':state==='over'?'● Fim de jogo':'● Pronto';
 node('tetris-score').textContent=String(score);node('tetris-best').textContent=String(best);
 node('tetris-lines').textContent=String(lines);node('tetris-level').textContent=String(level);
 node('tetris-plays').textContent=String(plays);
 node('tetris-local-best').textContent=String(best);node('tetris-sidebar-level').textContent=String(level);
}
function award(points:number){
 score+=points;if(score>best){best=score;save()}
 recordGameScore('tetris',score);update();
}
function land(){
 if(!piece||state!=='playing')return;
 for(let y=0;y<piece.shape.length;y++)for(let x=0;x<piece.shape[y].length;x++){
  if(!piece.shape[y][x])continue;
  const yy=piece.y+y;
  if(yy<0){finish();return}
  board[yy][piece.x+x]=piece.name;
 }
 const remaining=board.filter(row=>row.some(value=>!value));
 const cleared=ROWS-remaining.length;
 if(cleared){
  board=[...Array.from({length:cleared},()=>Array<Cell>(COLS).fill(0)),...remaining];
  lines+=cleared;
  const oldLevel=level;level=Math.min(30,Math.floor(lines/10)+1);
  award([0,100,300,500,800][cleared]*oldLevel);
  if(cleared===4)celebrate('mission','TETRIS! Quatro linhas eliminadas de uma vez!');
  else if(level>oldLevel)celebrate('mission','Nível '+level+'! Agora as peças caem mais rápido.');
 }else update();
 reserveUsed=false;
 if(spawn())schedule();
}
function drop(hard=false){
 if(state!=='playing'||!piece)return;
 if(hard){
  let steps=0;while(!collides(piece,0,1)){piece.y++;steps++}
  if(steps)award(steps*2);
  land();return;
 }
 if(!collides(piece,0,1)){piece.y++;draw()}
 else land();
}
function softDrop(){
 if(state!=='playing'||!piece)return;
 if(!collides(piece,0,1)){piece.y++;award(1);draw()}else land();
}
function hold(){
 if(state!=='playing'||!piece||reserveUsed)return;
 const old=piece.name;
 reserveUsed=true;
 if(reserve){const next=reserve;reserve=old;piece=fresh(next);if(collides(piece)){finish();return}}
 else{reserve=old;if(!spawn())return}
 draw();
}
function speed(){return Math.max(70,900*Math.pow(.80,level-1))}
function schedule(){
 window.clearTimeout(fallTimer);
 if(state!=='playing')return;
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
   if(py+dy>=0)drawTile(ctx,piece.x+x,py+dy,TILE,piece.name,true);
   if(py>=0)drawTile(ctx,piece.x+x,py,TILE,piece.name);
  }
 }
 preview(nextCanvas,queue[0]??null);preview(holdCanvas,reserve);
}
function celebrate(kind:'mission'|'defeat',message:string,final=false){
 document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:'tetris',kind,message,final}}));
}
function show(heading:string,message:string,button:string){
 title.textContent=heading;description.textContent=message;startButton.textContent=button;
 overlay.hidden=false;startButton.hidden=false;countdown.hidden=true;
}
function countdownStart(first:boolean){
 window.clearTimeout(countTimer);window.clearTimeout(fallTimer);
 state='countdown';overlay.hidden=false;startButton.hidden=true;countdown.hidden=false;
 title.textContent='Prepare-se';description.textContent=first?'A primeira peça chega em:':'Retomando em:';
 let remaining=3;update();
 const step=()=>{
  countdown.textContent=String(remaining);
  if(remaining===1)countTimer=window.setTimeout(()=>{if(state!=='countdown')return;overlay.hidden=true;countdown.hidden=true;state='playing';update();schedule()},1000);
  else countTimer=window.setTimeout(()=>{remaining--;step()},1000);
 };
 step();
}
function start(){
 finishSequence++;window.clearTimeout(fallTimer);window.clearTimeout(countTimer);
 clock.reset();board=empty();bag=[];queue=[];reserve=null;reserveUsed=false;
 piece=null;score=0;lines=0;level=1;drawNext();
 const event=recordGameStart('tetris');counters.recordPlay(event);
 plays++;save();spawn();update();centerGameBoard(screen,stage);countdownStart(true);
}
function finish(){
 if(state==='over')return;
 const sequence=++finishSequence;
 state='over';window.clearTimeout(fallTimer);window.clearTimeout(countTimer);
 const duration=clock.milliseconds();save();update();draw();
 recordGameFinish('tetris',score,duration);
 celebrate('defeat','Você fez '+score+' pontos e eliminou '+lines+' linhas. Pronto para a revanche?',true);
 window.setTimeout(()=>{if(sequence===finishSequence&&state==='over')show('Fim de jogo','Você marcou '+score+' pontos e eliminou '+lines+' linhas.','▶ Jogar novamente')},4000);
}
function pause(){
 if(state==='playing'){state='paused';window.clearTimeout(fallTimer);show('Jogo pausado','Sua partida está preservada.','▶ Continuar')}
 else if(state==='paused'){centerGameBoard(screen,stage);countdownStart(false)}
 update();
}
async function toggleFullscreen(){
 if(fullscreenChanging)return;
 fullscreenChanging=true;
 const resume=state==='playing'||state==='countdown';
 if(resume){state='paused';window.clearTimeout(fallTimer);window.clearTimeout(countTimer)}
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
startButton.addEventListener('click',()=>state==='paused'?pause():start());
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
 if(code==='KeyP'||code==='Escape'&&document.fullscreenElement!==stage){event.preventDefault();if(state==='playing'||state==='paused')pause();return}
 if(code==='Space'&&state!=='playing'){event.preventDefault();if(!event.repeat){if(state==='paused')pause();else if(state==='ready'||state==='over')start()}return}
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
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
document.addEventListener('fullscreenchange',()=>{
 fullscreenButton.textContent=document.fullscreenElement===stage?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
 if(fullscreenChanging)return;
 if(state==='playing'||state==='countdown'){state='paused';window.clearTimeout(fallTimer);window.clearTimeout(countTimer);countdownStart(false)}
 if(document.fullscreenElement!==stage)centerGameBoard(screen,stage);
});
board=empty();drawNext();draw();update();
