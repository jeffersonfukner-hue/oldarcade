import {test,expect} from '@playwright/test';
const routes=[
 ['/jogos/snake/','square','snake-canvas'],
 ['/jogos/snake/aventura/','square','adventure-canvas'],
 ['/jogos/snake/evolution/','square','snake-canvas'],
 ['/jogos/tetris/','portrait','tetris-canvas'],
 ['/jogos/tetris/sprint/','portrait','tetris-canvas'],
 ['/jogos/tetris/sobrevivencia/','portrait','tetris-canvas'],
 ['/jogos/pixel-quest/','landscape','pq-canvas']
] as const;
for(const [route,shape,canvasId] of routes){
 test('Layout global de '+route+' mantém tabuleiro, HUD e detalhes na ordem correta',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto(route);
  const layout=page.locator('.oa-game-layout');
  await expect(layout).toHaveCount(1);
  const stage=layout.locator(':scope > .game-stage');
  await expect(stage).toHaveAttribute('data-board-shape',shape);
  await expect(stage.locator('#'+canvasId)).toBeVisible();
  await expect(stage.locator('.game-hud')).toBeVisible();
  const status=await page.evaluate(()=>{
   const layout=document.querySelector('.oa-game-layout')!;
   const stage=layout.querySelector('.game-stage')!;
   const details=layout.querySelector(':scope > aside')!;
   const hud=stage.querySelector('.game-hud')!;
   const board=stage.querySelector('.oa-board-surface')!;
   const a=stage.getBoundingClientRect(),b=details.getBoundingClientRect(),
     h=hud.getBoundingClientRect(),g=board.getBoundingClientRect();
   return {detailsBelow:b.top>=a.bottom-1,hudOnSide:h.left>=g.right-1,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(status.detailsBelow).toBe(true);
  expect(status.hudOnSide).toBe(true);
  expect(status.overflow).toBe(false);
 });
}
test('Layouts mobile com HUD acima e sem rolagem horizontal',async({page})=>{
 for(const route of ['/jogos/snake/','/jogos/tetris/','/jogos/pixel-quest/']){
  await page.setViewportSize({width:390,height:844});
  await page.goto(route);
  const geometry=await page.evaluate(()=>{
   const stage=document.querySelector('.oa-game-layout>.game-stage')!;
   const board=stage.querySelector('.oa-board-surface')!.getBoundingClientRect();
   const hud=stage.querySelector('.game-hud')!.getBoundingClientRect();
   return {above:hud.bottom<=board.top+1,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(geometry.above,route).toBe(true);
  expect(geometry.overflow,route).toBe(false);
 }
});
test('Teste de comemorações não invade o Preview comum',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#celebration-test-panel')).toBeHidden();
});
