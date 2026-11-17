import { test, expect } from '@playwright/test';

test('home oferece navegação e HTML pesquisável', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/OldArcade/);
  await expect(page.getByRole('heading', {name:/Chegou Tetris!/i})).toBeVisible();
  await expect(page.locator('#featured-game-link')).toHaveAttribute('href','/jogos/tetris/');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /jogue Snake/i);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
});

test('Snake inicia, pausa e retoma com contagem honesta', async ({page}) => {
  await page.goto('/jogos/snake/');
  await expect(page.getByRole('heading', {name:/Preparado para jogar/i})).toBeVisible();
  await expect(page.locator('#visits')).toHaveText('1');
  await expect(page.locator('#plays')).toHaveText('0');
  await page.getByRole('button', {name:/Começar partida/}).click();
  await expect(page.locator('#countdown-value')).toHaveText('3');
  await expect(page.locator('#start-btn')).toBeHidden();
  await expect(page.locator('#plays')).toHaveText('1');
  await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
  await page.getByRole('button', {name:'Pausar'}).click();
  await expect(page.getByRole('heading', {name:'Jogo pausado'})).toBeVisible();
  await page.getByRole('button', {name:/Continuar/}).last().click();
  await expect(page.locator('#countdown-value')).toHaveText('3');
  await expect(page.locator('#start-btn')).toBeHidden();
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
  await page.reload();
  await expect(page.locator('#plays')).toHaveText('1');
  await expect(page.locator('#visits')).toHaveText('1');
});

test('nickname é opcional, ranking não se anuncia como global', async ({page}) => {
  await page.goto('/jogos/snake/');
  await page.getByRole('textbox', {name:/Nickname para participar do ranking local/}).fill('Jogador teste');
  await page.getByRole('button', {name:'Salvar'}).click();
  await expect(page.locator('#nick-status')).toContainText('salvo');
  await page.reload();
  await expect(page.locator('#nickname')).toHaveValue('Jogador teste');
  await expect(page.getByRole('heading', {name:'Ranking local'})).toBeVisible();
  await expect(page.getByText(/O nickname e o ranking ficam salvos neste navegador/)).toBeVisible();
});

test('área jogável e controles são exibidos em desktop e celular', async ({page}) => {
  await page.goto('/jogos/snake/');
  await expect(page.locator('#snake-canvas')).toBeVisible();
  await expect(page.getByRole('button', {name:'Cima'})).toBeVisible();
  await expect(page.getByRole('button', {name:'Baixo'})).toBeVisible();
  await expect(page.locator('#fullscreen-btn')).toBeVisible();
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth, viewport:innerWidth}));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport+1);
});

test('botão amplia apenas o painel do Snake', async ({page}) => {
  await page.goto('/jogos/snake/');
  await page.locator('#fullscreen-btn').click();
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('game-stage');
  await page.locator('#fullscreen-btn').click();
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('');
});

test('HUD acompanha a pontuação e atalho F alterna tela cheia com 3 2 1', async ({page}) => {
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-score')).toHaveText('0');
 await expect(page.locator('#hud-best')).toHaveText('0');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await page.keyboard.press('f');
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('game-stage');
 await expect(page.locator('#countdown-value')).toHaveText('3');
 await expect(page.locator('#countdown-value')).toHaveText('2',{timeout:2500});
 await expect(page.locator('#countdown-value')).toHaveText('1',{timeout:2500});
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:2500});
 await page.keyboard.press('f');
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('');
 await expect(page.locator('#countdown-value')).toBeVisible();
});

test('ao sair da tela cheia o tabuleiro volta centralizado sem mouse', async ({page}) => {
 await page.goto('/jogos/snake/');
 await page.locator('#fullscreen-btn').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('game-stage');
 await page.locator('#fullscreen-btn').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id||'')).toBe('');
 await expect.poll(()=>page.evaluate(()=>{
  const r=document.querySelector('#game-screen')!.getBoundingClientRect();
  const boardCenter=r.top+r.height/2;
  const available=window.innerHeight;
  return Math.abs(boardCenter-available/2)<Math.max(35,(r.height-available)/2+35);
 })).toBe(true);
});

test('começar partida recentraliza o tabuleiro e aguarda countdown 3-2-1', async ({page}) => {
 await page.goto('/jogos/snake/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#overlay-text')).toHaveText('A partida começa em:');
 await expect(page.locator('#countdown-value')).toHaveText('3');
 await expect(page.locator('#start-btn')).toBeHidden();
 await expect.poll(()=>page.evaluate(()=>{
  const r=document.querySelector('#game-screen')!.getBoundingClientRect();
  return Math.abs((r.top+r.height/2)-window.innerHeight/2)<Math.max(35,(r.height-window.innerHeight)/2+35);
 })).toBe(true);
 await expect(page.locator('#countdown-value')).toHaveText('2',{timeout:2500});
 await expect(page.locator('#countdown-value')).toHaveText('1',{timeout:2500});
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:2500});
 await expect(page.locator('#hud-status')).toContainText('Jogando');
});

