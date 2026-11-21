import {test,expect} from '@playwright/test';

// A CI usa build sem PUBLIC_INDEXING_ENABLED. O Preview nunca pode ficar indexável
// acidentalmente, independentemente das páginas que abrem os jogos.
for(const path of ['/', '/jogos/snake/', '/jogos/tetris/', '/jogos/pixel-quest/', '/sobre/']){
  test(`SEO Preview bloqueado: ${path}`, async ({page})=>{
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex,nofollow');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/.+/);
  });
}

test('robots.txt de Preview bloqueia rastreio até liberar o domínio oficial',async({request})=>{
  const response=await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  const body=await response.text();
  expect(body).toContain('User-agent: *');
  expect(body).toContain('Disallow: /');
  expect(body).not.toContain('Allow: /');
  expect(body).not.toContain('Sitemap:');
});

test('Sitemap público não é produzido antes de SITE_URL e aceite explícito',async({request})=>{
  const response=await request.get('/sitemap-index.xml');
  expect(response.status()).toBe(404);
});
