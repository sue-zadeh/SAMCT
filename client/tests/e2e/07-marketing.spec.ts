import { test, expect, type APIRequestContext } from '@playwright/test'
import { state, write } from './helpers'

const image = { name: 'home.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP2cAAAAASUVORK5CYII=', 'base64') }
const propertyFields = { village: 'Ngatea', unitNumber: 'Gallery-E2E', address: 'Gallery test address', residentCount: '0', isVisibleOnMarketing: 'true', marketingTitle: 'Ten-photo test home', marketingDescription: 'Gallery verification' }
const brochureFields = { title: 'Hale Place', description: 'Test description', address: 'Hale Place, Ngatea', availability: 'Enquire', sourceLabel: 'E2E review', isPublished: 'true' }
async function brochure(request: APIRequestContext) { return (await request.get('/api/marketing-content')).json() }

test('brochure migration exposes the five areas and preserves dated unit prices and under-offer labels', async ({ request, page }) => {
  const entries = await brochure(request)
  expect(entries.filter((entry: any) => entry.kind === 'area').map((entry: any) => entry.title)).toEqual(['Hale Place', 'Weddell Place', 'Masonic Place', 'Lodge Drive', 'Masons Way'])
  const adverts = entries.filter((entry: any) => entry.kind === 'unit')
  expect(adverts.map((entry: any) => [entry.title, entry.priceNzd, entry.availability])).toEqual([
    ['11 Masons Way, Ngatea', 690000, 'Under offer'], ['1A Masons Way, Ngatea', 620000, 'Applications invited'],
    ['4 Masonic Place, Ngatea', 595000, 'Under offer'], ['14 Masonic Place, Ngatea', 595000, 'Under offer'],
  ])
  expect(adverts.every((entry: any) => entry.sourceLabel === 'September 2026 brochure')).toBe(true)
  expect(JSON.stringify(entries)).not.toMatch(/residentEmail|residentName|documentUrl|Private notes/)
  await page.goto('/marketing')
  await expect(page.getByRole('heading', { name: 'Ngatea Independent Lifestyle Village', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hale Place', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'View Hale Place', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Photo 1 of 4')).toBeVisible()
  await dialog.getByRole('button', { name: 'Show photo 4', exact: true }).click()
  await expect(dialog.getByText('Photo 4 of 4')).toBeVisible()
  await expect.poll(() => dialog.locator('img').first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: 'View Hale Place', exact: true })).toBeFocused()
  await page.getByRole('button', { name: 'Whitianga', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Hale Place', exact: true })).toHaveCount(0)
  await expect(page.getByText('No homes are currently listed for this village. Contact SAMCT to ask about availability.')).toBeVisible()
})

test('marketing reports an API outage and retries instead of showing a false empty listing', async ({ page }) => {
  await page.route('**/api/marketing-content', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
  await page.goto('/marketing')
  await expect(page.getByRole('alert')).toContainText('could not connect')
  await expect(page.getByText(/No homes are currently listed/)).toHaveCount(0)
  await page.unroute('**/api/marketing-content')
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Hale Place', exact: true })).toBeVisible()
})

test.describe('marketing access and uploads', () => {
  test.use({ storageState: state('manager') })

  test('all ten property photos persist, display, and follow publication permissions', async ({ request, playwright }) => {
    const multipart: Record<string, string | typeof image> = { ...propertyFields }
    for (let index = 1; index <= 10; index++) multipart[`marketingImage${index}`] = { ...image, name: `photo-${index}.png` }
    expect((await write(request, 'POST', '/api/village-properties', { multipart })).status()).toBe(200)
    const records = await (await request.get('/api/village-properties/Ngatea')).json()
    const created = records.find((entry: any) => entry.unitNumber === 'Gallery-E2E')
    const publicClient = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
    try {
      const entries = await (await publicClient.get('/api/village-properties/marketing')).json()
      const published = entries.find((entry: any) => entry.id === created.id)
      expect(new Set(Array.from({ length: 10 }, (_, index) => published[`marketingImageUrl${index + 1}`])).size).toBe(10)
      for (const slot of [6, 10]) expect((await publicClient.get(published[`marketingImageUrl${slot}`])).status()).toBe(200)
      expect((await write(request, 'PUT', `/api/village-properties/${created.id}`, { multipart: { ...propertyFields, marketingImage10: image } })).status()).toBe(200)
      const changed = (await (await request.get('/api/village-properties/Ngatea')).json()).find((entry: any) => entry.id === created.id)
      expect(changed.marketingImageUrl1).toBe(created.marketingImageUrl1)
      expect(changed.marketingImageUrl10).not.toBe(created.marketingImageUrl10)
      expect((await write(request, 'PUT', `/api/village-properties/${created.id}/marketing-visibility`, { data: { isVisibleOnMarketing: false } })).status()).toBe(200)
      expect((await publicClient.get(changed.marketingImageUrl10)).status()).toBe(401)
      expect((await request.get(changed.marketingImageUrl10)).status()).toBe(200)
    } finally {
      await write(request, 'DELETE', `/api/village-properties/${created.id}`)
      await publicClient.dispose()
    }
  })

  test('brochure editing rejects other roles, other villages, missing CSRF and foreign image URLs', async ({ request, playwright }) => {
    const entries = await (await request.get('/api/marketing-content/manage/Ngatea')).json()
    const entry = entries.find((item: any) => item.kind === 'area')
    const foreignImage = entries.find((item: any) => item.id !== entry.id && item.images.length).images[0]
    const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
    expect((await anonymous.get('/api/marketing-content/manage/Ngatea')).status()).toBe(401)
    expect((await write(anonymous, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: brochureFields })).status()).toBe(401)
    await anonymous.dispose()
    for (const account of ['resident', 'otherManager']) {
      const client = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173', storageState: state(account) })
      expect((await client.get('/api/marketing-content/manage/Ngatea')).status()).toBe(403)
      expect((await write(client, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: brochureFields })).status()).toBe(403)
      await client.dispose()
    }
    expect((await request.put(`/api/marketing-content/${entry.id}`, { multipart: brochureFields })).status()).toBe(400)
    expect((await write(request, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: { ...brochureFields, retainedImages: foreignImage } })).status()).toBe(400)
    const invalidImage = { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('<script>unsafe</script>') }
    expect((await write(request, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: { ...brochureFields, photos: invalidImage } })).status()).toBe(400)
    expect((await (await request.get('/api/marketing-content/manage/Ngatea')).json()).find((item: any) => item.id === entry.id).images).toEqual(entry.images)
  })

  test('manager edits brochure text and ten photos in the browser, and can unpublish them', async ({ page, playwright }) => {
    const entries = await (await page.request.get('/api/marketing-content/manage/Ngatea')).json()
    const entry = entries.find((item: any) => item.kind === 'area')
    const publicClient = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173' })
    let uploadedImages: string[] = []
    try {
      await page.goto('/village-manager/my-village')
      await page.getByText('Manage brochure content — Ngatea', { exact: true }).click()
      await expect(page.getByLabel('Brochure entry')).toBeEnabled()
      await page.getByLabel('Brochure entry').selectOption(String(entry.id))
      await page.getByLabel('Title', { exact: true }).fill('Hale Place — reviewed')
      await page.getByLabel('Add photos').setInputFiles(Array.from({ length: 7 }, (_, index) => ({ ...image, name: `too-many-${index}.png` })))
      await page.getByRole('button', { name: 'Save brochure entry', exact: true }).click()
      await expect(page.getByRole('alert')).toContainText('at most 10 photos')
      await page.getByLabel('Add photos').setInputFiles(Array.from({ length: 6 }, (_, index) => ({ ...image, name: `new-${index}.png` })))
      await page.getByRole('button', { name: 'Save brochure entry', exact: true }).click()
      await expect(page.getByRole('status')).toContainText('Marketing content saved.')
      const saved = (await brochure(publicClient)).find((item: any) => item.id === entry.id)
      expect(saved.images).toHaveLength(10)
      uploadedImages = saved.images.slice(4)
      await page.goto('/marketing')
      await page.getByRole('button', { name: 'View Hale Place — reviewed', exact: true }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: 'Show photo 10', exact: true }).click()
      await expect(dialog.getByText('Photo 10 of 10')).toBeVisible()
      await expect.poll(() => dialog.locator('img').first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
      const hidden = new FormData()
      for (const [key, value] of Object.entries({ ...brochureFields, title: saved.title, isPublished: 'false' })) hidden.append(key, value)
      saved.images.forEach((image: string) => hidden.append('retainedImages', image))
      expect((await write(page.request, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: hidden })).status()).toBe(200)
      expect((await publicClient.get(uploadedImages[5])).status()).toBe(401)
      expect((await brochure(publicClient)).some((item: any) => item.id === entry.id)).toBe(false)
      // Server-side limit is independent of the browser's validation.
      const oversized = new FormData()
      for (const [key, value] of Object.entries(brochureFields)) oversized.append(key, value)
      saved.images.forEach((image: string) => oversized.append('retainedImages', image))
      oversized.append('photos', new Blob([image.buffer], { type: 'image/png' }), 'eleventh.png')
      expect((await write(page.request, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: oversized })).status()).toBe(400)
    } finally {
      const restore = new FormData()
      for (const [key, value] of Object.entries({ ...brochureFields, title: entry.title, description: entry.description, sourceLabel: entry.sourceLabel })) restore.append(key, value)
      entry.images.forEach((image: string) => restore.append('retainedImages', image))
      expect((await write(page.request, 'PUT', `/api/marketing-content/${entry.id}`, { multipart: restore })).status()).toBe(200)
      await publicClient.dispose()
    }
  })
})
