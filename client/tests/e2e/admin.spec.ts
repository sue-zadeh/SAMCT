import { test, expect } from '@playwright/test'
import { login, testAccount } from './helpers'

test('admin can login and open admin pages', async ({ page }) => {
  const account = testAccount('admin')
  await login(page, account.username, account.password)

  await expect(page).toHaveURL(/admin/)

  await page.getByRole('navigation').getByRole('link', { name: /Village Data/i }).click()
  await expect(page).toHaveURL(/admin\/village-properties/)

  await page.getByRole('navigation').getByRole('link', { name: /Maintenance/i }).click()
  await expect(page).toHaveURL(/admin\/maintenance/)

  await page.getByRole('navigation').getByRole('link', { name: /Purchase Orders/i }).click()
  await expect(page).toHaveURL(/admin\/purchase-orders/)
})
