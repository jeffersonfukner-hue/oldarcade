import {worldTimeAt} from './worldClock';

export type SkyEvent='balloon'|'plane'|'jet'|'birds'|'owl'|'eyes'|'silhouette'|'shooting-star'|'meteorite';
const DAY_EVENTS:SkyEvent[]=['birds','balloon','plane','birds','jet'];
const NIGHT_EVENTS:SkyEvent[]=['owl','eyes','silhouette','shooting-star','meteorite'];
const hash=(n:number)=>{let x=n|0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);return (x^(x>>>16))>>>0};
const pick=(seed:number)=>hash(seed)/4294967295;
export function atmosphereEvent(elapsedMs:number):{kind:SkyEvent;progress:number}|null{
 const t=worldTimeAt(elapsedMs),hour=t.hour+t.minute/60;
 const night=hour>=20||hour<5.5,day=hour>=8&&hour<17;
 if(!night&&!day)return null;
 const slot=Math.floor(Math.max(0,elapsedMs)/21000),within=Math.max(0,elapsedMs)%21000;
 if(within>10500||pick(slot+81)<.27)return null;
 const list=night?NIGHT_EVENTS:DAY_EVENTS;
 return {kind:list[Math.floor(pick(slot+709)*list.length)%list.length],progress:within/10500};
}
function pixel(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
}
function stars(c:CanvasRenderingContext2D,ms:number,reduced:boolean){
 const time=worldTimeAt(ms),hour=time.hour+time.minute/60;
 const alpha=Math.max(0,Math.min(1,hour>=19?(hour-19)/2:hour<6?(6-hour)/2:0));
 if(!alpha)return;
 c.save();
 for(let i=0;i<135;i++){
  const x=pick(i*41+320)*640,center=160-x*.21,y=center+(pick(i*19+701)-.5)*55;
  const density=Math.max(0,1-Math.abs(y-center)/42);
  c.globalAlpha=alpha*(.08+density*.20);
  pixel(c,x,y,1+i%3,1+i%3,i%3===0?'#c6b9ec':'#8facd8');
 }
 for(let i=0;i<100;i++){
  const x=pick(i*37+11)*640,y=pick(i*31+97)*190;
  c.globalAlpha=alpha*(.45+pick(i*17+6)*.55)*(reduced?1:.76+.24*Math.sin(ms/650+i*4.27));
  pixel(c,x,y,i%11===0?2:1,i%11===0?2:1,i%7===0?'#ffedcf':'#d3e7ff');
 }
 c.restore();
}
function aircraft(c:CanvasRenderingContext2D,x:number,y:number,jet:boolean,dir:number){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir,1);
 pixel(c,-21,-3,42,6,jet?'#b6d8e5':'#f2ebdc');
 pixel(c,-4,-11,13,23,jet?'#6eacc4':'#d7b58a');
 pixel(c,-19,-9,8,6,'#5b7d9c');
 pixel(c,9,-5,8,3,'#f9f2d9');
 pixel(c,-15,-2,7,2,'#284b67');
 if(jet){pixel(c,-34,0,13,2,'#e4b5a5');pixel(c,-40,1,5,1,'#eecda7')}
 c.restore();
}
function balloon(c:CanvasRenderingContext2D,x:number,y:number){
 // Listras blocadas em uma copa oval de pixel art.
 const stripes=['#f47c76','#f7cb6b','#70d5b0','#77a9e9','#d49ee9'];
 const rows=[[-10,20],[-15,30],[-18,36],[-18,36],[-16,32],[-12,24],[-7,14]];
 rows.forEach(([left,width],r)=>{
  const cy=y-23+r*5;
  for(let k=0;k<5;k++)pixel(c,x+left+k*width/5,cy,Math.ceil(width/5),5,stripes[k]);
 });
 pixel(c,x-4,y+12,2,9,'#e8d5a7');pixel(c,x+4,y+12,2,9,'#e8d5a7');
 pixel(c,x-7,y+21,14,7,'#865a3b');pixel(c,x-5,y+23,10,3,'#c69255');
}
function meteor(c:CanvasRenderingContext2D,x:number,y:number,progress:number,impact:boolean){
 c.save();
 if(impact&&progress>.82){
  const a=(progress-.82)/.18;
  for(let i=0;i<14;i++){
   const angle=i*Math.PI/7,dist=36*a;
   pixel(c,x+Math.cos(angle)*dist,y+Math.sin(angle)*dist,3,3,i%2?'#ffb46b':'#fff1b0');
  }
 }else{
  // Corpo pixelado, rastro em segmentos oblíquos e aceleração aparente.
  for(let i=8;i>=1;i--){
   const sx=x+i*7,sy=y-i*5;
   pixel(c,sx,sy,i<4?5:3,i<4?4:2,i<3?'#ffe5a2':i<6?'#f89a5c':'#8d7896');
  }
  pixel(c,x-4,y-4,10,9,'#ff9c58');
  pixel(c,x-1,y-3,6,6,'#fff2c4');
 }
 c.restore();
}
function forestAnimal(c:CanvasRenderingContext2D,kind:SkyEvent,ms:number,progress:number,camera:number,reduced:boolean){
 const slot=Math.floor(ms/21000);
 // Posições ancoradas no mundo, deslocamento parallax próprio e NÃO no player.
 const xFor=(seed:number,depth:number)=>Math.round(90+pick(seed)*950-camera*depth);
 const blink=(seed:number)=>reduced||((ms/1000+seed)%5)<4.7;
 if(kind==='owl'){
  const x=xFor(slot+301,.22),y=198+Math.floor(pick(slot+92)*3)*12;
  pixel(c,x-9,y,20,19,'#111e30');pixel(c,x-8,y-7,6,8,'#111e30');pixel(c,x+5,y-7,6,8,'#111e30');
  pixel(c,x-11,y+13,4,9,'#182c3f');pixel(c,x+9,y+13,4,9,'#182c3f');
  if(blink(slot)){pixel(c,x-4,y+5,4,4,'#f7d58b');pixel(c,x+5,y+5,4,4,'#f7d58b')}
  else {pixel(c,x-4,y+6,4,1,'#f7d58b');pixel(c,x+5,y+6,4,1,'#f7d58b')}
  pixel(c,x+1,y+12,3,4,'#b77852');
 }else if(kind==='eyes'){
  // Três distâncias, alturas, tamanhos e ritmos de piscar diferentes.
  for(let i=0;i<3;i++){
   const x=xFor(slot*7+i*83+124,[.15,.29,.42][i]);
   const y=[213,244,230][i],size=[2,4,3][i],gap=[7,13,10][i];
   if(blink(slot+i*2)){
    pixel(c,x,y,size,size,i===1?'#e9cc8a':'#9aceba');
    pixel(c,x+gap,y,size,size,i===1?'#e9cc8a':'#9aceba');
   }else{
    pixel(c,x,y+1,size,1,'#9aceba');pixel(c,x+gap,y+1,size,1,'#9aceba');
   }
  }
 }else if(kind==='silhouette'){
  const x=xFor(slot+701,.32),y=242;
  pixel(c,x,y,29,13,'#102336');pixel(c,x+20,y-9,11,15,'#102336');
  pixel(c,x+3,y+12,4,12,'#102336');pixel(c,x+23,y+12,4,12,'#102336');
 }
}
/** Sky desenhado ANTES das árvores para impedir estrelas dentro de copas;
 * fauna desenhada após árvores. Todos os eventos avançam pelo relógio do mundo. */
