import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gameModes,validGameScore} from '../src/data/gameModes.js';
import {isTimeRanking,betterResult,formatRankingValue} from '../src/data/rankingRules.js';
import {onRequestGet,onRequestPost} from '../functions/api/games/[game]/leaderboard.js';

test('Sprint 40 linhas é um modo do Tetris e mantém ranking independente',()=>{
 assert.equal(gameModes['tetris-sprint'].title,'tetris');
 assert.equal(gameModes['tetris-sprint'].targetLines,40);
 assert.equal(isTimeRanking('tetris-sprint'),true);
 assert.equal(isTimeRanking('tetris'),false);
 assert.equal(gameModes['tetris-sprint'].url,'/jogos/tetris/sprint/');
 assert.equal(validGameScore('tetris-sprint',125000),true);
 assert.equal(validGameScore('tetris-sprint',0),false);
 assert.equal(validGameScore('tetris-sprint',125000.5),false);
});

test('ranking por tempo prioriza menor duração, não maior pontuação',()=>{
 assert.equal(betterResult('tetris-sprint',58000,62000),true);
 assert.equal(betterResult('tetris-sprint',62000,58000),false);
 assert.equal(betterResult('tetris',800,600),true);
 assert.equal(betterResult('tetris',600,800),false);
 assert.equal(formatRankingValue('tetris-sprint',61234),'1:01.234');
 assert.equal(formatRankingValue('tetris-sprint',45000),'0:45.000');
 assert.equal(formatRankingValue('tetris-sprint',null),'—');
});

test('API usa ORDER BY ascendente para Sprint e descendente para Clássico, mesma tabela',async()=>{
 for(const [mode,direction] of [['tetris-sprint','ASC'],['tetris','DESC']]){
  const sql=[];
  const db={prepare(query){
   sql.push(query);
   return {
    bind(){return this},
    async all(){
     if(query.startsWith('PRAGMA'))return {results:[{name:'best_score_milli'}]};
     return {results:[{nickname:'Jogador',score_units:45000000,achieved_at_ms:Date.now(),duration_ms:45000}]};
    }
   };
  }};
  const response=await onRequestGet({
   params:{game:mode},env:{OLDARCADE_STATS_DB:db},
   request:new Request('https://oldarcade.test/api/games/'+mode+'/leaderboard')
  });
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.top[0].score,45000);
  assert.match(sql.join('\n'),new RegExp('ORDER BY r\\.best_score_milli '+direction));
 }
});

test('API rejeita Sprint sem tempo positivo consistente com duração informada',async()=>{
 for(const [score,durationMs] of [[12000,13000],[0,0]]){
  const response=await onRequestPost({
   params:{game:'tetris-sprint'},env:{OLDARCADE_STATS_DB:{}},
   request:new Request('https://oldarcade.test/api/games/tetris-sprint/leaderboard',{
    method:'POST',headers:{Origin:'https://oldarcade.test','Content-Type':'application/json'},
    body:JSON.stringify({score,durationMs})
   })
  });
  assert.equal(response.status,400);
 }
});
