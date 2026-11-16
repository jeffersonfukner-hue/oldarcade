import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validGameScore} from '../functions/api/games/[game]/leaderboard.js';
test('Aventura aceita pontos reais de maçã, ouro, gelo e velocidade',()=>{
 for(const score of [0,10,15,20,35,50,75,350,360,375,4000])assert.equal(validGameScore('snake-adventure',score),true,'Aventura '+score);
 for(const score of [-5,1,12,376,4005,Infinity,NaN,375.5,'375'])assert.equal(validGameScore('snake-adventure',score),false,'Aventura rejeita '+score);
});
test('Clássico continua exigindo múltiplos de dez',()=>{
 for(const score of [0,10,30,350,360,4000])assert.equal(validGameScore('snake',score),true);
 for(const score of [-10,5,15,375,4001,Infinity,NaN])assert.equal(validGameScore('snake',score),false);
 assert.equal(validGameScore('pong',100),false);
});

test('migração D1 preserva recordes e permite múltiplos de 5',()=>{
 const old=readFileSync(new URL('../migrations/0004_player_records.sql',import.meta.url),'utf8');
 const next=readFileSync(new URL('../migrations/0005_adventure_score_step.sql',import.meta.url),'utf8');
 assert.match(old,/best_score % 10\s*=\s*0/);
 assert.match(next,/best_score % 5\s*=\s*0/);
 assert.match(next,/INSERT INTO player_game_records_v2[\s\S]*FROM player_game_records/);
 assert.match(next,/PRIMARY KEY\(game,player_id\)/);
 assert.match(next,/REFERENCES player_accounts\(id\)/);
 assert.match(next,/CREATE INDEX idx_player_game_records_ranking/);
});
