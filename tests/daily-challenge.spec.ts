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

test('Se D1 falhar no histórico autenticado, calendário continua visível mas não libera outra tentativa',async({page})=>{
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'snake',today:'2026-11-17',month:'2026-11',timezone:'America/Sao_Paulo',
  days:[],account:{nickname:'Jogador autenticado'},historyAvailable:false,
  error:'Não foi possível consultar suas tentativas. O jogo diário ficará bloqueado até a consulta funcionar.'
 })}));
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar="snake"]');
 await expect(calendar.locator('[data-daily-month]')).toContainText(/novembro de 2026/i);
 await expect(calendar.locator('.daily-day')).toHaveCount(30);
 await expect(calendar.locator('.daily-day[data-status="today"]')).toBeDisabled();
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await expect(calendar.locator('[data-daily-info]')).toContainText('Não foi possível consultar suas tentativas');
 await expect(calendar.locator('[data-daily-login]')).toBeHidden();
});

test('Calendário explica a diferença entre desafio disponível, em partida, iniciado e concluído',async({page})=>{
 let status:'available'|'started'|'finished'='available';
 await page.route('**/api/daily/snake**',route=>{
  const entries=status==='available'?[]:[{date:'2026-11-17',status,score:status==='finished'?230:null,durationMs:status==='finished'?9000:null}];
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   game:'snake',today:'2026-11-17',month:'2026-11',days:entries,
   account:{nickname:'Jogador teste'},historyAvailable:true
  })});
 });
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar="snake"]');
 const state=calendar.locator('[data-daily-status]');
 await expect(state).toHaveAttribute('data-status','available');
 await expect(state).toContainText('Desafio de hoje disponível');
 await expect(calendar.locator('[data-daily-start]')).toBeVisible();
 status='started';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}})));
 await expect(state).toHaveAttribute('data-status','started');
 await expect(state).toContainText('Tentativa iniciada, sem conclusão confirmada');
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'playing'}})));
 await expect(state).toHaveAttribute('data-status','playing');
 await expect(state).toContainText('Desafio em andamento');
 await expect(page.locator('[data-daily-play-indicator]')).toBeVisible();
 status='finished';
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'finished'}})));
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-status-changed',{detail:{game:'snake'}})));
 await expect(state).toHaveAttribute('data-status','finished');
 await expect(state).toContainText('230 pontos');
 await expect(page.locator('[data-daily-play-indicator]')).toBeHidden();
});

test('Tetris exibe meta exata e destaca próxima limpeza na lateral sem usar tentativa',async({page})=>{
 const mission={version:3,kind:'sequence',metric:'sequence',target:5,timeLimitMs:null,
  title:'Código de linhas',description:'Elimine linhas exatamente nesta ordem: 1 → 4 → 3 → 3 → 2.',
  sequence:[1,4,3,3,2]};
 await page.route('**/api/daily/tetris**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'tetris',today:'2026-11-20',month:'2026-11',days:[],mission,
  account:{nickname:'Teste Arcade'},historyAvailable:true
 })}));
 await page.goto('/jogos/tetris/');
 const calendar=page.locator('[data-daily-calendar=tetris]');
 await expect(calendar.locator('[data-daily-mission-name]')).toHaveText('Código de linhas');
 await expect(calendar.locator('[data-daily-mission-rules]')).toContainText('1 → 4 → 3 → 3 → 2');
 await page.evaluate(()=>{
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'tetris',phase:'playing'}}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{game:'tetris',score:1000,linesCleared:5,clearSequence:[1,4],durationMs:30000}}));
 });
 const side=page.locator('[data-daily-mission-sidebar] .daily-live-tracker');
 await expect(side).toBeVisible();
 await expect(side.locator('.daily-live-next')).toHaveText('PRÓXIMA LIMPEZA: 3 LINHAS');
 await expect(side.locator('.daily-live-sequence .done')).toHaveCount(2);
 await expect(side.locator('.daily-live-sequence .next')).toHaveText('3');
});

