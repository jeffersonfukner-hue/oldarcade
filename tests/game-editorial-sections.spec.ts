import {test,expect} from '@playwright/test';

const samples=[
 {name:'Snake Clássico',url:'/jogos/snake/',history:true,film:true,ranking:'live',game:'snake'},
 {name:'Snake Evolution',url:'/jogos/snake/evolution/',history:true,film:true,ranking:'live',game:'snake'},
 {name:'Snake Aventura',url:'/jogos/snake/aventura/',history:true,film:true,ranking:'live',game:'snake'},
 {name:'Tetris Clássico',url:'/jogos/tetris/',history:true,film:true,ranking:'live',game:'tetris'},
 {name:'Tetris Sprint',url:'/jogos/tetris/sprint/',history:true,film:true,ranking:'live',game:'tetris'},
 {name:'Tetris Sobrevivência',url:'/jogos/tetris/sobrevivencia/',history:true,film:true,ranking:'live',game:'tetris'},
 {name:'Pixel Quest',url:'/jogos/pixel-quest/',history:true,film:false,ranking:'unavailable',game:'pixel-quest'}
];
for(const sample of samples){
 test(`Página de ${sample.name} segue ordem editorial e links reais`,async({page})=>{
  await page.goto(sample.url);
  const wrapper=page.locator('[data-game-sections]');
  await expect(wrapper).toHaveCount(1);
  const sections=await wrapper.locator(':scope > section').evaluateAll(nodes=>nodes.map(node=>({
   ranking:node.matches('.mode-ranking,.oa-ranking-panel,.oa-ranking-unavailable'),
   share:node.classList.contains('game-share'),
   guide:node.classList.contains('oa-game-guide'),
   history:node.matches('.text-content:not(.oa-game-guide)'),
   screening:node.querySelector('h2')?.textContent?.includes('Filmes e documentários relacionados'),
   related:node.classList.contains('oa-related-games'),
   development:node.classList.contains('oa-development-history')
  })));
  const first=(key:keyof (typeof sections)[number])=>sections.findIndex(row=>row[key]);
  for(const key of ['ranking','share','guide','history','related','development'])expect(first(key),key).toBeGreaterThanOrEqual(0);
  expect(first('ranking')).toBeLessThan(first('share'));
  expect(first('share')).toBeLessThan(first('guide'));
  expect(first('guide')).toBeLessThan(first('history'));
  expect(first('history')).toBeLessThan(first('related'));
  expect(first('related')).toBeLessThan(first('development'));
  const foundFilm=sections.some(section=>section.screening===true);
  expect(foundFilm).toBe(sample.film);
  if(sample.film)expect(first('history')).toBeLessThan(first('screening'));
  if(sample.ranking==='unavailable'){
   await expect(wrapper.locator('[data-ranking-state=unavailable]')).toBeVisible();
   await expect(wrapper.getByText('ranking global ainda não foi lançado')).toBeVisible();
  }
  const related=wrapper.locator('[data-related-game]');
  await expect(related).toHaveCount(2);
  await expect(related.locator('a[href="#"]')).toHaveCount(0);
  const relatedSlugs=await related.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-related-game')));
  expect(relatedSlugs).not.toContain(sample.game);
 });
}

test('Parágrafos históricos e guia usam a largura interna do card sem limitar a 85ch',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 for(const url of ['/jogos/snake/','/jogos/tetris/','/jogos/pixel-quest/']){
  await page.goto(url);
  const {article,paragraph,maxWidth,scroll,viewport}=await page.locator('.oa-game-sections > .text-content').first().evaluate(section=>{
   const p=section.querySelector('p')!;
   return {article:section.getBoundingClientRect().width,paragraph:p.getBoundingClientRect().width,maxWidth:getComputedStyle(p).maxWidth,scroll:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  expect(article).toBeGreaterThan(900);
  expect(paragraph).toBeGreaterThan(840);
  expect(paragraph).toBeLessThan(article);
  expect(maxWidth).not.toBe('85ch');
  expect(scroll).toBeLessThanOrEqual(viewport+1);
 }
});
