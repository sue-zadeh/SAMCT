import { request } from '@playwright/test'
import { loginApi, state, users } from './helpers'
export default async function setup() {
  // API sessions use the real login route and database; no mocked responses or forged localStorage.
  for (const key of ['resident', 'otherResident', 'otherVillageResident', 'manager', 'otherManager', 'admin', 'financial', 'chairman', 'genericAdmin']) {
    const client = await request.newContext({ baseURL: 'http://127.0.0.1:5173' })
    await loginApi(client, users()[key])
    await client.storageState({ path: state(key) })
    await client.dispose()
  }
}
