import {setupGameClock} from './gameClock';
import {setCountdownOverlay} from './gameCountdownOverlay';
import {nextSnakeMilestone,showSnakeMoment} from './snakeMilestones';
import {arcadePersonality} from './arcadePersonality';
import { setupGlobalLeaderboard } from './globalLeaderboard';
import {centerGameBoard} from './gameViewport';
import { setupGlobalGameCounters } from './globalGameCounters';
import {recordGameStart,recordGameFinish} from './gameEvents';
import {seededRandom,dailyMissionWon} from '../data/dailyChallenges.js';
import {initialMissionState,advanceDailyMission} from '../data/dailyMissionEngine.js';
type Direction = 'up'|'down'|'left'|'right';
type Point = {x:number;y:number};
type Score = {name:string;score:number;at:number};
const canvas = document.querySelector<HTMLCanvasElement>('#snake-canvas')!;
const ctx = canvas.getContext('2d')!;
// Parede externa ao tabuleiro, sem cobrir células jogáveis.
if(location.pathname.replace(/\/+$/,'')==='/jogos/snake'){
 canvas.style.outline='7px solid #cf79ee';canvas.style.outlineOffset='0';
}
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
const evolutionPreview=location.pathname.replace(/\/+$/,'')==='/jogos/snake/evolution';
type DailyMission={version:number;kind:string;metric:string;target:number|null;timeLimitMs:number|null;title:string;description:string;hazards?:{obstacles:number;enemies:number}};
type DailyAttempt={date:string;token:string;seed:number;mission?:DailyMission;practice?:boolean};
let dailyAttempt:DailyAttempt|null=null;
let dailyRandom:()=>number=Math.random;
let pendingDailyFinish:{date:string;token:string;score:number;durationMs:number;linesCleared?:number}|null=null;
const modeId=evolutionPreview?'snake-evolution':'snake';
const globalCounters=setupGlobalGameCounters(modeId);
const leaderboard=setupGlobalLeaderboard(modeId);
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
let lastFunMilestone=0;
let lastFunAt=-100;
let dangerAnnounced=false;
let endSequence=0;
let roundDurationMs=0;
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
const key=evolutionPreview?'oldarcade:snake-evolution:v1':'oldarcade:snake:v1';
type Saved={best:number;plays:number;visits:number;nickname:string;scores:Score[];lastVisit:string};
function read():Saved {try{const raw=JSON.parse(localStorage.getItem(key)||'{}');return {best:Number(raw.best)||0,plays:Number(raw.plays)||0,visits:Number(raw.visits)||0,nickname:String(raw.nickname||'').slice(0,18),scores:Array.isArray(raw.scores)?raw.scores.filter((entry:Score)=>entry&&typeof entry.name==='string'&&entry.name.trim()&&entry.name!=='Anônimo'&&Number.isFinite(entry.score)).slice(0,20):[],lastVisit:String(raw.lastVisit||'')}}catch{return {best:0,plays:0,visits:0,nickname:'',scores:[],lastVisit:''}}}
let saved=read();
const sessionKey=key+':session';
try{if(!sessionStorage.getItem(sessionKey)){saved.visits++;sessionStorage.setItem(sessionKey,'1')}}catch{saved.visits++}
function store(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{}}
store();

type Item={point:Point;kind:'normal'|'rare'|'shrink'|'slow'|'blaster'|'scare';expires:number};
// Temporário: facilitar testes de todas as melhorias entre 0 e 100 pontos.
const EVOLUTION_FAST_TEST=false;
const unlock=(normal:number,test:number)=>EVOLUTION_FAST_TEST?test:normal;
type BorderWall={side:'top'|'bottom'|'left'|'right';index:number;hits:number;restoreAt:number};
let borderWalls:BorderWall[]=[];
let items:Item[]=[];let obstacles:Point[]=[];let obstacleHits=new Map<string,number>();type Projectile={point:Point;direction:Direction};
type Enemy={point:Point;kind:'hunter'|'ambusher'|'wanderer';heading:Direction};
let enemies:Enemy[]=[];let scareUntil=0;let projectiles:Projectile[]=[];let evolutionClock=0;let slowUntil=0;let blasterUntil=0;let nextShotAt=0;let lastRescue=-100;let peakScore=0;
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y;
const dailyHazardActive=()=>!evolutionPreview&&!!dailyAttempt?.mission?.hazards;
function setupDailyHazards(){
 const hazards=dailyAttempt?.mission?.hazards;
 if(!hazards||evolutionPreview)return;
 const positions:Point[]=[];
 for(let y=2;y<size-2;y++)for(let x=2;x<size-2;x++){
  if(y===10&&x>=5&&x<=15)continue;
  positions.push({x,y});
 }
 for(let i=positions.length-1;i>0;i--){
  const j=Math.floor(dailyRandom()*(i+1));
  [positions[i],positions[j]]=[positions[j],positions[i]];
 }
 obstacles=positions.slice(0,hazards.obstacles);
 enemies=positions.slice(hazards.obstacles,hazards.obstacles+hazards.enemies)
  .map((point,index)=>({point,kind:(index%2===0?'hunter':'ambusher') as Enemy['kind'],heading:'right' as Direction}));
}

