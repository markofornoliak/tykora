# TYKORA v0.8.0 — source audit (2026-10-25)

Baseline commit: `9fb97bce89b54d071e6344e7449e095d818f51be`, branch `main`. Version declared by `package.json`: `0.8.0`. This file records **observed source and GitHub Actions evidence**, not a complete independent accessibility or UX certification.

## Verified evidence

- GitHub Actions [Quality gates, run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299), completed successfully 2026-10-25 at 00:08 UTC. Node 24 / `ubuntu-latest`; `npm install`, domain/backup/quality/worker checks, `npm run check`, 34 Vitest tests across 7 files, Vite build, 18 dev E2E and 2 production E2E (Chromium) passed. [Pages deployment, run 40145391276](https://github.com/markofornoliak/tykora/actions/runs/40145391276) succeeded for the same commit.
- Vite log: main JS chunk 552.70 kB minified, 181.50 kB gzip; CSS 29.98 kB minified, 6.97 kB gzip; score worker 3.75 kB minified. This is **build output**, not bytes downloaded on first visit.
- `src/domain/typing/engine.ts` accepts DOM textarea values (not keyboard codes); grapheme segmentation via `Intl.Segmenter`; IME commit handling is present. Short-session and paste tests exist, but cross-browser manual IME scenarios were **not confirmed**.
- Dexie `tykora-db` declares schema versions 1–4; `parseBackup` validates rows, import is transactional, and stable ids are used in `bulkPut`. Migration tests from real saved v1/v2/v3 DB snapshots do **not** exist in the inspected tree.
- Privacy: custom text and keystroke sequence are held in transient engine state. Production network trace inspection is **not confirmed**.

## Actionable P0 gaps / defects

1. Repository contains **no `package-lock.json`**; CI installs with `npm install`. Reproducible dependency versions and `npm ci` are missing.
2. **No `lint` script/configuration** in `package.json`.
3. `calculateScore` caps duration at 1 s rather than returning null speed when active time < 3 s or < 10 graphemes; `CPM` uses attempts rather than correct final characters; time and interval logic include long inactive pauses. Changing this contract requires a scoring-version bump, UI compatibility and backup compatibility tests.
4. Current score cache, `TargetDisplay` and typing textarea still share React session updates on each accepted input. Actual input-to-paint p95 and renders/keypress are **not confirmed**.
5. Data replace in `src/infrastructure/backup/backup.ts` clears tables inside a transaction but lacks a guaranteed downloaded/exported pre-replace backup and cryptographic checksum.
6. UI strings outside the 10-language chrome catalog remain hard-coded; full-page localization is **not confirmed**.
7. Analytical SVG has an accessible name, but full tabular/text equivalents for all visualizations are not present.
8. Playwright CI installs Chromium only; Firefox/WebKit, full WCAG 2.2 AA manual checks, 320px/theme matrix, service-worker update/migration regression and production outbound-request audit are missing or unconfirmed.
9. Course content is 124 RU/EN lessons; mastery effectiveness, independently licensed material coverage and pedagogical outcomes are unconfirmed.
10. `README.md` says production verification has not occurred even though Actions later succeeded; document and deploy-status statements require reconciliation, without claiming more than the evidence supports.

## Phase-0 acceptance status

Source structure, version, historical CI logs, existing tests, and single-run Home Lighthouse mobile/desktop measured (run 40196542139). The Home mobile score is 93 (LCP 1995.10ms), desktop score 100 (LCP 485.09ms). Browser/manual journey, saved v0.8 profile, IndexedDB schema fixtures v1–v4, axe-core, React render count and input-to-paint trace are **not confirmed**. Phase 0 is *incomplete* until these are collected; later phases must not be called accepted on this evidence alone. See [baseline table](PERF-BASELINE-v0.8.0.md).

## Safe continuation

Keep `main` and deployed v0.8.0 unchanged. Develop against `feature/v0.9.0`; before release, add real migration fixtures and repeat baseline/load tests on unchanged original main. Never fabricate missing performance numbers.