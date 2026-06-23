import { test, expect } from '@playwright/test'

test('public user can open home, marketing, contact and login pages', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('SAMCT Villages').first()).toBeVisible()

  await page.getByRole('navigation').getByRole('link', { name: 'Marketing', exact: true }).click()
  await expect(page).toHaveURL(/marketing/)

  await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click()
  await expect(page).toHaveURL(/contactUs/)

  await page.getByRole('navigation').getByRole('link', { name: 'Login', exact: true }).click()
  await expect(page).toHaveURL(/login/)
  await expect(page.getByText(/Welcome to SAMCT Portal/i)).toBeVisible()
})