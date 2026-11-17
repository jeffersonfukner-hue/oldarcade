import {setupGameClock} from './gameClock';
import {centerGameBoard} from './gameViewport';
import {recordGameStart,recordGameScore,recordGameFinish} from './gameEvents';
import {setupGlobalGameCounters} from './globalGameCounters';
type Direction='up'|'down'|'left'|'right';
type Point={x:number;y:number};
type ItemKind='apple'|'gold'|'ice'|'speed';
type Item={at:Point;kind:ItemKind;ticks?:number};
const adventureCounters=setupGlobalGameCounters('snake-adventure','adventure-global');
const canvas=document.querySelector<HTMLCanvasElement>('#adventure-canvas')!;
const ctx=canvas.getContext('2d')!;
const stage=document.querySelector<HTMLElement>('#adventure-stage')!;
const screen=document.querySelector<HTMLElement>('#adventure-screen')!;
const overlay=document.querySelector<HTMLElement>('#adventure-overlay')!;
const startBtn=document.querySelector<HTMLButtonElement>('#adventure-start')!;
const pauseBtn=document.querySelector<HTMLButtonElement>('#adventure-pause')!;
const fullscreenBtn=document.querySelector<HTMLButtonElement>('#adventure-fullscreen')!;
const countdown=document.querySelector<HTMLElement>('#adventure-countdown')!;
const banner=document.querySelector<HTMLElement>('#adventure-banner')!;
const floatLayer=document.querySelector<HTMLElement>('#adventure-score-float-layer')!;
const key='oldarcade:snake:adventure:v1',boardSize=20,cell=30;
let best=0,highest=1,plays=0;
try{
 const saved=JSON.parse(localStorage.getItem(key)||'{}') as {best?:number;highest?:number;plays?:number};
 if(Number.isSafeInteger(saved.best)&&saved.best!>=0)best=saved.best!;
 if(Number.isSafeInteger(saved.highest)&&saved.highest!>=1)highest=saved.highest!;
 if(Number.isSafeInteger(saved.plays)&&saved.plays!>=0)plays=saved.plays!;
}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify({best,highest,plays}))}catch{}}
let snake:Point[]=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];
let barriers:Point[]=[];
type EdgeWall={side:'top'|'bottom'|'left'|'right';index:number};
let edgeWalls:EdgeWall[]=[];
const hasEdgeWall=(side:EdgeWall['side'],index:number)=>edgeWalls.some(w=>w.side===side&&w.index===index);
function setEdgeWalls(count:number){
 const candidates:EdgeWall[]=[];
 for(let index=2;index<boardSize-2;index+=3){for(const side of ['top','right','bottom','left'] as const)candidates.push({side,index})}
 edgeWalls=candidates.slice(0,count);
}

const barrierCandidates:Point[]=[{x:4,y:4},{x:15,y:15},{x:4,y:15},{x:15,y:4},{x:10,y:4},{x:10,y:15},{x:4,y:10},{x:15,y:10}];
function setBarriers(count:number){
 // Nunca gerar obstáculos sobre a cobra ou os itens presentes.
 barriers=barrierCandidates.filter(p=>!snake.some(part=>same(part,p))&&!same(food.at,p)&&(!special||!same(special.at,p))).slice(0,count);
 stage.dataset.barrierCount=String(barriers.length);
 setEdgeWalls(count===0?0:Math.min(20,count*2));
}

let food:Item={kind:'apple',at:{x:14,y:10}},special:Item|null=null;
let direction:Direction='right',next:Direction='right';
let score=0,level=1,apples=0,golds=0,level3Specials=0,normalSinceSpecial=0,iceTicks=0,speedTicks=0,levelApples=0;
let globalTarget:number|null=null;
let globalProvisional=false;
let state:'ready'|'countdown'|'playing'|'paused'|'over'='ready';
let gameTimer:number|undefined,countdownTimer:number|undefined,bannerTimer:number|undefined;
let changingFullscreen=false;
const missions=[{label:'Colete 5 maçãs',target:5,minimum:50},{label:'Colete 1 fruta dourada',target:1,minimum:150},{label:'Colete 3 itens especiais',target:3,minimum:300}];
function goal(){return missions[level-1]??{label:'Colete '+(level+1)+' maçãs',target:level+1,minimum:300+(level-3)*150}}

