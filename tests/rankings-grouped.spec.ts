import {test,expect} from '@playwright/test';

test('Rankings: um card por jogo, modos internos e Top 3 real com Top 10 recolhido',async({page})=>{
 const requested:string[]=[];
 await page.route('**/api/games/*/leaderboard',route=>{
  const mode=new URL(route.request().url()).pathname.split('/').at(-2)||'';
  requested.push(mode);
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[
   {nickname:'Jogador Alfa',score:mode==='tetris-sprint'?45000:mode==='tetris-survival'?90000:300,rank:1,achievedAt:'2026-11-18T20:00:00.000Z'},
   {nickname:'Jogador Beta',score:mode==='tetris-sprint'?60000:mode==='tetris-survival'?70000:200,rank:2,achievedAt:'2026-11-18T21:00:00.000Z'},
   {nickname:'Jogador Gama',score:mode==='tetris-sprint'?80000:mode==='tetris-survival'?60000:100,rank:3,achievedAt:'2026-11-18T22:00:00.000Z'},
   {nickname:'Jogador Delta',score:mode==='tetris-sprint'?92000:mode==='tetris-survival'?50000:80,rank:4,achievedAt:'2026-11-18T23:00:00.000Z'}
  ]})});
 });
 await page.goto('/rankings/');
 await expect(page.locator('[data-rank-page-game]')).toHaveCount(3);
 await expect(page.locator('[data-rank-page-game="snake"] [data-rank-page-mode]')).toHaveCount(3);
 await expect(page.locator('[data-rank-page-game="tetris"] [data-rank-page-mode]')).toHaveCount(3);
 await expect(page.locator('[data-rank-page-game="pixel-quest"] [data-rank-page-mode]')).toHaveCount(1);
 await expect(page.locator('.rankings-game-card')).toHaveCount(3);
 await expect(page.locator('.rankings-jump a')).toHaveCount(3);
 await expect(page.locator('[data-rank-page-mode]')).toHaveCount(7);
 const classic=page.locator('#ranking-snake');
 await expect(classic).toHaveAttribute('open','');
 await expect(classic.locator('.rankings-podium-card')).toHaveCount(3);
 await expect(classic.locator('.rankings-top10')).not.toHaveAttribute('open','');
 await classic.locator('.rankings-top10 summary').click();
 await expect(classic.locator('.rankings-top10')).toHaveAttribute('open','');
 await expect(classic.locator('[data-rank-table] tr')).toHaveCount(4);
 await expect(classic.locator('.rankings-podium-card.podium-1')).toContainText('Jogador Alfa');
 const sprint=page.locator('#ranking-tetris-sprint');
 await sprint.locator(':scope > summary').click();
 await expect(sprint.locator('[data-rank-podium]')).toContainText('0:45.000');
 await expect(page.locator('#ranking-tetris-survival [data-rank-podium]')).toContainText('1:30.000');
 expect([...new Set(requested)].sort()).toEqual(['snake','snake-adventure','snake-evolution','tetris','tetris-sprint','tetris-survival','pixel-quest'].sort());
});
test('Rankings agrupados são responsivos e link por modo abre seu detalhe',async({page})=>{
 await page.route('**/api/games/*/leaderboard',route=>route.fulfill({status:200,contentType:'application/json',body:'{"available":true,"top":[]}'}));
 for(const width of [320,390,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/rankings/#ranking-snake-evolution');
  await expect(page.locator('#ranking-snake-evolution')).toHaveAttribute('open','');
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport+1);
  await expect(page.locator('.rankings-game-card')).toHaveCount(3);
 }
});
test('Top 3 é acessível nas páginas Snake e Tetris; Top 10 sob demanda',async({page})=>{
 await page.route('**/api/games/*/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,mine:null,myGames:[],top:[
 {nickname:'Primeiro',score:150,rank:1,achievedAt:'2026-11-18T20:00:00.000Z'},
 {nickname:'Segundo',score:100,rank:2,achievedAt:'2026-11-18T20:00:00.000Z'}
 ]})}));
 for(const url of ['/jogos/snake/','/jogos/snake/evolution/','/jogos/tetris/','/jogos/tetris/sprint/','/jogos/pixel-quest/']){
  await page.goto(url);
  const ranking=page.locator(url.includes('tetris')||url.includes('pixel-quest')?'[data-mode-ranking]':'.oa-ranking-panel');
  await expect(ranking.locator('.rankings-podium-card')).toHaveCount(2);
  await expect(ranking.locator('.rankings-top10')).not.toHaveAttribute('open','');
  await expect(ranking.locator('.rankings-top10')).toHaveCount(1);
  await ranking.locator('.rankings-top10 summary').click();
  await expect(ranking.locator('.rankings-top10')).toHaveAttribute('open','');
  await expect(ranking.locator('tbody tr')).toHaveCount(2);
 }
});
