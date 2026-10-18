import { test, expect, type Page, type Locator } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import {
  csrf,
  loginApi,
  loginPage,
  read,
  state,
  users,
  waitForRateLimitWindow,
  write,
} from './helpers'

test.setTimeout(240000)
// This file follows the bulk photo workflows on the same IP. Start its browser
// sessions in a fresh real limiter window; API reads below also honor 429.
test.beforeAll(async () => {
  await waitForRateLimitWindow()
})
const image = {
  name: 'avatar.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP2cAAAAASUVORK5CYII=',
    'base64',
  ),
}
async function submit(
  page: Page,
  path: string,
  button: Locator,
  expected = 200,
  prepare?: () => Promise<void>,
) {
  const click = async () => {
    await csrf(page.request)
    await prepare?.()
    const result = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === path &&
        response.request().method() !== 'GET',
    )
    await button.click()
    return result
  }
  let response = await click()
  // Keep real throttling enabled; wait for its window, never retry failed assertions.
  if (response.status() === 429) {
    await page.waitForTimeout(61000)
    response = await click()
  }
  // Do not wait for a browser response body that the app may discard after save.
  // Each workflow below checks the actual persisted result as well as the status.
  expect(response.status()).toBe(expected)
  return response
}

test('new usernames require five characters and case variants cannot create duplicate accounts', async ({
  page,
  request,
}) => {
  await page.goto('/register')
  await expect(page.getByLabel('Username', { exact: true })).toHaveAttribute(
    'minlength',
    '5',
  )
  const fields = {
    userName: 'four',
    firstName: 'Test',
    lastName: 'Person',
    email: 'short-new@example.test',
    village: 'Ngatea',
    role: 'Resident',
    password: users().resident.password,
  }
  expect(
    (
      await write(request, 'POST', '/api/register', { multipart: fields })
    ).status(),
  ).toBe(400)
  expect(
    (
      await write(request, 'POST', '/api/register', {
        multipart: { ...fields, userName: 'five5' },
      })
    ).status(),
  ).toBe(200)
  expect(
    (
      await write(request, 'POST', '/api/register', {
        multipart: {
          ...fields,
          userName: 'FIVE5',
          email: 'different-case@example.test',
        },
      })
    ).status(),
  ).toBe(409)
  const account = users().resident
  expect(
    (
      await write(request, 'POST', '/api/login', {
        data: {
          userName: account.userName.toUpperCase(),
          password: account.password.toUpperCase(),
        },
      })
    ).status(),
  ).toBe(401)
  await loginPage(page, {
    ...account,
    userName: account.userName.toUpperCase(),
  })
  await expect(page).toHaveURL(/\/resident$/)
})

test('an existing short username can still log in, save a profile, request maintenance and change password', async ({
  page,
}) => {
  const account = users().shortLegacy
  await loginPage(page, { ...account, userName: 'OLD' })
  await expect(page).toHaveURL(/\/resident$/)
  await page.goto('/resident/profile/edit')
  await page.getByLabel('First Name', { exact: true }).fill('Legacy')
  await submit(
    page,
    '/api/users/profile',
    page.getByRole('button', { name: 'Save Changes', exact: true }),
  )
  await expect(page).toHaveURL(/\/resident\/profile$/)
  await page.goto('/resident/maintenance')
  await page.getByLabel('Issue Title').fill('Legacy account repair')
  await page.getByLabel('Unit / Address').fill('Unit 2')
  await page
    .getByLabel('Description', { exact: true })
    .fill('Please fix the tap.')
  await submit(
    page,
    '/api/maintenance/resident',
    page.getByRole('button', { name: /submit.*request/i }),
  )
  await page.goto('/resident/profile/password')
  await page
    .getByLabel('Current Password', { exact: true })
    .fill(account.password)
  await page
    .getByLabel('New Password', { exact: true })
    .fill('Legacy-updated-password-123')
  await page
    .getByLabel('Confirm New Password', { exact: true })
    .fill('Legacy-updated-password-123')
  await submit(
    page,
    '/api/users/password',
    page.getByRole('button', { name: 'Save Password' }),
  )
  await expect(page).toHaveURL(/\/login$/)
})