const occupied=(p:Point)=>snake.some(q=>same(p,q))||items.some(q=>same(p,q.point))||obstacles.some(q=>same(p,q))||enemies.some(q=>same(p,q.point));
function freeCell():Point|null{const cells:Point[]=[];for(let x=0;x<size;x++)for(let y=0;y<size;y++)if(!occupied({x,y}))cells.push({x,y});return cells.length?cells[Math.floor(Math.random()*cells.length)]:null}
function addItem(kind:Item['kind'],lifetime=0){const point=kind==='shrink'?reachableRescueCell():freeCell();if(!point)return false;items.push({point,kind,expires:lifetime?evolutionClock+lifetime:0});return true}
function reachableRescueCell():Point|null{
 const start=snake[0],queue:[Point,number][]=[[start,0]],seen=new Set([start.x+','+start.y]);const candidates:Point[]=[];
 for(let i=0;i<queue.length;i++){
  const [p,d]=queue[i];if(d>=12)continue;
  for(const n of [{x:p.x+1,y:p.y},{x:p.x-1,y:p.y},{x:p.x,y:p.y+1},{x:p.x,y:p.y-1}]){
   const key=n.x+','+n.y;if(n.x<0||n.x>=size||n.y<0||n.y>=size||seen.has(key)||snake.some(q=>same(q,n))||obstacles.some(q=>same(q,n)))continue;
   seen.add(key);queue.push([n,d+1]);if(d>=1&&!items.some(q=>same(q.point,n)))candidates.push(n);
  }
 }
 return candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:null;
}
function stageLevel(){return (EVOLUTION_FAST_TEST?[0,30,60,90,130,170,220]:[0,100,250,600,1500,4000,10000]).filter(n=>peakScore>=n).length-1}
function borderAt(side:BorderWall['side'],index:number){return borderWalls.find(w=>w.side===side&&w.index===index&&w.restoreAt===0)}
function addBorderWall(){
 const candidates:Pick<BorderWall,'side'|'index'>[]=[];
 for(const side of ['top','bottom','left','right'] as const)for(let index=0;index<size;index++){
  if(borderWalls.some(w=>w.side===side&&w.index===index))continue;
  const edge=side==='top'?{x:index,y:0}:side==='bottom'?{x:index,y:size-1}:side==='left'?{x:0,y:index}:{x:size-1,y:index};
  if(snake.some(p=>same(p,edge)))continue;
  candidates.push({side,index});
 }
 if(candidates.length){const pick=candidates[Math.floor(Math.random()*candidates.length)];borderWalls.push({...pick,hits:0,restoreAt:0})}
}
function borderExit(head:Point):{side:BorderWall['side'];index:number}|null{
 if(head.x<0)return {side:'left',index:head.y};if(head.x>=size)return {side:'right',index:head.y};
 if(head.y<0)return {side:'top',index:head.x};if(head.y>=size)return {side:'bottom',index:head.x};return null;
}
function hitBorder(side:BorderWall['side'],index:number){const wall=borderAt(side,index);if(!wall)return;wall.hits++;if(wall.hits>=3){wall.restoreAt=evolutionClock+90;wall.hits=0}}
function regenerateBorders(){for(const wall of borderWalls){if(wall.restoreAt&&evolutionClock>=wall.restoreAt){wall.restoreAt=0;wall.hits=0}}}

