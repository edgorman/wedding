// The Cloudflare Worker in front of the static site. wrangler.jsonc runs it first for every
// request; whatever it doesn't answer itself goes to the static assets (dist/, `_headers` included)
// through the ASSETS binding. It is plain JavaScript that ships to Cloudflare as-is, deployed from
// the same commit as the bundle it fronts.
//
// It reads the config.json frontend-deploy writes next to the bundle for the site's canonical
// (production) URL, which is production's origin on every deployment, so it is also how a
// deployment tells whether it is production.

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const siteUrl = await readSiteUrl(env, url)
    const prod = !!siteUrl && url.hostname === new URL(siteUrl).hostname
    const response = await route(request, env, url, siteUrl || url.origin, prod)
    if (prod) return response
    // Staging (or a *.workers.dev address) serves the same bundle and the same _headers as
    // production, so this is the one place that can tell it apart and keep it out of search results.
    const marked = new Response(response.body, response)
    marked.headers.set('X-Robots-Tag', 'noindex')
    return marked
  },
}

async function route(request, env, url, siteUrl, prod) {
  if (url.pathname === '/robots.txt') {
    const body = prod
      ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n'
    return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  if (url.pathname === '/sitemap.xml') {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      `  <url><loc>${siteUrl}/</loc></url>`,
      '</urlset>',
      '',
    ].join('\n')
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    })
  }
  return env.ASSETS.fetch(request)
}

/** config.json's siteUrl without a trailing slash, or '' when this deployment has none. */
async function readSiteUrl(env, url) {
  try {
    const response = await env.ASSETS.fetch(new URL('/config.json', url))
    if (response.ok) {
      const { siteUrl } = await response.json()
      if (typeof siteUrl === 'string') return siteUrl.replace(/\/$/, '')
    }
  } catch {
    // Missing: the static assets answer the SPA shell instead, which isn't JSON.
  }
  return ''
}
