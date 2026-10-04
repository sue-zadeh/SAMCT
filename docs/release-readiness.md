# SAMCT release readiness

Review started 4 October 2026 (UTC), against `main` at `ee089eb`.

Developer: **Sue Raisianzadeh — Freelance Web Developer, suewebstudio**.

This report covers [PR #2](https://github.com/sue-zadeh/SAMCT/pull/2). It supplements the historical [first security review](security-review.md). A previous green run does not validate later changes: current main contained unresolved merge markers and its backend build failed. This PR repairs that controller and checks for conflict markers before every build.

## Changes and user impact

| Area | Behaviour |
| --- | --- |
| Access | Public visitors have no private portal access. Residents see their own permitted records; managers are limited to their village; administrative titles share the existing administration permissions. |
| Staff login | Managers and all administrator titles must use an authenticator app. The first password login requires enrollment; subsequent logins require a code or unused recovery code. Staff sessions created before the migration are revoked. |
| Resident login | Password login remains available. Residents may enable MFA in Account security. Disabling it requires their password and a second factor. |
| MFA protection | Pending logins expire in five minutes; failures contribute to the account lockout. TOTP steps and recovery codes cannot be reused. Authenticator secrets are encrypted, and recovery codes are stored as hashes. Password recovery cannot remove MFA. |
| Recovery changes | Changing the profile email invalidates old reset links and every session. Generating new recovery codes invalidates the old codes and other sessions. |
| Files | New uploads and authorized downloads are scanned with ClamAV. Detections are rejected; unavailable scanners return 503. Existing file validation and record permissions remain enforced. |
| Runtime | ASP.NET Core / EF Core move to .NET 10 LTS. Production requires explicit private storage, a persisted key directory, approved hosts and a scanner host. |
| Public SEO | Home, About, Marketing and Contact have pre-rendered content, distinct metadata, canonical URLs, social previews and structured data. SAMCT is the publisher; Sue and suewebstudio receive developer credit. |
| Private SEO | Portal/login/recovery pages stay noindex. Unknown routes return 404; public URL variants redirect consistently. SEO directives never replace API authentication. |
| Local tests | `npm run test:e2e:local` starts its own PostgreSQL and ClamAV services and sets the missing test database variable automatically. See README for prerequisites and viewing results. |

## Validation

Validation of the final PR revision is in progress. The first CI run passed the frontend build, .NET Release build with warnings treated as errors, both dependency audit gates and 51 of 53 Playwright tests. It exposed an incorrectly wrapped EICAR antivirus test sample and a dependent test's non-unique title. The fixture was changed to an exact EICAR file inside an Office archive, and the outage test was isolated. Final results will replace this paragraph after verification.

The suite uses Chromium, a real PostgreSQL 17 database, real login/CSRF/session code and a real ClamAV daemon. It includes allowed workflows and forbidden requests, across all access areas. Rate limits remain enabled and Playwright retries are disabled. An additional container check exercises the actual Nginx configuration over local HTTPS, including public content with JavaScript disabled, developer credit, canonical routes, private noindex and 404 responses.

This does not establish that every possible attack or every browser has been tested. No production database, real organisation files, real SMTP delivery or production hosting account was accessed. Independent penetration testing remains appropriate before storing sensitive organisation data on a new public deployment.

## Release gates and ownership

The code is not a complete production deployment. Before launch, the owner/operator must record completion of:

1. **Credential rotation and historical exposure review.** Rotate any real database/SMTP credential previously committed to Git and review historically uploaded organisation files. Deleting current files does not remove their history. This PR does not rotate credentials or rewrite history.
2. **Account and role approval.** Confirm each existing user's village, role and activation, including the shared administration access for CompanySecretary, FinancialAdvisor, Chairman and Admin. Verify staff identity before first MFA enrollment. Confirm who approves resident registrations.
3. **Migration and recovery rehearsal.** Back up the database, private uploads and data-protection key ring together. Rehearse migrations and restoration on a copy. Check duplicate usernames/emails before the earlier identity-index migration. Deploy the new migration before starting the new app version; do not run test seeding against organisation data.
4. **Private scanner operation.** Provide a ClamAV service on private networking, current signatures updated by `freshclam`, health alerts and sufficient memory. Keep archive/document scanning enabled; scanner size limits must cover at least the application's 5 MB files and 50 MB expanded Office limit. Enable alerts for encrypted files and exceeded scan limits, so unscannable content is rejected. ClamAV TCP has no authentication: never publish port 3310 to the internet. Test a standard EICAR fixture and an outage on staging. Scanning cannot guarantee a file is harmless.
5. **Hosting configuration.** Use one HTTPS origin, valid certificates, approved `AllowedHosts`, the actual trusted proxy addresses, restricted persistent keys/uploads, database TLS/private networking, secret-manager configuration and a non-root API process. Do not expose the API, uploads directory or database directly. Keep the key ring encrypted and access restricted; losing it makes enrolled authenticator secrets unreadable.
6. **Staging checks.** Verify secure cookie flags, role isolation, MFA enrollment/recovery, login/reset/contact email delivery, file authorization/scanning, HTTPS redirects and the reverse proxy's security headers. The local test outbox does not prove live email delivery.
7. **SEO and content approval.** Confirm the actual public origin, descriptions, images and contact details. Set `VITE_SITE_URL` and `VITE_ALLOW_INDEXING=true` only for the approved production build. Rebuild after content changes. Submit `/sitemap.xml` in the organisation's Search Console account. Listing availability loads from the database after JavaScript starts; no per-property rich results or Google ranking are promised.
8. **Ongoing ownership.** Assign responsibility for security/runtime updates, scanner signatures, access reviews, monitoring, incident response, disk quotas, retention and tested backups. Apply shared edge rate limits if the API runs across several instances; the app's in-memory IP limits are per process.

## Lost authenticator and recovery codes

An unused recovery code can replace the authenticator code at login. After login, the user can generate new recovery codes using their current password and another valid code. The previous code set stops working. Staff cannot turn off MFA, and resetting a password does not bypass it.

If every second factor is lost, support must verify identity through an independently confirmed organisation contact and record the approving operator and reason. Do not accept an email-only request as proof. A trusted database operator then carries out a reviewed maintenance transaction for that **single verified account ID**:

1. Lock the target user row and confirm its identity, village and role.
2. Clear `MfaSecret`, `MfaPendingSecret`, `MfaPendingExpiresAt`, `MfaLastTimeStep`, `MfaRecoveryCodeHashes`, `PasswordResetToken` and `PasswordResetTokenExpiry`.
3. Delete that user's `AuthSessions` and `MfaChallenges`; clear the failure counter/lockout only if the approved recovery requires it.
4. Commit, record completion without secrets, and supervise enrollment at the next staff login. Restore access only after identity verification; there is deliberately no public reset-MFA endpoint.

Do not delete the whole key ring or clear all users' MFA as a workaround. Restoring an old database backup may also restore old sessions/recovery-code hashes; invalidate sessions, reset links and recovery codes as part of a reviewed recovery before reopening the site.

## Primary implementation references

- [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)
- [Otp.NET TOTP verification and replay guidance](https://github.com/kspearrin/Otp.NET)
- [ClamAV scanning and TCP security](https://docs.clamav.net/manual/Usage/Scanning.html)
- [EICAR standard antivirus test file](https://www.eicar.org/download-anti-malware-testfile/)
- [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
