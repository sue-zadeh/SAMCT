import { test, expect, type APIRequestContext } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import { loginApi, recoveryCode, totp, users, write, type Account } from './helpers'

test.setTimeout(240000)
async function challenge(request: APIRequestContext, account: Account) {
  const result = await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })
  expect(result.status(), await result.text()).toBe(202)
  return result.json()
}
async function resetToken(email: string) {
  const messages = await Promise.all((await readdir('.playwright/outbox')).map(async file => JSON.parse(await readFile(`.playwright/outbox/${file}`, 'utf8'))))
  return messages.find(item => item.recipient === email).body.match(/reset-password\/([A-F0-9]{64})/)[1] as string
}

test('staff password alone has no portal access; setup requires a challenge and CSRF', async ({ request }) => {
  expect((await write(request, 'POST', '/api/mfa/setup')).status()).toBe(401)
  expect((await challenge(request, users().mfaEnroll)).setupRequired).toBe(true)
  expect((await request.get('/api/session')).status()).toBe(401)
  expect((await request.get('/api/users')).status()).toBe(401)
  expect((await request.post('/api/mfa/setup')).status()).toBe(400)
  expect((await request.storageState()).cookies.some(cookie => cookie.name === 'Samct.Auth')).toBe(false)
})

test('staff enrolls an authenticator in the browser and saves recovery codes', async ({ page }) => {
  const account = users().mfaEnroll
  await challenge(page.request, account)
  await page.goto('/login?mfa=setup')
  await expect(page.getByLabel('Setup key')).toBeVisible()
  const secret = await page.getByLabel('Setup key').inputValue()
  await expect(page.getByAltText('Scan this QR code with your authenticator app')).toBeVisible()
  const submit = async () => {
    await page.getByLabel('Authenticator code', { exact: true }).fill(totp(secret))
    const result = page.waitForResponse(response => response.url().endsWith('/api/mfa/complete'))
    await page.getByRole('button', { name: 'Verify and sign in', exact: true }).click()
    return result
  }
  let response = await submit()
  if (response.status() === 429) { await page.waitForTimeout(61000); response = await submit() }
  expect(response.status(), await response.text()).toBe(200)
  const codes = (await response.json()).recoveryCodes
  expect(codes).toHaveLength(10)
  await expect(page.getByTestId('recovery-codes')).toContainText(codes[0])
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(secret)
  await page.getByRole('button', { name: 'I have saved my recovery codes' }).click()
  await expect(page).toHaveURL(/\/village-manager$/)
  expect((await page.request.get('/api/session')).status()).toBe(200)
})

test('invalid second factors lock the account and a correct password cannot reset the failure count', async ({ request }) => {
  const account = users().mfaLock
  await challenge(request, account)
  const setup = await write(request, 'POST', '/api/mfa/setup')
  const secret = (await setup.json()).secret
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await challenge(request, account)
    const result = await write(request, 'POST', '/api/mfa/complete', () => ({ data: { code: (Number(totp(secret)) + 500000).toString().slice(-6).padStart(6, '0') } }))
    expect(result.status()).toBe(401)
  }
  expect((await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })).status()).toBe(401)
  expect((await request.get('/api/session')).status()).toBe(401)
})

test('recovery codes work once, cannot replace an enrolled authenticator, and staff cannot disable MFA', async ({ request, playwright }) => {
  const account = users().mfaManage
  await loginApi(request, account)
  expect((await write(request, 'POST', '/api/mfa/disable', { data: { currentPassword: account.password, recoveryCode: recoveryCode(account) } })).status()).toBe(400)
  const second = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
  try {
    expect((await challenge(second, account)).setupRequired).toBe(false)
    expect((await write(second, 'POST', '/api/mfa/setup')).status()).toBe(409)
    const code = recoveryCode(account)
    expect((await write(second, 'POST', '/api/mfa/complete', { data: { recoveryCode: code } })).status()).toBe(200)
    await write(second, 'POST', '/api/logout')
    await challenge(second, account)
    expect((await write(second, 'POST', '/api/mfa/complete', { data: { recoveryCode: code } })).status()).toBe(401)
    expect((await second.get('/api/session')).status()).toBe(401)
    // A just-enrolled TOTP cannot be reused, even if it remains in its allowed time window.
    const secret = users().mfaManage.mfaSecret!
    let used = ''
    const verify = await write(second, 'POST', '/api/mfa/complete', () => ({ data: { code: (used = totp(secret)) } }))
    if (verify.status() === 200) {
      await write(second, 'POST', '/api/logout')
      await challenge(second, account)
      // Keep the exact consumed code, even when rate limiting crosses a time step.
      const replay = await write(second, 'POST', '/api/mfa/complete', { data: { code: used } })
      expect(replay.status()).toBe(401)
    } else expect(verify.status()).toBe(401)
  } finally { await second.dispose() }
})

