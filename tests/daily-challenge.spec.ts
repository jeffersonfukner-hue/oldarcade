import {test,expect} from '@playwright/test';

test('Visitante visualiza calendário Snake mas não consegue iniciar Desafio Diário',async({page})=>{
 await page.route('**/api/daily/snake**',async route=>{
  if(route.request().method()==='GET'){
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    game:'snake',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',days:[],account:null
   })});
  }else await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({error:'Login obrigatório'})});
 });
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar="snake"]');
 await expect(calendar.getByRole('heading',{name:/Snake · Desafio Diário/})).toBeVisible();
 await expect(calendar.locator('.daily-day')).toHaveCount(30);
 await expect(calendar.locator('[data-daily-login]')).toBeVisible();
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await calendar.locator('.daily-day[data-status="today"]').click();
 await expect(calendar.locator('[data-daily-guest-explanation]')).toBeVisible();
 await expect(calendar.getByText(/Você pode jogar livremente sem cadastro/)).toBeVisible();
});

test('Conta conectada reserva uma tentativa para Snake e impede acesso após participação',async({page})=>{
 let reserved=false;
 let submissions=0;
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Jogador A'}})}));
 await page.route('**/api/daily/snake**',async route=>{
  const request=route.request();
  if(request.method()==='POST'){
   const payload=request.postDataJSON() as {action:string;date:string};
   if(payload.action==='start'){
    submissions++;
    reserved=true;
    await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({game:'snake',date:payload.date,token:'a'.repeat(64),seed:123456789,startedAt:Date.now()})});
   }else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({saved:true})});
  }else await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   game:'snake',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',
   days:reserved?[{date:'2026-11-17',status:'started'}]:[],account:{nickname:'Jogador A'}
  })});
 });
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar="snake"]');
 const start=calendar.locator('[data-daily-start]');
 await expect(start).toBeEnabled();
 await start.click();
 await expect(page.locator('#countdown-value')).toHaveText('3');
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await expect(calendar.locator('[data-daily-result]')).toBeVisible();
 expect(submissions).toBe(1);
 await expect(calendar.locator('.daily-day[data-status="started"]')).toHaveCount(1);
});

test('Calendário de outra conta não reaproveita participação ao usar Voltar',async({page})=>{
 let nickname='Jogador A';
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'snake',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',
  days:nickname==='Jogador A'?[{date:'2026-11-17',status:'finished'}]:[],
  account:{nickname}
 })}));
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar="snake"]');
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await expect(calendar.locator('.daily-day[data-status="finished"]')).toHaveCount(1);
 nickname='Jogador B';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:{nickname:'Jogador B'}}})));
 await expect(calendar.locator('.daily-day[data-status="finished"]')).toHaveCount(0);
 await expect(calendar.locator('[data-daily-start]')).toBeVisible();
});
