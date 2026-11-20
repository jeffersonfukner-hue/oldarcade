import test from 'node:test';
import assert from 'node:assert/strict';
import {improvementOperator,betterResult,isLowerBetter,isTimeRanking} from '../src/data/rankingRules.js';

test('Sprint: menor tempo substitui; maior não',()=>{
 assert.equal(isTimeRanking('tetris-sprint'),true);
 assert.equal(isLowerBetter('tetris-sprint'),true);
 assert.equal(improvementOperator('tetris-sprint'),'<');
 assert.equal(betterResult('tetris-sprint',45000,60000),true);
 assert.equal(betterResult('tetris-sprint',65000,60000),false);
});
test('Sobrevivência: MAIOR tempo substitui; menor não',()=>{
 assert.equal(isTimeRanking('tetris-survival'),true);
 assert.equal(isLowerBetter('tetris-survival'),false);
 assert.equal(improvementOperator('tetris-survival'),'>');
 assert.equal(betterResult('tetris-survival',90000,60000),true);
 assert.equal(betterResult('tetris-survival',45000,60000),false);
});
test('Snake e Tetris Clássico: maior pontuação substitui',()=>{
 for(const id of ['snake','snake-adventure','snake-evolution','tetris']){
  assert.equal(improvementOperator(id),'>');
  assert.equal(betterResult(id,120,100),true);
  assert.equal(betterResult(id,80,100),false);
 }
});

import {competitiveGame,validGameScore} from '../src/data/gameModes.js';
test('Pixel Quest aceita recordes da fase concluída como ranking por pontos',()=>{
 assert.equal(competitiveGame('pixel-quest'),true);
 assert.equal(validGameScore('pixel-quest',960),true);
 assert.equal(validGameScore('pixel-quest',100001),false);
 assert.equal(validGameScore('pixel-quest',-1),false);
 assert.equal(validGameScore('pixel-quest',1.5),false);
 assert.equal(improvementOperator('pixel-quest'),'>');
});