test('mobile: deslizar no tabuleiro controla direção e não permite zoom duplo',async ({page,isMobile})=>{
 test.skip(!isMobile,'gestos devem ser testados na viewport móvel');
 await page.goto('/jogos/snake/');
 await expect(page.locator('html')).toHaveCSS('touch-action','manipulation');
 await expect(page.locator('#game-screen')).toHaveCSS('touch-action','none');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.evaluate(()=>{
  const el=document.querySelector('#game-screen')!;
  const start=new Touch({identifier:1,target:el,clientX:130,clientY:180});
  const end=new Touch({identifier:1,target:el,clientX:130,clientY:100});
  el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[start],targetTouches:[start],changedTouches:[start]}));
  el.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[end],targetTouches:[end],changedTouches:[end]}));
  el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],targetTouches:[],changedTouches:[end]}));
 });
 await expect(page.locator('#hud-status')).toContainText('Jogando');
});

test('contadores globais indisponíveis não viram zeros inventados',async({page})=>{
 await page.route('**/api/games/snake/stats',r=>r.fulfill({status:503,contentType:'application/json',body:'{"available":false}'}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#global-visits')).toHaveText('—');
 await expect(page.locator('#global-stats-status')).toContainText('indisponíveis');
});
test('visita mantém ID ao atualizar e partida envia novo ID',async({page})=>{
 const events:{kind:'visit'|'play';eventId:string}[]=[];
 await page.route('**/api/games/snake/stats',async route=>{
  events.push(route.request().postDataJSON());
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,visits:1,plays:events.filter(e=>e.kind==='play').length})});
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#global-visits')).toHaveText('1');
 await page.reload();
 await expect(page.locator('#global-visits')).toHaveText('1');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#global-plays')).toHaveText('1');
 const seen=events.filter(e=>e.kind==='visit');
 expect(seen).toHaveLength(2);
 expect(seen[0].eventId).toBe(seen[1].eventId);
});


test('ranking local mostra somente jogadores com nickname e persiste apelido',async({page})=>{
 await page.addInitScript(()=>{
  if(sessionStorage.getItem('oldarcade:seeded-test'))return;
  sessionStorage.setItem('oldarcade:seeded-test','1');
  localStorage.setItem('oldarcade:snake:v1',JSON.stringify({
   best:60,plays:3,visits:1,nickname:'Jogador 12',
   scores:[
    {name:'Anônimo',score:60,at:1},
    {name:'',score:50,at:2},
    {name:'Jogador 12',score:40,at:3},
    {name:'Outro nick',score:30,at:4}
   ]
  }));
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#nickname')).toHaveValue('Jogador 12');
 await expect(page.locator('#rank-body tr')).toHaveCount(2);
 await expect(page.locator('#rank-body')).toContainText('Jogador 12');
 await expect(page.locator('#rank-body')).toContainText('Outro nick');
 await expect(page.locator('#rank-body')).not.toContainText('Anônimo');
 await page.locator('#nickname').fill('');
 await page.getByRole('button',{name:'Salvar'}).click();
 await expect(page.locator('#nick-status')).toContainText('sem nickname');
 await page.reload();
 await expect(page.locator('#nickname')).toHaveValue('');
 await expect(page.locator('#rank-body tr')).toHaveCount(2);
});

test('recorde global é exibido como desafio e ranking usa texto seguro',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',route=>route.fulfill({
  status:200,contentType:'application/json',
  body:JSON.stringify({available:true,top:[{nickname:'Campeão',score:90},{nickname:'<img src=x onerror=alert(1)>',score:30}],verified:false})
 }));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#global-best')).toHaveText('90');
 await expect(page.locator('#challenge-text')).toContainText('90 pontos');
 await expect(page.locator('#global-rank-body tr')).toHaveCount(2);
 await expect(page.locator('#global-rank-body')).toContainText('<img src=x');
 await expect(page.locator('#global-rank-body img')).toHaveCount(0);
});

test('página de conta mostra cadastro com e-mail opcional e não exige conta para jogar',async({page})=>{
 await page.goto('/conta/');
 await expect(page.getByRole('heading',{name:/Seu nickname, seus desafios/})).toBeVisible();
 await page.getByRole('button',{name:'Criar conta'}).click();
 await expect(page.locator('#register-email')).not.toHaveAttribute('required');
 await expect(page.locator('#register-password')).toHaveAttribute('minlength','8');
 await expect(page.locator('#account-register')).toBeVisible();
 await page.goto('/jogos/snake/');
 await expect(page.getByRole('button',{name:/Começar partida/})).toBeVisible();
});

