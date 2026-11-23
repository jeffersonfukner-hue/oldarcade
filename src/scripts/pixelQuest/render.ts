import type {Level} from './levels';
import {portalUnlocked,type Run} from './gameplay';
import {worldTimeAt,formatWorldTime,skyColors} from './worldClock';
import {drawDefeatEffects} from './victoryEffects';
import {drawRankingCelebration,type RankingCelebration} from './rankingVisuals';
import {drawWorldAtmosphere} from './worldAtmosphere';
export const VIEW_WIDTH=640,VIEW_HEIGHT=360;
/** A câmera sobe quando o personagem escala, mantendo a cabeça visível.
 * De chão: base fixa (mapa atual). Plataformas altas: segue o jogador.
 */
export function pixelQuestVerticalOffset(level:Level,playerY:number):number{
 const base=Math.max(0,level.height*level.tileSize-VIEW_HEIGHT);
 return Math.max(0,Math.min(base,playerY-70));
}

// Camadas autorais desenhadas no canvas: sem assets externos e sem afetar colisões.
function blend(a:string,b:string,t:number){
 const n=(s:string,i:number)=>parseInt(s.slice(i,i+2),16);
 const k=(i:number)=>Math.round(n(a,i)*(1-t)+n(b,i)*t);
 return `rgb(${k(1)},${k(3)},${k(5)})`;
}
export function worldOneAtmosphere(levelId:string,ratio:number){
 const t=Math.max(0,Math.min(1,ratio));
 const palettes:Record<string,[string,string,string,string]>={
  '1-1':['#172c52','#4a6992','#e2a16b','#91cbd7'],
  '1-2':['#4a91c5','#8dd5e8','#693e80','#ff995f'],
  '1-3':['#664780','#e68b65','#0b1434','#28335e']
 };
 const p=palettes[levelId]??palettes['1-1'];
 return {top:blend(p[0],p[2],t),bottom:blend(p[1],p[3],t)};
}
function drawLandscape(c:CanvasRenderingContext2D,level:Level,camera:number,vertical:number,worldElapsedMs:number){
 const sky=skyColors(worldElapsedMs);
 const gradient=c.createLinearGradient(0,0,0,VIEW_HEIGHT);
 gradient.addColorStop(0,sky.top);gradient.addColorStop(1,sky.bottom);
 c.fillStyle=gradient;c.fillRect(0,0,VIEW_WIDTH,VIEW_HEIGHT);
 c.save();c.globalAlpha=sky.sunAlpha;
 c.fillStyle='#ffdf96';c.beginPath();c.arc(sky.sunX,sky.sunY,19,0,Math.PI*2);c.fill();
 c.globalAlpha=sky.moonAlpha;c.fillStyle='#eae9da';
 c.beginPath();c.arc(sky.moonX,sky.moonY,14,0,Math.PI*2);c.fill();c.restore();
 const night=sky.moonAlpha>.5;
 const verticalShift=(level.height*level.tileSize-VIEW_HEIGHT-vertical);
 // Montanhas acompanham a câmera em frações distintas para dar profundidade.
 for(let i=-2;i<9;i++){
  const x=i*170-Math.floor(camera*.10%170);
  c.fillStyle=night?'#303654':'#547b94';
  c.beginPath();c.moveTo(x,265+verticalShift*.35);c.lineTo(x+83,104+(i%3)*24+verticalShift*.35);c.lineTo(x+172,265+verticalShift*.35);c.fill();
 }
 for(const [factor,width,height,color] of [
  [.22,78,80,night?'#223e50':'#35636b'],
  [.40,58,105,night?'#152d40':'#225b52']
 ] as const){
  const stride=width+19,offset=(camera*factor)%stride;
  for(let i=-1;i<Math.ceil(VIEW_WIDTH/stride)+2;i++){
   const x=Math.round(i*stride-offset),base=268+verticalShift*factor;
   c.fillStyle=color;
   c.fillRect(x+width*.45,base-height*.25,Math.max(4,width*.1),height*.30);
   for(let layer=0;layer<3;layer++){
    const y=base-height+layer*height*.24;
    c.beginPath();c.moveTo(x+width/2,y);c.lineTo(x+width*.08-layer*2,y+height*.46);
    c.lineTo(x+width*.92+layer*2,y+height*.46);c.fill();
   }
  }
 }
}
export function drawPlatformScene(canvas:HTMLCanvasElement,level:Level,run:Run,camera:number,worldElapsedMs=0,stageIndex=0,reducedMotion=false,completedScore=0,rankingFx:RankingCelebration|null=null,now=0){
 const context=canvas.getContext('2d');if(!context)return;
 context.imageSmoothingEnabled=false;
 const vertical=pixelQuestVerticalOffset(level,run.player.y);
 drawLandscape(context,level,camera,vertical,worldElapsedMs);
 drawWorldAtmosphere(context,worldElapsedMs,reducedMotion);
 // O horizonte fica atrás do terreno; abismos têm profundidade escura.
 const groundY=15*level.tileSize-vertical;
 context.fillStyle='#171a23';context.fillRect(0,groundY,VIEW_WIDTH,VIEW_HEIGHT-groundY);
 const first=Math.max(0,Math.floor(camera/32)),last=Math.min(level.width-1,Math.ceil((camera+VIEW_WIDTH)/32));
 for(let row=0;row<level.height;row++)for(let col=first;col<=last;col++){
  const tile=level.tiles[row][col];if(!tile)continue;
  const x=Math.round(col*32-camera),y=row*32-vertical;
  if(tile===1){
   const surface=row===15;
   context.fillStyle=surface?'#6a4537':row===16?'#584038':'#443333';
   context.fillRect(x,y,32,32);
   if(surface){context.fillStyle='#468a55';context.fillRect(x,y,32,7)}
   context.fillStyle='#80624f';
   if((row+col)%3===0)context.fillRect(x+8,y+18,9,4);
  }else{
   context.fillStyle='#97775c';context.fillRect(x,y,32,10);
   context.fillStyle='#74aa71';context.fillRect(x,y,32,4);
  }
  context.strokeStyle='rgba(10,17,25,.13)';context.strokeRect(x+.5,y+.5,31,31);
 }
 for(const [id,entity] of level.entities.entries()){
  if(entity.kind==='player'||(entity.kind==='crystal'&&run.crystals.has(id))||['patroller','runner','hopper','sentry'].includes(entity.kind)||run.collectedPowerups.has(id))continue;
  const x=Math.round(entity.x-camera),y=Math.round(entity.y-vertical);
  if(entity.kind==='crystal'){
   context.fillStyle='#83f4ff';context.beginPath();context.moveTo(x+9,y);context.lineTo(x+18,y+10);context.lineTo(x+9,y+20);context.lineTo(x,y+10);context.fill();
  }else if(['shield','heart','frenzy'].includes(entity.kind)){
   context.fillStyle=entity.kind==='shield'?'#6de1ff':entity.kind==='heart'?'#ff7197':'#ffe17b';
   context.fillRect(x+1,y+2,22,22);
   context.fillStyle='#202b46';
   if(entity.kind==='shield'){context.fillRect(x+6,y+6,12,4);context.fillRect(x+8,y+10,8,8)}
   if(entity.kind==='heart'){context.fillRect(x+6,y+7,4,4);context.fillRect(x+13,y+7,4,4);context.fillRect(x+9,y+12,6,6)}
   if(entity.kind==='frenzy'){context.fillRect(x+12,y+6,4,6);context.fillRect(x+8,y+12,5,7)}
  }else if(entity.kind==='checkpoint'){
   context.fillStyle=run.checkpointActive?'#8dffc0':'#ffdc83';context.fillRect(x,y,6,48);
   context.fillRect(x+6,y,17,15);
  }else if(entity.kind==='exit'){
   const unlocked=portalUnlocked(run,level);
   context.fillStyle=unlocked?'#b88cfc':'#586076';context.fillRect(x,y,32,64);
   context.fillStyle=unlocked?'#20254d':'#252d3a';context.fillRect(x+6,y+7,20,50);
   context.fillStyle=unlocked?'#f0d7ff':'#89929e';context.fillRect(x+12,y+20,8,24);
   if(!unlocked){context.fillStyle='#ffdc83';context.fillRect(x+12,y+30,8,8)}
  }
 }
 for(const enemy of run.enemies){
  if(!enemy.alive)continue;
  const x=Math.round(enemy.x-camera),y=Math.round(enemy.y-vertical);
  const colors={patroller:'#fa8a91',runner:'#ffae64',hopper:'#a98bff',sentry:'#74dbd1'};
  context.fillStyle=colors[enemy.kind];context.fillRect(x,y,22,24);
  if(enemy.kind==='runner'){context.fillRect(x-3,y+19,7,5);context.fillRect(x+17,y+19,7,5)}
  if(enemy.kind==='hopper'){context.fillRect(x+3,y-5,6,6);context.fillRect(x+13,y-5,6,6)}
  if(enemy.kind==='sentry'){context.fillRect(x+7,y-6,8,6)}
  context.fillStyle='#172c52';context.fillRect(x+5,y+7,4,4);context.fillRect(x+14,y+7,4,4);
 }
 const boss=run.boss;
 if(boss&&boss.hearts>0){
  const x=Math.round(boss.x-camera),y=Math.round(boss.y-vertical);
  const alert=boss.mode==='warning'||boss.mode==='charge';
  context.fillStyle=boss.stun>0?'#b5b7e2':boss.mode==='charge'?'#ed637e':alert?'#eaa57b':'#8f6ca8';
  context.fillRect(x,y,48,56);
  context.fillStyle='#f8da80';context.fillRect(x+9,y+16,9,9);context.fillRect(x+30,y+16,9,9);
  context.fillStyle='#1c203c';context.fillRect(x+12,y+19,4,4);context.fillRect(x+33,y+19,4,4);
  context.fillStyle='#26334d';context.fillRect(x-4,y-17,56,7);
  context.fillStyle='#e7a4c6';context.fillRect(x-4,y-17,56*(boss.hearts/5),7);
  if(boss.mode==='warning'){context.strokeStyle='#ffcf71';context.lineWidth=2;context.strokeRect(x-6,y-6,60,68)}
 }
 drawDefeatEffects(context,run,camera,vertical,VIEW_WIDTH,VIEW_HEIGHT,reducedMotion);
 const p=run.player;
 if(run.invulnerable<=0||Math.floor(run.invulnerable*12)%2===0){
  const x=Math.round(p.x-camera),y=Math.round(p.y-vertical);
  if(run.shield>0){context.strokeStyle='#85ebff';context.lineWidth=2;context.strokeRect(x-4,y-4,p.w+8,p.h+8)}
  if(run.frenzyTime>0){context.fillStyle='#ffe288';context.fillRect(x-4,y-11,Math.round((p.w+8)*run.frenzyTime/10),3)}
  context.fillStyle='#ffd46b';context.fillRect(x,y,p.w,p.h);
  context.fillStyle='#19314c';context.fillRect(x+12,y+7,5,5);
 }
 // HUD de leitura dentro do jogo, derivado dos mesmos dados usados no placar à direita.
 const time=worldTimeAt(worldElapsedMs);
 const width=VIEW_WIDTH;
 context.save();
 context.fillStyle='rgba(8,17,35,.82)';
 context.fillRect(6,6,width-12,32);
 context.strokeStyle='rgba(160,197,224,.5)';context.lineWidth=1;
 context.strokeRect(6.5,6.5,width-13,31);
 context.font='bold 11px system-ui';
 context.textBaseline='middle';context.fillStyle='#f2f6ff';
 context.textAlign='left';
 context.fillText('♥'.repeat(run.hearts)+'♡'.repeat(3-run.hearts),14,22);
 context.fillText('DIA '+time.day+' · '+formatWorldTime(time),91,22);
 context.fillText('FASE '+(stageIndex+1)+'/3',227,22);
 context.textAlign='right';context.fillStyle='#ffe29b';
 context.fillText('FASE '+run.score.toLocaleString('pt-BR'),455,22);
 context.fillText('TOTAL '+(completedScore+run.score).toLocaleString('pt-BR'),width-16,22);
 context.restore();
 drawRankingCelebration(context,rankingFx,now,reducedMotion);
}
