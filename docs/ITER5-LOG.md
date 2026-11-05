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

## 2026-11-05 · Browser diagnosis and mobile Lighthouse

- Standard production CPU×4 diagnostic run #42019977034 at `75663d24`: input JS handler p95 ≈0.8ms; paint JS p95 ≈0.5ms; Event Timing p95 24ms from 285 thresholded samples. Profiling p95 32ms (not comparable with ordinary build), 5 commits. 500/500 input, CLS 0.
- Mobile Lighthouse ×5 run #42019720034 at `38c25928`: LCP trials 1827.67/1956.52/1954.20/1957.90/1954.24ms; **median 1954.24ms** (objective ≤1000ms FAILED); median performance score 98, CLS 0.
- Build entry chunk 150.37 kB gzip; this is not a fully modelled initial-network JS budget.
- 10-minute memory profile, hardware IME, physical mobile Lighthouse and manually verified WCAG are **not performed**. Phases B–G remain unstarted because A is not accepted.

## 2026-11-05 · A2 one-block trace evidence gate

- Added Chrome CDP Tracing experiment (3 runs CPU×1 and 3 runs CPU×4) with event-part breakdown, next-rAF and double-rAF probes, task aggregate and one-variable CSS candidates. These are workflow *definitions* until run log exists.
- Added dedicated ten-minute memory exercise with CDP JS heap snapshots before/after forced GC and DOM node counts. Requires full ten-minute workflow completion, not inferred from source.
- Intentionally do not call an Event Timing sub-16ms result precise input-to-presentation; PerformanceObserver is thresholded.

## 2026-11-05 · A2 Home cold-start candidate

- Reconciled ROADMAP's outdated v0.8.0 vs v0.9.0 statement against `main@0a7d167`.
- Added static HTML first-paint skeleton and local critical CSS. Did not add network font preload: repository has **no** packaged .woff/.woff2 subset assets; no external font requests permitted.
- Converted Home progress and UiStore settings persistence to post-render dynamic import; no score worker was on the Home critical route.
- Updated p95 budgets to CPU×1 ≤16ms, CPU×4 ≤32ms, LCP first ≤1.2s then ≤1.0s, with explicit simulation caveats. Acceptance pending new CI and five-run Lighthouse source SHA.

## 2026-11-05 · B: semantic tokens and contrast

- Calculated pre-change palette border role <3:1 against surface on 24/24 defaults.
- Introduced semantic token CSS/TypeScript, deterministic role contrast resolver, 24×15 Vitest pair matrix and numeric audit document; added target typography / error underline / coarse touch / forced-colors / focus rules.
- This is not a complete component-state review, visual baseline, or manual WCAG 2.2 AA pass. Await CI.

## 2026-11-05 · C: a11y automation / manual evidence ledger

- Added keyboard, forced-colors and theme-selection Playwright smoke tests; full 9 routes ×24 themes ×3 viewports axe Chromium matrix as a dedicated CI job, leaving default 3-browser audit intact.
- Added visual capture job for 36 Chromium snapshots across 3 palettes and 3 widths; no image-golden acceptance claimed.
- Manual VoiceOver, NVDA, actual zoom, IME/dead-key/AltGr, physical mobile and touch are NOT conducted.

## 2026-11-05 · A2 evaluated before progressing to B/C

- CDP trace x6 at SHA 43045e5b, job #42022735338: CPU×1 observed p95 24ms (FAIL 16ms); CPU×4 observed p95 32ms (boundary); presentation delay dominates measured components.
- 10-minute heap #42022735338: +1,107,904 bytes after forced GC, 514→516 DOM nodes; no zero-growth claim.
- Static HTML startup shell was reverted at SHA a963528d after mobile LCP regression; dynamic Dexie import remained, but five-run LCP still ~2272.7ms, above earlier 1954ms.
- CI token role audit 24×15 passed at 94dd8e8f; report docs/THEME-CONTRAST.md.

## 2026-11-05 · B results usability pass

- Added offline PNG result card based exclusively on locally stored metrics, personal average only for historical sessions with matching scoringVersion+locale+layout, and top-five observed weak n-grams.
- Does not fabricate second-by-second charts: existing session records do not persist a temporal series. Added Playwright browser download regression; pending CI proof.

## 2026-11-05 · C full-matrix red → targeted repair

