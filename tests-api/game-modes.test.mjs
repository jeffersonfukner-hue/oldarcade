import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gameModes,gameModeIds,gameMode,validGameScore} from '../src/data/gameModes.js';

test('catálogo central mantém Snake Clássico e Aventura isolados e com URLs próprias',()=>{
 assert.deepEqual(gameModeIds,['snake','snake-adventure']);
 assert.equal(gameModes.snake.title,gameModes['snake-adventure'].title);
 assert.notEqual(gameModes.snake.url,gameModes['snake-adventure'].url);
 for(const id of gameModeIds){
  assert.equal(gameMode(id)?.competitive,true);
  assert.ok(gameMode(id).url.startsWith('/jogos/'));
  assert.equal(validGameScore(id,395.875),true);
 }
 assert.equal(gameMode('__proto__'),null);
 assert.equal(gameMode('unknown'),null);
});

test('ranking e contadores consultam o mesmo catálogo, sem allowlists divergentes',()=>{
 const leaderboard=readFileSync(new URL('../functions/api/games/[game]/leaderboard.js',import.meta.url),'utf8');
 const stats=readFileSync(new URL('../functions/api/games/[game]/stats.js',import.meta.url),'utf8');
 const page=readFileSync(new URL('../src/pages/rankings.astro',import.meta.url),'utf8');
 assert.match(leaderboard,/competitiveGame\\(/);
 assert.match(stats,/gameMode\\(/);
 assert.match(page,/Object\\.entries\\(gameModes\\)/);
});
