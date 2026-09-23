import pg from 'pg'
export function testDatabaseUrl() {
  const value = process.env.SAMCT_E2E_DATABASE_URL
  if (!value) throw new Error('Set SAMCT_E2E_DATABASE_URL to a disposable local PostgreSQL database ending in _e2e.')
  const url = new URL(value)
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['127.0.0.1', 'localhost'].includes(url.hostname) || !url.pathname.endsWith('_e2e'))
    throw new Error('E2E setup only permits a loopback PostgreSQL database whose name ends in _e2e.')
  return value
}
export function database() { return new pg.Client({ connectionString: testDatabaseUrl() }) }
export function dotnetConnection() {
  const url = new URL(testDatabaseUrl())
  const parts = [url.username, url.password, url.pathname.slice(1)] .map(decodeURIComponent)
  if (parts.some(part => /[;"\r\n]/.test(part))) throw new Error('Use simple disposable database credentials without connection-string separators.')
  return `Host=${url.hostname};Port=${url.port || 5432};Database=${parts[2]};Username=${parts[0]};Password=${parts[1]};SSL Mode=Disable;Maximum Pool Size=4;Include Error Detail=false`
}
