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
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#plays')).toHaveText('1');
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
  await page.getByRole('textbox', {name:/Apelido opcional/}).fill('Jogador teste');
  await page.getByRole('button', {name:'Salvar'}).click();
  await expect(page.locator('#nick-status')).toContainText('salvo');
  await page.reload();
  await expect(page.locator('#nickname')).toHaveValue('Jogador teste');
  await expect(page.getByRole('heading', {name:'Ranking local'})).toBeVisible();
  await expect(page.getByText('Rankings e contadores globais não estão habilitados.')).toBeVisible();
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
