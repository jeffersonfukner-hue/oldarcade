import {test,expect} from '@playwright/test';
import {worldOneLevels,worldOneTotal} from '../src/data/pixelQuest/world-1';
import {validateLevel} from '../src/scripts/pixelQuest/levels';
import {createRun,portalUnlocked} from '../src/scripts/pixelQuest/gameplay';
import {entranceForLevel,stageTitle} from '../src/scripts/pixelQuest/stageIntro';
import {worldOneAtmosphere} from '../src/scripts/pixelQuest/render';

test('Mundo 1 contém 3 fases válidas, final com guardião e progressão conservada',()=>{
 expect(worldOneTotal).toBe(3);
 expect(worldOneLevels.map(l=>l.id)).toEqual(['1-1','1-2','1-3']);
 for(const level of worldOneLevels){
  expect(()=>validateLevel(level)).not.toThrow();
  expect(level.entities.filter(e=>e.kind==='player')).toHaveLength(1);
  expect(level.entities.filter(e=>e.kind==='exit')).toHaveLength(1);
  expect(level.entities.filter(e=>e.kind==='checkpoint')).toHaveLength(1);
 }
 expect(worldOneLevels[0].entities.filter(e=>e.kind==='crystal')).toHaveLength(6);
 expect(worldOneLevels[1].width).toBeGreaterThan(worldOneLevels[0].width);
 expect(worldOneLevels[2].entities.filter(e=>e.kind==='boss')).toHaveLength(1);
 const bossRun=createRun(worldOneLevels[2]);
 expect(bossRun.boss?.hearts).toBe(3);
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