export function drawWorldAtmosphere(
 c:CanvasRenderingContext2D,elapsedMs:number,reducedMotion=false,
 layer:'sky'|'forest'='sky',camera=0
):void{
 const event=atmosphereEvent(elapsedMs);
 if(layer==='sky')stars(c,elapsedMs,reducedMotion);
 if(!event)return;
 const {kind,progress}=event;
 const isForest=kind==='owl'||kind==='eyes'||kind==='silhouette';
 if(layer==='forest'){if(isForest)forestAnimal(c,kind,elapsedMs,progress,camera,reducedMotion);return}
 if(isForest)return;
 const slot=Math.floor(elapsedMs/21000);
 c.save();
 if(kind==='balloon'){
  const x=680-progress*310;
  balloon(c,x,94+Math.sin(elapsedMs/1300)*4);
 }else if(kind==='plane'||kind==='jet'){
  const dir=pick(slot+230)>.5?1:-1;
  const x=dir===1?-70+progress*780:710-progress*780;
  aircraft(c,x,69+pick(slot+19)*52,kind==='jet',dir);
 }else if(kind==='birds'){
  const dir=pick(slot+207)>.5?1:-1;
  const x=dir===1?-80+progress*780:720-progress*780;
  for(let i=0;i<5;i++){
   const bx=x-dir*i*20,by=74+i%2*11+Math.sin(elapsedMs/240+i)*3;
   pixel(c,bx-6,by,5,2,'#24364e');pixel(c,bx,by-2,4,3,'#24364e');pixel(c,bx+4,by,5,2,'#24364e');
  }
 }else if(kind==='shooting-star'||kind==='meteorite'){
  const meteorite=kind==='meteorite';
  const fast=Math.min(1,progress*(meteorite?3.2:1.8));
  const flight=meteorite?Math.min(1,fast/.82):fast;
  const x=650-flight*(meteorite?430:350);
  const y=meteorite?38+flight*234:35+fast*110;
  meteor(c,x,y,fast,meteorite);
 }
 c.restore();
}
