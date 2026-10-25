# TYKORA — evidence-gated roadmap (2026-10-25)

**v0.9.0 development only.** The public GitHub Pages site and default `main` still represent v0.8.0; no one may treat this branch as a finished release solely because CI is green. Never skip a phase gate. See [baseline audit](audit-v0.8.0.md) and [performance](PERF-BASELINE-v0.8.0.md).

## P0 — acceptance blockers (check only from logged evidence)
- [x] Audit the v0.8.0 source and record reproducible, immutable-source Lighthouse Home / axe Practice observations (not a complete phase-0 gate).
- [x] npm-generated lockfile, `npm ci` regression pipeline, built-app E2E in Chromium / Firefox / WebKit (see GitHub Actions for exact current SHA).
- [x] Introduce a scoring-v2 implementation + reference tests without modifying historical saved v1 scores; production integration and cross-version backup compatibility require separate evidence.
- [x] Atomic readonly export snapshot, guarded replace with pre-replace download, no automatic destruction on parse error.
- [ ] Obtain real pre-v4 IndexedDB snapshots and imported v0.8.0 profiles; synthetic schema fixtures only do not satisfy this.
- [x] Measure and document 4× CPU long-text native input Event Timing and two-rAF approximation, plus opt-in React render invocation counts; compare baseline and RAF-coalesced code at exact SHAs. Chromium Event Timing p95 stays 32 ms, so the original **sub-16ms timing target remains unmet**; true React commit counting and stable-device reruns remain open. See [iteration 3 performance evidence](ITERATION3-INPUT-PERFORMANCE.md).
- [ ] Complete engine event classification, IME/dead-key/AltGr, Unicode, pause/resume, alternative inputs and all cross-browser E2E.
- [x] Add fast-check seeded invariants for v2 metrics (Net ≤ Raw, finite numbers, 0–1 accuracies, valid active duration); full worker→session→backup restore coverage and device validation remain open.
- [x] Preserve historical course progress while requiring a second distinct text, separate session IDs and 95–97% accuracy for confirmed mastery (distinct texts are not independently validated holdout words).
- [x] Use original browser input timestamps when credible, with epoch-time fallback and rapid/Unicode/multiline unit regressions (broader physical-keyboard/IME device matrix remains open).
- [x] Make adaptive generation deterministic for a fixed profile/seed/content bank, including immunity to changes in implicit wall clock; runtime prompt IDs now retain estimator version and seed.
- [ ] Finish Adaptive 2.0: principled individual latency baseline, spaced repetition validation, true holdout-word protocol and course content lint/education checks.
- [ ] Full UI translations RU/EN/UK/DE/FR/ES/PT/PL/TR/IT and language/layout/content independence.
- [ ] Precision Lab evidence-backed charts with accessible table alternatives.
- [ ] WCAG 2.2 AA keyboard/VoiceOver or NVDA tests, 320px+200% zoom, both themes, axe on each route.
- [ ] Complete offline PWA upgrade data retention, request-privacy trace, performance targets from production with detailed conditions.
- [x] Add pinned ESLint gate, fast-check property gate, i18n key/placeholder parity gate, and axe all nine routes in Chromium/Firefox/WebKit (limited to tags in test).
- [ ] Release tagging / tested redeploy-tag rollback, user-approved merge, live smoke and version validation.

## P1 (only after P0)
Extended heatmaps, data-supported personal forecasts, user layout editor, additional genuine content packs, better local classes and races, extended report exports.

## Excluded from v0.9.0
Paid TURN relays, server leaderboards, external telemetry, fictional ranks and certificates, mandatory logins, unverified typing-speed improvement promises. A P2P WebRTC connection may fail without TURN; explain potential IP disclosure before consent.

## Acceptance rule
For each claim, record command, exact commit SHA, test log, browser/device and throttling where relevant. Missing evidence means **not confirmed**, not passed. `main` cannot be merged without explicit user approval. A draft PR is review space, not a release.