/** Inimigos com decisões simples: perseguição, emboscada e patrulha. Só a cabeça sofre dano. */
function updateEnemies(){
 if(dailyHazardActive()){
  if(evolutionClock%3!==0)return;
 }else if(peakScore<10000)return;
 const max=peakScore>=16000?3:peakScore>=12500?2:1;
 if(!dailyHazardActive()&&enemies.length<max&&evolutionClock%50===0){
  const point=freeCell();
  if(point&&Math.abs(point.x-snake[0].x)+Math.abs(point.y-snake[0].y)>6){
   enemies.push({point,kind:(['hunter','ambusher','wanderer'] as const)[enemies.length],heading:'right'});
  }
 }
 if(!dailyHazardActive()&&enemies.length&&evolutionClock%55===0&&!items.some(i=>i.kind==='scare'))addItem('scare',50);
 if(evolutionClock%3!==0)return;
 const offsets:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 const head=snake[0];
 const forward=offsets[direction];
 const scared=evolutionClock<scareUntil;
 for(const enemy of enemies){
  const target=enemy.kind==='hunter'?head:enemy.kind==='ambusher'?{x:head.x+forward.x*4,y:head.y+forward.y*4}:{x:size-1-head.x,y:size-1-head.y};
  const options=(Object.keys(offsets) as Direction[]).map(dir=>({dir,point:{x:enemy.point.x+offsets[dir].x,y:enemy.point.y+offsets[dir].y}}))
   .filter(option=>option.point.x>=0&&option.point.y>=0&&option.point.x<size&&option.point.y<size&&!obstacles.some(p=>same(p,option.point))&&!enemies.some(other=>other!==enemy&&same(other.point,option.point))&&!borderWalls.some(w=>!w.restoreAt&&((w.side==='left'&&option.point.x===0&&option.point.y===w.index)||(w.side==='right'&&option.point.x===size-1&&option.point.y===w.index)||(w.side==='top'&&option.point.y===0&&option.point.x===w.index)||(w.side==='bottom'&&option.point.y===size-1&&option.point.x===w.index))));
  if(!options.length)continue;
  options.sort((a,b)=>{
   const distance=(p:Point)=>Math.abs(p.x-target.x)+Math.abs(p.y-target.y);
   const da=distance(a.point),db=distance(b.point);
   if(enemy.kind==='wanderer'&&!scared)return (a.dir===enemy.heading?-1:0)-(b.dir===enemy.heading?-1:0)||da-db;
   return scared?db-da:da-db;
  });
  enemy.point=options[0].point;enemy.heading=options[0].dir;
 }
}
function checkEnemyHead(){
 const head=snake[0];
 const enemyIndex=enemies.findIndex(enemy=>same(enemy.point,head));
 if(enemyIndex<0)return false;
 if(evolutionClock<scareUntil){
  enemies.splice(enemyIndex,1);funMoment('INIMIGO DERROTADO!',head);
  return false;
 }
 end(false);
 return true;
}
function advanceEvolution(){
 evolutionClock++;
 items=items.filter(item=>!item.expires||item.expires>evolutionClock);
 if(evolutionClock%16===0&&items.filter(i=>i.kind==='normal').length<Math.min(5,2+Math.floor(stageLevel()/2)))addItem('normal');
 if(peakScore>=unlock(100,30)&&evolutionClock%20===0&&items.filter(i=>i.kind==='rare').length===0)addItem('rare',38);
 if(peakScore>=unlock(250,60)&&evolutionClock%24===0&&items.filter(i=>i.kind==='slow').length===0)addItem('slow',32);
 if(peakScore>=unlock(600,90)&&evolutionClock%32===0&&obstacles.length<Math.min(8,1+stageLevel())){
  const point=freeCell();if(point&&Math.abs(point.x-snake[0].x)+Math.abs(point.y-snake[0].y)>4){obstacles.push(point);obstacleHits.set(point.x+','+point.y,0)}
 }
 if(peakScore>=unlock(4000,130)&&evolutionClock%30===0&&items.filter(i=>i.kind==='blaster').length===0)addItem('blaster',40);
 if(peakScore>=unlock(1500,90)&&evolutionClock%25===0&&borderWalls.filter(w=>!w.restoreAt).length<Math.min(36,stageLevel()*5))addBorderWall();
 regenerateBorders();
 const head=snake[0];const neighbors=[{x:head.x+1,y:head.y},{x:head.x-1,y:head.y},{x:head.x,y:head.y+1},{x:head.x,y:head.y-1}];
 const exits=neighbors.filter(p=>p.x>=0&&p.x<size&&p.y>=0&&p.y<size&&!snake.some(q=>same(p,q))&&!obstacles.some(q=>same(p,q))).length;
 if(score>=30&&snake.length>=12&&exits<=1&&evolutionClock-lastRescue>60&&!items.some(i=>i.kind==='shrink')){
  if(addItem('shrink',45)){lastRescue=evolutionClock;arcadePersonality(modeId,'rescue')}
 }
 if(score<30)items=items.filter(i=>i.kind!=='shrink');
 updateEnemies();
}
/** Projéteis avançam duas células por tick: movimento visível, sem laser instantâneo. */
function fireBlaster(){
 if(!evolutionPreview||state!=='playing'||evolutionClock>=blasterUntil)return;
 projectiles.push({point:{...snake[0]},direction});
}
function moveProjectiles(){
 const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 const active:Projectile[]=[];
 for(const shot of projectiles){
  let alive=true;
  for(let step=0;step<2;step++){
   const d=delta[shot.direction];
   const p={x:shot.point.x+d.x,y:shot.point.y+d.y};
   const exit=borderExit(p);
   if(exit){hitBorder(exit.side,exit.index);alive=false;break}
   shot.point=p;
   const obstacle=obstacles.findIndex(o=>same(o,p));
   if(obstacle>=0){
    const key=p.x+','+p.y,hits=(obstacleHits.get(key)??0)+1;
    if(hits>=3){obstacles.splice(obstacle,1);obstacleHits.delete(key)}
    else obstacleHits.set(key,hits);
    alive=false;break;
   }
   const index=items.findIndex(i=>same(i.point,p)&&(i.kind==='normal'||i.kind==='rare'));
   if(index>=0){
    const target=items.splice(index,1)[0];
    const points=target.kind==='rare'?50:10;
    score+=points;peakScore=Math.max(peakScore,score);floatPoints(p,points);checkFunMilestone(p);
    alive=false;break;
   }
  }
  if(alive)active.push(shot);
 }
 projectiles=active;
}

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
function draw(){ctx.fillStyle='#071a20';ctx.fillRect(0,0,600,600);ctx.strokeStyle='#122c32';ctx.lineWidth=1;for(let n=0;n<=size;n++){ctx.beginPath();ctx.moveTo(n*cell,0);ctx.lineTo(n*cell,600);ctx.moveTo(0,n*cell);ctx.lineTo(600,n*cell);ctx.stroke()}if(evolutionPreview){for(const item of items){const colors={normal:'#ff657c',rare:'#ffdc51',shrink:'#a17bff',slow:'#71d8ff',blaster:'#ff9c3d',scare:'#60e4cf'};ctx.fillStyle=colors[item.kind];ctx.beginPath();ctx.arc(item.point.x*cell+cell/2,item.point.y*cell+cell/2,cell*(item.kind==='rare'?.4:.33),0,Math.PI*2);ctx.fill();if(item.expires){ctx.strokeStyle='#fff9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(item.point.x*cell+cell/2,item.point.y*cell+cell/2,cell*.44,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,(item.expires-evolutionClock)/(item.kind==='rare'?38:45)));ctx.stroke()}}for(const block of obstacles){const hits=obstacleHits.get(block.x+','+block.y)??0;ctx.fillStyle='#8392a5';ctx.fillRect(block.x*cell+3,block.y*cell+3,cell-6,cell-6);if(hits){ctx.strokeStyle='#20242e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(block.x*cell+cell*.25,block.y*cell+4);ctx.lineTo(block.x*cell+cell*.5,block.y*cell+cell*.55);ctx.lineTo(block.x*cell+cell*.72,block.y*cell+cell-4);ctx.stroke()}}for(const wall of borderWalls){if(wall.restoreAt)continue;ctx.fillStyle='#cf79ee';const x=wall.side==='left'?0:wall.side==='right'?size-1:wall.index;const y=wall.side==='top'?0:wall.side==='bottom'?size-1:wall.index;const thickness=cell*.22;if(wall.side==='top')ctx.fillRect(x*cell,y*cell,cell,thickness);else if(wall.side==='bottom')ctx.fillRect(x*cell,(y+1)*cell-thickness,cell,thickness);else if(wall.side==='left')ctx.fillRect(x*cell,y*cell,thickness,cell);else ctx.fillRect((x+1)*cell-thickness,y*cell,thickness,cell)}for(const enemy of enemies){
 const cx=enemy.point.x*cell+cell/2,cy=enemy.point.y*cell+cell/2;
 ctx.fillStyle=evolutionClock<scareUntil?'#6988ff':enemy.kind==='hunter'?'#fa668b':enemy.kind==='ambusher'?'#f6b66e':'#c69cf9';
 ctx.beginPath();ctx.arc(cx,cy-2,cell*.34,Math.PI,0);ctx.lineTo(cx+cell*.34,cy+cell*.3);ctx.lineTo(cx-cell*.34,cy+cell*.3);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx-5,cy-3,3,0,Math.PI*2);ctx.arc(cx+5,cy-3,3,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#172633';ctx.beginPath();ctx.arc(cx-5,cy-3,1.4,0,Math.PI*2);ctx.arc(cx+5,cy-3,1.4,0,Math.PI*2);ctx.fill();
 }
 if(projectiles.length){ctx.fillStyle='#f7f2d2';for(const shot of projectiles){const p=shot.point;ctx.beginPath();ctx.arc(p.x*cell+cell/2,p.y*cell+cell/2,cell*.16,0,Math.PI*2);ctx.fill()}}}else{
 ctx.fillStyle='#ff657c';ctx.beginPath();ctx.arc(food.x*cell+cell/2,food.y*cell+cell/2,cell*.35,0,Math.PI*2);ctx.fill();
 if(dailyHazardActive()){
  for(const block of obstacles){ctx.fillStyle='#8598ad';ctx.fillRect(block.x*cell+4,block.y*cell+4,cell-8,cell-8);ctx.strokeStyle='#ffba82';ctx.lineWidth=2;ctx.strokeRect(block.x*cell+5,block.y*cell+5,cell-10,cell-10)}
  for(const enemy of enemies){const cx=enemy.point.x*cell+cell/2,cy=enemy.point.y*cell+cell/2;ctx.fillStyle='#f45d83';ctx.beginPath();ctx.arc(cx,cy,cell*.33,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(cx-7,cy-4,4,4);ctx.fillRect(cx+3,cy-4,4,4)}
 }
}snake.forEach((piece,i)=>{ctx.fillStyle=i===0?'#a0ffd0':'#46dca2';ctx.fillRect(piece.x*cell+2,piece.y*cell+2,cell-4,cell-4)});}
function floatPoints(at:Point,amount:number){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const board=canvas.getBoundingClientRect();
 const container=gameScreen.getBoundingClientRect();
 if(!board.width||!board.height)return;
 const item=document.createElement('span');
 item.className='score-float';
 item.textContent=(amount>0?'+':'')+amount;
 item.style.left=(board.left-container.left+(at.x+.5)*(board.width/size))+'px';
 item.style.top=(board.top-container.top+(at.y+.5)*(board.height/size))+'px';
 floatLayer.append(item);
 item.addEventListener('animationend',()=>item.remove(),{once:true});
 window.setTimeout(()=>item.remove(),1100);
}
/** Elogios de jogabilidade, independentes de recordes; não interrompem os controles. */
function funMoment(message:string,at:Point){
 showSnakeMoment(message,at,{canvas,container:gameScreen,layer:floatLayer,gridSize:size});
}
function checkFunMilestone(at:Point){
 const reached=nextSnakeMilestone(score,lastFunMilestone);
 if(!reached)return;
 lastFunMilestone=reached.index;
 funMoment(reached.message,at);
 lastFunAt=evolutionClock;
}
function placeFood(){const free:Point[]=[];for(let x=0;x<size;x++)for(let y=0;y<size;y++)if(!snake.some(p=>p.x===x&&p.y===y)&&!obstacles.some(p=>p.x===x&&p.y===y)&&!enemies.some(p=>p.point.x===x&&p.point.y===y))free.push({x,y});if(!free.length){end(true);return}food=free[Math.floor(dailyRandom()*free.length)]}
function schedule(){window.clearTimeout(timer);if(state==='playing')timer=window.setTimeout(tick,(evolutionPreview?Math.max(145,210-Math.floor(peakScore/100)*7):Math.max(75,155-Math.floor(score/50)*8))+(evolutionPreview&&evolutionClock<slowUntil?85:0))}
function tick(){if(state!=='playing')return;
 const mission=dailyAttempt?.mission;
 if(mission&&mission.version>=2&&mission.timeLimitMs!==null&&gameClock.milliseconds()>=mission.timeLimitMs){
  const elapsed=gameClock.milliseconds();
  // Um tick pode chegar alguns ms depois do prazo; sobreviver até o
  // limite é vitória, mas a corrida de frutas expirada é derrota.
  const measured=mission.metric==='duration'?mission.timeLimitMs:elapsed;
  missionState=advanceDailyMission(mission,missionState,{type:'tick',score,linesCleared:0,durationMs:measured});
  end(missionState.status==='won');return;
 }
 direction=next;const delta:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};const d=delta[direction];const rawHead={x:snake[0].x+d.x,y:snake[0].y+d.y};const exit=evolutionPreview?borderExit(rawHead):null;const head=evolutionPreview?{x:(rawHead.x+size)%size,y:(rawHead.y+size)%size}:rawHead;const picked=evolutionPreview?items.find(i=>same(i.point,head)):undefined;const eating=evolutionPreview?Boolean(picked&&picked.kind!=='shrink'&&picked.kind!=='slow'&&picked.kind!=='blaster'&&picked.kind!=='scare'):head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);if((!evolutionPreview&&(head.x<0||head.x>=size||head.y<0||head.y>=size))||(exit&&borderAt(exit.side,exit.index))||body.some(p=>p.x===head.x&&p.y===head.y)||((evolutionPreview||dailyHazardActive())&&obstacles.some(p=>same(p,head)))){end(false);return}snake.unshift(head);
 // Aviso temático de risco: somente quando há pouco espaço, sem criar frutas ou alterar pontos.
 const freeNeighbors=[{x:head.x+1,y:head.y},{x:head.x-1,y:head.y},{x:head.x,y:head.y+1},{x:head.x,y:head.y-1}].filter(p=>p.x>=0&&p.x<size&&p.y>=0&&p.y<size&&!snake.some(q=>q.x===p.x&&q.y===p.y)).length;
 if(score>=30&&snake.length>=12&&freeNeighbors<=1&&!dangerAnnounced){dangerAnnounced=true;arcadePersonality(modeId,'danger')}
 if(freeNeighbors>=3)dangerAnnounced=false;
 if(evolutionPreview){
  if(picked){items=items.filter(i=>i!==picked);if(picked.kind==='shrink'){score=Math.max(0,score-30);snake.splice(Math.max(4,snake.length-3));floatPoints(head,-30);if(picked.expires&&picked.expires-evolutionClock<=9)funMoment('SALVO NO ÚLTIMO SEGUNDO!',head)}else if(picked.kind==='slow'){slowUntil=evolutionClock+45;if(picked.expires&&picked.expires-evolutionClock<=9)funMoment('NA HORA CERTA!',head)}else if(picked.kind==='blaster'){blasterUntil=evolutionClock+70;nextShotAt=evolutionClock;if(picked.expires&&picked.expires-evolutionClock<=9)funMoment('QUE JOGADA!',head)}else if(picked.kind==='scare'){scareUntil=evolutionClock+75;funMoment('AGORA ELES FOGEM!',head)}}
  advanceEvolution();
  if(checkEnemyHead())return;
  moveProjectiles();
  if(evolutionClock<blasterUntil&&evolutionClock>=nextShotAt){fireBlaster();nextShotAt=evolutionClock+4}
 }
 if(dailyHazardActive()){
   evolutionClock++;
   updateEnemies();
   if(checkEnemyHead())return;
  }
  if(eating){const gained=evolutionPreview&&picked?.kind==='rare'?50:10;score+=gained;peakScore=Math.max(peakScore,score);floatPoints(head,gained);checkFunMilestone(head);
 if(!dailyAttempt&&score>saved.best){saved.best=score;store()}
 if(!evolutionPreview)placeFood();if(state!=='playing'){draw();return}}else if(!eating)snake.pop();
 if(!dailyAttempt&&score>saved.best){saved.best=score;store()}
 if(!dailyAttempt&&!didCelebratePersonal&&roundPersonalTarget>0&&score>roundPersonalTarget){
  didCelebratePersonal=true;
  celebrate('personal');
  document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:modeId,kind:'personal',message:'Você superou sua melhor marca!'}}));
 }
 if(!dailyAttempt&&globalKnown&&globalBest!==null&&globalBest>0&&score>globalBest&&!provisionalGlobal){
  provisionalGlobal=true;
  roundBeatGlobal=true;
  celebrate('global');
  document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:modeId,kind:'provisional',message:'Você passou a marca global! Confirmação ao final da partida.'}}));
 }
 const activeMission=dailyAttempt?.mission;
 if(activeMission&&activeMission.version>=2){
  missionState=advanceDailyMission(activeMission,missionState,{type:'tick',score,linesCleared:0,durationMs:gameClock.milliseconds()});
  if(missionState.status!=='playing'){end(missionState.status==='won');return}
 }
 if(dailyAttempt)document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{game:'snake',score,linesCleared:0,clearSequence:[],durationMs:gameClock.milliseconds()}}));
 draw();refresh();schedule()}
