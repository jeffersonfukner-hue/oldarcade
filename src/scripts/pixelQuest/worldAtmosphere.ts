import {skyColors,worldTimeAt,WORLD_DAY_DURATION_MS} from './worldClock';

export type SkyEvent='balloon'|'plane'|'jet'|'birds'|'owl'|'eyes'|'silhouette'|'shooting-star'|'meteorite';
const DAY_EVENTS:SkyEvent[]=['birds','balloon','plane','birds','jet'];
const NIGHT_EVENTS:SkyEvent[]=['owl','eyes','silhouette','shooting-star','meteorite'];
const hash=(n:number)=>{let x=n|0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);return (x^(x>>>16))>>>0};
const pick=(seed:number)=>hash(seed)/4294967295;
export function atmosphereEvent(elapsedMs:number):{kind:SkyEvent;progress:number}|null{
 const t=worldTimeAt(elapsedMs),hour=t.hour+t.minute/60;
 const night=hour>=20||hour<5.5,day=hour>=8&&hour<17;
 if(!night&&!day)return null;
 // Slots estáveis de 21 segundos; o evento de cada slot é opcional e nunca concorre com outro.
 const slot=Math.floor(Math.max(0,elapsedMs)/21000),within=Math.max(0,elapsedMs)%21000;
 if(within>10500||pick(slot+81)<.27)return null;
 const list=night?NIGHT_EVENTS:DAY_EVENTS;
 return {kind:list[Math.floor(pick(slot+709)*list.length)%list.length],progress:within/10500};
}
function starPosition(i:number){return {x:pick(i*37+11)*640,y:pick(i*31+97)*190,brightness:.45+pick(i*17+6)*.55}}
/** Estrelas, Via Láctea, objetos do céu e animais. Somente decoração, sem modificar física. */
export function drawWorldAtmosphere(
 c:CanvasRenderingContext2D,elapsedMs:number,reducedMotion=false
):void{
 const sky=skyColors(elapsedMs),time=worldTimeAt(elapsedMs);
 const hour=time.hour+time.minute/60;
 const nightAlpha=Math.max(0,Math.min(1,(hour>=19?(hour-19)/2:hour<6?(6-hour)/2:0)));
 if(nightAlpha>0){
  c.save();c.globalAlpha=nightAlpha;
  // Faixa difusa da Via Láctea inclinada, com estrelas concentradas.
  for(let i=0;i<135;i++){
   const x=pick(i*41+320)*640;
   const center=160-x*.21;
   const y=center+(pick(i*19+701)-.5)*55;
   const density=Math.max(0,1-Math.abs(y-center)/42);
   c.fillStyle=i%3===0?'#c6b9ec':'#8facd8';
   c.globalAlpha=nightAlpha*(.08+density*.20);
   c.fillRect(x,y,1+(i%3),1+(i%3));
  }
  for(let i=0;i<100;i++){
   const p=starPosition(i);
   c.globalAlpha=nightAlpha*p.brightness*(reducedMotion?1:(.76+.24*Math.sin(elapsedMs/650+i*4.27)));
   c.fillStyle=i%7===0?'#ffedcf':'#d3e7ff';
   c.fillRect(p.x,p.y,i%11===0?2:1,i%11===0?2:1);
  }
  c.restore();
 }
 const event=atmosphereEvent(elapsedMs);
 if(!event)return;
 const {kind,progress}=event,x=-70+progress*790,y=52+Math.sin(progress*6.28)*9;
 c.save();
 if(kind==='birds'){
  c.strokeStyle='#202e48';c.lineWidth=2;
  for(let i=0;i<5;i++){
   const bx=x-i*23,by=y+(i%2)*13;
   c.beginPath();c.moveTo(bx-7,by+2);c.lineTo(bx,by);c.lineTo(bx+7,by+2);c.stroke();
  }
 }else if(kind==='balloon'){
  c.fillStyle='#e68a6b';c.beginPath();c.ellipse(x,y,12,16,0,0,Math.PI*2);c.fill();
  c.strokeStyle='#d9e6e8';c.beginPath();c.moveTo(x-6,y+12);c.lineTo(x-4,y+21);c.moveTo(x+6,y+12);c.lineTo(x+4,y+21);c.stroke();
  c.fillStyle='#8a6040';c.fillRect(x-6,y+20,12,6);
 }else if(kind==='plane'||kind==='jet'){
  c.fillStyle=kind==='jet'?'#d2dfef':'#f9e9d2';
  c.fillRect(x-17,y-2,34,5);c.fillRect(x-4,y-9,11,17);
  c.fillRect(x-17,y-6,7,4);
  if(kind==='jet'){c.fillStyle='rgba(244,239,220,.55)';c.fillRect(x-35,y,20,2)}
 }else if(kind==='shooting-star'||kind==='meteorite'){
  const fromRight=620-progress*460;
  const h=kind==='meteorite'?18+progress*275:44+progress*90;
  c.strokeStyle=kind==='meteorite'?'#ffa86e':'#f1f9ff';c.lineWidth=2.5;
  c.beginPath();c.moveTo(fromRight+55,h-39);c.lineTo(fromRight,h);c.stroke();
  c.fillStyle='#fff4c2';c.fillRect(fromRight-3,h-3,6,6);
  if(kind==='meteorite'&&progress>.94){
   c.fillStyle='#ffb36a';
   for(let i=0;i<12;i++){
    const angle=i*Math.PI/6,rad=(progress-.94)*280;
    c.fillRect(fromRight+Math.cos(angle)*rad,305+Math.sin(angle)*rad,3,3);
   }
  }
 }else if(kind==='owl'){
  const bx=130+Math.floor(pick(time.day)*3)*125;
  c.fillStyle='#17243e';c.fillRect(bx,216,21,20);c.fillRect(bx+2,210,5,8);c.fillRect(bx+14,210,5,8);
  c.fillStyle='#e7c783';c.fillRect(bx+5,220,3,3);c.fillRect(bx+14,220,3,3);
 }else if(kind==='eyes'){
  const bx=60+Math.floor(pick(time.day*4)*4)*120;
  const visible=reducedMotion||Math.sin(elapsedMs/500)>-.1;
  if(visible){c.fillStyle='#f5d875';c.fillRect(bx,243,4,4);c.fillRect(bx+12,243,4,4)}
 }else if(kind==='silhouette'){
  const bx=100+progress*330;
  c.fillStyle='#17263b';c.fillRect(bx,260,30,15);c.fillRect(bx+22,252,12,14);
  c.fillRect(bx+3,273,4,12);c.fillRect(bx+22,273,4,12);
 }
 c.restore();
}
