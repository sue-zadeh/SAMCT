import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
export type Account = { id: number; userName: string; email: string; role: string; village: string; password: string }
export function users(): Record<string, Account> { return JSON.parse(readFileSync('.playwright/users.json', 'utf8')) }
export const state = (role: string) => `.playwright/${role}.json`
export async function waitForRateLimitWindow() {
  console.log('Waiting for the real rate limit window before continuing.')
  await new Promise(resolve => setTimeout(resolve, 61000))
}
export async function read(request: APIRequestContext, path: string) {
  let response = await request.get(path)
  if (response.status() === 429) {
    await waitForRateLimitWindow()
    response = await request.get(path)
  }
  return response
}
export async function csrf(request: APIRequestContext) {
  const response = await read(request, '/api/csrf')
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
    await waitForRateLimitWindow()
    response = await send()
  }
  return response
}
export async function loginApi(request: APIRequestContext, account: Account) {
  const response = await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })
  expect(response.status(), await response.text()).toBe(200)
  return response
}
export async function loginPage(page: Page, account: Account) {
  await csrf(page.request)
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
  expect(response.status()).toBe(200)
}
export const order = (village = 'Ngatea') => ({ village, title: 'New maintenance order', unitNumber: '4', category: 'Maintenance', supplier: 'Test supplier', estimatedCost: 120, priority: 'Normal', status: 'Pending', notes: 'Test order notes' })
