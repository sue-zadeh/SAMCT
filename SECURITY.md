# Security policy

## Reporting a vulnerability

Do not open a public issue containing personal data, credentials or an exploitable proof. Send the maintainer a private report with the affected route, role, reproduction steps, impact and a safe suggested fix. Remove secrets and resident information from screenshots and logs.

## PortalShield security model

Authentication is performed by ASP.NET Core using a signed short-lived bearer token. Authorization combines server-issued role and village claims with current database state. React route guards are navigation controls only; they are not treated as authorization.

| Boundary | Enforcement |
|---|---|
| Registration | Admin policy in API and admin-only React route |
| Resident records | Own account and own maintenance requests |
| Village manager | Resident/operational records for the manager's token village |
| Administrator | Explicit admin role allow-list |
| Public marketing | Allow-listed response projection with no resident fields |
| Password reset | Random token stored only as SHA-256 hash; 30-minute expiry |
| Existing sessions | Token version checked against active database user |
| Uploads | Type/size allow-list, random name, authentication except marketing images |

## Production deployment checklist

1. Rotate all values that ever appeared in the old repository history.
2. Store `ConnectionStrings__DefaultConnection`, `Jwt__Key` and SMTP values in the platform secret manager—not files.
3. Generate `Jwt__Key` with at least 32 random bytes and restrict access to it.
4. Set `Cors__AllowedOrigins__0` to the exact production frontend origin.
5. Set `EmailSettings__FrontendUrl` and `VITE_PUBLIC_SITE_URL` to final HTTPS origins.
6. Run migrations against a backup/staging copy first; normalized unique indexes will surface duplicate usernames/emails.
7. Use persistent object storage or a mounted volume for production uploads; Railway's ephemeral filesystem is not durable.
8. Run PortalShield CI, then test all four role boundaries with synthetic accounts.
9. Configure platform log retention and alerts for repeated 401/403/429 responses without logging passwords or tokens.
10. Complete a separately approved Git history cleanup before making the repository a production source of truth.

## Known limitations

- The SPA stores the bearer token in `sessionStorage`; this limits persistence but does not protect against successful same-origin XSS. A same-site deployment should evaluate an HttpOnly, Secure, SameSite cookie plus CSRF protection.
- Authenticated uploads use unguessable names and require a valid session, but access is not yet checked per individual file record. A production document vault should stream files from an authorized endpoint or signed object-storage URL.
- Rate limits are in-process. Multi-instance production should use a shared limiter or edge/WAF rules.
- MFA, formal penetration testing, malware scanning and audit-log retention are outside this sprint.
- Files removed from the branch remain in prior Git history until a coordinated rewrite is completed.
