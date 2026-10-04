import assert from 'node:assert/strict'
import { test } from 'node:test'
import { testDatabaseUrl } from './e2e-database.mjs'

test('destructive fixtures permit only an unambiguous local test database', () => {
  const previous = process.env.SAMCT_E2E_DATABASE_URL
  const allowed = 'postgresql://fixture:fixture@127.0.0.1:55433/samct_e2e'
  try {
    process.env.SAMCT_E2E_DATABASE_URL = allowed
    assert.equal(testDatabaseUrl(), allowed)
    for (const blocked of [
      allowed + '?host=remote.example', allowed + '?database=production', allowed + '#fragment',
      allowed.replace('samct_e2e', 'production'), allowed.replace('127.0.0.1', 'remote.example'),
    ]) {
      process.env.SAMCT_E2E_DATABASE_URL = blocked
      assert.throws(testDatabaseUrl, /only permits a loopback/)
    }
    delete process.env.SAMCT_E2E_DATABASE_URL
    assert.throws(testDatabaseUrl, /test:e2e:local/)
  } finally {
    if (previous === undefined) delete process.env.SAMCT_E2E_DATABASE_URL
    else process.env.SAMCT_E2E_DATABASE_URL = previous
  }
})
