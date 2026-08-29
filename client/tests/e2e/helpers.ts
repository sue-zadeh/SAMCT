import { Page } from '@playwright/test'

type TestRole = 'admin' | 'manager' | 'resident'

export function testAccount(role: TestRole) {
  const prefix = role.toUpperCase()
  const username = process.env[`TEST_${prefix}_USERNAME`]
  const password = process.env.TEST_USER_PASSWORD

  if (!username || !password) {
    throw new Error(`Missing synthetic E2E credentials for ${role}. See docs/REPRODUCTION.md.`)
  }

  return { username, password }
}

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login')

  await page
    .locator(
      '#username, input[name="username"], input[autocomplete="username"], input[type="text"]',
    )
    .first()
    .fill(username)

  await page
    .locator(
      '#password, input[name="password"], input[autocomplete="current-password"], input[type="password"]',
    )
    .first()
    .fill(password)

  await page.getByRole('button', { name: /^login$/i }).click()
}
