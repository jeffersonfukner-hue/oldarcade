import {test,expect} from '@playwright/test';

// Contrato do lançamento: código preservado, nenhum convite público de Desafio Diário.
test('Desafio Diário fica ausente em Home, Snake, Tetris e Minha Conta',async({page})=>{
 for(const path of ['/','/jogos/snake/','/jogos/tetris/','/jogos/tetris/sprint/','/jogos/tetris/sobrevivencia/','/conta/']){
  await page.goto(path);
  await expect(page.locator('[data-daily-calendar], [data-daily-history], [data-home-daily]')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Conhecer o desafio/})).toHaveCount(0);
  await expect(page.getByText(/Quando houver (um novo )?Desafio Diário|Novo Desafio Diário disponível/)).toHaveCount(0);
 }
});

test('Home e páginas dos jogos não solicitam API diária enquanto recurso estiver oculto',async({page})=>{
 let calls=0;
 await page.route('**/api/daily/**',route=>{calls++;return route.abort()});
 for(const path of ['/','/jogos/snake/','/jogos/tetris/']){
  await page.goto(path);
  await expect(page.locator('[data-daily-calendar], [data-home-daily]')).toHaveCount(0);
 }
 expect(calls).toBe(0);
});
