import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validGameScore} from '../functions/api/games/[game]/leaderboard.js';

test('contrato global aceita inteiros e até 3 casas decimais em cada modo',()=>{
 for(const game of ['snake','snake-adventure']){
  for(const score of [0,1,7,12.5,125.875,395.75,0.001,3999.999,4000])
   assert.equal(validGameScore(game,score),true,game+' aceita '+score);
  for(const score of [-1,4000.001,0.0001,12.3456,Infinity,NaN,'12.5',null])
   assert.equal(validGameScore(game,score),false,game+' rejeita '+score);
 }
 assert.equal(validGameScore('pong',100),false);
});

test('0006 migra recordes inteiros para milésimos sem perder chaves, data ou índice',()=>{
 const migration=readFileSync(new URL('../migrations/0006_decimal_scores.sql',import.meta.url),'utf8');
 assert.match(migration,/best_score_milli INTEGER NOT NULL/);
 assert.match(migration,/best_score \* 1000/);
 assert.match(migration,/INSERT INTO player_game_records_decimal[\s\S]*FROM player_game_records/);
 assert.match(migration,/PRIMARY KEY\(game,player_id\)/);
 assert.match(migration,/REFERENCES player_accounts\(id\)/);
 assert.match(migration,/CREATE INDEX idx_player_game_records_ranking/);
 assert.doesNotMatch(migration,/best_score_milli\s*%/);
});
