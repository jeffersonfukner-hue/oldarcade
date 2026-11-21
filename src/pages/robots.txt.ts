import type {APIRoute} from 'astro';

// Página estática gerada durante o build; nenhuma escrita em runtime.
export const prerender = true;

export const GET: APIRoute = () => {
  const base = import.meta.env.SITE_URL;
  let origin: string | null = null;
  try {
    if (base) {
      const url = new URL(base);
      if (url.protocol === 'https:' && !/^(localhost|.*\\.pages\\.dev|example\\.invalid)$/i.test(url.hostname)) {
        origin = url.origin;
      }
    }
  } catch { /* SITE_URL inválida não libera indexação. */ }

  const allowed = import.meta.env.PUBLIC_INDEXING_ENABLED === 'true' && Boolean(origin);
  const body = allowed
    ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap-index.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
