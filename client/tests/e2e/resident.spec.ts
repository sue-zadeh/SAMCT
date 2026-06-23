import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('resident can login and open maintenance page', async ({ page }) => {
  await login(page, 'resident1', '123Suezx@')

  await expect(page).toHaveURL(/resident/)

  await page.getByRole('navigation').getByRole('link', { name: /Maintenance/i }).click()
  await expect(page).toHaveURL(/resident\/maintenance/)
})