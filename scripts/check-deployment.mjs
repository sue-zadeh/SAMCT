import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

// Azure App Service deploys the built React assets inside ASP.NET Core's wwwroot.
// This test validates the actual artifact instead of a retired Nginx container.
async function html(path) {
  return readFile(join('dist', path), 'utf8')
}
for (const route of ['/', '/about', '/marketing', '/contactUs']) {
  const path = route === '/' ? 'index.html' : route.slice(1) + '/index.html'
  const content = await html(path)
  assert.match(content, /<h1(?:\s|>)/i, route + ' must contain server-rendered content')
  assert.match(content, /<meta name="robots" content="(?:noindex, nofollow|index, follow)"/i,
    route + ' must have explicit robots metadata')
}
const portal = await html('portal.html')
assert.match(portal, /name="robots" content="noindex, nofollow"/)
assert.doesNotMatch(portal, /rel="canonical"|application\\/ld\\+json/)
const errorPage = await html('404.html')
assert.match(errorPage, /Page not found/)
const assets = await readdir('dist/assets')
assert.ok(assets.some(file => /\.js$/.test(file)), 'React JavaScript must be built')
assert.ok(assets.some(file => /\.css$/.test(file)), 'React stylesheets must be built')
await readFile('dist/robots.txt')
await readFile('dist/sitemap.xml')
console.log('Azure deploy artifact checks passed: public HTML, private noindex shell, 404 page, React assets and SEO outputs.')