test('recorde pessoal fica sincronizado entre HUD e lateral ao carregar dados locais',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('oldarcade:snake:v1',JSON.stringify({best:300,plays:1,visits:1,nickname:'',scores:[]}));
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-best')).toHaveText('300');
 await expect(page.locator('#best')).toHaveText('300');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#hud-best')).toHaveText('300');
 await expect(page.locator('#best')).toHaveText('300');
});
test('recorde de conta vindo do servidor aparece nos dois placares',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:300,rank:1,place:1,achievedAt:'2026-11-16T16:00:00.000Z'}],mine:{nickname:'Teste',score:280,rank:98,achievedAt:'2026-11-16T15:00:00.000Z'}})}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-best')).toHaveText('280');
 await expect(page.locator('#best')).toHaveText('280');
 await expect(page.locator('#my-global-position')).toHaveText('98º lugar');
});

test('cadastro dentro do Snake aceita nickname com espaços e senha de oito caracteres',async({page})=>{
 await page.goto('/jogos/snake/');
 await expect(page.locator('#record-register-nick')).toHaveAttribute('maxlength','18');
 await expect(page.locator('#record-register-pass')).toHaveAttribute('minlength','8');
 await page.evaluate(()=>{document.querySelector<HTMLElement>('#record-modal')!.hidden=false});
 await page.locator('#record-register-nick').fill('Vovo do 3D');
 await page.locator('#record-register-pass').fill('12345678');
 await expect(page.locator('#record-register-nick')).toHaveValue('Vovo do 3D');
 expect(await page.locator('#record-register-pass').evaluate((el:HTMLInputElement)=>el.checkValidity())).toBe(true);
});

test('HUD mostra recordes pessoal e global lado a lado',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:350,rank:1,achievedAt:'2026-11-16T10:00:00.000Z'}],mine:null})}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-global-best')).toHaveText('350');
 await expect(page.locator('#global-best')).toHaveText('350');
 await expect(page.locator('#historical-rank')).toHaveCount(0);
 await expect(page.locator('#score-float-layer')).toHaveCount(1);
});
test('recordes legados não aparecem no novo ranking',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#global-best')).toHaveText('—');
 await expect(page.locator('#hud-global-best')).toHaveText('—');
 await expect(page.locator('#historical-rank')).toHaveCount(0);
 await expect(page.locator('#challenge-text')).toContainText('primeiro a registrar');
});

test('modal de registro inicia no campo e não foca o título',async({page})=>{
 await page.goto('/jogos/snake/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#record-modal')).toBeVisible({timeout:8000});
 await expect(page.locator('#record-register-nick')).toBeFocused();
 await expect(page.locator('#record-modal-title')).not.toHaveAttribute('tabindex');
 await page.locator('#record-tab-login').click();
 await expect(page.locator('#record-login-nick')).toBeFocused();
 await page.locator('#record-tab-register').click();
 await expect(page.locator('#record-register-nick')).toBeFocused();
});

test('avisos de adversários aguardam o encerramento da partida',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:40,rank:1,achievedAt:'2026-11-16T10:00:00.000Z'}],mine:null})}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-global-best')).toHaveText('40');
 await expect(page.locator('#record-live-alert')).toBeHidden();
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 // Mudança simulada vinda do D1 em outra sessão: atualização do placar em partida ativa.
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:global-record',{detail:{score:90,previousScore:40,changed:true,source:'poll'}})));
 await expect(page.locator('#hud-global-best')).toHaveText('90');
 await expect(page.locator('#record-live-alert')).not.toContainText('Alguém assumiu a liderança');
});

test('limite da consulta live evita polling constante no plano gratuito',async({page})=>{
 let calls=0;
 await page.route('**/api/games/snake/leaderboard',route=>{
  calls++;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})});
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#global-rank-status')).toContainText('Empate: vence o menor tempo jogado');
 await expect.poll(()=>calls).toBe(1);
});

test('ranking consulta na entrada e ao fim, nunca durante a partida',async({page})=>{
 let calls=0;
 await page.route('**/api/games/snake/leaderboard',route=>{
  if(route.request().method()==='GET')calls++;
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null,serverNow:'2026-11-16T18:00:00.000Z'})});
 });
 await page.goto('/jogos/snake/');
 await expect.poll(()=>calls).toBe(1);
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.waitForTimeout(600);
 expect(calls).toBe(1);
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#record-modal')).toBeVisible({timeout:8000});
 await expect.poll(()=>calls).toBe(2);
});

