import { test, expect } from '@playwright/test'
import { loginPage, state, users, write } from './helpers'

const image = { name: 'unit.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP2cAAAAASUVORK5CYII=', 'base64') }
const fields = { village: 'Ngatea', unitNumber: 'Photo-form-E2E', address: 'Photo form test address', residentCount: '0', isVisibleOnMarketing: 'true', marketingTitle: 'Photo form test home', marketingDescription: 'Ten real upload slots' }

test('existing usernames with spaces log in without collapsing their identity', async ({ page, request }) => {
  const account = users().legacyResident
  const wrongName = await write(request, 'POST', '/api/login', { data: { userName: account.userName.replace(/ /g, ''), password: account.password } })
  expect(wrongName.status()).toBe(401)
  expect((await wrongName.json()).message).toBe('Invalid username or password.')
  await loginPage(page, { ...account, userName: `  ${account.userName.toUpperCase()}  ` })
  await expect(page).toHaveURL(/\/resident/)
  const session = await page.request.get('/api/session')
  expect(session.status()).toBe(200)
  expect((await session.json()).userName).toBe(account.userName)
})

test('legacy staff usernames still require MFA before any portal access', async ({ request }) => {
  const account = users().legacyManager
  const response = await write(request, 'POST', '/api/login', { data: { userName: account.userName, password: account.password } })
  expect(response.status()).toBe(202)
  expect((await response.json()).twoFactorRequired).toBe(true)
  expect((await request.get('/api/session')).status()).toBe(401)
  expect((await request.get('/api/village-properties/Ngatea')).status()).toBe(401)
})

