import {test,expect} from '@playwright/test';
import {worldOneLevels,worldOneTotal} from '../src/data/pixelQuest/world-1';
import {forestLayoutAudit} from '../src/data/pixelQuest/forestDesign';
import {validateLevel} from '../src/scripts/pixelQuest/levels';
import {createRun,portalUnlocked} from '../src/scripts/pixelQuest/gameplay';
import {entranceForLevel,stageTitle} from '../src/scripts/pixelQuest/stageIntro';
import {worldOneAtmosphere} from '../src/scripts/pixelQuest/render';
import {createPlayer,stepPlayer,STEP} from '../src/scripts/pixelQuest/physics';

test('Mundo 1 contém 3 fases válidas, final com guardião e progressão conservada',()=>{
 expect(worldOneTotal).toBe(3);
 expect(worldOneLevels.map(l=>l.id)).toEqual(['1-1','1-2','1-3']);
 for(const level of worldOneLevels){
  expect(()=>validateLevel(level)).not.toThrow();
  expect(level.entities.filter(e=>e.kind==='player')).toHaveLength(1);
  expect(level.entities.filter(e=>e.kind==='exit')).toHaveLength(1);
  expect(level.entities.filter(e=>e.kind==='checkpoint')).toHaveLength(1);
 }
 expect(worldOneLevels[0].entities.filter(e=>e.kind==='crystal')).toHaveLength(16);
 expect(worldOneLevels[1].width).toBeGreaterThan(worldOneLevels[0].width);
 expect(worldOneLevels[2].entities.filter(e=>e.kind==='boss')).toHaveLength(1);
 const bossRun=createRun(worldOneLevels[2]);
 expect(bossRun.boss?.hearts).toBe(5);
 expect(portalUnlocked(bossRun,worldOneLevels[2])).toBe(false);
});

test('Identificação X-Y e progresso Y/3 não se confundem; efeitos são determinísticos',()=>{
 expect(stageTitle('1-2',2,3,'Floresta Esmeralda')).toEqual({
  world:'MUNDO 1 · FLORESTA ESMERALDA',progress:'Fase 2/3',code:'1-2'
 });
 expect([0,1,2].map(entranceForLevel)).toEqual(['zoom','horizontal','vertical']);
 expect(worldOneAtmosphere('1-1',0)).not.toEqual(worldOneAtmosphere('1-1',1));
 expect(worldOneAtmosphere('1-2',0)).not.toEqual(worldOneAtmosphere('1-2',1));
 expect(worldOneAtmosphere('1-3',0)).not.toEqual(worldOneAtmosphere('1-3',1));
});

test('Abertura da primeira fase: zoom com 3-2-1 separado e HUD da campanha',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-level-label')).toContainText('Fase 1/3 · 1-1');
 await expect(page.locator('#pq-stage-intro')).toBeHidden();
 await page.locator('#pq-start').click();
 await expect(page.locator('#pq-countdown')).toHaveText('3');
 await expect(page.locator('#pq-overlay')).toHaveAttribute('data-countdown-only','');
 await expect(page.locator('#pq-stage-intro')).toBeVisible({timeout:5200});
 await expect(page.locator('#pq-stage-intro')).toHaveAttribute('data-entrance','zoom');
 await expect(page.locator('#pq-intro-progress')).toHaveText('Fase 1/3');
 await expect(page.locator('#pq-intro-code')).toHaveText('1-1');
 await expect(page.locator('#pq-status')).toContainText('Jogando',{timeout:4000});
 await expect(page.locator('#pq-stage-intro')).toBeHidden();
});

