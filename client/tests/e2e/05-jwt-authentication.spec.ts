import { test, expect, type APIRequestContext } from '@playwright/test'
import { createHmac } from 'node:crypto'
import { database } from '../../../scripts/e2e-database.mjs'
import {
  loginApi,
  loginPage,
  users,
  waitForRateLimitWindow,
  write,
} from './helpers'

// The preceding workflow/upload tests share this IP. Exercise JWT boundaries in
// a fresh real limiter window, without disabling throttling or retrying assertions.
test.beforeAll(async () => {
  await waitForRateLimitWindow()
})

const baseURL = 'http://127.0.0.1:5173'
async function token(request: APIRequestContext) {
  return (await request.storageState()).cookies.find(
    (cookie) => cookie.name === 'Samct.Auth',
  )!.value
}
function payload(jwt: string) {
  return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
}
function sign(
  claims: Record<string, unknown>,
  algorithm = 'HS256',
  key = process.env.Jwt__SigningKey!,
) {
  const content = [
    JSON.stringify({ alg: algorithm, typ: 'JWT' }),
    JSON.stringify(claims),
  ]
    .map((value) => Buffer.from(value).toString('base64url'))
    .join('.')
  return `${content}.${createHmac(
    algorithm === 'HS384' ? 'sha384' : 'sha256',
    Buffer.from(key, 'base64'),
  )
    .update(content)
    .digest('base64url')}`
}
async function sessionDeadline(jwt: string, secondsFromNow?: number) {
  const db = database() // Rejects anything except a disposable local _e2e database.
  await db.connect()
  try {
    const id = payload(jwt).session
    if (secondsFromNow !== undefined)
      await db.query(
        'UPDATE "AuthSessions" SET "ExpiresAt" = now() + $2 * interval \'1 second\' WHERE "Id" = $1',
        [id, secondsFromNow],
      )
    const result = await db.query(
      'SELECT "ExpiresAt" FROM "AuthSessions" WHERE "Id" = $1',
      [id],
    )
    return result.rows[0].ExpiresAt as Date
  } finally {
    await db.end()
  }
}

test('password login issues an HttpOnly signed JWT and a 20-minute server deadline', async ({
  request,
}) => {
  const before = Date.now()
  const response = await loginApi(request, users().jwtResident)
  const jwt = await token(request)
  const claims = payload(jwt)
  expect(jwt.split('.')).toHaveLength(3)
  expect(claims.iss).toBe('SAMCT')
  expect(claims.aud).toBe('SAMCT.Portal')
  expect(claims.sub).toBe(String(users().jwtResident.id))
  expect(claims.jti).toBe(claims.session)
  expect(claims.exp - claims.iat).toBe(8 * 60 * 60)
  const [header, body, signature] = jwt.split('.')
  expect(signature).toBe(
    createHmac('sha256', Buffer.from(process.env.Jwt__SigningKey!, 'base64'))
      .update(`${header}.${body}`)
      .digest('base64url'),
  )
  const data = await response.json()
  expect(data).not.toHaveProperty('twoFactorRequired')
  expect(Date.parse(data.sessionExpiresAt)).toBeGreaterThanOrEqual(
    before + 20 * 60 * 1000,
  )
  expect(Date.parse(data.sessionExpiresAt)).toBeLessThanOrEqual(
    Date.now() + 20 * 60 * 1000,
  )
  const cookie = (await request.storageState()).cookies.find(
    (item) => item.name === 'Samct.Auth',
  )!
  expect(cookie.httpOnly).toBe(true)
  expect(cookie.sameSite).toBe('Lax')
})

test('previously enrolled staff log in immediately without a QR or code challenge', async ({
  page,
}) => {
  await loginPage(page, users().previousMfa)
  await expect(page).toHaveURL(/\/village-manager$/)
  await expect(
    page.getByText(/authenticator|recovery code|QR code/i),
  ).toHaveCount(0)
  expect((await page.request.get('/api/session')).status()).toBe(200)
  expect((await page.request.get('/api/mfa/status')).status()).toBe(404)
  for (const path of [
    'setup',
    'enroll',
    'complete',
    'recovery-codes',
    'disable',
  ]) {
    expect(
      (
        await write(page.request, 'POST', `/api/mfa/${path}`, { data: {} })
      ).status(),
    ).toBe(404)
  }
  expect(
    await page.evaluate(() =>
      Object.entries(localStorage).some(([, value]) =>
        /^eyJ[^.]+\.[^.]+\.[^.]+$/.test(value),
      ),
    ),
  ).toBe(false)
})

