import {test,expect} from '@playwright/test';

test('Sprint usa motor compartilhado, 40 linhas e classificação por menor tempo',async({page})=>{
 await page.route('**/api/games/tetris-sprint/leaderboard',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({available:true,top:[{nickname:'Velocista',score:62540,rank:1,achievedAt:'2026-11-17T20:00:00Z'}],mine:null})
 }));
 await page.goto('/jogos/tetris/sprint/');
 await expect(page).toHaveTitle(/Tetris Sprint/);
 await expect(page.getByRole('heading',{level:1})).toContainText('40 linhas');
 await expect(page.locator('#tetris-stage')).toHaveAttribute('data-game-mode','tetris-sprint');
 await expect(page.locator('#tetris-stage')).toHaveAttribute('data-board-shape','portrait');
 await expect(page.locator('#tetris-lines')).toHaveText('0/40');
 await expect(page.locator('#tetris-score')).toHaveText('0/40');
 await expect(page.locator('#tetris-local-best')).toHaveText('—');
 await expect(page.locator('#tetris-global')).toHaveText('1:02.540');
 await expect(page.locator('[data-rank-global]')).toHaveText('1:02.540');
 await expect(page.locator('[data-mode-ranking]')).toHaveAttribute('data-game','tetris-sprint');
 await expect(page.locator('#tetris-screen canvas')).toHaveAttribute('width','300');
 await expect(page.getByRole('link',{name:'Clássico'})).toHaveAttribute('href','/jogos/tetris/');
 await expect(page.locator('[data-game-share]')).toHaveAttribute('data-game-path','/jogos/tetris/sprint/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 await expect(page.locator('#tetris-start')).toBeHidden();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 await expect(page.locator('#tetris-score')).toHaveText('0/40');
 await page.keyboard.press('Space');
 await expect(page.locator('#tetris-score')).toHaveText('0/40');
 await page.getByRole('button',{name:'Pausar'}).click();
 await expect(page.locator('#tetris-overlay-title')).toHaveText('Jogo pausado');
 const clock=await page.locator('[data-game-clock]').textContent();
 await page.waitForTimeout(350);
 await expect(page.locator('[data-game-clock]')).toHaveText(clock!);
});

test('Tentativa Sprint sem 40 linhas não envia recorde nem altera o recorde do Clássico',async({page})=>{
 test.setTimeout(45000);
 let submissions=0;
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Sprint Tester'}})}));
 await page.route('**/api/games/tetris-sprint/leaderboard',async route=>{
  if(route.request().method()==='POST')submissions++;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})});
 });
 await page.goto('/jogos/tetris/sprint/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 for(let i=0;i<38;i++){
  if((await page.locator('#tetris-status').textContent())?.includes('Fim de jogo'))break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(280);
 }
 await expect(page.locator('#tetris-status')).toHaveText('● Fim de jogo');
 await expect(page.locator('#tetris-score')).not.toHaveText('40/40');
 await expect(page.locator('#tetris-local-best')).toHaveText('—');
 expect(submissions).toBe(0);
 await expect(page.locator('[data-rank-global]')).toHaveText('—');
});

test('Sprint em monitor ultrawide preserva tela cheia 1:2 sem esticar o tabuleiro',async({page,isMobile})=>{
 if(isMobile)test.skip();
 await page.setViewportSize({width:2560,height:900});
 await page.goto('/jogos/tetris/sprint/');
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('tetris-stage');
 const rect=await page.locator('#tetris-canvas').boundingBox();
 expect(rect).not.toBeNull();
 expect(rect!.width/rect!.height).toBeCloseTo(.5,1);
 expect(rect!.width).toBeLessThan(400);
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??'')).toBe('');
});
