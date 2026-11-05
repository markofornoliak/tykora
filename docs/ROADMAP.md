# TYKORA — evidence-gated roadmap (2026-10-25)

**Release reality (verified at iteration 5 start, 2026-11-05):** `main@0a7d167bc320b503a03dfe1247c96687526ca28b` is the owner-approved **Beta v0.9.0** source. This `feature/iter5-quality-design` branch is **unreleased**; no merge, release tag, or Pages deployment is permitted. Do not treat passing CI as release approval. Never skip a phase gate. See [baseline audit](audit-v0.8.0.md) and [performance](PERF-BASELINE-v0.8.0.md).

## P0 — acceptance blockers (check only from logged evidence)
- [x] Audit the v0.8.0 source and record reproducible, immutable-source Lighthouse Home / axe Practice observations (not a complete phase-0 gate).
- [x] npm-generated lockfile, `npm ci` regression pipeline, built-app E2E in Chromium / Firefox / WebKit (see GitHub Actions for exact current SHA).
- [x] Introduce a scoring-v2 implementation + reference tests without modifying historical saved v1 scores; production integration and cross-version backup compatibility require separate evidence.
- [x] Atomic readonly export snapshot, guarded replace with pre-replace download, no automatic destruction on parse error.
- [ ] Obtain real pre-v4 IndexedDB snapshots and imported v0.8.0 profiles; synthetic schema fixtures only do not satisfy this.
- [x] Compare exact 1,250-grapheme / 500-input Chromium 156 benchmark under CDP CPU×4 at original `e0ec7dc` and optimized branch, with ordinary Event Timing + CLS and separate React-profiling build for *actual commits*: 32→40 ms ordinary Event Timing p95 (no improvement), 1,003→511 subtree Profiler commits; CLS 0 in both. **Sub-16ms goal unmet**. See [strict iteration 3 baseline](PERF-v0.9-BASELINE.md).
- [ ] Complete engine event classification, IME/dead-key/AltGr, Unicode, pause/resume, alternative inputs and all cross-browser E2E.
- [x] Add fast-check seeded invariants for v2 metrics (Net ≤ Raw, finite numbers, 0–1 accuracies, valid active duration); full worker→session→backup restore coverage and device validation remain open.
- [x] Preserve historical scores and existing IDs; add generated, public-dictionary unfamiliar review words, documented estimator version/seed/length/provenance and valid *two hours or next UTC calendar day* retention; 95–97% per-level mastery and session-ID uniqueness. Previously unsaved custom prompt vocabulary remains unknowable; not a full validated holdout curriculum.
- [x] Use original browser input timestamps when credible, with epoch-time fallback and rapid/Unicode/multiline unit regressions (broader physical-keyboard/IME device matrix remains open).
- [x] Make adaptive generation deterministic for a fixed profile/seed/content bank, including immunity to changes in implicit wall clock; runtime prompt IDs now retain estimator version and seed.
- [ ] Finish Adaptive 2.0: principled individual latency baseline, spaced repetition validation, true holdout-word protocol and course content lint/education checks.
- [ ] Full UI translations RU/EN/UK/DE/FR/ES/PT/PL/TR/IT and language/layout/content independence.
- [ ] Precision Lab evidence-backed charts with accessible table alternatives.
- [ ] WCAG 2.2 AA keyboard/VoiceOver or NVDA tests, 320px+200% zoom, both themes, axe on each route.
- [ ] Complete offline PWA upgrade data retention, request-privacy trace, performance targets from production with detailed conditions.
- [x] Add pinned ESLint, fast-check metrics invariants, 10-locale i18n 49 chrome + 6 page-copy key/placeholder checks, and all nine routes axe in Chromium/Firefox/WebKit **at 320, 768 and 1440px**. Unregistered hardcoded UI is not translated; manual a11y remains open. [Coverage table](I18N-COVERAGE-v0.9.md).
- [ ] Release tagging / tested redeploy-tag rollback, user-approved merge, live smoke and version validation.

## P1 (only after P0)
Extended heatmaps, data-supported personal forecasts, user layout editor, additional genuine content packs, better local classes and races, extended report exports.

## Excluded from v0.9.0
Paid TURN relays, server leaderboards, external telemetry, fictional ranks and certificates, mandatory logins, unverified typing-speed improvement promises. A P2P WebRTC connection may fail without TURN; explain potential IP disclosure before consent.

## Acceptance rule
For each claim, record command, exact commit SHA, test log, browser/device and throttling where relevant. Missing evidence means **not confirmed**, not passed. `main` cannot be merged without explicit user approval. A draft PR is review space, not a release.

## Iteration 5 A2 targets (introduced 2026-11-05, owner request)
- Interaction **p95 ≤16ms at CDP CPU×1** and **≤32ms at CPU×4**, for the exact 1,250-grapheme / 500-input production scenario; both must state sample count, Event Timing threshold limitations, and run-to-run variability. These are *separate simulation budgets*, not proof of hardware latency.
- Lowering the CPU×4 target from 16ms to 32ms acknowledges unavoidable frame scheduling under fourfold slowdown and prevents falsely equating observed quantized Event Timing to actual keypress-to-photon latency. CPU×1 must still hit 16ms. Threshold is an engineering budget, not a WCAG certification.
- Simulated Lighthouse Home LCP target ≤1.2s, then ≤1.0s, median of 5 repetitions; do not relabel simulated data as physical Moto G Power.
- Keep initial JS at most the fresh-main baseline; aspirational −30%, measured against actual route/network dependency graph, not just the entry chunk.
- 10-minute Chrome heap test with forced GC and DOM-node samples, plus actual Chrome trace event/renderer task analysis. Do not claim zero memory growth without measurements.
- Phase A2 is one time-bounded engineering pass. Start B and C after that pass even if latency goals remain open; document any FAIL explicitly.
