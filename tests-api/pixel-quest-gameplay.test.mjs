import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function loadTs(relativePath,dependencies={}){
 const source=readFileSync(new URL(relativePath,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 new Function('require','module','exports',js)((path)=>Object.hasOwn(dependencies,path)?dependencies[path]:require(path),module,module.exports);
 return module.exports;
}
const levels=loadTs('../src/scripts/pixelQuest/levels.ts');
const physics=loadTs('../src/scripts/pixelQuest/physics.ts',{'./levels':levels});
const gameplay=loadTs('../src/scripts/pixelQuest/gameplay.ts',{'./physics':physics});
const {firstLevel}=loadTs('../src/data/pixelQuest/level-1-1.ts');
const idle={left:false,right:false,jump:false};
const run=()=>gameplay.createRun(firstLevel);
test('Mapa da fase com entidades válidas',()=>{
 assert.doesNotThrow(()=>levels.validateLevel(firstLevel));
 assert.equal(firstLevel.entities.filter(e=>e.kind==='crystal').length,6);
 assert.equal(firstLevel.entities.filter(e=>e.kind==='patroller').length,3);
});
test('Cristais pontuam uma vez mesmo com quadros repetidos',()=>{
 const game=run();
 game.player.x=160;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
});
test('Checkpoint mantém progresso e respawn não duplica cristais',()=>{
 const game=run();
 game.crystals.add(firstLevel.entities.findIndex(e=>e.kind==='crystal'));game.score=10;
 game.player.x=1800;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.checkpointActive,true);
 gameplay.receiveDamage(game);
 assert.equal(game.hearts,2);assert.equal(game.player.x,1800);assert.equal(game.player.y,451);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
 gameplay.receiveDamage(game);
 assert.equal(game.hearts,2,'invulnerabilidade impede dano imediato repetido');
});
test('Terceiro dano encerra partida e não reinicia automaticamente',()=>{
 const game=run();
 for(let n=0;n<3;n++){game.invulnerable=0;gameplay.receiveDamage(game)}
 assert.equal(game.hearts,0);assert.equal(game.phase,'lost');
 gameplay.receiveDamage(game);assert.equal(game.hearts,0);
});
test('Colisão lateral causa dano; salto sobre inimigo concede pontos uma vez',()=>{
 const side=run();
 side.player.x=790;side.player.y=451;side.player.grounded=true;
 gameplay.stepRun(side,firstLevel,idle);
 assert.equal(side.hearts,2);
 const stomp=run();
 stomp.player.x=790;stomp.player.y=429;stomp.player.vy=25;stomp.player.grounded=false;
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.enemies[0].alive,false);
 assert.equal(stomp.score,50);
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.score,50);
});
test('Portal encerra uma única vez e não duplica bônus',()=>{
 const game=run();
 game.player.x=2944;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.phase,'won');assert.equal(game.score,100);
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,100);
});
