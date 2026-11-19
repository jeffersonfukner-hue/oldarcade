import type {Level} from './levels';
import type {Player} from './physics';
export const VIEW_WIDTH=640,VIEW_HEIGHT=360;
export function drawPlatformScene(canvas:HTMLCanvasElement,level:Level,player:Player,camera:number){
 const context=canvas.getContext('2d');if(!context)return;
 context.imageSmoothingEnabled=false;
 context.fillStyle='#172c52';context.fillRect(0,0,VIEW_WIDTH,VIEW_HEIGHT);
 context.fillStyle='#274875';
 for(let x=-camera*.12%180-180;x<VIEW_WIDTH+180;x+=180){context.beginPath();context.moveTo(x,VIEW_HEIGHT);context.lineTo(x+90,130);context.lineTo(x+180,VIEW_HEIGHT);context.fill()}
 const vertical=level.height*level.tileSize-VIEW_HEIGHT;
 const first=Math.max(0,Math.floor(camera/32)),last=Math.min(level.width-1,Math.ceil((camera+VIEW_WIDTH)/32));
 for(let row=0;row<level.height;row++)for(let col=first;col<=last;col++){
  const tile=level.tiles[row][col];if(!tile)continue;
  const x=Math.round(col*32-camera),y=row*32-vertical;
  context.fillStyle=tile===1?'#24735d':'#b9a0d8';context.fillRect(x,y,32,32);
  context.fillStyle=tile===1?'#64c78b':'#eee0fa';context.fillRect(x,y,32,5);
  context.strokeStyle='#184e46';context.strokeRect(x+.5,y+.5,31,31);
 }
 for(const entity of level.entities){
  if(entity.kind==='player')continue;
  const x=Math.round(entity.x-camera),y=entity.y-vertical;
  context.fillStyle=entity.kind==='exit'?'#d4b7ff':entity.kind==='checkpoint'?'#f8d775':entity.kind==='crystal'?'#7ffafa':'#f78c81';
  context.fillRect(x,y,entity.kind==='exit'?32:18,entity.kind==='exit'?64:20);
 }
 context.fillStyle='#ffd46b';context.fillRect(Math.round(player.x-camera),Math.round(player.y-vertical),player.w,player.h);
 context.fillStyle='#19314c';context.fillRect(Math.round(player.x-camera+12),Math.round(player.y-vertical+7),5,5);
}