function cancelCountdown(){window.clearTimeout(countdownTimer);setCountdownOverlay(overlay,countValue,startBtn,false)}
function show(headline:string,description:string,button:string){cancelCountdown();title.textContent=headline;overlayText.textContent=description;startBtn.textContent=button;overlay.hidden=false}
let missionState=initialMissionState();
const gameClock=setupGameClock(gameScreen,()=>state==='playing');
function start(daily:DailyAttempt|null=null){dailyAttempt=daily;missionState=initialMissionState();
 if(dailyAttempt)document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'playing'}}));dailyRandom=daily?seededRandom(daily.seed):Math.random;gameClock.reset();endSequence++;items=[];obstacles=[];borderWalls=[];obstacleHits.clear();projectiles=[];enemies=[];scareUntil=0;evolutionClock=0;slowUntil=0;blasterUntil=0;nextShotAt=0;lastRescue=-100;peakScore=0;cancelCountdown();window.clearTimeout(timer);snake=[{x:7,y:10},{x:6,y:10},{x:5,y:10}];direction='right';next='right';score=0;food={x:14,y:10};roundPersonalTarget=Math.max(saved.best,personalCloudBest);
 setupDailyHazards();
 didCelebratePersonal=false;lastFunMilestone=0;lastFunAt=-100;dangerAnnounced=false;provisionalGlobal=false;roundBeatGlobal=false;
 resetAnnouncements();resetCelebrations();text('record-end-summary','');leaderboard.markRoundStart();floatLayer.replaceChildren();if(evolutionPreview){addItem('normal');addItem('normal')}if(!dailyAttempt){saved.plays++;store()}if(!daily?.practice)globalCounters.recordPlay(recordGameStart(modeId));draw();refresh();centerGameAfterExit();beginCountdown('A partida começa em:')}
