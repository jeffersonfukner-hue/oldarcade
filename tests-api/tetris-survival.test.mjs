import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameMode,validGameScore} from '../src/data/gameModes.js';
import {isTimeRanking,isLowerBetter,betterResult,formatRankingValue} from '../src/data/rankingRules.js';
import {tetrisLevel,tetrisGravityMs} from '../src/data/tetrisRules.js';
import {onRequestGet,onRequestPost} from '../functions/api/games/[game]/leaderboard.js';

test('Sobrevivência permanece modo do Tetris #002 com ranking por maior tempo',()=>{
 const mode=gameMode('tetris-survival');
 assert.equal(mode.title,'tetris');
 assert.equal(mode.url,'/jogos/tetris/sobrevivencia/');
 assert.equal(mode.speedIntervalMs,30000);
 assert.equal(isTimeRanking('tetris-survival'),true);
 assert.equal(isLowerBetter('tetris-survival'),false);
 assert.equal(isLowerBetter('tetris-sprint'),true);
 assert.equal(validGameScore('tetris-survival',0),false);
 assert.equal(validGameScore('tetris-survival',123456),true);
 assert.equal(validGameScore('tetris-survival',123456.5),false);
 assert.equal(formatRankingValue('tetris-survival',123456),'2:03.456');
 assert.equal(betterResult('tetris-survival',123456,100000),true);
 assert.equal(betterResult('tetris-survival',90000,100000),false);
 assert.equal(betterResult('tetris-sprint',90000,100000),true);
});

test('ondas do Sobrevivência aumentam a cada 30 segundos ativos; Clássico e Sprint inalterados',()=>{
 assert.equal(tetrisLevel('tetris-survival',0,0),1);
 assert.equal(tetrisLevel('tetris-survival',12,29999),1);
 assert.equal(tetrisLevel('tetris-survival',0,30000),2);
 assert.equal(tetrisLevel('tetris-survival',0,60000),3);
 assert.equal(tetrisGravityMs('tetris-survival',0,0),900);
 assert.ok(tetrisGravityMs('tetris-survival',0,30000)<900);
 assert.ok(tetrisGravityMs('tetris-survival',0,60000)<tetrisGravityMs('tetris-survival',0,30000));
 assert.equal(tetrisGravityMs('tetris-survival',0,3600000),70);
 assert.equal(tetrisGravityMs('tetris-sprint',20,3600000),900);
 assert.equal(tetrisLevel('tetris-sprint',39,3600000),1);
 assert.equal(tetrisLevel('tetris',9,3600000),1);
 assert.equal(tetrisLevel('tetris',10,0),2);
 assert.equal(tetrisGravityMs('tetris',0,0),900);
});

test('leaderboard usa ordem DESC de maior tempo Sobrevivência e ASC do Sprint, sem tabela própria',async()=>{
 for(const [game,direction] of [['tetris-survival','DESC'],['tetris-sprint','ASC']]){
  const queries=[];
  const db={prepare(sql){queries.push(sql);return {bind(){return this},async all(){
   if(sql.startsWith('PRAGMA'))return {results:[{name:'best_score_milli'}]};
   return {results:[{nickname:'Resistente',score_units:120000000,achieved_at_ms:Date.now(),duration_ms:120000}]};
  }}}};
  const response=await onRequestGet({params:{game},env:{OLDARCADE_STATS_DB:db},request:new Request('https://oldarcade.test/api/games/'+game+'/leaderboard')});
  assert.equal(response.status,200);
  assert.equal((await response.json()).top[0].score,120000);
  assert.match(queries.join('\n'),new RegExp('ORDER BY r\\.best_score_milli '+direction));
 }
});

test('leaderboard rejeita tempo de Sobrevivência inconsistente e tempo zero',async()=>{
 for(const [score,durationMs] of [[0,0],[12345,54321]]){
  const response=await onRequestPost({
   params:{game:'tetris-survival'},env:{OLDARCADE_STATS_DB:{}},
   request:new Request('https://oldarcade.test/api/games/tetris-survival/leaderboard',{
    method:'POST',headers:{Origin:'https://oldarcade.test','Content-Type':'application/json'},
    body:JSON.stringify({score,durationMs})
   })
  });
  assert.equal(response.status,400);
 }
});