for (const [key, area] of [
  ['uiResident', 'resident'],
  ['uiManager', 'village-manager'],
  ['uiAdmin', 'admin'],
]) {
  test(`${area} profile, photo and password forms save real data and revoke old sessions`, async ({
    page,
    request,
  }) => {
    const account = users()[key]
    await loginApi(page.request, account)
    await page.goto(`/${area}/profile/edit`)
    await page.getByLabel('First Name', { exact: true }).fill(`Edited ${area}`)
    await submit(
      page,
      '/api/users/profile',
      page.getByRole('button', { name: 'Save Changes', exact: true }),
    )
    await expect(page).toHaveURL(new RegExp(`/${area}/profile$`))
    expect(
      (await (await read(page.request, '/api/session')).json()).firstName,
    ).toBe(`Edited ${area}`)
    const upload = page.waitForResponse(
      (response) =>
        response.url().includes('/api/users/profile-image') &&
        response.request().method() === 'POST',
    )
    await page.locator('input[type=file]').setInputFiles(image)
    const uploaded = await upload
    expect(uploaded.status(), await uploaded.text()).toBe(200)
    const profile = await uploaded.json()
    expect((await read(page.request, profile.profileImageUrl)).status()).toBe(
      200,
    )
    expect((await read(request, profile.profileImageUrl)).status()).toBe(401)
    await page.reload()
    await expect(
      page.locator(`img[src="${profile.profileImageUrl}"]`).first(),
    ).toBeVisible()
    await page.goto(`/${area}/profile/password`)
    await page.getByRole('button', { name: 'Save Password' }).click()
    await expect(page.getByRole('alert')).toContainText(
      'fill all password fields',
    )
    const password = `New-${key}-password-123`
    await page
      .getByLabel('Current Password', { exact: true })
      .fill('wrong-current-password')
    await page.getByLabel('New Password', { exact: true }).fill(password)
    await page
      .getByLabel('Confirm New Password', { exact: true })
      .fill(password)
    await submit(
      page,
      '/api/users/password',
      page.getByRole('button', { name: 'Save Password' }),
      400,
    )
    await expect(page.getByRole('alert')).toContainText(
      'Current password is incorrect',
    )
    await page
      .getByLabel('Current Password', { exact: true })
      .fill(account.password)
    await submit(
      page,
      '/api/users/password',
      page.getByRole('button', { name: 'Save Password' }),
    )
    await expect(page).toHaveURL(/\/login$/)
    expect((await read(page.request, '/api/session')).status()).toBe(401)
    await loginPage(page, { ...account, password })
    await expect(page).toHaveURL(new RegExp(`/${area}$`))
  })
}