test('resumo no fim destaca quem ultrapassou e há quanto tempo',async({page})=>{
 let calls=0;
 await page.route('**/api/games/snake/leaderboard',route=>{
  calls++;
  const first=calls===1;
  const data={available:true,mine:null,serverNow:'2026-11-16T18:00:00.000Z',top:[{nickname:first?'caboclo':'alonso',score:first?100:150,rank:1,achievedAt:first?'2026-11-16T17:00:00.000Z':'2026-11-16T17:59:30.000Z'}]};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-global-best')).toHaveText('100');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#record-modal')).toBeVisible({timeout:8000});
 await expect(page.locator('#record-end-summary')).toContainText('alonso assumiu a liderança com 150 pontos há 30 segundos');
 expect(calls).toBe(2);
});

test('animação do recorde pessoal é acionada ao superar marca positiva anterior',async({page})=>{
 await page.addInitScript(()=>{localStorage.setItem('oldarcade:snake:v1',JSON.stringify({best:5,plays:0,visits:0,nickname:'',scores:[],lastVisit:''}))});
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:100,rank:1,achievedAt:'2026-11-16T12:00:00.000Z'}],mine:null})}));
 await page.goto('/jogos/snake/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#hud-score')).toHaveText('10',{timeout:5000});
 await expect(page.locator('#hud-best')).toHaveText('10');
 await expect(page.locator('#game-celebration')).toContainText('NOVO RECORDE!');
 await expect(page.locator('#record-celebration-layer .record-spark.personal').first()).toBeAttached();
});
test('animação global é distinta e não solicita ranking extra',async({page})=>{
 let gets=0;
 await page.route('**/api/games/snake/leaderboard',r=>{
  if(r.request().method()==='GET')gets++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:5,rank:1,achievedAt:'2026-11-16T12:00:00.000Z'}],mine:null})});
 });
 await page.goto('/jogos/snake/');
 await expect.poll(()=>gets).toBe(1);
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#hud-score')).toHaveText('10',{timeout:5000});
 await expect(page.locator('#game-celebration')).toContainText('MARCA GLOBAL SUPERADA!');
 await expect(page.locator('#record-celebration-layer .record-spark.global').first()).toBeAttached();
 expect(gets).toBe(1);
});

test('placar mostra meta global provisória ao atingir pontuação e volta ao oficial no fim',async({page})=>{
 let gets=0;
 await page.route('**/api/games/snake/leaderboard',r=>{
  gets++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Alonso',score:5,rank:1,achievedAt:'2026-11-16T09:00:00.000Z'}],mine:null})});
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-global-best')).toHaveText('5');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#hud-score')).toHaveText('10',{timeout:5000});
 await expect(page.locator('#hud-global-label')).toContainText('provisório');
 await expect(page.locator('#hud-global-best')).toHaveText('10');
 await expect(page.locator('#global-best')).toHaveText('10');
 expect(gets).toBe(1);
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#record-modal')).toBeVisible({timeout:8000});
 await expect(page.locator('#hud-global-best')).toHaveText('5');
 await expect(page.locator('#hud-global-label')).not.toContainText('provisório');
});
test('erro de confirmação nunca mantém recorde provisório como oficial',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Rival',score:5,rank:1}],mine:null})}));
 await page.goto('/jogos/snake/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#hud-global-best')).toHaveText('10',{timeout:5000});
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#record-modal')).toBeVisible({timeout:8000});
 await expect(page.locator('#hud-global-best')).toHaveText('5');
});

test('hero apresenta jogos disponíveis, visitas e partidas sem indicador redundante',async({page})=>{
 let posts=0;
 await page.route('**/api/site/stats',r=>{
  if(r.request().method()==='POST')posts++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,siteVisits:1523,gamesPlayed:1,totalPlays:4599})});
 });
 await page.goto('/');
 await expect(page.locator('#hero-published-games')).toHaveText('2');
 await expect(page.locator('#hero-site-visits')).toHaveText('1.523');
 await expect(page.locator('#hero-games-played')).toHaveCount(0);
 await expect(page.locator('#hero-total-plays')).toHaveText('4.599');
 expect(posts).toBe(1);
 await page.reload();
 await expect(page.locator('#hero-site-visits')).toHaveText('1.523');
 expect(posts).toBe(1);
});
test('contador indisponível exibe traços e não dados fictícios',async({page})=>{
 await page.route('**/api/site/stats',r=>r.fulfill({status:503,contentType:'application/json',body:'{"available":false}'}));
 await page.goto('/');
 await expect(page.locator('#hero-site-visits')).toHaveText('—');
 await expect(page.locator('#hero-total-plays')).toHaveText('—');
 await expect(page.locator('.arcade-activity-item')).toHaveCount(3);
 await expect(page.locator('#hero-stats-status')).toHaveCount(0);
});
test('versões de desenvolvimento do portal e Snake foram atualizadas separadamente',async({page})=>{
 await page.goto('/');
 await expect(page.locator('footer .version')).toContainText('v0.2.0-dev');
 await page.goto('/jogos/snake/');
 await expect(page.locator('#dev-history-title')).toBeVisible();
 await expect(page.getByText('v0.2.0-dev').first()).toBeVisible();
});

