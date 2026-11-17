import {test,expect} from '@playwright/test';

test('Tetris #002 usa catálogo, página SEO e componentes globais',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#hero-published-games')).toHaveText('2');
 await expect(page.locator('#featured-game-link')).toHaveAttribute('href','/jogos/tetris/');
 await expect(page.locator('#featured-game-link')).toHaveAttribute('data-featured-game','tetris');
 await expect(page.getByRole('heading',{name:/Chegou Tetris/})).toBeVisible();
 await expect(page.locator('.arcade-mode-card').first()).toContainText('Tetris');
 await expect(page.locator('.arcade-mode-grid a[href="/jogos/snake/"]')).toHaveCount(1);
 await expect(page.getByRole('link',{name:/Jogar Tetris/})).toHaveAttribute('href','/jogos/tetris/');
 await page.goto('/jogos/tetris/');
 await expect(page).toHaveTitle(/Tetris/);
 await expect(page.locator('#tetris-canvas')).toBeVisible();
 await expect(page.locator('#tetris-next')).toBeVisible();
 await expect(page.locator('#tetris-hold')).toBeVisible();
 await expect(page.locator('[data-mode-ranking][data-game=tetris]')).toBeVisible();
 await expect(page.locator('[data-game-share][data-game-slug=tetris]')).toBeVisible();
 await expect(page.locator('#tetris-best')).toHaveText('0');
 const doc=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 expect(doc.width).toBeLessThanOrEqual(doc.viewport+1);
});

test('Tetris inicia apenas uma partida, aceita movimento, queda e pausa com contagem',async({page})=>{
 let plays=0;
 await page.route('**/api/games/tetris/stats',async route=>{
  const data=route.request().postDataJSON();
  if(data.kind==='play')plays++;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,visits:1,plays})});
 });
 await page.goto('/jogos/tetris/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 await expect.poll(()=>plays).toBe(1);
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur()});
 await page.keyboard.press('ArrowLeft');
 await page.keyboard.press('ArrowUp');
 await page.keyboard.press('c');
 // Não pontuar por movimentação, rotação, reserva nem descida manual.
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('#tetris-score')).toHaveText('0');
 await page.evaluate(()=>{
  const screen=document.querySelector('#tetris-screen')!;
  (window as any).__dropAnimated=false;
  const observer=new MutationObserver(()=>{if(screen.hasAttribute('data-drop-animating')){(window as any).__dropAnimated=true;observer.disconnect()}});
  observer.observe(screen,{attributes:true,attributeFilter:['data-drop-animating']});
 });
 await page.keyboard.press('Space');
 await expect.poll(()=>page.evaluate(()=>(window as any).__dropAnimated)).toBe(true);
 await expect(page.locator('#tetris-screen')).not.toHaveAttribute('data-drop-animating',/true/,{timeout:3000});
 await expect(page.locator('#tetris-score')).toHaveText('0');
 await page.getByRole('button',{name:'Pausar'}).click();
 await expect(page.locator('#tetris-overlay-title')).toHaveText('Jogo pausado');
 await page.getByRole('button',{name:/Continuar/}).click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 expect(plays).toBe(1);
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
});

test('Tetris salva contador local e oferece comandos de toque e tela cheia',async({page})=>{
 await page.goto('/jogos/tetris/');
 await expect(page.getByRole('button',{name:'Girar peça'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Queda instantânea'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reservar peça'})).toBeVisible();
 await test.step('entrar em tela cheia',async()=>{
  await page.locator('#tetris-fullscreen').click({timeout:7000});
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??''),{timeout:7000}).toBe('tetris-stage');
 });
 await test.step('sair de tela cheia',async()=>{
  await page.locator('#tetris-fullscreen').click({timeout:7000});
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??''),{timeout:7000}).toBe('');
 });
 await test.step('persistir início de partida após recarga',async()=>{
  await page.getByRole('button',{name:/Começar partida/}).click({timeout:7000});
  await expect(page.locator('#tetris-plays')).toHaveText('1');
  await page.reload({waitUntil:'domcontentloaded',timeout:8000});
  await expect(page.locator('#tetris-plays')).toHaveText('1');
 });
});

test('Tetris integra recorde global real sem misturar ranking do Snake',async({page})=>{
 await page.route('**/api/games/tetris/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Lider Tetris',score:120,rank:1,achievedAt:'2026-11-17T10:00:00Z'}],mine:null})}));
 await page.goto('/jogos/tetris/');
 await expect(page.locator('#tetris-global')).toHaveText('120');
 await expect(page.locator('[data-mode-ranking][data-game=tetris] [data-rank-global]')).toHaveText('120');
 await expect(page.locator('#tetris-provisional')).toBeHidden();
});


test('Tetris só contabiliza linhas eliminadas, nunca movimento ou hard drop',async({page})=>{
 await page.goto('/jogos/tetris/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur()});
 for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ArrowDown','c'])await page.keyboard.press(key);
 await expect(page.locator('#tetris-score')).toHaveText('0');
 await page.keyboard.press('Space');
 await expect(page.locator('#tetris-screen')).not.toHaveAttribute('data-drop-animating','true',{timeout:3000});
 await expect(page.locator('#tetris-score')).toHaveText('0');
 await expect(page.locator('#tetris-lines')).toHaveText('0');
});
