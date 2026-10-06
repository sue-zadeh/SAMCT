# SAMCT Villages

SAMCT is the South Auckland Masonic Charitable Trust village portal. It has public information and property listings, plus private areas for residents, village managers and administrators in **Ngatea** and **Whitianga**.

**Developer:** Sue Raisianzadeh — Freelance Web Developer, **suewebstudio**.

**Delivery status:** the follow-up release work is in [PR #2](https://github.com/sue-zadeh/SAMCT/pull/2). See [the current release report](docs/release-readiness.md) and [the earlier review](docs/security-review.md). Deployment, credential rotation, client content approval and the live hosting checks still need completing before handover. A passing test suite is evidence for the tested behaviour, not a guarantee against every attack.

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

React 19, TypeScript, Vite, Bootstrap, ASP.NET Core 10/C#, Entity Framework Core, PostgreSQL, BCrypt, MailKit and Playwright.

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

Install **Node.js 24**, the **.NET 10 SDK**, and Docker Engine/Desktop with Compose v2. The API uses .NET 10 LTS. Keep the latest supported patches installed. PostgreSQL can run in Docker or as a local service.

For a local PostgreSQL container, set `SAMCT_LOCAL_DATABASE_PASSWORD` in your terminal and run `docker compose -f compose.local.yml up -d`. It listens only on `127.0.0.1:5433`, with database `samctdb` and user `postgres`; use those values in your local connection string. This developer configuration replaces the previous `docker-compose.locall..yml` filename and preserves its named data volume. Changing the environment variable does not rotate the password inside an existing database; update that database role separately. It is not the disposable E2E database.

```bash
npm ci
cp .env.example .env.local
```

Vite reads `.env.local`. ASP.NET Core does **not** load that file: export its settings in your terminal, configure .NET user-secrets, or use your IDE's private environment settings. Never commit working credentials.

At minimum the API needs:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__DefaultConnection='Host=127.0.0.1;Port=5433;Database=samctdb;Username=postgres;Password=YOUR_LOCAL_PASSWORD'
dotnet run --project server --no-launch-profile -- --migrate
```

Run the API and frontend in separate terminals:

```bash
ASPNETCORE_URLS=http://127.0.0.1:5072 dotnet run --project server --no-launch-profile
npm run dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` and `/uploads` to the API. Leave `VITE_API_BASE_URL` empty for this setup. Use the same hostname consistently when working with cookies.

If Vite prints `ECONNREFUSED 127.0.0.1:5072`, the API is not listening at the expected address. `npm run dev` starts only the frontend. The backend command is **`dotnet run`**, not `run dotnet`. In a second terminal, set the development environment and your database connection above, check that `dotnet --version` starts with `10.`, apply the migrations, and run the API with `ASPNETCORE_URLS=http://127.0.0.1:5072`. Open `http://127.0.0.1:5072/api/health`; it should return `{"status":"ok"}`. Keep that terminal running, reload `/login`, and use an active account from your own development database. Staff login continues to authenticator setup/verification. The test accounts are separate and must not be seeded into your real database.

## Ngatea marketing brochure and photo galleries

The September 2026 client booklet is represented by 22 editable PostgreSQL `MarketingContents` entries and 26 extracted photographs: five village areas, four unit adverts, nine FAQs, an overview, next steps, contacts and local information. This table is separate from resident/occupancy records in `VillageProperties`. The `AddNgateaMarketingContent` migration adds and seeds it, and extends existing property photo columns from five to ten without replacing the first five. Run the normal migration command before starting this version of the API.

The public `/marketing` page reads both tables through their allow-listed API responses. It includes village filters, a gallery that supports ten photos, dated prices/statuses, and explicit loading/error/retry states. A current published property with the same normalized full address takes precedence over its brochure advert. Only public fields are returned; operational resident details and documents stay private. Brochure images are shipped outside the web root and served through the same database publication, authorization and malware checks as uploaded photos.

Village managers can open **My Village → Manage brochure content** to update titles, descriptions, source dates, unit prices/statuses, publication and up to ten photos per entry. Administrators have the same brochure editor below **Village Property Data**. Property records also accept ten image slots in the existing form. JPEG/PNG uploads remain limited to 2 MB each. Unpublishing a brochure entry prevents anonymous access to its photos; editors can remove/replace photos without deleting files referenced elsewhere.

The booklet marks 11 Masons Way, 4 Masonic Place and 14 Masonic Place **Under offer** and lists 1A Masons Way for applications. Prices and terms are explicitly attributed to September 2026, not asserted to be current. Confirm availability and current ORA/service-fee terms with the owner before changing their source labels. The original Windows photo folders were not uploaded; only identifiable photos extracted from the supplied PDF are included. Area photos are labelled as representative and are not assigned to individual unit adverts. See [the source and migration notes](docs/ngatea-marketing.md).

For a new production database, provision the first administrator through a reviewed operator procedure with a unique password hash. There is deliberately no public bootstrap-admin route or default administrator password. The test seed command is for disposable test databases only.

## Security behaviour

- Login issues an encrypted **HttpOnly** cookie and a database-backed session, with an eight-hour absolute limit. Production cookies are `Secure`, use the `__Host-` prefix and `SameSite=Lax`.
- Every authenticated request checks the session and the current account in PostgreSQL. Role/village values in localStorage are only a display cache.
- Managers and all administration titles must enroll an authenticator app at their next login. The password step alone cannot access the portal. Residents can opt in through **Account security** in the profile menu. Ten single-use recovery codes are shown at enrollment; save them privately. Staff cannot disable MFA.
- Authenticator secrets are encrypted using the persisted data-protection keys. Recovery codes and pending login tokens are hashed. TOTP codes cannot be reused; pending login challenges expire after five minutes and share the account lockout counter. Changing/resetting a password does not bypass MFA.
- Logout deletes the server session. Password changes/resets revoke all sessions. Staff changes to activation, role, village or recovery email also revoke sessions. Self-service email changes require the current password, invalidate existing reset links, and sign out every session. Regenerating recovery codes revokes other sessions and rotates the current cookie.
- All state-changing controller actions require an ASP.NET antiforgery token, including login, registration and contact. The client gets it from `GET /api/csrf` and sends `X-CSRF-TOKEN`.
- Login failures use a generic message. Five failures lock an active account for 15 minutes. Authentication endpoints also have a 20-request/minute IP limit, contact has 5/minute, and the API has a global 300/minute limit. These IP limits are per server process; use a shared edge limit for multiple replicas.
- New/reset passwords require at least 12 characters and at most 72 UTF-8 bytes, the BCrypt input limit. Existing passwords can still be used to log in; ask existing users to change weak passwords before delivery.
- Password reset links expire after 30 minutes. Only a SHA-256 hash of the random token is stored. A token is consumed once, and inactive accounts cannot reset their way into the portal.
- Account identity has case-insensitive unique indexes on trimmed usernames and emails. Server DTO validation limits fields, permitted statuses and costs; the API does not bind incoming objects directly to database entities for writes.
- Uploads use generated names, length limits, extension/MIME/signature validation and Office package checks. PNG/JPEG images are limited to 2 MB; documents to 5 MB. New document uploads accept PDF, DOCX, XLSX, PNG and JPEG. HTML/SVG, legacy DOC/XLS and Office packages containing VBA macros are rejected. A private ClamAV service scans new uploads before they are saved and authorized downloads before they are served, including legacy files. A detection returns 400; scanner outages or capacity limits return 503 and do not permit the transfer. No scanner detects every threat. Document downloads use attachment disposition and restrictive headers.
- New uploads are outside the web root. `/uploads/...` checks the database record and its permissions before serving a file. Legacy `wwwroot/uploads` files use the same checks; do not expose that directory directly through a CDN or static host.
- API responses have `no-store`, `nosniff`, anti-framing and `noindex` headers. Production uses HTTPS redirection, HSTS, a CSP and a restricted list of trusted proxies.

## End-to-end tests

The suite uses the running React app, ASP.NET API and a real database. It covers all four access areas, admin title aliases, registration approval, CSRF, logout replay, cross-village and cross-resident access, property privacy, document visibility/downloads, upload validation, maintenance, contact, password change/reset, account deactivation, throttling SEO metadata, authenticator enrollment/recovery/replay protection, MFA lockout, email-change revocation, real malware detection and scanner outages.

**Tests truncate fixture tables. They refuse remote database URLs and require a database name ending in `_e2e`. Never point them at development or production data.**

After pulling this change, run from the repository root:

```bash
npm ci --include=dev
npx playwright install --with-deps chromium
npm run test:e2e:local
```

The first two commands install the locked dependencies and Chromium/Linux browser prerequisites. The last command checks .NET and Docker, starts an isolated PostgreSQL 17 database on **127.0.0.1:55433** and ClamAV on **127.0.0.1:3311**, builds the frontend, applies test migrations, generates fixture users and runs Playwright. It sets `SAMCT_E2E_DATABASE_URL` itself. The initial scanner image/signature startup may take several minutes. Allow about 2 GB of memory for the scanner in addition to the application and database.

```bash
npm run test:report                  # open the HTML results
npm run test:e2e:local -- --headed    # watch the browser
npm run test:e2e:stop                 # stop only these test services
```

The Compose project is named `samct-e2e`. It does not stop, rename or modify an existing development/production database container. The test database is disposable. A generated password, test credentials, cookies, MFA secrets/codes, uploads and reports stay under ignored local directories; never publish them. Test email stays in `.playwright/outbox`; no external email is sent. Ports 5173 and 5072 must be free, and the scanner-outage test also uses 5073. Tests refuse to reuse a running app server. Real rate limits remain enabled, so the suite intentionally pauses when a limit window is reached.

For CI or an already configured local database/scanner, `npm run test:e2e` remains available. It requires a **local** `SAMCT_E2E_DATABASE_URL` whose database ends in `_e2e`, plus ClamAV on loopback port 3310 (or `SAMCT_E2E_SCANNER_PORT`). `npm ci --include=dev` fixes missing packages such as `pg`; it does not configure a database. A missing database environment variable is a setup error, not a failed security assertion: the suite has not started.

Useful checks:

```bash
npm run typecheck
npm run build
npm audit --audit-level=moderate
dotnet build server --configuration Release --warnaserror
dotnet list server package --vulnerable --include-transitive
```

## SEO

The four public pages have distinct titles/descriptions, Open Graph/Twitter previews, structured data and pre-rendered HTML content that can be read without JavaScript. Public forms, portal screens and current property availability still need JavaScript/API access. The footer and structured data credit the developer separately from SAMCT, which remains the site publisher. The author credit is **Sue Raisianzadeh | Freelance Web Developer | suewebstudio**.

Set `VITE_SITE_URL` to the client-approved HTTPS origin and `VITE_ALLOW_INDEXING=true` **before the production build**. This generates public canonical URLs, `robots.txt` and a sitemap containing only `/`, `/about`, `/marketing` and `/contactUs`. Demo builds default to `noindex` and an empty sitemap. `portal.html`, used for private routes, always stays `noindex`; unknown paths return a real 404 through the reference proxy. Public trailing-slash and contact URL variants redirect to the canonical routes.

Private content still requires API authentication; robots directives are not access control. Public HTML is generated at build time and React takes over in the browser; this is not per-request server rendering. Search inclusion and rankings are not guaranteed. Confirm the domain and submit the generated sitemap through the client's Search Console account after launch.

## Deployment and handover

1. **Rotate exposed credentials first.** The previous repository contained configured SMTP/database settings, seed data and runtime uploads. This change removes them from the current tracked source. Older commits and clones still exist. Review the public repository's history and the uploaded files with the owner; do not rewrite history or change repository visibility without agreement.
2. Back up PostgreSQL and uploads. Check case-insensitive duplicate usernames/emails before applying `HardenAuthentication`; its unique indexes deliberately fail rather than silently changing conflicting accounts. Existing plaintext reset links are invalidated. `AddTwoFactorAuthentication` adds encrypted authenticator fields/challenges and invalidates old staff sessions. Existing staff must enroll after migration; verify account ownership before enabling access.
3. Apply migrations as a separate reviewed step using `dotnet run --project server --no-launch-profile -- --migrate` or a generated migration script. Automatic migrations are off in production. Do not run `EnsureCreated` over an existing database.
4. Serve the frontend and API under **one HTTPS origin**. Route `/api` and `/uploads` to the API, and keep the API port private. `deploy/nginx.conf` is a reference for Nginx terminating TLS. Mount a valid certificate and key; adapt the upstream name for the hosting platform. The frontend image builds with `deploy/Dockerfile.web`; the API image builds from the `server` directory.
5. Configure `AllowedHosts`, the actual `Security__KnownProxies__0` address, connection string, SMTP settings and `EmailSettings__FrontendUrl`. Do not trust arbitrary `X-Forwarded-For`/`X-Forwarded-Proto` headers. Cross-site frontend/API deployment is not supported by the default cookie settings; use the same-origin proxy.
6. Persist `DataProtection__KeyPath` and `Storage__UploadPath` outside disposable containers. Production refuses to start without explicit key/upload directories and a configured scanner host. Losing the key ring also makes enrolled authenticator secrets unreadable; back it up with the database and test restoration together. Protect keys at rest with host encryption and restricted permissions; share the key ring across replicas. Give the non-root API account access only to its data directories.
7. Use a restricted database account, private networking and TLS for a remote PostgreSQL connection. Store secrets in the host's secret manager. No real credentials belong in `.env.example`, Git, frontend variables or screenshots.
8. Verify the deployed HTTPS cookie flags, headers, redirects, trusted-proxy handling and all three login areas on staging. Test real reset/contact email delivery, inactive accounts, backups and a restore. The local email outbox does not verify SMTP.
9. Confirm client content, the public/private classification of documents and photos, the role matrix, registration approval responsibilities, the approved domain and support contacts. Check existing users before enabling them.
10. Set up error monitoring, login-failure/rate-limit monitoring, backup ownership, disk quotas and patch updates. Agree on a data-retention policy and secure file disposal. Run a private ClamAV daemon with automated signature updates (`freshclam`), health monitoring and sufficient memory. Set `Security__MalwareScan__Host` and optionally `Security__MalwareScan__Port`; production refuses to disable scanning. Never expose unauthenticated ClamAV TCP publicly. During an outage, file upload/download is unavailable by design.

The application logs account IDs and security outcomes, not submitted passwords, cookies or reset tokens. Keep hosting logs private. Routine patching, backup checks and access reviews remain part of running the service after delivery.

## Account recovery and operations

Users who lose their authenticator can sign in with an unused recovery code, then generate fresh codes in Account security with their current password and another valid second factor. Password reset alone never removes MFA. If both the device and every recovery code are lost, there is deliberately no public bypass endpoint. A trusted operator must verify the person's identity through the organisation's recovery process and record the approval before clearing MFA in a controlled maintenance transaction. Clear the account's MFA fields/reset links and delete its sessions/challenges together; the next staff login requires enrollment again. Never clear a whole village or all users as a shortcut. See [the operator procedure](docs/release-readiness.md#lost-authenticator-and-recovery-codes).

The merge-marker check runs before builds and in CI. If Git reports divergent branches, first inspect `git status`, preserve uncommitted work, and integrate the remote changes. Resolve each conflict deliberately and build/test before committing. Never commit `<<<<<<<`, `=======`, or `>>>>>>>` blocks, and do not force-push shared `main` to work around a rejected push.
