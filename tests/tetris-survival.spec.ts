import {test,expect} from '@playwright/test';

test('Sobrevivência é terceira aba e usa motor/relógio/controle compartilhados',async({page})=>{
 await page.route('**/api/games/tetris-survival/leaderboard',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({available:true,top:[{nickname:'Resistente',score:120000,rank:1,achievedAt:'2026-11-17T22:00:00Z'}],mine:null})
 }));
 await page.goto('/jogos/tetris/sobrevivencia/');
 await expect(page).toHaveTitle(/Tetris Sobrevivência/);
 await expect(page.locator('#tetris-stage')).toHaveAttribute('data-game-mode','tetris-survival');
 await expect(page.locator('#tetris-stage')).toHaveAttribute('data-board-shape','portrait');
 await expect(page.getByRole('link',{name:/Sobrevivência · maior tempo/})).toHaveAttribute('aria-current','page');
 await expect(page.getByRole('link',{name:'Clássico'})).not.toHaveAttribute('aria-current','page');
 await expect(page.locator('#tetris-score')).toHaveText('0:00.000');
 await expect(page.locator('#tetris-sidebar-level')).toHaveText('Onda 1');
 await expect(page.locator('#tetris-global')).toHaveText('2:00.000');
 await expect(page.locator('[data-rank-global]')).toHaveText('2:00.000');
 await expect(page.locator('[data-mode-ranking]')).toHaveAttribute('data-game','tetris-survival');
 await expect(page.locator('#tetris-local-best')).toHaveText('—');
 await expect(page.locator('#tetris-canvas')).toHaveAttribute('height','600');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 await expect(page.locator('#tetris-start')).toBeHidden();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 await page.waitForTimeout(550);
 await expect(page.locator('#tetris-score')).not.toHaveText('0:00.000');
 await page.getByRole('button',{name:'Pausar'}).click();
 await expect(page.locator('#tetris-status')).toHaveText('● Pausado');
 const elapsed=await page.locator('#tetris-score').textContent();
 await page.waitForTimeout(450);
 await expect(page.locator('#tetris-score')).toHaveText(elapsed!);
});

test('Sobrevivência registra duração uma vez quando o tabuleiro enche',async({page})=>{
 test.setTimeout(60000);
 const submissions:{score:number;durationMs:number}[]=[];
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Resistente'}})}));
 await page.route('**/api/games/tetris-survival/leaderboard',async route=>{
  if(route.request().method()==='POST'){
   submissions.push(route.request().postDataJSON() as {score:number;durationMs:number});
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    available:true,top:[{nickname:'Resistente',score:submissions[0].score,rank:1}],mine:{nickname:'Resistente',score:submissions[0].score,rank:1}
   })});
  }else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})});
 });
 await page.goto('/jogos/tetris/sobrevivencia/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 for(let i=0;i<40;i++){
  if((await page.locator('#tetris-status').textContent())?.includes('Fim de jogo'))break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(280);
 }
 await expect(page.locator('#tetris-status')).toHaveText('● Fim de jogo');
 await expect.poll(()=>submissions.length,{timeout:4500}).toBe(1);
 expect(submissions[0].score).toBeGreaterThan(0);
 expect(submissions[0].score).toBe(submissions[0].durationMs);
 await expect(page.locator('#tetris-local-best')).not.toHaveText('—');
 await expect(page.locator('#tetris-best')).not.toHaveText('—');
 for(let i=0;i<3;i++)await page.keyboard.press('Space');
 expect(submissions).toHaveLength(1);
});

test('Sobrevivência respeita proporção 1:2 no ultrawide',async({page,isMobile})=>{
 if(isMobile)test.skip();
 await page.setViewportSize({width:2560,height:900});
 await page.goto('/jogos/tetris/sobrevivencia/');
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('tetris-stage');
 const rect=await page.locator('#tetris-canvas').boundingBox();
 expect(rect).not.toBeNull();
 expect(rect!.width/rect!.height).toBeCloseTo(.5,1);
 expect(rect!.width).toBeLessThan(400);
});
