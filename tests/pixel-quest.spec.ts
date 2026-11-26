import {test,expect} from '@playwright/test';
test('Protótipo Pixel Quest tem fase, controles e contagem regressiva',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#pq-canvas')).toBeVisible();
 await expect(page.locator('section[aria-labelledby="pq-development-history"]')).toContainText('v0.1.0-dev');
 await expect(page.getByRole('heading',{name:/história dos jogos de plataforma/i})).toBeVisible();
 await expect(page.locator('#pq-status')).toContainText('Pronto');
 await expect(page.locator('#pq-defeated')).toHaveText('0');
 await expect(page.locator('#pq-level-defeated')).toHaveText('0');
 await expect(page.locator('#pq-crystals')).toHaveText('0/16');
 await expect(page.locator('#pq-level-enemies')).toHaveText('13/13');
 await expect(page.locator('#pq-crystals-remaining')).toHaveText('16');
 await expect(page.locator('#pq-enemies-active')).toHaveText('13');
 await expect(page.locator('#pq-enemies-remaining')).toHaveCount(0);
 await expect(page.locator('#pq-crystals-remaining-bar')).toHaveAttribute('value','0');
 await expect(page.locator('#pq-enemies-remaining-bar')).toHaveCount(0);
 await expect(page.locator('#pq-campaign-score')).toHaveText('0');
 for(const kind of ['patroller','runner','hopper','sentry']){
  await expect(page.locator('#pq-enemy-'+kind+'-count')).toHaveText('0');
 }
 await expect(page.locator('#pq-best')).not.toHaveText('0');
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
 const widths=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
});

test('Home abre Pixel Quest pelo card, preservando 3 jogos',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-home-game]')).toHaveCount(3);
 const card=page.locator('[data-home-game="pixel-quest"]');
 await expect(card).toBeVisible();
 await card.locator('.home-game-art').click();
 await expect(page).toHaveURL(/\/jogos\/pixel-quest\/$/);
 await expect(page.locator('#pq-canvas')).toBeVisible();
 await expect(page.locator('section[aria-labelledby="pq-development-history"]')).toContainText('v0.1.0-dev');
});
