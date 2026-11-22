import {expect,test} from '@playwright/test';

const examples=[
 {path:'/',labels:[],urls:[]},
 {path:'/jogos/snake/',labels:['Início','Jogos','Snake'],urls:['/','/#destaques']},
 {path:'/jogos/snake/aventura/',labels:['Início','Jogos','Snake','Aventura'],urls:['/','/#destaques','/jogos/snake/']},
 {path:'/jogos/snake/evolution/',labels:['Início','Jogos','Snake','Evolution'],urls:['/','/#destaques','/jogos/snake/']},
 {path:'/jogos/tetris/',labels:['Início','Jogos','Tetris'],urls:['/','/#destaques']},
 {path:'/jogos/tetris/sprint/',labels:['Início','Jogos','Tetris','Sprint'],urls:['/','/#destaques','/jogos/tetris/']},
 {path:'/jogos/tetris/sobrevivencia/',labels:['Início','Jogos','Tetris','Sobrevivência'],urls:['/','/#destaques','/jogos/tetris/']},
 {path:'/jogos/pixel-quest/',labels:['Início','Jogos','Pixel Quest'],urls:['/','/#destaques']},
 {path:'/rankings/',labels:['Início','Rankings'],urls:['/']},
 {path:'/conta/',labels:['Início','Minha conta'],urls:['/']},
 {path:'/sobre/',labels:['Início','Sobre'],urls:['/']},
 {path:'/contato/',labels:['Início','Contato'],urls:['/']},
 {path:'/privacidade/',labels:['Início','Privacidade'],urls:['/']}
];
for(const {path,labels,urls} of examples){
 test(`Breadcrumbs consistentes: ${path}`,async({page})=>{
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   await page.goto(path);
   const breadcrumb=page.locator('[data-breadcrumbs]');
   if(!labels.length){
    await expect(breadcrumb).toHaveCount(0);
    continue;
   }
   await expect(breadcrumb).toBeVisible();
   await expect(breadcrumb.locator('li')).toHaveCount(labels.length);
   expect(await breadcrumb.locator('li').allTextContents()).toEqual(labels);
   await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(labels[labels.length-1]);
   await expect(breadcrumb.locator('[aria-current="page"]')).not.toHaveAttribute('href',/./);
   expect(await breadcrumb.locator('a').evaluateAll(els=>els.map(el=>el.getAttribute('href')))).toEqual(urls);
   const rect=await breadcrumb.evaluate(el=>({left:el.getBoundingClientRect().left,width:el.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
   const expected=Math.min(980,width-(width<=580?24:40));
   expect(rect.width).toBeCloseTo(expected,0);
   expect(rect.left).toBeCloseTo((width-expected)/2,0);
   expect(rect.scroll).toBeLessThanOrEqual(rect.viewport+1);
  }
 });
}
test('BreadcrumbList acompanha a trilha visual somente em site com canonical real',async({page})=>{
 await page.goto('/jogos/snake/aventura/');
 const result=await page.evaluate(()=>{
  const schemas=Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map(node=>{try{return JSON.parse(node.textContent||'{}')}catch{return null}});
  const breadcrumb=schemas.find(item=>item?.['@type']==='BreadcrumbList');
  const canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  return {canonical,breadcrumb};
 });
 if(result.canonical){
  expect(result.breadcrumb?.itemListElement.map((entry:{name:string;item:string;position:number})=>entry.name))
   .toEqual(['Início','Jogos','Snake','Aventura']);
  expect(result.breadcrumb.itemListElement.at(-1).item).toBe(result.canonical);
  for(const entry of result.breadcrumb.itemListElement)expect(entry.item).toMatch(/^https:\/\//);
 }else expect(result.breadcrumb).toBeUndefined();
});
