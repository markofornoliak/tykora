# Architecture Decision Records

**ADR-001: React + Vite + TypeScript.** Chosen for reusable UI, testability, offline static builds and contributor ecosystem. Tradeoff: dependency size and modern Node requirements. React isn't used in the keystroke hot path.

**ADR-002: Feature-first directory and dependency-inverted domain.** Code is organized by product workflow, with reusable lower-layer contracts for teaching, metrics, and persistence. Avoids giant components and a premature monorepo.

**ADR-003: IndexedDB via Dexie.** Transactional storage for sessions and skill stats. Storage remains best-effort; export/import and persistent-storage requests are future work.

**ADR-004: Hash-based routing.** GitHub Pages deep-link reload works without a dedicated server. Tradeoff: less elegant URLs, acceptable for a PWA.

**ADR-005: Local-first without registration.** No server is required for typing or lessons; community features are optional adapters, not global prerequisites.

**ADR-006: Versioned metrics.** Every historical result references a scoringVersion, layoutId, locale, content ID and mode to avoid quietly changing past performance comparisons.

**ADR-007: Transparent stages.** Stage-4 implements real measurement and skills but cannot claim a full educational corpus, audited offline installability or empirically validated adaptation until verified. No artificial user scores.

**ADR-008: UI heritage.** Stage-2 CSS is initially migrated as a visual baseline; iterative extraction to CSS Modules should preserve screenshots, token semantics and a11y.

**ADR-009: Preserve native composition.** Use native textarea value and composition-end commits for actual characters, `KeyboardEvent.code` only for non-text physical-key hints.

**ADR-010: Calibrated language.** Skill confidence is a heuristic evidence weight; no validated probability claim.

**ADR-017 (iteration 5, provisional): Bounded imperative typing window.** Native textarea and the unchanged immutable typing engine remain the semantic source of truth. A private session store publishes React snapshots every 250 ms and at start/end/reset; an aria-hidden window of up to 288 graphemes is painted via DOM refs in rAF. Chosen over canvas because screen-reader support is already provided by native textarea/target description, while native text selection, font metrics and IME compatibility remain easier to preserve. No measured performance improvement is claimed pending ordinary/profiling browser benchmarks. This decision is reversible if measurements regress.

**ADR-018 (iteration 5, evidence-limited): Do not rewrite the scoring engine to chase browser Event Timing.** In a 500-key CPU×4 diagnostic run, the existing input handler p95 was approximately 0.8 ms, versus keydown Event Timing p95 24 ms from thresholded entries. Browser frame scheduling and page startup are more plausible next profiling targets than speculative changes to immutable scoring/history semantics. The first architecture change reduced profiling commits by over 99% but did not consistently reduce Event Timing p95. No user data or historical v1 scores are migrated by Iteration 5 Phase A.

**ADR-019 (iteration 5 A2, approved engineering budget):** Measure production-typing p95 separately at CPU×1 (≤16ms) and CPU×4 (≤32ms), rather than using the unattained and quantization-affected universal ≤16ms at CPU×4 target. The ×4 budget is a pragmatic frame-budget gate under artificial slowdown; it does not establish exact input-to-presentation timing. Also require per-part Event Timing breakdown, independent next-rAF proxy with variance, and browser trace evidence. All prior unmet targets remain visible.

**ADR-020 (provisional, Home load):** Defer first Dexie module import until local-settings/history hydration, after the first render opportunity. Render a self-hosted static HTML startup shell before React boot. No network fonts exist in this repository, so subset preload is NOT implemented rather than introducing a CDN request. Inline critical CSS is a CSP consideration: future strict CSP must hash the exact style block, and style attributes from theme runtime require separate mitigation. Defer worker initialization: current score worker is already instantiated only on completion, not on Home. LCP/JS improvement requires benchmark evidence.

**ADR-021 (Iteration 5, controlled regression bisect):** On fixed Lighthouse profile 5× at each of eight SHAs and eight targeted source revert variants, `ab8e9d9` introduced ~320ms LCP regression linked to eager→dynamic persistence module imports. The static Home shell alone is not the persistent cause. Restore eager storage facade module import in UiStore while deferring *database access* until Layout's post-first-paint effect, preserving the local-first semantics and old storage contracts. Accept that 105kB initial JS is **not** met by this repair; no misleading single-entry-only savings claim. Source: GH Actions #42035312314 and #42036088912.

**ADR-022:** Five measured Chromium/CDP trials per CPU (run #42039411859) fail ×1 p95≤16ms and fail robust ×4 p95≤32ms (one trial 40ms). EventLatency slices are not associated one-to-one with 500 keystrokes, so a one/two-frame alternative cannot be claimed passed. rAF callback timing is frame-phase dependent, not input-to-photon. Retain original acceptance fail pending better correlation / physical device validation.

**ADR-023 (LCP follow-up, experimental):** Raw Lighthouse `largest-contentful-paint-element` identifies the real Home `<h1>` with ~1502.5ms render delay in a 1955ms LCP sample; `registerSW.js` contributes an estimated 301ms render-blocking opportunity. Disable VitePWA synchronous registration injection and use native service-worker registration only after page load/idle. Keep `sw.js` scope under `import.meta.env.BASE_URL` for GitHub Pages paths. Five-run Lighthouse and offline/upgrade regressions are mandatory before acceptance. No fake pre-rendered heading or nonhydrating shell is admitted into production only to game LCP.
