import {test,expect} from '@playwright/test';

test('Tetris #002 usa catálogo, página SEO e componentes globais',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#hero-published-games')).toHaveText('2');
 await expect(page.getByRole('link',{name:/Jogar Tetris Clássico/})).toHaveAttribute('href','/jogos/tetris/');
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
 expect(plays).toBe(1);
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur()});
 await page.keyboard.press('ArrowLeft');
 await page.keyboard.press('ArrowUp');
 await page.keyboard.press('KeyC');
 await page.keyboard.press('Space');
 await expect(page.locator('#tetris-score')).not.toHaveText('0');
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
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??'')).toBe('tetris-stage');
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id??'')).toBe('');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-plays')).toHaveText('1');
 await page.reload();
 await expect(page.locator('#tetris-plays')).toHaveText('1');
});
