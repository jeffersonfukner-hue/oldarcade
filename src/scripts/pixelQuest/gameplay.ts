import {createPlayer,stepPlayer,STEP,type Player,type InputFrame} from './physics';
import type {Level} from './levels';

export type EnemyKind='patroller'|'runner'|'hopper'|'sentry';
export const ENEMY_KINDS=['patroller','runner','hopper','sentry'] as const;
export type EnemyKills=Record<EnemyKind,number>;
export const emptyEnemyKills=():EnemyKills=>({patroller:0,runner:0,hopper:0,sentry:0});
export const RESPAWN_SECONDS:EnemyKills={patroller:20,runner:24,hopper:18,sentry:30};
export type Enemy={id:number;kind:EnemyKind;x:number;y:number;origin:number;originY:number;age:number;direction:1|-1;alive:boolean;respawnIn:number};
export type DefeatEffect={x:number;y:number;ageMs:number;kind:EnemyKind};
export type ScoreEvent={amount:number;context:string;x:number;y:number};
export type Boss={x:number;y:number;origin:number;direction:1|-1;hearts:number;stun:number;age:number;mode:'walk'|'warning'|'charge'|'recover';modeTime:number};
export type Run={
 player:Player;hearts:number;score:number;crystals:Set<number>;enemies:Enemy[];boss:Boss|null;
 collectedPowerups:Set<number>;shield:number;frenzyTime:number;scoreEvents:ScoreEvent[];
 bossCelebrationMs:number;defeatEffects:DefeatEffect[];airComboCount:number;killsByKind:EnemyKills;defeatedUniqueIds:Set<number>;portalOpenedAtMs:number|null;portalGraceMs:number;
 cumulativeBeforeLevel:number;
 checkpoint:{x:number;y:number};checkpointActive:boolean;invulnerable:number;
 phase:'playing'|'won'|'lost';elapsedMs:number;
};
const overlaps=(ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number)=>
 ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

