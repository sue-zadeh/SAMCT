# Login and form review — 16 October 2026

Changes are delivered in PR #5. They are not a production deployment. Use the latest PR check result; an older successful run does not validate a newer commit.

## Fixes

- Login previously rejected stored usernames containing spaces before checking the password. Existing names now authenticate without applying new-registration rules. Outer whitespace is trimmed; internal spaces are preserved. Usernames remain case-insensitive and passwords remain case-sensitive.
- New usernames, including renamed accounts, require 5–50 ASCII letters, digits, dots, underscores or hyphens. Existing shorter names are retained. This is an input rule, not a substitute for password strength, MFA or rate limiting. Residents cannot rename themselves through the API.
- Legacy accounts can still update their profile, change their password and submit maintenance. The server continues checking session ownership, role and village for each operation.
- Login validation errors identify the field. Staff still need an authenticator or recovery code; accepting a legacy username does not bypass MFA.
- User management submits edited accounts only. Unchanged users are no longer rewritten when staff save one resident. Inputs are locked while saving.
- A manager's maintenance reply retains the status displayed in the form unless the manager changes it.
- Purchase orders accept decimal costs, preserve zero when editing, require the server-required fields, and show save errors.
- Unit forms support up to ten validated photos, previews, removal/undo and replacement. Publication controls govern anonymous access. Brochure gallery limits and representative-photo descriptions are separate from operational unit photos.
- The owner-requested copyright-only footer is preserved. Developer attribution remains in SEO metadata, with checks updated accordingly.
- `System.Security.Cryptography.Pkcs` is explicitly upgraded to 10.0.13 to fix the advisories reported against MimeKit's transitive 10.0.0 dependency (GHSA-2fmv-rv2c-59x7 and GHSA-846f-f764-76mx). CI still fails on known vulnerable npm/NuGet packages.

## Test coverage

Playwright runs against the real API, disposable PostgreSQL database and ClamAV scanner, with retries disabled. Browser tests submit forms and check persisted results; direct API tests check permission and validation bypass attempts. Test email goes to a local outbox, not real recipients.

| Form or behaviour | Coverage |
| --- | --- |
| Login/logout | Resident, manager and admin browser login/reload/logout; mixed-case and legacy names; blank fields; inactive accounts; CSRF, lockout, forged storage and revoked cookies |
| Registration | Browser pending-resident submission; minimum username length; case-insensitive duplicates; server password and role restrictions |
| Forgot/reset password | Browser email/reset flows; mismatch errors; local email contents; single-use/expired tokens and session revocation |
| Profile and photo | All three portal profile forms and avatar uploads; persisted values; authenticated image access; recovery-email password confirmation |
| Change password | All three portal forms; missing/incorrect current password; session revocation and login with the new password |
| Account security | Browser enrollment, recovery-code regeneration and resident disable flow; server tests for required staff MFA, replay rejection, lockout and reset protection |
| Manage users | Admin and village-manager browser edits/approval; only changed rows saved; cross-village and privilege-change restrictions |
| Maintenance | Resident submission and manager reply in the browser; saved status and resident visibility; ownership, village and file restrictions |
| Documents | Browser notice upload; stored script text remains text; server visibility, village, file type/size and malware checks |
| Purchase orders | Admin and manager browser create/edit/delete with decimal/zero cost; server ownership and cross-village restrictions |
| Units | Browser ten-photo create/edit/remove/replace/publish flow; invalid slots, duplicate uploads and unauthorized writes rejected |
| Brochure marketing | Browser gallery/keyboard/mobile layouts and content/contact/photo editing; server publication and file permissions |
| Contact | Browser submit and local outbox; server length/email checks and fixed destination |
| SEO/deployment | Public pre-rendered metadata, private noindex, routes and production web-server headers/configuration checks |

The suite is configured for Chromium. It does not establish compatibility with every real phone/browser or replace an independent penetration test.

## Before inviting the organisation

1. Merge only after the latest required CI run succeeds. Back up and rehearse database migrations before applying them to the organisation database; never seed test users there.
2. Configure Railway's private upload/key volume and private ClamAV service as described in README. The previously observed `Storage__UploadPath` startup error is a storage configuration problem, not evidence of missing tables.
3. On the final HTTPS domain, verify secure cookies, API routing, persisted uploads after restart, and actual reset/contact email delivery. Local outbox tests cannot verify SMTP/DNS delivery.
4. Give Graeme and Amanda separate approved administrator accounts and complete MFA enrollment. Confirm resident approval ownership, role/village assignments and current marketing availability with the organisation.
5. Keep tested backups of PostgreSQL, private uploads and the data-protection key ring. Rotate previously exposed credentials and assign responsibility for runtime/dependency updates and monitoring.

Passing tests support release review; they cannot guarantee that a website will never be compromised.
