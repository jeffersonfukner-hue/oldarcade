import {test,expect} from '@playwright/test';

test('História do Tetris exibe filme, data fixa e correção nos três modos',async({page})=>{
 for(const path of ['/jogos/tetris/','/jogos/tetris/sprint/','/jogos/tetris/sobrevivencia/']){
  await page.goto(path);
  const section=page.locator('#historical-screenings-tetris');
  await expect(section).toHaveText('Filmes e documentários relacionados');
  await expect(section.getByText('Tetris (2023)')).toBeVisible();
  await expect(section.getByText(/Brasil · Apple TV/)).toBeVisible();
  await expect(section.locator('time[datetime="2026-11-17"]')).toHaveCount(2);
  await expect(section.getByRole('link',{name:/Consultar onde assistir a Tetris/})).toHaveAttribute('href',/tv\.apple\.com\/br\/movie\/tetris/);
  await expect(section.getByRole('link',{name:/Sugerir uma correção/})).toHaveAttribute('href',/jogo=tetris/);
 }
});

test('História do Snake diferencia documentário Nibbler da versão Nokia',async({page})=>{
 await page.goto('/jogos/snake/');
 const section=page.locator('#historical-screenings-snake');
 await expect(section.getByText(/Man vs Snake/).first()).toBeVisible();
 await expect(section.getByText(/não é um filme sobre a versão do Snake criada para os celulares Nokia/)).toBeVisible();
 await expect(section.getByText(/Filmzie ou Plex/)).toBeVisible();
 await expect(section.getByRole('link',{name:/Sugerir uma correção/})).toHaveAttribute('href',/jogo=snake/);
});

test('Link de sugestão abre contato preenchido sem enviar automaticamente',async({page})=>{
 await page.goto('/jogos/tetris/');
 const section=page.locator('#historical-screenings-tetris');
 await section.getByRole('link',{name:/Sugerir uma correção/}).click();
 await expect(page).toHaveURL(/\/contato\//);
 await expect(page.locator('#contact-subject')).toHaveValue('sugestao');
 await expect(page.locator('#contact-message')).toHaveValue(/Correção do artigo histórico — tetris/);
 await expect(page.locator('#contact-form button[type=submit]')).toBeVisible();
});
