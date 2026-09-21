# SAMCT security and delivery review

Review date: 21 September 2026. Baseline: `0529271` on `main`.

## Delivery decision

The original baseline is not ready for internet delivery with private resident data. The hardening branch addresses the verified code issues below and passes all 43 automated tests. It is ready for code review, with release blocked on credential rotation, historical data exposure review and staging/deployment checks. The changes are in [PR #1](https://github.com/sue-zadeh/SAMCT/pull/1); they have not been merged into main or deployed to production.

## Verified findings and changes

| Severity | Baseline issue | Change |
| --- | --- | --- |
| Critical | Login returned user information without creating an authenticated server session. API controllers lacked enforced role checks. | Added encrypted cookies, database sessions, an authenticated fallback policy, explicit role requirements and per-record village/owner checks. |
| Critical | Anonymous registration accepted elevated roles and immediately activated accounts. | Public registration is Resident-only and pending approval. Managers may create residents only in their own village; administrator roles are assigned only by administration. |
| High | Submitted usernames, village names and record IDs were trusted for protected reads/writes. | Identity comes from the validated session; cross-user/cross-village requests are rejected. Profile changes cannot change village. |
| High | Public marketing returned full property entities, including resident details and private document URLs. | Replaced the response with an explicit public-field projection. |
| High | Uploaded documents/images were served by static-file middleware, without record permissions. | Added a permission-checked download controller, private storage, visibility checks and controlled legacy-file access. |
| High | Upload validation was absent/inconsistent and had no per-file size limits. | Centralised generated filenames, image/document size limits, MIME/signature checks and Office archive checks. Reject legacy DOC/XLS and disguised VBA packages; preserve download sandbox headers through the reverse proxy. |
| High | No CSRF, login throttling, account lockout or session revocation existed. | Added antiforgery validation, IP limits, a persisted lockout counter, expiring sessions and logout/password/access-change revocation. |
| High | Recovery tokens were stored directly, password policy was weak, and profile email changes needed no password confirmation. | Added hashed random reset tokens, expiry/single-use enforcement, a 12-character policy and confirmation for self-service email changes. |
| High | Configured credentials, seed data and runtime uploads were tracked in a public repository. | Removed current secrets/default seeds/runtime artifacts from tracked source, added exclusions and operator guidance. History/credential rotation require owner follow-through. |
| Medium | Contact controller requested an unregistered concrete email service; failures could expose internals. | Fixed dependency injection, added a contact DTO, bounded input, honeypot/rate checks, controlled failure responses and an isolated test outbox. |
| Medium | Some dashboard numbers were placeholders instead of actual records. | Dashboard counts query PostgreSQL. |
| Medium | Existing browser tests targeted the demo; their workflow lived in `github/workflows` instead of `.github/workflows`. | Added local-only fixtures and a managed app/API test run with PostgreSQL in CI. |
| Medium | npm dependencies had seven high-severity audit findings. | Updated affected packages through the lockfile; current audit reports no known vulnerabilities. Updated EF Core to 9.0.20 and Npgsql EF provider to 9.0.4; removed unused JWT authentication package. |
| Medium | The local PostgreSQL Compose file included a password and exposed its port on all host interfaces. | Require a local environment variable, bind only to loopback, and document that changing the variable does not rotate an existing database password. Renamed the file to `compose.local.yml`. |
| Delivery | Generic SEO, incorrect author credit and no clear public/private indexing policy. | Added page metadata, build-time public heads/canonicals/sitemap, the requested author credit, and noindex portal/demo output. |

## Validation

Functional validation for commit `4005de58fe7085fbb5312c9059dde83a02af72bd`: [successful GitHub Actions run](https://github.com/sue-zadeh/SAMCT/actions/runs/35607135759). The PR checks show the result for subsequent handover/documentation commits.

| Check | Result |
| --- | --- |
| React/TypeScript production build | Passed |
| ASP.NET Core Release build with warnings treated as errors | Passed; zero warnings/errors |
| Schema migrations against a new PostgreSQL 17 database | Passed |
| Playwright Chromium suite | **43 passed**, zero failures, retries disabled; 1.8 minutes |
| npm dependency audit | Zero known vulnerabilities reported |
| NuGet dependency audit, including transitive packages | No known vulnerabilities reported |

| Test group | Tests | What is exercised |
| --- | --- | --- |
| Authentication | 10 | Three portal logins, reload/logout and cookie replay, public registration approval, CSRF, password change and single-use recovery with session revocation |
| Authorization | 13 | Administration title aliases, anonymous access, resident ownership, village isolation, forged browser roles, purchase-order ownership and account deactivation |
| Workflows and files | 11 | Public listing privacy, private downloads, maintenance creation/replies, document visibility, upload rejection, stored script text and contact submission |
| Validation and SEO | 7 | Security headers, CORS, server-side form validation, public metadata, private noindex and production sitemap/canonical output |
| Abuse protection | 2 | Persisted account lockout and real IP rate limits |

The tests use the real React application and ASP.NET API with generated accounts in a disposable PostgreSQL database. They do not mock authorization or disable rate limits. Test email goes to a local outbox. No production database, real SMTP delivery or live hosting environment was used. Failed initial runs exposed missing MVC antiforgery service registration and a logout navigation race; both were fixed before the passing run.

## Remaining release checks

1. Rotate any real SMTP/database credential that has appeared in Git history. Review previously committed uploads and public repository exposure with the owner. Removing the latest tracked copy does not remove historical copies.
2. Confirm the client agrees with registration approval and the administration job-title aliases sharing the same access. Verify every existing account, its village and activation status.
3. Review migration SQL, resolve duplicate identities and test backup/restore before applying it to an existing database.
4. Confirm same-origin HTTPS hosting, secure cookies, trusted proxy configuration, allowed hosts, persisted/restricted data-protection keys and uploads, remote database TLS/private networking, and SMTP delivery on staging.
5. Run the complete suite on the intended release commit and a staging smoke test. Production configuration, cloud IAM/firewall rules, live certificates, backups and real email delivery were not audited through hosting credentials.
6. Confirm client content, listing/photo privacy, the production domain and Search Console ownership. The UI still needs JavaScript; SEO changes are metadata/static heads, not full SSR.
7. Agree on ongoing monitoring, retention, patching, account reviews, and whether administrative MFA or a file malware-scanning service is needed. Neither is implemented in this change.

This is a source review with automated regression coverage, not an independent penetration-test certification or a guarantee of complete security.

## Implementation references

- [Microsoft: cookie authentication and validation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-9.0)
- [Microsoft: antiforgery protection](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-9.0)
- [Playwright: API testing](https://playwright.dev/docs/api-testing)
- [Playwright: managed web servers](https://playwright.dev/docs/test-webserver)
- [Google: robots meta tags](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
