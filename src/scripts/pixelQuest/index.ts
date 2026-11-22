import {worldOneLevels,worldOneTotal} from '../../data/pixelQuest/world-1';
import {entranceForLevel,stageTitle,STAGE_INTRO_MS} from './stageIntro';
import {validateLevel} from './levels';
import {cameraX,STEP} from './physics';
import {createRun,stepRun,levelDefeated,totalDefeated,type Run} from './gameplay';
import {drawPlatformScene,VIEW_WIDTH} from './render';
import {setupPlatformInput} from './input';
import {setCountdownOverlay} from '../gameCountdownOverlay';
import {centerGameBoard} from '../gameViewport';
import {setupGameClock} from '../gameClock';
import {calculateCompletedLevel,timeBonus,type LevelResult} from './scoring';
import {readLocalRecord,recordCompletedLevel} from './records';

const stage=document.querySelector<HTMLElement>('#pq-stage')!;
if(stage){
 for(const level of worldOneLevels)validateLevel(level);
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
 const levelKills=stage.querySelector<HTMLElement>('#pq-level-defeated')!;
 const portalStatus=stage.querySelector<HTMLElement>('#pq-portal-status')!;
 const crystalsRemaining=stage.querySelector<HTMLElement>('#pq-crystals-remaining')!;
 const enemiesRemaining=stage.querySelector<HTMLElement>('#pq-enemies-remaining')!;
 const crystalsProgress=stage.querySelector<HTMLProgressElement>('#pq-crystals-remaining-bar')!;
 const enemiesProgress=stage.querySelector<HTMLProgressElement>('#pq-enemies-remaining-bar')!;
 const bestLevel=stage.querySelector<HTMLElement>('#pq-best')!;
 const bestGeneral=stage.querySelector<HTMLElement>('#pq-global')!;
 const intro=stage.querySelector<HTMLElement>('#pq-stage-intro')!;
 const introWorld=stage.querySelector<HTMLElement>('#pq-intro-world')!;
 const introProgress=stage.querySelector<HTMLElement>('#pq-intro-progress')!;
 const introCode=stage.querySelector<HTMLElement>('#pq-intro-code')!;
 const levelLabel=stage.querySelector<HTMLElement>('#pq-level-label')!;
 const input=setupPlatformInput(stage);
 document.addEventListener('oldarcade:mode-ranking-updated',event=>{
  const d=(event as CustomEvent<{game:string;global:number|null;personal:number|null}>).detail;
  if(d?.game!=='pixel-quest')return;
  bestGeneral.textContent=d.global===null?'—':String(d.global);
 });
 let levelIndex=0,level=worldOneLevels[levelIndex];
 let results:LevelResult[]=[];
 let run:Run=createRun(level),camera=0;
 let phase:'ready'|'countdown'|'intro'|'playing'|'paused'|'won'|'lost'='ready';
 let countdownTimer:number|undefined,introTimer:number|undefined,seconds=3,previous=0,accumulator=0;
 const clock=setupGameClock(screen,()=>phase==='playing');
 const totalCrystals=()=>level.entities.filter(entity=>entity.kind==='crystal').length;
 function updateLocalRecords(){
  bestLevel.textContent=readLocalRecord('level-'+level.id)?.score.toString()??'—';
  // HUD global pertence ao leaderboard, enquanto a campanha local mantém sua chave própria.
 }
 function updateHud(){
  score.textContent=String(run.score);
  hearts.textContent='♥'.repeat(run.hearts)+'♡'.repeat(3-run.hearts);
  crystals.textContent=run.crystals.size+'/'+totalCrystals();
  checkpoint.textContent=run.checkpointActive?'Ativado':'Não';
  const defeatedCount=levelDefeated(run);
  defeated.textContent=String(totalDefeated(run));
  levelKills.textContent=String(defeatedCount);
  levelEnemies.textContent=(run.enemies.length-defeatedCount)+'/'+run.enemies.length;
  crystalsProgress.max=Math.max(1,totalCrystals());
  crystalsProgress.value=run.crystals.size;
  enemiesProgress.max=Math.max(1,run.enemies.length);
  enemiesProgress.value=defeatedCount;
  crystalsRemaining.textContent=String(totalCrystals()-run.crystals.size);
  enemiesRemaining.textContent=String(run.enemies.length-defeatedCount);
  portalStatus.textContent=run.crystals.size===totalCrystals() && (!run.boss||run.boss.hearts<=0)?'Portal liberado · todos os cristais coletados':run.boss?.hearts?'Derrote o Guardião para abrir o portal':`Portal bloqueado · ${run.crystals.size}/${totalCrystals()} cristais`;
  levelLabel.textContent=`Mundo 1 · Fase ${levelIndex+1}/${worldOneTotal} · ${level.id}`;
 }
 function setPhase(next:typeof phase){
  phase=next;
  status.textContent=next==='playing'?'● Jogando':next==='intro'?'● Apresentação':next==='countdown'?'● Preparando':next==='paused'?'● Pausado':next==='lost'?'● Fim de jogo':next==='won'?'● Fase concluída':'● Pronto';
  pause.textContent=next==='paused'?'Retomar':'Pausar';
  pause.disabled=next==='ready'||next==='won'||next==='lost'||next==='countdown'||next==='intro';
 }
 function clearCountdown(){if(countdownTimer!==undefined)window.clearInterval(countdownTimer);countdownTimer=undefined;setCountdownOverlay(overlay,countdown,start,false)}
 function reset(){
  clearIntro();
  run=createRun(level,results.reduce((sum,item)=>sum+item.enemies,0));
  camera=0;accumulator=0;clock.reset();input.reset();updateHud();updateLocalRecords();
  drawPlatformScene(canvas,level,run,camera);
 }
 function clearIntro(){
  if(introTimer!==undefined)window.clearTimeout(introTimer);
  introTimer=undefined;intro.hidden=true;
 }
 function beginIntro(){
  setPhase('intro');overlay.hidden=true;
  const label=stageTitle(level.id,levelIndex+1,worldOneTotal,level.world);
  introWorld.textContent=label.world;introProgress.textContent=label.progress;introCode.textContent=label.code;
  intro.dataset.entrance=entranceForLevel(levelIndex);
  intro.hidden=false;
  input.reset();
  introTimer=window.setTimeout(()=>{
   introTimer=undefined;intro.hidden=true;setPhase('playing');
   previous=performance.now();accumulator=0;
  },STAGE_INTRO_MS);
 }
 function beginCountdown(){
  clearCountdown();clearIntro();input.reset();setPhase('countdown');overlay.hidden=false;seconds=3;
  title.hidden=true;description.hidden=true;countdown.textContent='3';
  setCountdownOverlay(overlay,countdown,start,true);
  centerGameBoard(screen,stage);
  countdownTimer=window.setInterval(()=>{
   seconds--;
   if(seconds<=0){clearCountdown();beginIntro()}
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
  clearCountdown();clearIntro();setPhase(won?'won':'lost');overlay.hidden=false;title.hidden=false;description.hidden=false;
  title.textContent=won?(levelIndex===worldOneTotal-1?'Mundo 1 concluído!':'Portal alcançado!'):'Fim de jogo';
  if(won){
   const result:LevelResult=calculateCompletedLevel(level.id,run.crystals.size,levelDefeated(run),run.elapsedMs,Boolean(run.boss&&run.boss.hearts<=0));
   // Pontuação de eventos + bônus de conclusão e tempo é reconciliada na vitória.
   run.score=result.score;
   results.push(result);
   recordCompletedLevel(result,results,worldOneTotal);
   updateLocalRecords();
   // Ranking v1 continua EXCLUSIVAMENTE com 1-1; outras fases não contaminam recordes antigos.
   if(level.id==='1-1')document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'pixel-quest',score:result.score,durationMs:Math.round(result.elapsedMs)}}));
   description.textContent=`Fase ${levelIndex+1}/${worldOneTotal} (${level.id}): ${result.score} pontos · Cristais ${result.crystals*10} · Inimigos ${result.enemies*50} · Portal 100 · Tempo +${timeBonus(result.elapsedMs)}.`+(levelIndex===worldOneTotal-1?' Mundo 2: Cavernas de Cristal, em desenvolvimento. Mundo 3: Fortaleza do Portal, em breve.':' A próxima fase está disponível.');
  }else description.textContent='Seus três corações acabaram. Tente novamente a trilha.';
  start.textContent=won?(levelIndex===worldOneTotal-1?'↻ Recomeçar aventura':'▶ Próxima fase'):'↻ Tentar novamente';start.hidden=false;input.reset();updateHud();
 }
 function startGame(){
  if(phase==='won'){
   if(levelIndex<worldOneTotal-1)levelIndex++;
   else{levelIndex=0;results=[]}
   level=worldOneLevels[levelIndex];
  }
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
    stepRun(run,level,input.read(),STEP);
    camera=cameraX(run.player,camera,level,VIEW_WIDTH);
    accumulator-=STEP;
    if(run.phase!=='playing'){finish(run.phase==='won');break}
   }
   updateHud();
  }
  drawPlatformScene(canvas,level,run,camera);
  requestAnimationFrame(frame);
 }
 setPhase('ready');updateHud();updateLocalRecords();drawPlatformScene(canvas,level,run,camera);
 document.dispatchEvent(new CustomEvent('oldarcade:mode-ranking-request',{detail:{game:'pixel-quest'}}));
 requestAnimationFrame(frame);
}