function end(won:boolean){
 const durationMs=gameClock.milliseconds();roundDurationMs=durationMs;
 state='over';setStatus(won?'Vitória':'Fim de jogo');window.clearTimeout(timer);
 if(!dailyAttempt&&score>saved.best)saved.best=score;
 if(!dailyAttempt&&saved.nickname.trim()){
  saved.scores.push({name:saved.nickname.trim(),score,at:Date.now()});
  saved.scores.sort((a,b)=>b.score-a.score||a.at-b.at);saved.scores=saved.scores.slice(0,20);
 }
 if(!dailyAttempt)store();refresh();
 if(dailyAttempt?.practice){
  const attempt=dailyAttempt;
  const mission=attempt.mission;
  const duration=gameClock.milliseconds();
  // Mesmo avaliador de missão da API. Colisão nunca pode marcar vitória.
  const success=won&&missionState.status==='won'&&dailyMissionWon(mission,{score,durationMs:duration,linesCleared:0,clearSequence:[]})===true;
  dailyAttempt=null;dailyRandom=Math.random;
  show(success?'🏆 MISSÃO CUMPRIDA!':'META NÃO ALCANÇADA',
    (mission?.description||'')+' · '+score+' pontos · '+Math.floor(duration/1000)+' s. Teste quantas vezes quiser.','▶ Jogar Snake livre');
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:success?'finished':'idle'}}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-result',{detail:{game:'snake',success,mission:mission?.title||'',score,durationMs:duration}}));
  return;
 }
 if(dailyAttempt){
  const attempt=dailyAttempt;pendingDailyFinish={date:attempt.date,token:attempt.token,score,durationMs,linesCleared:0};
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'pending'}}));
  try{sessionStorage.setItem('oldarcade:daily:snake:pending',JSON.stringify(pendingDailyFinish))}catch{}
  dailyAttempt=null;dailyRandom=Math.random;
  overlay.hidden=true;const sequence=++endSequence;
  void saveDailyResult(sequence);
  return;
 }
 recordGameFinish(modeId,score,durationMs);
 overlay.hidden=true;
 const sequence=++endSequence;
 void finishRound(sequence,won);
}
async function saveDailyResult(sequence:number){
 const attempt=pendingDailyFinish;
 if(!attempt)return;
 show('Registrando desafio','Salvando seu desempenho na conta…','▶ Jogar Clássico');
 startBtn.disabled=true;
 try{
  const response=await fetch('/api/daily/snake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'finish',...attempt})});
  const result=await response.json() as {error?:string;saved?:boolean;retryAvailable?:boolean;missionSuccess?:boolean|null;mission?:DailyMission};
  if(!response.ok||(!result.saved&&!result.retryAvailable))throw Error(result.error||'Erro ao registrar a missão diária.');
  pendingDailyFinish=null;
  const won=result.missionSuccess===true||result.mission?.version===1;
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:won?'finished':'idle'}}));
  try{sessionStorage.removeItem('oldarcade:daily:snake:pending')}catch{}
  document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}}));
  if(sequence===endSequence&&state==='over'){
   show(won?'🏆 Missão cumprida!':'Meta não alcançada — tente novamente',
    'Você marcou '+attempt.score+' pontos em '+Math.round(attempt.durationMs/1000)+' segundos. '+
    (won?'Missão concluída!':'Sua missão continua disponível até você alcançar a meta.'),'▶ Jogar Snake livre');
   startBtn.disabled=false;
  }
 }catch(error){
  const message=error instanceof Error?error.message:'Não foi possível registrar.';
  try{sessionStorage.setItem('oldarcade:daily:snake:pending',JSON.stringify(attempt))}catch{}
  if(sequence===endSequence&&state==='over'){
   show('Resultado pendente','O resultado foi preservado neste navegador para reenvio. '+message,'↻ Reenviar resultado');
   startBtn.disabled=false;startBtn.dataset.dailyRetry='true';
  }
 }
}
document.addEventListener('oldarcade:daily-practice-start',event=>{
 const detail=(event as CustomEvent<{game:string;date:string;seed:number;mission:DailyMission}>).detail;
 if(detail?.game!=='snake'||evolutionPreview)return;
 if(state==='playing'||state==='paused'||state==='countdown'||dailyAttempt){
  document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-rejected',{detail:{game:'snake'}}));return;
 }
 pendingDailyFinish=null;
 try{sessionStorage.removeItem('oldarcade:daily:snake:pending')}catch{}
 start({date:detail.date,token:'',seed:detail.seed,mission:detail.mission,practice:true});
});
document.addEventListener('oldarcade:daily-start-request',event=>{
 const request=(event as CustomEvent<{game:string;date:string}>).detail;
 if(request?.game!=='snake'||evolutionPreview)return;
 const info=document.querySelector<HTMLElement>('[data-daily-info]');
 if(state==='playing'||state==='countdown'||dailyAttempt){if(info)info.textContent='Finalize ou pause a partida atual antes de iniciar o desafio diário.';document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}}));return}
 if(pendingDailyFinish){if(info)info.textContent='Você possui um resultado pendente. Reenvie antes de iniciar outra partida.';return}
 void (async()=>{
  if(info)info.textContent='Reservando sua única tentativa com o servidor…';
  try{
   const response=await fetch('/api/daily/snake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',date:request.date})});
   const data=await response.json() as {error?:string;date?:string;token?:string;seed?:number;mission?:DailyMission};
   if(!response.ok||!data.date||!data.token||!Number.isSafeInteger(data.seed))throw Error(data.error||'Não foi possível reservar sua tentativa.');
   start({date:data.date,token:data.token,seed:data.seed!,mission:data.mission});
   if(info)info.textContent='Desafio '+data.date+' iniciado. Boa sorte: esta é sua única tentativa!';
   document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}}));
  }catch(error){
   if(info)info.textContent=error instanceof Error?error.message:'Não foi possível iniciar.';
   document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}}));
  }
 })();
});

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

