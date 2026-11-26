import {test,expect} from '@playwright/test';

// Contrato visual aprovado em 19/11: cabeçalho + canvas + HUD contextual.
// Sem alterar motores de jogo; estes testes vigiam estrutura, IDs e responsividade.
for(const sample of [
 {name:'Snake Clássico',url:'/jogos/snake/',stage:'#game-stage',canvas:'#snake-canvas',score:'#hud-score',ratio:1},
 {name:'Pixel Quest',url:'/jogos/pixel-quest/',stage:'#pq-stage',canvas:'#pq-canvas',score:'#pq-score',ratio:16/9},
 {name:'Tetris Clássico',url:'/jogos/tetris/',stage:'#tetris-stage',canvas:'#tetris-canvas',score:'#tetris-score',ratio:.5}
]){
 test(`Palco homologável de ${sample.name} preserva canvas, placar e largura em 1440/390/320`,async({page})=>{
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   await page.goto(sample.url);
   await expect(page.locator(`${sample.stage} .oa-stage-header`)).toBeVisible();
   await expect(page.locator(`${sample.stage} .oa-hud-compact`)).toBeVisible();
   await expect(page.locator(sample.score)).toHaveCount(1);
   await expect(page.locator(sample.canvas)).toBeVisible();
   const measure=await page.evaluate((selector)=>{
    const c=document.querySelector(selector)!.getBoundingClientRect();
    return {ratio:c.width/c.height,width:document.documentElement.scrollWidth,viewport:innerWidth};
   },sample.canvas);
   expect(measure.ratio).toBeCloseTo(sample.ratio,1);
   expect(measure.width).toBeLessThanOrEqual(measure.viewport+1);
   if(width===1440){
    await expect(page.locator(`${sample.stage} .oa-hud-label`).first()).toBeVisible();
    const bounds=await page.evaluate(({stage,canvasSelector})=>{
     const s=document.querySelector(stage)!;
     const canvas=s.querySelector(canvasSelector)!.getBoundingClientRect();
     const hud=s.querySelector('.oa-hud-compact')!.getBoundingClientRect();
     return {canvasRight:canvas.right,hudLeft:hud.left};
    },{stage:sample.stage,canvasSelector:sample.canvas});
    expect(bounds.hudLeft).toBeGreaterThanOrEqual(bounds.canvasRight-1);
   }
  }
 });
}

test('Pixel Quest mostra vidas/checkpoint/portal junto ao canvas sem duplicar contadores',async({page})=>{
 await page.goto('/jogos/pixel-quest/');
 const stage=page.locator('#pq-stage');
 await expect(stage.locator('.pq-board-column > #pq-screen')).toBeVisible();
 await expect(stage.locator('.pq-board-column > .pq-statusline')).toBeVisible();
 await expect(stage.locator('#pq-hearts')).toBeVisible();
 await expect(stage.locator('#pq-checkpoint')).toBeVisible();
 await expect(stage.locator('#pq-portal-status')).toBeVisible();
 await expect(stage.locator('#pq-crystals-remaining')).toBeVisible();
 await expect(stage.locator('#pq-enemies-active')).toBeVisible();
 await expect(stage.locator('#pq-campaign-score')).toBeVisible();
 await expect(stage.locator('#pq-enemies-remaining')).toHaveCount(0);
 for(const id of ['#pq-crystals','#pq-level-enemies','#pq-level-defeated']){
  await expect(stage.locator(id)).toHaveCount(1);
  await expect(stage.locator(id)).toBeHidden();
 }
 await expect(stage.locator('#pq-crystals-remaining-bar')).toHaveCount(1);
 await expect(stage.locator('#pq-enemies-remaining-bar')).toHaveCount(0);
 await expect(stage.locator('#pq-enemy-patroller-count')).toBeVisible();
});
