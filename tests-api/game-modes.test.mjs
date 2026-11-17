import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gameModes,gameModeIds,gameMode,validGameScore} from '../src/data/gameModes.js';

test('catálogo central mantém os três modos Snake isolados e com URLs próprias',()=>{
 assert.deepEqual(new Set(gameModeIds),new Set(['snake','snake-adventure','snake-evolution','tetris']));
 assert.equal(gameModes.snake.title,gameModes['snake-adventure'].title);
 assert.equal(gameModes.snake.title,gameModes['snake-evolution'].title);
 assert.equal(new Set(gameModeIds.map(id=>gameModes[id].url)).size,gameModeIds.length);
 assert.equal(gameModes.tetris.title,'tetris');
 assert.equal(gameModes.tetris.scoreDecimals,0);
 for(const id of gameModeIds){
  assert.equal(gameMode(id)?.competitive,true);
  assert.ok(gameMode(id).url.startsWith('/jogos/'));
  assert.equal(validGameScore(id,395),true);
  assert.equal(validGameScore(id,395.875),id!=='tetris');
 }
 assert.equal(gameMode('__proto__'),null);
 assert.equal(gameMode('unknown'),null);
});

test('ranking e contadores consultam o mesmo catálogo, sem allowlists divergentes',()=>{
 const leaderboard=readFileSync(new URL('../functions/api/games/[game]/leaderboard.js',import.meta.url),'utf8');
 const stats=readFileSync(new URL('../functions/api/games/[game]/stats.js',import.meta.url),'utf8');
 const page=readFileSync(new URL('../src/pages/rankings.astro',import.meta.url),'utf8');
 assert.ok(leaderboard.includes('competitiveGame('));
 assert.ok(stats.includes('gameMode('));
 assert.ok(page.includes('Object.entries(gameModes)'));
});
