# Reproduction guide

This guide starts from a clean machine and uses only synthetic data. It reproduces the application, baseline/final evaluation and browser security suite.

## 1. Requirements

- Git
- Node.js 22 and npm
- .NET SDK 9
- Docker with Compose (or a PostgreSQL 16 instance)
- `psql` for the optional synthetic user seed
- Chromium dependencies when running Playwright (`npx playwright install --with-deps chromium`)

Expected first-run time is roughly 5–10 minutes, mostly package/container downloads. Repeated frontend builds take under a minute on a typical developer machine. The workflow uses no paid API and has no per-run model cost. SMTP cost depends on the provider and is not needed for the security evaluation.

## 2. Clone and select the isolated branch

```bash
git clone https://github.com/sue-zadeh/SAMCT.git
cd SAMCT
git switch hackathon/portalshield
```

Confirm `git branch --show-current` prints `hackathon/portalshield`.

## 3. Configure PostgreSQL and secrets

Do not commit the values used here.

```bash
export POSTGRES_PASSWORD='choose-a-strong-local-password'
docker compose up -d postgres

export ASPNETCORE_ENVIRONMENT=Development
export ASPNETCORE_URLS=http://127.0.0.1:5072
export ConnectionStrings__DefaultConnection="Host=127.0.0.1;Port=5433;Database=samctdb;Username=postgres;Password=${POSTGRES_PASSWORD}"
export Jwt__Key="$(openssl rand -hex 32)"
export Jwt__Issuer=SAMCT.Local
export Jwt__Audience=SAMCT.Local.Web
export Jwt__AccessTokenMinutes=30
export Cors__AllowedOrigins__0=http://127.0.0.1:5173
export Database__ApplyMigrationsOnStartup=true
```

`server/appsettings.example.json` and `.env.example` list optional SMTP and production variables. Real values belong in Railway/GitHub secret settings or another secret manager.

## 4. Build and run

Terminal A:

```bash
dotnet restore SAMCT.sln
dotnet run --project server/server.csproj
```

Wait until `curl --fail http://127.0.0.1:5072/health` succeeds. Startup applies EF Core migrations by default.

Terminal B:

```bash
npm ci
export VITE_API_BASE_URL=http://127.0.0.1:5072
export VITE_PUBLIC_SITE_URL=http://127.0.0.1:5173
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

## 5. Seed synthetic accounts (optional but required for role E2E)

```bash
export SAMCT_SEED_PASSWORD='A-long-local-only!Password9'
psql "$ConnectionStrings__DefaultConnection" \
  -v seed_password="$SAMCT_SEED_PASSWORD" \
  -f server/data/seed-users.example.sql
```

If your `psql` does not accept the .NET connection-string format, use:

```bash
psql "host=127.0.0.1 port=5433 dbname=samctdb user=postgres password=$POSTGRES_PASSWORD" \
  -v seed_password="$SAMCT_SEED_PASSWORD" \
  -f server/data/seed-users.example.sql
```

The synthetic usernames are `demo.admin`, `demo.manager` and `demo.resident`. Their password exists only in your environment.

## 6. Reproduce the fair baseline comparison

Both versions use the same 17 controls:

```bash
npm run eval:all
```

Expected main result:

- baseline `0529271`: `0/17`
- PortalShield: `17/17`

The complete machine-readable results are written to `evaluation/results/`.

## 7. Run builds and unit tests

```bash
npm audit --audit-level=high
npm run build
dotnet build SAMCT.sln --configuration Release
dotnet test server.tests/server.tests.csproj --configuration Release
```

## 8. Run browser and API boundary tests

Keep the API running, then:

```bash
export BASE_URL=http://127.0.0.1:5173
export API_BASE_URL=http://127.0.0.1:5072
export VITE_API_BASE_URL=http://127.0.0.1:5072
export TEST_ADMIN_USERNAME=demo.admin
export TEST_MANAGER_USERNAME=demo.manager
export TEST_RESIDENT_USERNAME=demo.resident
export TEST_USER_PASSWORD="$SAMCT_SEED_PASSWORD"

npx playwright install --with-deps chromium
npm run test:e2e
```

The suite checks public navigation, role login, protected-route redirects, private API `401`, manager denial from admin registration, and absence of resident fields in public marketing JSON.

## 9. CI/CD operation

`.github/workflows/portalshield-ci.yml` runs automatically for pushes to the hackathon branch and pull requests to `main`. It can also be started from GitHub Actions using **PortalShield CI → Run workflow**. No repository comment or application registration is required.

The gate contains:

1. frontend build and npm vulnerability audit;
2. backend build and xUnit security tests;
3. Gitleaks scan of the submitted working tree;
4. PostgreSQL-backed browser/API tests with generated ephemeral credentials.

## 10. Expected outputs and cleanup

- Vite output: `dist/`
- test failures: `test-results/` and `playwright-report/` (ignored)
- security results: `evaluation/results/*.json`
- runtime uploads: `server/wwwroot/uploads/` (ignored except `.gitkeep`)

Stop local PostgreSQL without deleting data:

```bash
docker compose stop postgres
```

Deleting the volume is intentionally not part of this guide because it destroys local data.
