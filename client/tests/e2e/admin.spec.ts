import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('admin can login and open admin pages', async ({ page }) => {
  await login(page, 'secretary1', '123Suezx@')

  await expect(page).toHaveURL(/admin/)

  await page.getByRole('navigation').getByRole('link', { name: /Village Data/i }).click()
  await expect(page).toHaveURL(/admin\/village-properties/)

  await page.getByRole('navigation').getByRole('link', { name: /Maintenance/i }).click()
  await expect(page).toHaveURL(/admin\/maintenance/)

  await page.getByRole('navigation').getByRole('link', { name: /Purchase Orders/i }).click()
  await expect(page).toHaveURL(/admin\/purchase-orders/)
})