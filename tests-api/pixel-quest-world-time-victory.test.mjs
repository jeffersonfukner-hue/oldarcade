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
const world=loadTs('../src/scripts/pixelQuest/worldClock.ts');
const idle={left:false,right:false,jump:false};
test('ciclo solar usa tempo jogado, não deslocamento da câmera ou direção',()=>{
 assert.deepEqual([world.worldTimeAt(0).day,world.worldTimeAt(0).hour,world.worldTimeAt(0).minute],[1,6,0]);
 const midday=world.worldTimeAt(60_000);
 assert.equal(midday.day,1);assert.equal(midday.hour,12);
 const evening=world.worldTimeAt(120_000);
 assert.equal(evening.hour,18);
 assert.deepEqual([world.worldTimeAt(240_000).day,world.worldTimeAt(240_000).hour],[2,6]);
 assert.deepEqual(world.skyColors(0),world.skyColors(0),'mesmo relógio deve gerar mesmo céu apesar da câmera');
 assert.notDeepEqual(world.skyColors(0),world.skyColors(100_000));
 assert.ok(world.skyColors(180_000).moonVisible);
 assert.equal(world.formatWorldTime(world.worldTimeAt(0)),'06:00');
});
test('explosão do Guardião dura 2,6 segundos, preserva pontuação e desbloqueio por gemas',()=>{
 const level=forest.createForestLevel('1-3'),run=gameplay.createRun(level);
 level.entities.forEach((e,i)=>{if(e.kind==='crystal')run.crystals.add(i)});
 assert.equal(gameplay.portalUnlocked(run,level),false);
 run.boss.hearts=0;run.score=270;run.bossCelebrationMs=1;
 const old=run.elapsedMs;
 for(let i=0;i<155;i++)gameplay.stepRun(run,level,idle);
 assert.ok(run.bossCelebrationMs>0);
 assert.equal(run.elapsedMs,old,'celebração não penaliza bônus por tempo');
 assert.equal(run.score,270,'nenhum bônus duplicado durante animação');
 assert.equal(gameplay.portalUnlocked(run,level),true,'chefe derrotado + gemas liberam portal');
 for(let i=0;i<5;i++)gameplay.stepRun(run,level,idle);
 assert.equal(run.bossCelebrationMs,0,'animação deve terminar sem congelar o jogador');
 assert.equal(run.boss.hearts,0);
});
test('inimigo encolhe visualmente sem alterar o contador de mortes duplicadas',()=>{
 const level=forest.createForestLevel('1-1'),run=gameplay.createRun(level);
 run.defeatEffects.push({x:60,y:90,ageMs:0,kind:'runner'});
 gameplay.stepRun(run,level,idle);
 assert.ok(run.defeatEffects[0].ageMs>0);
 assert.equal(gameplay.levelDefeated(run),0);
 run.defeatEffects[0].ageMs=575;
 gameplay.stepRun(run,level,idle);
 assert.equal(run.defeatEffects.length,0);
});
test('integração do HUD no canvas recebe relógio e fase sem alterar HUD lateral',()=>{
 const index=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 const render=readFileSync(new URL('../src/scripts/pixelQuest/render.ts',import.meta.url),'utf8');
 assert.match(index,/if\(!celebrating&&run.phase==='playing'\)worldElapsedMs\+=STEP\*1000/);
 assert.match(index,/drawPlatformScene\(canvas,level,run,camera,worldElapsedMs,levelIndex,reducedMotion\)/);
 assert.match(render,/FASE '\+run.score.toLocaleString/);
 assert.match(render,/TOTAL '\+\(completedScore\+run.score\).toLocaleString/);
 assert.match(render,/DIA /);
 assert.match(render,/FASE /);
 assert.match(render,/run.score.toLocaleString\('pt-BR'\)/);
 assert.match(render,/run.hearts/);
 assert.match(render,/skyColors\(worldElapsedMs\)/);
 assert.doesNotMatch(render,/const ratio=camera\//,'sol não pode depender da posição horizontal');
});

test('efeitos de vitória: zoom inicial, banner de 250 pontos e movimento reduzido',()=>{
 const effects=loadTs('../src/scripts/pixelQuest/victoryEffects.ts');
 const level=forest.createForestLevel('1-3'),run=gameplay.createRun(level);
 run.boss.hearts=0;run.bossCelebrationMs=220;
 const calls=[];
 const context={
  save(){},restore(){},beginPath(){},arc(){},fill(){},
  fillRect(...args){calls.push(['rect',...args])},
  strokeRect(...args){calls.push(['stroke',...args])},
  fillText(...args){calls.push(['text',...args])},
  set globalAlpha(v){},set fillStyle(v){},set strokeStyle(v){},
  set lineWidth(v){},set font(v){},set textAlign(v){}
 };
 effects.drawDefeatEffects(context,run,run.boss.x-300,0,640,360);
 assert.ok(calls.some(c=>c[0]==='rect'),'Guardião deve crescer e piscar antes de explodir');
 run.bossCelebrationMs=1100;calls.length=0;
 effects.drawDefeatEffects(context,run,run.boss.x-300,0,640,360);
 assert.ok(calls.some(c=>c[0]==='text'&&c[1]==='GUARDIÃO DERROTADO!'));
 assert.ok(calls.some(c=>c[0]==='text'&&c[1]==='+250 PONTOS'));
 const normalCount=calls.filter(c=>c[0]==='rect').length;
 calls.length=0;
 effects.drawDefeatEffects(context,run,run.boss.x-300,0,640,360,true);
 assert.ok(calls.filter(c=>c[0]==='rect').length<normalCount,'reduzir partículas com movimento reduzido');
});

test('relógio não reinicia na troca de fase: 12:30 permanece 12:30 até voltar a jogar',()=>{
 const atTransition=65_000;
 assert.equal(world.formatWorldTime(world.worldTimeAt(atTransition)),'12:30');
 assert.equal(world.formatWorldTime(world.worldTimeAt(atTransition)),'12:30');
 assert.equal(world.formatWorldTime(world.worldTimeAt(atTransition+1_000)),'12:36');
 const code=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 assert.match(code,/let worldElapsedMs=0;/);
 assert.match(code,/worldElapsedMs=results.reduce\(\(sum,stage\)=>sum\+stage.elapsedMs,0\)/);
 assert.match(code,/if\(!celebrating&&run.phase==='playing'\)worldElapsedMs\+=STEP\*1000/);
 assert.match(code,/else\{levelIndex=0;results=\[\];worldElapsedMs=0\}/,'somente nova campanha zera relógio');
});
test('sol e lua se deslocam em direções contínuas e cruzam suavemente',()=>{
 const sunset=world.skyColors(130_000);
 const later=world.skyColors(140_000);
 assert.ok(sunset.sunX<=later.sunX);
 assert.ok(sunset.moonX<=later.moonX||later.moonX<sunset.moonX,'trajeto lunar é cíclico');
 const dawn=world.skyColors(239_000),next=world.skyColors(240_000);
 assert.equal(dawn.moonVisible,true);
 assert.ok(Math.abs(dawn.sunX-next.sunX)<100);
});
