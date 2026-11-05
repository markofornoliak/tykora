# Iteration 5 worklog

## 2026-11-05 · Preflight / benchmark setup

- Inspected: README, ROADMAP, audit-v0.8.0, PERF-v0.9-BASELINE, I18N-COVERAGE-v0.9, ARCHITECTURE and STAGE7-QUALITY.
- Verified upstream `main` head `0a7d167bc320b503a03dfe1247c96687526ca28b`; no changes to `main`.
- Created `feature/iter5-quality-design` at the same SHA.
- Updated existing measurement workflow to run on this branch, before changing application behavior.
- Historical reference metrics do not establish fresh `main` p95. Actual measurements and check results must be added with run links and immutable full commit SHAs.
- No browser tests or user-device audit claimed at this stage.

## 2026-11-05 · Phase A implementation candidate (NOT accepted)

- Added an external ephemeral session store with immediate visual listeners and a 250 ms React snapshot cadence; retained the original engine, score v2 and database contracts.
- Switched the target display to a bounded 288-grapheme native DOM window updated via requestAnimationFrame; input handlers no longer publish React state per keypress.
- Added unit regressions for coalescing/finish; moved physical-key hint updates onto the existing 250 ms clock.
- Extended benchmark metrics with p50/p99. Build and cross-browser tests must still complete; no performance target is claimed.

## 2026-11-05 · Phase A second candidate (awaiting measurement)

- First matched runs: baseline `0ce60bc` ordinary keydown p95 **32ms**, candidate `e02aea1` **32ms**, both 500/500 inputs and CLS 0; ordinary/profiler commit count **514→4** in separately instrumented builds. Target <=16ms not reached.
- Optimized imperative paint to inspect changed grapheme spans and caret only, instead of all 288 span nodes on every animation frame. Added idle scheduling for completed-session persistence with 1s timeout/fallback. No changes to scoring formulas or database shape.
- Fresh performance and all-browser CI required. See run logs, not just source claims.

## 2026-11-05 · Measured phase-A evidence

- Performance runs: #42018802786 baseline (p95 32ms/514 commits), #42019118123 first candidate (p95 32ms/4 commits), #42019495329 second candidate (p95 32ms/5 commits); 500/500 accepted each, CLS=0 in benchmark scenario.
- Baseline quality #42018802880 and first-candidate quality #42019118378 both completed SUCCESS; all-browser E2E runs on the first candidate are green. Earlier `main@0a7d167` quality run #42018469407 failed on one timeout in a 108-test axe E2E matrix; subsequent same-source baseline branch passed. Do not hide this runner variability.
- Added five-run mobile Lighthouse evidence workflow; results were not yet available at this log entry.
- Additional per-input JS handler and native paint timing diagnostics are opt-in through the benchmark object. They do not record typed strings; benchmark run is required.