- Full Chromium 9-route ×24-palette ×3-width axe CI #42024285880 failed at Nightfall /themes / 320px, `color-contrast` on `.btn`. Other route tests completed without reported violations.
- Browser computed style during theme selection had background `rgb(39,109,93)` but resolved final accent `#9bdbc3`; 150ms `background` transition created a temporary text/background mismatch. Replaced `.btn` transition with transform-only; re-run required.
- WebKit first-Tab skip-link expectation failed in E2E; fallback uses explicit link focus followed by keyboard Enter. This does NOT verify link discovery via first Tab in WebKit; manual check remains open.

## 2026-11-05 · D versioned holdout content

- First three course lesson practice/review variants receive original, character-focused disjoint review text. **Existing practice IDs and legacy -review expected lengths remain compatible**; new built-in review prompts use -review-v2 IDs. Prior personal sessions are never rewritten.
- Added strict four-gram intersection limit 10% plus focus glyph coverage/length/forbidden character checks and migration regression. CI needs to validate all six locales/lesson pairs before claiming PASS.

## 2026-11-05 · C and D follow-up

- Full 648-cell Chromium axe CI #42025942260 was SUCCESS at 0ded9a7. VoiceOver and NVDA explicitly require owner; step-by-step scripts added to A11Y-MANUAL.md.
- Fixed strict TS6133 unused test import in D content lint; test result remains pending rerun.

## 2026-11-05 · LCP full matched bisect

- Eight SHA comparison #42035312314 five trials each identified first regression at ab8e9d9 (~1954→~2276ms).
- 8 isolated 5× single-file revert comparisons #42036088912: restoring either Home eager repository import or uiStore eager repository import recovered ~1955ms; index-only and Layout-only reverts retained ~2270ms. Root boundary is lazy storage import graph, not static shell alone.
- Selected minimal repair: restore eager repository facade import in uiStore while **actual IndexedDB initialize remains scheduled after first paint**. Initial gzip size budget ≤105kB remains unmet. Needs head SHA Lighthouse and all-browser CI before acceptance.

## 2026-11-05 · B: optional real per-second aggregates

- Added optional `SessionRecord.timeline` (schemaVersion stays 1) with sampled WPM/accuracy/attempt counts once per real second, no characters/key codes. Old sessions and JSON backups lack the field and continue to render an explicit empty state. Per-second Results chart is backed only by real saved samples and has an accessible table alternative.
- Unit + real IndexedDB E2E added; CI required. This is not synthetic interpolation. No stored character-by-character input history.

## 2026-11-05 · B accessible keyboard heatmap

- Added per-key local error-rate heatmap in Analytics with Viridis sequential palette (not red-green), numeric labels and accessible table. Keys without valid completed-session observations remain visibly unmeasured. Not an inference of finger position.

## 2026-11-05 · B legacy CSS literal colour migration

- Centralized 19 hex literal occurrences (15 unique) from src/styles/app.css into src/shared/theme/tokens.css without changing effective colors. Added pinned Stylelint `color-no-hex` CI command for non-token stylesheets and independent token check. Remaining non-color layout magic values and inline JSX styles are NOT fully migrated.

## 2026-11-05 · E/B Home editorial rebuild

- Rebuilt Home content RU/EN, retained original heading and navigation contract; added a daily-goal progress ring using only saved local session durations and a clearly labelled illustrative default when no user plan exists. No invented progress, achievements or forecast.
- Other eight UI locales keep translated chrome/page intro and explicit RU fallback for newly added body copy; no full 10-locale claim. CI/visual golden will require review for intentional design changes.

## 2026-11-05 · E bilingual Results + Analytics

- Authored RU/EN strings for Results and Analytics headings, metrics, evidence tables, error/empty states and offline PNG action; preserves existing RU defaults and E2E names. Other locales keep RU fallback for page body.

## 2026-11-05 · E RU/EN Academy and Themes

- Added authored bilingual RU/EN text on Academy and Themes, including course navigation, mastery stage labels, plan controls, settings explanations and contrasts. Existing lesson language selection remains an independent RU/EN switch. Default RU E2E labels preserved. 8 other locale body translations remain partial.

## 2026-11-05 · E bilingual Practice / physical keyboard hints

- Added authored English/русский user-facing Practice labels, mode names, track labels, status, help, result and settings. Kept independent content locale+keyboard layout controls and existing RU tests. Physical keyboard hints now have RU/EN strings. Some domain error/notice messages remain Russian and must be audited before claiming full bilingual coverage.

