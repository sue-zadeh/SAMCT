import { test, expect } from '@playwright/test'
import { login, testAccount } from './helpers'

test('admin can login', async ({ page }) => {
  const account = testAccount('admin')
  await login(page, account.username, account.password)

  await expect(page).toHaveURL(/admin/)
  await expect(page.getByText(/Admin Portal/i)).toBeVisible()
})
