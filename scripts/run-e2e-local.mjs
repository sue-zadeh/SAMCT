import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

process.chdir(fileURLToPath(new URL('../', import.meta.url)))
const dotnet = process.env.SAMCT_DOTNET || 'dotnet'
function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' })
  if (result.error) { console.error(`Could not start ${command}. Install the prerequisites in README.md. ${result.error.message}`); process.exit(1) }
  if (result.status !== 0) process.exit(result.status || 1)
}
if (!process.argv.includes('--stop')) {
  const sdk = spawnSync(dotnet, ['--version'], { encoding: 'utf8' })
  if (sdk.error || sdk.status !== 0 || Number(sdk.stdout?.trim().split('.')[0]) < 10) {
    console.error('Install the .NET 10 SDK before running SAMCT tests. See README.md for all prerequisites.')
    process.exit(1)
  }
}
run('docker', ['info', '--format', '{{.ServerVersion}}'])
await mkdir('.playwright', { recursive: true })
let password
try { password = (await readFile('.playwright/local-database-password', 'utf8')).trim() }
catch { password = randomBytes(24).toString('hex'); await writeFile('.playwright/local-database-password', password, { mode: 0o600 }) }
if (!/^[a-f0-9]{48}$/.test(password)) throw new Error('Invalid disposable database password file. Remove .playwright/local-database-password and retry.')
const env = { ...process.env, SAMCT_E2E_DATABASE_PASSWORD: password, SAMCT_E2E_DATABASE_PORT: '55433', SAMCT_E2E_SCANNER_PORT: '3311', SAMCT_E2E_DATABASE_URL: `postgresql://samct_e2e:${password}@127.0.0.1:55433/samct_e2e` }
if (process.argv.includes('--stop')) {
  run('docker', ['compose', '-f', 'compose.e2e.yml', 'stop'], env)
  process.exit(0)
}
console.log('Starting the isolated samct-e2e database and file scanner. First startup can take several minutes.')
run('docker', ['compose', '-f', 'compose.e2e.yml', 'up', '-d', '--wait', '--wait-timeout', '360'], env)
run(process.execPath, [resolve('node_modules/@playwright/test/cli.js'), 'install', 'chromium'], env)
run('npm', ['run', 'build'], env)
run(process.execPath, ['scripts/run-e2e.mjs', ...process.argv.slice(2)], env)
console.log('View results: npm run test:report. To stop test services: npm run test:e2e:stop')
