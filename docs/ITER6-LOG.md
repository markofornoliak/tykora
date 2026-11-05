# TYKORA · Iteration 6 worklog

## 2026-11-05 · Phase 0 preflight and instrumentation

- Source repo: `markofornoliak/tykora`, public; write permission verified through GitHub integration.
- Immutable baseline refs verified through GitHub API: `main@0a7d167bc320b503a03dfe1247c96687526ca28b`; `feature/iter5-quality-design@244c5060b37ba9d802dbad796b3ce1ed562f5339`.
- Created `feature/iter6-summit` exactly from `244c5060b37ba9d802dbad796b3ce1ed562f5339`. Draft PR #3 remains open; PR #4 to be opened after the initial instrumentation commit.
- Existing iteration 5 evidence in `docs/PERF-v0.10-BASELINE.md` is historical. This preflight does **not** claim a new measurement or regression relative to main.
- Hypothesis P0: a *same-runner*, same-Lighthouse/version/browser, sequential 3-way comparison with 10 Lighthouse mobile trials per branch resolves confounding from historical runs on different CI machines. Keep the test protocol fixed across branches.
- Experiment P0: `.github/workflows/iter6-phase0.yml` + `scripts/iter6-phase0-summary.mjs`. All runs retain their raw JSON; parsed metrics, trial spread, exact source SHA, browser/config, initial static JS dependency graph and all JS chunk sizes are in uploaded artifacts. Any mismatch in Lighthouse settings makes the comparison fail rather than silently compare incommensurate measurements.
- N=0 at authoring time; status **NOT MEASURED** pending actual CI completion. No pass/fail or performance gain asserted.
- Immutable historical observations (not Phase 0): iter5 had a five-run 1954 ms LCP median at `38c25928` and an entry chunk of approximately 150.37 kB gzip; those **cannot** stand in for the current three-way baseline.
- CI restrictions preserved: no changes to `main`, scoring, tests, app runtime, test thresholds, production deployment or release tags. `checks.yml` remains mandatory and independent.

### Follow-up evidence required

1. Attach a completed run URL, runner version, and raw JSON artifact.
2. Copy exact N=10 results into `docs/PERF-v0.10-BASELINE.md` with three-way comparison and regression statement.
3. Before runtime optimisation, use LCP-element, request chain, JS graph and TBT breakdown to select one variable per experimental commit.
4. Check quality gates and all-browser E2E before accepting any phase.
