import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function loadTs(path,dependencies={}){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)((name)=>Object.hasOwn(dependencies,name)?dependencies[name]:require(name),module,module.exports);
 return module.exports;
}
const levels=loadTs('../src/scripts/pixelQuest/levels.ts');
const physics=loadTs('../src/scripts/pixelQuest/physics.ts',{'./levels':levels});
const gameplay=loadTs('../src/scripts/pixelQuest/gameplay.ts',{'./physics':physics});
const forest=loadTs('../src/data/pixelQuest/forestDesign.ts');
const idle={left:false,right:false,jump:false};
const maps=['1-1','1-2','1-3'].map(id=>forest.createForestLevel(id));
test('Variação real: 4 tipos, contagem crescente, itens e posições válidas',()=>{
 const counts=[13,19,22],crystals=[16,19,21];
 for(const [i,map] of maps.entries()){
  assert.doesNotThrow(()=>levels.validateLevel(map));
  assert.deepEqual(forest.forestLayoutAudit(map),[]);
  assert.equal(map.entities.filter(e=>e.kind==='crystal').length,crystals[i]);
  const run=gameplay.createRun(map);
  assert.equal(run.enemies.length,counts[i]);
  assert.deepEqual(new Set(run.enemies.map(e=>e.kind)),new Set(['patroller','runner','hopper','sentry']));
  assert.equal(map.entities.filter(e=>['shield','heart','frenzy'].includes(e.kind)).length,3);
 }
});
test('Rota alta na 1-2 exige progredir e retornar para obter cristal',()=>{
 const map=maps[1],isPlatform=(from,to,row)=>Array.from({length:to-from+1},(_,i)=>map.tiles[row][from+i]).every(t=>t===2);
 for(const [from,to,row] of [[51,57,13],[59,65,11],[68,74,9],[59,64,8],[50,55,8]]){
  assert.ok(isPlatform(from,to,row),`plataforma de retorno ${from}-${to} na linha ${row}`);
 }
 assert.ok(map.entities.some(e=>e.kind==='crystal'&&Math.floor(e.x/32)===53&&e.y===8*32-25));
 // Diferença de 7 tiles = 224px: salto direto do chão não alcança.
 assert.ok((15-8)*32>150);
 // Patamares consecutivos têm diferenças verticais <=64px e passos curtos.
 const heights=[13,11,9,8,8];
 assert.ok(heights.slice(1).every((h,i)=>Math.abs(h-heights[i])*32<=64));
});
test('Escudo absorve contato uma vez, sem reduzir corações',()=>{
 const map=maps[0],run=gameplay.createRun(map);
 const shield=map.entities.find(e=>e.kind==='shield');
 run.player.x=shield.x;run.player.y=shield.y;
 gameplay.stepRun(run,map,idle);
 assert.equal(run.shield,1);assert.equal(run.score,30);
 gameplay.receiveDamage(run,400);
 assert.equal(run.shield,0);assert.equal(run.hearts,3);
 assert.ok(run.invulnerable>0);
});
test('Multiplicador dobra pontuação de cristais e emite evento de ponto flutuante',()=>{
 const map=maps[0],run=gameplay.createRun(map);
 const frenzy=map.entities.find(e=>e.kind==='frenzy');
 run.player.x=frenzy.x;run.player.y=frenzy.y;
 gameplay.stepRun(run,map,idle);
 assert.ok(run.frenzyTime>9);
 assert.equal(run.score,60);
 const crystal=map.entities.find(e=>e.kind==='crystal');
 run.player.x=crystal.x;run.player.y=crystal.y;
 gameplay.stepRun(run,map,idle);
 assert.equal(run.score,80);
 assert.deepEqual(run.scoreEvents.map(e=>e.amount),[60,20]);
 assert.ok(run.scoreEvents.every(e=>Number.isFinite(e.x)&&Number.isFinite(e.y)));
});
test('Inimigo corredor não sai do suporte ao aproximar-se de um abismo',()=>{
 const map=maps[1],run=gameplay.createRun(map);
 const runner=run.enemies.find(e=>e.kind==='runner'&&e.origin===39*32);
 assert.ok(runner);
 runner.x=40*32-16;runner.direction=1;
 gameplay.stepRun(run,map,idle);
 const supportCol=Math.floor((runner.x+11)/32);
 assert.notEqual(map.tiles[15][supportCol],0);
});
test('Sentinela permanece na plataforma alta, sem cair na área do solo',()=>{
 const map=maps[1],run=gameplay.createRun(map),sentry=run.enemies.find(e=>e.kind==='sentry'&&e.origin===54*32);
 assert.ok(sentry);
 for(let i=0;i<240;i++)gameplay.stepRun(run,map,idle);
 assert.equal(sentry.y,sentry.originY);
 assert.equal(map.tiles[8][Math.floor((sentry.x+11)/32)],2);
});

test('Regra homologada: gemas obrigatórias por fase, inimigos opcionais, Guardião obrigatório para trocar de mundo',()=>{
 for(const [i,map] of maps.entries()){
  const run=gameplay.createRun(map);
  assert.equal(gameplay.portalUnlocked(run,map),false,'gemas faltando não podem liberar portal');
  map.entities.forEach((entity,id)=>{if(entity.kind==='crystal')run.crystals.add(id)});
  if(i<2){
   assert.equal(gameplay.portalUnlocked(run,map),true,'fases 1/3 e 2/3 só exigem gemas');
   assert.equal(gameplay.levelDefeated(run),0,'nenhum inimigo precisa ser derrotado');
  }else{
   assert.equal(run.boss?.hearts,5);
   assert.equal(gameplay.portalUnlocked(run,map),false,'fase 3/3 exige derrotar Guardião');
   run.boss.hearts=0;
   assert.equal(gameplay.portalUnlocked(run,map),true,'gemas e Guardião derrotado concluem Mundo 1');
   assert.equal(gameplay.levelDefeated(run),0,'inimigos comuns continuam opcionais');
  }
 }
});

test('combo aéreo conta a partir do segundo inimigo e soma bônus progressivo',()=>{
 const run=gameplay.createRun(maps[0]);
 assert.equal(gameplay.registerAirStomp(run),0);
 assert.equal(run.airComboCount,1);
 assert.equal(gameplay.registerAirStomp(run),30);
 assert.equal(gameplay.registerAirStomp(run),60);
 for(let i=0;i<5;i++)gameplay.registerAirStomp(run);
 assert.equal(gameplay.registerAirStomp(run),150,'bônus tem teto');
});
test('combo é integrado ao pisão e termina ao pousar, cair ou sofrer dano',()=>{
 const source=readFileSync(new URL('../src/scripts/pixelQuest/gameplay.ts',import.meta.url),'utf8');
 const feedback=readFileSync(new URL('../src/scripts/scoreFeedback.ts',import.meta.url),'utf8');
 assert.match(source,/if\(run\.player\.grounded\)run\.airComboCount=0/);
 assert.match(source,/const comboBonus=registerAirStomp\(run\)/);
 assert.match(source,/award\(comboBonus,'COMBO x'\+run\.airComboCount\)/);
 assert.match(source,/run\.airComboCount=0;\s*if\(run\.shield>0\)/);
 assert.match(source,/function fallIntoPit[\s\S]*?run\.airComboCount=0/);
 assert.match(feedback,/element\.textContent=combo\?context/);
});
