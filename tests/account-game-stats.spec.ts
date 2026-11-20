import {test,expect} from '@playwright/test';

test('Meu desempenho mostra 1 card por jogo com ranking individual de todas as modalidades, inclusive Quest',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Jogador Teste'}})}));
 await page.route('**/api/account/preferences',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
 const requests:string[]=[];
 await page.route('**/api/games/*/leaderboard',r=>{
  const id=decodeURIComponent(new URL(r.request().url()).pathname.split('/').at(-2)||'');
  requests.push(id);
  const data={available:true,mine:{nickname:'Jogador Teste',score:id==='tetris-sprint'?45234:id==='tetris-survival'?90000:id==='snake'?320:120,rank:id==='snake'?1:2},top:[{nickname:'Líder',score:99,rank:1},{nickname:'Segundo',score:80,rank:2},{nickname:'Terceiro',score:70,rank:3}]};
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('/conta/');
 await expect(page.locator('#account-records')).toBeVisible();
 await expect(page.locator('[data-account-game]')).toHaveCount(3);
 for(const [id,count] of [['snake',3],['tetris',3],['pixel-quest',1]] as const){
  const group=page.locator('[data-account-game="'+id+'"]');
  await expect(group).toHaveCount(1);
  await expect(group.locator('[data-account-record]')).toHaveCount(count);
 }
 await expect(page.locator('[data-account-record]')).toHaveCount(7);
 await expect(page.locator('.account-record-card')).toHaveCount(0);
 await expect(page.locator('[data-account-record="snake"] [data-account-best]')).toHaveText('320 pontos');
 await expect(page.locator('[data-account-record="tetris-sprint"] [data-account-best]')).toHaveText('0:45.234');
 await expect(page.locator('[data-account-record="tetris-survival"] [data-account-best]')).toHaveText('1:30.000');
 await expect(page.locator('[data-account-record="pixel-quest"] [data-account-best]')).toHaveText('120 pontos');
 await expect(page.locator('[data-account-record="snake"] [data-account-rank]')).toHaveText('1º');
 expect([...new Set(requests)].sort()).toEqual(['snake','snake-adventure','snake-evolution','tetris','tetris-sprint','tetris-survival','pixel-quest'].sort());
});

test('Meu desempenho preserva privacidade da conta e largura 320/390/980',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 for(const width of [320,390,980]){
  await page.setViewportSize({width,height:900});
  await page.goto('/conta/');
  await expect(page.locator('#account-records')).toBeHidden();
  const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
  expect(m.scroll).toBeLessThanOrEqual(m.viewport+1);
 }
});
