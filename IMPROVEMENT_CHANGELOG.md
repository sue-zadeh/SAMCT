# Improvement changelog

The competition baseline is commit `0529271`. The primary metric is the same 17-case evaluator for baseline and final. Browser/API tests use synthetic users and the same role expectations on every run.

| Stage | What changed and why | Evidence | Decision / learning |
|---|---|---|---|
| Baseline | Audited the existing UI, API, tracked files and deployment setup. The browser stored a role but the API had no authentication middleware or authorization attributes. | `npm run eval:baseline`: **0/17**. Baseline frontend build passed with a missing CSS warning. | Established that visual role menus were not a security boundary. |
| Iteration 1 — server authority | Added JWT validation, active-user lookup, explicit role policies, access-token expiry and server-owned identity/village claims. | Unit contract tests plus `AUTH-01/02/03` in the evaluator. | Kept. The API must decide identity, role and village; request bodies cannot. |
| Iteration 2 — tenant scoping | Added own-user and own-village checks across maintenance, documents, properties, purchase orders and user management. Replaced public property entities with a marketing DTO. | `DATA-01..04`; Playwright/API anonymous and marketing-field tests. | Kept. Resource-level scoping contributed the largest risk reduction. |
| Iteration 3 — session lifecycle | Added BCrypt factor 12, strong-password policy, login/recovery rate limits, hashed reset tokens, logout deny-list and `TokenVersion`. | Password/token unit tests; `AUTH-06..08`. | Kept. Short expiry alone was insufficient after password or role changes. |
| Iteration 4 — privacy and uploads | Removed tracked real-user seed, configuration, personal files and stale test evidence. Added synthetic seed, upload allow-lists, random names and authenticated private-upload middleware. | `PRIV-01`, Gitleaks working-tree gate and tracked-file inspection. | Kept. Demo convenience must not turn the repository into a data store. |
| Iteration 5 — frontend trust UX | Moved the access token to session scope, installed authenticated request handling, guarded role routes and removed public/manager registration links. | Frontend TypeScript build and route/browser tests. | Kept as defense in depth; server policy remains authoritative. |
| Iteration 6 — public experience | Completed resilient Marketing states, a structured About page, accessibility details, canonical metadata, `robots.txt` and sitemap. | Production Vite build; public Playwright navigation test. | Kept. Public content stays independent of private portal access. |
| Removed experiment — frontend-only guards | The original design used menu visibility and browser-stored roles as the access control. Direct API calls bypassed it. | Baseline `0/17`; anonymous `/api/users` boundary test captures the failure. | Removed. Frontend guards are useful UX, never authorization. |
| Final | Combined the controls, synthetic test path, CI gates and submission evidence. | `npm run eval:final`: **17/17**; `npm audit`: **0 known vulnerabilities**; frontend production build passes. | Ready for CI-backed review on the isolated branch. |

## Main observed failure mode

The most dangerous failure was not a broken page—it was a plausible page that implied security the API did not implement. This is why the final evaluation prioritizes unauthorized direct requests, cross-role access and public-field leakage rather than screenshot-only success.
