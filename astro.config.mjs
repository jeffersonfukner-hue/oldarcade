import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Publicação para mecanismos de busca só com domínio definitivo e aceite explícito.
// Previews e builds normais continuam com noindex e robots bloqueado.
const rawSite = process.env.SITE_URL;
let publicSite = null;
try {
  if (rawSite) {
    const url = new URL(rawSite);
    if (url.protocol === 'https:' && !/^(localhost|.*\.pages\.dev|example\.invalid)$/i.test(url.hostname)) publicSite = url.origin;
  }
} catch { /* SITE_URL inválida não ativa indexação. */ }
const indexPublicSite = process.env.PUBLIC_INDEXING_ENABLED === 'true' && Boolean(publicSite);

export default defineConfig({
  site: publicSite || 'https://example.invalid',
  integrations: indexPublicSite ? [sitemap()] : [],
  output: 'static',
});
