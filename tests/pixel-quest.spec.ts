import {test,expect} from '@playwright/test';
test('Protótipo Pixel Quest tem fase, controles e contagem regressiva',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-canvas')).toBeVisible();
 await expect(page.locator('#pq-status')).toContainText('Pronto');
 await expect(page.locator('#pq-defeated')).toHaveText('0');
 await expect(page.locator('#pq-level-enemies')).toHaveText('3/3');
 await expect(page.locator('#pq-portal-status')).toContainText('Portal bloqueado');
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
test('Controles touch aparecem em dispositivos touch sem overflow',async({page,isMobile})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/jogos/pixel-quest/');
 const jump=page.getByRole('button',{name:'Saltar',includeHidden:true});
 await expect(jump).toHaveCount(1);
 if(isMobile)await expect(jump).toBeVisible();
 else await expect(jump).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
