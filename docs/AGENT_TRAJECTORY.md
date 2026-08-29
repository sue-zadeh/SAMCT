# Representative agent trajectory

## Agent inventory

One coding agent was used: **OpenAI Codex**. No hidden specialist or parallel sub-agent produced parts of the solution. The human owner set the scope and protected-branch constraint; Codex inspected, changed and verified the repository.

This is a concise, reproducible activity trace—not private chain-of-thought. It records instructions, observable actions, tool responses, decisions, retries and human checkpoints.

| Stage | Agent instruction / goal | Observable action and tool response | Feedback that shaped the next step |
|---|---|---|---|
| 1. Scope | Secure SAMCT, especially login/data/registration; finish Marketing/About/SEO; never modify the original project. | Inspected GitHub repository metadata, created `hackathon/portalshield` from `main`, cloned it and verified the active branch. | Human clarified registration is admin-dashboard-only and public registration was experimental. |
| 2. Baseline | Find the real bottleneck before adding features. | Searched controllers/routes/storage/config, ran the production frontend build and recorded baseline commit `0529271`. | Build passed, but audit found no API authentication, public sensitive controllers, client-trusted roles, private marketing fields, tracked configuration/PII and an inactive CI directory. |
| 3. Authentication | Make the server own identity and permission. | Added JWT creation/validation, policies, active-user and token-version checks, logout revocation, strong passwords, hashed reset tokens and rate limits. | Existing frontend requests failed conceptually without a bearer token, so a shared authenticated request layer and route guards were required. |
| 4. Authorization | Close direct-object and cross-village access. | Added own-user/role/village checks to users, maintenance, documents, properties and purchase orders; ignored client identity fields. | Public marketing still needed anonymous access, so it received an explicit safe projection instead of the private entity. |
| 5. Privacy | Ensure the submission itself does not expose people or secrets. | Enumerated tracked uploads/config/seed/test artefacts, removed them only on the branch, created ignored runtime folders, examples and synthetic seed. | Deleting the current tree did not remove prior Git objects; this became an explicit production blocker instead of a hidden claim. |
| 6. Frontend/public | Keep protected UX coherent and finish outstanding public work. | Centralised bearer handling, moved session data to `sessionStorage`, guarded routes, removed public/manager registration, rebuilt About/Marketing states and added SEO/accessibility assets. | Production TypeScript/Vite build passed. Dependency audit then reported high advisories. |
| 7. Retry | Resolve the dependency gate rather than waive it. | Ran the supported npm audit fix, rebuilt, then reran audit. | Result changed to `0 vulnerabilities`; build stayed green. |
| 8. Proof | Compare the exact start and finish fairly. | Built a 17-case evaluator using the same checks against baseline and final. First final run scored 16/17 because the checker looked for an attribute in the wrong slice. | Inspected the extraction, corrected the evaluator to examine the actual method attribute/projection, reran both: baseline `0/17`, final `17/17`. |
| 9. Reproduction | Let judges start clean and reach the main result. | Added xUnit contracts, Playwright role/API tests, PostgreSQL synthetic seed, CI with ephemeral credentials, exact commands, runtime/cost expectations and failure artefacts. | Local environment lacked .NET/Docker; backend compilation and integration execution were routed to the branch CI and reported honestly. |

## Representative agent instructions

The coding agent was asked to:

1. work only on an isolated SAMCT branch;
2. behave as a senior React/ASP.NET Core developer;
3. implement login/data/registration security and necessary tests/files;
4. finish Marketing, About and SEO without inventing unavailable client content;
5. preserve the original project;
6. prepare a polished, reproducible hackathon submission and report all work.

## Tool categories used

- Git/GitHub: repository inspection, branch creation, diff/status and final branch publication.
- Shell read/verification: `rg`, `git ls-files`, TypeScript/Vite build, npm audit and evaluator.
- Structured edits: patch-based file changes; exact `git rm` only after enumerating sensitive tracked targets.
- CI: .NET build/test and PostgreSQL-backed runtime checks where local SDK/container capability was unavailable.

## Human checkpoints

- The human selected SAMCT over Lodge.
- The human confirmed public registration must not exist and only admins register accounts.
- The human required `main` to remain untouched.
- Future human approval is still required for production deployment, credential rotation, shared Git-history rewrite and merging.
