# Security evaluation

## Primary metric

**Security control cases passed** is the primary outcome because it directly measures the promise to users: anonymous callers and cross-role callers cannot reach private SAMCT data/actions, and public marketing output does not leak resident fields.

The evaluator runs the same source-level controls against the exact baseline commit and final tree. It is intentionally complemented by compiled unit and runtime browser/API tests; static checks alone do not prove runtime safety.

| Version | Passed | Total | Score |
|---|---:|---:|---:|
| Baseline `0529271` | 0 | 17 | 0% |
| PortalShield | 17 | 17 | 100% |

Machine-readable evidence:

- `evaluation/results/baseline.json`
- `evaluation/results/final.json`

## Evaluation cases

| Area | Cases |
|---|---|
| Authentication | middleware order; full JWT validation; admin registration; navigation removal; React role guards; token invalidation; rate limits; reset-token safety |
| Data authorization | maintenance authentication; document/village scope; marketing DTO privacy; purchase-order scope; protected private uploads |
| HTTP | security/cache headers; exact-origin CORS |
| Privacy/CI | sensitive tracked-file removal; build/audit/secret/unit/integration gates |

Run:

```bash
npm run eval:all
```

## Runtime test matrix

| Actor | Representative expectation |
|---|---|
| Anonymous | Private React route redirects; `/api/users` returns `401` |
| Public visitor | Marketing endpoint works but contains no resident/document keys |
| Resident | Logs in and reaches own maintenance workflow |
| Village manager | Reaches own-village workflows; cannot open admin-only registration |
| Administrator | Reaches admin property, maintenance and purchase-order workflows |

Run with the synthetic setup in `docs/REPRODUCTION.md`:

```bash
npm run test:e2e
```

## Challenging case

The public marketing endpoint and the private property management endpoint use the same database entity. The baseline returned the complete entity publicly, including resident names, emails, occupations, notes and private-document URLs. PortalShield keeps the private model for authorised staff but projects an explicit public object containing only listing fields. This revealed why serialising an ORM entity directly is dangerous: a later private column can silently become public.

## Limitations and honest interpretation

- The 0→17 result measures controls defined for this observed baseline, not every possible vulnerability.
- CI runtime evidence is authoritative for backend compilation because the local Codex workspace did not provide a .NET SDK or Docker daemon.
- The work is not a formal penetration test and does not claim compliance certification.
- Known remaining risks are documented in `SECURITY.md`, especially historical Git objects, session-storage XSS exposure, coarse authenticated file access and in-memory rate limits.
