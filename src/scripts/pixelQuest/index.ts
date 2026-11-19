import {firstLevel} from '../../data/pixelQuest/level-1-1';
import {validateLevel} from './levels';
import {cameraX,STEP} from './physics';
import {createRun,stepRun,type Run} from './gameplay';
import {drawPlatformScene,VIEW_WIDTH} from './render';
import {setupPlatformInput} from './input';
import {setCountdownOverlay} from '../gameCountdownOverlay';
import {centerGameBoard} from '../gameViewport';
import {setupGameClock} from '../gameClock';

const stage=document.querySelector<HTMLElement>('#pq-stage')!;
if(stage){
 validateLevel(firstLevel);
 const screen=stage.querySelector<HTMLElement>('#pq-screen')!;
 const canvas=stage.querySelector<HTMLCanvasElement>('#pq-canvas')!;
 const overlay=stage.querySelector<HTMLElement>('#pq-overlay')!;
 const title=stage.querySelector<HTMLElement>('#pq-title')!;
 const description=stage.querySelector<HTMLElement>('#pq-description')!;
 const countdown=stage.querySelector<HTMLElement>('#pq-countdown')!;
 const start=stage.querySelector<HTMLButtonElement>('#pq-start')!;
 const pause=stage.querySelector<HTMLButtonElement>('#pq-pause')!;
 const fullscreen=stage.querySelector<HTMLButtonElement>('#pq-fullscreen')!;
 const status=stage.querySelector<HTMLElement>('#pq-status')!;
 const score=stage.querySelector<HTMLElement>('#pq-score')!;
 const hearts=stage.querySelector<HTMLElement>('#pq-hearts')!;
 const crystals=stage.querySelector<HTMLElement>('#pq-crystals')!;
 const checkpoint=stage.querySelector<HTMLElement>('#pq-checkpoint')!;
 const defeated=stage.querySelector<HTMLElement>('#pq-defeated')!;
 const levelEnemies=stage.querySelector<HTMLElement>('#pq-level-enemies')!;
 const portalStatus=stage.querySelector<HTMLElement>('#pq-portal-status')!;
 const input=setupPlatformInput(stage);
 let run:Run=createRun(firstLevel),camera=0;
 let phase:'ready'|'countdown'|'playing'|'paused'|'won'|'lost'='ready';
 let countdownTimer:number|undefined,seconds=3,previous=0,accumulator=0;
 const clock=setupGameClock(screen,()=>phase==='playing');
 const totalCrystals=firstLevel.entities.filter(entity=>entity.kind==='crystal').length;
 function updateHud(){
  score.textContent=String(run.score);
  hearts.textContent='♥'.repeat(run.hearts)+'♡'.repeat(3-run.hearts);
  crystals.textContent=run.crystals.size+'/'+totalCrystals;
  checkpoint.textContent=run.checkpointActive?'Ativado':'Não';
  const defeatedCount=run.enemies.filter(enemy=>!enemy.alive).length;
  defeated.textContent=String(defeatedCount);
  levelEnemies.textContent=(run.enemies.length-defeatedCount)+'/'+run.enemies.length;
  portalStatus.textContent=run.crystals.size===totalCrystals?'Portal liberado · todos os cristais coletados':`Portal bloqueado · ${run.crystals.size}/${totalCrystals} cristais`;
 }
 function setPhase(next:typeof phase){
  phase=next;
  status.textContent=next==='playing'?'● Jogando':next==='countdown'?'● Preparando':next==='paused'?'● Pausado':next==='lost'?'● Fim de jogo':next==='won'?'● Fase concluída':'● Pronto';
  pause.textContent=next==='paused'?'Retomar':'Pausar';
  pause.disabled=next==='ready'||next==='won'||next==='lost'||next==='countdown';
 }
 function clearCountdown(){if(countdownTimer!==undefined)window.clearInterval(countdownTimer);countdownTimer=undefined;setCountdownOverlay(overlay,countdown,start,false)}
 function reset(){
  run=createRun(firstLevel);camera=0;accumulator=0;clock.reset();input.reset();updateHud();drawPlatformScene(canvas,firstLevel,run,camera);
 }
 function beginCountdown(){
  clearCountdown();input.reset();setPhase('countdown');overlay.hidden=false;seconds=3;
  title.hidden=true;description.hidden=true;countdown.textContent='3';
  setCountdownOverlay(overlay,countdown,start,true);
  centerGameBoard(screen,stage);
  countdownTimer=window.setInterval(()=>{
   seconds--;
   if(seconds<=0){clearCountdown();overlay.hidden=true;setPhase('playing');previous=performance.now();accumulator=0}
   else countdown.textContent=String(seconds);
  },1000);
 }
 function pauseGame(){
  if(phase==='playing'){
   setPhase('paused');input.reset();overlay.hidden=false;title.textContent='Jogo pausado';
   description.textContent='Seu progresso foi preservado.';title.hidden=false;description.hidden=false;
   start.textContent='▶ Retomar';start.hidden=false;centerGameBoard(screen,stage);
  }else if(phase==='paused')beginCountdown();
 }
 function finish(won:boolean){
  clearCountdown();setPhase(won?'won':'lost');overlay.hidden=false;title.hidden=false;description.hidden=false;
  title.textContent=won?'Portal alcançado!':'Fim de jogo';
  description.textContent=won?'Fase 1-1 concluída com '+run.score+' pontos. Esta é uma versão experimental.':'Seus três corações acabaram. Tente novamente a trilha.';
  start.textContent='↻ Jogar novamente';start.hidden=false;input.reset();updateHud();
 }
 function startGame(){
  if(phase==='ready'||phase==='won'||phase==='lost')reset();
  if(phase==='ready'||phase==='won'||phase==='lost'||phase==='paused')beginCountdown();
 }
 start.addEventListener('click',startGame);
 pause.addEventListener('click',pauseGame);
 const keyboard=(event:KeyboardEvent)=>{
  const target=event.target as HTMLElement|null;
  if(target?.matches('input,textarea,select,[contenteditable]'))return;
  if(event.key.toLowerCase()==='p'&&!event.repeat){event.preventDefault();pauseGame()}
  if(event.key.toLowerCase()==='f'&&!event.repeat){event.preventDefault();void toggleFullscreen()}
 };
 document.addEventListener('keydown',keyboard);
 async function toggleFullscreen(){
  if(document.fullscreenElement===stage){await document.exitFullscreen();return}
  if(stage.requestFullscreen)try{await stage.requestFullscreen();return}catch{}
  stage.classList.toggle('game-stage-fallback');
  document.body.classList.toggle('game-fallback-active',stage.classList.contains('game-stage-fallback'));
  if(phase==='playing')pauseGame();
  if(!stage.classList.contains('game-stage-fallback'))centerGameBoard(screen,stage);
 }
 fullscreen.addEventListener('click',()=>void toggleFullscreen());
 document.addEventListener('fullscreenchange',()=>{
  if(phase==='playing')pauseGame();
  else if(phase==='countdown'){
   clearCountdown();setPhase('paused');overlay.hidden=false;title.hidden=false;description.hidden=false;
   title.textContent='Jogo pausado';description.textContent='Retome quando quiser.';start.textContent='▶ Retomar';start.hidden=false;
  }
  if(!document.fullscreenElement)centerGameBoard(screen,stage);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='playing')pauseGame()});
 function frame(now:number){
  const dt=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
  if(phase==='playing'){
   accumulator=Math.min(accumulator+dt,STEP*4);
   while(accumulator>=STEP){
    stepRun(run,firstLevel,input.read(),STEP);
    camera=cameraX(run.player,camera,firstLevel,VIEW_WIDTH);
    accumulator-=STEP;
    if(run.phase!=='playing'){finish(run.phase==='won');break}
   }
   updateHud();
  }
  drawPlatformScene(canvas,firstLevel,run,camera);
  requestAnimationFrame(frame);
 }
 setPhase('ready');updateHud();drawPlatformScene(canvas,firstLevel,run,camera);requestAnimationFrame(frame);
}
