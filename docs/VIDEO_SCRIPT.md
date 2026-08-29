# Five-minute solution video script

Use a clean local environment or the final branch deployment with synthetic users. Keep credentials and personal data out of the recording.

## 0:00–0:35 — Problem and user

Show the public home page and say:

> SAMCT residents and staff need one portal for maintenance, documents, properties and operational work. The baseline looked role-aware, but the API did not authenticate callers. Browser roles could be changed, sensitive endpoints were public, and public marketing JSON returned private resident fields. PortalShield makes the server the authority.

## 0:35–1:00 — Fair baseline

Show:

```bash
npm run eval:baseline
```

Point to `0/17`. Briefly open the baseline evidence in `evaluation/results/baseline.json`. Explain that the same cases will run on the final version.

## 1:00–2:30 — One realistic execution

1. Open `/login` and sign in as `demo.manager` using the synthetic test password.
2. Show the village manager dashboard and own-village maintenance/documents.
3. Navigate directly to `/register`; show the redirect back to the village manager home.
4. In a second private browser window, request `/admin` without a session; show the login redirect.
5. In DevTools or with `curl`, call `/api/users` without a token and show `401`.
6. Open public Marketing and show that it remains usable without login.

Then show the relevant server policy/village-scope code for a few seconds. Emphasise that React guards improve UX, while ASP.NET Core enforces access.

## 2:30–3:25 — Highest-impact technical choices

Show a compact diagram or the README architecture and cover:

- signed 30-minute JWT with issuer/audience/signature/lifetime validation;
- database active-user and token-version checks;
- admin-only registration;
- own-user and own-village scoping;
- safe public marketing projection;
- rate-limited login/recovery, strong BCrypt passwords and hashed reset tokens;
- protected/randomised uploads and removal of tracked personal files/secrets.

The largest contribution is resource/village authorization, because it closes direct API access rather than only hiding links.

## 3:25–4:05 — Improvement changelog and removed experiment

Open `IMPROVEMENT_CHANGELOG.md`. Highlight the removed frontend-only-guard approach:

> The original experiment used hidden links and browser-stored roles as security. Direct API calls bypassed it, so it was removed as an authority mechanism. Frontend guards remain only as user experience; every sensitive API uses server policy and resource checks.

Mention the privacy iteration and the honest warning that earlier secrets/files still require rotation and a coordinated history rewrite.

## 4:05–4:35 — Final comparison

Run:

```bash
npm run eval:final
```

Show `17/17`, then show CI jobs: frontend build/audit, backend unit tests, Gitleaks and PostgreSQL-backed Playwright/API tests. State that npm audit reports zero known vulnerabilities at submission time.

## 4:35–5:00 — Hot take and close

> The failure mode was convincing UI security: a polished role menu made an anonymous API look protected. My hot take is that useful coding agents should produce executable trust-boundary evidence before producing more features. PortalShield is reproducible, honest about its limits, and ready for review on an isolated branch without touching main.

End on the public Marketing/About page and the branch/CI status.
