import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cp, copyFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { request } from 'node:https'
import { chromium } from '@playwright/test'

const directory = await mkdtemp(join(tmpdir(), 'samct-proxy-'))
const name = `samct-proxy-check-${process.pid}`
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options })
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message || result.stderr}`)
  return result.stdout.trim()
}
function get(port, path) {
  return new Promise((resolve_, reject) => {
    // This certificate is generated for the isolated loopback test container only.
    const req = request({ hostname: '127.0.0.1', port, path, rejectUnauthorized: false }, response => {
      let body = ''; response.on('data', part => { body += part }); response.on('end', () => resolve_({ status: response.statusCode, headers: response.headers, body }))
    })
    req.on('error', reject); req.setTimeout(10000, () => req.destroy(new Error('Proxy check timed out'))); req.end()
  })
}
let browser
try {
  await cp('dist', join(directory, 'dist'), { recursive: true })
  await copyFile('dist/portal.html', join(directory, 'dist/index.html'))
  run(process.execPath, [resolve('scripts/build-seo.mjs')], { cwd: directory, env: { ...process.env, VITE_SITE_URL: 'https://samct.example', VITE_ALLOW_INDEXING: 'true' } })
  run('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', join(directory, 'privkey.pem'), '-out', join(directory, 'fullchain.pem'), '-subj', '/CN=localhost', '-days', '1'])
  run('docker', ['run', '-d', '--name', name, '--add-host', 'server:127.0.0.1', '-p', '127.0.0.1::443', '-v', `${resolve('deploy/nginx.conf')}:/etc/nginx/conf.d/default.conf:ro`, '-v', `${join(directory, 'dist')}:/usr/share/nginx/html:ro`, '-v', `${directory}:/etc/nginx/tls:ro`, 'nginx:stable-alpine'])
  const port = Number(run('docker', ['port', name, '443/tcp']).split(':').at(-1))
  browser = await chromium.launch()
  const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true })
  const page = await context.newPage()
  for (const path of ['/', '/about', '/marketing', '/contactUs']) {
    const response = await page.goto(`https://127.0.0.1:${port}${path}`)
    assert.equal(response.status(), 200, path)
    assert.equal(new URL(page.url()).pathname, path, 'Public URL must not redirect in a loop')
    assert.equal(await page.locator('h1').count(), 1, path)
    assert.equal(await page.locator('h1').isVisible(), true, 'Content must be visible without JavaScript')
    assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'index, follow')
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), `https://samct.example${path}`)
    assert.match(await page.locator('footer').innerText(), /Sue Raisianzadeh.*suewebstudio/)
  }
  for (const [path, target] of [['/about/', '/about'], ['/marketing/', '/marketing'], ['/contactus', '/contactUs'], ['/contactUs/', '/contactUs']]) {
    const response = await get(port, path)
    assert.equal(response.status, 308); assert.equal(new URL(response.headers.location, 'https://localhost').pathname, target)
  }
  for (const path of ['/login', '/register', '/resident', '/admin', '/village-manager', '/account/security']) {
    const response = await get(port, path)
    assert.equal(response.status, 200); assert.match(response.body, /name="robots" content="noindex, nofollow"/)
    assert.doesNotMatch(response.body, /rel="canonical"|application\/ld\+json/)
    assert.equal(response.headers['x-content-type-options'], 'nosniff')
    assert.match(response.headers['content-security-policy'], /frame-ancestors 'none'/)
    assert.match(response.headers['strict-transport-security'], /max-age=/)
  }
  assert.equal((await get(port, '/this-page-does-not-exist')).status, 404)
  assert.equal((await get(port, '/social-logo.png')).status, 200)
  console.log('HTTPS proxy checks passed: public HTML without JavaScript, metadata, developer credit, redirects, private noindex, real 404s and security headers.')
} finally {
  if (browser) await browser.close()
  spawnSync('docker', ['rm', '-f', name], { stdio: 'ignore' })
  await rm(directory, { recursive: true, force: true })
}
