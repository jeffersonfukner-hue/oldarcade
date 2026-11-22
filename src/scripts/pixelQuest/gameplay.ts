import {createPlayer,stepPlayer,STEP,type Player,type InputFrame} from './physics';
import type {Level} from './levels';

export type Enemy={id:number;x:number;y:number;origin:number;direction:1|-1;alive:boolean};
export type Boss={x:number;y:number;origin:number;direction:1|-1;hearts:number;stun:number;age:number;mode:'walk'|'warning'|'charge'|'recover';modeTime:number};
export type Run={
 player:Player;hearts:number;score:number;crystals:Set<number>;enemies:Enemy[];boss:Boss|null;
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
  player:createPlayer(spawn.x,spawn.y),hearts:3,score:0,crystals:new Set<number>(),cumulativeBeforeLevel,
  enemies:level.entities.flatMap((entity,id)=>entity.kind==='patroller'?[{id,x:entity.x,y:entity.y,origin:entity.x,direction:1 as const,alive:true}]:[]),
  boss:(()=>{const e=level.entities.find(entity=>entity.kind==='boss');return e?{x:e.x,y:e.y,origin:e.x,direction:-1 as const,hearts:5,stun:0,age:0,mode:'walk' as const,modeTime:0}:null})(),
  checkpoint:{x:spawn.x,y:spawn.y},checkpointActive:false,invulnerable:0,phase:'playing',elapsedMs:0
 };
}
export function levelDefeated(run:Run):number {return run.enemies.filter(enemy=>!enemy.alive).length}
export function totalDefeated(run:Run):number {return run.cumulativeBeforeLevel+levelDefeated(run)}
/** Encostar em inimigo: perde um coração, recua e permanece na mesma área. */
export function receiveDamage(run:Run,enemyX?:number):void {
 if(run.phase!=='playing'||run.invulnerable>0)return;
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
 run.elapsedMs+=dt*1000;
 run.invulnerable=Math.max(0,run.invulnerable-dt);
 const oldBottom=run.player.y+run.player.h;
 const oldVy=run.player.vy;
 stepPlayer(run.player,input,level,dt);
 const p=run.player;
 if(p.y>level.height*level.tileSize+24){fallIntoPit(run);return}
 for(const [id,entity] of level.entities.entries()){
  if(entity.kind==='crystal'&&!run.crystals.has(id)&&overlaps(p.x,p.y,p.w,p.h,entity.x,entity.y,18,20)){
   run.crystals.add(id);run.score+=10;
  }
  if(entity.kind==='checkpoint'&&!run.checkpointActive&&overlaps(p.x,p.y,p.w,p.h,entity.x,entity.y,20,48)){
   run.checkpointActive=true;
   run.checkpoint={x:entity.x,y:15*level.tileSize-p.h};
  }
 }
 for(const enemy of run.enemies){
  if(!enemy.alive)continue;
  enemy.x+=enemy.direction*36*dt;
  if(enemy.x>enemy.origin+32){enemy.x=enemy.origin+32;enemy.direction=-1}
  else if(enemy.x<enemy.origin-32){enemy.x=enemy.origin-32;enemy.direction=1}
  if(!overlaps(p.x,p.y,p.w,p.h,enemy.x,enemy.y,22,24))continue;
  // Atravessar o topo do inimigo durante a descida conta como pisão;
  // tocar lateralmente (ou de baixo para cima) provoca dano.
  const stomp=oldBottom<=enemy.y+7&&oldVy>=0&&p.vy>=0&&p.y+p.h>=enemy.y;
  if(stomp){
   enemy.alive=false;
   p.y=Math.min(p.y,enemy.y-p.h);
   p.vy=-285;
   p.grounded=false;
   p.coyote=0;
   run.score+=50;
  } else if(run.invulnerable<=0){receiveDamage(run,enemy.x);return}
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
     boss.hearts--;boss.stun=1.1;boss.mode='warning';boss.modeTime=0;
    }
   }else if(run.invulnerable<=0&&boss.stun<=0){
    receiveDamage(run,boss.x);return;
   }
  }
 }
 const portal=level.entities.find(entity=>entity.kind==='exit');
 if(portal&&portalUnlocked(run,level)&&overlaps(p.x,p.y,p.w,p.h,portal.x,portal.y,32,64)){
  run.phase='won';run.score+=100;
 }
}
