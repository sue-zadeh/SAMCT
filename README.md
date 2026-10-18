# SAMCT Villages

SAMCT is the South Auckland Masonic Charitable Trust village portal. It has public information and property listings, plus private areas for residents, village managers and administrators in **Ngatea** and **Whitianga**.

**Developer:** Sue Raisianzadeh — Freelance Web Developer, **suewebstudio**.

**Delivery status:** the current authentication flow is password/JWT login with a 20-minute inactivity timeout, described below. Earlier photo and form fixes are in [PR #5](https://github.com/sue-zadeh/SAMCT/pull/5). See [the form review and test coverage](docs/login-and-form-review.md), [the deployment requirements](docs/release-readiness.md) and [the earlier security review](docs/security-review.md). Deployment, credential rotation, client content approval and live hosting checks still need completing before handover. A passing test suite is evidence for the tested behaviour, not a guarantee against every attack.

## What stakeholders need to know

- Public visitors can browse approved property listings and send a contact enquiry. They cannot read portal records or private files.
- Public registration creates an **inactive resident account**. The village manager or an administrator must confirm the person and approve the account before login works.
- Managers can create and approve residents in their own village. They cannot create managers or administrators, promote a resident or move them to another village.
- The Administration area retains the existing `CompanySecretary`, `FinancialAdministrator`, `FinancialAdvisor`, `Chairman` and `Director` titles, plus `Admin`. These titles currently have **the same administration permissions**. Separate finance-only permissions would require an agreed change.
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

If Vite prints `ECONNREFUSED 127.0.0.1:5072`, the API is not listening at the expected address. `npm run dev` starts only the frontend. The backend command is **`dotnet run`**, not `run dotnet`. In a second terminal, set the development environment and your database connection above, check that `dotnet --version` starts with `10.`, apply the migrations, and run the API with `ASPNETCORE_URLS=http://127.0.0.1:5072`. Open `http://127.0.0.1:5072/api/health`; it should return `{"status":"ok"}`. Keep that terminal running, reload `/login`, and use an active account from your own development database. An active, approved account goes straight to its role-specific dashboard after its password is verified; there is no QR or authenticator step. The test accounts are separate and must not be seeded into your real database.

## Ngatea marketing brochure and photo galleries

The September 2026 client booklet is represented by 22 editable PostgreSQL `MarketingContents` entries and 56 gallery images (26 from the booklet and 30 additional supplied photos): five village areas, four unit adverts, nine FAQs, an overview, next steps, contacts and local information. This table is separate from resident/occupancy records in `VillageProperties`. The `AddNgateaMarketingContent` migration adds and seeds it, and extends existing property photo columns from five to ten without replacing the first five. Run the normal migration command before starting this version of the API.

The public `/marketing` page reads both tables through their allow-listed API responses. It includes village filters, galleries for all saved photos, dated prices/statuses, and explicit loading/error/retry states. A current published property with the same normalized full address takes precedence over its brochure advert. Only public fields are returned; operational resident details and documents stay private. Brochure images are shipped outside the web root and served through the same database publication, authorization and malware checks as uploaded photos.

Village managers can open **My Village → Manage brochure content** to update titles, descriptions, source dates, contact names/phone numbers, unit prices/statuses, publication and up to **30 images per brochure entry**. Upload up to ten new photos per save. Administrators have the same brochure editor below **Village Property Data**. For operational units, **My Village → property form** provides ten labelled photo positions, a multiple-photo picker, saved-photo previews, replace/remove/undo controls and a photo count. Zero to ten photos are allowed. Vacant units use zero residents and do not require a resident email. Photo changes and the public-marketing checkbox take effect only after saving. Removing a photo removes its public reference; it does not delete unrelated files. JPEG/PNG uploads remain limited to 2 MB each. Unpublishing a brochure entry prevents anonymous access to its photos; editors can remove/replace photos without deleting files referenced elsewhere.

Apply `ExpandMarketingGalleriesAndContacts` for the 30-image limit and the Ngatea booklet contact, **Avalon or Hayley on 07 867 7800**. The public page distinguishes individual homes from street-area guides, opens galleries from their cover photos, and shows phone links and highlighted FAQ answers. Apply `ImportSuppliedStreetPhotos` to expand each of the five supplied street-area galleries from four to ten images. This data migration changes only photo arrays that still exactly match the original four images, preserving staff-edited galleries, copy, contacts and publication settings. Cards show clickable thumbnails, and a thumbnail opens its corresponding full photo. See [the source notes](docs/ngatea-marketing.md).

The booklet marks 11 Masons Way, 4 Masonic Place and 14 Masonic Place **Under offer** and lists 1A Masons Way for applications. Prices and terms are explicitly attributed to September 2026, not asserted to be current. Confirm availability and current ORA/service-fee terms with the owner before changing their source labels. The supplied email links to street folders, not an address-to-photo inventory. Several photos explicitly show example interiors from another unit. Those labels are retained. The four individual adverts therefore keep their one verified booklet photo until the client confirms additional address-specific photos. Area galleries include all three booklet home photos, their map and six additional photos each. Masons Way staged examples are identified separately because their source filenames refer to 71 Darlington St. See [the source and migration notes](docs/ngatea-marketing.md).

For a new production database, provision the first administrator through a reviewed operator procedure with a unique password hash. There is deliberately no public bootstrap-admin route or default administrator password. The test seed command is for disposable test databases only.

## Security behaviour

- Login verifies the stored BCrypt password and issues a signed **JWT in an HttpOnly cookie**, backed by a revocable database session. The JWT has an eight-hour absolute limit; its signature, algorithm, issuer, audience and expiry are validated on every request. Production cookies are `Secure`, use the `__Host-` prefix and `SameSite=Lax`.
- Every authenticated request checks the session and the current account in PostgreSQL. Role/village values in localStorage are only a display cache.
- All roles go directly to their own dashboard after successful password login. QR setup, authenticator codes, recovery-code screens and MFA API endpoints have been removed. Existing MFA database columns and historical migrations remain for compatibility; their contents no longer affect login.
- The server expires a session after **20 minutes of inactivity**. Trusted clicks, typing, scrolling and pointer/touch input trigger a CSRF-protected activity request, throttled to at most one every 30 seconds. Only that request renews a still-valid database session. Passive page loads, session checks and background polling do not renew it; expired sessions cannot be revived. The browser returns to login and shows an inactivity message, including across open tabs. Timers also check elapsed time when a sleeping tab resumes. Client storage is only display coordination and cannot override server expiry.
- Logout deletes the server session. Password changes/resets revoke all sessions. Staff changes to activation, role, village or recovery email also revoke sessions. Self-service email changes require the current password, invalidate existing reset links, and sign out every session.
- All state-changing controller actions require an ASP.NET antiforgery token, including login, registration and contact. The client gets it from `GET /api/csrf` and sends `X-CSRF-TOKEN`.
- Login accepts existing usernames with internal spaces without collapsing them into another identity; new-account validation remains strict. Leading/trailing spaces are trimmed. Invalid form fields receive specific inline messages; incorrect account credentials still use a generic message. Five failures lock an active account for 15 minutes. Authentication endpoints also have a 20-request/minute IP limit, contact has 5/minute, and the API has a global 300/minute limit. These IP limits are per server process; use a shared edge limit for multiple replicas.
- New/reset passwords require at least 12 characters and at most 72 UTF-8 bytes, the BCrypt input limit. Existing passwords can still be used to log in; ask existing users to change weak passwords before delivery.
- Password reset links expire after 30 minutes. Only a SHA-256 hash of the random token is stored. A token is consumed once, and inactive accounts cannot reset their way into the portal.
- Account identity has case-insensitive unique indexes on trimmed usernames and emails. Server DTO validation limits fields, permitted statuses and costs; the API does not bind incoming objects directly to database entities for writes.
- Uploads use generated names, length limits, extension/MIME/signature validation and Office package checks. PNG/JPEG images are limited to 2 MB; documents to 5 MB. New document uploads accept PDF, DOCX, XLSX, PNG and JPEG. HTML/SVG, legacy DOC/XLS and Office packages containing VBA macros are rejected. A private ClamAV service scans new uploads before they are saved and authorized downloads before they are served, including legacy files. A detection returns 400; scanner outages or capacity limits return 503 and do not permit the transfer. No scanner detects every threat. Document downloads use attachment disposition and restrictive headers.
- New uploads are outside the web root. `/uploads/...` checks the database record and its permissions before serving a file. Legacy `wwwroot/uploads` files use the same checks; do not expose that directory directly through a CDN or static host.
- API responses have `no-store`, `nosniff`, anti-framing and `noindex` headers. Production uses HTTPS redirection, HSTS, a CSP and a restricted list of trusted proxies.

## End-to-end tests

The suite uses the running React app, ASP.NET API and a real database. It covers all four access areas, admin title aliases, registration approval, CSRF, logout replay, cross-village and cross-resident access, property privacy, document visibility/downloads, upload validation, maintenance, contact, password change/reset, account deactivation, throttling, SEO metadata, signed-JWT validation and replay protection, idle expiry/activity renewal, removal of old MFA endpoints, email-change revocation, real malware detection and scanner outages.

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

The four public pages have distinct titles/descriptions, Open Graph/Twitter previews, structured data and pre-rendered HTML content that can be read without JavaScript. Public forms, portal screens and current property availability still need JavaScript/API access. The author metadata and structured data credit the developer separately from SAMCT, which remains the site publisher. The author credit is **Sue Raisianzadeh | Freelance Web Developer | suewebstudio**.

Set `VITE_SITE_URL` to the client-approved HTTPS origin and `VITE_ALLOW_INDEXING=true` **before the production build**. This generates public canonical URLs, `robots.txt` and a sitemap containing only `/`, `/about`, `/marketing` and `/contactUs`. Demo builds default to `noindex` and an empty sitemap. `portal.html`, used for private routes, always stays `noindex`; unknown paths return a real 404 through the reference proxy. Public trailing-slash and contact URL variants redirect to the canonical routes.

Private content still requires API authentication; robots directives are not access control. Public HTML is generated at build time and React takes over in the browser; this is not per-request server rendering. Search inclusion and rankings are not guaranteed. Confirm the domain and submit the generated sitemap through the client's Search Console account after launch.

## Deployment and handover

1. **Rotate exposed credentials first.** The previous repository contained configured SMTP/database settings, seed data and runtime uploads. This change removes them from the current tracked source. Older commits and clones still exist. Review the public repository's history and the uploaded files with the owner; do not rewrite history or change repository visibility without agreement.
2. Back up PostgreSQL and uploads. Check case-insensitive duplicate usernames/emails before applying `HardenAuthentication`; its unique indexes deliberately fail rather than silently changing conflicting accounts. Existing plaintext reset links are invalidated. `AddTwoFactorAuthentication` adds encrypted authenticator fields/challenges and invalidates old staff sessions. Those legacy MFA fields are retained but are no longer used by the current password/JWT login. This authentication update needs no new database migration and does not change any user password, role or activation.
3. Apply migrations as a separate reviewed step using `dotnet run --project server --no-launch-profile -- --migrate` or a generated migration script. Automatic migrations are off in production. Do not run `EnsureCreated` over an existing database.
4. Serve the frontend and API under **one HTTPS origin**. Route `/api` and `/uploads` to the API, and keep the API port private. `deploy/nginx.conf` is a reference for Nginx terminating TLS. Mount a valid certificate and key; adapt the upstream name for the hosting platform. The frontend image builds with `deploy/Dockerfile.web`; the API image builds from the `server` directory.
5. Configure `AllowedHosts`, the actual `Security__KnownProxies__0` address, connection string, SMTP settings and `EmailSettings__FrontendUrl`. Do not trust arbitrary `X-Forwarded-For`/`X-Forwarded-Proto` headers. Cross-site frontend/API deployment is not supported by the default cookie settings; use the same-origin proxy.
6. Persist `DataProtection__KeyPath` and `Storage__UploadPath` outside disposable containers. Production refuses to start without explicit key/upload directories and a configured scanner host. Back up the key ring with the database and test restoration together. Configure a separate persistent `Jwt__SigningKey` containing at least 32 cryptographically random bytes encoded as base64; production refuses to start without it. Share it across API replicas and keep it out of Git and frontend variables. Rotating it signs all users out. Protect keys at rest with host encryption and restricted permissions; share the key ring across replicas. Give the non-root API account access only to its data directories.
7. Use a restricted database account, private networking and TLS for a remote PostgreSQL connection. Store secrets in the host's secret manager. No real credentials belong in `.env.example`, Git, frontend variables or screenshots.
8. Verify the deployed HTTPS cookie flags, headers, redirects, trusted-proxy handling and all three login areas on staging. Test real reset/contact email delivery, inactive accounts, backups and a restore. The local email outbox does not verify SMTP.
9. Confirm client content, the public/private classification of documents and photos, the role matrix, registration approval responsibilities, the approved domain and support contacts. Check existing users before enabling them.
10. Set up error monitoring, login-failure/rate-limit monitoring, backup ownership, disk quotas and patch updates. Agree on a data-retention policy and secure file disposal. Run a private ClamAV daemon with automated signature updates (`freshclam`), health monitoring and sufficient memory. Set `Security__MalwareScan__Host` and optionally `Security__MalwareScan__Port`; production refuses to disable scanning. Never expose unauthenticated ClamAV TCP publicly. During an outage, file upload/download is unavailable by design.

### Railway startup: persistent storage and migrations

If deployment logs say `Set Storage__UploadPath to a persistent private directory`, the API has stopped at its production configuration check. This error is not a missing table. A running PostgreSQL service or a successful frontend build does not show that the API is ready.

1. Attach a separate persistent volume to the **API service**, mounted at `/data`. The PostgreSQL service's volume is not shared with the API.
2. Set these **API service variables**:

   ```text
   Storage__UploadPath=/data/uploads
   DataProtection__KeyPath=/data/keys
   ```

   Ensure the non-root API user can create/write those directories on the mounted volume. A mounted volume can hide ownership set in the image; check the actual mounted directory. Arrange ownership in a controlled setup step and retain the non-root runtime. Do not use a world-writable key directory.
3. Keep `ASPNETCORE_ENVIRONMENT=Production`. Configure `AllowedHosts`, the database connection, a private ClamAV host (`Security__MalwareScan__Host`), SMTP, the frontend origin and trusted proxies as described above. Do not disable scanning or switch to Development to bypass startup checks. Both `/api` and `/uploads` must be forwarded through the same HTTPS origin as the frontend.
4. Back up the target database. Apply migrations against that specific environment before routing traffic to the new API. With the published `server/Dockerfile` image, run `dotnet server.dll --migrate` from `/app`; with the source checkout use the repository's `dotnet run --project server --no-launch-profile -- --migrate` command. This is a separate migration run, not the long-running web start command. Do not hand-create tables or run the disposable E2E seed against Railway.
5. Start/redeploy the API after the migration succeeds. Check its logs, `/api/health`, the public marketing responses/images and staff login through the frontend. Railway volumes are mounted at runtime, not during build or pre-deploy; a pre-deploy command must not rely on volume contents.

References: [Railway volumes](https://docs.railway.com/volumes), [variables](https://docs.railway.com/variables), [pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command). This repository update does not itself configure or deploy the Railway services.

The application logs account IDs and security outcomes, not submitted passwords, cookies or reset tokens. Keep hosting logs private. Routine patching, backup checks and access reviews remain part of running the service after delivery.

## Account recovery and operations

Users who forget their password use **Forgot password**. Resetting a password invalidates all existing sessions. Public registration still needs manager/administrator approval before login. Operators must verify account ownership before changing a password, role, village or activation; there is no default administrator password.

Local Development can leave `Jwt__SigningKey` unset: the API generates a random process-local key, so a restart requires another login. In Production, generate a persistent secret once with `openssl rand -base64 32` in a trusted terminal, then store the output as the API service's `Jwt__SigningKey` secret. This command creates 32 random bytes encoded as base64; do not commit or share the output. Existing encrypted-cookie sessions require a fresh password login after this update. Keep `/api/csrf` and `X-CSRF-TOKEN` in Postman and browser writes because the JWT is transported in a cookie.


The merge-marker check runs before builds and in CI. If Git reports divergent branches, first inspect `git status`, preserve uncommitted work, and integrate the remote changes. Resolve each conflict deliberately and build/test before committing. Never commit `<<<<<<<`, `=======`, or `>>>>>>>` blocks, and do not force-push shared `main` to work around a rejected push.
