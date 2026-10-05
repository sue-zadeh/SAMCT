import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { loadEnv } from 'vite'
import pages from '../client/security/public-pages.json' with { type: 'json' }
import { render, siteSchema } from '../.prerender/prerender.js'

const project = fileURLToPath(new URL('../', import.meta.url))
const environment = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const site = environment.VITE_SITE_URL?.replace(/\/$/, '')
const enabled = environment.VITE_ALLOW_INDEXING === 'true'
if ((enabled && !site) || (site && (new URL(site).protocol !== 'https:' || new URL(site).origin !== site))) throw new Error('VITE_SITE_URL must be the approved HTTPS origin, without a path, query, fragment or credentials.')
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const shell = await readFile('dist/index.html', 'utf8')
const manifest = JSON.parse(await readFile(resolve(project, 'dist/.vite/manifest.json'), 'utf8'))
await copyFile(resolve(project, 'client/assets/icon5.png'), 'dist/social-logo.png')
await writeFile('dist/portal.html', shell.replace(/<title>.*?<\/title>/, '<title>SAMCT Portal</title>'))
await writeFile('dist/404.html', shell.replace(/<title>.*?<\/title>/, '<title>Page not found | SAMCT</title>').replace('<div id="root"></div>', '<div id="root"><main><h1>Page not found</h1><p><a href="/">Return to SAMCT home</a></p></main></div>'))
for (const [path, { title, description }] of Object.entries(pages)) {
  let content = render(path)
  for (const [source, asset] of Object.entries(manifest)) {
    if (asset.file && !source.startsWith('_')) content = content.replaceAll(`/${source}`, `/${asset.file}`)
  }
  let html = shell.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/name="description" content="[^"]*"/, `name="description" content="${escape(description)}"`)
    .replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${escape(title)}"`)
    .replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${escape(description)}"`)
    .replace(/name="robots" content="[^"]*"/, `name="robots" content="${enabled ? 'index, follow' : 'noindex, nofollow'}"`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`)
  let metadata = `<meta name="twitter:title" content="${escape(title)}" /><meta name="twitter:description" content="${escape(description)}" />`
  if (site) {
    metadata += `<link rel="canonical" href="${escape(site + path)}" /><meta property="og:url" content="${escape(site + path)}" /><meta property="og:image" content="${escape(site)}/social-logo.png" /><meta property="og:image:alt" content="SAMCT Villages logo" /><meta name="twitter:image" content="${escape(site)}/social-logo.png" />`
    metadata += `<script id="samct-structured-data" type="application/ld+json">${JSON.stringify(siteSchema(site, path, title, description)).replaceAll('<', '\\u003c')}</script>`
  }
  html = html.replace('</head>', `${metadata}</head>`)
  const directory = path === '/' ? 'dist' : `dist${path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, html)
}
await writeFile('dist/robots.txt', enabled ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /uploads/\nSitemap: ${site}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n')
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${enabled ? Object.keys(pages).map(path => `<url><loc>${escape(site + path)}</loc></url>`).join('') : ''}</urlset>\n`)