## 2026-11-05 · E audited translated-page scope

- Added RU/EN scope matrix with explicit Profile/Race/Classroom gaps and a six-route English UI Playwright smoke test. Existing i18n check covers only registered chrome/page copy, not all hardcoded JSX. No full RU/EN completion claim.

## 2026-11-05 · Ten-trial latency result

Run #42039411859, SHA 2077808c61f11327de317398cf96987023b76af2: Event Timing p95 CPU×1 all 24ms; CPU×4=32,32,32,40,32ms; unpaired CDP EventLatency. No verified end-to-end presentation success; A remains open.

## 2026-11-05 · Reviewed B visual golden baseline

- Inspected archived 36 PNGs from run #42041281178, SHA 722b6661, 3 themes ×3 viewports ×4 routes. Owner explicitly asked to approve reference screenshots.
- Pinned this current archive as CI golden at 1.5% pixel mismatch threshold with 24 RGB-channel delta; this is screenshot-only acceptance, not hardware/zoom/screen-reader acceptance.
- Future intentional redesign requires explicit visual review and new immutable archive, not auto-rebaseline.

## 2026-11-05 · Home LCP follow-up: measured render blocker removal candidate

- Inspected raw Lighthouse 12.8.2 report (5-run LCP SHA c2bd9d42): LCP is `main#main-content > section > header.pagehead > h1`, render delay 1502.5ms of 1955ms; Lighthouse estimated registerSW.js render blocker 301ms and CSS 151ms.
- Added VitePWA `injectRegister:null`, preserving offline worker registration via native `navigator.serviceWorker.register()` on load + requestIdleCallback, no skipWaiting; unlike blocking PWA script it does not run in first-paint critical path.
- Hypothesis only until 5× Lighthouse and PWA E2E on the new exact SHA; do not claim 1.2s or 1.0s. Static Home SSR/hydration remains unimplemented; previously injected HTML shell without hydration regressed LCP.

## 2026-11-05 · Deferred PWA registration experiment rejected

- Matched Lighthouse 12.8.2 mobile 5× at `9cc89e0d0964fc64144452aec020f3515da3bc46`, Actions #42079644192: LCP median **1952.95ms**, trials 1849 /1954 /1957 /1953 /1953; CLS 0. The ~1ms difference vs ~1954ms earlier is not a reproducible 300ms gain.
- Since deferring `registerSW.js` did not materially shorten LCP and changed offline bootstrap semantics, reverted the experiment to the previously passing PWA registration. No fake 1.2s success claim.

## 2026-11-05 · D/E continuation, owner-requested scope

- D: First-three-lesson original practice/review distinct texts and 4-gram overlap <10% checks are covered by `contentLint.test.ts`; the remaining 121 lessons are not claimed rewritten. Existing backup IDs remain version-aware.
- E: Added Profile/Race/Classroom RU/EN main interface strings with safety-critical backup/permission/IP disclosures; Profile achievements/tier and Race simulated bot display names are translated by stable IDs, without changing domain objects. Expanded English E2E to all nine routes.
- Coverage is still **partial pending exhaustive string audit/native-speaker QA**, especially deep dynamic error/state paths and user-provided exercise copy that must remain independent of interface locale.
- F and G intentionally deferred to next iteration. No merge/release/deploy or repo rename.

## 2026-11-05 · B CSS lint coverage completed

- Extended actual pinned Stylelint 16.23.1 `color-no-hex` gate from app.css/heatmap.css to all `src/**/*.css`, with the existing `.stylelintrc.json` explicitly excluding only central `tokens.css`.
- Expanded dependency-free guard to scan all other theme CSS including home.css; pinning package through npm exec is not the same as a package-lock devDependency, recorded for reproducibility.
- CI success on exact new SHA is required before claiming broad no-hex gate PASS.

## 2026-11-05 · Current HEAD hydration mismatch repair candidate

- Latest CI at d168891f failed three Chromium/Firefox/WebKit tests due to production React #418 text hydration mismatch. Root cause: checked-in static Home captures RU strings after persisted defaults apply, whereas i18next initializes from navigator.language (often en-US) before hydration. Added RU initial language only when matching Home prerender is in document; settings still hydrate after first render. Added a browser-locale en-US regression; release prohibited until same-SHA CI validates this fix. React hydration mismatch logs remain enabled (not suppressed).
