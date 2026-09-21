import { test, expect } from '@playwright/test'
import { csrf, users, write } from './helpers'
test('repeated incorrect passwords lock the account, including attempts with the right password', async ({ request }) => {
  test.setTimeout(150000)
  const account = users().lockout
  for (let attempt=0;attempt<5;attempt++) {
    const response = await write(request,'POST','/api/login',{data:{userName:account.userName,password:'Incorrect-password-123'}})
    expect(response.status()).toBe(401)
  }
  expect((await write(request,'POST','/api/login',{data:{userName:account.userName,password:account.password}})).status()).toBe(401)
})
test('authentication endpoint rate limiting returns 429 and Retry-After', async ({ request }) => {
  const token = await csrf(request)
  let blocked = false
  for (let attempt=0;attempt<21;attempt++) {
    const response = await request.post('/api/login',{headers:{'X-CSRF-TOKEN':token},data:{userName:'e2e.missing',password:'Wrong-password-123'}})
    if (response.status() === 429) {
      expect(response.headers()['retry-after']).toBe('60'); blocked=true; break
    }
    expect(response.status()).toBe(401)
  }
  expect(blocked).toBe(true)
})