async function finishRound(sequence:number,won:boolean){
 let summary=`Você marcou ${score} pontos. `;
 let outcome:'leader'|'podium'|'rival'|'defeat'='defeat';
 let showAccount=false;
 if(!account)await checkAccount();
 if(account){
  try{
   const wasProvisional=roundBeatGlobal;
   const result=await leaderboard.submit(score,roundDurationMs);
   summary=confirmedResult(result,score,wasProvisional);
   if(result?.available&&result.mine?.rank===1&&result.top?.[0]?.nickname===result.mine.nickname)outcome='leader';
   else if(result?.available&&result.mine&&typeof result.mine.rank==='number'&&result.mine.rank<=3)outcome='podium';
   else if(result?.available&&wasProvisional&&result.top?.[0]&&result.top[0].score>score)outcome='rival';
  }catch(error){
   provisionalGlobal=false;refresh();
   summary=`Você marcou ${score} pontos, mas não foi possível confirmar o recorde: ${error instanceof Error?error.message:'erro de conexão'}.`;
  }
 }else{
  const wasProvisional=roundBeatGlobal;
  const result=await leaderboard.refresh('end');
  provisionalGlobal=false;refresh();
  if(result)summary=wasProvisional?'Você superou a meta durante a partida, mas precisa cadastrar uma conta para registrar o resultado. '+leaderboard.summary(result):`Você marcou ${score} pontos. ${leaderboard.summary(result)}`;
  showAccount=true;
  if(result)text('record-end-summary',leaderboard.summary(result));
 }
 if(sequence!==endSequence||state!=='over')return;
 // Primeiro mostra o resultado de forma cinematográfica; só depois libera o reinício.
 document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:modeId,kind:outcome,message:summary,final:true}}));
 window.setTimeout(()=>{
  if(sequence!==endSequence||state!=='over')return;
  show(won?'Tabuleiro completo!':'Fim de jogo',summary,'▶ Jogar novamente');
  if(showAccount&&!account)openRecordModal();
 },account?900:1800);
}

