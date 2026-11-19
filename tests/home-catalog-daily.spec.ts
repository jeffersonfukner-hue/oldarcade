import {test,expect} from '@playwright/test';

test('Home mostra somente um card por jogo e seus tres modos',async({page})=>{
 await page.route('**/api/daily/**',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"Indisponível"}'}));
 await page.goto('/');
 await expect(page.locator('.home-game-card')).toHaveCount(3);
 const snake=page.locator('[data-home-game="snake"]');
 const tetris=page.locator('[data-home-game="tetris"]');
 const pixelQuest=page.locator('[data-home-game="pixel-quest"]');
 await expect(snake.locator('nav a')).toHaveCount(3);
 await expect(tetris.locator('nav a')).toHaveCount(3);
 await expect(pixelQuest.locator('nav a')).toHaveCount(1);
 await expect(pixelQuest.locator('.home-game-art')).toHaveAttribute('href','/jogos/pixel-quest/');
 await expect(snake.locator('img')).toHaveAttribute('src','/images/snake-arcade.svg');
 await expect(tetris.locator('img')).toHaveAttribute('src','/images/tetris-arcade.svg');
 await expect(page.locator('.oldarcade-brand-mark')).toHaveAttribute('src','/images/oldarcade-mark.svg');
 await expect(page.locator('[data-home-daily]')).toBeHidden();
});

test.skip('Visitante ve um desafio e pode conhecer o convite sem login',async({page})=>{
 await page.route('**/api/daily/*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  today:'2026-11-17',days:[],account:null
 })}));
 await page.goto('/');
 const spot=page.locator('[data-home-daily]');
 await expect(spot).toBeVisible();
 await expect(spot.getByText(/Crie uma conta para guardar seu histórico/)).toBeVisible();
 await expect(spot.locator('a')).toHaveAttribute('href',/\/jogos\/(snake|tetris)\/#daily-title-/);
 await expect(page.locator('[data-home-daily]')).toHaveCount(1);
});

test.skip('Conta ve somente jogo ainda nao iniciado, mesmo que outro desafio ja tenha sido reservado',async({page})=>{
 await page.route('**/api/daily/snake',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  today:'2026-11-17',days:[{date:'2026-11-17',status:'started'}],account:{nickname:'Jogadora A'}
 })}));
 await page.route('**/api/daily/tetris',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  today:'2026-11-17',days:[],account:{nickname:'Jogadora A'}
 })}));
 await page.goto('/');
 const spot=page.locator('[data-home-daily]');
 await expect(spot).toBeVisible();
 await expect(spot.locator('[data-home-daily-name]')).toHaveText('Tetris');
 await expect(spot.locator('a')).toHaveAttribute('href','/jogos/tetris/#daily-title-tetris');
});

test.skip('Conta que usou os dois desafios nao ve destaque repetido naquele dia',async({page})=>{
 await page.route('**/api/daily/*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  today:'2026-11-17',days:[{date:'2026-11-17',status:'finished'}],account:{nickname:'Jogadora A'}
 })}));
 await page.goto('/');
 await expect(page.locator('[data-home-daily]')).toBeHidden();
});
