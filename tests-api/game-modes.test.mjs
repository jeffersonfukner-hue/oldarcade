import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gameModes,gameModeIds,gameMode,validGameScore} from '../src/data/gameModes.js';

test('catálogo central mantém os três modos Snake isolados e com URLs próprias',()=>{
 assert.deepEqual(new Set(gameModeIds),new Set(['snake','snake-adventure','snake-evolution','tetris','tetris-sprint','tetris-survival','pixel-quest']));
 assert.equal(gameModes.snake.title,gameModes['snake-adventure'].title);
 assert.equal(gameModes.snake.title,gameModes['snake-evolution'].title);
 assert.equal(new Set(gameModeIds.map(id=>gameModes[id].url)).size,gameModeIds.length);
 assert.equal(gameModes.tetris.title,'tetris');
 assert.equal(gameModes.tetris.scoreDecimals,0);
 assert.equal(gameModes['tetris-sprint'].title,'tetris');
 assert.equal(gameModes['tetris-sprint'].ranking,'time');
 assert.equal(gameModes['tetris-survival'].ranking,'survival');
 assert.equal(gameModes['tetris-survival'].title,'tetris');
 assert.equal(validGameScore('tetris-sprint',86400000),true);
 assert.equal(validGameScore('tetris-sprint',86400001),false);
 for(const id of gameModeIds){
  assert.equal(gameMode(id)?.competitive,true);
  assert.ok(gameMode(id).url.startsWith('/jogos/'));
  assert.equal(validGameScore(id,395),true);
  assert.equal(validGameScore(id,395.875),id.startsWith('snake'));

 }
 assert.equal(gameModes['pixel-quest'].competitive,true,'Pixel Quest integra o ranking por fase concluída');
 assert.equal(validGameScore('pixel-quest',999),true,'recorde da fase concluída pode ser submetido por conta autenticada');
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

test('Pixel Quest v2 registra total de campanha também após derrota, sem reclassificar a fase 1-1 legada',()=>{
 const source=readFileSync(new URL('../src/scripts/pixelQuest/index.ts',import.meta.url),'utf8');
 const scoring=readFileSync(new URL('../src/scripts/pixelQuest/campaignLedger.ts',import.meta.url),'utf8');
 const ranking=readFileSync(new URL('../src/scripts/modeRanking.ts',import.meta.url),'utf8');
 assert.match(source,/function finish\(won:boolean\)/,'rotina de encerramento permanece');
 assert.match(source,/if\(won\)\{/,'vitória permanece distinta da derrota');
 assert.match(source,/campaignSnapshot\(results,\{score:run.score,elapsedMs:run.elapsedMs\},false\)/,'derrota preserva o acumulado com pontuação parcial');
 assert.match(source,/stageRanks.record\(/,'cada fase envia um recorde independente');
 assert.equal((source.match(/oldarcade:game-finished/g)||[]).length,2,'vitória e derrota notificam total à página');
 assert.match(ranking,/api\/quest\/rankings\/total/,'página usa classificação total v2');
 assert.match(scoring,/pixel-quest-stage-/,'chaves v2 independentes');
 assert.doesNotMatch(source,/game:'pixel-quest',score:result.score/,'não reaproveitar pontuação somente da 1-1');
});
