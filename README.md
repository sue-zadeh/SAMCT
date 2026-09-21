# SAMCT Villages

SAMCT is the South Auckland Masonic Charitable Trust village portal. It has public information and property listings, plus private areas for residents, village managers and administrators in **Ngatea** and **Whitianga**.

**Developer:** Sue Raisianzadeh — Freelance Web Developer, **suewebstudio**.

**Delivery status:** security changes and automated checks are described in [the review report](docs/security-review.md). Deployment, credential rotation, client content approval and the live hosting checks still need completing before handover. A passing test suite is evidence for the tested behaviour, not a guarantee against every attack.

## What stakeholders need to know

- Public visitors can browse approved property listings and send a contact enquiry. They cannot read portal records or private files.
- Public registration creates an **inactive resident account**. The village manager or an administrator must confirm the person and approve the account before login works.
- Managers can create and approve residents in their own village. They cannot create managers or administrators, promote a resident or move them to another village.
- The Administration area retains the existing `CompanySecretary`, `FinancialAdvisor` and `Chairman` titles, plus `Admin`. These titles currently have **the same administration permissions**. Separate finance-only permissions would require an agreed change.
- Making a property visible on Marketing publishes its listing address, title, description and selected marketing photos. Staff must check those fields and photos before publishing. Resident names, emails, occupations, private notes and property documents are excluded from the public API.
- Resident document visibility is separate from public marketing. A document marked visible to residents is available only to logged-in residents of its village.
- Maintenance is not an emergency service. The existing contact and emergency instructions must be confirmed by SAMCT before launch.

## Access rules

| Area / action | Public | Resident | Village Manager | Administration |
| --- | --- | --- | --- | --- |
| Public pages and published listings | Yes | Yes | Yes | Yes |
| Private portal | No | Resident area | Manager area | Admin area |
| Own profile/password | No | Yes | Yes | Yes |
| Submit/read maintenance | No | Own requests | Own village requests and responses | Counts by village |
| Documents/notices | No | Visible documents in own village | Manage own village | Read/manage all villages through the API |
| Resident administration | No | No | Residents in own village | All users |
| Assign manager/admin roles or change village | No | No | No | Yes |
| Private property data | No | No | Own village | All villages |
| Purchase orders | No | No | Own village | All villages |

Administrators' maintenance overview intentionally shows counts without manager responses. Some admin screens are overview screens; the API permissions table does not imply every allowed edit has an admin UI button.

## Stack and project layout

React 19, TypeScript, Vite, Bootstrap, ASP.NET Core 9/C#, Entity Framework Core, PostgreSQL, BCrypt, MailKit and Playwright.

| Path | Purpose |
| --- | --- |
| `client/components/` | Public pages and portal screens |
| `client/security/` | Shared API client, session checks and page metadata |
| `server/Controllers/` | API actions and protected file downloads |
| `server/Security/` | Role/village rules, cookie validation, password/file validation |
| `server/DTOs/` | Explicit input contracts and server validation |
| `server/data/`, `server/models/`, `server/Migrations/` | Database context, entities and schema migrations |
| `client/tests/e2e/` | Browser workflows and direct API security checks |
| `scripts/` | SEO build output and isolated test setup |
| `deploy/` | Reference HTTPS reverse proxy and frontend container |
| `.github/workflows/e2e-tests.yml` | Build, dependency checks and tests using PostgreSQL 17 |

The database is the source of portal data and dashboard counts. No production demo users are seeded automatically.

## Local development

Install **Node.js 24**, the **.NET 9 SDK** and PostgreSQL. Install a current supported .NET 9 patch; plan the next supported runtime upgrade before .NET 9 reaches end of support.

```bash
npm ci
cp .env.example .env.local
```

Vite reads `.env.local`. ASP.NET Core does **not** load that file: export its settings in your terminal, configure .NET user-secrets, or use your IDE's private environment settings. Never commit working credentials.

