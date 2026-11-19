import {test,expect} from '@playwright/test';

test('Entrar no header abre modal sem trocar rota nem perder posicao',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.route('**/api/auth/login',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"player":{"nickname":"Visitante Teste"}}'}));
 await page.goto('/jogos/snake/');
 const original=page.url();
 await page.locator('[data-auth-entry]').click();
 const modal=page.locator('[data-global-auth]');
 await expect(modal).toBeVisible();
 await expect(page).toHaveURL(original);
 await modal.locator('[data-auth-form="login"] input[name=nickname]').fill('Visitante Teste');
 await modal.locator('[data-auth-form="login"] input[name=password]').fill('12345678');
 await modal.locator('[data-auth-form="login"] button[type=submit]').click();
 await expect(modal).toBeHidden();
 await expect(page).toHaveURL(original);
 await expect(page.locator('[data-player-name]').first()).toHaveText('Visitante Teste');
});

test('Login solicitado dentro da página mantém rolagem e tabuleiro',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.route('**/api/auth/login',route=>route.fulfill({status:200,contentType:'application/json',body:'{"player":{"nickname":"ArcadeFan"}}'}));
 await page.goto('/jogos/snake/');
 const original=page.url();
 // Garantir página rolável independentemente do tamanho do viewport de teste.
 await page.evaluate(()=>{document.body.style.minHeight='200vh'});
 const scroll=await page.evaluate(()=>{window.scrollTo(0,500);return window.scrollY});
 expect(scroll).toBeGreaterThan(0);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:open-auth')));
 const modal=page.locator('[data-global-auth]');
 await expect(modal).toBeVisible();
 await modal.locator('[data-auth-form=login] input[name=nickname]').fill('ArcadeFan');
 await modal.locator('[data-auth-form=login] input[name=password]').fill('12345678');
 await modal.locator('[data-auth-form=login] button[type=submit]').click();
 await expect(modal).toBeHidden();
 await expect(page).toHaveURL(original);
 await expect.poll(async()=>Math.abs((await page.evaluate(()=>window.scrollY))-scroll)).toBeLessThan(5);
});

test.skip('Desafio Diário abre o mesmo modal e atualiza disponibilidade no proprio jogo',async({page})=>{
 let logged=false;
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:logged?{nickname:'Conta Livre'}:null})}));
 await page.route('**/api/auth/login',route=>{logged=true;return route.fulfill({status:200,contentType:'application/json',body:'{"player":{"nickname":"Conta Livre"}}'})});
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({game:'snake',today:'2026-11-17',month:'2026-11',days:[],account:logged?{nickname:'Conta Livre'}:null})}));
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar=snake]');
 await calendar.locator('.daily-day[data-status=today]').click();
 await expect(page.locator('[data-global-auth]')).toBeVisible();
 const modal=page.locator('[data-global-auth]');
 await modal.locator('[data-auth-form=login] input[name=nickname]').fill('Conta Livre');
 await modal.locator('[data-auth-form=login] input[name=password]').fill('12345678');
 await modal.locator('[data-auth-form=login] button[type=submit]').click();
 await expect(modal).toBeHidden();
 await expect(calendar.locator('[data-daily-start]')).toBeVisible();
 await expect(page).toHaveURL(/\/jogos\/snake\/$/);
});

test('Fechar modal preserva o estado da pagina e nao cria sessao',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.goto('/jogos/tetris/');
 await page.locator('[data-auth-entry]').click();
 await page.locator('[data-auth-close]').click();
 await expect(page.locator('[data-global-auth]')).toBeHidden();
 await expect(page.locator('#tetris-canvas')).toBeVisible();
 await expect(page).toHaveURL(/\/jogos\/tetris\/$/);
});