test('Visitante conhece a meta especial do Snake antes de criar conta',async({page})=>{
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'snake',today:'2026-11-20',month:'2026-11',days:[],account:null,
  mission:{version:3,kind:'gauntlet',metric:'score',target:70,timeLimitMs:95000,
   title:'Fuga dos inimigos',description:'Colete 7 frutas desviando de 3 obstáculos e 2 inimigos.'}
 })}));
 await page.goto('/jogos/snake/');
 const calendar=page.locator('[data-daily-calendar=snake]');
 await expect(calendar.locator('[data-daily-mission-name]')).toHaveText('Fuga dos inimigos');
 await expect(calendar.locator('[data-daily-mission-rules]')).toContainText('7 frutas');
 await expect(calendar.locator('[data-daily-start]')).toBeHidden();
 await expect(calendar.locator('[data-daily-login]')).toBeVisible();
});

test('Snake mostra a missão acima das estatísticas durante o jogo',async({page})=>{
 const mission={version:3,kind:'obstacles',metric:'score',target:60,timeLimitMs:null,
  title:'Labirinto de frutas',description:'Colete 6 frutas desviando de 5 obstáculos.'};
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'snake',today:'2026-11-20',month:'2026-11',days:[],mission,account:{nickname:'Jogador'},historyAvailable:true
 })}));
 await page.goto('/jogos/snake/');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'playing'}})));
 const side=page.locator('[data-daily-mission-sidebar]');
 const tracker=side.locator('.daily-live-tracker');
 await expect(tracker).toBeVisible();
 await expect(tracker).toContainText('Labirinto de frutas');
 await expect(tracker).toContainText('6 frutas');
 await expect(side.locator(':scope > :first-child')).toHaveClass(/daily-live-tracker/);
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{
  game:'snake',score:30,durationMs:22000,linesCleared:0,clearSequence:[]
 }})));
 await expect(tracker.locator('.daily-live-progress')).toContainText('3 / 6');
});

test('Tetris não mostra 5/4 como missão concluída',async({page})=>{
 const mission={version:3,kind:'doubles',metric:'sequence',target:4,timeLimitMs:null,
  title:'Duplas perfeitas',description:'Complete 4 limpezas de exatamente 2 linhas.',sequence:[2,2,2,2]};
 await page.route('**/api/daily/tetris**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'tetris',today:'2026-11-20',month:'2026-11',days:[],mission,account:{nickname:'Jogador'},historyAvailable:true
 })}));
 await page.goto('/jogos/tetris/');
 await page.evaluate(()=>{
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'tetris',phase:'playing'}}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{
   game:'tetris',score:1500,durationMs:120000,linesCleared:10,clearSequence:[2,2,2,2,2]
  }}));
 });
 const side=page.locator('[data-daily-mission-sidebar] .daily-live-tracker');
 await expect(side.locator('.daily-live-progress')).toContainText('4 / 4');
 await expect(side).toContainText('Etapas excedidas');
 await expect(side.locator('.daily-live-sequence .done')).toHaveCount(4);
});

test('Missão Snake fica na coluna do jogo e preserva 7/7 após a vitória',async({page})=>{
 const mission={version:3,kind:'rush',metric:'score',target:70,timeLimitMs:65000,
  title:'Corrida contra o relógio',description:'Coma 7 frutas (70 pontos) em até 65 segundos, sem bater.'};
 await page.route('**/api/daily/snake**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
  game:'snake',today:'2026-11-20',month:'2026-11',days:[],mission,account:{nickname:'Jogador'},historyAvailable:true
 })}));
 await page.goto('/jogos/snake/');
 const slot=page.locator('#game-stage > [data-daily-mission-sidebar]');
 await expect(slot).toHaveCount(1);
 await expect(page.locator('.game-layout > aside [data-daily-mission-sidebar]')).toHaveCount(0);
 await page.evaluate(()=>{
  document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-start',{detail:{
   game:'snake',date:'2026-11-20',seed:733,mission:{version:3,kind:'rush',metric:'score',target:70,timeLimitMs:65000,title:'Corrida contra o relógio',description:'7 frutas em 65 segundos'}
  }}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-progress',{detail:{game:'snake',score:70,linesCleared:0,clearSequence:[],durationMs:17000}}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-phase',{detail:{game:'snake',phase:'finished'}}));
  document.dispatchEvent(new CustomEvent('oldarcade:daily-practice-result',{detail:{game:'snake',success:true}}));
 });
 await expect(slot).toBeVisible();
 await expect(slot.locator('.daily-live-progress')).toContainText('7 / 7');
});
