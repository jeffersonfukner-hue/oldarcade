import {test,expect} from '@playwright/test';
for(const loggedIn of [false,true]){
 test('Vitória avança por padrão e permite repetir por seleção explícita: '+(loggedIn?'conta':'visitante'),async({page})=>{
  let completed=['c1','c2','c3','c4'];
  let release:()=>void=()=>{};
  const gate=new Promise<void>(resolve=>{release=resolve});
  await page.addInitScript(()=>localStorage.setItem('oldarcade:tetris:campaign:v1',JSON.stringify(['c1','c2','c3','c4'])));
  await page.route('**/api/auth/me',r=>r.fulfill({json:{player:loggedIn?{nickname:'Jogador teste'}:null}}));
  await page.route('**/api/tetris/progress',r=>r.fulfill({status:loggedIn?200:401,json:{available:true,completed}}));
  await page.route('**/api/tetris/rankings/*',async r=>{
   if(r.request().method()==='POST'){
    if(!loggedIn)return r.fulfill({status:401,json:{}});
    await gate;completed=[...completed,'c5'];
    return r.fulfill({json:{available:true,saved:true,top:[],mine:null}});
   }
   return r.fulfill({json:{available:true,top:[],mine:null}});
  });
  await page.clock.install();
  await page.goto('/jogos/tetris/sprint/');
  const picker=page.locator('#tetris-campaign-select'),button=page.locator('#tetris-start');
  await expect(picker.locator('option[value=c5]')).toBeEnabled();
  await picker.selectOption('c5');
  await button.click();
  await page.clock.runFor(3100);
  await expect(page.locator('#tetris-overlay')).toBeHidden();
  await page.clock.fastForward(421000);
  await expect(page.locator('#tetris-overlay-title')).toHaveText('Missão cumprida!');
  if(loggedIn){
   await expect(button).toContainText('Verificar liberação');
   await button.click();
   await expect(page.locator('#tetris-overlay-title')).toHaveText('Missão cumprida!');
   release();
  }
  await expect(button).toContainText('Jogar próxima missão');
  await expect(picker).toHaveValue('c6');
  await button.click();
  await expect(picker).toHaveValue('c6');
  await page.clock.runFor(3100);
  await expect(page.locator('#tetris-overlay')).toBeHidden();
  await expect(page.locator('[data-rank-heading]')).toContainText('Caçador de triplas');
 });
}
