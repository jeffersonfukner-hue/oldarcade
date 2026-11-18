import {test,expect} from '@playwright/test';

test('Tetris mostra Desafio Diário para visitantes e explica benefício ao tentar participar',async({page})=>{
 await page.route('**/api/daily/tetris**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'tetris',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',days:[],account:null
 })}));
 await page.goto('/jogos/tetris/');
 const calendar=page.locator('[data-daily-calendar="tetris"]');
 await expect(calendar.getByRole('heading',{name:/Tetris · Desafio Diário/})).toBeVisible();
 await calendar.locator('.daily-day[data-status="today"]').click();
 await expect(calendar.locator('[data-daily-guest-explanation]')).toBeVisible();
 await expect(calendar.getByText(/Você pode jogar livremente sem cadastro/)).toBeVisible();
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await expect(calendar.locator('[data-daily-login]')).toBeVisible();
});

test('Tetris inicia com reserva confirmada e não libera outra tentativa diária',async({page})=>{
 let started=0,used=false;
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Jogador Tetris'}})}));
 await page.route('**/api/daily/tetris**',async route=>{
  if(route.request().method()==='POST'){
   const data=route.request().postDataJSON() as {action:string};
   if(data.action==='start'){started++;used=true;return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({date:'2026-11-17',game:'tetris',token:'a'.repeat(64),seed:1234567})})}
   return route.fulfill({status:200,contentType:'application/json',body:'{"saved":true}'});
  }
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   game:'tetris',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',
   days:used?[{date:'2026-11-17',status:'started'}]:[],account:{nickname:'Jogador Tetris'}
  })});
 });
 await page.goto('/jogos/tetris/');
 const calendar=page.locator('[data-daily-calendar="tetris"]');
 await calendar.locator('[data-daily-start]').click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 await expect(calendar.locator('.daily-day[data-status="started"]')).toHaveCount(1);
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 expect(started).toBe(1);
});

test('Todos os modos do Tetris oferecem acesso ao desafio sem duplicar o jogo',async({page})=>{
 for(const path of ['/jogos/tetris/sprint/','/jogos/tetris/sobrevivencia/']){
  await page.goto(path);
  await expect(page.getByText(/Desafio Diário do Tetris/)).toBeVisible();
  await expect(page.getByRole('link',{name:/Conhecer o desafio/})).toHaveAttribute('href',/jogos\/tetris\/.*daily-title-tetris/);
 }
});

test('Cadastro e perfil oferecem avisos separados e e-mail opcional',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.goto('/conta/');
 await page.locator('#tab-register').click();
 await expect(page.locator('#register-email')).toBeVisible();
 await expect(page.locator('#register-alerts')).toBeVisible();
 await expect(page.locator('#register-daily-alerts')).toBeVisible();
});


test('Tetris oferece repetir o desafio após derrota e não inicia o Clássico',async({page})=>{
 let starts=0,finishes=0;
 const mission={version:3,kind:'timed-sequence',metric:'sequence',target:4,timeLimitMs:900,
  title:'Duplas perfeitas',description:'Elimine 2 linhas quatro vezes seguidas em 900 ms.',sequence:[2,2,2,2]};
 await page.route('**/api/auth/me',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Jogador Tetris'}})}));
 await page.route('**/api/daily/tetris**',async route=>{
  if(route.request().method()==='POST'){
   const {action}=route.request().postDataJSON() as {action:string};
   if(action==='start'){
    starts++;
    return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({date:'2026-11-20',game:'tetris',token:'a'.repeat(64),seed:1234567,mission})});
   }
   if(action==='finish'){
    finishes++;
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({saved:false,retryAvailable:true,missionSuccess:false,mission})});
   }
  }
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   game:'tetris',today:'2026-11-20',month:'2026-11',days:starts?[{date:'2026-11-20',status:'started'}]:[],
   mission,account:{nickname:'Jogador Tetris'},historyAvailable:true
  })});
 });
 await page.goto('/jogos/tetris/');
 await page.locator('[data-daily-calendar="tetris"] [data-daily-start]').click();
 await expect(page.locator('#tetris-overlay-title')).toHaveText('Meta ainda não alcançada',{timeout:15000});
 await expect(page.locator('#tetris-overlay-text')).toContainText('Quer começar novamente este desafio?');
 await expect(page.locator('#tetris-start')).toHaveText('↻ Tentar desafio novamente');
 expect(starts).toBe(1);
 expect(finishes).toBe(1);
 await page.locator('#tetris-start').click();
 await expect(page.locator('#tetris-countdown')).toHaveText('3');
 expect(starts).toBe(2);
 await expect(page.locator('[data-daily-mission-sidebar] .daily-live-tracker')).toContainText('Duplas perfeitas');
});
