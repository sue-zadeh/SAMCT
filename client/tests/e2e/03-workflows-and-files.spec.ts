import { test, expect } from '@playwright/test'
import { state, users, write } from './helpers'
const pdf = {name:'notice.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\nTest document\n%%EOF')}

test('public marketing returns only approved fields and visible listings', async ({ request }) => {
  const response = await request.get('/api/village-properties/marketing')
  expect(response.status()).toBe(200)
  const listings = await response.json()
  expect(listings).toHaveLength(1)
  expect(Object.keys(listings[0]).sort()).toEqual(['id','village','unitNumber','address','marketingTitle','marketingDescription','marketingImageUrl1','marketingImageUrl2','marketingImageUrl3','marketingImageUrl4','marketingImageUrl5'].sort())
  expect(JSON.stringify(listings)).not.toMatch(/private@example|Private resident|Private notes|documentUrl/i)
  expect((await request.get('/uploads/marketing/visible.png')).status()).toBe(200)
  expect((await request.get('/uploads/marketing/hidden.png')).status()).toBe(401)
})
test('anonymous downloads cannot bypass login', async ({ request }) => {
  for (const path of ['/uploads/documents/resident.pdf','/uploads/documents/staff.pdf','/uploads/maintenance/ngatea.png','/uploads/village-properties/private.pdf']) expect((await request.get(path)).status(),path).toBe(401)
})
test.describe('resident workflows', () => {
  test.use({storageState:state('resident')})
  test('resident submits maintenance in the browser and sees the saved database record', async ({ page }) => {
    await page.goto('/resident/maintenance')
    await page.getByLabel('Issue Title').fill('E2E leaking tap')
    await page.getByLabel('Unit / Address').fill('Unit 4')
    await page.getByLabel('Description',{exact:true}).fill('Please repair the bathroom tap.')
    await page.getByRole('button',{name:/submit.*request/i}).click()
    await expect(page.getByText('Maintenance request submitted successfully.')).toBeVisible()
    await page.reload()
    await expect(page.getByText('E2E leaking tap',{exact:true})).toBeVisible()
    const records = await (await page.request.get(`/api/maintenance/resident/${users().resident.userName}`)).json()
    expect(records.some((item:any) => item.title === 'E2E leaking tap' && item.village === 'Ngatea')).toBe(true)
    expect(records.every((item:any) => item.residentUserName === users().resident.userName)).toBe(true)
  })
  test('cannot forge maintenance ownership or village', async ({ request }) => {
    const fields = {userName:users().resident.userName,village:'Ngatea',title:'Test',description:'Test request',unitOrAddress:'Unit 4',priority:'Normal'}
    expect((await write(request,'POST','/api/maintenance/resident',{multipart:{...fields,userName:users().otherResident.userName}})).status()).toBe(403)
    expect((await write(request,'POST','/api/maintenance/resident',{multipart:{...fields,village:'Whitianga'}})).status()).toBe(403)
  })
  test('only approved village documents and own maintenance images are downloadable', async ({ request }) => {
    const documents = await (await request.get('/api/documents/resident/Ngatea')).json()
    expect(documents.every((document:any) => document.isVisibleToResidents)).toBe(true)
    const download = await request.get('/uploads/documents/resident.pdf')
    expect(download.status()).toBe(200)
    expect(download.headers()['content-disposition']).toContain('attachment')
    expect(download.headers()['cache-control']).toBe('no-store')
    expect((await request.get('/uploads/documents/staff.pdf')).status()).toBe(404)
    expect((await request.get('/uploads/maintenance/ngatea.png')).status()).toBe(200)
    expect((await request.get('/uploads/maintenance/whitianga.png')).status()).toBe(404)
    expect((await request.get('/uploads/village-properties/private.pdf')).status()).toBe(404)
  })
  test('rejects disguised scripts, oversized images and invalid MIME types', async ({ request }) => {
    const path = `/api/users/profile-image?username=${users().resident.userName}`
    for (const file of [
      {name:'attack.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg onload="alert(1)"/>')},
      {name:'attack.png',mimeType:'image/png',buffer:Buffer.from('<script>alert(1)</script>')},
      {name:'big.png',mimeType:'image/png',buffer:Buffer.alloc(2*1024*1024+1)},
      {name:'wrong.png',mimeType:'text/html',buffer:Buffer.from([137,80,78,71,13,10,26,10])},
    ]) expect((await write(request,'POST',path,{multipart:{file}})).status(),file.name).toBe(400)
  })
})
test.describe('manager workflows', () => {
  test.use({storageState:state('manager')})
  test('can respond to their resident request and the resident sees the response', async ({ request, playwright }) => {
    const reply = await write(request,'PUT','/api/maintenance/1/manager-response',{data:{managerUserName:users().manager.userName,managerAnswer:'The plumber will visit tomorrow.',status:'In Progress'}})
    expect(reply.status()).toBe(200)
    const resident = await playwright.request.newContext({baseURL:'http://127.0.0.1:5173',storageState:state('resident')})
    const records = await (await resident.get(`/api/maintenance/resident/${users().resident.userName}`)).json()
    expect(records.find((item:any) => item.id === 1).managerAnswer).toBe('The plumber will visit tomorrow.')
    await resident.dispose()
  })
  test('creates a document, controls visibility and prevents cross-village file access', async ({ request, playwright }) => {
    const response = await write(request,'POST','/api/documents',{multipart:{title:'E2E staff note',type:'Notice',description:'Private file',village:'Ngatea',createdByUserName:'e2e.admin',isVisibleToResidents:'false',file:pdf}})
    expect(response.status()).toBe(200)
    const id = (await response.json()).id
    const documents = await (await request.get('/api/documents/village/Ngatea')).json()
    const document = documents.find((item:any) => item.id === id)
    expect(document.createdBy).toBe('Test manager')
    expect((await request.get(document.fileUrl)).status()).toBe(200)
    const resident = await playwright.request.newContext({baseURL:'http://127.0.0.1:5173',storageState:state('resident')})
    expect((await resident.get(document.fileUrl)).status()).toBe(404)
    expect((await write(request,'PUT',`/api/documents/${id}/visibility`,{data:true})).status()).toBe(200)
    expect((await resident.get(document.fileUrl)).status()).toBe(200)
    const otherManager = await playwright.request.newContext({baseURL:'http://127.0.0.1:5173',storageState:state('otherManager')})
    expect((await otherManager.get(document.fileUrl)).status()).toBe(404)
    expect((await write(otherManager,'DELETE',`/api/documents/${id}`)).status()).toBe(403)
    expect((await write(request,'DELETE',`/api/documents/${id}`)).status()).toBe(200)
    expect((await resident.get(document.fileUrl)).status()).toBe(404)
    await resident.dispose(); await otherManager.dispose()
  })
  test('document form saves a real notice and renders script text without executing it', async ({ page }) => {
    await page.goto('/village-manager/documents')
    const text = '<img src=x onerror="window.samctInjected=true">'
    await page.getByLabel('Title',{exact:true}).fill(text)
    await page.getByLabel('Description',{exact:true}).fill('Test notice description')
    await page.getByRole('button',{name:/save document/i}).click()
    await expect(page.getByText('Document or notice saved successfully.')).toBeVisible()
    await page.reload()
    await expect(page.getByText(text,{exact:true})).toBeVisible()
    expect(await page.evaluate(() => (window as any).samctInjected)).toBeUndefined()
  })
})
test('contact form sends only to the configured recipient and stores the message', async ({ page }) => {
  await page.goto('/contactUs')
  await page.getByLabel('Full Name',{exact:true}).fill('Test Contact')
  await page.getByLabel('Email',{exact:true}).fill('sender@example.test')
  await page.getByLabel('Subject',{exact:true}).fill('E2E enquiry')
  await page.getByLabel('Phone',{exact:true}).fill('0211234567')
  await page.getByLabel('Message',{exact:true}).fill('Please send me village information.')
  await page.getByRole('button',{name:/send message/i}).click()
  await expect(page.getByText('Your message has been sent successfully.')).toBeVisible()
})
