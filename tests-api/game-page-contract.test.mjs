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
  const path=mode.url==='/'?'src/pages/index.astro':'src/pages'+mode.url.replace(/\\/$/,'')+'.astro';
  const source=file(path);
  assert.ok(source.includes('GamePage'),id+' deve reutilizar SEO');
  assert.ok(source.includes('modeId="'+id+'"'),id+' deve declarar seu ID');
  assert.ok(source.includes('description'),id+' deve ter descrição real');
 }
});
test('página compartilhada gera metadados e JSON-LD sem esconder conteúdo',()=>{
 const source=file('src/components/GamePage.astro');
 for(const marker of ['mode.url','<slot />','application/ld+json','gameRegistry'])assert.ok(source.includes(marker));
 const home=file('src/pages/index.astro');
 assert.ok(home.includes('Object.keys(gameRegistry).length'));
 assert.ok(home.includes('Object.entries(gameModes)'));
});
