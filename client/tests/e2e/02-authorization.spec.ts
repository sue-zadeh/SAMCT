import { test, expect } from '@playwright/test'
import { order, state, users, write } from './helpers'

for (const role of ['admin','financial','chairman','genericAdmin']) {
  test(`${role} can read administration data`, async ({ playwright }) => {
    const client = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:5173', storageState: state(role) })
    for (const path of ['/api/users','/api/documents/admin','/api/purchase-orders/admin/all','/api/village-properties/admin/all','/api/maintenance/summary/admin']) expect((await client.get(path)).status()).toBe(200)
    await client.dispose()
  })
}
test('every private data family rejects anonymous access', async ({ request }) => {
  for (const path of ['/api/users','/api/users/by-village/Ngatea','/api/users/profile/e2e.resident','/api/maintenance/resident/e2e.resident','/api/maintenance/village/Ngatea','/api/maintenance/summary/admin','/api/documents/admin','/api/documents/resident/Ngatea','/api/village-properties/Ngatea','/api/village-properties/admin/all','/api/purchase-orders/village/Ngatea','/api/purchase-orders/admin/all']) {
    expect((await request.get(path)).status(), path).toBe(401)
  }
  expect((await request.put('/api/users/1', { data: { role: 'Admin' } })).status()).toBe(401)
})
test.describe('resident boundaries', () => {
  test.use({ storageState: state('resident') })
  test('cannot read or edit another resident, village or staff data', async ({ request }) => {
    for (const path of ['/api/users', '/api/users/profile/e2e.otherresident', '/api/maintenance/resident/e2e.otherresident','/api/maintenance/summary/resident/e2e.otherresident','/api/documents/resident/Whitianga','/api/documents/village/Ngatea','/api/village-properties/Ngatea','/api/purchase-orders/village/Ngatea']) expect((await request.get(path)).status(), path).toBe(403)
    expect((await write(request, 'POST', '/api/purchase-orders', { data: order() })).status()).toBe(403)
    expect((await write(request, 'PUT', `/api/users/${users().resident.id}`, { data: { ...users().resident, firstName:'Test',lastName:'Resident',role:'CompanySecretary',isActive:true } })).status()).toBe(403)
  })
  test('cannot change village or edit another profile through the profile endpoint', async ({ request }) => {
    const profile = await (await request.get('/api/session')).json()
    expect((await write(request, 'PUT', '/api/users/profile', { data: { ...profile, currentUsername: profile.userName, village: 'Whitianga' } })).status()).toBe(403)
    expect((await write(request, 'PUT', '/api/users/profile', { data: { ...profile, currentUsername: users().otherResident.userName } })).status()).toBe(403)
    expect((await write(request, 'PUT', '/api/users/profile', { data: { ...profile, currentUsername: profile.userName, email:'changed@example.test' } })).status()).toBe(400)
  })
  test('cannot open staff pages after changing localStorage', async ({ page }) => {
    await page.goto('/resident')
    await page.evaluate(() => { localStorage.setItem('role', 'CompanySecretary'); localStorage.setItem('village', 'Whitianga') })
    await page.goto('/admin/people')
    await expect(page).toHaveURL(/\/resident$/)
    expect((await page.request.get('/api/users')).status()).toBe(403)
  })
})
test.describe('manager boundaries', () => {
  test.use({ storageState: state('manager') })
  test('cannot read another village or global administration endpoints', async ({ request }) => {
    for (const path of ['/api/users', '/api/users/by-village/Whitianga','/api/village-manager/dashboard-stats/Whitianga','/api/village/Whitianga/summary','/api/maintenance/village/Whitianga','/api/maintenance/summary/village/Whitianga','/api/documents/village/Whitianga','/api/village-properties/Whitianga','/api/purchase-orders/village/Whitianga','/api/purchase-orders/admin/all']) expect((await request.get(path)).status(), path).toBe(403)
  })
  test('cannot change ownership or edit/delete records in another village', async ({ request }) => {
    expect((await write(request, 'POST', '/api/purchase-orders', { data: order('Whitianga') })).status()).toBe(403)
    expect((await write(request, 'PUT', '/api/purchase-orders/2', { data: order() })).status()).toBe(403)
    expect((await write(request, 'DELETE', '/api/purchase-orders/2')).status()).toBe(403)
    expect((await write(request, 'DELETE', '/api/village-properties/2')).status()).toBe(403)
    expect((await write(request, 'PUT', '/api/maintenance/3/manager-response', { data: {managerUserName: users().manager.userName,managerAnswer:'Changed',status:'Completed'} })).status()).toBe(403)
  })
  test('cannot promote a resident or move them into another village', async ({ request }) => {
    const resident = (await (await request.get('/api/users/by-village/Ngatea')).json()).find((item: any) => item.id === users().resident.id)
    expect((await write(request, 'PUT', `/api/users/${resident.id}`, { data: {...resident,role:'CompanySecretary'} })).status()).toBe(403)
    expect((await write(request, 'PUT', `/api/users/${resident.id}`, { data: {...resident,village:'Whitianga'} })).status()).toBe(403)
  })
  test('can create, update and delete their own village purchase order; identity comes from the session', async ({ request }) => {
    const created = await write(request, 'POST', '/api/purchase-orders', {data:{...order(),createdByUserName:'e2e.admin',id:9999,createdAt:'2000-01-01'}})
    expect(created.status()).toBe(200)
    const id = (await created.json()).id
    const orders = await (await request.get('/api/purchase-orders/village/Ngatea')).json()
    expect(orders.find((item:any) => item.id === id).createdByUserName).toBe(users().manager.userName)
    expect((await write(request, 'PUT', `/api/purchase-orders/${id}`, {data:{...order(),estimatedCost:150}})).status()).toBe(200)
    expect((await write(request, 'DELETE', `/api/purchase-orders/${id}`)).status()).toBe(200)
    expect((await write(request, 'POST', '/api/purchase-orders', {data:{...order(),estimatedCost:-1}})).status()).toBe(400)
  })
})
test('deactivating an account revokes an already issued cookie', async ({ playwright }) => {
  const admin = await playwright.request.newContext({ baseURL:'http://127.0.0.1:5173', storageState:state('admin') })
  const profile = (await (await admin.get('/api/users')).json()).find((item:any) => item.id === users().otherResident.id)
  expect((await write(admin, 'PUT', `/api/users/${profile.id}`, {data:{...profile,isActive:false}})).status()).toBe(200)
  const oldSession = await playwright.request.newContext({baseURL:'http://127.0.0.1:5173',storageState:state('otherResident')})
  expect((await oldSession.get('/api/session')).status()).toBe(401)
  await oldSession.dispose(); await admin.dispose()
})
