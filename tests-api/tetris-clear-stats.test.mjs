import test from 'node:test';
import assert from 'node:assert/strict';
import {createTetrisClearStats,registerTetrisClear} from '../src/data/tetrisClearStats.js';
test('multiplicadores e contagem de eliminações simultâneas',()=>{
 const stats=createTetrisClearStats();
 assert.deepEqual([1,2,3,4].map(n=>registerTetrisClear(stats,n)),[100,200,400,800]);
 assert.deepEqual(stats,{counts:[0,1,1,1,1],lines:10,points:1500});
 registerTetrisClear(stats,4);
 assert.equal(stats.points,2300);assert.equal(stats.lines,14);assert.equal(stats.counts[4],2);
});
test('entradas inválidas e reinício independente',()=>{
 const stats=createTetrisClearStats();
 for(const n of [0,5,-1,1.5,NaN])assert.equal(registerTetrisClear(stats,n),0);
 assert.deepEqual(stats,createTetrisClearStats());
 registerTetrisClear(stats,1);assert.equal(createTetrisClearStats().points,0);
});
