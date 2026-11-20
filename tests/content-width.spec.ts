import {test,expect} from '@playwright/test';

const pages=[
 {name:'home',path:'/'},
 {name:'Snake',path:'/jogos/snake/'},
 {name:'Tetris',path:'/jogos/tetris/'},
 {name:'Pixel Quest',path:'/jogos/pixel-quest/'},
 {name:'rankings',path:'/rankings/'},
 {name:'conta',path:'/conta/'}
];
for(const pageInfo of pages){
 test(`Largura global de 980px, alinhamento e ausência de rolagem horizontal: ${pageInfo.name}`,async({page})=>{
  for(const width of [1440,1024,390,320]){
   await page.setViewportSize({width,height:900});
   await page.goto(pageInfo.path);
   const layout=await page.evaluate(()=>{
    const rect=(selector:string)=>document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
    const header=rect('.site-header .shell');
    const content=rect('main .shell');
    const footer=rect('.site-footer .shell');
    return {header:{left:header.left,width:header.width},content:{left:content.left,width:content.width},footer:{left:footer.left,width:footer.width},scroll:document.documentElement.scrollWidth,viewport:innerWidth};
   });
   const expected=Math.min(980,width-(width<=580?24:40));
   for(const segment of [layout.header,layout.content,layout.footer]){
    expect(segment.width).toBeCloseTo(expected,0);
    expect(segment.left).toBeCloseTo((width-expected)/2,0);
   }
   expect(layout.scroll).toBeLessThanOrEqual(layout.viewport+1);
  }
 });
}

test('O limite de 980px da página não restringe o fullscreen do Pixel Quest',async({page,isMobile})=>{
 if(isMobile)test.skip();
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/jogos/pixel-quest/');
 await expect(page.locator('.oa-game-page')).toBeVisible();
 await page.locator('#pq-fullscreen').click();
 await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('pq-stage');
 const dimensions=await page.evaluate(()=>{
  const stage=document.querySelector('#pq-stage')!.getBoundingClientRect();
  const canvas=document.querySelector('#pq-canvas')!.getBoundingClientRect();
  return {stageWidth:stage.width,viewport:innerWidth,ratio:canvas.width/canvas.height};
 });
 expect(dimensions.stageWidth).toBeGreaterThan(980);
 expect(dimensions.stageWidth).toBeLessThanOrEqual(dimensions.viewport+1);
 expect(dimensions.ratio).toBeCloseTo(16/9,1);
});
