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

## 2026-11-05 · D1 verified full course + honest JS budget clarification

- [Full 124-lesson audit #42118759970](https://github.com/markofornoliak/tykora/actions/runs/42118759970) for PR candidate `928f621bc8e7b8205a82c7eaf490616fc3e6caee`: **248 pairs, 0 contentLint issues**, 0 duplication, 0 missing target glyphs, worst four-gram overlap **0.05960265**, <0.10. This confirms the measurable overlap/coverage contract (not editorial or pedagogical excellence). Legacy review IDs for prior sessions remain score-compatible. Full cross-browser quality on candidate still pending.
- **Budget semantics clarified**: split Home module bootstrap lowered static eager graph to about 1.3kB, but full React/i18n/bootstrap still loads on initial Home. Extended Phase0 script to compute `initialInteractiveJsGzipBytes` including dynamically imported bootstrap and its static closure, as well as browser-observed JS transfer. Static-only count alone is explicitly **not an initial interactive load success**. Source budgets unchanged; no reduced test scenario.

## 2026-11-05 · Track G: naming due diligence completed to preliminary evidence level

- Exact-name collision VERIFIED through public JXLabs recruitment and project listings: TYKORA DeFi prize vault on Rootstock, distinct from this typing product. Historical Canadian Class 5 application abandoned; Swiss secondary record deleted. `tykora.com` DNS record observed, registrar ownership and actual availability unverified.
- Added `docs/NAMING.md` with primary citations, conflicting names, unknown social/domain statuses, three alternate name hypotheses and explicit owner-only decision gate. **No rename, purchases, contact, trademark clearance claim, or product configuration changes.**

## 2026-11-05 · P3: deep-link inert static Home exposed a false control

- [Quality #42118769444](https://github.com/markofornoliak/tykora/actions/runs/42118769444) at `928f621b` FAILED Chromium `e2e/iter5-english.spec.ts`: `/#/themes` displayed selectable `#ui-locale` from *prerendered Home* before the asynchronous router chunk mounted. The test selected English, but that inert control was destroyed; final document language stayed Russian. This is a real UX bug, not a flaky test to ignore.
- Root cause of P3: the refactored entry left unrelated Home DOM visible on deep links during JS import, whereas original code cleared immediately.
- Minimal correction: `root.replaceChildren()` synchronously on every non-Home initial route before `bootstrap()`. The Home optimization remains untouched; deep links now have no wrong-route interactive HTML during load. Rerun all browsers and expected navigation behavior; no test weakening or static content hiding on Home.

## 2026-11-05 · P3 regression coverage: real-module delayed navigation

- New `e2e/iter6-bootstrap.spec.ts` holds the **real** hashed `bootstrap-*.js` request (no mocked app) to deterministically reproduce slow hydration on Chromium, Firefox, WebKit. Two scenarios: Home nav remains operable and reaches Classroom while chunk is withheld; direct `/#/themes` must never expose inert Home locale control before chunk completes, then actual language selection reaches English.
- Explicitly release network request in a `finally` to avoid tainting following tests. This adds tests and does not lower existing assertions or snapshots. CI **pending**.

## 2026-11-05 · Track G: published/draft documentation reconciliation

- README now explicitly distinguishes published main Beta v0.9.0 from unreleased iter5/iter6, adds main CI/License/DRAFT badges, links measured baseline and naming dossier, and avoids misrepresenting the candidate's eager-only JS gzip.
- `docs/ROADMAP.md` appended iteration 6 verified and unverified status, no existing failed objectives relabeled as passed.
- `docs/RELEASE.md` removes the obsolete statement that no lockfile or production release exists; current merge/deploy restrictions remain explicit.
- `docs/GITHUB-ABOUT.md` supplies owner-review description and topics but **does not claim** GitHub About was edited; GitHub integration lacks that metadata-write action. Real light/dark screenshots and GIF are missing and not invented.

## 2026-11-05 · P4: isolated Preact/compat runtime size experiment

- Earlier [Actions #42119203944](https://github.com/markofornoliak/tykora/actions/runs/42119203944), single-runner N=10 at `1c97ec25`: main LCP 1954.86ms, iter5 1955.63ms, iter6 LCP **946.17ms**, TBT **85ms**, CLS 0, Performance **99**. Full interactive bootstrap **152509 gzip bytes** vs iter5 **151870**. This passes simulated LCP and TBT, **FAILS JS ≤90k/105k and Performance 100**; P1 is not fully accepted. Only static eager graph 1468 bytes; explicitly NOT reported as interactive JS total.
- Hypothesis P4: ReactDOM and router/runtime account for much of the 152.5k gzip startup cost; `preact/compat` might reduce startup payload and main-thread long tasks. Preact is NOT automatically equivalent; React hydration, contexts, accessibility, events, router, Dexie and PWA all must behave identically.
- Experiment: opt-in `TYKORA_PREACT_EXPERIMENT=1` Vite alias; isolated CI `npm install --no-save --no-package-lock preact@10.27.0`, same-runner production React vs Preact builds **Lighthouse x10 each**; full Chromium/Firefox/WebKit E2E and production offline check on Preact; artifacts contain per-chunk startup budget and raw reports.
- There is **no** Preact dependency in `package.json` or published build; environment flag is off by default. Adopt only if performance gain is statistically meaningful and all gates pass, else discard/disable experiment. CI **pending**.

## 2026-11-05 · Correct delayed-bootstrap browser assertion (not lowered)

- [Quality runs #42119991377 / #42119984730](https://github.com/markofornoliak/tykora/actions/runs/42119991377) failed in all 3 browsers only at the NEW test `iter6-bootstrap.spec.ts`: it expected a Classroom heading named “Класс” / “Classroom”, but actual full page title is “Обучение без аккаунтов.” / “Learning without accounts.” (verified in source). The prior assertion of exact hash route `/#/classroom` passed; no evidence of a navigation failure at this step.
- Keep the forced real-module stall, navigation and hash assertions untouched; replace wrong heading expectation with the actual semantic h1 localized title and repeat cross-browser tests. No product runtime code changed in this experiment.

## 2026-11-05 · Preact laboratory build repair after initial red CI

- [Preact laboratory #42120761407](https://github.com/markofornoliak/tykora/actions/runs/42120761407) reached the experimental Preact build but Rollup rejected `src/app/App.tsx` import `Profiler` because `preact/compat` does not export it. This is genuine incompatibility (not a React product regression). Baseline React build/unit gate passed before that step.
- For opt-in lab **only**, new `scripts/iter6-preact-compat.mjs` forwards the real Preact compat API and supplies a transparent Profiler pass-through component; the recorded practice profiling counters are **not comparable** under this shim. This is acceptable only for *non-profiler* comparison of visual and functional behavior, never to claim Profiler correctness. Production still imports React. Run all 3 browser tests, if functional mismatch found reject rather than silence.

## 2026-11-05 · Track F: independent npm audit and SBOM workflow

- Added `.github/workflows/iter6-supply-chain.yml`, triggered only by its own workflow or lockfile changes (never by production deploy). Builds an inspectable CycloneDX SBOM using locked `npm ci` dependency tree, runs native `npm audit --json` **without exceptions, `--force`, or suppression**, prints severity and uploads raw JSON even when audit fails.
- Missing/invalid report fails. Vulnerabilities if any remain BLOCKER until resolved by narrow package updates and full regression checks; no unsupported "audit clean" claim at writing. No artifact published as a software release.

## 2026-11-05 · F: privacy and terms documentation + real network requests test

- Replaced stale v0.8-style privacy text with current human-readable Beta v0.9 local IndexedDB/backup disclosure, hosting caveat, optional manual WebRTC STUN/IP caveat and data deletion options. Added `docs/TERMS.md` (MIT license, no certificates, no cloud backup, prototype behavior) and README link, without asserting legal advice or unattested external-host guarantees.
- Added `e2e/iter6-network.spec.ts`: observe actual browser request events on real Home, Practice and Profile first loads across Chromium, Firefox, WebKit, including startup/idle; assert every HTTP(S) URL same-origin and zero external requests absent consent, without interception/mocks. No claimed PASS until CI returns.

## 2026-11-05 · F: 15 advisory findings and isolated dependency remediation trial

- Supply chain [#42121416715](https://github.com/markofornoliak/tykora/actions/runs/42121416715) generated a valid **CycloneDX 1.5 SBOM with 542 components**; `npm audit` failed with **15 findings: 2 critical, 11 moderate, 2 low** (0 high). Critical chains are `vitest -> tinypool` (remote code execution via prototype pollution) and `vitest/@vitest/mocker`. Other affected tree includes `typescript-eslint`, `vite-plugin-pwa/workbox-build`, `minimatch`, `glob`, `deepmerge`.
- This is a **release blocker**, although most packages are dev dependencies. No false `audit clean` claim or unsafe `--force` fix. Original SBOM and audit JSON kept in workflow artifact.
- Added isolated `iter6-dependency-trial.yml` to run `npm install --save-dev --save-exact vitest@5.1.0` then `npm audit fix` without `--force` in disposable runner; upload candidate lockfile and residual advisories, run complete source checks and Chromium/Firefox/WebKit E2E. It does NOT push changes into any branch or production. Decide what to keep after inspecting exact package-lock diff and evidence. Current run pending.

## 2026-11-05 · Quantile calculator bug fixed, raw measurements untouched

- The first Phase0 script incorrectly implemented `p50` as nearest-rank fifth sample for even N=10. User requires honest median, so corrected to linear interpolation (average fifth/sixth) with unchanged N and strict configurations; source JSON is unaltered. This is a documented calculation repair, **not** threshold weakening.
- Corrected matched [#42119203944](https://github.com/markofornoliak/tykora/actions/runs/42119203944): main LCP 1955.0003ms, iter5 1956.1089ms, iter6 **946.2403ms**; TBT **88.5ms**, Perf median 99.5 (99 and 100 in 10 runs), full JS **152509 gzip**. Previous five-value nearest-rank numbers left in historical ledger and superseded by this section; next workflow uses corrected method.

## 2026-11-05 · Failing occasional Firefox native anchor navigation: fix true hydration commit race

- [Quality #42121655509](https://github.com/markofornoliak/tykora/actions/runs/42121655509) at `0762caa9` reported only a Firefox mobile nav failure where a bottom-nav Classroom link left the URL `/`. This is intermittent and must not be mislabeled successful based on another run.
- Root cause hypothesis: `ReactDOM.hydrateRoot()` **returns before hydration commits**, yet `src/main.tsx` had immediately marked `mounted=true` and removed the temporary capture listener. A click in that transition could be swallowed by React event replay or race with dead prerender links.
- Small repair: retain real native hash delegation until `App`'s first `useEffect` after its React commit dispatches `tykora:hydrated`; only then remove listener. No test change. StrictMode effect repeats harmlessly due once listener. Must prove on repeated cross-browser CI; candidate until green.

## 2026-11-05 · Preact A/B measured; input follow-up (not yet product switch)

- [Matched A/B #42121326171](https://github.com/markofornoliak/tykora/actions/runs/42121326171) at `5efd128849bc8310c8bb9ffd4295e9208274fc89`, same ubuntu-24.04 runner, Lighthouse 12.8.2 N=10 each: full interactive startup JS gzip React **152520 bytes**, opt-in Preact **92486 bytes**, difference **−60034 bytes (−39.36%)**. React LCP nearest-rank 903.81ms, TBT6ms, Perf100; Preact 903.63ms, TBT36ms, Perf100. Both have first load LCP target ≤1000 in this experiment. The initial interactive JS under Preact meets ≤105000 budget but is **2486 bytes over 90000**. Independent opt-in Preact **153 cross-browser E2E passed** (Chromium/Firefox/WebKit), **9 offline production PWA tests passed**. Profiler pass-through is not a valid React Profiler substitute, and hardware input correctness still unproven. The default runtime remains React.
- Before deciding adoption, new `iter6-input-ab.yml` runs the same unmodified 500-input trace benchmark two five-trial passes for React and Preact (10 trials per CPU×1 / CPU×4 each). CDP Event Timing, one- and two-rAF bounds plus compressed trace artifacts are retained; **do not** claim exact input-to-presentation pairing from these estimates. CI **pending**.

## 2026-11-05 · Guarded branch-only adoption of verified critical fixes

- [Temporary trial #42121924524](https://github.com/markofornoliak/tykora/actions/runs/42121924524) SUCCESS after exact Vitest 5.1.0 plus compatible `npm audit fix`; **0 critical, 0 high, 9 moderate, 2 low** (11 total), full `check:domain`, `check`, `lint`, `test`, `build`, `check:dist` and 162 cross-browser E2E passed. The remaining 11 findings must not be labelled clean; audit JSON and generated package files in artifact.
- New narrow `iter6-apply-critical.yml`: re-run the *same* upgrades and all normal tests including production offline PWA, require no critical/high vulnerabilities, freeze exact package pair and SHA256 checksums in a **read-only** test job; only then a separate write-permitted job guarded on `feature/iter6-summit` + exact unchanged HEAD commits **only package.json and package-lock.json** to the feature branch. If HEAD moved, abort safely; no force push, main merge, release, or deployment. This does not allow a write token during `npm ci` or test execution. Workflow pending.

## 2026-11-05 · Safe CI branch-update control failed before write, corrected

- [Guarded fix run #42123116752](https://github.com/markofornoliak/tykora/actions/runs/42123116752): **verify-remediation SUCCESS**, including cross-browser and offline PWA, but the separate write-only job FAILED before any commit because SHA256SUMS contains paths starting `verified-lock/` and the script also `cd` into that folder, causing doubled path. Exact HEAD check passed. **No package update applied**; no security regression masked.
- Minimal repair: run `sha256sum -c verified-lock/SHA256SUMS.txt` from checkout root with unchanged expected checksums. Re-run the complete job; only after all checks and SHA equality can it push one package-pair commit. No relaxation.

## 2026-11-05 · Iter6 deep-link skip-link focus race — targeted repair

- A reported Chromium E2E run: 146 passed / 1 failed / 30 skipped at `e2e/a11y-i18n.spec.ts:19`, initial `/#/academy`: after one Tab, the skip-link was not focused. Green results in other runs do not erase this failure.
- Source-based hypothesis: `index.html` serves static Home HTML on every hash route; if user focus moves into its skip-link while entry JS is pending, `src/main.tsx` destroys that node for non-Home deep-links. The link is visible but transient, allowing an intermittent focus loss.
- Runtime repair: small **unconditional** parser-time inline hash guard flags non-Home routes, and critical CSS hides `#root[data-tykora-home-prerender="1"]` only for those routes; `src/main.tsx` removes its marker after clearing the wrong-route DOM. Home first paint and all scoring/content paths unchanged. No user-agent, Lighthouse or CI bypass. An eventual strict CSP must hash/nonce this inline guard as well as existing critical CSS.
- New `e2e/iter6-deeplink-focus.spec.ts`: deliberately stall the real production entry JS on Academy and Themes across all three Playwright projects. Verify stale Home is absent from accessibility tree; after release, actual skip-link receives first Tab, Enter focuses main, and hash remains correct. Original skip-link E2E remains unchanged.
- Evidence: **pending CI** for `check`, `lint`, `test`, `build`, `check:dist`, full Playwright and Lighthouse ×10. No assertion of PASS before completed runs.

## 2026-11-05 · Isolated focus stress-gate (supplement to full matrix)

- Full quality CI for `d5bd96ca` was still installing all three browsers; added an **independent supplemental** workflow with normal `check` / `lint` / `test` / `build` / `check:dist` followed by real production Playwright Chromium, `--repeat-each=5`, `--workers=1`. Runs *both* the original accessibility suite and the new blocked-entry regression without changing assertions. Any failure fails the job.
- This stress gate does **not** replace `checks.yml` or its Chromium/Firefox/WebKit full E2E, and says nothing about real-device VoiceOver/NVDA.
- Status at workflow authoring: **not measured**; require a finished run link and successful 5× repetitions before claiming the race repaired.

## 2026-11-05 · Proof of deep-link keyboard repair + full matched mobile measurements

- Candidate app SHA `d5bd96ca5611d73c70298eda7c7fd369b8ff1315`: [Quality gates #42125551475](https://github.com/markofornoliak/tykora/actions/runs/42125551475) **SUCCESS**: 168 passed / 30 skipped out of 198 cross-browser E2E, 9/9 production PWA tests passed; all prior `check` / `lint` / `test` / `build` / `check:dist` steps passed. The 30 skips are existing matrix exclusions, not introduced by this fix.
- Additional workflow-only SHA `19a2ad7c0cdd35cb67169c6cfe18a56eaf008f8a`: [focus stress #42126592040](https://github.com/markofornoliak/tykora/actions/runs/42126592040) **SUCCESS**, 45/45 Chromium tests: 9 targeted specs × `--repeat-each=5`, one worker, including the original skip-link test and two intentionally stalled real JS deep-link tests. This validates the specified regression repeatedly in Chromium; separate real NVDA/VoiceOver/hardware checks remain unperformed.
- [Three-way mobile Lighthouse #42125543917](https://github.com/markofornoliak/tykora/actions/runs/42125543917) **SUCCESS**, N=10 each on the same ubuntu-24.04 runner / Lighthouse 12.8.2 mobile 412×823 / CPU×4 / RTT 150ms: `main` LCP median **1955.3563 ms**, `iter5` **1955.27845 ms**, `iter6@d5bd96ca` **908.2175 ms** (range 905.1901–957.9961ms). All three CLS median 0. `iter6` median TBT **110.5ms**, Performance **99**, interactive startup JS **152568 bytes gzip** (the tiny eager entry of 1511 bytes MUST NOT be mistaken for complete interactive JS). **LCP simulated PASS** ≤1000; **TBT FAIL** ≤100; **Perf FAIL** 100; **JS FAIL** 90000 and 105000. No physical-device claim, no causal claim that the guard itself accelerated LCP.
- All raw LHR JSON and chunk map retained in the Lighthouse run artifact. The incremental post-guard CSS/script was not evaluated as a separate 10× paired microbenchmark; only the full candidate in its three-way run was assessed.

## 2026-11-06 · Candidate: stable native skip-link and main landmark

- Structural refactor candidate: outer HTML owns the focusable skip-link and `<main id="main-content">` as persistent nodes outside both React roots. Home remains real server-shipped markup inside a nested main content root and hydrates with React; navigation gets a separate hydration root. Main content route updates cannot replace the native main landmark or skip anchor.
- The head script synchronously hides the Home shell for non-Home hash routes, including navigation during bootstrap; the app is unhidden after both main and chrome React roots commit. Pre-hydration skip-link activation focuses the native main with unchanged URL hash. Explicit `/home` alias added.
- Candidate requires normal TypeScript/lint/unit/build/dist and 3-browser E2E + repeated focus; follow with matched Lighthouse ×10. **Pending measurements; not accepted**.

## 2026-11-06 · Source gate repair without weakening

- Initial structural candidate CI #42222639702 failed in `check:quality` because `scripts/verify-quality.cjs` asserted skip-link `e.preventDefault()` and `links.map` text must appear in `src/shared/ui/Layout.tsx`. Those features moved to permanent native markup/head listener and `src/shared/ui/Chrome.tsx` respectively.
- Replaced positional source assertion with stronger checks for actual native DOM ordering, route guard, click focus handler, separate `hydrateRoot` calls and live Chrome navigation; unchanged 4.5:1 contrast and other assertions. Explicitly documented rationale in ADR-029; E2E and Lighthouse still must pass. This is not a test exemption.

## 2026-11-06 · Requested five direct-route focus stress candidate

- Added `e2e/iter6-native-focus.spec.ts`: `/home`, `/academy`, `/practice`, `/analytics`, `/profile`, each initial URL `/#/...` with **real** bootstrap JS deliberately blocked, Home initially visible only for `/home`, stable native main/skip object identity, first Tab and Enter semantics and unchanged hash. Uses genuine application modules after release, never mocks React or score.
- Updated dedicated stress workflow to run **5 repeats in Chromium, Firefox, WebKit** of the five-route suite plus original skip-link test, retaining all standard CI and quality gates. Original source tests and thresholds unchanged. Target 90 tests; number observed and success must be confirmed by CI, not presumed.

## 2026-11-06 · Red stress 89/90, repair native main focus during bootstrap

- [All-browser x5 #42223072837](https://github.com/markofornoliak/tykora/actions/runs/42223072837) had 89/90 passing; the single failure was Chromium original `a11y-i18n.spec.ts` at Academy: skip received first Tab, but Enter did not focus `<main>` before route hydration finished. A hidden *ancestor* `.app` was making the native main unfocusable during the pre-hydration window.
- Narrow behavior correction: keep the permanent native `.app` and `<main>` visible/focusable; apply the hash-route guard only to `#root` and `#chrome-root` stale Home content. No Home skeleton is exposed, but the native main landmark can now receive focus immediately before JS. E2E source gate now verifies that both replaceable roots are hidden; it no longer hides the stable accessibility target. Original failing test is untouched; 90-case rerun mandatory. No thresholds weakened.

## 2026-11-06 · Full E2E detected independent HashRouter split; fix navigation

- At [quality #42223695511](https://github.com/markofornoliak/tykora/actions/runs/42223695511) candidate `effe80d8`, 183 passed, 30 expected skip and **3 failures**, exactly one per Chromium/Firefox/WebKit in **unchanged** `e2e/navigation.spec.ts` Home→Practice. Five-route 3-browser x5 native focus stress [#42223695365](https://github.com/markofornoliak/tykora/actions/runs/42223695365) passed 90/90 at the same application SHA: skip/main stabilization was valid, but normal navigation was not.
- Root cause: two independent `<HashRouter>` instances in main and chrome. Chrome `NavLink` navigation can mutate history via `pushState` without a native `hashchange`, leaving the main router at stale Home.
- Minimal structural fix: keep **one** HashRouter for main application; Chrome uses real hash `<a>` anchors (real `hashchange` reaches main); when a main-app React Router `Link` navigates, App emits `tykora:route-changed` to refresh Chrome active state. This retains native link semantics, keyboard access, modified clicks, deep-link persistence, and a single real route authority. Stronger source invariant now checks native links and event bridge rather than the old NavLink string. Unchanged navigation E2E must pass all 3 engines; no acceptance claim until CI.

## 2026-11-06 · Verified authentic LCP, 30 skip census, paired input and GC memory

- #42221093767: N10 median `d5bd96ca` Home LCP H1 selector `main#main-content > section > header.pagehead > h1` genuine content, filmstrip source frames 750/1125ms nearest 908.2511ms; raw 4-stage text breakdown and simulation mismatch documented in `docs/LCP-ITER6-AUTHENTICITY.md`; cross-browser identity test quality PASS #42221669820.
- Default 30 E2E skips separately enumerated in `docs/ITER6-SKIPPED-E2E.md`; 27 full-palette matrix-only (9 routes × 3 projects), three visual-capture-only. Chromium dedicated 648-cell axe and 36 captures SUCCESS #42222639681; no cross-engine 24-theme golden claim.
- Structural native main/skip separate roots: focus stress 90/90 SUCCESS #42223695365 at `effe80d8`, but normal Home→Practice navigation E2E FAILED 3 browsers; ADR-030 corrected to one main HashRouter and native Chrome hash links. Current source `9dedc20b` **two full quality runs SUCCESS** #42224715967 and #42224724114 (186 pass / 30 intentional skips, production PWA9 pass); repeat focus for that source has been requested via workflow paths.
- Input #42224396853 N10 CPU1 + N10 CPU4 all exact 500/500 accepted; rAF proxy and Event Timing p50/p95 summarized in `docs/ITER6-INPUT-MEMORY.md`. No physical presentation certification. Memory #42224715840 at `9dedc20b`: 5 identical sessions, heap slope +197,841.6B/session, 516 DOM, 332 listeners and detached0 stable; leak absence unproven. All raw artifacts held in CI.
- Deep-route matched 150-Lighthouse workflow currently pending completion; no deep-route metrics invented.

## 2026-11-06 · Preact A/B x10 and complete JS map — accepted evidence, production switch rejected

- [Sourcemap #42227143157](https://github.com/markofornoliak/tykora/actions/runs/42227143157): exact 19 emitted JS files, bootstrap 151,361 gzip bytes, 52 source-map modules dominated by react-dom/react-router/dexie; all source byte counts classified as attribution only, never per-package gzip contributions. `docs/ITER6-JS-LEDGER.md` retains whole table and source SHA.
- [Same-runner A/B #42226025567](https://github.com/markofornoliak/tykora/actions/runs/42226025567), N10 React vs Preact: full startup gzip 152,969→92,899B (−39.27%) but TBT 84.25→99.5ms, Perf100→99. Opt-in Preact E2E186 pass, PWA9 pass, but its Profiler shim provides no meaningful callback timings. **Reject production switch** at this step; React remains default. ADR-031 recorded. No test weakening, no install in package.json, no production deploy.


## 2026-11-06 · Cross-source route comparison audit / URL parity experiment

- Independently downloaded the full successful [matched parallel 150-run workflow #42226462615](https://github.com/markofornoliak/tykora/actions/runs/42226462615), app SHA `f655e8628eeac5e7f26a5a21efe46258d3597fb8`. Each route has its own Ubuntu runner; within each route all three source variants are sequential and comparable (N=10 per variant). Its Home `/#/` iter6 LCP median **1954.466ms**, unlike old `/` at candidate `d5bd96ca` **908.2175ms**. Different URL **and** source SHA: not a valid causal before/after. Deep-route median CLS **0.03776** at all three variants, so **CLS=0 is not yet achieved on deep links**.
- Its `requestedJsGzip` of 125B or 1415B for deferred-bootstrap variants is a truncated request-window metric, **not full interactive JS**. Never use these numbers to assert 105KB/90KB JS goals. The separate bundle ledger identifies ~152–153KB gzip for React Home bootstrap, source-specific.
- New same-runner, same-SHA `iter6-url-parity.yml` explicitly compares `/`, `/#/`, `/#/home`, 10 independent Lighthouse 12.8.2 runs each, raw reports and original filmstrip frames, extracting authentic LCP H1 and all four stages. No results claimed until successful workflow; this tests whether the URL is a material confounder.
- The 30 E2E skip ledger was independently checked and renumbered 1–30; no source tests were skipped or modified. Firefox/WebKit full palette matrix remains an evidence gap, distinct from the 90/90 stress focus success [#42225392245](https://github.com/markofornoliak/tykora/actions/runs/42225392245).


## 2026-11-06 · P: one-variable Dexie eager-import candidate (CI-only)

- Source-map and import-graph evidence shows bootstrap still holds React DOM, React Router, Dexie and i18n. First proposal is isolated exactly one source edge: `src/app/store/uiStore.ts` imports the repository facade lazily on actual settings load/save, **without changing persisted storage contracts, values, scoring or eager Home HTML**.
- This is intentionally **not** applied to the feature-branch application yet. A disposable CI-only baseline and disposable patched checkout both use the same source SHA and one GitHub runner. All standard `check`, `lint`, `test`, `build`, `check:dist`, three-browser E2E and production PWA must pass for both. Only then Lighthouse 12.8.2 N10 on each of `/` and `/#/` for both builds, same mobile settings.
- Regression history: iteration5's earlier storage-import deferral cost ~320ms LCP, so the current experiment is high risk and cannot be accepted before measured comparisons. Failure means **reject the candidate, no branch runtime code touched**. `iter6-dexie-lazy-lab.yml` has read-only permissions and no push, merge, tags or deploy.
- Authored workflow ≠ measured improvement; **pending** CI.


## 2026-11-06 · First requested-route JS census red: harness install bug, not app failure

- [CI #42229737970](https://github.com/markofornoliak/tykora/actions/runs/42229737970) built and validated immutable main successfully, then failed before any browser size observation because `scripts/iter6-route-js-budget.mjs` imports `@playwright/test` from the repository root, but only the separate source checkout had its dependencies installed. Error: `ERR_MODULE_NOT_FOUND: Cannot find package '@playwright/test'`.
- Corrected harness preflight with **root `npm ci --no-audit --no-fund` before browser install**, without touching product source/test thresholds. Prior failed run remains invalid for JS metrics; require all 75 fresh contexts and artifacts before claiming per-route initial JS numbers.

## 2026-11-06 · Same-source Home URL parity SUCCESS (30 raw Lighthouse trials)

- [URL-parity CI #42229177523](https://github.com/markofornoliak/tykora/actions/runs/42229177523) **SUCCESS**, immutable SHA `61a2743222f1f2958da34857dceefff817753d0e`; one Ubuntu runner, Lighthouse 12.8.2 mobile 412×823, CPU×4, RTT150, ten independent runs each on `/`, `/#/`, `/#/home`. All 30 runs identify real Home H1 and CLS=0.
- `/`: LCP **938.8115 ms** median (range **904.6234–1954.35075**), TBT **46.25 ms** median (range **37.5–2362**), one severe anomalous trial (#1); `/#/`: LCP **938.4724 ms** (902.7449–954.071), TBT **45 ms** (37–57); `/#/home`: LCP **905.88075 ms** (902.3316–948.6308), TBT **46.5 ms** (37–49). Each uses the same genuine H1 and full Home static content.
- H1 is not replaced by lightweight placeholder. Four **simulated** LCP stages on representative `/#/` trial #9: TTFB **451.4029**, load delay 0, load duration 0, render delay **486.4029ms**; sum 937.8058ms. Raw trace phases **3.224** / **87.874ms** are different clocks and are not added to simulated LCP.
- Full Home startup JS gzip `bootstrap-1XejNZPU.js` + `index-BU0dNfE0.js` + `registerSW.js`: **152,969 bytes**. JS budget <=105kB / <=90kB remains FAIL. The earlier 1954ms `/#/` median at a *different* runner and SHA cannot be attributed to the hash route alone.
- Do **not** delete the severe `/` outlier. Inspecting raw trial #1 showed huge main-thread work, including Lighthouse long tasks attributed to bootstrap **1079ms, 408ms** and `registerSW.js` **506ms**. A median under 50ms does not demonstrate tail latency stability; CPU/task-tail investigation remains OPEN. Source LHR artifacts include original filmstrip JPEGs for each near-median trial.


## 2026-11-06 · Two isolated harness failures; no product regression verdict

- [Requested JS #42230199152](https://github.com/markofornoliak/tykora/actions/runs/42230199152) correctly measured 5/5 stable main visits on every route (Home 150491B, Academy 160570B, Practice 171992B, Analytics 152440B, Profile 157156B), but failed at **iter5** with `Requested JS missing from built dist: assets/index-D4EEebeH.js` because a prior `npm run preview` child remained bound to port 4174 after killing npm's parent. This is contaminated workload and **must be rejected** for iter5/iter6. Replaced with direct executable `./node_modules/.bin/vite preview`, explicit wait for port release, and continued strict asset-filename verification. No app source modified or thresholds relaxed.
- [Dexie lazy lab #42230030158](https://github.com/markofornoliak/tykora/actions/runs/42230030158) failed even the baseline E2E because the root Playwright CLI browser install resolved a different version than the immutable source lockfile: WebKit executable missing at `~/.cache/ms-playwright/webkit-2370/pw_run.sh`. This is **not evidence against lazy Dexie**; the variant was never measured. Now root `npm ci` runs before `npx playwright install --with-deps`, and both trial variants use exact same lockfile and direct preview child teardown. Full three-browser E2E still mandatory, no retry with browser exclusions.

## 2026-11-06 · Verified full JS requested census; visual golden five failures retained

- [CI #42230674960](https://github.com/markofornoliak/tykora/actions/runs/42230674960) **SUCCESS**, all 75 actual page contexts, N=5 each of 15 branch-route cells. Full gzip-request sets: Home main/iter5/iter6 150491/151870/152969B; Academy 160570/163000/166255B; Practice 171992/175672/178930B; Analytics 152440/155552/156672B; Profile 157156/159911/161030B. All five trials of each cell matched exact files and bytes, no external requests; SHA main `0a7d167b`, iter5 `244c5060`, iter6 `5777982e`. Bootstrap explicitly included. JS ≤105000 and ≤90000 fail. Exact table appended to `docs/ITER6-REPORT-STEPS1-3.md` and updated baseline. This requested-file measure is not future-click code or HTTP transfer metrics.
- Original [36-screen pinned pixel diff #42227299262](https://github.com/markofornoliak/tykora/actions/runs/42227299262) **FAILED 5/36**, unmodified 1.5% threshold. Two Contrast Dark desktop ratios 1.5940% and 1.5389%; three Daylight Practice screens got real image-height mismatches (900px vs historic1430,1356,2045). Diff masks inspected; no golden update. Failure details in `docs/ITER6-VISUAL-FAILURES.md`.
- Experiment `d1f95ef9759e63d709a33a1c055b80f11f39b31b`: screenshot capture now waits for actual route-specific content (`#practice-mode`, Home H1, `.themes-grid`, Results H1) rather than any possibly stale h1. Existing 36-state screenshot set and threshold unchanged. [New pixel CI #42231771095](https://github.com/markofornoliak/tykora/actions/runs/42231771095) pending; until verified status **NOT ACCEPTED**. If it still fails, do not rebaseline; investigate actual layout.
- CI-only lazy Dexie import [#42230674069](https://github.com/markofornoliak/tykora/actions/runs/42230674069) was still running at this entry. No product runtime modified or speculative byte/TBT savings claimed.
- Updated README to link precise measured LCP, JS, visual failure and 90/90 focus results; no production or release change.