test('conta conectada mostra recordes dos jogos sem consulta extra',async({page})=>{
 let gets=0;
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Vovo do 3D'}})}));
 await page.route('**/api/games/snake/leaderboard',r=>{
  if(r.request().method()==='GET')gets++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:{nickname:'Vovo do 3D',score:90,rank:1},myGames:[{game:'snake',score:90}]})});
 });
 await page.goto('/jogos/snake/');
 await expect(page.locator('#results-heading')).toHaveText('Meus recordes por jogo');
 await expect(page.locator('#account-results')).toBeVisible();
 await expect(page.locator('#local-results')).toBeHidden();
 await expect(page.locator('[data-player-game="snake"] [data-record-score]')).toHaveText('90 pontos');
 await expect(page.locator('[data-player-game="snake"] [data-record-action]')).toHaveText('Superar meu recorde');
 expect(gets).toBe(1);
});
test('sem login preserva ranking local no navegador',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:'{"available":true,"top":[],"mine":null,"myGames":[]}'}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#results-heading')).toHaveText('Ranking local');
 await expect(page.locator('#local-results')).toBeVisible();
 await expect(page.locator('#account-results')).toBeHidden();
});

test('tecla Espaço para retomar também apresenta 3–2–1 e evita avanço imediato',async({page})=>{
 await page.goto('/jogos/snake/');
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('Space');
 await expect(page.getByRole('heading',{name:'Jogo pausado'})).toBeVisible();
 const before=await page.locator('#hud-score').textContent();
 await page.keyboard.press('Space');
 await expect(page.locator('#countdown-value')).toHaveText('3');
 await expect(page.locator('#game-overlay')).toBeVisible();
 await expect(page.locator('#hud-score')).toHaveText(before||'0');
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
});

test('compartilhamento de Snake abre redes sem login nem novas consultas de ranking',async({page})=>{
 let leaderboardGets=0;
 await page.route('**/api/games/snake/leaderboard',r=>{
  leaderboardGets++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null})});
 });
 await page.goto('/jogos/snake/');
 await expect.poll(()=>leaderboardGets).toBe(1);
 const share=page.locator('[data-game-share]');
 await expect(share.getByRole('heading',{name:/Quem consegue superar seu resultado/})).toBeVisible();
 const whatsapp=new URL(await share.locator('[data-share-network="whatsapp"]').getAttribute('href')||'');
 expect(whatsapp.hostname).toBe('wa.me');
 expect(whatsapp.searchParams.get('text')).toContain('/jogos/snake/');
 const telegram=new URL(await share.locator('[data-share-network="telegram"]').getAttribute('href')||'');
 expect(telegram.hostname).toBe('t.me');
 expect(telegram.searchParams.get('url')).toContain('/jogos/snake/');
 const facebook=new URL(await share.locator('[data-share-network="facebook"]').getAttribute('href')||'');
 expect(facebook.searchParams.get('u')).toContain('/jogos/snake/');
 expect(leaderboardGets).toBe(1);
});
test('compartilhamento adiciona placar real somente depois da partida',async({page})=>{
 await page.goto('/jogos/snake/');
 await expect(page.locator('[data-share-message]')).toContainText('Compartilhe');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'snake',score:170}})));
 await expect(page.locator('[data-share-message]')).toContainText('Fiz 170 pontos');
 const whatsapp=new URL(await page.locator('[data-share-network="whatsapp"]').getAttribute('href')||'');
 expect(whatsapp.searchParams.get('text')).toContain('170 pontos');
 const facebook=new URL(await page.locator('[data-share-network="facebook"]').getAttribute('href')||'');
 expect(facebook.searchParams.get('text')).toBeNull();
 expect(facebook.searchParams.get('u')).toContain('/jogos/snake/');
});

