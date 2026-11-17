import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gameModes} from '../src/data/gameModes.js';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('todas as modalidades possuem página estática e dados SEO distintos',()=>{
 const urls=new Set();
 for(const [id,mode] of Object.entries(gameModes)){
  assert.equal(urls.has(mode.url),false,'URL duplicada: '+id);
  urls.add(mode.url);
  assert.ok(mode.name&&mode.description&&mode.tagline);
  assert.ok(mode.url.startsWith('/jogos/'));
  const path='src/pages'+mode.url.slice(0,-1)+'.astro';
  const source=file(path);
  if(id==='tetris'||id==='tetris-sprint'){
   const shared=file('src/components/TetrisGame.astro');
   assert.ok(source.includes('TetrisGame'),id+' deve reutilizar o componente único');
   assert.ok(source.includes('modeId="'+id+'"'),id+' deve declarar seu ID');
   assert.ok(shared.includes('GamePage')&&shared.includes('description'),id+' deve reutilizar SEO');
  }else{
   assert.ok(source.includes('GamePage'),id+' deve reutilizar SEO');
   assert.ok(source.includes('modeId="'+id+'"'),id+' deve declarar seu ID');
   assert.ok(source.includes('description'),id+' deve ter descrição real');
  }
 }
});
test('página compartilhada gera metadados e JSON-LD sem esconder conteúdo',()=>{
 const source=file('src/components/GamePage.astro');
 for(const marker of ['mode.url','<slot />','application/ld+json','gameRegistry'])assert.ok(source.includes(marker));
 const home=file('src/pages/index.astro');
 assert.ok(home.includes('Object.keys(gameRegistry).length'));
 assert.ok(home.includes('Object.entries(gameModes)'));
});

test('HUD compartilhado mantém IDs utilizados pelos scripts existentes',()=>{
 const hud=file('src/components/GameHud.astro');
 for(const marker of ['statusId','scoreId','bestId','globalId','levelId','provisionalId'])assert.ok(hud.includes(marker));
 for(const [page,ids] of [
  ['src/pages/jogos/snake.astro',['hud-status','hud-score','hud-best','hud-global-best']],
  ['src/pages/jogos/snake/aventura.astro',['adventure-status','adventure-score','adventure-best','adventure-hud-global']]
 ]){
  const source=file(page);
  assert.ok(source.includes('<GameHud '));
  for(const id of ids)assert.ok(source.includes(id),'ID ausente: '+id);
 }
});

test('histórico de modalidades não cria jogos nem incrementa versões',()=>{
 const registry=file('src/data/gameRegistry.ts');
 assert.ok(registry.includes('milestones: ['));
 assert.ok(registry.includes("mode: 'snake-adventure'"));
 assert.ok(registry.includes("version: '0.2.0-dev'"));
 assert.ok(file('src/pages/jogos/snake.astro').includes('release.milestones.map'));
 assert.ok(file('src/pages/jogos/snake/aventura.astro').includes('gameRegistry.snake.milestones.filter'));
});
