import { test, expect } from '@playwright/test'
import { readdir, readFile } from 'node:fs/promises'

test('public home and Covenant settlement contact details are visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(/Community-focused independent retirement living/)).toBeVisible()

  await page.goto('/contactUs')
  await expect(page.getByRole('heading', { name: 'Retirement village settlements' })).toBeVisible()
  await expect(page.getByText('Jan Signal', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'jan@covenant.co.nz' })).toHaveAttribute(
    'href', 'mailto:jan@covenant.co.nz',
  )
  await expect(page.getByRole('link', { name: '027 641 7261' })).toHaveAttribute(
    'href', 'tel:+64276417261',
  )
})

test('public contact form sends its email to the Secretary mailbox', async ({ page }) => {
  await page.goto('/contactUs')
  await page.getByLabel('Full Name').fill('Public Contact Test')
  await page.getByLabel('Email', { exact: true }).fill('public-contact@example.test')
  await page.getByLabel('Subject').fill('Secretary mailbox delivery test')
  await page.getByLabel('Phone').fill('0271234567')
  await page.getByLabel('Message').fill('Please send this enquiry to the secretary mailbox.')

  const sent = page.waitForResponse(
    response => new URL(response.url()).pathname === '/api/contact' &&
      response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Send Message' }).click()
  const response = await sent
  expect(response.status(), await response.text()).toBe(200)
  await expect(page.getByText('Your message has been sent successfully.')).toBeVisible()

  const files = await readdir('.playwright/outbox')
  const messages = await Promise.all(
    files.map(async file => JSON.parse(await readFile(`.playwright/outbox/${file}`, 'utf8'))),
  )
  expect(messages.some(message =>
    message.recipient === 'secretary@samplvillages.org.nz' &&
    message.subject === 'Contact Form: Secretary mailbox delivery test',
  )).toBe(true)
})
