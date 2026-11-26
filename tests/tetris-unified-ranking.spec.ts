import {test,expect} from '@playwright/test';
test('Missão troca o ranking único e oculta estatísticas Sprint',async({page})=>{
 await page.route('**/api/tetris/progress',route=>route.fulfill({status:401,body:'{}'}));
 await page.route('**/api/tetris/rankings/*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Jogador',points:200,durationMs:44501,rank:1}],mine:{points:200,durationMs:44501}})}));
 await page.goto('/jogos/tetris/sprint/');
 await expect(page.locator('#tetris-campaign-select')).toHaveValue('c1');
 await expect(page.locator('#tetris-campaign-select > option')).toHaveCount(0);
 await expect(page.locator('#tetris-campaign-select optgroup')).toHaveCount(2);
 await page.locator('#tetris-campaign-select').selectOption('e1');
 await expect(page.locator('[data-mode-ranking]')).toHaveCount(1);
 await expect(page.locator('[data-rank-heading]')).toContainText('Resistência 1L');
 await expect(page.locator('[data-rank-podium]')).toContainText('0:44.501');
 await expect(page.locator('#tetris-mission-best')).toHaveText('200 pts');
 await expect(page.locator('#tetris-legacy-community')).toBeHidden();
 await expect(page.locator('#tetris-legacy-performance')).toBeHidden();
 await expect(page.locator('[data-tetris-rank-view]')).toBeDisabled();
 await expect(page.locator('.oa-activity-strip')).toBeVisible();
 await page.locator('#tetris-campaign-select').selectOption('c1');
 await expect(page.locator('[data-rank-heading]')).toContainText('Corrida das 40');
 await expect(page.locator('.oa-activity-strip')).toBeVisible();
 await expect(page.locator('#tetris-legacy-performance')).toBeHidden();
 await expect(page.locator('#tetris-legacy-community')).toBeHidden();
});

test('Consultar ranking anterior não troca missão jogável nem recorde do HUD',async({page})=>{
 await page.route('**/api/tetris/progress',r=>r.fulfill({status:401,json:{}}));
 await page.route('**/api/tetris/rankings/*',r=>{const c1=r.request().url().endsWith('/c1');return r.fulfill({json:{available:true,top:[{nickname:c1?'Ratz':'Outro',points:c1?5600:200,durationMs:c1?240174:44501,rank:1}],mine:{points:c1?5600:200,durationMs:c1?240174:44501}}});});
 await page.goto('/jogos/tetris/sprint/');
 await page.locator('#tetris-campaign-select').selectOption('e1');
 await expect(page.locator('#tetris-best')).toHaveText('0:44.501');
 await page.locator('[data-tetris-rank-scope]').selectOption('c1');
 await expect(page.locator('[data-rank-heading]')).toContainText('Corrida das 40');
 await expect(page.locator('[data-rank-podium]')).toContainText('Ratz');
 await expect(page.locator('#tetris-campaign-select')).toHaveValue('e1');
 await expect(page.locator('#tetris-best')).toHaveText('0:44.501');
 await page.locator('[data-tetris-rank-scope]').selectOption('follow');
 await expect(page.locator('[data-rank-heading]')).toContainText('Resistência 1L');
});