test('forgot and reset password forms deliver a single-use link and accept the new password', async ({
  page,
}) => {
  const account = users().uiReset
  await page.goto('/forgot-password')
  await page.getByRole('button', { name: 'Send Reset Link' }).click()
  await expect(page.getByRole('alert')).toContainText('enter your email')
  await page.getByLabel('Email', { exact: true }).fill(account.email)
  await submit(
    page,
    '/api/forgot-password',
    page.getByRole('button', { name: 'Send Reset Link' }),
  )
  await expect(page.getByRole('status')).toContainText('If this email exists')
  const messages = await Promise.all(
    (await readdir('.playwright/outbox')).map(async (file) =>
      JSON.parse(await readFile(`.playwright/outbox/${file}`, 'utf8')),
    ),
  )
  const token = messages
    .find((message) => message.recipient === account.email)
    .body.match(/reset-password\/([A-F0-9]{64})/)[1]
  await page.goto(`/reset-password/${token}`)
  const password = 'Browser-reset-password-123'
  await page.getByLabel('New Password', { exact: true }).fill(password)
  await page
    .getByLabel('Confirm Password', { exact: true })
    .fill('Mismatch-password-123')
  await page
    .getByRole('button', { name: 'Reset Password', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('Passwords do not match')
  await page.getByLabel('Confirm Password', { exact: true }).fill(password)
  await submit(
    page,
    '/api/reset-password',
    page.getByRole('button', { name: 'Reset Password', exact: true }),
  )
  await expect(page).toHaveURL(/\/login$/)
  expect(
    (
      await write(page.request, 'PUT', '/api/reset-password', {
        data: { token, newPassword: password },
      })
    ).status(),
  ).toBe(400)
  await loginPage(page, { ...account, password })
  await expect(page).toHaveURL(/\/resident$/)
})

test('changing recovery email in the profile form requires the password and signs the account out', async ({
  page,
}) => {
  const account = users().uiEmail
  await loginApi(page.request, account)
  await page.goto('/resident/profile/edit')
  await page
    .getByLabel('Email', { exact: true })
    .fill('updated-browser-email@example.test')
  await submit(
    page,
    '/api/users/profile',
    page.getByRole('button', { name: 'Save Changes', exact: true }),
    400,
  )
  await expect(page.getByRole('alert')).toContainText('current password')
  expect((await (await read(page.request, '/api/session')).json()).email).toBe(
    account.email,
  )
  await page
    .getByLabel('Current password (required when changing your email)')
    .fill(account.password)
  await submit(
    page,
    '/api/users/profile',
    page.getByRole('button', { name: 'Save Changes', exact: true }),
  )
  await expect(page).toHaveURL(/\/login\?emailUpdated=true$/)
  await expect(page.getByRole('status')).toContainText(
    'Email updated. Please sign in again.',
  )
  expect((await read(page.request, '/api/session')).status()).toBe(401)
})

for (const [key, path, target] of [
  ['manager', '/village-manager/residents', 'managedByManager'],
  ['admin', '/admin/people', 'managedByAdmin'],
]) {
  test(`${key} user management saves only edited accounts and activates the selected resident`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:5173',
      storageState: state(key),
    })
    const page = await context.newPage()
    try {
      const account = users()[target]
      await page.goto(path)
      await expect(
        page.getByRole('button', { name: 'Save All Changes' }),
      ).toBeDisabled()
      const row = page
        .getByRole('row')
        .filter({
          has: page.getByLabel(`Username for ${account.userName}`, {
            exact: true,
          }),
        })
      await row
        .getByLabel(`First Name for ${account.userName}`, { exact: true })
        .fill('Approved')
      await row.getByRole('button', { name: 'Activate', exact: true }).click()
      const writes: string[] = []
      page.on('request', (request) => {
        if (request.method() === 'PUT')
          writes.push(new URL(request.url()).pathname)
      })
      await submit(
        page,
        `/api/users/${account.id}`,
        page.getByRole('button', { name: 'Save All Changes' }),
      )
      await expect(page.getByRole('status')).toContainText('saved successfully')
      expect(writes).toEqual([`/api/users/${account.id}`])
      await page.reload()
      await expect(
        row.getByLabel(`First Name for ${account.userName}`, { exact: true }),
      ).toHaveValue('Approved')
      await expect(
        row.getByRole('button', { name: 'Deactivate', exact: true }),
      ).toBeVisible()
      if (key === 'manager') {
        await expect(
          row.getByLabel(`Role for ${account.userName}`, { exact: true }),
        ).toBeDisabled()
        await expect(
          page.getByLabel(
            `Username for ${users().otherVillageResident.userName}`,
            { exact: true },
          ),
        ).toHaveCount(0)
      }
      const rejected = await write(
        page.request,
        'PUT',
        `/api/users/${account.id}`,
        {
          data: {
            ...account,
            firstName: 'Approved',
            lastName: target,
            isActive: true,
            userName: 'four',
          },
        },
      )
      expect(rejected.status()).toBe(400)
    } finally {
      await context.close()
    }
  })
}