/** Ao avançar de nível, passar totalDefeated(faseAnterior) para preservar o acumulado. */
export function createRun(level:Level,cumulativeBeforeLevel=0):Run {
 if(!Number.isSafeInteger(cumulativeBeforeLevel)||cumulativeBeforeLevel<0)throw Error('Acumulado inválido');
 const spawn=level.entities.find(entity=>entity.kind==='player');
 if(!spawn)throw Error('Spawn ausente');
 return {
  player:createPlayer(spawn.x,spawn.y),hearts:3,score:0,crystals:new Set<number>(),collectedPowerups:new Set<number>(),shield:0,frenzyTime:0,scoreEvents:[],bossCelebrationMs:0,defeatEffects:[],airComboCount:0,killsByKind:emptyEnemyKills(),defeatedUniqueIds:new Set<number>(),portalOpenedAtMs:null,portalGraceMs:0,cumulativeBeforeLevel,
  enemies:level.entities.flatMap((entity,id)=>['patroller','runner','hopper','sentry'].includes(entity.kind)?
   [{id,kind:entity.kind as EnemyKind,x:entity.x,y:entity.y,origin:entity.x,originY:entity.y,age:0,direction:1 as const,alive:true,respawnIn:0}]:[]),
  boss:(()=>{const e=level.entities.find(entity=>entity.kind==='boss');return e?{x:e.x,y:e.y,origin:e.x,direction:-1 as const,hearts:5,stun:0,age:0,mode:'walk' as const,modeTime:0}:null})(),
  checkpoint:{x:spawn.x,y:spawn.y},checkpointActive:false,invulnerable:0,phase:'playing',elapsedMs:0
 };
}
/** Um combo nasce da segunda eliminação por pisão sem contato intermediário com o solo. */
export function registerAirStomp(run:Run):number{
 run.airComboCount++;
 // Bônus incremental e limitado, além da pontuação normal de cada inimigo.
 return run.airComboCount>=2?Math.min(150,(run.airComboCount-1)*30):0;
}
/** O campo persistido mantém o significado antigo: inimigos únicos, não reconta respawns. */
export function levelDefeated(run:Run):number {return run.defeatedUniqueIds.size}
export const PORTAL_GRACE_MIN_SECONDS=18;
export const PORTAL_DELAY_COST_PER_SECOND=12;
export function portalGraceRemainingSeconds(run:Run):number{
 if(run.portalOpenedAtMs===null)return 0;
 return Math.max(0,Math.ceil((run.portalGraceMs-(run.elapsedMs-run.portalOpenedAtMs))/1000));
}
export function portalDelayPenalty(run:Run):number{
 if(run.portalOpenedAtMs===null)return 0;
 return Math.floor(Math.max(0,run.elapsedMs-run.portalOpenedAtMs-run.portalGraceMs)/1000)*PORTAL_DELAY_COST_PER_SECOND;
}
export function totalDefeated(run:Run):number {return run.cumulativeBeforeLevel+levelDefeated(run)}
/** Encostar em inimigo: perde um coração, recua e permanece na mesma área. */
export function receiveDamage(run:Run,enemyX?:number):void {
 if(run.phase!=='playing'||run.invulnerable>0)return;
 run.airComboCount=0;
 if(run.shield>0){run.shield--;run.invulnerable=.8;return}
 run.hearts--;
 if(run.hearts<=0){run.hearts=0;run.phase='lost';return}
 run.invulnerable=1.2;
 if(enemyX!==undefined){
  const p=run.player;
  p.vx=(p.x+p.w/2<enemyX+11?-125:125);
  p.vy=-210;
  p.grounded=false;
  p.coyote=0;
 }
}
/** Queda em abismo: é diferente de colisão com inimigo e retorna ao checkpoint. */
export function fallIntoPit(run:Run):void {
 if(run.phase!=='playing')return;
 run.airComboCount=0;
 run.hearts--;
 if(run.hearts<=0){run.hearts=0;run.phase='lost';return}
 run.player=createPlayer(run.checkpoint.x,run.checkpoint.y);
 run.invulnerable=1.2;
}
export function portalUnlocked(run:Run,level:Level):boolean {
 const total=level.entities.filter(entity=>entity.kind==='crystal').length;
 return run.crystals.size===total && (!run.boss || run.boss.hearts<=0);
}
export function stepRun(run:Run,level:Level,input:InputFrame,dt=STEP):void {
 if(run.phase!=='playing')return;
 // A explosão do Guardião congela o movimento e o cronômetro da partida.
 if(run.bossCelebrationMs>0){
  run.bossCelebrationMs+=dt*1000;
  if(run.bossCelebrationMs>=2600)run.bossCelebrationMs=0;
  return;
 }
 run.elapsedMs+=dt*1000;
 for(const effect of run.defeatEffects)effect.ageMs+=dt*1000;
 run.defeatEffects=run.defeatEffects.filter(effect=>effect.ageMs<580);
 run.invulnerable=Math.max(0,run.invulnerable-dt);
 run.frenzyTime=Math.max(0,run.frenzyTime-dt);
 // Eventos do passo anterior serão desenhados pelo motor antes do próximo passo.
 const award=(base:number,context:string)=>{
  const amount=Math.round(base*(run.frenzyTime>0?2:1));
  run.score+=amount;run.scoreEvents.push({amount,context,x:run.player.x+run.player.w/2,y:run.player.y-12});
 };
 const oldBottom=run.player.y+run.player.h;
 const oldVy=run.player.vy;
  // Correntes prismáticas são zonas legíveis: ajudam a alcançar rotas altas, mas não
  // removem o controle lateral nem substituem o salto. A força é aplicada antes da física.
  for(const entity of level.entities)if(entity.kind==='updraft'&&overlaps(run.player.x,run.player.y,run.player.w,run.player.h,entity.x,entity.y,entity.width??0,entity.height??0)){
   run.player.vx=Math.max(-220,Math.min(220,run.player.vx+(entity.forceX??0)*dt));
   run.player.vy=Math.min(run.player.vy,(entity.forceY??-700));
  }
 stepPlayer(run.player,input,level,dt);
 if(run.player.grounded)run.airComboCount=0;
 const p=run.player;
 if(p.y>level.height*level.tileSize+24){fallIntoPit(run);return}
 for(const [id,entity] of level.entities.entries()){
  if(entity.kind==='crystal'&&!run.crystals.has(id)&&overlaps(p.x,p.y,p.w,p.h,entity.x,entity.y,18,20)){
   run.crystals.add(id);award(10,'Cristal');
  }
  if(['shield','heart','frenzy'].includes(entity.kind)&&!run.collectedPowerups.has(id)&&overlaps(p.x,p.y,p.w,p.h,entity.x,entity.y,22,26)){
   run.collectedPowerups.add(id);
   if(entity.kind==='shield')run.shield=Math.min(2,run.shield+1);
   if(entity.kind==='heart')run.hearts=Math.min(3,run.hearts+1);
   if(entity.kind==='frenzy')run.frenzyTime=10;
   award(30,entity.kind==='shield'?'Escudo':entity.kind==='heart'?'Vida':'Pontos em dobro');
  }
  if(entity.kind==='checkpoint'&&!run.checkpointActive&&overlaps(p.x,p.y,p.w,p.h,entity.x,entity.y,20,48)){
   run.checkpointActive=true;
   run.checkpoint={x:entity.x,y:15*level.tileSize-p.h};
  }
 }
 for(const enemy of run.enemies){
  if(!enemy.alive){
   enemy.respawnIn=Math.max(0,enemy.respawnIn-dt);
   // Não fazer spawn dentro da área imediata do jogador; relógio pausa com a partida.
   if(enemy.respawnIn===0&&Math.abs(enemy.origin-p.x)>110){
    enemy.alive=true;enemy.x=enemy.origin;enemy.y=enemy.originY;enemy.direction=1;enemy.age=0;
   }
   continue;
  }
  enemy.age+=dt;
  const speed=enemy.kind==='runner'?90:enemy.kind==='sentry'?24:enemy.kind==='hopper'?48:36;
  const range=enemy.kind==='runner'?64:enemy.kind==='sentry'?12:enemy.kind==='hopper'?28:32;
  const nextX=enemy.x+enemy.direction*speed*dt;
  const supportRow=Math.floor((enemy.originY+24)/level.tileSize);
  const nextCol=Math.floor((nextX+11)/level.tileSize);
  const support=level.tiles[supportRow]?.[nextCol]??0;
  // Quem anda no chão não deve entrar sob uma plataforma baixa que impediria pisão.
  const trapped=supportRow===15&&[12,13,14].some(row=>level.tiles[row]?.[nextCol]===2);
  if(support===0||trapped)enemy.direction=enemy.direction===1?-1:1;
  else enemy.x=nextX;
  if(enemy.x>enemy.origin+range){enemy.x=enemy.origin+range;enemy.direction=-1}
  else if(enemy.x<enemy.origin-range){enemy.x=enemy.origin-range;enemy.direction=1}
  enemy.y=enemy.kind==='hopper'?enemy.originY-Math.max(0,Math.sin(enemy.age*5))*35:enemy.originY;
  if(!overlaps(p.x,p.y,p.w,p.h,enemy.x,enemy.y,22,24))continue;
  const stomp=oldBottom<=enemy.y+8&&oldVy>=0&&p.vy>=0&&p.y+p.h>=enemy.y;
  if(stomp){
   enemy.alive=false;enemy.respawnIn=RESPAWN_SECONDS[enemy.kind];
   run.killsByKind[enemy.kind]++;run.defeatedUniqueIds.add(enemy.id);
   run.defeatEffects.push({x:enemy.x+11,y:enemy.y+12,ageMs:0,kind:enemy.kind});
   p.y=Math.min(p.y,enemy.y-p.h);
   p.vy=-285;p.grounded=false;p.coyote=0;
   award(enemy.kind==='runner'?80:enemy.kind==='hopper'?90:enemy.kind==='sentry'?110:50,'Inimigo');
   const comboBonus=registerAirStomp(run);
   if(comboBonus)award(comboBonus,'COMBO x'+run.airComboCount);
  }else if(run.invulnerable<=0){receiveDamage(run,enemy.x);return}
 }
 // Guardião: cinco acertos, patrulha -> aviso -> investida -> recuperação.
 const boss=run.boss;
 if(boss&&boss.hearts>0){
  boss.age+=dt;boss.stun=Math.max(0,boss.stun-dt);
  if(boss.stun<=0){
   boss.modeTime+=dt;
   const enraged=boss.hearts<=2;
   const warning=enraged?.62:.85,charge=enraged?.72:.86;
   if(boss.mode==='walk'&&boss.modeTime>1.2){
    boss.mode='warning';boss.modeTime=0;
    boss.direction=p.x+11<boss.x+24?-1:1;
   }else if(boss.mode==='warning'&&boss.modeTime>warning){
    boss.mode='charge';boss.modeTime=0;
   }else if(boss.mode==='charge'&&boss.modeTime>charge){
    boss.mode='recover';boss.modeTime=0;
   }else if(boss.mode==='recover'&&boss.modeTime>1.15){
    boss.mode='walk';boss.modeTime=0;
   }
   const speed=boss.mode==='charge'?(enraged?240:195):boss.mode==='walk'?(enraged?85:63):0;
   boss.x+=boss.direction*speed*dt;
   const left=boss.origin-220,right=boss.origin+105;
   if(boss.x<left){boss.x=left;boss.direction=1;boss.mode='recover';boss.modeTime=0}
   if(boss.x>right){boss.x=right;boss.direction=-1;boss.mode='recover';boss.modeTime=0}
  }
  if(overlaps(p.x,p.y,p.w,p.h,boss.x,boss.y,48,56)){
   const stomp=oldBottom<=boss.y+12&&oldVy>=0&&p.vy>=0&&p.y+p.h>=boss.y;
   if(stomp){
    p.y=boss.y-p.h;p.vy=-330;p.grounded=false;p.coyote=0;
    // Vulnerabilidade curta após a investida; não contar múltiplos golpes no stun.
    if(boss.stun<=0&&(boss.mode==='recover'||boss.mode==='walk')){
     boss.hearts--;
     if(boss.hearts===0){award(250,'Guardião derrotado');run.bossCelebrationMs=1}
     else award(20,'Acerto no Guardião');
     boss.stun=1.1;boss.mode='warning';boss.modeTime=0;
    }
   }else if(run.invulnerable<=0&&boss.stun<=0){
    receiveDamage(run,boss.x);return;
   }
  }
 }
 const portal=level.entities.find(entity=>entity.kind==='exit');
 if(run.portalOpenedAtMs===null&&portalUnlocked(run,level)){
  run.portalOpenedAtMs=run.elapsedMs;
  // Distância no instante do desbloqueio: nunca diminuir prazo ao se aproximar.
  run.portalGraceMs=Math.ceil(Math.max(PORTAL_GRACE_MIN_SECONDS,
   Math.abs((portal?.x??p.x)-p.x)/160+8)*1000);
 }
 if(portal&&portalUnlocked(run,level)&&overlaps(p.x,p.y,p.w,p.h,portal.x,portal.y,32,64)){
  run.phase='won';award(100,'Portal');
 }
}