test('modo Aventura tem níveis e recordes locais separados do Clássico',async({page})=>{
 let rankCalls=0;
 await page.route('**/api/games/snake/leaderboard',r=>{rankCalls++;return r.fulfill({status:200,contentType:'application/json',body:'{"available":true,"top":[],"mine":null}'})});
 await page.goto('/jogos/snake/aventura/');
 await expect(page).toHaveTitle(/Snake Aventura/);
 await expect(page.locator('#adventure-level')).toHaveText('1');
 await expect(page.locator('#adventure-stage')).toHaveAttribute('data-barrier-count','0');
 await expect(page.locator('#adventure-mission')).toContainText('Colete 5 maçãs');
 await expect(page.locator('#adventure-score')).toHaveText('0');
 await expect(page.locator('#adventure-highest')).toHaveText('1');
 expect(rankCalls).toBe(0);
 await page.getByRole('button',{name:/Começar Aventura/}).click();
 await expect(page.locator('#adventure-countdown')).toHaveText('3');
 await expect(page.locator('#adventure-start')).toBeHidden();
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#adventure-score')).toHaveText('10',{timeout:5000});
 await expect(page.locator('#adventure-best')).toHaveText('10');
 await page.getByRole('button',{name:'Pausar'}).click();
 await expect(page.locator('#adventure-overlay-title')).toHaveText('Jogo pausado');
 await page.locator('#adventure-start').click();
 await expect(page.locator('#adventure-countdown')).toHaveText('3');
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-score')).toHaveText('0');
 expect(rankCalls).toBe(1);
});
test('Aventura compartilha link próprio sem afirmar recorde global',async({page})=>{
 await page.goto('/jogos/snake/aventura/');
 const share=page.locator('[data-game-share]');
 const whatsapp=new URL(await share.locator('[data-share-network="whatsapp"]').getAttribute('href')||'');
 expect(whatsapp.searchParams.get('text')).toContain('/jogos/snake/aventura/');
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game:'snake-adventure',score:60}})));
 await expect(share.locator('[data-share-message]')).toContainText('Fiz 60 pontos');
});

test('ranking do Aventura mostra Top 10 independente do clássico e posição pessoal',async({page})=>{
 let classicCalls=0,adventureCalls=0;
 await page.route('**/api/games/snake/leaderboard',r=>{classicCalls++;return r.fulfill({status:200,contentType:'application/json',body:'{"available":true,"top":[]}'})});
 await page.route('**/api/games/snake-adventure/leaderboard',r=>{
  adventureCalls++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Alonso',score:280,rank:1,achievedAt:'2026-11-16T15:00:00Z'},{nickname:'Vovo do 3D',score:220,rank:2}],mine:{nickname:'Vovo do 3D',score:220,rank:2}})});
 });
 await page.goto('/jogos/snake/aventura/');
 await expect(page.locator('[data-rank-body]')).toContainText('Alonso');
 await expect(page.locator('[data-rank-body]')).toContainText('Vovo do 3D');
 await expect(page.locator('[data-rank-global]')).toHaveText('280');
 await expect(page.locator('[data-rank-personal]')).toHaveText('220');
 await expect(page.locator('[data-rank-mine]')).toContainText('2º');
 expect(classicCalls).toBe(0);expect(adventureCalls).toBe(1);
});
test('Aventura conserva recorde provisório e não consulta ranking durante travessia livre',async({page})=>{
 let gets=0;
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:'{"player":null}'}));
 await page.route('**/api/games/snake-adventure/leaderboard',r=>{
  if(r.request().method()==='GET')gets++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Rival',score:5,rank:1}],mine:null})});
 });
 await page.goto('/jogos/snake/aventura/');
 await expect(page.locator('[data-rank-global]')).toHaveText('5');
 await page.getByRole('button',{name:/Começar Aventura/}).click();
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 await expect(page.locator('#adventure-score')).toHaveText('10',{timeout:5000});
 await expect(page.locator('[data-rank-provisional]')).toBeVisible();
 await expect(page.locator('[data-rank-global]')).toHaveText('10');
 expect(gets).toBe(1);
 await page.keyboard.press('ArrowUp');
 await page.waitForTimeout(3600);
 await expect(page.locator('#adventure-overlay')).toBeHidden();
 await expect(page.locator('#adventure-status')).toContainText('Jogando');
 expect(gets).toBe(1);
 await expect(page.locator('[data-rank-global]')).toHaveText('10');
});

test('Aventura centraliza tabuleiro ao iniciar e ao sair da tela cheia',async({page})=>{
 await page.setViewportSize({width:390,height:720});
 await page.goto('/jogos/snake/aventura/');
 await page.getByRole('button',{name:/Começar Aventura/}).click();
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 const position=await page.locator('#adventure-screen').evaluate(el=>{
  const r=el.getBoundingClientRect();return r.top+r.height/2;
 });
 expect(Math.abs(position-360)).toBeLessThan(220);
 await page.locator('#adventure-fullscreen').click();
 await expect(page.locator('#adventure-countdown')).toHaveText('3',{timeout:5000});
 await page.locator('#adventure-fullscreen').click();
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 const restored=await page.locator('#adventure-screen').evaluate(el=>{
  const r=el.getBoundingClientRect();return r.top+r.height/2;
 });
 expect(Math.abs(restored-360)).toBeLessThan(220);
});

