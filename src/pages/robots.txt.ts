import type {APIRoute} from 'astro';

// Gerado no build. Sem credencial de lançamento, Preview permanece bloqueado.
export const prerender = true;

export const GET: APIRoute = ({site}) => {
  const allowed = import.meta.env.PUBLIC_INDEXING_ENABLED === 'true'
    && Boolean(site && site.protocol === 'https:' && site.hostname !== 'example.invalid');
  const body = allowed
    ? `User-agent: *\nAllow: /\nSitemap: ${site!.origin}/sitemap-index.xml\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
