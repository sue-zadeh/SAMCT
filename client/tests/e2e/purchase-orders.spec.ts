import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('village manager can open purchase orders page', async ({ page }) => {
  await login(page, 'village1', '123Suezx@')

  await expect(page).toHaveURL(/village-manager/)

  await page.getByRole('navigation').getByRole('link', { name: /Purchase Orders/i }).click()
  await expect(page).toHaveURL(/village-manager\/purchase-orders/)
  await expect(page.getByText(/Purchase Orders/i).first()).toBeVisible()
})