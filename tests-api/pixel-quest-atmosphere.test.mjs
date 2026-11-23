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

test('eventos celestes têm trajetória própria e fauna utiliza âncoras do mundo',()=>{
 const source=readFileSync(new URL('../src/scripts/pixelQuest/worldAtmosphere.ts',import.meta.url),'utf8');
 assert.match(source,/camera\*depth/);
 assert.match(source,/kind==='balloon'/);
 assert.match(source,/dir===1\?-70/);
 assert.match(source,/layer==='sky'\)stars/);
});
test('minimapa próximo omite cristais coletados e inimigos derrotados',()=>{
 const src=readFileSync(new URL('../src/scripts/pixelQuest/minimap.ts',import.meta.url),'utf8');
 assert.match(src,/Math\.abs\(e\.x-center\)>radius/);
 assert.match(src,/run\.crystals\.has\(id\)/);
 assert.match(src,/enemy\.alive/);
});

test('radar centra jogador e filtra entidades coletadas, distantes ou derrotadas',()=>{
 const minimap=loadTs('../src/scripts/pixelQuest/minimap.ts');
 const level={entities:[
  {kind:'player',x:1000,y:100},
  {kind:'crystal',x:1030,y:90},
  {kind:'crystal',x:1060,y:90},
  {kind:'crystal',x:1950,y:90},
  {kind:'checkpoint',x:1010,y:90},
  {kind:'shield',x:1080,y:90},
  {kind:'exit',x:1300,y:80}
 ]};
 const run={player:{x:1000,y:100,w:22},crystals:new Set([1]),collectedPowerups:new Set([5]),checkpointActive:true,
  enemies:[{x:1100,y:100,alive:true},{x:1040,y:100,alive:false}],
  boss:null};
 const marks=minimap.minimapMarkers(level,run);
 assert.equal(marks.filter(m=>m.kind==='crystal').length,1);
 assert.equal(marks.filter(m=>m.kind==='enemy').length,1);
 assert.equal(marks.filter(m=>m.kind==='checkpoint').length,0);
 assert.equal(marks.filter(m=>m.kind==='shield').length,0);
 assert.equal(marks.filter(m=>m.kind==='exit').length,1);
 assert.equal(marks.some(m=>Math.abs(m.dx)>560),false);
 const former=marks.find(m=>m.kind==='crystal').dx;
 run.player.x+=30;
 assert.equal(minimap.minimapMarkers(level,run).find(m=>m.kind==='crystal').dx,former-30);
});
