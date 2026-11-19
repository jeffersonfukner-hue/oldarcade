import {tileAt,type Level} from './levels';
export type InputFrame={left:boolean;right:boolean;jump:boolean};
export type Player={x:number;y:number;vx:number;vy:number;w:number;h:number;grounded:boolean;coyote:number;buffer:number;jumpHeld:boolean};
export const STEP=1/60;
const GRAVITY=1100,MAX_FALL=650,MAX_RUN=180,JUMP=390,COYOTE=.09,BUFFER=.10;
export function createPlayer(x:number,y:number):Player{return {x,y,vx:0,vy:0,w:22,h:29,grounded:false,coyote:0,buffer:0,jumpHeld:false}}
export function approach(value:number,target:number,amount:number){return value<target?Math.min(value+amount,target):Math.max(value-amount,target)}
function collides(level:Level,x:number,y:number,w:number,h:number,dy:number):boolean{
 const unit=level.tileSize,left=Math.floor(x/unit),right=Math.floor((x+w-1e-6)/unit);
 const top=Math.floor(y/unit),bottom=Math.floor((y+h-1e-6)/unit);
 for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++){
  const tile=tileAt(level,col,row);
  if(tile===1)return true;
  if(tile===2&&dy>0&&y+h-dy<=row*unit+1e-5)return true;
 }
 return false;
}
export function stepPlayer(player:Player,input:InputFrame,level:Level,dt=STEP):void{
 if(dt<=0||dt>1/30)throw Error('Passo físico inválido');
 const dir=Number(input.right)-Number(input.left);
 const target=dir*MAX_RUN;
 player.vx=approach(player.vx,target,(dir?(player.grounded?1400:1000):1800)*dt);
 player.coyote=player.grounded?COYOTE:Math.max(0,player.coyote-dt);
 if(input.jump&&!player.jumpHeld)player.buffer=BUFFER;
 else player.buffer=Math.max(0,player.buffer-dt);
 if(player.buffer>0&&player.coyote>0){player.vy=-JUMP;player.grounded=false;player.coyote=0;player.buffer=0}
 if(!input.jump&&player.jumpHeld&&player.vy<0)player.vy*=.48;
 player.jumpHeld=input.jump;
 player.vy=Math.min(MAX_FALL,player.vy+GRAVITY*dt);
 // Subpassos curtos: não atravessar tiles nem plataformas com velocidade terminal.
 const dx=player.vx*dt,dy=player.vy*dt;
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8));
 const sx=dx/steps,sy=dy/steps;
 player.grounded=false;
 for(let i=0;i<steps;i++){
  if(!collides(level,player.x+sx,player.y,player.w,player.h,0))player.x+=sx;
  else player.vx=0;
  if(!collides(level,player.x,player.y+sy,player.w,player.h,sy))player.y+=sy;
  else{if(sy>0)player.grounded=true;player.vy=0}
 }
 if(player.grounded)player.coyote=COYOTE;
}
export function cameraX(player:Player,previous:number,level:Level,viewWidth=640){
 const max=Math.max(0,level.width*level.tileSize-viewWidth);
 const screen=player.x-previous;
 const deadLeft=viewWidth*.35,deadRight=viewWidth*.65;
 const desired=screen<deadLeft?player.x-deadLeft:screen>deadRight?player.x-deadRight:previous;
 return Math.max(0,Math.min(max,desired));
}
