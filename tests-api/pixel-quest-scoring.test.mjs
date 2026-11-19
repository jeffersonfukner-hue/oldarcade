import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function loadTs(path){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('module','exports',js)(module,module.exports);
 return module.exports;
}
const scoring=loadTs('../src/scripts/pixelQuest/scoring.ts');
test('pontuação combina cristais, inimigos e tempo efetivo',()=>{
 const fast=scoring.calculateCompletedLevel('1-1',6,2,30000);
 const slow=scoring.calculateCompletedLevel('1-1',6,2,90000);
 assert.equal(fast.score,60+100+100+440);
 assert.equal(slow.score,60+100+100+320);
 assert.ok(fast.score>slow.score);
});
test('bônus de tempo é limitado e não fica negativo',()=>{
 assert.equal(scoring.timeBonus(0),500);
 assert.equal(scoring.timeBonus(250000),0);
 assert.equal(scoring.timeBonus(999999),0);
 assert.throws(()=>scoring.timeBonus(-1));
});
test('total geral soma resultados concluídos, sem duplicar níveis',()=>{
 const a=scoring.calculateCompletedLevel('1-1',6,2,30000);
 const b=scoring.calculateCompletedLevel('1-2',8,3,60000);
 assert.equal(scoring.campaignScore([a,b]),a.score+b.score);
 assert.throws(()=>scoring.campaignScore([a,a]));
});
