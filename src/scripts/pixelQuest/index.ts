import {worldOneLevels,worldOneTotal} from '../../data/pixelQuest/world-1';
import {entranceForLevel,stageTitle,STAGE_INTRO_MS} from './stageIntro';
import {validateLevel} from './levels';
import {cameraX,STEP} from './physics';
import {createRun,stepRun,levelDefeated,totalDefeated,type Run} from './gameplay';
import {drawPlatformScene,VIEW_WIDTH,VIEW_HEIGHT,pixelQuestVerticalOffset} from './render';
import {setupPlatformInput} from './input';
import {setCountdownOverlay} from '../gameCountdownOverlay';
import {centerGameBoard} from '../gameViewport';
import {setupGameClock} from '../gameClock';
import {timeBonus,type LevelResult} from './scoring';
import {showWorldScoreFeedback} from '../scoreFeedback';
import {readLocalRecord,updateLocalRecord} from './records';
import {campaignSnapshot} from './campaignLedger';
import {setupQuestStageRecords} from './questStageRecords';
import {setupQuestProgress} from './questProgressClient';
import {setupQuestRunRankings} from './questRunRankings';
import type {RankingCelebration} from './rankingVisuals';

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
 const powerStatus=stage.querySelector<HTMLElement>('#pq-powerup-status')!;
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
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // O HUD exibe recorde da fase atual; o ranking geral permanece na página.
 let levelIndex=0,level=worldOneLevels[levelIndex];
 let results:LevelResult[]=[];
 let bossIntroShown=false;
 let run:Run=createRun(level),camera=0;
 // Relógio de mundo independente da câmera: pode avançar mesmo quando o jogador retorna.
 let worldElapsedMs=0;
 let rankingFx:RankingCelebration|null=null;
 const completeScore=()=>results.reduce((sum,item)=>sum+item.score,0);
 const milestones=setupQuestRunRankings(milestone=>{
  rankingFx={rank:milestone.rank,message:milestone.message,detail:milestone.detail,startedAt:performance.now()};
 },message=>{
  // Mensagem oficial de reconciliação, após o POST no D1.
  rankingNotice.textContent=message;rankingNotice.hidden=false;
 });
 const rankingNotice=document.createElement('p');
 rankingNotice.id='pq-ranking-notice';rankingNotice.className='small';rankingNotice.hidden=true;
 rankingNotice.setAttribute('role','status');rankingNotice.setAttribute('aria-live','polite');
 const statusline=stage.querySelector<HTMLElement>('.pq-statusline');
 statusline?.after(rankingNotice);
 document.addEventListener('oldarcade:ranking-confirmed',event=>{
  const data=(event as CustomEvent<{game:string;scope:string;score:number;mine?:{rank:number;score:number}|null}>).detail;
  if(data?.game==='pixel-quest'&&data.scope==='total')milestones.confirm('total',data.score,data.mine);
 });
 const stageRanks=setupQuestStageRecords((id,board)=>{
  if(id!==level.id||!board.available)return;
  bestGeneral.textContent=board.top?.[0]?String(board.top[0].score):'—';
  if(board.mine)bestLevel.textContent=String(board.mine.score);
  if(board.saved&&board.mine)milestones.confirm('fase',board.mine.score,board.mine);
 });
 let phase:'ready'|'countdown'|'intro'|'playing'|'paused'|'won'|'lost'='ready';
 let restoredFromServer=false;
 const progress=setupQuestProgress(completed=>{
  if(phase!=='ready')return;
  if(completed.length===0){
   // Uma segunda conta sem progresso não herda a fase restaurada da conta anterior.
   if(!restoredFromServer)return;
   restoredFromServer=false;results=[];worldElapsedMs=0;levelIndex=0;level=worldOneLevels[0];
   reset();
   title.textContent='Preparado para explorar?';
   description.textContent='Sua conta ainda não tem fases concluídas neste mundo.';
   return;
  }
  if(completed.length>=worldOneTotal)return;
  // Não descartar uma campanha local já em andamento ao fazer o primeiro login.
  if(results.length>0&&!restoredFromServer)return;
  restoredFromServer=true;results=completed.slice();worldElapsedMs=results.reduce((sum,stage)=>sum+stage.elapsedMs,0);
  levelIndex=completed.length;level=worldOneLevels[levelIndex];
  reset();
  title.textContent='Continuar aventura salva';
  description.textContent='Sua conta salvou '+completed.length+' fase(s). Continue na fase '+(levelIndex+1)+'/'+worldOneTotal+'.';
 });
 let countdownTimer:number|undefined,introTimer:number|undefined,seconds=3,previous=0,accumulator=0;
 const clock=setupGameClock(screen,()=>phase==='playing');
 const totalCrystals=()=>level.entities.filter(entity=>entity.kind==='crystal').length;
 function updateLocalRecords(){
  bestLevel.textContent=readLocalRecord('level-v2-'+level.id)?.score.toString()??'—';
  // HUD global pertence ao leaderboard, enquanto a campanha local mantém sua chave própria.
 }
 function updateHud(){
  score.textContent=String(run.score);
  hearts.textContent='♥'.repeat(run.hearts)+'♡'.repeat(3-run.hearts);
  crystals.textContent=run.crystals.size+'/'+totalCrystals();
  checkpoint.textContent=run.checkpointActive?'Ativado':'Não';
  const activePowers:string[]=[];
  if(run.shield>0)activePowers.push('Escudo '+run.shield);
  if(run.frenzyTime>0)activePowers.push('2× '+Math.ceil(run.frenzyTime)+'s');
  powerStatus.textContent='Poderes: '+(activePowers.join(' · ')||'nenhum');
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
  clearIntro();bossIntroShown=false;
  run=createRun(level,results.reduce((sum,item)=>sum+item.enemies,0));
  camera=0;accumulator=0;rankingFx=null;rankingNotice.hidden=true;rankingNotice.textContent='';
  clock.reset();input.reset();updateHud();updateLocalRecords();
  drawPlatformScene(canvas,level,run,camera,worldElapsedMs,levelIndex,reducedMotion,
   completeScore()-(phase==='won'?run.score:0),rankingFx,performance.now());
  bestGeneral.textContent='—';void stageRanks.refresh(level.id);
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
 function beginBossIntro(){
  setPhase('intro');overlay.hidden=true;
  introWorld.textContent='CHEFÃO DO MUNDO 1';
  introProgress.textContent='GUARDIÃO DA FLORESTA';
  introCode.textContent='Fase 3/3 · 1-3';
  intro.dataset.entrance='boss';intro.hidden=false;
  input.reset();
  introTimer=window.setTimeout(()=>{
   introTimer=undefined;intro.hidden=true;setPhase('playing');
   previous=performance.now();accumulator=0;
  },2200);
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
   const result:LevelResult={levelId:level.id,score:run.score+timeBonus(run.elapsedMs),
    elapsedMs:run.elapsedMs,crystals:run.crystals.size,enemies:levelDefeated(run)};
   // Pontuação de eventos + bônus de conclusão e tempo é reconciliada na vitória.
   run.score=result.score;
   milestones.score(result.score,completeScore()+result.score);
   results.push(result);
   milestones.end(level.id,result.score,completeScore());
   progress.record(results);
   updateLocalRecord('level-v2-'+level.id,{score:result.score,elapsedMs:result.elapsedMs});
   const snapshot=campaignSnapshot(results,null,levelIndex===worldOneTotal-1);
   updateLocalRecord('campaign-total-v2',{score:snapshot.score,elapsedMs:snapshot.elapsedMs});
   stageRanks.record({levelId:level.id,score:result.score,durationMs:Math.round(result.elapsedMs)});
   updateLocalRecords();
   document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'pixel-quest',score:snapshot.score,durationMs:Math.round(snapshot.elapsedMs)}}));
   description.textContent=`Fase ${levelIndex+1}/${worldOneTotal} (${level.id}): ${result.score} pontos · ${result.crystals} cristais · ${result.enemies} inimigos · Power-ups e combos incluídos · Tempo +${timeBonus(result.elapsedMs)}.`+(levelIndex===worldOneTotal-1?' Mundo 2: Cavernas de Cristal, em desenvolvimento. Mundo 3: Fortaleza do Portal, em breve.':' A próxima fase está disponível.');
  }else{
   const snapshot=campaignSnapshot(results,{score:run.score,elapsedMs:run.elapsedMs},false);
   milestones.end(level.id,run.score,snapshot.score);
   updateLocalRecord('level-v2-'+level.id,{score:run.score,elapsedMs:run.elapsedMs});
   updateLocalRecord('campaign-total-v2',{score:snapshot.score,elapsedMs:snapshot.elapsedMs});
   stageRanks.record({levelId:level.id,score:run.score,durationMs:Math.round(run.elapsedMs)});
   document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'pixel-quest',score:snapshot.score,durationMs:Math.round(snapshot.elapsedMs)}}));
   description.textContent='Seus corações acabaram. Pontos conquistados nesta campanha: '+snapshot.score+'. Você pode tentar esta fase novamente.';
  }
  start.textContent=won?(levelIndex===worldOneTotal-1?'↻ Recomeçar aventura':'▶ Próxima fase'):'↻ Tentar novamente';start.hidden=false;input.reset();updateHud();
 }
 function startGame(){
  if(phase==='ready'||phase==='won'||phase==='lost'){
   document.dispatchEvent(new CustomEvent('oldarcade:game-started',{detail:{game:'pixel-quest'}}));
  }
  if(phase==='won'){
   if(levelIndex<worldOneTotal-1)levelIndex++;
   else{levelIndex=0;results=[];worldElapsedMs=0}
   level=worldOneLevels[levelIndex];
  }
  if(phase==='ready'||phase==='won'||phase==='lost')reset();
  if(phase==='ready'||phase==='won'||phase==='lost'){
   milestones.begin(level.id,readLocalRecord('level-v2-'+level.id)?.score??null,
    readLocalRecord('campaign-total-v2')?.score??null);
  }
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
    const celebrating=run.bossCelebrationMs>0;
    stepRun(run,level,input.read(),STEP);
    if(!celebrating&&run.phase==='playing')worldElapsedMs+=STEP*1000;
    if(run.phase==='playing'&&run.score>0)milestones.score(run.score,completeScore()+run.score);
    camera=cameraX(run.player,camera,level,VIEW_WIDTH);
    for(const event of run.scoreEvents.splice(0)){
     showWorldScoreFeedback(screen,canvas,event.amount,event.context,
      event.x-camera,event.y-pixelQuestVerticalOffset(level,run.player.y),VIEW_WIDTH,VIEW_HEIGHT);
    }
    accumulator-=STEP;
    if(run.phase==='playing'&&run.boss&&!bossIntroShown&&run.player.x>run.boss.origin-430){
     bossIntroShown=true;beginBossIntro();break;
    }
    if(run.phase!=='playing'){finish(run.phase==='won');break}
   }
   updateHud();
  }
  drawPlatformScene(canvas,level,run,camera,worldElapsedMs,levelIndex,reducedMotion);
  requestAnimationFrame(frame);
 }
 setPhase('ready');updateHud();updateLocalRecords();drawPlatformScene(canvas,level,run,camera,worldElapsedMs,levelIndex,reducedMotion);void stageRanks.refresh(level.id);
 document.dispatchEvent(new CustomEvent('oldarcade:mode-ranking-request',{detail:{game:'pixel-quest'}}));
 requestAnimationFrame(frame);
}
