import { expect, test } from '@playwright/test'
import { login, testAccount } from './helpers'

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:5072'

test('anonymous users are redirected away from private routes', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test('anonymous API calls cannot read private user data', async ({ request }) => {
  const response = await request.get(`${apiBaseUrl}/api/users`)
  expect(response.status()).toBe(401)
})

test('public marketing data does not expose resident fields', async ({ request }) => {
  const response = await request.get(`${apiBaseUrl}/api/village-properties/marketing`)
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  const serialized = JSON.stringify(body).toLowerCase()
  expect(serialized).not.toContain('residentemail')
  expect(serialized).not.toContain('residentname')
  expect(serialized).not.toContain('documenturl')
})

test('village managers cannot open admin-only registration', async ({ page }) => {
  const account = testAccount('manager')
  await login(page, account.username, account.password)
  await page.goto('/register')
  await expect(page).toHaveURL(/\/village-manager$/)
})
