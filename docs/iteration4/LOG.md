# Iteration 4 live work log
Time references UTC, date 2026-10-27. This log records actions actually completed; it is **not** a claim of a continuous 12-hour autonomous run.

| Time (UTC) | Action / tool | Outcome |
|---|---|---|
| 22:08 | GitHub `fetch_commit 0a7d167`, branch read, 201-entry tree inspection | main confirmed at `0a7d167bc320b503a03dfe1247c96687526ca28b` |
| 22:09 | GitHub create `feature/iter4-design-content` at fixed SHA | Branch created; main untouched |
| 22:09–22:11 | Inspect course, Practice review route, library, themes, CI; commit SQL module and integration | 24 stand-alone SQLite queries, 48 language-labelled passages, original 44 IDs untouched |
| 22:10–22:12 | Add `scripts/content-audit.mjs`, `npm run check:content` and CI step | Deterministic source metrics and SQLite execution gate; no claims of course diversity PASS |
| 22:11–22:12 | GitHub Actions feedback | Unit failure on stale assertion 44 vs 92; fixed `modes.test.ts`; no test threshold reduced |
| 22:12–22:14 | Add Chromium 162-screenshot capture and 10×10 input-acceptance workflows | CI jobs created; results to be inspected, not presumed passing |
| 22:14 | Write `docs/iteration4/AUDIT.md` and content-provenance ledger | Ranked S1/S2 backlog; items needing migration/rights deferred |
| 22:14–22:15 | GitHub Actions visual audit `40593112284` | PASS: 162 shots, 0 document-width overflows, 0 page errors, 0 critical/serious axe on 18 default-theme route cases; no manual WCAG assertion |
| 22:15 | GitHub Actions full quality `40593385564` | PASS at `99fd60bb`; SQL gate passed; metrics: L1–L2 fallback 100% word overlap; see `CONTENT-AUDIT.md` |
| 22:18 | Paired immutable benchmark `40593238130` | PASS at pre-CSS `2a5bfdad`: ten runs each, median Event Timing p95 32→32 ms, ratio 1.0; still above 16 ms |
| 22:19 | First post-CSS screenshot workflow `40593661542` | PASS: 162/162 images, 0 overflows, 0 browser exceptions and 0 critical/serious axe on tested subset |
| 22:19–22:22 | Added local result PNG export, editorial CSS, screenshot re-run triggers, Lighthouse/stylesheet inventory, ADR-017 and draft PR #2 | New evidence gates queued; no claim of full design/WCAG acceptance |

Commands wired into CI: `npm run check:domain`, `npm run check:content`, `npm run check:quality`, `npm run check`, `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run test:e2e:production`. Only exact completed GitHub Actions run results count as PASS. No local dependency install or graphical audit is asserted in this environment.