test('home estilo foco no jogador mantém jogos visíveis e três contadores compactos',async({page})=>{
 await page.setViewportSize({width:1280,height:800});
 await page.goto('/');
 await expect(page.locator('.arcade-sidebar')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Escolha seu desafio'})).toBeVisible();
 await expect(page.getByRole('link',{name:/Jogar Clássico/})).toHaveAttribute('href','/jogos/snake/');
 await expect(page.getByRole('link',{name:/Jogar Aventura/})).toHaveAttribute('href','/jogos/snake/aventura/');
 await expect(page.locator('.arcade-activity-item')).toHaveCount(3);
 await expect(page.locator('#hero-games-played')).toHaveCount(0);
 const top=await page.locator('.arcade-mode-grid').evaluate(el=>el.getBoundingClientRect().top);
 expect(top).toBeLessThan(800);
 await expect(page.locator('.arcade-side-nav a[href="/conta/"]')).toBeVisible();
});
test('home dashboard celular não causa rolagem horizontal e oferece acesso aos modos',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.arcade-side-nav')).toBeVisible();
 await expect(page.locator('.arcade-mode-grid')).toBeVisible();
 await expect(page.locator('#hero-site-visits')).toBeVisible();
 const dims=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth}));
 expect(dims.doc).toBeLessThanOrEqual(dims.viewport+1);
});

test('rankings reúne Top 3 e Top 10 distintos e desafia o líder real',async({page})=>{
 const calls:{classic:number;adventure:number}={classic:0,adventure:0};
 await page.route('**/api/games/snake/leaderboard',r=>{
  calls.classic++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Lider',score:320,rank:1,achievedAt:'2026-11-15T16:00:00Z'},{nickname:'Segundo',score:210,rank:2}]})});
 });
 await page.route('**/api/games/snake-adventure/leaderboard',r=>{
  calls.adventure++;
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Outra pessoa',score:480,rank:1}]})});
 });
 await page.goto('/rankings/');
 await expect(page).toHaveTitle(/Rankings OldArcade/);
 const classic=page.locator('[data-rank-page-mode="snake"]');
 const adventure=page.locator('[data-rank-page-mode="snake-adventure"]');
 await expect(classic.locator('[data-rank-leader-name]')).toHaveText('Lider');
 await expect(classic.locator('[data-rank-leader-score]')).toHaveText('320 pontos');
 await expect(classic.locator('.rankings-podium-card')).toHaveCount(2);
 await expect(classic.locator('[data-rank-challenge]')).toHaveAttribute('href','/jogos/snake/');
 await classic.locator('.rankings-top10 summary').click();
 await expect(classic.locator('[data-rank-table]')).toContainText('Segundo');
 await expect(adventure.locator('[data-rank-leader-name]')).toHaveText('Outra pessoa');
 await expect(adventure.locator('[data-rank-leader-score]')).toHaveText('480 pontos');
 await expect(adventure.locator('[data-rank-challenge]')).toHaveAttribute('href','/jogos/snake/aventura/');
 expect(calls).toEqual({classic:1,adventure:1});
});
test('rankings sem dados não inventa Top 3 nem pontuação',async({page})=>{
 await page.route('**/api/games/**/leaderboard',r=>r.fulfill({status:503,contentType:'application/json',body:'{"available":false}'}));
 await page.goto('/rankings/');
 await expect(page.locator('[data-rank-page-mode="snake"] [data-rank-status]')).toContainText('indisponível');
 await expect(page.locator('[data-rank-page-mode="snake"] [data-rank-leader-score]')).toHaveText('—');
 await expect(page.locator('.rankings-podium-card')).toHaveCount(0);
});
test('nickname conectado aparece no header e sidebar, saindo da conta reverte',async({page})=>{
 let connected=false;
 await page.route('**/api/auth/me',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:connected?{nickname:'Vovo do 3D'}:null})}));
 await page.route('**/api/auth/login',r=>{connected=true;return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({player:{nickname:'Vovo do 3D'}})})});
 await page.route('**/api/auth/logout',r=>{connected=false;return r.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'})});
 await page.goto('/');
 await expect(page.locator('.site-header [data-player-name]')).toHaveText('Minha conta');
 await page.goto('/conta/');
 await page.locator('#login-nick').fill('Vovo do 3D');
 await page.locator('#login-password').fill('senha-teste');
 await page.locator('#account-login button[type=submit]').click();
 await expect(page.locator('#account-message')).toContainText('Bem-vindo de volta!');
 await expect(page.locator('.site-header [data-player-name]')).toHaveText('Vovo do 3D');
 await page.goto('/');
 await expect(page.locator('.arcade-side-nav [data-player-name]')).toHaveText('Vovo do 3D');
 await expect(page.locator('.site-header [data-player-name]')).toHaveText('Vovo do 3D');
 await page.goto('/conta/');
 await page.locator('#account-logout').click();
 await expect(page.locator('.site-header [data-player-name]')).toHaveText('Minha conta');
 await page.goto('/');
 await expect(page.locator('.arcade-side-nav [data-player-name]')).toHaveText('Minha conta');
});
test('atalho único Rankings da home e navegação da página sem scroll horizontal',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.arcade-side-nav a[href="/rankings/"]')).toHaveCount(1);
 await expect(page.locator('.arcade-side-nav a[href*="#global-rank"]')).toHaveCount(0);
 await page.locator('.arcade-side-nav a[href="/rankings/"]').click();
 await expect(page).toHaveURL(/\/rankings\/$/);
 const size=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,screen:innerWidth}));
 expect(size.doc).toBeLessThanOrEqual(size.screen+1);
});

