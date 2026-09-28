import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
export type Account = { id: number; userName: string; email: string; role: string; village: string; password: string }
export function users(): Record<string, Account> { return JSON.parse(readFileSync('.playwright/users.json', 'utf8')) }
export const state = (role: string) => `.playwright/${role}.json`
export async function csrf(request: APIRequestContext) {
  const response = await request.get('/api/csrf')
  expect(response.status()).toBe(200)
  return (await response.json()).token as string
}
export async function write(request: APIRequestContext, method: string, path: string, options: Record<string, unknown> = {}) {
  const send = async () => request.fetch(path, { ...options, method, headers: { 'X-CSRF-TOKEN': await csrf(request), ...(options.headers as Record<string, string> || {}) } })
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
  if (response.status() === 429) {
    // Respect the real limiter when the suite crosses a minute boundary. It stays enabled in tests.
    await new Promise(resolve => setTimeout(resolve, 61000))
    response = await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })
  }
  expect(response.status(), await response.text()).toBe(200)
}
export async function loginPage(page: Page, account: Account) {
  await page.goto('/login')
  await page.getByLabel('Username', { exact: true }).fill(account.userName)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Login', exact: true }).click()
}
export const order = (village = 'Ngatea') => ({ village, title: 'New maintenance order', unitNumber: '4', category: 'Maintenance', supplier: 'Test supplier', estimatedCost: 120, priority: 'Normal', status: 'Pending', notes: 'Test order notes' })
