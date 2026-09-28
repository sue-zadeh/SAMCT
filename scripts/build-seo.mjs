import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { loadEnv } from 'vite'
const environment = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const site = environment.VITE_SITE_URL?.replace(/\/$/, '')
const enabled = environment.VITE_ALLOW_INDEXING === 'true'
if ((enabled && !site) || (site && (new URL(site).protocol !== 'https:' || new URL(site).origin !== site))) throw new Error('VITE_SITE_URL must be the approved HTTPS origin, without a path, query, fragment or credentials.')
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const pages = [
  ['/', 'SAMCT Villages | Ngatea and Whitianga', 'Learn about South Auckland Masonic Charitable Trust villages in Ngatea and Whitianga, explore available homes and contact the SAMCT team.'],
  ['/about', 'About SAMCT | South Auckland Masonic Charitable Trust', 'Find out about South Auckland Masonic Charitable Trust and its village communities in Ngatea and Whitianga.'],
  ['/marketing', 'Available Village Homes | SAMCT Villages', 'Explore published village homes, photos and information for SAMCT communities in Ngatea and Whitianga.'],
  ['/contactUs', 'Contact SAMCT Villages', 'Contact the SAMCT team to ask about its villages, available homes and resident services.'],
]
const shell = await readFile('dist/index.html', 'utf8')
// The fallback shell stays noindex for private and unknown routes, even without JavaScript.
await writeFile('dist/portal.html', shell.replace(/<title>.*?<\/title>/, '<title>SAMCT Portal</title>'))
for (const [path, title, description] of pages) {
  let html = shell.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/name="description" content="[^"]*"/, `name="description" content="${escape(description)}"`)
    .replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${escape(title)}"`)
    .replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${escape(description)}"`)
    .replace(/name="robots" content="[^"]*"/, `name="robots" content="${enabled ? 'index, follow' : 'noindex, nofollow'}"`)
  if (site) {
    const canonical = `${site}${path}`
    html = html.replace('</head>', `  <link rel="canonical" href="${escape(canonical)}" />\n    <meta property="og:url" content="${escape(canonical)}" />\n  </head>`)
  }
  const directory = path === '/' ? 'dist' : `dist${path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, html)
}
const robots = enabled
  ? `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /uploads/\nDisallow: /reset-password/\nSitemap: ${site}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n'
await writeFile('dist/robots.txt', robots)
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${enabled ? pages.map(([path]) => `<url><loc>${escape(site + path)}</loc></url>`).join('') : ''}</urlset>\n`)
