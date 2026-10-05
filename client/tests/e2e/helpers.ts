import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
export type Account = { id: number; userName: string; email: string; role: string; village: string; password: string; mfaSecret?: string; recoveryCodes?: string[] }
export function users(): Record<string, Account> { return JSON.parse(readFileSync('.playwright/users.json', 'utf8')) }
export function saveMfa(account: Account, secret: string, recoveryCodes: string[]) {
  const accounts = users()
  Object.assign(Object.values(accounts).find(item => item.id === account.id)!, { mfaSecret: secret, recoveryCodes })
  writeFileSync('.playwright/users.json', JSON.stringify(accounts), { mode: 0o600 })
}
export function recoveryCode(account: Account) {
  const accounts = users()
  const code = Object.values(accounts).find(item => item.id === account.id)!.recoveryCodes?.shift()
  if (!code) throw new Error('Fixture has no unused recovery codes')
  writeFileSync('.playwright/users.json', JSON.stringify(accounts), { mode: 0o600 })
  return code
}
// Independent RFC 6238 test implementation, not the server's OTP library.
export function totp(secret: string, timestamp = Date.now()) {
  const bits = [...secret.replace(/=+$/, '').toUpperCase()].map(char => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(char).toString(2).padStart(5, '0')).join('')
  const key = Buffer.from(bits.match(/.{8}/g)!.map(byte => parseInt(byte, 2)))
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(timestamp / 30000)))
  const digest = createHmac('sha1', key).update(counter).digest()
  const offset = digest[digest.length - 1] & 15
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0')
}
export const state = (role: string) => `.playwright/${role}.json`
export async function csrf(request: APIRequestContext) {
  const response = await request.get('/api/csrf')
  expect(response.status()).toBe(200)
  return (await response.json()).token as string
}
export async function write(request: APIRequestContext, method: string, path: string, options: Record<string, unknown> | (() => Record<string, unknown>) = {}) {
  const send = async () => {
    const current = typeof options === 'function' ? options() : options
    return request.fetch(path, { ...current, method, headers: { 'X-CSRF-TOKEN': await csrf(request), ...(current.headers as Record<string, string> || {}) } })
  }
  let response = await send()
  if (response.status() === 429) {
    console.log('Waiting for the real rate limit window before continuing.')
    await new Promise(resolve => setTimeout(resolve, 61000))
    response = await send()
  }
  return response
}
export async function loginApi(request: APIRequestContext, account: Account) {
  let response = await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })
  if (response.status() === 202) {
    if ((await response.json()).setupRequired) {
      const setup = await write(request, 'POST', '/api/mfa/setup')
      expect(setup.status(), await setup.text()).toBe(200)
      const { secret } = await setup.json()
      response = await write(request, 'POST', '/api/mfa/complete', () => ({ data: { code: totp(secret) } }))
      expect(response.status(), await response.text()).toBe(200)
      saveMfa(account, secret, (await response.json()).recoveryCodes)
    } else response = await write(request, 'POST', '/api/mfa/complete', { data: { recoveryCode: recoveryCode(account) } })
  }
  expect(response.status(), await response.text()).toBe(200)
}
export async function loginPage(page: Page, account: Account) {
  await page.goto('/login')
  await page.getByLabel('Username', { exact: true }).fill(account.userName)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  const result = page.waitForResponse(response => response.url().endsWith('/api/login') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  const response = await result
  if (response.status() === 429) {
    await page.waitForTimeout(61000)
    return loginPage(page, account)
  }
  if (response.status() === 202) {
    await page.getByRole('button', { name: 'Use a recovery code', exact: true }).click()
    await page.getByLabel('Recovery code', { exact: true }).fill(recoveryCode(account))
    const verify = () => {
      const result = page.waitForResponse(response => response.url().endsWith('/api/mfa/complete'))
      void page.getByRole('button', { name: 'Verify and sign in', exact: true }).click()
      return result
    }
    if ((await verify()).status() === 429) { await page.waitForTimeout(61000); await verify() }
  }
}
export const order = (village = 'Ngatea') => ({ village, title: 'New maintenance order', unitNumber: '4', category: 'Maintenance', supplier: 'Test supplier', estimatedCost: 120, priority: 'Normal', status: 'Pending', notes: 'Test order notes' })
