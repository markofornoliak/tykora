# TYKORA Iteration 4 — evidence-led audit (working draft)
Date: 2026-10-27 (UTC) · Baseline: `main@0a7d167bc320b503a03dfe1247c96687526ca28b`
Working branch: `feature/iter4-design-content`. **This is not an acceptance report.**
Severity: S1 learning/accessibility/data failure; S2 material product defect; S3 rough edge; S4 idea. Size: S/M/L.

## Confirmed baseline and execution path
- `src/domain/lessons/curriculum.ts`: 124 stable lessons, levels 1–10; `lessonPrompt` uses `repeatFocus` and reverses the same focus tokens in review. In particular levels 1–2 are pattern repetition, not independently held-out word exercises.
- `src/features/practice/Practice.tsx`: Practice uses `lessonPrompt`. On `review=1` it loads local history/model and calls `generateLessonReview` from `src/domain/lessons/review.ts` with exclusions and review eligibility. On failed generation it falls back to practice prompt with a notice; it **does not** use the pattern-based `lessonPrompt(...,'review')` as its normal holdout.
- `src/domain/lessons/curriculum.ts` reconstructs expected exercise lengths for legacy unversioned prompt IDs. Replacing text under an existing ID could invalidate historical scoring/mastery. No such replacement is permitted without explicit migration semantics.
- `src/domain/content/library.ts` baseline: 22 original passages per locale, eight tracks, no SQL. This branch adds 24 distinct self-contained SQLite samples per locale, giving 46 per locale (92 total); original 44 IDs are unchanged.
- `src/domain/modes/modes.ts`: `quote` selects authored original prose; no externally verified public-domain quote catalog or 150-attribution corpus.
- `src/features/home/Home.tsx`, `src/features/academy/Academy.tsx`, `src/features/results/Results.tsx`: visible Russian JSX copy outside the registered i18n catalog.
- `src/shared/theme/applyTheme.ts`: text contrast is checked against bg/surface but accent distinguishability accepts **max** of two backgrounds, not both; this is not a full interactive-state AA proof.
- `docs/ROADMAP.md`: top paragraph refers to main/site v0.8.0 despite published 0.9.0.
- Prior documented, reproducible baseline in `docs/PERF-v0.9-BASELINE.md`: ordinary Chromium Event Timing p95 40 ms at CPU×4 (not the <16 ms target); no fresh iteration-4 before/after accepted yet.
- Source-only audit does not establish visual scores, Lighthouse scores, manual WCAG compliance or 10-run non-regression. Such values are **not confirmed** until linked job evidence is complete.

## Ranked backlog
| Priority | Finding / evidence | Size | Action in this pass |
|---|---|---|---|
| S1 | Repeated focus words, weak course transfer and overlap `curriculum.ts:repeatFocus/lessonPrompt` | L | Measure with deterministic content auditor; defer changing old prompt text/IDs pending versioned migration and holdout design |
| S1 | Legacy expected length uses reconstructed `lessonPrompt` by ID `curriculum.ts:lessonProgressFromScores` | L | Preserve text, IDs, schema; document v2 migration requirement |
| S2 | No SQL track at baseline `library.ts`, `Practice.tsx` | S | Implemented: 24 executable originals, both locales, stable original IDs |
| S2 | Insufficient authentic passages per track/level: 22/locale baseline `library.ts` | L | Partially improved to 46; 120+ and 24/track remain open |
| S2 | Code snippets are not all self-contained (C++ vector example lacks includes) `library.ts` | M | Do not mutate legacy text IDs; new content needs standalone compilation gate |
| S2 | No PD quotation inventory, metadata or verified translations `modes.ts`/`library.ts` | L | Defer until provenance can be verified |
| S2 | Untranslated feature JSX `Home.tsx`, `Practice.tsx`, `Results.tsx`, `Academy.tsx` | M | Defer full catalog extraction, retain honest 55-key coverage disclosure |
| S2 | Accent validation not complete AA by state and by palette `applyTheme.ts` | M | Record risk; avoid false AA certificate |
| S2 | No measured visual regression baseline across width/theme states `app.css` | M | Automated 162-screen Chromium capture + axe at 768 for two default schemes; manual rubric pending |
| S2 | Input Event Timing p95 > target `PERF-v0.9-BASELINE.md` | L | 10× baseline/candidate workflow; no changes to hot path until evidence |
| S3 | Stale roadmap/release draft text | S | Correct roadmap and prepare iteration draft notes |
| S3 | No locally shipped licensed font subset `app.css` | M | Defer; maintain system-font fallback and prohibit external font requests |

## Execution selection and gates
- **Take now:** SQL course-library expansion, deterministic per-lesson/per-passage diversity measurement, SQLite runtime syntax checks, four-language code-syntax validation, 30 RU/EN ergonomic hints with Academy surfacing, CI, visual evidence capture, 10× input baseline workflow, stale document repair, provenance ledger.
- **Defer:** broad curriculum replacement, new languages, 120+ prose paragraphs, PD quote collection, comprehensive component redesign, CSS/palette rewrites, genuine v1–v3 user snapshots and manual screen-reader signoff. Reason: no safe migration protocol or complete measurement/rights evidence in this execution environment. Do not mark these as PASS.
- Reproduce the content tables with `npm run audit:content` (Node 24; `npm run check:domain` runs first). Content diversity remains **audit-only** until new course texts use versioned IDs safely.
- CI syntax and content gate: `npm run check:content` (Node 24 + Python 3 stdlib SQLite). Screenshots and axe evidence: workflow `Iteration 4 visual evidence`; file names encode route, width, light/dark and palette pair.
- Input non-regression gate: `Iteration 4 ten-run input acceptance` workflow; ten separate `scripts/benchmark-input.mjs` invocations per immutable baseline and candidate, median+quartiles, fail on >10% p95 regression or missing data.
- No automated score proves a WCAG 2.2 AA manual audit. No release, main merge, schema change or version bump in this branch.

## Measured candidate evidence (27 Oct 2026)
See [MEASUREMENTS](MEASUREMENTS.md) for date, tool, exact commit and run IDs. 10-run input p95 median remained 32 ms pre/post; Lighthouse performance and LCP vary across repeated runs and remain above product target. 30 language-specific ergonomic hints have been added but do not address the major curriculum gaps. No course-content S1 is resolved.
