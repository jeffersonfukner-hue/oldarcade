import {test,expect} from '@playwright/test';

test('Tetris #002 usa catálogo, página SEO e componentes globais',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#hero-published-games')).toHaveText('3');
 await expect(page.locator('#featured-game-link')).toHaveAttribute('href','/jogos/pixel-quest/');
 await expect(page.locator('#featured-game-link')).toHaveAttribute('data-featured-game','pixel-quest');
 await expect(page.getByRole('heading',{name:/Os clássicos nunca/})).toBeVisible();
 await expect(page.locator('.home-game-card').first()).toContainText('Pixel Quest');
 await expect(page.locator('.arcade-mode-grid .home-game-modes a[href="/jogos/snake/"]')).toHaveCount(1);
 await expect(page.locator('.arcade-mode-grid .home-game-modes a[href="/jogos/tetris/"]')).toHaveCount(1);
 await page.goto('/jogos/tetris/');
 await expect(page).toHaveTitle(/Tetris/);
 await expect(page.locator('#tetris-canvas')).toBeVisible();
 await expect(page.locator('#tetris-next')).toBeVisible();
 await expect(page.locator('#tetris-hold')).toBeVisible();
 await expect(page.locator('[data-mode-ranking][data-game=tetris]')).toBeVisible();
 await expect(page.locator('[data-game-share][data-game-slug=tetris]')).toBeVisible();
 await expect(page.locator('#tetris-best')).toHaveText('—');
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
 await expect(page.locator('#tetris-overlay')).toHaveAttribute('data-countdown-only','');
 await expect(page.locator('#tetris-start')).toBeHidden();
 await expect(page.locator('#tetris-overlay-title')).toBeHidden();
 await expect(page.locator('#tetris-overlay-text')).toBeHidden();
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

test('Tetris salva contador local e respeita controles desktop/touch e tela cheia',async({page})=>{
 await page.goto('/jogos/tetris/');
 const pointerFine=await page.evaluate(()=>matchMedia('(hover:hover) and (pointer:fine)').matches);
 for(const name of ['Girar peça','Queda instantânea','Reservar peça']){
  const button=page.getByRole('button',{name,includeHidden:true});
  await expect(button).toHaveCount(1);
  if(pointerFine)await expect(button).toBeHidden();
  else await expect(button).toBeVisible();
 }
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

test('Clássico usa celebração de pódio por posição real, acima da tela de revanche',async({page})=>{
 await page.goto('/jogos/tetris/');
 await page.evaluate(()=>{
  document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:'tetris',kind:'podium',rank:2,message:'Você conquistou o 2º lugar no ranking!'}}));
 });
 const celebration=page.locator('#game-celebration');
 await expect(celebration).toBeVisible();
 await expect(celebration.locator('[data-celebration-title]')).toHaveText('2º LUGAR!');
 await expect(celebration.locator('[data-celebration-icon]')).toHaveText('🥈');
 await expect(celebration).toHaveClass(/is-podium/);
 await expect.poll(()=>page.evaluate(()=>{
  const pop=document.querySelector('#game-celebration')!;
  const gameOverlay=document.querySelector('#tetris-overlay')!;
  const rank=Number.parseInt(getComputedStyle(pop).zIndex,10);
  const gameRank=Number.parseInt(getComputedStyle(gameOverlay).zIndex,10)||0;
  return pop.parentElement!==document.querySelector('#tetris-screen')&&getComputedStyle(pop).position==='fixed'&&rank>gameRank;
 })).toBe(true);
});

test('Convite ao visitante respeita animação e não bloqueia o Game Over',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:null})}));
 await page.route('**/api/games/tetris/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})}));
 await page.goto('/jogos/tetris/');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'tetris',score:100,durationMs:10000,recordDelayMs:1500}})));
 await expect(page.locator('[data-end-account-invite]')).toBeHidden();
 await page.waitForTimeout(500);
 await expect(page.locator('[data-end-account-invite]')).toBeHidden();
 await expect(page.locator('[data-end-account-invite]')).toBeVisible({timeout:3500});
 await expect(page.locator('[data-rank-retry]')).toHaveCount(0);
 await expect(page.locator('[data-rank-modal]')).toHaveCount(0);
});

test('Após login global, vice-líder entra no ranking sem registro manual',async({page})=>{
 const ranking={available:true,top:[
  {nickname:'Líder',score:800,rank:1,achievedAt:'2026-11-17T12:00:00Z'},
  {nickname:'Vice',score:400,rank:2,achievedAt:'2026-11-17T12:05:00Z'}
 ],mine:{nickname:'Vice',score:400,rank:2,achievedAt:'2026-11-17T12:05:00Z'}};
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:null})}));
 await page.route('**/api/auth/login',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Vice'}})}));
 await page.route('**/api/games/tetris/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(route.request().method()==='POST'?ranking:{available:true,top:ranking.top,mine:null})}));
 await page.goto('/jogos/tetris/');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'tetris',score:400,durationMs:10000,recordDelayMs:0}})));
 await expect(page.locator('[data-end-account-invite]')).toBeVisible();
 await page.locator('[data-end-account-invite] [data-auth-trigger=login]').click();
 await expect(page.locator('[data-global-auth]')).toBeVisible();
 await page.locator('[data-auth-form=login] input[name=nickname]').fill('Vice');
 await page.locator('[data-auth-form=login] input[name=password]').fill('senha-teste-ficticia');
 await page.locator('[data-auth-form=login] button[type=submit]').click();
 await expect(page.locator('[data-global-auth]')).toBeHidden();
 await expect(page.locator('[data-end-account-invite]')).toBeHidden();
 await expect(page.locator('#game-celebration [data-celebration-title]')).toHaveText('2º LUGAR!');
 await expect(page.locator('#game-celebration [data-celebration-icon]')).toHaveText('🥈');
});

