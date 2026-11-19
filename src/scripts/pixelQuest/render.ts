import type {Level} from './levels';
import type {Run} from './gameplay';
export const VIEW_WIDTH=640,VIEW_HEIGHT=360;
export function drawPlatformScene(canvas:HTMLCanvasElement,level:Level,run:Run,camera:number){
 const context=canvas.getContext('2d');if(!context)return;
 context.imageSmoothingEnabled=false;
 context.fillStyle='#172c52';context.fillRect(0,0,VIEW_WIDTH,VIEW_HEIGHT);
 context.fillStyle='#274875';
 for(let x=((-camera*.12)%180)-180;x<VIEW_WIDTH+180;x+=180){
  context.beginPath();context.moveTo(x,VIEW_HEIGHT);context.lineTo(x+90,130);context.lineTo(x+180,VIEW_HEIGHT);context.fill();
 }
 const vertical=level.height*level.tileSize-VIEW_HEIGHT;
 const first=Math.max(0,Math.floor(camera/32)),last=Math.min(level.width-1,Math.ceil((camera+VIEW_WIDTH)/32));
 for(let row=0;row<level.height;row++)for(let col=first;col<=last;col++){
  const tile=level.tiles[row][col];if(!tile)continue;
  const x=Math.round(col*32-camera),y=row*32-vertical;
  context.fillStyle=tile===1?'#24735d':'#b9a0d8';context.fillRect(x,y,32,32);
  context.fillStyle=tile===1?'#64c78b':'#eee0fa';context.fillRect(x,y,32,5);
  context.strokeStyle='#184e46';context.strokeRect(x+.5,y+.5,31,31);
 }
 for(const [id,entity] of level.entities.entries()){
  if(entity.kind==='player'||(entity.kind==='crystal'&&run.crystals.has(id))||entity.kind==='patroller')continue;
  const x=Math.round(entity.x-camera),y=Math.round(entity.y-vertical);
  if(entity.kind==='crystal'){
   context.fillStyle='#83f4ff';context.beginPath();context.moveTo(x+9,y);context.lineTo(x+18,y+10);context.lineTo(x+9,y+20);context.lineTo(x,y+10);context.fill();
  }else if(entity.kind==='checkpoint'){
   context.fillStyle=run.checkpointActive?'#8dffc0':'#ffdc83';context.fillRect(x,y,6,48);
   context.fillRect(x+6,y,17,15);
  }else if(entity.kind==='exit'){
   context.fillStyle='#b88cfc';context.fillRect(x,y,32,64);
   context.fillStyle='#20254d';context.fillRect(x+6,y+7,20,50);
   context.fillStyle='#f0d7ff';context.fillRect(x+12,y+20,8,24);
  }
 }
 for(const enemy of run.enemies){
  if(!enemy.alive)continue;
  const x=Math.round(enemy.x-camera),y=Math.round(enemy.y-vertical);
  context.fillStyle='#fa8a91';context.fillRect(x,y,22,24);
  context.fillStyle='#172c52';context.fillRect(x+5,y+7,4,4);context.fillRect(x+14,y+7,4,4);
 }
 const p=run.player;
 if(run.invulnerable<=0||Math.floor(run.invulnerable*12)%2===0){
  const x=Math.round(p.x-camera),y=Math.round(p.y-vertical);
  context.fillStyle='#ffd46b';context.fillRect(x,y,p.w,p.h);
  context.fillStyle='#19314c';context.fillRect(x+12,y+7,5,5);
 }
}