test('regenerating recovery codes needs both factors, revokes other sessions and replaces old codes', async ({ request, playwright }) => {
  const account = users().mfaManage
  await loginApi(request, account)
  const other = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
  try {
    await loginApi(other, account)
    const proof = recoveryCode(account)
    const unused = recoveryCode(account)
    expect((await write(request, 'POST', '/api/mfa/recovery-codes', { data: { currentPassword: 'wrong-password', recoveryCode: proof } })).status()).toBe(400)
    const result = await write(request, 'POST', '/api/mfa/recovery-codes', { data: { currentPassword: account.password, recoveryCode: proof } })
    expect(result.status(), await result.text()).toBe(200)
    const fresh = (await result.json()).recoveryCodes
    expect(fresh).toHaveLength(10)
    expect((await request.get('/api/session')).status()).toBe(200)
    expect((await other.get('/api/session')).status()).toBe(401)
    await challenge(other, account)
    expect((await write(other, 'POST', '/api/mfa/complete', { data: { recoveryCode: unused } })).status()).toBe(401)
    expect((await write(other, 'POST', '/api/mfa/complete', { data: { recoveryCode: fresh[0] } })).status()).toBe(200)
  } finally { await other.dispose() }
})

test('password recovery preserves MFA and invalidates a pending login challenge', async ({ request, playwright }) => {
  const account = users().mfaReset
  await loginApi(request, account)
  const pending = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
  try {
    await challenge(pending, account)
    expect((await write(request, 'POST', '/api/forgot-password', { data: { email: account.email } })).status()).toBe(200)
    const password = 'Changed-MFA-password-123'
    expect((await write(request, 'PUT', '/api/reset-password', { data: { token: await resetToken(account.email), newPassword: password } })).status()).toBe(200)
    expect((await request.get('/api/session')).status()).toBe(401)
    expect((await write(pending, 'POST', '/api/mfa/complete', { data: { recoveryCode: recoveryCode(account) } })).status()).toBe(401)
    expect((await challenge(pending, { ...account, password })).setupRequired).toBe(false)
    expect((await write(pending, 'POST', '/api/mfa/complete', { data: { recoveryCode: recoveryCode(account) } })).status()).toBe(200)
  } finally { await pending.dispose() }
})

test('residents can opt in to MFA and disabling it needs their password plus a second factor', async ({ request }) => {
  const account = users().mfaResident
  await loginApi(request, account)
  expect((await write(request, 'POST', '/api/mfa/enroll', { data: { currentPassword: account.password } })).status()).toBe(202)
  const setup = await write(request, 'POST', '/api/mfa/setup')
  const secret = (await setup.json()).secret
  const enrolled = await write(request, 'POST', '/api/mfa/complete', () => ({ data: { code: totp(secret) } }))
  expect(enrolled.status()).toBe(200)
  const codes = (await enrolled.json()).recoveryCodes
  expect((await write(request, 'POST', '/api/mfa/disable', { data: { currentPassword: account.password } })).status()).toBe(400)
  expect((await write(request, 'POST', '/api/mfa/disable', { data: { currentPassword: account.password, recoveryCode: codes[0] } })).status()).toBe(200)
  expect((await (await request.get('/api/mfa/status')).json()).enabled).toBe(false)
  await write(request, 'POST', '/api/logout')
  expect((await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })).status()).toBe(200)
})

test('changing recovery email invalidates old reset links and all sessions', async ({ request, playwright }) => {
  const account = users().emailChange
  await loginApi(request, account)
  const other = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
  try {
    await loginApi(other, account)
    expect((await write(request, 'POST', '/api/forgot-password', { data: { email: account.email } })).status()).toBe(200)
    const token = await resetToken(account.email)
    const profile = await (await request.get('/api/session')).json()
    expect((await write(request, 'PUT', '/api/users/profile', { data: { ...profile, currentUsername: account.userName, currentPassword: account.password, email: 'new-recovery@example.test' } })).status()).toBe(200)
    expect((await other.get('/api/session')).status()).toBe(401)
    expect((await request.get('/api/session')).status()).toBe(401)
    expect((await write(other, 'PUT', '/api/reset-password', { data: { token, newPassword: 'Should-not-work-123' } })).status()).toBe(400)
  } finally { await other.dispose() }
})
