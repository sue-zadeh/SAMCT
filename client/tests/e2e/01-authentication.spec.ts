import { test, expect } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import { csrf, loginApi, loginPage, state, users, write } from './helpers'

test('public cannot open any protected page, even with forged browser role data', async ({ page, request }) => {
  await page.addInitScript(() => { localStorage.setItem('role', 'Admin'); localStorage.setItem('username', 'e2e.admin'); localStorage.setItem('village', 'Whitianga') })
  for (const path of ['/admin','/admin/people','/resident/maintenance','/village-manager/purchase-orders']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login$/)
  }
  expect((await request.get('/api/users')).status()).toBe(401)
})
for (const [key, destination] of [['resident','resident'],['manager','village-manager'],['admin','admin']]) {
  test(`${key} can log in, reload their portal and log out`, async ({ page, context }) => {
    await loginPage(page, users()[key])
    await expect(page).toHaveURL(new RegExp(`/${destination}$`))
    const cookie = (await context.cookies()).find(item => item.name === 'Samct.Auth')
    expect(cookie?.httpOnly).toBe(true); expect(cookie?.sameSite).toBe('Lax')
    expect(await page.evaluate(() => document.cookie)).not.toContain('Samct.Auth')
    await page.reload()
    await expect(page.getByRole('button', { name: 'Logout', exact: true })).toBeVisible()
    const sessionCookie = await context.storageState()
    await page.getByRole('button', { name: 'Logout', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    expect((await page.request.get('/api/session')).status()).toBe(401)
    // Replaying the cookie after logout must fail at the API too.
    const replay = await context.browser()!.newContext({ storageState: sessionCookie, baseURL: 'http://127.0.0.1:5173' })
    expect((await replay.request.get('/api/session')).status()).toBe(401)
    await replay.close()
  })
}
test('login and authenticated writes reject missing or forged CSRF tokens', async ({ request, browser }) => {
  expect((await request.post('/api/login', { data: { userName: users().resident.userName, password: users().resident.password } })).status()).toBe(400)
  const context = await browser.newContext({ storageState: state('resident'), baseURL: 'http://127.0.0.1:5173' })
  expect((await context.request.post('/api/logout')).status()).toBe(400)
  expect((await context.request.post('/api/logout', { headers: { 'X-CSRF-TOKEN': 'forged' } })).status()).toBe(400)
  expect((await context.request.get('/api/session')).status()).toBe(200)
  await context.close()
})
test('registration through the form creates a pending resident, not an active account', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Username', { exact: true }).fill('e2e.pending')
  await page.getByLabel('First Name').fill('Test')
  await page.getByLabel('Last Name').fill('Pending')
  await page.getByLabel('Email', { exact: true }).fill('pending@example.test')
  await page.getByLabel('Password', { exact: true }).fill(users().resident.password)
  await page.getByLabel('Confirm Password', { exact: true }).fill(users().resident.password)
  await expect(page.getByLabel('Role', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Register User', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('must approve your account')
  const response = await write(page.request, 'POST', '/api/login', { data: { userName: 'e2e.pending', password: users().resident.password } })
  expect(response.status()).toBe(401)
})
test('anonymous registration rejects an administrator role and a weak password', async ({ request }) => {
  const fields = { userName: 'e2e.attacker', firstName: 'Test', lastName: 'User', email: 'attacker@example.test', village: 'Ngatea', password: users().resident.password }
  expect((await write(request, 'POST', '/api/register', { multipart: { ...fields, role: 'CompanySecretary' } })).status()).toBe(403)
  expect((await write(request, 'POST', '/api/register', { multipart: { ...fields, role: 'Resident', password: 'short' } })).status()).toBe(400)
})
test('invalid and inactive logins return the same generic error', async ({ request }) => {
  const missing = await write(request, 'POST', '/api/login', { data: { userName: 'e2e.missing', password: users().resident.password } })
  const inactive = await write(request, 'POST', '/api/login', { data: { userName: users().inactive.userName, password: users().inactive.password } })
  expect(missing.status()).toBe(401); expect(inactive.status()).toBe(401)
  expect(await missing.json()).toEqual(await inactive.json())
})
// Password tests use fresh accounts so they do not invalidate the shared role fixtures.
test('password change revokes all sessions and requires the current password', async ({ request, playwright }) => {
  test.setTimeout(120000)
  const account = users().changePassword
  await loginApi(request, account)
  const second = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
  await loginApi(second, account)
  expect((await write(request, 'PUT', '/api/users/password', { data: { userName: account.userName, currentPassword: 'incorrect', newPassword: 'New-test-password-123' } })).status()).toBe(400)
  const response = await write(request, 'PUT', '/api/users/password', { data: { userName: account.userName, currentPassword: account.password, newPassword: 'New-test-password-123' } })
  expect(response.status()).toBe(200)
  expect((await request.get('/api/session')).status()).toBe(401)
  expect((await second.get('/api/session')).status()).toBe(401)
  await second.dispose()
})
test('password reset email, single-use token, and session revocation work together', async ({ request }) => {
  test.setTimeout(120000)
  const account = users().reset
  await loginApi(request, account)
  let response = await write(request, 'POST', '/api/forgot-password', { data: { email: account.email } })
  if (response.status() === 429) { await new Promise(resolve => setTimeout(resolve, 61000)); response = await write(request, 'POST', '/api/forgot-password', { data: { email: account.email } }) }
  expect(response.status()).toBe(200)
  const emails = await Promise.all((await readdir('.playwright/outbox')).map(async file => JSON.parse(await readFile(`.playwright/outbox/${file}`, 'utf8'))))
  const email = emails.find(item => item.recipient === account.email)
  expect(email).toBeTruthy()
  const token = email.body.match(/reset-password\/([A-F0-9]{64})/)[1]
  const reset = await write(request, 'PUT', '/api/reset-password', { data: { token, newPassword: 'Reset-test-password-123' } })
  expect(reset.status()).toBe(200)
  expect((await request.get('/api/session')).status()).toBe(401)
  expect((await write(request, 'PUT', '/api/reset-password', { data: { token, newPassword: 'Reset-test-password-456' } })).status()).toBe(400)
})
