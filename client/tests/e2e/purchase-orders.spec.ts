import { test, expect } from '@playwright/test'
import { login, testAccount } from './helpers'

test('village manager can open purchase orders page', async ({ page }) => {
  const account = testAccount('manager')
  await login(page, account.username, account.password)

  await expect(page).toHaveURL(/village-manager/)

  await page.getByRole('navigation').getByRole('link', { name: /Purchase Orders/i }).click()
  await expect(page).toHaveURL(/village-manager\/purchase-orders/)
  await expect(page.getByText(/Purchase Orders/i).first()).toBeVisible()
})
