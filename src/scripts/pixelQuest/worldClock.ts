/** Relógio simulado, não condicionado à direção ou à câmera. */
export const WORLD_DAY_DURATION_MS=240_000;
export type WorldTime={day:number;hour:number;minute:number;cycle:number;elapsedMs:number};
export function worldTimeAt(elapsedMs:number):WorldTime{
 const safe=Number.isFinite(elapsedMs)?Math.max(0,elapsedMs):0;
 const cycle=(safe%WORLD_DAY_DURATION_MS)/WORLD_DAY_DURATION_MS;
 const totalMinutes=Math.floor((6*60+cycle*24*60)%(24*60));
 return {day:Math.floor(safe/WORLD_DAY_DURATION_MS)+1,
  hour:Math.floor(totalMinutes/60),minute:totalMinutes%60,cycle,elapsedMs:safe};
}
export function formatWorldTime(time:WorldTime):string{
 return String(time.hour).padStart(2,'0')+':'+String(time.minute).padStart(2,'0');
}
/** Céu suave ao longo do relógio do mundo, inclusive ao retroceder pelo mapa. */
export function skyColors(elapsedMs:number):{top:string;bottom:string;sunVisible:boolean;moonVisible:boolean;orbX:number;orbY:number}{
 const {hour,minute}=worldTimeAt(elapsedMs);
 const h=hour+minute/60;
 const stops=[
  {h:0,top:'#0a1630',bottom:'#232d58'},
  {h:5,top:'#182446',bottom:'#4c4168'},
  {h:7,top:'#5b6799',bottom:'#f7a879'},
  {h:10,top:'#3798ce',bottom:'#a7e0e9'},
  {h:14,top:'#398fc5',bottom:'#b8d9e7'},
  {h:17,top:'#82659d',bottom:'#ed9b72'},
  {h:19,top:'#242b58',bottom:'#be6973'},
  {h:21,top:'#101b3b',bottom:'#344465'},
  {h:24,top:'#0a1630',bottom:'#232d58'}
 ];
 const b=stops.findIndex((s,i)=>i>0&&h<=s.h);
 const i=Math.max(1,b),before=stops[i-1],after=stops[i];
 const t=Math.max(0,Math.min(1,(h-before.h)/(after.h-before.h)));
 const color=(a:string,z:string)=>'#'+[1,3,5].map(k=>Math.round(parseInt(a.slice(k,k+2),16)*(1-t)+parseInt(z.slice(k,k+2),16)*t).toString(16).padStart(2,'0')).join('');
 const sunVisible=h>=6&&h<19;
 const progress=sunVisible?(h-6)/13:(h>=19?(h-19)/11:(h+5)/11);
 return {top:color(before.top,after.top),bottom:color(before.bottom,after.bottom),
  sunVisible,moonVisible:!sunVisible,orbX:75+500*progress,
  orbY:sunVisible?165-Math.sin(Math.PI*progress)*128:56+Math.sin(Math.PI*progress)*45};
}