test('a blank username shows the specific field error and keeps the user logged out', async ({ page }, testInfo) => {
  await page.goto('/login')
  await page.getByLabel('Username', { exact: true }).fill('   ')
  await page.getByLabel('Password', { exact: true }).fill('a-test-password')
  async function submit() {
    const response = page.waitForResponse(response => response.url().endsWith('/api/login') && response.request().method() === 'POST')
    await page.getByRole('button', { name: 'Login', exact: true }).click()
    return response
  }
  let response = await submit()
  if (response.status() === 429) { await page.waitForTimeout(61000); response = await submit() }
  expect(response.status()).toBe(400)
  await expect(page.getByText('Enter your username.', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Username', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('alert')).toContainText('highlighted fields')
  expect((await page.request.get('/api/session')).status()).toBe(401)
  await testInfo.attach('login-field-error', { body: await page.screenshot(), contentType: 'image/png' })
})

test.describe('unit photo editing', () => {
  test.use({ storageState: state('manager') })

  test('manager adds ten photos to a vacant unit, edits them and controls public visibility', async ({ page, browser }, testInfo) => {
    const publicContext = await browser.newContext({ baseURL: 'http://127.0.0.1:5173', storageState: { cookies: [], origins: [] } })
    const publicPage = await publicContext.newPage()
    let id: number | undefined
    try {
      await page.goto('/village-manager/my-village')
      const form = page.locator('form').filter({ has: page.getByLabel('Unit Number', { exact: true }) })
      await form.getByLabel('Unit Number', { exact: true }).fill(fields.unitNumber)
      await form.getByLabel('Address', { exact: true }).fill(fields.address)
      await expect(form.getByLabel('Number of Residents', { exact: true })).toHaveValue('0')
      await form.getByLabel('Village Manager', { exact: true }).selectOption('Test manager')
      await form.getByLabel('Marketing Title', { exact: true }).fill(fields.marketingTitle)
      await form.getByLabel('Marketing Description', { exact: true }).fill(fields.marketingDescription)
      await form.getByLabel('Show this property on the public Marketing page').check()
      const photos = Array.from({ length: 10 }, (_, index) => ({ ...image, name: `home-${index + 1}.png` }))
      await form.getByLabel('Add multiple unit photos', { exact: true }).setInputFiles([...photos, { ...image, name: 'eleventh.png' }])
      await expect(form.getByRole('alert')).toContainText('up to 10')
      await expect(form.getByText('0 of 10 photos', { exact: true })).toBeVisible()
      await form.getByLabel('Add multiple unit photos', { exact: true }).setInputFiles(photos)
      await expect(form.getByText('10 of 10 photos', { exact: true })).toBeVisible()
      await expect(form.getByRole('img', { name: /^Unit photo / })).toHaveCount(10)
      await form.getByRole('button', { name: 'Save Property', exact: true }).click()
      await expect(page.getByRole('status').filter({ hasText: 'Village property saved successfully.' })).toBeVisible()
      const records = await (await page.request.get('/api/village-properties/Ngatea')).json()
      const saved = records.find((property: any) => property.unitNumber === fields.unitNumber)
      id = saved.id
      expect(saved.residentCount).toBe(0)
      expect(saved.residentEmail).toBe('')
      expect(new Set(Array.from({ length: 10 }, (_, index) => saved[`marketingImageUrl${index + 1}`])).size).toBe(10)
      await page.getByRole('row').filter({ hasText: fields.unitNumber }).getByRole('button', { name: 'Edit', exact: true }).click()
      await expect(form.getByRole('img', { name: /^Unit photo / })).toHaveCount(10)
      await form.getByRole('button', { name: 'Remove photo 10', exact: true }).click()
      await form.getByRole('button', { name: 'Keep saved photo 10', exact: true }).click()
      await expect(form.getByText('10 of 10 photos', { exact: true })).toBeVisible()
      await form.getByRole('button', { name: 'Remove photo 10', exact: true }).click()
      await form.getByLabel('Marketing photo 1', { exact: true }).setInputFiles({ ...image, name: 'new-cover.png' })
      await form.getByRole('button', { name: 'Update Property', exact: true }).click()
      await expect(page.getByRole('status').filter({ hasText: 'Village property updated successfully.' })).toBeVisible()
      const changed = (await (await page.request.get('/api/village-properties/Ngatea')).json()).find((property: any) => property.id === id)
      expect(changed.marketingImageUrl10).toBe('')
      expect(changed.marketingImageUrl1).not.toBe(saved.marketingImageUrl1)
      expect(changed.marketingImageUrl2).toBe(saved.marketingImageUrl2)
      expect((await publicContext.request.get(saved.marketingImageUrl10)).status()).toBe(401)
      expect((await publicContext.request.get(saved.marketingImageUrl1)).status()).toBe(401)
      await publicPage.goto('/marketing')
      await publicPage.getByRole('button', { name: `View ${fields.marketingTitle}`, exact: true }).click()
      await expect(publicPage.getByRole('dialog').getByText('Image 1 of 9', { exact: true })).toBeVisible()
      await publicPage.getByRole('button', { name: 'Show image 9', exact: true }).click()
      await expect(publicPage.getByRole('dialog').getByText('Image 9 of 9', { exact: true })).toBeVisible()
      await page.getByRole('row').filter({ hasText: fields.unitNumber }).getByRole('button', { name: 'Edit', exact: true }).click()
      await form.getByText('9 of 10 photos', { exact: true }).scrollIntoViewIfNeeded()
      await testInfo.attach('unit-saved-photo-editor', { body: await page.screenshot(), contentType: 'image/png' })
      await page.setViewportSize({ width: 390, height: 844 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      await form.getByLabel('Show this property on the public Marketing page').uncheck()
      await form.getByRole('button', { name: 'Update Property', exact: true }).click()
      await expect(page.getByRole('status').filter({ hasText: 'Village property updated successfully.' })).toBeVisible()
      expect((await publicContext.request.get(changed.marketingImageUrl1)).status()).toBe(401)
      expect((await page.request.get(changed.marketingImageUrl1)).status()).toBe(200)
    } finally {
      if (id !== undefined) await write(page.request, 'DELETE', `/api/village-properties/${id}`)
      await publicContext.close()
    }
  })

  test('API rejects extra photo slots, duplicate uploads, invalid removal and unauthorized edits', async ({ request, playwright }) => {
    expect((await write(request, 'POST', '/api/village-properties', { multipart: { ...fields, marketingImage11: image } })).status()).toBe(400)
    const duplicate = new FormData()
    Object.entries(fields).forEach(([key, value]) => duplicate.append(key, value))
    duplicate.append('marketingImage1', new Blob([image.buffer]), 'one.png')
    duplicate.append('marketingImage1', new Blob([image.buffer]), 'two.png')
    expect((await write(request, 'POST', '/api/village-properties', { multipart: duplicate })).status()).toBe(400)
    expect((await write(request, 'POST', '/api/village-properties', { multipart: { ...fields, marketingImage1: image } })).status()).toBe(200)
    const saved = (await (await request.get('/api/village-properties/Ngatea')).json()).find((property: any) => property.unitNumber === fields.unitNumber)
    const path = `/api/village-properties/${saved.id}`
    try {
      for (const slot of ['0', '11']) expect((await write(request, 'PUT', path, { multipart: { ...fields, removeMarketingImages: slot } })).status()).toBe(400)
      expect((await write(request, 'PUT', path, { multipart: { ...fields, marketingImage1: image, removeMarketingImages: '1' } })).status()).toBe(400)
      expect((await request.put(path, { multipart: { ...fields, removeMarketingImages: '1' } })).status()).toBe(400)
      for (const role of ['resident', 'otherManager']) {
        const client = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173', storageState: state(role) })
        try { expect((await write(client, 'PUT', path, { multipart: { ...fields, removeMarketingImages: '1' } })).status()).toBe(403) }
        finally { await client.dispose() }
      }
      const unchanged = (await (await request.get('/api/village-properties/Ngatea')).json()).find((property: any) => property.id === saved.id)
      expect(unchanged.marketingImageUrl1).toBe(saved.marketingImageUrl1)
    } finally { await write(request, 'DELETE', path) }
  })
})
