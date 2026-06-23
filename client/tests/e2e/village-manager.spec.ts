import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('village manager can open main pages', async ({ page }) => {
  await login(page, 'village1', '123Suezx@')

  await expect(page).toHaveURL(/village-manager/)

  await page.getByRole('navigation').getByRole('link', { name: /My Village/i }).click()
  await expect(page).toHaveURL(/village-manager\/my-village/)

  await page.getByRole('navigation').getByRole('link', { name: /Maintenance/i }).click()
  await expect(page).toHaveURL(/village-manager\/maintenance/)

  await page.getByRole('navigation').getByRole('link', { name: /Residents/i }).click()
  await expect(page).toHaveURL(/village-manager\/residents/)
})