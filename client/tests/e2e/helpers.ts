import { Page } from '@playwright/test'

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