test('Salto duplo: dois pressionamentos separados, sem permitir o terceiro salto no ar',()=>{
 const level=worldOneLevels[1];
 const p=createPlayer(80,15*32-29);
 const input=(jump:boolean)=>({left:false,right:false,jump});
 for(let i=0;i<3;i++)stepPlayer(p,input(false),level,STEP);
 expect(p.grounded).toBe(true);
 stepPlayer(p,input(true),level,STEP);
 expect(p.jumpsUsed).toBe(1);
 const firstVy=p.vy;
 stepPlayer(p,input(false),level,STEP);
 stepPlayer(p,input(true),level,STEP);
 expect(p.jumpsUsed).toBe(2);
 expect(p.vy).toBeLessThan(firstVy+20);
 stepPlayer(p,input(false),level,STEP);
 const beforeThird=p.vy;
 stepPlayer(p,input(true),level,STEP);
 expect(p.jumpsUsed).toBe(2);
 expect(p.vy).toBeGreaterThan(beforeThird);
 for(let i=0;i<140;i++)stepPlayer(p,input(false),level,STEP);
 expect(p.grounded).toBe(true);
 expect(p.jumpsUsed).toBe(0);
});

test('Patrulheiros das três fases não ficam sob tetos de plataforma',()=>{
 for(const level of worldOneLevels){
  const patrols=level.entities.filter(e=>e.kind==='patroller');
  for(const enemy of patrols){
   const col=Math.floor(enemy.x/32),row=Math.floor(enemy.y/32);
   for(let r=row-2;r<row;r++){
    expect(level.tiles[r]?.[col],`teto bloqueando inimigo em ${level.id} col ${col}`).not.toBe(1);
   }
  }
 }
});

test('Nova floresta: três mapas maiores, sem abismos excessivos nem inimigos encobertos',()=>{
 const counts=[{crystals:16,enemies:6},{crystals:19,enemies:9},{crystals:21,enemies:11}];
 const widths=[300,366,425];
 for(const [i,level] of worldOneLevels.entries()){
  expect(level.width).toBe(widths[i]);
  expect(level.entities.filter(e=>e.kind==='crystal')).toHaveLength(counts[i].crystals);
  expect(level.entities.filter(e=>e.kind==='patroller')).toHaveLength(counts[i].enemies);
  expect(forestLayoutAudit(level)).toEqual([]);
 }
});

test('Conta autenticada retoma a fase 2/3 por progresso consultado no servidor',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Jogador Teste'}})
 }));
 const recorded={
  levelId:'1-1',score:920,elapsedMs:45000,crystals:14,enemies:6
 };
 let gets=0;
 await page.route('**/api/quest/progress',r=>{
  if(r.request().method()==='GET'){
   gets++;
   return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,completed:[recorded]})});
  }
  return r.fulfill({status:200,contentType:'application/json',body:'{"saved":true,"completedCount":1}'});
 });
 await page.route('**/api/quest/rankings/*',r=>r.fulfill({
  status:200,contentType:'application/json',body:'{"available":true,"top":[],"mine":null}'
 }));
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-level-label')).toContainText('Fase 2/3 · 1-2');
 await expect(page.locator('#pq-description')).toContainText('Sua conta salvou 1 fase(s)');
 expect(gets).toBeGreaterThanOrEqual(1);
});

test('Visitante não requisita salvamento autenticado no D1',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 const requests:string[]=[];
 await page.route('**/api/quest/progress',r=>{requests.push(r.request().method());return r.fulfill({status:401,body:'{"error":"login necessário"}'})});
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-level-label')).toContainText('Fase 1/3 · 1-1');
 await page.waitForTimeout(300);
 expect(requests).toEqual([]);
});

test('Troca de conta não conserva visualmente a fase salva de outro jogador',async({page})=>{
 let account='Conta A';
 await page.route('**/api/auth/me',r=>r.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:account}})
 }));
 await page.route('**/api/quest/progress',r=>{
  const completed=account==='Conta A'?[{levelId:'1-1',score:720,elapsedMs:34000,crystals:14,enemies:6}]:[];
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,completed})});
 });
 await page.route('**/api/quest/rankings/*',r=>r.fulfill({
  status:200,contentType:'application/json',body:'{"available":true,"top":[],"mine":null}'
 }));
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-level-label')).toContainText('Fase 2/3 · 1-2');
 account='Conta B';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{
  detail:{player:{nickname:'Conta B'}}
 })));
 await expect(page.locator('#pq-level-label')).toContainText('Fase 1/3 · 1-1');
 await expect(page.locator('#pq-description')).toContainText('ainda não tem fases concluídas');
});
