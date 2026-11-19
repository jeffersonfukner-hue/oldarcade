import {createPlayer,stepPlayer,STEP,type Player,type InputFrame} from './physics';
import type {Level} from './levels';

export type Enemy={id:number;x:number;y:number;origin:number;direction:1|-1;alive:boolean};
export type Run={
 player:Player;hearts:number;score:number;crystals:Set<number>;enemies:Enemy[];
 checkpoint:{x:number;y:number};checkpointActive:boolean;invulnerable:number;
 phase:'playing'|'won'|'lost';elapsedMs:number;
};
const overlaps=(ax:number,ay:number,aw:number,ah:number,bx:number,by:number,bw:number,bh:number)=>
 ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;

export function createRun(level:Level):Run {
 const spawn=level.entities.find(entity=>entity.kind==='player');
 if(!spawn)throw Error('Spawn ausente');
 return {
  player:createPlayer(spawn.x,spawn.y),hearts:3,score:0,crystals:new Set<number>(),
  enemies:level.entities.flatMap((entity,id)=>entity.kind==='patroller'?[{id,x:entity.x,y:entity.y,origin:entity.x,direction:1 as const,alive:true}]:[]),
  checkpoint:{x:spawn.x,y:spawn.y},checkpointActive:false,invulnerable:0,phase:'playing',elapsedMs:0
 };
}
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
 return run.crystals.size===total;
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
 const portal=level.entities.find(entity=>entity.kind==='exit');
 if(portal&&portalUnlocked(run,level)&&overlaps(p.x,p.y,p.w,p.h,portal.x,portal.y,32,64)){
  run.phase='won';run.score+=100;
 }
}
