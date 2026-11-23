import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function loadTs(path,deps={}){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',code)((id)=>Object.hasOwn(deps,id)?deps[id]:require(id),module,module.exports);
 return module.exports;
}
const clock=loadTs('../src/scripts/pixelQuest/worldClock.ts');
const atmosphere=loadTs('../src/scripts/pixelQuest/worldAtmosphere.ts',{'./worldClock':clock});
test('sol cruza da esquerda para a direita e lua nasce no lado oposto, sem pulo na virada de dia',()=>{
 const time=(hour)=>((hour-6+24)%24)/24*clock.WORLD_DAY_DURATION_MS;
 const sunMorning=clock.skyColors(time(8)),sunEvening=clock.skyColors(time(17));
 assert.ok(sunEvening.sunX>sunMorning.sunX);
 const moonEarly=clock.skyColors(time(20)),moonLate=clock.skyColors(time(4));
 assert.ok(moonLate.moonX>moonEarly.moonX);
 const before=clock.skyColors(clock.WORLD_DAY_DURATION_MS-100),after=clock.skyColors(clock.WORLD_DAY_DURATION_MS);
 assert.ok(Math.abs(before.sunX-after.sunX)<20);
 assert.ok(Math.abs(before.moonX-after.moonX)<20);
});
test('aurora e crepúsculo interpolam luz do sol e da lua sem teleportar o céu',()=>{
 const t=(h)=>((h-6+24)%24)/24*clock.WORLD_DAY_DURATION_MS;
 for(const hour of [6,18.9]){
  const sky=clock.skyColors(t(hour));
  assert.ok(sky.sunAlpha>=0&&sky.sunAlpha<=1);
  assert.ok(sky.moonAlpha>=0&&sky.moonAlpha<=1);
  assert.ok(sky.sunX>=40&&sky.sunX<=600);
  assert.ok(sky.moonX>=40&&sky.moonX<=600);
 }
});
test('eventos são no máximo um por vez, reproduzíveis e sem depender da câmera',()=>{
 for(let ms=0;ms<clock.WORLD_DAY_DURATION_MS*3;ms+=1100){
  const event=atmosphere.atmosphereEvent(ms);
  assert.deepEqual(event,atmosphere.atmosphereEvent(ms));
  if(event)assert.ok(['balloon','plane','jet','birds','owl','eyes','silhouette','shooting-star','meteorite'].includes(event.kind));
 }
});
test('eventos de dia e noite são exclusivos e não interferem no motor',()=>{
 for(let ms=0;ms<clock.WORLD_DAY_DURATION_MS*4;ms+=3100){
  const event=atmosphere.atmosphereEvent(ms);if(!event)continue;
  const t=clock.worldTimeAt(ms),h=t.hour+t.minute/60;
  if(h>=8&&h<17)assert.ok(['balloon','plane','jet','birds'].includes(event.kind));
  else assert.ok(['owl','eyes','silhouette','shooting-star','meteorite'].includes(event.kind));
 }
});
