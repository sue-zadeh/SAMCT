import { test, expect } from '@playwright/test'
import { login, testAccount } from './helpers'

test('resident can login and open maintenance page', async ({ page }) => {
  const account = testAccount('resident')
  await login(page, account.username, account.password)

  await expect(page).toHaveURL(/resident/)

  await page.getByRole('navigation').getByRole('link', { name: /Maintenance/i }).click()
  await expect(page).toHaveURL(/resident\/maintenance/)
})
