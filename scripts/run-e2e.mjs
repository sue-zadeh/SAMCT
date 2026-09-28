import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { mkdir, rm } from 'node:fs/promises'
import { dotnetConnection } from './e2e-database.mjs'
const environment = {
  ...process.env, ASPNETCORE_ENVIRONMENT: 'Testing', ASPNETCORE_URLS: 'http://127.0.0.1:5072',
  ConnectionStrings__DefaultConnection: dotnetConnection(), AllowedHosts: 'localhost;127.0.0.1',
  Storage__UploadPath: resolve('.playwright/uploads'), DataProtection__KeyPath: resolve('.playwright/keys'),
  Testing__OutboxPath: resolve('.playwright/outbox'), EmailSettings__ToEmail: 'contact@example.test',
  EmailSettings__FrontendUrl: 'http://127.0.0.1:5173', Database__AutoMigrate: 'false',
  // Tests use the same-origin proxy and never inherit a developer's remote API URL.
  VITE_API_BASE_URL: '', VITE_ALLOW_INDEXING: 'false', VITE_SITE_URL: '', SAMCT_API_PROXY: 'http://127.0.0.1:5072',
}
await rm('.playwright/outbox', { recursive: true, force: true })
await mkdir('.playwright/outbox', { recursive: true })
const dotnet = process.env.SAMCT_DOTNET || 'dotnet'
function run(command, arguments_) {
  const result = spawnSync(command, arguments_, { env: environment, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}
run(dotnet, ['run', '--project', 'server', '--no-launch-profile', '--', '--migrate'])
run(process.execPath, ['scripts/seed-e2e.mjs'])
run(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)])