test('JWT signature, algorithm, lifetime, issuer, audience and session identity are validated', async ({
  request,
  playwright,
}) => {
  await loginApi(request, users().jwtResident)
  const jwt = await token(request)
  const claims = payload(jwt)
  const [header, body, signature] = jwt.split('.')
  const { exp: ignored, ...noExpiry } = claims
  const invalid = [
    `${header}.${body}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`,
    `${Buffer.from('{"alg":"none"}').toString('base64url')}.${body}.`,
    sign(claims, 'HS384'),
    sign(claims, 'HS256', Buffer.alloc(32, 9).toString('base64')),
    sign({ ...claims, iss: 'other' }),
    sign({ ...claims, aud: 'other' }),
    sign({ ...claims, nbf: 1, exp: Math.floor(Date.now() / 1000) - 1 }),
    sign({ ...claims, nbf: Math.floor(Date.now() / 1000) + 60 }),
    sign(noExpiry),
    sign({ ...claims, sub: String(users().admin.id) }),
    sign({ ...claims, session: 'not-a-session' }),
  ]
  for (const value of invalid) {
    const client = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${value}` },
    })
    try {
      expect((await client.get('/api/session')).status()).toBe(401)
    } finally {
      await client.dispose()
    }
  }
  const client = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${sign({ ...claims, role: 'Admin', village: 'Whitianga' })}`,
    },
  })
  try {
    const session = await client.get('/api/session')
    expect(session.status()).toBe(200)
    expect((await session.json()).role).toBe('Resident')
    expect((await client.get('/api/users')).status()).toBe(403)
    expect(
      (await client.get('/api/documents/resident/Whitianga')).status(),
    ).toBe(403)
  } finally {
    await client.dispose()
  }
})

test('only CSRF-protected activity renews a live session; expired sessions cannot be revived', async ({
  request,
}) => {
  await loginApi(request, users().jwtResident)
  const jwt = await token(request)
  const original = await sessionDeadline(jwt, 300)
  for (let count = 0; count < 3; count++)
    expect((await request.get('/api/session')).status()).toBe(200)
  expect((await request.post('/api/session/activity')).status()).toBe(400)
  expect(await sessionDeadline(jwt)).toEqual(original)
  const before = Date.now()
  const renewed = await write(request, 'POST', '/api/session/activity')
  expect(renewed.status()).toBe(200)
  expect(
    Date.parse((await renewed.json()).sessionExpiresAt),
  ).toBeGreaterThanOrEqual(before + 20 * 60 * 1000)
  const expired = await sessionDeadline(jwt, -1)
  const denied = await request.get('/api/session')
  expect(denied.status()).toBe(401)
  expect((await denied.json()).code).toBe('inactivity')
  expect(
    (
      await write(request, 'POST', '/api/session/activity', {
        headers: { Authorization: `Bearer ${jwt}` },
      })
    ).status(),
  ).toBe(401)
  expect(await sessionDeadline(jwt)).toEqual(expired)
})

test('20 minutes idle logs out open tabs, shows the message and revokes the JWT', async ({
  page,
  context,
}) => {
  await loginPage(page, users().jwtResident)
  await expect(page).toHaveURL(/\/resident$/)
  const saved = await token(page.request)
  const second = await context.newPage()
  await second.goto('/resident')
  await expect(
    second.getByRole('button', { name: 'Logout', exact: true }),
  ).toBeVisible()
  await page.bringToFront()
  await page.clock.install()
  await page.clock.fastForward(20 * 60 * 1000 + 2000)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('dialog')).toContainText(
    'logged out after 20 minutes of inactivity',
  )
  await expect(second).toHaveURL(/\/login$/)
  await expect(second.getByRole('dialog')).toContainText(
    'logged out after 20 minutes of inactivity',
  )
  await expect
    .poll(async () =>
      (
        await page.request.get('/api/session', {
          headers: { Authorization: `Bearer ${saved}` },
        })
      ).status(),
    )
    .toBe(401)
  await page.getByRole('button', { name: 'OK', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible()
})

test('real keyboard activity keeps an active user signed in beyond the previous deadline', async ({
  page,
}) => {
  await loginApi(page.request, users().jwtResident)
  await sessionDeadline(await token(page.request), 120)
  await page.goto('/resident')
  await expect(
    page.getByRole('button', { name: 'Logout', exact: true }),
  ).toBeVisible()
  await page.clock.install()
  const renewed = page.waitForResponse((response) =>
    response.url().endsWith('/api/session/activity'),
  )
  await page.keyboard.press('Tab')
  expect((await renewed).status()).toBe(200)
  await page.clock.fastForward(3 * 60 * 1000)
  await expect(page).toHaveURL(/\/resident$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect((await page.request.get('/api/session')).status()).toBe(200)
})
