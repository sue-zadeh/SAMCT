import { test, expect } from '@playwright/test'
import { login } from './helpers'

test('admin can login', async ({ page }) => {
  await login(page, 'secretary1', '123Suezx@')

  await expect(page).toHaveURL(/admin/)
  await expect(page.getByText(/Admin Portal/i)).toBeVisible()
})