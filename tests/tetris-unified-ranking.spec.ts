import {test,expect} from '@playwright/test';
test('Missão troca o ranking único e oculta estatísticas Sprint',async({page})=>{
 await page.route('**/api/tetris/progress',route=>route.fulfill({status:401,body:'{}'}));
 await page.route('**/api/tetris/rankings/*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Jogador',points:200,durationMs:44501,rank:1}],mine:{points:200,durationMs:44501}})}));
 await page.goto('/jogos/tetris/sprint/');
 await page.locator('#tetris-campaign-select').selectOption('e1');
 await expect(page.locator('[data-mode-ranking]')).toHaveCount(1);
 await expect(page.locator('[data-rank-heading]')).toContainText('Resistência 1L');
 await expect(page.locator('[data-rank-podium]')).toContainText('0:44.501');
 await expect(page.locator('#tetris-mission-best')).toHaveText('200 pts');
 await expect(page.locator('#tetris-legacy-community')).toBeHidden();
 await expect(page.locator('#tetris-legacy-performance')).toBeHidden();
 await expect(page.locator('[data-tetris-rank-view]')).toBeDisabled();
});
