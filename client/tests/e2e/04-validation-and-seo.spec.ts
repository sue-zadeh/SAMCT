import { test, expect } from '@playwright/test'
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { state, write } from './helpers'

test('API responses have security headers and prevent private response caching', async ({ request }) => {
  const response = await request.get('/api/csrf')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['x-frame-options']).toBe('DENY')
  expect(response.headers()['cache-control'].split(',').map(value => value.trim())).toContain('no-store')
  expect(response.headers()['referrer-policy']).toBe('no-referrer')
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(response.headers()['x-robots-tag']).toContain('noindex')
})
test('an untrusted origin does not receive credentialed CORS access', async ({ request }) => {
  const response = await request.fetch('/api/csrf',{method:'OPTIONS',headers:{Origin:'https://untrusted.example','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'X-CSRF-TOKEN'}})
  expect(response.headers()['access-control-allow-origin']).toBeUndefined()
  expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
})
test('contact validates length and email on the server, even when browser validation is bypassed', async ({ request }) => {
  const data = {fullName:'Test',email:'test@example.test',phone:'0211234567',subject:'Test',message:'Test message'}
  expect((await write(request,'POST','/api/contact',{data:{...data,email:'invalid'}})).status()).toBe(400)
  expect((await write(request,'POST','/api/contact',{data:{...data,message:'a'.repeat(1501)}})).status()).toBe(400)
  expect((await write(request,'POST','/api/contact',{data:{...data,subject:'Injected\r\nBcc: other@example.test'}})).status()).toBe(400)
  expect((await write(request,'POST','/api/contact',{data:{...data,website:'spam.example'}})).status()).toBe(200)
})
test('public pages have distinct titles, author metadata, and demo noindex', async ({ page }) => {
  for (const [path,title] of [['/','SAMCT Villages | Ngatea and Whitianga'],['/about','About SAMCT | South Auckland Masonic Charitable Trust'],['/marketing','Available Village Homes | SAMCT Villages'],['/contactUs','Contact SAMCT Villages']]) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('meta[name="author"]')).toHaveAttribute('content','Sue Raisianzadeh | Freelance Web Developer | suewebstudio')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow')
  }
})
test('private pages remain noindex after navigation from a public page', async ({ browser }) => {
  const context = await browser.newContext({baseURL:'http://127.0.0.1:5173',storageState:state('resident')})
  const page = await context.newPage()
  await page.goto('/resident')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await context.close()
})
test('built fallback HTML never allows portal indexing', async () => {
  expect(await readFile('dist/portal.html','utf8')).toContain('name="robots" content="noindex, nofollow"')
})

test('production SEO indexes only public pages and keeps the private fallback noindex', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'samct-seo-'))
  try {
    await mkdir(join(directory, 'dist'))
    await copyFile('dist/portal.html', join(directory, 'dist/index.html'))
    await promisify(execFile)(process.execPath, [resolve('scripts/build-seo.mjs')], {
      cwd: directory, env: {...process.env, VITE_SITE_URL:'https://samct.example', VITE_ALLOW_INDEXING:'true'},
    })
    for (const path of ['', '/about', '/marketing', '/contactUs']) {
      const html = await readFile(join(directory, `dist${path}/index.html`), 'utf8')
      expect(html).toContain('name="robots" content="index, follow"')
      expect(html).toContain(`rel="canonical" href="https://samct.example${path || '/'}"`)
    }
    const sitemap = await readFile(join(directory, 'dist/sitemap.xml'), 'utf8')
    expect(sitemap.match(/<url>/g)).toHaveLength(4)
    expect(sitemap).not.toMatch(/resident|admin|village-manager|login|register|reset-password/)
    expect(await readFile(join(directory, 'dist/portal.html'), 'utf8')).toContain('name="robots" content="noindex, nofollow"')
  } finally { await rm(directory, {recursive:true, force:true}) }
})
