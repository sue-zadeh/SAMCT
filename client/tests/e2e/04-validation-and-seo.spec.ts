import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { state, write } from './helpers'

test('API responses have security headers and prevent private response caching', async ({ request }) => {
  const response = await request.get('/api/csrf')
  expect(response.headers()['x-content-type-options']).toBe('nosniff')
  expect(response.headers()['x-frame-options']).toBe('DENY')
  expect(response.headers()['cache-control']).toBe('no-store')
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
