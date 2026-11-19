import {test,expect} from '@playwright/test';
test('Protótipo Pixel Quest tem fase, controles e contagem regressiva',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-canvas')).toBeVisible();
 await expect(page.locator('#pq-status')).toContainText('Pronto');
 await page.locator('#pq-start').click();
 await expect(page.locator('#pq-countdown')).toHaveText('3');
 await expect(page.locator('#pq-status')).toContainText('Jogando',{timeout:6000});
 await page.keyboard.down('ArrowRight');
 await page.waitForTimeout(250);
 await page.keyboard.up('ArrowRight');
 await page.locator('#pq-pause').click();
 await expect(page.locator('#pq-status')).toContainText('Pausado');
 await page.locator('#pq-start').click();
 await expect(page.locator('#pq-countdown')).toHaveText('3');
});
test('Controles móveis não fazem a página ultrapassar largura',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/jogos/pixel-quest/');
 await expect(page.getByRole('button',{name:'Saltar'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
