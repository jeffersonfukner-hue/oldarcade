import {expect,test} from '@playwright/test';
const modes=[
 ['snake','/jogos/snake/'],['snake-adventure','/jogos/snake/aventura/'],['snake-evolution','/jogos/snake/evolution/'],
 ['tetris','/jogos/tetris/'],['tetris-sprint','/jogos/tetris/sprint/'],['tetris-survival','/jogos/tetris/sobrevivencia/'],
 ['pixel-quest','/jogos/pixel-quest/']
] as const;
for(const [mode,path] of modes){
 test(`Rankings públicos e convite depois de partida sem login: ${mode}`,async({page})=>{
  await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
  await page.route('**/api/games/*/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   available:true,top:[{nickname:'Líder Teste',score:850,rank:1,achievedAt:'2026-11-19T12:00:00Z'}],mine:null
  })}));
  await page.goto(path);
  const ranking=page.locator('[data-mode-ranking],.oa-ranking-panel').first();
  await expect(ranking).toBeVisible();
  await expect(ranking.locator('.rankings-podium-card')).toHaveCount(1);
  await expect(ranking).toContainText('Líder Teste');
  await expect(page.locator('[data-rank-retry]')).toHaveCount(0);
  await page.evaluate(mode=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:mode,score:100,durationMs:32000,recordDelayMs:800}})),mode);
  const invite=page.locator('[data-end-account-invite]');
  await expect(invite).toBeVisible({timeout:5000});
  await expect(invite.locator('[data-end-invite-ranking]')).toHaveAttribute('href','/rankings/#ranking-'+mode);
  await invite.locator('[data-end-invite-dismiss]').click();
  await expect(invite).toBeHidden();
 });
}
test('Quest no índice permite consultar o recorde de outro jogador sem conta',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.route('**/api/games/pixel-quest/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Aventureira',score:900,rank:1,achievedAt:'2026-11-19T12:00:00Z'}]})}));
 await page.goto('/rankings/');
 const quest=page.locator('[data-rank-page-game="pixel-quest"]');
 await expect(quest).toBeVisible();
 await expect(quest.locator('[data-rank-podium]')).toContainText('Aventureira');
 await expect(quest.locator('[data-rank-page-mode="pixel-quest"]')).toHaveCount(1);
});
test('Jogador já autenticado grava resultado do Quest automaticamente e não recebe convite',async({page})=>{
 const posted:Array<{score:number;durationMs:number}>=[];
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":{"nickname":"Aventureira"}}'}));
 await page.route('**/api/games/pixel-quest/leaderboard',r=>{
  if(r.request().method()==='POST'){
   const input=r.request().postDataJSON() as {score:number;durationMs:number};
   posted.push(input);
   return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,saved:true,top:[{nickname:'Aventureira',score:input.score,rank:1}],mine:{nickname:'Aventureira',score:input.score,rank:1}})});
  }
  return r.fulfill({status:200,contentType:'application/json',body:'{"available":true,"top":[],"mine":null}'});
 });
 await page.goto('/jogos/pixel-quest/');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'pixel-quest',score:980,durationMs:45500}})));
 await expect.poll(()=>posted.length,{timeout:5000}).toBe(1);
 expect(posted[0]).toEqual({score:980,durationMs:45500});
 await expect(page.locator('[data-end-account-invite]')).toBeHidden();
 await expect(page.locator('#pq-global')).toHaveText('980');
});
