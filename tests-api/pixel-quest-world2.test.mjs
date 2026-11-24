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
const caverns=loadTs('../src/data/pixelQuest/crystalCavernsDesign.ts',{'../../scripts/pixelQuest/levels':levels});
const physics=loadTs('../src/scripts/pixelQuest/physics.ts',{'./levels':levels});
const gameplay=loadTs('../src/scripts/pixelQuest/gameplay.ts',{'./physics':physics,'./levels':levels});
const progress=loadTs('../src/scripts/pixelQuest/progressContract.ts');

test('Mundo 2 cria três cavernas válidas, de dificuldade crescente e Guardião Prismático final',()=>{
 const maps=['2-1','2-2','2-3'].map(caverns.createCrystalCavernsLevel);
 for(const map of maps){
  assert.doesNotThrow(()=>levels.validateLevel(map));
  assert.deepEqual(caverns.crystalCavernsLayoutAudit(map),[]);
  assert.ok(map.entities.some(e=>e.kind==='updraft'),'a nova mecânica é apresentada em '+map.id);
 }
 assert.ok(maps[1].width>maps[0].width);
 assert.ok(maps[2].width>maps[1].width);
 assert.ok(maps[2].entities.some(e=>e.kind==='boss'));
 assert.equal(maps[2].bossName,'GUARDIÃO PRISMÁTICO');
});

test('Corrente prismática aplica elevação e mantém o controle lateral do jogador',()=>{
 const level=caverns.createCrystalCavernsLevel('2-1'),run=gameplay.createRun(level);
 const draft=level.entities.find(e=>e.kind==='updraft');
 run.player.x=draft.x+10;run.player.y=draft.y+draft.height-50;run.player.vx=0;run.player.vy=0;
 gameplay.stepRun(run,level,{left:false,right:true,jump:false},physics.STEP);
 assert.ok(run.player.vy<0,'a corrente deve elevar');
 assert.ok(run.player.vx>0,'direção do jogador continua respondendo');
});

test('Progresso preserva o Mundo 1 e só aceita o Mundo 2 em sequência',()=>{
 const stages=['1-1','1-2','1-3','2-1'].map((levelId,index)=>({levelId,score:700+index,elapsedMs:10000,crystals:18,enemies:6}));
 assert.equal(progress.validateQuestProgress({completed:stages}),true);
 assert.equal(progress.validateQuestProgress({completed:[stages[3]]}),false);
});
