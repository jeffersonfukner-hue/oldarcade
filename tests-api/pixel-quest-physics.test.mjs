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
 const localRequire=(path)=>Object.hasOwn(dependencies,path)?dependencies[path]:require(path);
 new Function('require','module','exports',js)(localRequire,module,module.exports);
 return module.exports;
}
const levels=loadTs('../src/scripts/pixelQuest/levels.ts');
const {firstLevel}=loadTs('../src/data/pixelQuest/level-1-1.ts');
const physics=loadTs('../src/scripts/pixelQuest/physics.ts',{'./levels':levels});
const blank={left:false,right:false,jump:false},right={left:false,right:true,jump:false};
const run=(p,controls,ticks)=>{for(let i=0;i<ticks;i++)physics.stepPlayer(p,controls,firstLevel,physics.STEP)};
test('Fase 1-1 valida dimensões, spawn e saída',()=>{
 assert.doesNotThrow(()=>levels.validateLevel(firstLevel));
 assert.equal(firstLevel.width,300);assert.equal(firstLevel.height,18);
});
test('Jogador pousa no chão, corre e pode saltar novamente',()=>{
 const p=physics.createPlayer(64,451);
 run(p,blank,12);assert.equal(p.grounded,true);
 run(p,right,60);assert.ok(p.x>180&&p.x<250);
 run(p,{left:false,right:false,jump:true},1);
 assert.ok(p.vy<0);assert.equal(p.grounded,false);
 run(p,blank,100);assert.equal(p.grounded,true);
});
test('Abismos realmente permitem queda e plataformas impedem atravessamento lateral',()=>{
 const gap=physics.createPlayer(49*32+10,451);
 run(gap,blank,100);assert.ok(gap.y>500);
 const wall=physics.createPlayer(64,451);
 run(wall,blank,12);run(wall,right,300);
 assert.ok(wall.x>18*32,'plataformas unidirecionais permitem passagem por baixo');
});
test('Câmera respeita limites do mapa',()=>{
 assert.equal(physics.cameraX({x:0},0,firstLevel,640),0);
 assert.equal(physics.cameraX({x:10000},0,firstLevel,640),firstLevel.width*32-640);
});
