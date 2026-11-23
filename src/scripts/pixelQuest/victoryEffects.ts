import type {Run} from './gameplay';

const palette=['#ffe17e','#ff7bb5','#87f2ff','#b7a0ff','#94f6aa','#ffffff'];
export const BOSS_CELEBRATION_MS=2600;
/** Efeito determinístico no canvas: sem áudio, imagem, rede ou custo adicional. */
export function drawDefeatEffects(
 c:CanvasRenderingContext2D,run:Run,camera:number,vertical:number,
 width:number,height:number,reducedMotion=false
):void{
 for(const e of run.defeatEffects){
  if(reducedMotion)continue;
  const t=Math.min(1,e.ageMs/580);
  const scale=Math.max(0,1-t);
  const size=22*scale;
  if(size<=0)continue;
  c.save();c.globalAlpha=1-t;
  c.fillStyle=e.kind==='sentry'?'#74dbd1':e.kind==='hopper'?'#a98bff':e.kind==='runner'?'#ffae64':'#fa8a91';
  c.fillRect(Math.round(e.x-camera-size/2),Math.round(e.y-vertical-size/2),size,size);
  c.restore();
 }
 const boss=run.boss;
 if(!boss||run.bossCelebrationMs<=0)return;
 const t=run.bossCelebrationMs,centerX=boss.x+24-camera,centerY=boss.y+28-vertical;
 c.save();
 if(reducedMotion){
  c.fillStyle='#e9a5e3';c.fillRect(centerX-24,centerY-28,48,56);
 }else if(t<650){
  const scale=1+t/650*1.85;
  const widthPx=48*scale,heightPx=56*scale;
  if(Math.floor(t/95)%2===0){
   c.fillStyle='#e9a5e3';
   c.fillRect(centerX-widthPx/2,centerY-heightPx/2,widthPx,heightPx);
   c.fillStyle='#ffffff';
   c.fillRect(centerX-widthPx*.22,centerY-heightPx*.12,Math.max(4,widthPx*.12),Math.max(4,heightPx*.12));
  }
 }else{
  const age=(t-650)/1000;
  const bursts=[0,.28,.57];
  for(const [burstIndex,delay] of bursts.entries()){
   const bt=age-delay;if(bt<0)continue;
   for(let i=0;i<26;i++){
    const a=(i/26)*Math.PI*2+burstIndex*.46;
    const radius=Math.min(1,bt/1.2)*(52+(i*13)%100);
    const cx=centerX+Math.cos(a)*radius+(burstIndex-1)*20;
    const cy=centerY+Math.sin(a)*radius+bt*bt*45-(burstIndex%2)*18;
    const fade=Math.max(0,1-bt/1.75);
    if(fade<=0)continue;
    c.globalAlpha=fade;
    c.fillStyle=palette[(i+burstIndex)%palette.length];
    const size=3+(i%4);
    c.fillRect(cx-size/2,cy-size/2,size,size);
   }
  }
  // Confetes descem pelo canvas enquanto os fogos se espalham.
  for(let i=0;i<38;i++){
   const drift=((i*83)%width),fall=(((i*47)%height)+t*.12)%(height+40)-20;
   c.globalAlpha=Math.max(0,1-(t-850)/1900);
   c.fillStyle=palette[i%palette.length];
   c.fillRect(drift+Math.sin(t/250+i)*11,fall,4+(i%3),2+(i%4));
  }
 }
 c.restore();
 // Banner permanece na fase, sem abrir o portal antes da coleta das gemas.
 if(t>=750&&t<2500){
  const w=260,h=69,x=(width-w)/2,y=38;
  c.fillStyle='rgba(12,20,42,.89)';c.fillRect(x,y,w,h);
  c.strokeStyle='#ffd97b';c.lineWidth=2;c.strokeRect(x,y,w,h);
  c.textAlign='center';
  c.font='bold 14px system-ui';c.fillStyle='#f5e3ad';c.fillText('GUARDIÃO DERROTADO!',width/2,y+26);
  c.font='bold 24px system-ui';c.fillStyle='#fff4aa';c.fillText('+250 PONTOS',width/2,y+54);
 }
}
