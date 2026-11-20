import {test,expect} from '@playwright/test';
test('Minha Conta apresenta dashboard estatístico uniforme e configurações separadas',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,player:{id:'abc',nickname:'ArcadeFan'}})}));
 await page.route('**/api/account/preferences',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({email:'',emailVerified:false,recordEmailOptIn:false,dailyEmailOptIn:false,deliveryAvailable:false})}));
 await page.route('**/api/daily/profile',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({account:'ArcadeFan',results:[]})}));
 await page.route('**/api/games/*/leaderboard',route=>{
  const url=route.request().url(),game=url.split('/games/')[1]?.split('/')[0];
  const mine=game==='snake'?{score:150,rank:2}:game==='tetris'?{score:1000,rank:1}:null;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,mine,top:[]})});
 });
 await page.goto('/conta/');
 await expect(page.locator('#account-name')).toHaveText('ArcadeFan');
 await expect(page.locator('#account-stat-modes')).toHaveText('2');
 await expect(page.locator('#account-stat-leads')).toHaveText('1');
 await expect(page.locator('#account-stat-podium')).toHaveText('2');
 await expect(page.locator('.account-game-card')).toHaveCount(3);
 await expect(page.locator('[data-account-record]')).toHaveCount(6);
 await expect(page.locator('#account-preferences')).toBeVisible();
 await expect(page.locator('#account-records')).toBeVisible();
 await expect(page.locator('#account-records .account-game-heading')).toHaveCount(3);
 const count=await page.locator('.account-game-card').evaluateAll(cards=>new Set(cards.map(card=>getComputedStyle(card).borderRadius)).size);
 expect(count).toBe(1);
});
test('Dashboard mantém largura contida e métricas visíveis em celular',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:'{"available":true,"player":{"id":"abc","nickname":"ArcadeFan"}}'}));
 await page.route('**/api/account/preferences',route=>route.fulfill({status:200,contentType:'application/json',body:'{"email":null,"recordEmailOptIn":false,"dailyEmailOptIn":false}'}));
 await page.route('**/api/daily/profile',route=>route.fulfill({status:200,contentType:'application/json',body:'{"results":[]}'}));
 await page.route('**/api/games/*/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:'{"available":true,"mine":null,"top":[]}'}));
 await page.goto('/conta/');
 await expect(page.locator('.account-kpi-grid')).toBeVisible();
 await expect(page.locator('.account-game-card').first()).toBeVisible();
 await expect(page.locator('#account-stat-modes')).toHaveText('0');
 const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:window.innerWidth}));
 expect(width.scroll).toBeLessThanOrEqual(width.view+1);
});
