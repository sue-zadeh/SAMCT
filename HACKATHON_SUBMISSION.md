# Hackathon submission checklist

## Challenge summary

**Project:** SAMCT PortalShield  
**Problem:** A retirement-village portal appeared role-aware in the UI but did not authenticate API callers, trusted browser identity/village values and exposed private property fields through public marketing data.  
**Intended users:** SAMCT residents, village managers and authorised administrators.  
**Outcome:** Server-owned authentication/authorization, protected data boundaries, safer registration/session/recovery, reproducible evidence, and completed Marketing/About/SEO foundations.

## Required deliverable 1 — complete solution and improvement changelog

- [x] Full React/TypeScript and ASP.NET Core/C# solution.
- [x] Agent/security instructions are represented by code policies, tests and this documentation.
- [x] Intended user and current bottleneck explained in `README.md`.
- [x] Clearly labelled `IMPROVEMENT_CHANGELOG.md` with baseline, iterations, evidence and decisions.
- [x] Main failure mode and hot take included.
- [x] Original `main` branch left unchanged; work isolated on `hackathon/portalshield`.

## Required deliverable 2 — reproduction guide

- [x] Clean-machine prerequisites and exact startup commands.
- [x] Exact baseline, final, unit and browser/API evaluation commands.
- [x] Required synthetic data and expected outputs.
- [x] Tool versions, approximate time and cost.
- [x] CI manual/automatic trigger instructions.

See `docs/REPRODUCTION.md`.

## Required deliverable 3 — solution video (up to five minutes)

- [ ] Record the final video using `docs/VIDEO_SCRIPT.md`.
- [ ] Begin with problem and baseline.
- [ ] Show one end-to-end role execution.
- [ ] Show baseline `0/17` and final `17/17`.
- [ ] Explain changelog, largest contribution and removed frontend-only experiment.
- [ ] Upload the video to the hackathon submission form.

Video recording/upload needs the human owner; the script and exact demo path are ready.

## Required deliverable 4 — agent trajectories

- [x] Representative trajectory for the only agent used (Codex).
- [x] Instruction, actions/tool responses, feedback, retries and checkpoints shown.
- [x] No private chain-of-thought or credentials included.

See `docs/AGENT_TRAJECTORY.md`.

## Judging rubric cross-check

| Criterion | Evidence |
|---|---|
| Problem & user value (15) | README problem/user section and realistic retirement-village role boundary |
| Agent solution & engineering (30) | JWT/session lifecycle, policy/resource authorization, privacy DTO, rate limits, CI/tests |
| End-to-end quality (20) | Login through scoped dashboards plus finished public Marketing/About/SEO |
| Measured improvement (15) | Same 17 cases: baseline 0/17, final 17/17; changelog connects decisions |
| Reproducibility (15) | Clean guide, synthetic seed, unit/E2E commands, CI-generated credentials |
| Hot take / insights (5) | “Convincing UI security” failure mode and server-owned-authority lesson |

## Final human actions before submission

1. Confirm branch CI is green.
2. Review public wording and replace/add only client-approved Marketing/About content.
3. Record and upload the five-minute video.
4. Paste the branch/PR URL and video URL into HackerEarth.
5. Keep the PR unmerged until SAMCT stakeholders approve security, content and migration behavior.

## Separate production blockers (not hackathon blockers)

- Rotate every credential that appeared in prior Git history.
- Coordinate an approved history rewrite and fresh clones.
- Configure persistent upload/object storage.
- Complete a security owner review and staging migration rehearsal.