for (const [key, area] of [
  ['manager', 'village-manager'],
  ['admin', 'admin'],
]) {
  test(`${area} purchase-order form creates, edits and deletes an order with decimal cost`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://127.0.0.1:5173',
      storageState: state(key),
    })
    const page = await context.newPage()
    try {
      await page.goto(`/${area}/purchase-orders`)
      const title = `Browser ${area} purchase`
      await page.getByLabel('Title', { exact: true }).fill(title)
      await page.getByLabel('Unit Number').fill('7')
      await page
        .getByLabel('Category', { exact: true })
        .selectOption('Plumbing')
      await page.getByLabel('Supplier', { exact: true }).fill('Test plumber')
      await page.getByLabel('Estimated Cost').fill('125.50')
      await page
        .getByLabel('Notes', { exact: true })
        .fill('Please repair the tap.')
      await submit(
        page,
        '/api/purchase-orders',
        page.getByRole('button', { name: 'Save Purchase Order' }),
      )
      const row = page.getByRole('row').filter({ hasText: title })
      await expect(row).toContainText('125.5')
      await row.getByRole('button', { name: 'Edit', exact: true }).click()
      await page.getByLabel('Estimated Cost').fill('0')
      await page.getByRole('button', { name: 'Update Purchase Order' }).click()
      await expect(page.getByRole('status')).toContainText('updated')
      await page.reload()
      await expect(row).toContainText('$0')
      page.once('dialog', (dialog) => dialog.accept())
      await row.getByRole('button', { name: 'Delete', exact: true }).click()
      await expect(row).toHaveCount(0)
    } finally {
      await context.close()
    }
  })
}

test('manager response form saves the displayed status and the resident sees the reply', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: 'http://127.0.0.1:5173',
    storageState: state('manager'),
  })
  const resident = await browser.newContext({
    baseURL: 'http://127.0.0.1:5173',
  })
  try {
    // The authorization suite deliberately deactivates otherResident. This
    // workflow owns a separate account and creates its own maintenance request.
    const account = users().uiMaintenance
    await loginApi(resident.request, account)
    const title = 'Browser manager response request'
    expect(
      (
        await write(resident.request, 'POST', '/api/maintenance/resident', {
          multipart: {
            userName: account.userName,
            village: account.village,
            title,
            description: 'A leaking tap',
            unitOrAddress: 'Unit 1',
            priority: 'Normal',
          },
        })
      ).status(),
    ).toBe(200)
    const records = await (
      await read(
        resident.request,
        `/api/maintenance/resident/${account.userName}`,
      )
    ).json()
    const created = records.find(
      (record: { title: string }) => record.title === title,
    )
    expect(created).toBeTruthy()
    const page = await context.newPage()
    await page.goto('/village-manager/maintenance')
    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row.getByRole('combobox')).toHaveValue('Pending')
    await row
      .getByPlaceholder('Write update or resolution...')
      .fill('Browser response; visit booked.')
    await submit(
      page,
      `/api/maintenance/${created.id}/manager-response`,
      row.getByRole('button', { name: 'Save Response' }),
    )
    await expect(row.getByRole('combobox')).toHaveValue('Pending')
    const residentPage = await resident.newPage()
    await residentPage.goto('/resident/maintenance')
    await expect(
      residentPage.getByText('Browser response; visit booked.', {
        exact: true,
      }),
    ).toBeVisible()
  } finally {
    await context.close()
    await resident.close()
  }
})

test('account security links directly to password change with no authenticator form', async ({
  page,
}) => {
  await loginApi(page.request, users().uiSecurity)
  await page.goto('/account/security')
  await expect(
    page.getByRole('heading', { name: 'Account security' }),
  ).toBeVisible()
  await expect(
    page.getByText(/authenticator|recovery code|QR code/i),
  ).toHaveCount(0)
  await page.getByRole('link', { name: 'Change password', exact: true }).click()
  await expect(page).toHaveURL(/\/resident\/profile\/password$/)
  await expect(
    page.getByLabel('Current Password', { exact: true }),
  ).toBeVisible()
})
