import { test, expect } from '@playwright/test';

test('home oferece navegação e HTML pesquisável', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/OldArcade/);
  await expect(page.getByRole('heading', {name:/Os clássicos nunca/i})).toBeVisible();
  await expect(page.getByRole('link', {name:/Jogar Snake agora/})).toHaveAttribute('href','/jogos/snake/');
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
  await expect(page.locator('#game-overlay')).toBeHidden();
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

test('avisos de recorde atualizam no jogo e consulta live não altera pontuação',async({page})=>{
 await page.route('**/api/games/snake/leaderboard',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true,top:[{nickname:'Líder',score:40,rank:1,achievedAt:'2026-11-16T10:00:00.000Z'}],mine:null})}));
 await page.goto('/jogos/snake/');
 await expect(page.locator('#hud-global-best')).toHaveText('40');
 await expect(page.locator('#record-live-alert')).toBeHidden();
 await page.getByRole('button',{name:/Começar partida/}).click();
 await expect(page.locator('#game-overlay')).toBeHidden({timeout:5000});
 // Mudança simulada vinda do D1 em outra sessão: atualização do placar em partida ativa.
 await page.evaluate(()=>document.dispatchEvent(new CustomEvent('oldarcade:global-record',{detail:{score:90,previousScore:40,changed:true,source:'poll'}})));
 await expect(page.locator('#hud-global-best')).toHaveText('90');
 await expect(page.locator('#record-live-alert')).toContainText('Alguém assumiu a liderança');
});