function pause(){if(state==='playing'){state='paused';window.clearTimeout(timer);show('Jogo pausado','A partida está preservada.','▶ Continuar');setStatus('Pausado');pauseBtn.textContent='Continuar'}else if(state==='paused'){beginCountdown('A partida será retomada em:')}}
function turn(d:Direction){if(state!=='playing')return;const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};if(d!==opposite[direction])next=d}

function beginCountdown(description='A partida será retomada em:'){
 cancelCountdown();window.clearTimeout(timer);
 state='countdown';setStatus('Preparando');
 title.textContent='Prepare-se';overlayText.textContent=description;
 overlay.hidden=false;setCountdownOverlay(overlay,countValue,startBtn,true);
 let remaining=3;
 function step(){
  countValue.textContent=String(remaining);setStatus('Retomando em '+remaining);
  if(remaining===1){
   countdownTimer=window.setTimeout(()=>{setCountdownOverlay(overlay,countValue,startBtn,false);overlay.hidden=true;state='playing';setStatus('Jogando');pauseBtn.textContent='Pausar';schedule()},1000);
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
  const result=await leaderboard.submit(score,roundDurationMs);
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
  const rankingResult=await leaderboard.submit(score,roundDurationMs);
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
  recordEmailOptIn:document.querySelector<HTMLInputElement>('#record-register-alert')!.checked,
  dailyEmailOptIn:document.querySelector<HTMLInputElement>('#record-register-daily-alert')!.checked
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

startBtn.addEventListener('click',()=>{
 if(startBtn.dataset.dailyRetry==='true'){
  delete startBtn.dataset.dailyRetry;
  void saveDailyResult(endSequence);
  return;
 }
 if(pendingDailyFinish)return;
 if(state==='paused')pause();else if(!dailyAttempt)start();
});
pauseBtn.addEventListener('click',pause);
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(btn=>btn.addEventListener('click',()=>turn(btn.dataset.direction as Direction)));
window.addEventListener('keydown',e=>{if(modalOpen)return;if(e.target instanceof HTMLInputElement)return;const map:Record<string,Direction>={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(e.key.toLowerCase()==='f'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();void toggleFullscreen()}else if(map[e.key]&&state==='playing'){e.preventDefault();turn(map[e.key])}else if(e.code==='Space'&&!e.repeat&&!e.altKey&&!e.ctrlKey&&!e.metaKey){if((state==='over'||state==='ready')&&!pendingDailyFinish&&!dailyAttempt){e.preventDefault();start()}else if(state==='playing'||state==='paused'){e.preventDefault();pause()}}});
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
if(evolutionPreview){const label=document.createElement('div');label.style.cssText='padding:8px;text-align:center;background:#44346d;color:#fff;font-weight:700';label.textContent='🧪 SNAKE EVOLUTION · PREVIEW · Disparos automáticos · Ranking próprio';gameScreen.before(label)}
try{
 const old=JSON.parse(sessionStorage.getItem('oldarcade:daily:snake:pending')||'null') as {date:string;token:string;score:number;durationMs:number}|null;
 if(old&&typeof old.date==='string'&&typeof old.token==='string'&&Number.isSafeInteger(old.score)&&Number.isSafeInteger(old.durationMs)){
  pendingDailyFinish=old;
  show('Resultado diário pendente','Sua tentativa anterior não pode ser repetida. Reenvie o resultado salvo.','↻ Reenviar resultado');
  startBtn.dataset.dailyRetry='true';
 }
}catch{}
refresh();draw();drawAccountResults();
