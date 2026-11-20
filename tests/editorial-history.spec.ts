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

test('Pixel Quest exibe linha do tempo resumida no mesmo padrão do Snake em desktop e mobile',async({page})=>{
 for(const width of [1280,320]){
  await page.setViewportSize({width,height:740});
  await page.goto('/jogos/pixel-quest/');
  const history=page.locator('#pq-platform-history').locator('..');
  await expect(history.getByRole('heading',{name:'Uma linha do tempo conectada ao mundo'})).toBeVisible();
  const timeline=history.locator('ol.timeline');
  await expect(timeline).toBeVisible();
  await expect(timeline.locator('li')).toHaveCount(4);
  for(const year of ['1980 ·','1981 ·','1985 ·','Novembro de 2026 ·']){
   await expect(timeline).toContainText(year);
  }
  await expect(timeline).toContainText('Pixel Quest');
  await expect(history.getByRole('heading',{name:'O que Pixel Quest faz de próprio'})).toBeVisible();
 }
 await page.goto('/jogos/snake/');
 const snakeHistory=page.locator('.oa-game-history');
 await expect(snakeHistory.locator('ol.timeline')).toBeVisible();
 await expect(snakeHistory).toContainText('Uma linha do tempo conectada ao mundo');
});

test('Padrão global: todos os jogos mostram artes editoriais originais, fontes e legendas no celular',async({page})=>{
 for(const game of games){
  await page.setViewportSize({width:320,height:700});
  await page.goto(game.path);
  const timeline=page.locator('.oa-game-sections .oa-illustrated-timeline');
  await expect(timeline).toHaveCount(1);
  const entries=timeline.locator(':scope > li');
  await expect(entries).toHaveCount(game.slug==='pixel-quest'?4:6);
  await expect(timeline.locator('svg[role="img"]')).toHaveCount(game.slug==='pixel-quest'?4:6);
  await expect(timeline.locator('figcaption')).toHaveCount(game.slug==='pixel-quest'?4:6);
  await expect(timeline.locator('.oa-era-source a')).toHaveCount(game.slug==='pixel-quest'?4:6);
  await expect(timeline).toContainText('Ilustração editorial original');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  expect(overflow).toBe(false);
 }
});
