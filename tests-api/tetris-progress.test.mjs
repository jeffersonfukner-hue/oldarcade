import test from 'node:test';import assert from 'node:assert/strict';
import {validTetrisResult} from '../src/data/tetrisRanking.js';
import {onRequestGet} from '../functions/api/tetris/progress.js';
test('resistência não aceita eliminações de outros tipos',()=>{assert.equal(validTetrisResult('e4',{points:900,durationMs:1000,counts:[1,0,0,1]}),false);assert.equal(validTetrisResult('e4',{points:800,durationMs:1000,counts:[0,0,0,1]}),true);});
test('progresso sem banco não inventa dados',async()=>{const r=await onRequestGet({env:{},request:new Request('https://example.com')});assert.equal(r.status,503);});
test('progresso exige conta',async()=>{const r=await onRequestGet({env:{OLDARCADE_STATS_DB:{}},request:new Request('https://example.com')});assert.equal(r.status,401);});
