import {test,expect} from '@playwright/test';

test('SITE-08: a home leva à história do projeto, sem prometer história de todos os arcades',async({page})=>{
 await page.goto('/');
 const story=page.locator('.arcade-footer-links a[href="/sobre/#historia-oldarcade"]');
 await expect(story).toBeVisible();
 await expect(story).toContainText('História do OldArcade');
 await expect(story).not.toContainText('História do arcade');
 await story.click();
 await expect(page).toHaveURL(/\/sobre\/#historia-oldarcade$/);
 await expect(page.getByRole('heading',{name:'A história do OldArcade'})).toBeVisible();
 await expect(page.locator('#historia-oldarcade')).toContainText('Snake');
 await expect(page.locator('#historia-oldarcade')).toContainText('Tetris');
 await expect(page.locator('#historia-oldarcade')).toContainText('Pixel Quest');
 await expect(page.locator('#historia-oldarcade')).toContainText('não uma cronologia de todos os fliperamas');
 await expect(page.locator('#historico-versoes')).toBeVisible();
});

test('SITE-08: história, diário e links editoriais acessíveis no celular',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/sobre/#historia-oldarcade');
 const section=page.locator('#historia-oldarcade');
 await expect(section).toBeVisible();
 await expect(section.getByRole('heading',{name:'A história do OldArcade'})).toBeVisible();
 await section.getByRole('link',{name:'Ver o diário de bordo'}).click();
 await expect(page).toHaveURL(/\/sobre\/#historico-versoes$/);
 await expect(page.locator('[data-portal-version]')).toBeVisible();
});