At minimum the API needs:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__DefaultConnection='Host=127.0.0.1;Port=5432;Database=samct;Username=samct;Password=YOUR_LOCAL_PASSWORD'
dotnet run --project server --no-launch-profile -- --migrate
```

Run the API and frontend in separate terminals:

```bash
ASPNETCORE_URLS=http://127.0.0.1:5072 dotnet run --project server --no-launch-profile
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` and `/uploads` to the API. Leave `VITE_API_BASE_URL` empty for this setup. Use the same hostname consistently when working with cookies.

For a new production database, provision the first administrator through a reviewed operator procedure with a unique password hash. There is deliberately no public bootstrap-admin route or default administrator password. The test seed command is for disposable test databases only.

## Security behaviour

- Login issues an encrypted **HttpOnly** cookie and a database-backed session, with an eight-hour absolute limit. Production cookies are `Secure`, use the `__Host-` prefix and `SameSite=Lax`.
- Every authenticated request checks the session and the current account in PostgreSQL. Role/village values in localStorage are only a display cache.
- Logout deletes the server session. Password changes/resets revoke all sessions. Staff changes to activation, role, village or recovery email also revoke sessions.
- All state-changing controller actions require an ASP.NET antiforgery token, including login, registration and contact. The client gets it from `GET /api/csrf` and sends `X-CSRF-TOKEN`.
- Login failures use a generic message. Five failures lock an active account for 15 minutes. Authentication endpoints also have a 20-request/minute IP limit, contact has 5/minute, and the API has a global 300/minute limit. These IP limits are per server process; use a shared edge limit for multiple replicas.
- New/reset passwords require at least 12 characters and at most 72 UTF-8 bytes, the BCrypt input limit. Existing passwords can still be used to log in; ask existing users to change weak passwords before delivery.
- Password reset links expire after 30 minutes. Only a SHA-256 hash of the random token is stored. A token is consumed once, and inactive accounts cannot reset their way into the portal.
- Account identity has case-insensitive unique indexes on trimmed usernames and emails. Server DTO validation limits fields, permitted statuses and costs; the API does not bind incoming objects directly to database entities for writes.
- Uploads use generated names, length limits, extension/MIME/signature validation and Office package checks. PNG/JPEG images are limited to 2 MB; documents to 5 MB. New document uploads accept PDF, DOCX, XLSX, PNG and JPEG. HTML/SVG, legacy DOC/XLS and Office packages containing VBA macros are rejected. This validation does not establish that an accepted file is malware-free. Document downloads use attachment disposition and restrictive headers.
- New uploads are outside the web root. `/uploads/...` checks the database record and its permissions before serving a file. Legacy `wwwroot/uploads` files use the same checks; do not expose that directory directly through a CDN or static host.
- API responses have `no-store`, `nosniff`, anti-framing and `noindex` headers. Production uses HTTPS redirection, HSTS, a CSP and a restricted list of trusted proxies.

## End-to-end tests

The suite uses the running React app, ASP.NET API and a real database. It covers all four access areas, admin title aliases, registration approval, CSRF, logout replay, cross-village and cross-resident access, property privacy, document visibility/downloads, upload validation, maintenance, contact, password change/reset, account deactivation, throttling and SEO metadata.

**Tests truncate fixture tables. They refuse remote database URLs and require a database name ending in `_e2e`. Never point them at development or production data.**

```bash
export SAMCT_E2E_DATABASE_PASSWORD='choose-a-disposable-test-password'
docker compose -f compose.e2e.yml up -d --wait
export SAMCT_E2E_DATABASE_URL="postgresql://samct_e2e:${SAMCT_E2E_DATABASE_PASSWORD}@127.0.0.1:55432/samct_e2e"
npm ci
npx playwright install --with-deps chromium
npm run build
npm run test:e2e
docker compose -f compose.e2e.yml down
```

The runner migrates the isolated database, seeds generated accounts, starts both servers, and runs Chromium tests. Test emails stay in `.playwright/outbox`; no external email is sent. Credentials, cookies, uploaded fixtures and reports are ignored by Git. Both ports must be free; tests refuse to reuse a running server. The real rate limits remain enabled, so a test run can pause for a limit window.

Useful checks:

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
dotnet build server --configuration Release --warnaserror
dotnet list server package --vulnerable --include-transitive
```

