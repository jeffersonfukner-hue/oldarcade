import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function loadTs(relativePath,dependencies={}){
 const source=readFileSync(new URL(relativePath,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)((name)=>Object.hasOwn(dependencies,name)?dependencies[name]:require(name),module,module.exports);
 return module.exports;
}
const levels=loadTs('../src/scripts/pixelQuest/levels.ts');
const forest=loadTs('../src/data/pixelQuest/forestDesign.ts');
const ledger=loadTs('../src/scripts/pixelQuest/campaignLedger.ts');
const progress=loadTs('../src/scripts/pixelQuest/progressContract.ts');
test('Mundo 1: três mapas válidos, com cristais, patrulheiros, chefão e rotas auditadas',()=>{
 const ids=['1-1','1-2','1-3'],widths=[300,366,425],crystals=[16,19,21],enemies=[6,9,11];
 for(let i=0;i<ids.length;i++){
  const map=forest.createForestLevel(ids[i]);
  assert.doesNotThrow(()=>levels.validateLevel(map));
  assert.deepEqual(forest.forestLayoutAudit(map),[]);
  assert.equal(map.width,widths[i]);
  assert.equal(map.entities.filter(e=>e.kind==='crystal').length,crystals[i]);
  assert.equal(map.entities.filter(e=>e.kind==='patroller').length,enemies[i]);
  assert.equal(map.entities.filter(e=>e.kind==='boss').length,i===2?1:0);
 }
});
test('Acumulado inclui perda na terceira fase, sem bônus ou duplicação',()=>{
 const completed=[{levelId:'1-1',score:500,elapsedMs:10000},{levelId:'1-2',score:700,elapsedMs:12000}];
 assert.deepEqual(ledger.campaignSnapshot(completed,{score:320,elapsedMs:4000},false),{score:1520,elapsedMs:26000,completedLevels:2,finished:false});
 assert.deepEqual(ledger.campaignSnapshot(completed,null,true),{score:1200,elapsedMs:22000,completedLevels:2,finished:true});
 assert.throws(()=>ledger.campaignSnapshot([completed[0],completed[0]],null,false));
});
test('Ranking legado preservado; fase e total em chaves independentes',()=>{
 assert.equal(ledger.questRecordId('phase','1-1'),'pixel-quest-stage-1-1-v2');
 assert.equal(ledger.questRecordId('phase','1-3'),'pixel-quest-stage-1-3-v2');
 assert.equal(ledger.questRecordId('total'),'pixel-quest-total-v2');
 assert.throws(()=>ledger.questRecordId('phase','../pixel-quest'));
});
test('Progresso só aceita sequência de fases completas e bem formada',()=>{
 const stages=[{levelId:'1-1',score:800,elapsedMs:10000,crystals:14,enemies:6},
 {levelId:'1-2',score:850,elapsedMs:25000,crystals:17,enemies:9}];
 assert.equal(progress.validateForestProgress({completed:stages}),true);
 assert.equal(progress.validateForestProgress({completed:[stages[1]]}),false);
 assert.equal(progress.validateForestProgress({completed:[...stages,stages[0]]}),false);
});

test('placar distingue fase e campanha e não usa barra de inimigos que reaparecem',()=>{
 const ui=readFileSync(new URL('../src/components/PixelQuestGame.astro',import.meta.url),'utf8');
 const code=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 assert.match(ui,/scoreLabel="Pontos da fase"/);
 assert.match(ui,/id="pq-campaign-score"/);
 assert.match(ui,/id="pq-enemies-active"/);
 assert.doesNotMatch(ui,/id="pq-enemies-remaining"/);
 assert.match(code,/killsInSession=ENEMY_KINDS.reduce/);
 assert.match(code,/campaignScore\.textContent=/);
 assert.match(code,/const previousScore=completeScore\(\)-\(phase==='won'\?run.score:0\)/);
 assert.match(code,/drawPlatformScene\(canvas,level,run,camera,worldElapsedMs,levelIndex,reducedMotion,previousScore,rankingFx,now\)/);
});
test('derrota não registra recorde da fase nem confirma classificação',()=>{
 const code=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 const lost=code.slice(code.indexOf('  }else{\n   const snapshot=campaignSnapshot(results,{score:run.score'),code.indexOf("  start.textContent=won?"));
 assert.ok(lost.length>0);
 assert.doesNotMatch(lost,/stageRanks\.record/);
 assert.doesNotMatch(lost,/updateLocalRecord/);
 assert.match(lost,/milestones\.dispose\(\)/);
 assert.match(lost,/nenhum recorde foi enviado/);
});

test('derrota no Pixel Quest não é elegível ao ranking global nem convite de salvar',()=>{
 const index=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 const ranking=readFileSync(new URL('../src/scripts/modeRanking.ts',import.meta.url),'utf8');
 const invite=readFileSync(new URL('../src/scripts/gameEndAccountInvite.ts',import.meta.url),'utf8');
 assert.match(index,/eligible:true/);
 assert.match(index,/eligible:false/);
 assert.match(ranking,/if\(game==='pixel-quest'&&d.eligible===false\)/);
 assert.match(ranking,/pending=null;[\s\S]*?Fase não concluída: resultado parcial não enviado ao ranking/);
 assert.match(invite,/detail.game==='pixel-quest'&&detail.eligible===false/);
});
