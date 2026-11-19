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
test('Layouts mobile 390 e 320 com HUD acima e sem rolagem horizontal',async({page})=>{
 for(const width of [390,320])for(const route of ['/jogos/snake/','/jogos/tetris/','/jogos/pixel-quest/']){
  await page.setViewportSize({width,height:844});
  await page.goto(route);
  const geometry=await page.evaluate(()=>{
   const stage=document.querySelector('.oa-game-layout>.game-stage')!;
   const board=stage.querySelector('.oa-board-surface')!.getBoundingClientRect();
   const hud=stage.querySelector('.game-hud')!.getBoundingClientRect();
   const offenders=[...document.querySelectorAll<HTMLElement>('body *')].filter(el=>{
    const r=el.getBoundingClientRect();
    return r.width>0&&r.height>0&&(r.right>innerWidth+1||r.left< -1)
     &&getComputedStyle(el).position!=='fixed'&&getComputedStyle(el).visibility!=='hidden';
   }).slice(0,12).map(el=>({tag:el.tagName,id:el.id,classes:el.className?.toString().slice(0,60),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)}));
   return {above:hud.bottom<=board.top+1,overflow:document.documentElement.scrollWidth>innerWidth+1,offenders};
  });
  expect(geometry.above,route+' '+width).toBe(true);
  expect(geometry.overflow,route+' '+width+' '+JSON.stringify(geometry.offenders)).toBe(false);
 }
});
test('Formato portrait se adapta a 900px sem apertar o tabuleiro',async({page})=>{
 await page.setViewportSize({width:820,height:900});
 await page.goto('/jogos/tetris/');
 const dims=await page.evaluate(()=>{
  const stage=document.querySelector('#tetris-stage')!;
  const hud=stage.querySelector('.game-hud')!.getBoundingClientRect();
  const board=stage.querySelector('#tetris-screen')!.getBoundingClientRect();
  return {stacked:hud.bottom<=board.top+1,overflow:document.documentElement.scrollWidth>innerWidth+1};
 });
 expect(dims.stacked).toBe(true);
 expect(dims.overflow).toBe(false);
});

test('Teste de comemorações não invade o Preview comum',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('#celebration-test-panel')).toBeHidden();
});

test('Segunda revisão conserva contrato informativo em todos os jogos',async({page})=>{
 const routes=['/jogos/snake/','/jogos/snake/aventura/','/jogos/snake/evolution/','/jogos/tetris/','/jogos/tetris/sprint/','/jogos/tetris/sobrevivencia/','/jogos/pixel-quest/'];
 for(const route of routes){
  await page.goto(route);
  await expect(page.locator('.oa-game-guide')).toHaveCount(1);
  await expect(page.locator('[data-development-game]')).toHaveCount(1);
  await expect(page.locator('[data-game-share]')).toHaveCount(1);
  await expect(page.locator('[data-game-share] [data-share-copy]')).toBeVisible();
  await expect(page.locator('[data-game-share] .oa-share-networks')).not.toHaveAttribute('open','');
  await expect(page.locator('[data-development-game] details')).toHaveCount(2);
 }
});
test('Snake mantém IDs de integração sem repetir placar fora do HUD',async({page})=>{
 for(const route of ['/jogos/snake/','/jogos/snake/evolution/']){
  await page.goto(route);
  for(const id of ['score','best','global-best','plays','visits','nickname','global-rank-body']){
   await expect(page.locator('#'+id)).toHaveCount(1);
  }
  await expect(page.locator('.oa-metric-bridge')).toHaveCount(2);
  await expect(page.locator('.oa-performance-panel')).toBeVisible();
  await expect(page.locator('.oa-ranking-panel')).toBeVisible();
 }
});
test('Tetris conserva reserva, prévia e formato enquanto reduz duplicação',async({page})=>{
 await page.goto('/jogos/tetris/');
 await expect(page.locator('#tetris-next')).toBeVisible();
 await expect(page.locator('#tetris-hold')).toBeVisible();
 await expect(page.locator('#tetris-sidebar-level')).toHaveCount(1);
 await expect(page.locator('#tetris-stage')).toHaveAttribute('data-board-shape','portrait');
});
test('Compartilhamento expande somente quando solicitado',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 const details=page.locator('.oa-share-networks');
 await expect(details).not.toHaveAttribute('open','');
 await details.locator('summary').click();
 await expect(details).toHaveAttribute('open','');
 await expect(page.locator('[data-share-network="whatsapp"]')).toBeVisible();
});

test('Conjunto Tetris fica centralizado no slot compartilhado, com proporção preservada',async({page})=>{
 for(const width of [1440,1024,820,390,320]){
  await page.setViewportSize({width,height:900});
  await page.goto('/jogos/tetris/');
  const geometry=await page.evaluate(()=>{
   const layout=document.querySelector('#tetris-stage .arcade-game-layout')!;
   const group=document.querySelector('#tetris-stage .tetris-playfield')!;
   const board=document.querySelector('#tetris-screen')!;
   const preview=document.querySelector('#tetris-stage .tetris-preview-column')!;
   const parent=layout.getBoundingClientRect(),g=group.getBoundingClientRect(),b=board.getBoundingClientRect(),p=preview.getBoundingClientRect();
   const style=getComputedStyle(layout);
   const stacked=style.gridTemplateAreas.includes('"stats" "board"');
   const available=stacked?parent:{left:parent.left,right:layout.querySelector('.game-hud')!.getBoundingClientRect().left};
   return {
    centerDiff:Math.abs((g.left+g.right)/2-(available.left+available.right)/2),
    ratio:b.height/b.width,
    previewNextToBoard:p.left>=b.right-1,
    overflow:document.documentElement.scrollWidth>innerWidth+1
   };
  });
  expect(geometry.centerDiff,'centralização '+width).toBeLessThanOrEqual(22);
  expect(geometry.ratio,'proporção 10x20 '+width).toBeGreaterThan(1.95);
  expect(geometry.ratio,'proporção 10x20 '+width).toBeLessThan(2.05);
  expect(geometry.previewNextToBoard,'próxima/reserva '+width).toBe(true);
  expect(geometry.overflow,'sem rolagem horizontal '+width).toBe(false);
 }
});