function byId(id:string){return document.getElementById(id)!}
function text(id:string,value:string){byId(id).textContent=value}
function same(a:Point,b:Point){return a.x===b.x&&a.y===b.y}
function freeCell():Point|null{
 const cells:Point[]=[];
 for(let x=0;x<boardSize;x++)for(let y=0;y<boardSize;y++){
  const p={x,y};
  if(!snake.some(a=>same(a,p))&&!barriers.some(a=>same(a,p))&&!same(food.at,p)&&(!special||!same(special.at,p)))cells.push(p);
 }
 return cells.length?cells[Math.floor(Math.random()*cells.length)]:null;
}
function drawItem(item:Item){
 const x=(item.at.x+.5)*cell,y=(item.at.y+.5)*cell;
 ctx.fillStyle=item.kind==='gold'?'#ffd56e':item.kind==='ice'?'#83d7ff':item.kind==='speed'?'#ff9a52':'#ff657c';
 ctx.beginPath();
 if(item.kind==='speed'){
  ctx.moveTo(x-12,y-11);ctx.lineTo(x+3,y-11);ctx.lineTo(x-3,y-2);ctx.lineTo(x+12,y-2);ctx.lineTo(x-7,y+13);ctx.lineTo(x-2,y+3);ctx.lineTo(x-12,y+3);ctx.closePath();
 }else if(item.kind==='ice'){
  ctx.moveTo(x,y-12);ctx.lineTo(x+12,y);ctx.lineTo(x,y+12);ctx.lineTo(x-12,y);ctx.closePath();
 }else ctx.arc(x,y,item.kind==='gold'?12:10,0,Math.PI*2);
 ctx.fill();
 if(item.kind==='gold'){ctx.lineWidth=3;ctx.strokeStyle='#fff1bb';ctx.stroke()}
}
function draw(){
 ctx.fillStyle='#071a20';ctx.fillRect(0,0,600,600);
 ctx.strokeStyle='#19323c';ctx.lineWidth=1;
 for(let i=0;i<=boardSize;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,600);ctx.moveTo(0,i*cell);ctx.lineTo(600,i*cell);ctx.stroke()}
 edgeWalls.forEach(w=>{ctx.fillStyle='#cf79ee';const thick=cell*.22;const x=w.side==='left'?0:w.side==='right'?boardSize-1:w.index;const y=w.side==='top'?0:w.side==='bottom'?boardSize-1:w.index;if(w.side==='top')ctx.fillRect(x*cell,y*cell,cell,thick);else if(w.side==='bottom')ctx.fillRect(x*cell,(y+1)*cell-thick,cell,thick);else if(w.side==='left')ctx.fillRect(x*cell,y*cell,thick,cell);else ctx.fillRect((x+1)*cell-thick,y*cell,thick,cell)});
 barriers.forEach(p=>{ctx.fillStyle='#71879b';ctx.fillRect(p.x*cell+2,p.y*cell+2,cell-4,cell-4);ctx.strokeStyle='#b6c6d5';ctx.strokeRect(p.x*cell+5,p.y*cell+5,cell-10,cell-10)});
 drawItem(food);if(special)drawItem(special);
 snake.forEach((p,i)=>{ctx.fillStyle=i===0?'#b4ffd8':'#48dca4';ctx.fillRect(p.x*cell+2,p.y*cell+2,cell-4,cell-4)});
}
function floatPoints(at:Point,amount:number){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const board=canvas.getBoundingClientRect(),container=screen.getBoundingClientRect();
 if(!board.width||!board.height)return;
 const item=document.createElement('span');
 item.className='score-float';
 item.textContent='+'+amount;
 item.style.left=(board.left-container.left+(at.x+.5)*(board.width/boardSize))+'px';
 item.style.top=(board.top-container.top+(at.y+.5)*(board.height/boardSize))+'px';
 floatLayer.append(item);
 item.addEventListener('animationend',()=>item.remove(),{once:true});
 window.setTimeout(()=>item.remove(),1100);
}
function notify(message:string){
 banner.textContent=message;banner.hidden=false;window.clearTimeout(bannerTimer);
 bannerTimer=window.setTimeout(()=>{banner.hidden=true},2300);
}
function missionProgress(){return level===1?apples:level===2?golds:level===3?level3Specials:levelApples}
function update(){
 text('adventure-status',state==='playing'?'● Jogando':state==='countdown'?'● Preparando':state==='paused'?'● Pausado':state==='over'?'● Fim de jogo':'● Pronto');
 text('adventure-level',String(level));text('adventure-score',String(score));
 text('adventure-hud-global',String(globalProvisional?score:globalTarget??'—'));
 byId('adventure-hud-provisional').hidden=!globalProvisional;
 text('adventure-best',String(best));text('adventure-sidebar-best',String(best));
 text('adventure-highest',String(highest));text('adventure-plays',String(plays));
 text('adventure-effect',speedTicks>0?'Velocidade ativa':iceTicks>0?'Gelo ativo':'Nenhum');
 const mission=goal(),progress=Math.min(mission.target,missionProgress());
 text('adventure-mission',mission.label+' · mínimo '+mission.minimum+' pontos');
 text('adventure-mission-progress',progress+'/'+mission.target);
 (byId('adventure-progress-fill') as HTMLElement).style.width=Math.round(100*Math.min(progress/mission.target,score/mission.minimum))+'%';
}
function spawn(kind:'gold'|'ice'|'speed'){
 if(special)return;
 const pos=freeCell();if(pos)special={at:pos,kind,ticks:52};
}
function advance(){
 const mission=goal();
 if(missionProgress()<mission.target||score<mission.minimum)return;
 level++;levelApples=0;level3Specials=0;
 highest=Math.max(highest,level);save();
 if(level===2){spawn('gold');setBarriers(2);}
 else if(level===3){if(!special)spawn('ice');setBarriers(4);}
 else if(level===4){if(!special)spawn('speed');setBarriers(5);}
 else setBarriers(Math.min(8,level+1));
 notify('Nível '+level+'! '+(level===4?'Nova fruta de velocidade!':'Novo desafio desbloqueado.'));
}
function schedule(){
 window.clearTimeout(gameTimer);
 if(state!=='playing')return;
 const base=level===1?165:level===2?145:Math.max(100,145-level*7);
 gameTimer=window.setTimeout(tick,Math.max(90,Math.round(base*(speedTicks>0?.75:iceTicks>0?1.25:1))));
}
function tick(){
 if(state!=='playing')return;
 direction=next;
 const offsets:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 const rawHead={x:snake[0].x+offsets[direction].x,y:snake[0].y+offsets[direction].y};
 const exit=rawHead.x<0?{side:'left' as const,index:snake[0].y}:rawHead.x>=boardSize?{side:'right' as const,index:snake[0].y}:rawHead.y<0?{side:'top' as const,index:snake[0].x}:rawHead.y>=boardSize?{side:'bottom' as const,index:snake[0].x}:null;
 const head={x:(rawHead.x+boardSize)%boardSize,y:(rawHead.y+boardSize)%boardSize};
 const collected:Item|null=same(head,food.at)?food:(special&&same(head,special.at)?special:null);
 const body=collected?snake:snake.slice(0,-1);
 if((exit&&hasEdgeWall(exit.side,exit.index))||body.some(p=>same(p,head))||barriers.some(p=>same(p,head))){finish();return;}
 snake.unshift(head);
 if(collected){
  if(collected.kind==='apple'){
   score+=10;apples++;levelApples++;normalSinceSpecial++;
   const pos=freeCell();if(pos)food={at:pos,kind:'apple'};else{finish();return;}
  }else{
   score+=collected.kind==='gold'?50:collected.kind==='ice'?15:collected.kind==='speed'?20:10;
   if(collected.kind==='gold')golds++;
   if(level===3)level3Specials++;
   if(collected.kind==='ice'){iceTicks=35;speedTicks=0;}
   if(collected.kind==='speed'){speedTicks=35;iceTicks=0;}
   special=null;normalSinceSpecial=0;
  }
  floatPoints(head,collected.kind==='gold'?50:collected.kind==='ice'?15:collected.kind==='speed'?20:10);
  if(score>best){best=score;save()}
  if(globalTarget!==null&&score>globalTarget)globalProvisional=true;
  recordGameScore('snake-adventure',score);
  advance();
  if(level>=2&&!special&&normalSinceSpecial>=2){
   spawn(level===2?'gold':level===3?(Math.random()<.5?'ice':'gold'):(['ice','gold','speed'] as const)[Math.floor(Math.random()*3)]);normalSinceSpecial=0;
  }
 }else snake.pop();
 if(special&&--special.ticks!<=0){special=null;normalSinceSpecial=1;}
 if(iceTicks>0)iceTicks--;
 if(speedTicks>0)speedTicks--;
 update();draw();schedule();
}
function turn(d:Direction){
 if(state!=='playing')return;
 const reverse:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};
 if(d!==reverse[direction])next=d;
}
function show(title:string,message:string,button:string){
 window.clearTimeout(countdownTimer);countdown.hidden=true;startBtn.hidden=false;
 text('adventure-overlay-title',title);text('adventure-overlay-text',message);
 startBtn.textContent=button;overlay.hidden=false;
}
function beginCountdown(first:boolean){
 window.clearTimeout(gameTimer);window.clearTimeout(countdownTimer);
 state='countdown';overlay.hidden=false;countdown.hidden=false;startBtn.hidden=true;
 text('adventure-overlay-title','Prepare-se');
 text('adventure-overlay-text',first?'A aventura começa em:':'A partida será retomada em:');
 let remaining=3;
 function step(){
  countdown.textContent=String(remaining);update();
  if(remaining===1)countdownTimer=window.setTimeout(()=>{countdown.hidden=true;startBtn.hidden=false;overlay.hidden=true;state='playing';update();schedule()},1000);
  else{remaining--;countdownTimer=window.setTimeout(step,1000)}
 }
 step();
}
const gameClock=setupGameClock(screen,()=>state==='playing');
function start(){
 gameClock.reset();
 floatLayer.replaceChildren();
 snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];direction='right';next='right';
 food={at:{x:14,y:10},kind:'apple'};special=null;
 score=0;level=1;apples=0;golds=0;level3Specials=0;normalSinceSpecial=0;iceTicks=0;speedTicks=0;levelApples=0;globalProvisional=false;setBarriers(0);
 adventureCounters.recordPlay(recordGameStart('snake-adventure'));
 plays++;save();window.clearTimeout(bannerTimer);banner.hidden=true;draw();update();centerGameBoard(screen,stage);beginCountdown(true);
}
function finish(){
 const durationMs=gameClock.milliseconds();
 state='over';globalProvisional=false;window.clearTimeout(gameTimer);window.clearTimeout(bannerTimer);
 banner.hidden=true;save();
 recordGameFinish('snake-adventure',score,durationMs);
 const target=globalTarget!==null&&globalTarget>score?globalTarget:best>score?best:null;
 const missing=target===null?null:target-score;
 const encouragement=missing!==null&&missing<=50?'Faltaram apenas '+missing+' pontos para alcançar '+(globalTarget!==null&&target===globalTarget?'o recorde global':'seu recorde')+'! Tente novamente.':'Continue tentando superar seus recordes!';
 show('Fim da Aventura','Você marcou '+score+' pontos e chegou ao nível '+level+'. '+encouragement,'▶ Jogar novamente');
 update();
}
function pause(){
 if(state==='playing'){state='paused';window.clearTimeout(gameTimer);show('Jogo pausado','Sua partida está preservada.','▶ Continuar');update()}
 else if(state==='paused'){centerGameBoard(screen,stage);beginCountdown(false);}
}
startBtn.addEventListener('click',()=>state==='paused'?pause():start());
pauseBtn.addEventListener('click',pause);
document.querySelectorAll<HTMLButtonElement>('[data-adventure-direction]').forEach(btn=>btn.addEventListener('click',()=>turn(btn.dataset.adventureDirection as Direction)));
window.addEventListener('keydown',e=>{
 if((e.target as HTMLElement).matches('input,textarea,button,[contenteditable]'))return;
 const map:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};
 const d=map[e.key]||map[e.key.toLowerCase()];
 if(d&&state==='playing'){e.preventDefault();turn(d)}
 if(e.code==='Space'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){
   if(state==='over'||state==='ready'){e.preventDefault();start()}
   else if(state==='playing'||state==='paused'){e.preventDefault();pause()}
  }
 if(e.key.toLowerCase()==='f'&&!e.repeat&&!e.ctrlKey&&!e.metaKey){e.preventDefault();void toggleFullscreen()}
});
let touch:Point|null=null;
canvas.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
canvas.addEventListener('touchend',e=>{
 if(!touch||!e.changedTouches.length)return;
 const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;
 if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
 e.preventDefault();turn(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');
},{passive:false});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});
document.addEventListener('oldarcade:mode-ranking-updated',event=>{
 const d=(event as CustomEvent<{game:string;global:number|null}>).detail;
 if(d?.game!=='snake-adventure')return;
 globalTarget=d.global;
 if(state!=='playing'&&state!=='countdown')globalProvisional=false;
 update();
});
document.addEventListener('oldarcade:mode-record-provisional',event=>{
 const d=(event as CustomEvent<{game:string;score:number}>).detail;
 if(d?.game!=='snake-adventure')return;
 globalProvisional=true;notify('🏆 Meta global superada! Liderança provisória.');update();
});
async function toggleFullscreen(){
 if(changingFullscreen)return;
 changingFullscreen=true;
 const resume=state==='playing'||state==='countdown';
 if(resume){window.clearTimeout(gameTimer);window.clearTimeout(countdownTimer);state='paused';}
 try{
  if(document.fullscreenElement===stage)await document.exitFullscreen();
  else if(document.fullscreenElement)await document.exitFullscreen();
  else if(stage.requestFullscreen)await stage.requestFullscreen();
 }catch{
  // Fullscreen pode ser negado por política do navegador; o jogo continua seguro.
 }finally{
  changingFullscreen=false;
  fullscreenBtn.textContent=document.fullscreenElement===stage?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
  if(document.fullscreenElement!==stage)centerGameBoard(screen,stage);
  if(resume)beginCountdown(false);
 }
}
fullscreenBtn.addEventListener('click',()=>{void toggleFullscreen()});
document.addEventListener('fullscreenchange',()=>{
 fullscreenBtn.textContent=document.fullscreenElement===stage?'⤢ Sair da tela cheia (F)':'⛶ Tela cheia (F)';
 if(changingFullscreen)return;
 if(state==='playing'||state==='countdown'){
  window.clearTimeout(gameTimer);window.clearTimeout(countdownTimer);state='paused';
  beginCountdown(false);
 }
 if(document.fullscreenElement!==stage)centerGameBoard(screen,stage);
});
setBarriers(0);update();draw();
