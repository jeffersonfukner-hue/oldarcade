import {test,expect} from '@playwright/test';

test('páginas institucionais SITE-01 explicam os recursos existentes',async({page})=>{
 await page.goto('/privacidade/');
 await expect(page.getByRole('heading',{name:'Política de Privacidade'})).toBeVisible();
 await expect(page.getByText('Cloudflare',{exact:false}).first()).toBeVisible();
 await expect(page.locator('main')).toContainText('oldarcade_session');
 await expect(page.locator('main')).toContainText('não remove');
 await expect(page.locator('main')).toContainText('não há, nesta versão');
 await expect(page.locator('footer a[href="/termos/"]')).toBeVisible();
 await page.locator('footer a[href="/termos/"]').click();
 await expect(page).toHaveURL(/\/termos\/$/);
 await expect(page.getByRole('heading',{name:'Termos de Uso'})).toBeVisible();
 await expect(page.locator('main')).toContainText('rankings');
 await expect(page.locator('main')).toContainText('ainda não');
 await page.goto('/sobre/');
 await expect(page.locator('main')).toContainText('Cloudflare D1');
 await expect(page.locator('main a[href="/privacidade/"]')).toBeVisible();
});
test('contato não promete redefinição por e-mail e não exige endereço para suporte',async({page})=>{
 await page.goto('/contato/');
 await page.locator('#contact-subject').selectOption('recuperacao');
 await expect(page.locator('#recovery-info')).toBeVisible();
 await expect(page.locator('#recovery-info')).toContainText('não há redefinição automática');
 await expect(page.locator('#contact-email')).not.toHaveAttribute('required');
 await page.locator('#contact-subject').selectOption('privacidade');
 await expect(page.locator('#recovery-info')).toBeHidden();
 await expect(page.locator('#contact-subject')).toHaveValue('privacidade');
});
test('navegação legal funciona em tela estreita',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/termos/');
 await expect(page.getByRole('heading',{name:'Termos de Uso'})).toBeVisible();
 const widths=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:window.innerWidth}));
 expect(widths.document).toBeLessThanOrEqual(widths.viewport+1);
 await page.locator('main a[href="/privacidade/"]').click();
 await expect(page.getByRole('heading',{name:'Política de Privacidade'})).toBeVisible();
});