test('Aventura: Espaço controla pausa e retomada sem rolar página nem perder a partida ao cruzar borda livre',async({page})=>{
 await page.goto('/jogos/snake/aventura/');
 await page.keyboard.press('Space');
 await expect(page.locator('#adventure-countdown')).toHaveText('3');
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('Space');
 await expect(page.locator('#adventure-overlay-title')).toHaveText('Jogo pausado');
 await page.keyboard.press('Space');
 await expect(page.locator('#adventure-countdown')).toHaveText('3');
 await expect(page.locator('#adventure-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('ArrowUp');
 await page.waitForTimeout(3600);
 await expect(page.locator('#adventure-overlay')).toBeHidden();
 await page.evaluate(()=>{
  document.activeElement instanceof HTMLElement&&document.activeElement.blur();
  document.addEventListener('keydown',event=>{
   if(event.code==='Space')requestAnimationFrame(()=>{document.body.dataset.spaceDefaultPrevented=String(event.defaultPrevented)});
  },{once:true});
 });
 await page.keyboard.press('Space');
 await expect(page.locator('body')).toHaveAttribute('data-space-default-prevented','true');
 await expect(page.locator('#adventure-overlay-title')).toHaveText('Jogo pausado');
 await page.keyboard.press('Space');
 await expect(page.locator('#adventure-countdown')).toHaveText('3');
});

test('Clássico: Espaço reinicia após fim sem rolar página',async({page})=>{
 await page.goto('/jogos/snake/');
 await page.keyboard.press('Space');
 await expect(page.locator('#countdown-value')).toHaveText('3');
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 await page.keyboard.press('ArrowUp');
 await expect(page.locator('#game-overlay')).toBeVisible({timeout:9000});
 await expect(page.locator('#hud-status')).toContainText('Fim');
 // Sem conta, o Clássico abre o modal de cadastro ao terminar; Espaço não deve atravessar esse modal.
 const recordModal=page.locator('#record-modal');
 await expect(recordModal).toBeVisible({timeout:5000});
 await page.locator('#record-skip').click();
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.activeElement instanceof HTMLElement&&document.activeElement.blur();window.scrollTo(0,0)});
 const beforeScroll=await page.evaluate(()=>window.scrollY);
 await page.keyboard.press('Space');
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(beforeScroll);
 await expect(page.locator('#countdown-value')).toHaveText('3');
});

test('Evolution tem rota própria, ranking isolado e integração de partida',async({page})=>{
 const calls:string[]=[];
 await page.route('**/api/games/*/leaderboard',async route=>{
  calls.push(new URL(route.request().url()).pathname);
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[],mine:null,myGames:[]})});
 });
 await page.route('**/api/games/snake-evolution/stats',async route=>{
  calls.push(new URL(route.request().url()).pathname+':'+route.request().method());
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,visits:1,plays:1})});
 });
 await page.goto('/jogos/snake/evolution/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Evolution');
 await expect(page.locator('#global-rank-title')).toContainText('Evolution');
 await expect(page.locator('[data-game-share]')).toHaveAttribute('data-game-path','/jogos/snake/evolution/');
 await expect.poll(()=>calls.some(x=>x==='/api/games/snake-evolution/leaderboard')).toBe(true);
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#plays')).toHaveText('1');
 await expect.poll(()=>calls.filter(x=>x==='/api/games/snake-evolution/stats:POST').length).toBe(2);
 expect(calls).not.toContain('/api/games/snake/leaderboard');
});

test('Clássico mantém acesso explícito ao Evolution',async({page})=>{
 await page.goto('/jogos/snake/');
 await expect(page.getByRole('link',{name:/Jogar Evolution/})).toHaveAttribute('href','/jogos/snake/evolution/');
});
