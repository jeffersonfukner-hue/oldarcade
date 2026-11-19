import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyMission} from '../src/data/dailyChallenges.js';
import {initialMissionState,advanceDailyMission,replayDailyMission} from '../src/data/dailyMissionEngine.js';

const mission=(sequence,extra={})=>({
 version:3,kind:'doubles',metric:'sequence',sequence,target:sequence.length,
 timeLimitMs:null,...extra
});
const clear=(count,step,elapsed=step*1000)=>({
 type:'clear',count,score:step*300,linesCleared:step*count,durationMs:elapsed
});
const run=(goal,counts)=>replayDailyMission(goal,counts.map((count,i)=>({
 type:'clear',count,score:(i+1)*500,
 linesCleared:counts.slice(0,i+1).reduce((a,b)=>a+b,0),
 durationMs:(i+1)*1000
})));

test('duplas perfeitas: primeira, segunda, terceira e quarta tentativa corretas',()=>{
 const goal=mission([2,2,2,2]);
 assert.equal(run(goal,[2]).status,'playing');
 assert.equal(run(goal,[2,2]).status,'playing');
 assert.equal(run(goal,[2,2,2]).status,'playing');
 const win=run(goal,[2,2,2,2]);
 assert.equal(win.status,'won');
 assert.equal(win.clearSequence.length,4);
 for(const n of [1,3,4]){
  const fail=run(goal,[2,n]);
  assert.equal(fail.status,'lost','qualquer limpeza diferente de 2 causa derrota');
  assert.equal(fail.reason,'wrong-clear');
  assert.equal(run(goal,[n]).status,'lost','primeira limpeza errada encerra');
 }
});
test('primeira limpeza de 1 linha perde mesmo sem progresso anterior',()=>{
 const goal=mission([2,2,2,2]);
 const first=advanceDailyMission(goal,initialMissionState(),{
  type:'clear',count:1,score:100,linesCleared:1,durationMs:1000
 });
 assert.equal(first.status,'lost');
 assert.equal(first.clearSequence.length,1);
 assert.equal(first.reason,'wrong-clear');
});
test('derrota/vitória terminais: impossível ressuscitar com eventos adicionais',()=>{
 const goal=mission([2,2,2,2]);
 const lost=run(goal,[1]);
 const won=run(goal,[2,2,2,2]);
 for(const status of [lost,won]){
  const replay=advanceDailyMission(goal,status,{
   type:'clear',count:2,score:99999,linesCleared:100,durationMs:999999
  });
  assert.strictEqual(replay,status);
 }
 assert.equal(run(goal,[1,2,2,2,2]).status,'lost');
 assert.equal(run(goal,[2,2,2,2,1]).status,'won');
 assert.equal(run(goal,[2,2,2,2,2]).clearSequence.length,4);
});
test('sequência variável valida cada passo, não somente o total de linhas',()=>{
 const goal=mission([1,4,3,3,2],{kind:'sequence'});
 assert.equal(run(goal,[1,4,3,3,2]).status,'won');
 assert.equal(run(goal,[1,4,2,3,3]).status,'lost');
 assert.equal(run(goal,[4,1,3,3,2]).status,'lost');
 assert.equal(run(goal,[1,4,3,3]).status,'playing');
});
test('Tetris de quatro linhas não pode ganhar por pontuação ao limpar 1/2/3',()=>{
 const goal={kind:'quads',metric:'quadscore',target:1600,timeLimitMs:null};
 for(const bad of [1,2,3]){
  const x=run(goal,[4,bad]);
  assert.equal(x.status,'lost');
 }
 assert.equal(run(goal,[4]).status,'playing');
 assert.equal(run(goal,[4,4]).status,'playing'); // pontos simulados: 1000
 const high=replayDailyMission(goal,[{type:'clear',count:4,score:1700,linesCleared:4,durationMs:9000}]);
 assert.equal(high.status,'won');
});
test('tempo: vitória só antes do limite e derrota não pode virar vitória após expirar',()=>{
 const goal=mission([2,2],{kind:'timed-sequence',timeLimitMs:10000});
 assert.equal(run(goal,[2,2]).status,'won');
 const expired=replayDailyMission(goal,[
  {type:'tick',durationMs:10001,score:0,linesCleared:0},
  {type:'clear',count:2,durationMs:10002,score:500,linesCleared:2}
 ]);
 assert.equal(expired.status,'lost');
 assert.equal(expired.reason,'timeout');
 assert.equal(expired.clearSequence.length,0);
});
test('1000 dias: toda sequência Tetris de v3 tem final correto e erro imediato',()=>{
 const start=Date.parse('2026-11-20T12:00:00Z');
 let checked=0;
 for(let day=0;day<1000;day++){
  const date=new Date(start+day*86400000).toISOString().slice(0,10);
  const goal=dailyMission('tetris',date);
  if(goal.metric==='sequence'){
   checked++;
   assert.equal(run(goal,goal.sequence).status,'won',date+' sequência completa');
   for(let i=0;i<goal.sequence.length;i++){
    const wrong=[1,2,3,4].find(x=>x!==goal.sequence[i]);
    assert.equal(run(goal,[...goal.sequence.slice(0,i),wrong]).status,'lost',date+' erro no passo '+i);
   }
  }
 }
 assert.ok(checked>500,'todas as famílias de sequência estão cobertas');
});
test('propriedade: 500 trilhas aleatórias não ultrapassam meta nem reabrem estado terminal',()=>{
 const random=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
 const rng=random(7312026),goal=mission([2,2,2,2]);
 for(let runId=0;runId<500;runId++){
  let state=initialMissionState();
  let terminal=null;
  for(let step=1;step<=20;step++){
   const count=1+Math.floor(rng()*4);
   const next=advanceDailyMission(goal,state,{type:'clear',count,
    score:step*100,linesCleared:step*count,durationMs:step*1000});
   if(terminal)assert.strictEqual(next,state,'estado terminal deve ser imutável');
   state=next;
   assert.ok(state.clearSequence.length<=4,'nunca registrar 5/4 etapas');
   if(state.status!=='playing')terminal=state.status;
  }
  assert.equal(state.status,'won'===terminal?'won':'lost');
 }
});

test('game over jamais aprova missão por pontuação armazenada',()=>{
 const goal={version:3,kind:'obstacles',metric:'score',target:50,timeLimitMs:null};
 const result=replayDailyMission(goal,[{type:'end',score:999,linesCleared:0,durationMs:1000}]);
 assert.equal(result.status,'lost');
 assert.equal(result.reason,'game-over');
 assert.strictEqual(advanceDailyMission(goal,result,{type:'tick',score:1000,linesCleared:0,durationMs:2000}),result);
});
test('Snake: fruta, obstáculos, sobrevivência e limite de tempo',()=>{
 const scoreGoal={version:3,kind:'gauntlet',metric:'score',target:50,timeLimitMs:30000};
 const tick=(score,durationMs)=>({type:'tick',score,durationMs,linesCleared:0});
 assert.equal(replayDailyMission(scoreGoal,[tick(20,10000),tick(50,25000)]).status,'won');
 assert.equal(replayDailyMission(scoreGoal,[tick(20,31000),tick(50,32000)]).status,'lost');
 const survive={version:3,kind:'survival',metric:'duration',target:20000,timeLimitMs:20000};
 assert.equal(replayDailyMission(survive,[tick(0,10000),tick(0,20000)]).status,'won');
 assert.equal(replayDailyMission(survive,[tick(0,8000),{type:'end',score:0,linesCleared:0,durationMs:9000}]).status,'lost');
});
