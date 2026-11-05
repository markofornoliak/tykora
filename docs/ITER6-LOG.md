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

## 2026-11-05 · VERIFIED evidence: Phase 0 and equal-session memory

- **Phase 0 PASS as a measurement protocol**, not as a performance target. [Actions #42114840487](https://github.com/markofornoliak/tykora/actions/runs/42114840487), 30 valid Lighthouse 12.8.2 JSON runs, one matched runner, config and Chrome UA equality true. LCP medians main 1953.9814ms; iter5 1952.9922ms; iter6 initial 1955.7971ms; CLS=0 each, median Performance=98 each. Iter6 initial JS static graph 151870 gzip bytes. Targets LCP ≤1000ms and JS ≤90k FAIL. Full spread/tables and SHA in `docs/PERF-v0.10-BASELINE.md`.
- **Equal-session memory workflow PASS as a test**: [Actions #42116205658](https://github.com/markofornoliak/tykora/actions/runs/42116205658) at `2cfcc70ea492df74652a47440a3ebce313b6be74`. 5 completed identical 500-char sessions, repeated forced GC; heap 3830460→5026648 bytes; 513 DOM nodes, 204 listeners, 0 detached nodes unchanged. Heap trend +202104 bytes/session across 0–5. Heap ≈0 slope goal **NOT MET/NOT PROVEN**; retainers require examination.
- Quality gates for `a2b200a`, `e3b0e94`, `337ee2f` independently SUCCESS on push and PR variants in GitHub Actions. Latest SHA `2cfcc70` quality status must still be verified.

## 2026-11-05 · Track P experimental candidate: paint-prioritized interactive bootstrap

- Baseline at `a2b200a` remains LCP median 1955.7971ms, no improvement vs main; full real interactive startup includes 151870 gzip bytes of statically imported JavaScript.
- Hypothesis P1: parsing/executing the full React/i18n/router runtime *before* the already shipped semantic Home can paint prolongs render delay. Separating main CSS from runtime and importing the runtime after two animation frames on Home lets the genuine, readable Home paint first without removing any element or pretending hydration is optional. All users take identical path, no Lighthouse detection. Deep-links bootstrap immediately; pre-hydration hash navigation forces immediate import.
- Minimal variable: move original `src/main.tsx` React mount code unchanged in effect to `src/app/bootstrap.tsx`; `src/main.tsx` keeps original CSS imports, launches app after real rendering opportunity on prerendered Home.
- This can lower the small *eager static graph* budget but **does not reduce bytes needed to make Home fully interactive**: deferred bootstrap still downloads the full React code. Do NOT claim initial JS ≤90k or ≤105k just by excluding dynamic bootstrap. Browser network waterfall must measure all requests through hydration. Must compare full LCP x10 before acceptance, inspect E2E hydration, offline, navigation and a11y.
- Candidate status: `UNMEASURED` at commit creation. Revert this complete runtime change if matched LCP or interactive behavior does not improve.

## 2026-11-05 · Track D: full-course failure census, BEFORE content mutation

- Existing `contentLint.ts` only checks lessons 1–3, despite 124 course lessons. Preserving existing gate; added separate compiled-domain diagnostic over all **124×2 RU/EN** practice/review pairs.
- Counts 4-gram overlap ≥10%, focus glyph coverage, length/forbidden characters, duplicate practice/review strings and legacy review IDs. Raw 248-row file and all issues uploaded as workflow artifact.
- The audit intentionally reports a nonzero failure count instead of silently marking content quality PASS; no user scores, course IDs or copy rewritten in this observation-only step. Once measured, repair with versioned IDs and historical score compatibility.
- Workflow `iter6-content-audit.yml`, script `iter6-content-audit.cjs`; results **pending CI** at authoring time.

## 2026-11-05 · Track D: new holdout candidate for 121 lessons

- Full-audit run [#42117417962](https://github.com/markofornoliak/tykora/actions/runs/42117417962) at `894749fa` finished SUCCESS as a **diagnostic workflow**, but reported corpus FAIL: 242 overlap violations out of 248 pairs (121 lessons × 2 languages); worst overlap 87.5%. No missing focus keys or duplicate text in that audit.
- Candidate D1: leave original practices, ids and scores unchanged. Keep first-three `-review-v2` texts; version all later newly generated review prompts as `-review-v3`. Legacy `-review` identifiers remain accepted with their historical exact expected lengths. Extended `contentLint` now inspects 124×2 instead of only 3×2. New deterministic holdout: target-key drills for beginner levels and original authored narrative scenes plus drills for advanced levels.
- The holdout generator uses deterministic local seeds, selects among variations with the lowest measured four-gram overlap; it never modifies user data, performs no external fetch, and caches generated text. Unit test checks that preexisting v1 review records for lesson 4 still satisfy mastery.
- This is a *candidate*, not a content PASS. Full-audit, complete unit/build, all-browser E2E and human review still required before acceptance; failures mandate correction or revert.

## 2026-11-05 · D1 red-gate repair: remove low-bit PRNG cycle

- Full 124-lesson unit gate at `9f883276` FAILED for exactly 2 EN lessons: `L01-09`, `L02-07`, each 4-gram overlap 0.1667 (threshold <0.10). The gate **remains strict**. Baseline 242 issues were mostly resolved, but two are outstanding.
- Hypothesis: the LCG low bits used by `random()%4` form a short periodic cycle when a target alphabet has four graphemes, reducing 4-gram diversity. Candidate fix: use upper 24 bits `state>>>8` for all deterministic choices, preserving seed/ID semantics. Run full 124×2 lint and all-browser CI anew; no claim of PASS until reported.

## 2026-11-05 · P1 measured gain + Firefox navigation failure / P2 repair

- Paint-prioritized boot candidate `ac695bcf` [Lighthouse x10 #42117102911](https://github.com/markofornoliak/tykora/actions/runs/42117102911): matched runner **LCP median 917.3164ms** (range 904.2743–955.3455), while same-runner main 1954.7715ms and iter5 1953.8973ms; CLS 0 and Performance 99 on candidate. This satisfies LCP ≤1s in that simulated scenario only.
- **Not accepted**: TBT median regressed 26→118ms (fails ≤100ms). Gzip static entry 1322 bytes excludes the dynamically imported app bootstrap, so **do not claim 90k/105k JS budget passed**; full interactive startup JS still needs a browser request accounting. In the same SHA, [quality #42117102809](https://github.com/markofornoliak/tykora/actions/runs/42117102809) FAILED at Firefox `mobile all nine destinations` (click Class did not change URL within 5 seconds); independent PR quality run still pending at this checkpoint.
- Hypothesis P2: click occurs in the narrow HTML-to-hydration window; React may suppress or replay its navigation event. Candidate fix attaches one temporary capture listener to real `#/` links while unmounted; it synchronously sets the exact user-chosen hash, invokes the normal mount and removes itself after mount. It does **not** fake navigation in tests or disable any check. Await cross-browser CI before considering acceptance.
