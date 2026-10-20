# SAMCT Villages

A React and ASP.NET Core portal for **South Auckland Masonic Charitable Trust (SAMCT)**. It includes public information about the **Ngatea** and **Whitianga** villages and separate dashboards for residents, village managers and administration.

**Stack:** React 19, TypeScript, Vite, Bootstrap, C# / ASP.NET Core 10, Entity Framework Core, PostgreSQL, JWT authentication, BCrypt, MailKit and Playwright.

## Features and access

| Role | Main access |
| --- | --- |
| Visitor | Public information, published properties, enquiries and resident registration |
| Resident | Own profile, maintenance requests and visible documents for their village |
| Village Manager | Residents, maintenance, documents, properties and purchase orders for their village |
| Administration | Administration across both villages |

New public resident accounts require approval before login. The backend checks each user's role, village and record permissions; the frontend is not the source of access control.

**Login:** Signed JWT in an HttpOnly cookie, revocable PostgreSQL sessions, 20-minute inactivity logout, password hashing, CSRF validation and rate limits. No QR-code or authenticator step is required. JWT and session code is in `server/Security/`.

## Project structure

| Path | Purpose |
| --- | --- |
| `client/components/` | React pages, forms and dashboards |
| `client/security/` | Client API access and session management |
| `client/tests/` | Test and deployment checks |
| `server/Controllers/` | REST API and access-controlled file endpoints |
| `server/Security/` | JWT, authorization, sessions and account validation |
| `server/DTOs/` | Request validation |
| `server/data/`, `server/models/`, `server/Migrations/` | EF Core database |
| `server/Hosting/` | React SPA fallback and development utilities |
| `index.html` | Frontend HTML and metadata |
| `.github/workflows/` | Azure deployment and automated tests |

All real portal data comes from PostgreSQL, not mock data. Existing migrations also load the supplied Ngatea brochure material and its published images.

## Run locally

Install **Node.js 24**, **.NET 10 SDK**, and **PostgreSQL** (locally or through Docker). Set up a local PostgreSQL database, and keep passwords out of Git.

```bash
npm ci
cp .env.example .env.local
```

Vite uses `.env.local`. ASP.NET Core **does not** automatically read it; provide backend settings through your shell, `.NET user-secrets` or the host environment.

Run the API in one terminal:

```bash
export ASPNETCORE_ENVIRONMENT=Development
export ConnectionStrings__DefaultConnection='Host=127.0.0.1;Port=5433;Database=samctdb;Username=postgres;Password=YOUR_LOCAL_PASSWORD'
dotnet run --project server --no-launch-profile -- --migrate
ASPNETCORE_URLS=http://127.0.0.1:5072 dotnet run --project server --no-launch-profile
```

Run React in another:

```bash
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` to port `5072`; the health endpoint is `http://127.0.0.1:5072/api/health`. Leave `VITE_API_BASE_URL` empty for same-origin requests. Use your own development accounts; automated test fixtures are disposable and are **not** production accounts.

## Azure App Service deployment

The single Azure App Service hosts the React build and the .NET API on the same origin. `.github/workflows/azure-deploy.yml` builds both and publishes through the GitHub Actions secret **`NEWSAMCT`**, containing the **full, private Azure publish profile XML**.

Set these under **Azure App Service → Settings → Environment variables → App settings**:

| Setting | Description |
| --- | --- |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `AllowedHosts` | Actual App Service hostname, without `https://` |
| `ConnectionStrings__DefaultConnection` | Azure PostgreSQL connection string with SSL |
| `Jwt__SigningKey` | Base64-encoded cryptographically random key (at least 32 bytes) |
| `DataProtection__KeyPath` | Private persistent directory under `/home` |
| `Security__Uploads__Enabled` | `false` for the demo |

The actual Azure hostname is shown on the Web App **Overview** page. Update the publish-profile secret after resetting publishing credentials; never paste the profile or private values into GitHub code or issues. Open **Monitoring → Log stream** to investigate a failed startup.

**File uploads:** Production uploads are intentionally **disabled** until a private, approved file scanning/storage solution is installed. Published brochure JPEGs bundled with the server may still be displayed. Do not switch on uploads for an internet-facing deployment without a safe replacement. This restriction affects new document/photo uploads and some historical uploaded files.

**Before public handover:** Rotate exposed credentials, confirm roles and resident data, review brochure publication, check database migrations and backups, verify email settings, and test login and permissions on the live Azure URL. A successfully completed GitHub deployment is not itself a security audit.

## Tests

```bash
npm run build
dotnet build server --configuration Release
npm run test:deployment
```

The `SAMCT security and end-to-end tests` GitHub workflow runs browser tests against an isolated PostgreSQL database. To run the complete test suite locally, use `npm run test:e2e:local` with Docker and the documented prerequisites. It changes disposable test data; **never point it at the organisation database**.

## Security reports

Please send security concerns privately to the repository owner. Do not post residents' personal information, login tokens or credentials in public issues. This README documents current behavior; older audit reports were removed because they described superseded implementations.

**Developer:** Sue Raisianzadeh · suewebstudio