## SEO

Public pages have distinct titles/descriptions, Open Graph metadata and static built HTML heads. The author credit is **Sue Raisianzadeh | Freelance Web Developer | suewebstudio**.

Set `VITE_SITE_URL` to the client-approved HTTPS origin and `VITE_ALLOW_INDEXING=true` **before the production build**. This generates public canonical URLs, `robots.txt` and a sitemap containing only `/`, `/about`, `/marketing` and `/contactUs`. Demo builds default to `noindex` and an empty sitemap. `portal.html`, used for private/unknown routes, always stays `noindex`.

Private content still requires API authentication; robots directives are not access control. The application remains a client-rendered React app, not full server-side rendering. Search inclusion and rankings are not guaranteed. Confirm the domain and submit the generated sitemap through the client's Search Console account after launch.

## Deployment and handover

1. **Rotate exposed credentials first.** The previous repository contained configured SMTP/database settings, seed data and runtime uploads. This change removes them from the current tracked source. Older commits and clones still exist. Review the public repository's history and the uploaded files with the owner; do not rewrite history or change repository visibility without agreement.
2. Back up PostgreSQL and uploads. Check case-insensitive duplicate usernames/emails before applying `HardenAuthentication`; its unique indexes deliberately fail rather than silently changing conflicting accounts. Existing plaintext reset links are invalidated.
3. Apply migrations as a separate reviewed step using `dotnet run --project server --no-launch-profile -- --migrate` or a generated migration script. Automatic migrations are off in production. Do not run `EnsureCreated` over an existing database.
4. Serve the frontend and API under **one HTTPS origin**. Route `/api` and `/uploads` to the API, and keep the API port private. `deploy/nginx.conf` is a reference for Nginx terminating TLS. Mount a valid certificate and key; adapt the upstream name for the hosting platform. The frontend image builds with `deploy/Dockerfile.web`; the API image builds from the `server` directory.
5. Configure `AllowedHosts`, the actual `Security__KnownProxies__0` address, connection string, SMTP settings and `EmailSettings__FrontendUrl`. Do not trust arbitrary `X-Forwarded-For`/`X-Forwarded-Proto` headers. Cross-site frontend/API deployment is not supported by the default cookie settings; use the same-origin proxy.
6. Persist `DataProtection__KeyPath` and `Storage__UploadPath` outside disposable containers. Production refuses to start without an explicit key directory. Protect keys at rest with host encryption and restricted permissions; share the key ring across replicas. Give the non-root API account access only to its data directories.
7. Use a restricted database account, private networking and TLS for a remote PostgreSQL connection. Store secrets in the host's secret manager. No real credentials belong in `.env.example`, Git, frontend variables or screenshots.
8. Verify the deployed HTTPS cookie flags, headers, redirects, trusted-proxy handling and all three login areas on staging. Test real reset/contact email delivery, inactive accounts, backups and a restore. The local email outbox does not verify SMTP.
9. Confirm client content, the public/private classification of documents and photos, the role matrix, registration approval responsibilities, the approved domain and support contacts. Check existing users before enabling them.
10. Set up error monitoring, login-failure/rate-limit monitoring, backup ownership, disk quotas and patch updates. Agree on a data-retention policy and secure file disposal. A malware scanner is not included in the upload validation; add a scanning/quarantine service if operational requirements call for it. MFA is not implemented.

The application logs account IDs and security outcomes, not submitted passwords, cookies or reset tokens. Keep hosting logs private. Routine patching, backup checks and access reviews remain part of running the service after delivery.
