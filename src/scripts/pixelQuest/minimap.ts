import type {Level} from './levels';
import type {Run} from './gameplay';

/** Radar de proximidade: apenas objetos locais, sem revelar mapa, terreno ou regiões remotas. */
export function minimapMarkers(level:Level,run:Run,radius=560){
 const center=run.player.x+run.player.w/2;
 const markers:{kind:string;dx:number;dy:number}[]=[];
 for(const [id,e] of level.entities.entries()){
  if(Math.abs(e.x-center)>radius)continue;
  if(e.kind==='crystal'&&run.crystals.has(id))continue;
  if(['shield','heart','frenzy'].includes(e.kind)&&run.collectedPowerups.has(id))continue;
  if(e.kind==='player')continue;
  if(e.kind==='checkpoint'&&run.checkpointActive)continue;
  if(e.kind==='boss'&&(!run.boss||run.boss.hearts<=0))continue;
  if(['patroller','runner','hopper','sentry'].includes(e.kind))continue;
  markers.push({kind:e.kind,dx:e.x-center,dy:e.y-run.player.y});
 }
 for(const enemy of run.enemies)if(enemy.alive&&Math.abs(enemy.x-center)<=radius)
  markers.push({kind:'enemy',dx:enemy.x-center,dy:enemy.y-run.player.y});
 if(run.boss&&run.boss.hearts>0&&Math.abs(run.boss.x-center)<=radius)
  markers.push({kind:'boss',dx:run.boss.x-center,dy:run.boss.y-run.player.y});
 return markers;
}

export function drawQuestMinimap(c:CanvasRenderingContext2D,level:Level,run:Run):void{
 const x=VIEW_X,y=VIEW_Y,w=158,h=69,scale=0.12;
 c.save();
 c.fillStyle='rgba(8,19,33,.86)';c.fillRect(x,y,w,h);
 c.strokeStyle='#7597a8';c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);
 c.font='bold 9px system-ui';c.fillStyle='#dceaf0';c.textAlign='left';c.textBaseline='top';
 c.fillText('RADAR · ÁREA PRÓXIMA',x+7,y+5);
 c.beginPath();c.rect(x+5,y+19,w-10,h-24);c.clip();
 const mid=x+w/2,midY=y+42;
 c.strokeStyle='rgba(105,145,155,.25)';c.beginPath();c.moveTo(mid,y+20);c.lineTo(mid,y+h-5);c.stroke();
 const colors:Record<string,string>={crystal:'#73eaff',enemy:'#fb8c89',boss:'#f16a9e',
  shield:'#69dfff',heart:'#ff7197',frenzy:'#ffe17b',checkpoint:'#92ffba',exit:'#c797ff'};
 for(const marker of minimapMarkers(level,run)){
  const px=Math.round(mid+marker.dx*scale),py=Math.round(midY+marker.dy*.07);
  c.fillStyle=colors[marker.kind]??'#b8d1de';
  c.fillRect(px-2,Math.max(y+21,Math.min(y+h-7,py))-2,5,5);
 }
 c.fillStyle='#ffd46b';c.fillRect(mid-3,midY-5,7,10);
 c.fillStyle='#203047';c.fillRect(mid+1,midY-2,2,2);
 c.restore();
}
const VIEW_X=640-166,VIEW_Y=44;
