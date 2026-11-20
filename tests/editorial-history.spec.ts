import {test,expect} from '@playwright/test';

const games=[
 {slug:'snake',path:'/jogos/snake/',historical:'De Blockade ao celular: a história de Snake',film:'Man vs Snake'},
 {slug:'tetris',path:'/jogos/tetris/',historical:'De um laboratório soviético ao mundo: a história do Tetris',film:'Tetris (2023)'},
 {slug:'pixel-quest',path:'/jogos/pixel-quest/',historical:'A história dos jogos de plataforma: antes da Trilha Esmeralda',film:'Super Mario Bros. O Filme'}
] as const;

for(const game of games){
 test('Etapa 4 editorial: fontes e cinema com contexto de '+game.slug,async({page})=>{
  await page.goto(game.path);
  const sections=page.locator('[data-game-sections]');
  await expect(sections).toContainText(game.historical);
  const cinema=page.getByRole('heading',{name:'Filmes e documentários relacionados'}).locator('..');
  await expect(cinema).toContainText(game.film);
  await expect(cinema).toContainText('20/11/2026');
  await expect(cinema).toContainText('não são afiliados');
  await expect(cinema.getByRole('link',{name:/Fonte da referência cultural/}).first()).toHaveAttribute('href',/^https:\/\//);
  await expect(cinema.getByRole('link',{name:/Consultar opções para assistir/}).first()).toHaveAttribute('href',/^https:\/\//);
  await expect(cinema.getByRole('link',{name:/Sugerir uma correção/})).toHaveAttribute('href',/\/contato\/\?assunto=sugestao/);
 });
}
test('Etapa 4 editorial: filmes de outras franquias nunca são atribuídos a Pixel Quest',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/jogos/pixel-quest/');
 const section=page.getByRole('heading',{name:'Filmes e documentários relacionados'}).locator('..');
 await expect(section).toContainText('Sonic: O Filme');
 await expect(section).toContainText('Não adapta Pixel Quest');
 await expect(section).toContainText('não confirmada nesta revisão');
 await expect(section.getByRole('link',{name:/Consultar opções para assistir/})).toHaveCount(2);
});
