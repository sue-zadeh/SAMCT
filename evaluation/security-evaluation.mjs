import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const args = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1])
}

const root = resolve(args.get('--root') || '.')
const gitRef = args.get('--ref')
const label = args.get('--label') || (gitRef || 'working-tree')
const outputPath = args.get('--out')

function read(path) {
  try {
    if (gitRef) {
      return execFileSync('git', ['show', `${gitRef}:${path}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      })
    }
    return readFileSync(resolve(root, path), 'utf8')
  } catch {
    return ''
  }
}

function trackedFiles() {
  const command = gitRef
    ? ['ls-tree', '-r', '--name-only', gitRef]
    : ['ls-files']
  return execFileSync('git', command, { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
}

const program = read('server/Program.cs')
const auth = read('server/Controllers/AuthController.cs')
const maintenance = read('server/Controllers/MaintenanceController.cs')
const documents = read('server/Controllers/DocumentNoticeController.cs')
const properties = read('server/Controllers/VillagePropertyController.cs')
const purchaseOrders = read('server/Controllers/PurchaseOrderController.cs')
const tokenService = read('server/Security/TokenService.cs')
const securityHeaders = read('server/Security/SecurityHeadersMiddleware.cs')
const navbar = read('client/components/navbar.tsx')
const appRoutes = read('client/app.tsx')
const workflow = read('.github/workflows/portalshield-ci.yml')
const files = trackedFiles()

const marketingMethod = properties.match(
  /GetMarketingProperties[\s\S]*?(?=\n\s*\[HttpPost)/,
)?.[0] || ''
const marketingProjection = marketingMethod.match(
  /\.Select\(property => new[\s\S]*?\n\s*\}\)/,
)?.[0] || ''
const publicLinks = navbar.match(
  /const publicLinks[\s\S]*?(?=\n\s*const residentLinks)/,
)?.[0] || ''

const cases = [
  {
    id: 'AUTH-01',
    title: 'Authentication middleware is configured and activated',
    pass:
      program.includes('AddAuthentication') &&
      program.indexOf('UseAuthentication()') > -1 &&
      program.indexOf('UseAuthentication()') < program.indexOf('UseAuthorization()'),
  },
  {
    id: 'AUTH-02',
    title: 'JWT issuer, audience, signature and lifetime are validated',
    pass: ['ValidateIssuer = true', 'ValidateAudience = true', 'ValidateIssuerSigningKey = true', 'ValidateLifetime = true']
      .every((control) => program.includes(control)),
  },
  {
    id: 'AUTH-03',
    title: 'Admin-only registration is enforced by the API',
    pass: /Authorize\(Policy = SecurityPolicies\.AdminOnly\)[\s\S]{0,160}HttpPost\("register"\)/.test(auth),
  },
  {
    id: 'AUTH-04',
    title: 'Registration is absent from public and manager navigation',
    pass: !publicLinks.includes('Register') &&
      !/const villageManagerLinks[\s\S]*?Register/.test(navbar),
  },
  {
    id: 'AUTH-05',
    title: 'Private React routes have role guards',
    pass: appRoutes.includes('ProtectedRoute') &&
      appRoutes.includes('allowedRoles={ADMIN_ROLES}') &&
      appRoutes.includes('allowedRoles={MANAGER_ROLES}') &&
      appRoutes.includes('allowedRoles={RESIDENT_ROLES}'),
  },
  {
    id: 'AUTH-06',
    title: 'Password and role changes invalidate old access tokens',
    pass: tokenService.includes('token_version') &&
      program.includes('user.TokenVersion == tokenVersion') &&
      auth.includes('user.TokenVersion++'),
  },
  {
    id: 'AUTH-07',
    title: 'Login and password recovery are rate limited',
    pass: program.includes('AddRateLimiter') &&
      (auth.match(/EnableRateLimiting\("authentication"\)/g)?.length || 0) >= 3,
  },
  {
    id: 'AUTH-08',
    title: 'Reset tokens are random, hashed, short-lived and non-enumerating',
    pass: auth.includes('RandomNumberGenerator.GetBytes') &&
      auth.includes('HashResetToken(rawToken)') &&
      auth.includes('AddMinutes(30)') &&
      auth.includes('If this email exists'),
  },
  {
    id: 'DATA-01',
    title: 'Maintenance resources require authentication',
    pass: /\[Authorize\][\s\S]{0,80}\[Route\("api\/maintenance"\)\]/.test(maintenance),
  },
  {
    id: 'DATA-02',
    title: 'Document resources require authentication and village scope',
    pass: /\[Authorize\][\s\S]{0,80}\[Route\("api\/documents"\)\]/.test(documents) &&
      documents.includes('User.CanAccessVillage'),
  },
  {
    id: 'DATA-03',
    title: 'Public marketing DTO excludes resident and document fields',
    pass: /AllowAnonymous[\s\S]{0,160}GetMarketingProperties/.test(properties) &&
      Boolean(marketingProjection) &&
      !/Resident(Name|Email|Occupation)|DocumentUrl|Notes/.test(marketingProjection),
  },
  {
    id: 'DATA-04',
    title: 'Purchase orders require manager or admin authorization',
    pass: purchaseOrders.includes('Authorize(Policy = SecurityPolicies.ManagerOrAdmin)') &&
      purchaseOrders.includes('User.CanAccessVillage'),
  },
  {
    id: 'DATA-05',
    title: 'Non-marketing uploads require an authenticated request',
    pass: program.includes('isProtectedUpload') &&
      program.includes('Status401Unauthorized'),
  },
  {
    id: 'HTTP-01',
    title: 'Security headers and API no-store caching are applied',
    pass: ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Cache-Control']
      .every((header) => securityHeaders.includes(header)),
  },
  {
    id: 'HTTP-02',
    title: 'CORS uses an explicit origin allow-list',
    pass: program.includes('WithOrigins(allowedOrigins)') && !program.includes('AllowAnyOrigin'),
  },
  {
    id: 'PRIV-01',
    title: 'Secrets, personal uploads and real-user seed are not tracked',
    pass: !files.some((file) =>
      file === 'server/appsettings.json' ||
      file === 'server/appsettings.Development.json' ||
      file === 'server/data/seed-users.sql' ||
      (file.startsWith('server/wwwroot/uploads/') && !file.endsWith('.gitkeep'))),
  },
  {
    id: 'CI-01',
    title: 'CI runs build, audit, secret scan, unit and integration tests',
    pass: ['npm audit', 'dotnet test', 'gitleaks', 'npm run test:e2e']
      .every((gate) => workflow.toLowerCase().includes(gate.toLowerCase())),
  },
]

const passed = cases.filter((item) => item.pass).length
const result = {
  label,
  evaluatedRef: gitRef || 'working-tree',
  primaryMetric: 'security control cases passed',
  passed,
  total: cases.length,
  scorePercent: Math.round((passed / cases.length) * 100),
  cases,
}

console.log(`\n${label}: ${passed}/${cases.length} controls passed (${result.scorePercent}%)\n`)
console.log('| Case | Result | Control |')
console.log('|---|---:|---|')
for (const item of cases) {
  console.log(`| ${item.id} | ${item.pass ? 'PASS' : 'FAIL'} | ${item.title} |`)
}

if (outputPath) {
  const absoluteOutput = resolve(root, outputPath)
  mkdirSync(dirname(absoluteOutput), { recursive: true })
  writeFileSync(absoluteOutput, `${JSON.stringify(result, null, 2)}\n`)
}
