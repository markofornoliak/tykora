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

## 2026-11-05 · Track F candidate: integrity and migration idempotence

- Hypothesis F1: CRC backup corruption and 25 MiB limits reject malformed user input *before* mutation; a synthetic v1–v3 migration survives two additional document reloads without changing original v1 scores.
- Experiment F1: new cross-browser Playwright tests in `e2e/backup.spec.ts` and a two-reopen extension of `e2e/migrations.spec.ts`.
- The CRC test saves a real local profile, exports it through the UI, alters the saved JSON without updating the CRC32, attempts import, and checks the original alias after page reload.
- The size-limit test uploads a 25 MiB + 1-byte file and requires rejection before parsing. The migration tests assert native IDB version 40 and the exact previous score after each restart.
- No production code, schema, fixture truth labels, thresholds, or golden snapshots were changed. Synthetic legacy data is **not** claimed to be actual customer exports. Crash-in-the-middle and physical device behavior remain **UNTESTED**.
- Status at commit authoring: candidate / **CI pending**, no green claim until full Chromium/Firefox/WebKit results.

## 2026-11-05 · Track F: P2P bounded message processing candidate

- Hypothesis F2: manually signaled WebRTC's payload-size checks do not bound an incoming message flood; a per-peer 40/s rate gate and capped outgoing progress frequency prevent unbounded JSON parsing and channel sends without changing the wire schema.
- Experiment F2: `src/infrastructure/peer/manualWebRtc.ts` adds `PeerRateGate`; progress sends limited to 40 Hz but completion messages remain unconditional, invalid fractions are dropped, channel handlers are cleared on close.
- `src/infrastructure/peer/manualWebRtc.test.ts`: deterministic count-window, independent-peer, backwards-clock, oversized SDP and room/role checks.
- The 40/s bound is a new *security behavior*, **not** a reduced test workload. Existing user-side typing and scoring remain unchanged; no STUN defaults changed. Exact CI status pending; no physical multi-peer reliability claim.

## 2026-11-05 · Track P: equal-session memory experiment

- The iteration 5 ten-minute trend grows the input from 0 to 4,000 characters, so its +1.108 MB change cannot distinguish active-session state growth from a leak.
- New experiment: five identical 500-character custom sessions, completion, persistence and restart, all in a **single browser document**. Force GC after every restart and record JS heap, DOM nodes, document/window listeners and CDP detached DOM nodes where supported.
- Capture baseline and final Chromium .heapsnapshot.gz files for retainer inspection. Emit linear heap slope per session and exact raw samples. Zero growth **not assumed**; no artificial success threshold.
- Workflow: `.github/workflows/iter6-memory.yml`; script `scripts/iter6-memory.mjs`. CI status **pending**. This is headless Chrome only, not Safari, headed GPU, physical memory, or an assertion of absent leaks.
