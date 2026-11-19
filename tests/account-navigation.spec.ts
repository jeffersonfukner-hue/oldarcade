import {test,expect} from '@playwright/test';

test('Voltar ao Sprint consulta sessão atual e não restaura usuário anterior',async({page})=>{
 let nickname='Conta A';
 let checks=0;
 await page.route('**/api/auth/me',async route=>{
  checks++;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname}})});
 });
 await page.route('**/api/games/tetris-sprint/leaderboard',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({available:true,top:[],mine:nickname==='Conta A'?{nickname:'Conta A',score:95000,rank:1}:{nickname:'Conta B',score:76000,rank:1}})
 }));
 await page.goto('/jogos/tetris/sprint/');
 await expect(page.locator('[data-player-name]')).toHaveText('Conta A');
 await expect(page.locator('[data-rank-personal]')).toHaveText('1:35.000');
 await page.goto('/conta/');
 nickname='Conta B';
 // Simula o retorno ao histórico com BFCache, que não executa scripts de novo.
 await page.goBack();
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await expect(page.locator('[data-player-name]')).toHaveText('Conta B');
 await expect(page.locator('[data-rank-auth-button]')).toHaveText('Conectado como Conta B');
 await expect(page.locator('[data-rank-personal]')).toHaveText('1:16.000');
 await expect(page.locator('#tetris-best')).toHaveText('1:16.000');
 expect(checks).toBeGreaterThanOrEqual(2);
});

test('Voltar à página de conta não exibe a sessão anterior após logout',async({page})=>{
 let player:{nickname:string}|null={nickname:'Conta A'};
 await page.route('**/api/auth/me',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({player})
 }));
 await page.route('**/api/games/*/leaderboard',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})
 }));
 await page.goto('/conta/');
 await expect(page.locator('#account-name')).toHaveText('Conta A');
 await page.goto('/jogos/tetris/sprint/');
 player=null;
 await page.goBack();
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await expect(page.locator('[data-player-name]')).toHaveText('Minha conta');
 await expect(page.locator('#account-forms')).toBeVisible();
 await expect(page.locator('#account-state')).toBeHidden();
});
