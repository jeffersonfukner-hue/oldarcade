import {expect,test} from '@playwright/test';
import packageData from '../package.json';
import {gameRegistry} from '../src/data/gameRegistry';

const portalVersion='v'+packageData.version+'-dev';
const games=[
 {slug:'snake',path:'/jogos/snake/'},
 {slug:'tetris',path:'/jogos/tetris/'},
 {slug:'pixel-quest',path:'/jogos/pixel-quest/'}
] as const;

test('SITE-03: uma versão de portal aparece no rodapé e no diário, sem simular publicação',async({page})=>{
 await page.goto('/sobre/');
 await expect(page.locator('[data-portal-version]')).toHaveText(portalVersion);
 await expect(page.locator('footer a.version')).toContainText(portalVersion);
 await expect(page.locator('#historico-versoes')).toContainText('não anúncios de lançamento');
 await expect(page.locator('#historico-versoes')).toContainText('v0.1.0');
 const links=page.locator('#historico-versoes details').first().locator('a[href^="https://github.com/jeffersonfukner-hue/oldarcade/commit/"]');
 await expect(links).toHaveCount(5);
 for(const game of games){
  await expect(page.locator('[data-portal-game-version="'+game.slug+'"]')).toContainText('v'+gameRegistry[game.slug].version);
 }
});
for(const game of games){
 test('SITE-03: versão própria e histórico do jogo '+game.slug,async({page})=>{
  await page.goto(game.path);
  const section=page.locator('[data-development-game="'+game.slug+'"]');
  await expect(section).toBeVisible();
  await expect(section.locator('.pill')).toHaveText('v'+gameRegistry[game.slug].version);
  await expect(section).toContainText('separado da história do jogo original');
  await expect(page.locator('footer a.version')).toContainText(portalVersion);
  await section.locator('details').last().evaluate(node=>{(node as HTMLDetailsElement).open=true});
  await expect(section).toContainText('v'+gameRegistry[game.slug].history[0].version);
  const refs=gameRegistry[game.slug].milestones.filter(entry=>'commit' in entry).length;
  await section.locator('details').first().evaluate(node=>{(node as HTMLDetailsElement).open=true});
  await expect(section.locator('a[href^="https://github.com/jeffersonfukner-hue/oldarcade/commit/"]')).toHaveCount(refs);
 });
}
test('SITE-03: versão e links de histórico permanecem acessíveis no mobile',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/sobre/');
 await expect(page.locator('[data-portal-version]')).toBeVisible();
 await expect(page.locator('footer a.version')).toBeVisible();
 await page.locator('footer a.version').click();
 await expect(page).toHaveURL(/\/sobre\/#historico-versoes$/);
 await expect(page.locator('#historico-versoes')).toBeVisible();
});