test('Tetris fullscreen preserva tabuleiro vertical e controles em monitor ultrawide',async({page,isMobile})=>{
 if(isMobile)test.skip();
 await page.setViewportSize({width:2560,height:900});
 await page.goto('/jogos/tetris/');
 await page.locator('#tetris-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('tetris-stage');
 const layout=await page.evaluate(()=>{
  const box=(selector:string)=>document.querySelector(selector)!.getBoundingClientRect().toJSON();
  return {screen:box('#tetris-screen'),canvas:box('#tetris-canvas'),hud:box('#tetris-stage .game-hud'),stage:box('#tetris-stage'),controls:box('.tetris-touch-controls'),preview:box('.tetris-preview-column')};
 });
 expect(layout.canvas.width/layout.canvas.height).toBeCloseTo(.5,1);
 expect(layout.canvas.width).toBeLessThanOrEqual(400);
 expect(layout.screen.x).toBeGreaterThan(300);
 expect(layout.screen.right).toBeLessThan(2200);
 // HUD aprovado fica DENTRO da coluna de prévias/reserva, não em uma terceira coluna.
 expect(layout.preview.left).toBeGreaterThanOrEqual(layout.canvas.right-1);
 expect(layout.hud.left).toBeGreaterThanOrEqual(layout.preview.left-1);
 expect(layout.hud.right).toBeLessThanOrEqual(layout.preview.right+1);
 expect(layout.controls.bottom).toBeLessThanOrEqual(layout.stage.bottom+1);
 expect(layout.controls.left).toBeGreaterThanOrEqual(layout.stage.left);
 expect(layout.controls.right).toBeLessThanOrEqual(layout.stage.right);
});

test('Espaço não inicia partida sozinho e resultado autenticado não se perde ao reiniciar',async({page})=>{
 const nickname='Jogador teste';
 const submissions:{score:number;durationMs:number}[]=[];
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname}})}));
 await page.route('**/api/games/tetris/leaderboard',async route=>{
  if(route.request().method()==='POST'){
   const payload=route.request().postDataJSON() as {score:number;durationMs:number};
   submissions.push(payload);
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    available:true,saved:true,top:[{nickname,score:payload.score,rank:1,achievedAt:'2026-11-17T12:00:00Z'}],
    mine:{nickname,score:payload.score,rank:1,achievedAt:'2026-11-17T12:00:00Z'}
   })});
  }else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})});
 });
 await page.goto('/jogos/tetris/');
 await expect(page.locator('[data-rank-retry]')).toHaveCount(0);
 await expect(page.locator('[data-end-account-invite]')).toBeHidden();
 await page.evaluate(()=>{
  document.body.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));
  document.body.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' ',bubbles:true}));
 });
 await expect(page.locator('#tetris-plays')).toHaveText('0');
 // Regressão do bug: a gravação de um jogo logado não pode esperar 6,5s
 // nem ser cancelada por oldarcade:game-started disparado logo depois.
 await page.evaluate(()=>{
  document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'tetris',score:33700,durationMs:90000,recordDelayMs:6500}}));
  document.dispatchEvent(new CustomEvent('oldarcade:game-started',{detail:{game:'tetris'}}));
 });
 await expect.poll(()=>submissions.length,{timeout:3000}).toBe(1);
 expect(submissions[0]).toEqual({score:33700,durationMs:90000});
 await expect(page.locator('[data-rank-global]')).toHaveText('33700');
 await page.waitForTimeout(250);
 expect(submissions).toHaveLength(1);
});

test('Espaço repetido após Game Over não reinicia Tetris nem apaga resultado',async({page})=>{
 await page.goto('/jogos/tetris/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#tetris-overlay')).toBeHidden({timeout:5500});
 for(let i=0;i<32;i++){
  if(await page.locator('#tetris-status').textContent()==='● Fim de jogo')break;
  await page.keyboard.press('Space');
  await page.waitForTimeout(275);
 }
 await expect(page.locator('#tetris-status')).toHaveText('● Fim de jogo');
 const plays=await page.locator('#tetris-plays').textContent();
 for(let i=0;i<3;i++)await page.keyboard.press('Space');
 await expect(page.locator('#tetris-plays')).toHaveText(plays!);
 await expect(page.locator('#tetris-status')).toHaveText('● Fim de jogo');
});

test('Troca de conta mantém melhor local separado e atualiza recorde autenticado',async({page})=>{
 let player='Conta A';
 await page.addInitScript(()=>{
  localStorage.setItem('oldarcade:tetris:classic:v1',JSON.stringify({best:33700,plays:4}));
 });
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:player}})}));
 await page.route('**/api/games/tetris/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  available:true,top:[{nickname:'Conta A',score:33700,rank:1}],
  mine:player==='Conta A'?{nickname:'Conta A',score:33700,rank:1}:player==='Conta B'?{nickname:'Conta B',score:3400,rank:2}:null
 })}));
 await page.goto('/jogos/tetris/');
 await expect(page.locator('#tetris-local-best')).toHaveText('33700');
 await expect(page.locator('#tetris-best')).toHaveText('33700');
 await expect(page.locator('[data-rank-personal]')).toHaveText('33700');
 player='Conta B';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:{nickname:'Conta B'}}})));
 await expect(page.locator('#tetris-best')).toHaveText('3400');
 await expect(page.locator('[data-rank-personal]')).toHaveText('3400');
 await expect(page.locator('#tetris-local-best')).toHaveText('33700');
 await expect(page.locator('#tetris-plays')).toHaveText('4');
 player='';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:null}})));
 await expect(page.locator('#tetris-best')).toHaveText('—');
 await expect(page.locator('#tetris-local-best')).toHaveText('33700');
});
