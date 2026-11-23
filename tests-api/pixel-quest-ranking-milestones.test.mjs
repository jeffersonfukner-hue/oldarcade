import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function tsLoad(path,deps={}){
 const source=readFileSync(new URL(path,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)((name)=>Object.hasOwn(deps,name)?deps[name]:require(name),module,module.exports);
 return module.exports;
}
const rules=tsLoad('../src/scripts/pixelQuest/rankingMilestones.ts');
test('classifica marcas contra fotografia inicial sem confundir 1º 2º e 3º',()=>{
 const initial={available:true,top:[
  {nickname:'A',score:1000,rank:1},{nickname:'B',score:800,rank:2},{nickname:'C',score:600,rank:3}
 ],mine:null};
 assert.equal(rules.podiumAtStart(500,initial),null);
 assert.equal(rules.podiumAtStart(650,initial),3);
 assert.equal(rules.podiumAtStart(850,initial),2);
 assert.equal(rules.podiumAtStart(1100,initial),1);
 assert.equal(rules.podiumAtStart(1000,initial),2,'empate não garante superação');
 assert.equal(rules.podiumAtStart(1200,null),null,'sem ranking não inventa liderança');
});
test('recorde pessoal: apenas melhor marca sobre próprio recorde conhecido',()=>{
 const board={available:true,top:[{nickname:'Eu',score:880},{nickname:'Outro',score:1200}],mine:{nickname:'Eu',score:880}};
 assert.equal(rules.personalAtStart(880,board,500),false);
 assert.equal(rules.personalAtStart(881,board,500),true);
 assert.equal(rules.personalAtStart(1,{available:true,top:[],mine:null},null),true);
 assert.equal(rules.personalAtStart(500,null,700),false);
 assert.equal(rules.personalAtStart(800,null,700),true);
});
test('celebra pódio inicial, mas informa ultrapassagem na confirmação',()=>{
 assert.match(rules.verifiedRankMessage(1,2),/outro jogador ultrapassou/);
 assert.match(rules.verifiedRankMessage(3,4),/4º/);
 assert.match(rules.verifiedRankMessage(1,1),/confirmada/);
 assert.match(rules.verifiedRankMessage(1,null),/não confirmada/);
});
test('confirma que os dois placares no canvas têm mesma fonte do HUD lateral',()=>{
 const index=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 const render=readFileSync(new URL('../src/scripts/pixelQuest/render.ts',import.meta.url),'utf8');
 assert.match(index,/score.textContent=String\(run.score\)/);
 assert.match(index,/completeScore\(\)-\(phase==='won'\?run.score:0\)/);
 assert.match(render,/FASE '\+run.score.toLocaleString/);
 assert.match(render,/TOTAL '\+\(completedScore\+run.score\).toLocaleString/);
 assert.match(index,/milestones.begin\(/);
 assert.match(index,/milestones.score\(/);
 assert.match(index,/milestones.end\(/);
 assert.match(index,/milestones.confirm\('total'/);
});

test('fotografia de ranking total não se renova após cruzar o portal entre fases',async()=>{
 const history=[],celebrations=[],previous=globalThis.fetch;
 globalThis.fetch=async url=>{
  history.push(String(url));
  return {ok:true,async json(){return {available:true,top:[
   {nickname:'A',score:1000},{nickname:'B',score:800},{nickname:'C',score:600}
  ],mine:null}}};
 };
 try{
  const engine=tsLoad('../src/scripts/pixelQuest/questRunRankings.ts',{'./rankingMilestones':rules});
  const tracker=engine.setupQuestRunRankings(m=>celebrations.push(m),()=>{});
  tracker.begin('1-1',null,null,false,0);
  await new Promise(resolve=>setImmediate(resolve));
  tracker.score(1100,1100);
  assert.ok(celebrations.some(c=>c.scope==='total'&&c.rank===1));
  tracker.end('1-1',1100,1100);
  const generalBefore=history.filter(u=>u.endsWith('/total')).length;
  const count=celebrations.filter(c=>c.scope==='total'&&c.rank===1).length;
  tracker.begin('1-2',null,null,true,1100);
  await new Promise(resolve=>setImmediate(resolve));
  tracker.score(30,1130);
  assert.equal(history.filter(u=>u.endsWith('/total')).length,generalBefore,
    'fase seguinte não consulta nem substitui ranking total da campanha');
  assert.equal(celebrations.filter(c=>c.scope==='total'&&c.rank===1).length,count,
    'não disparar fogos do mesmo recorde ao entrar em outra fase');
  tracker.dispose();
 }finally{globalThis.fetch=previous}
});
