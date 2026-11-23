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
const forest=loadTs('../src/data/pixelQuest/forestDesign.ts');
const {firstLevel}=loadTs('../src/data/pixelQuest/level-1-1.ts',{'./forestDesign':forest});
const idle={left:false,right:false,jump:false};
const run=()=>gameplay.createRun(firstLevel);
test('Mapa da fase com entidades válidas',()=>{
 assert.doesNotThrow(()=>levels.validateLevel(firstLevel));
 assert.equal(firstLevel.entities.filter(e=>e.kind==='crystal').length,16);
 assert.equal(firstLevel.entities.filter(e=>e.kind==='patroller').length,6);
});
test('Cristais pontuam uma vez mesmo com quadros repetidos',()=>{
 const game=run();
 game.player.x=firstLevel.entities.find(e=>e.kind==='crystal').x;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
});
test('Colisão com inimigo mantém jogador na área e aplica recuo e invulnerabilidade',()=>{
 const game=run();
 game.player.x=firstLevel.entities.find(e=>e.kind==='patroller').x;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.hearts,2);
 assert.equal(game.player.x,firstLevel.entities.find(e=>e.kind==='patroller').x,'dano lateral não deve teletransportar ao início');
 assert.ok(game.player.vy<0,'colisão lateral causa recuo vertical');
 assert.ok(game.player.vx!==0,'colisão lateral causa recuo horizontal');
 gameplay.receiveDamage(game,firstLevel.entities.find(e=>e.kind==='patroller').x);
 assert.equal(game.hearts,2,'invulnerabilidade evita dano imediato');
});
test('Checkpoint preserva progresso e apenas queda em abismo retorna ao checkpoint',()=>{
 const game=run();
 game.crystals.add(firstLevel.entities.findIndex(e=>e.kind==='crystal'));game.score=10;
 game.player.x=firstLevel.entities.find(e=>e.kind==='checkpoint').x;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.checkpointActive,true);
 game.player.x=2200;game.player.y=610;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.hearts,2);
 assert.equal(game.player.x,firstLevel.entities.find(e=>e.kind==='checkpoint').x);assert.equal(game.player.y,451);
 assert.equal(game.score,10);assert.equal(game.crystals.size,1);
});
test('Terceiro dano encerra partida e não reinicia automaticamente',()=>{
 const game=run();
 for(let n=0;n<3;n++){game.invulnerable=0;gameplay.receiveDamage(game)}
 assert.equal(game.hearts,0);assert.equal(game.phase,'lost');
 gameplay.receiveDamage(game);assert.equal(game.hearts,0);
});
test('Colisão lateral causa dano; salto sobre inimigo concede pontos uma vez',()=>{
 const side=run();
 side.player.x=firstLevel.entities.find(e=>e.kind==='patroller').x;side.player.y=451;side.player.grounded=true;
 gameplay.stepRun(side,firstLevel,idle);
 assert.equal(side.hearts,2);
 const stomp=run();
 stomp.player.x=firstLevel.entities.find(e=>e.kind==='patroller').x;stomp.player.y=429;stomp.player.vy=25;stomp.player.grounded=false;
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.enemies[0].alive,false);
 assert.equal(stomp.score,50);
 assert.equal(stomp.enemies.filter(enemy=>!enemy.alive).length,1);
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.score,50);
});
test('Portal permanece bloqueado antes de coletar todos os cristais',()=>{
 const game=run();
 game.player.x=firstLevel.entities.find(e=>e.kind==='exit').x;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.phase,'playing');assert.equal(game.score,0);
 assert.equal(gameplay.portalUnlocked(game,firstLevel),false);
});
test('Portal encerra uma única vez e não duplica bônus após todos os cristais',()=>{
 const game=run();
 firstLevel.entities.forEach((entity,id)=>{if(entity.kind==='crystal')game.crystals.add(id)});
 assert.equal(gameplay.portalUnlocked(game,firstLevel),true);
 game.player.x=firstLevel.entities.find(e=>e.kind==='exit').x;game.player.y=451;game.player.grounded=true;
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.phase,'won');assert.equal(game.score,100);
 gameplay.stepRun(game,firstLevel,idle);
 assert.equal(game.score,100);
});

test('Pisão só derrota inimigo ao aterrissar de cima; pulo ascendente não mata',()=>{
 const fromBelow=run();
 fromBelow.player.x=firstLevel.entities.find(e=>e.kind==='patroller').x;fromBelow.player.y=475;
 fromBelow.player.vy=-180;
 fromBelow.player.grounded=false;
 gameplay.stepRun(fromBelow,firstLevel,idle);
 assert.equal(fromBelow.enemies[0].alive,true);
 const stomp=run();
 stomp.player.x=firstLevel.entities.find(e=>e.kind==='patroller').x;stomp.player.y=429;stomp.player.vy=80;stomp.player.grounded=false;
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.enemies[0].alive,false);
 assert.ok(stomp.player.vy<0,'pulo sobre inimigo deve impulsionar o personagem');
 assert.equal(stomp.score,50);
 gameplay.stepRun(stomp,firstLevel,idle);
 assert.equal(stomp.score,50,'inimigo vencido não pontua novamente');
 assert.equal(stomp.enemies.filter(enemy=>!enemy.alive).length,1,'inimigo vencido não duplica contagem');
 assert.equal(stomp.enemies.filter(enemy=>enemy.alive).length,12,'inimigos restantes diminuem após o pisão');
});

test('Contadores por nível reiniciam na próxima fase enquanto total permanece acumulado',()=>{
 const first=run();
 first.enemies[0].alive=false;
 first.enemies[1].alive=false;
 assert.equal(gameplay.levelDefeated(first),2);
 assert.equal(gameplay.totalDefeated(first),2);
 const next=gameplay.createRun(firstLevel,gameplay.totalDefeated(first));
 assert.equal(gameplay.levelDefeated(next),0);
 assert.equal(gameplay.totalDefeated(next),2);
 next.enemies[0].alive=false;
 assert.equal(gameplay.levelDefeated(next),1);
 assert.equal(gameplay.totalDefeated(next),3);
 assert.equal(gameplay.createRun(firstLevel).cumulativeBeforeLevel,0,'nova campanha começa em zero');
});
