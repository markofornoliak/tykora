# TYKORA Beta v0.9.0 — technical evidence report (DRAFT)

Date: 2026-10-25. Repository [markofornoliak/tykora](https://github.com/markofornoliak/tykora), [Draft PR #1](https://github.com/markofornoliak/tykora/pull/1). Main and public Pages still on **v0.8.0** at `9fb97bce89b54d071e6344e7449e095d818f51be`. This document is a development report, **not** a release acceptance statement.

## Architecture and input
Existing React 19 / TypeScript / Vite / Zustand / Dexie + IndexedDB / PWA architecture is retained. No rewrite. P0 input correctness and React render-rate/IME manual validation are still open. Existing native textarea grapheme/IME test infrastructure is retained; later score changes do not alter historical saved results.

## Metrics
`src/domain/metrics/metricsV2.ts` introduces `tykora-2.0.0` with active-time scoring and nullable insufficient-data speed, reference/test cases and `docs/metrics-spec.md`. Ordinary Practice score worker and UI consume v2; E2E checks short-sample save/result behavior. Old saved `tykora-1.0.0` records remain identifiable and unchanged. Race and Classroom have legacy paths; universal migration of scoring semantics is **not confirmed**. fast-check randomized properties and source-event full classification remain open.

## Adaptive learning / curriculum
Wilson 95% intervals and `n>=20` gate distinguish missing evidence from genuinely low accuracy for n-grams, with unit and deterministic-generator regression tests; see `docs/adaptive-model.md`. This is a partial improvement, **not** validated educational efficacy. Full Adaptive 2.0 holdout protocol, schedules, latency versus personal median, all 124 lesson quality and content lint remain open.

## Local data and privacy
Consistent IndexedDB export via readonly Dexie transaction, guarded replace import with pre-replace local download and explicit confirmation; synthetic v1/v2/v3 legacy schema migration tests and UI cancellation test. New backup CRC32 is an **accidental-corruption checksum, not a security signature**. Legacy backup format remains compatible. Real v0.8.0 user profiles and historical DB snapshots are unavailable, so data-preservation acceptance on real fixtures is **not confirmed**. Built-app privacy E2E checks default typing/profile/analytics for third-party HTTP(S) requests and outbound HTTP writes; it is **not** a complete packet-level/network audit of every feature or WebRTC.

## UX and analytics
Corrected keyboard heading semantics, added an accessible expandable table with actual stored WPM/accuracy/score-version rows beneath the analytics chart, and an E2E covering real DOM typing -> scoring -> saved result -> accessible table. These changes do not constitute the full Precision Lab or WCAG 2.2 AA audit. All 10 UI locales remain **not confirmed complete** across every screen.

## Measured v0.8.0 baseline (immutable original commit)
Source: [run 40196542139](https://github.com/markofornoliak/tykora/actions/runs/40196542139) and successful [repeat/axe run 40196865720](https://github.com/markofornoliak/tykora/actions/runs/40196865720), Lighthouse 12.8.2 / Chrome headless / Ubuntu GitHub runner Node 24.
- Mobile emulator: 412×823 CSS px, DPR 1.75, simulated CPU ×4, RTT 150 ms. Scores 93 then 87; four categories are performance/100 accessibility/100 best practices/100 SEO. LCP 1995.10 then 2055.85 ms; CLS zero.
- Desktop: 1350×940 CSS px, CPU ×1 and RTT 40ms. Score 100 performance and three other categories 100 both times; LCP 485.09 then 483.47 ms; CLS 0.0003314.
- Practice axe at width 320/768/1440: 1 moderate `heading-order` per viewport; 0 critical. An H2 correction is in the feature branch, but all-screen manual/screen reader audit is outstanding.

## Measured v0.9 candidate (NOT the latest commit)
[run 40198520241](https://github.com/markofornoliak/tykora/actions/runs/40198520241), commit `96b510bbc32449088fa3f99c75c556bfaf6fd7b3`: mobile 85/100/100/100, LCP 2160.42 ms, CLS zero; desktop 100/100/100/100, LCP 509.00 ms, CLS 0.02513. The later [run 40198849012](https://github.com/markofornoliak/tykora/actions/runs/40198849012), commit `07fe948624c71b99cab0b57be65277397e2b22bd`: mobile 96/100/100/100, LCP 2256.48 ms, CLS zero; desktop 100/100/100/100, LCP 442.10 ms, CLS 0.0003314. Runner benchmarkIndex varied; these separate lab runs **do not prove a causally attributable performance gain**. Mobile LCP target <1s remains unmet.

## Test evidence (fixed snapshots; later commits require their own run)
- [main run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299): 34 Vitest, 18 dev Chromium E2E, 2 production Chromium E2E all passed; Vite JS main 552.70 kB minified/181.50 kB gzip.
- [feature run 40196121847](https://github.com/markofornoliak/tykora/actions/runs/40196121847): `npm ci`, existing domain/backup/quality/worker checks, typecheck, 34 Vitest, 54 production-preview E2E, 6 production PWA E2E all passed across Chromium/Firefox/WebKit.
- [feature run 40198294453](https://github.com/markofornoliak/tykora/actions/runs/40198294453): 45 Vitest, 72 browser E2E, 9 production E2E, passed.
- [feature run 40198809645](https://github.com/markofornoliak/tykora/actions/runs/40198809645): 45 Vitest, 75 browser E2E, 9 production E2E, passed. Versions/tools: Node 24 Ubuntu GitHub Actions, Playwright Chromium/Firefox/WebKit. A successful historic snapshot is not proof for the latest PR head.

## Release blockers
P0 items not fully accepted: real DB migration fixtures; exact input-to-paint p95 and renders/keystroke from a documented Chrome trace; complete IME/cross-layout classification; course content lint + Adaptive 2.0 mastery; full Precision Lab graphs; complete UI locale coverage and 320px dark/light matrix; screen-reader and WCAG 2.2 AA manual review; privacy network audit of all features; true `lint` gate; PWA update migration; release-tag redeploy/rollback; proof of performance under stated target; latest-head regression report. No server rankings, TURN infrastructure or fictional certificates. See [ROADMAP](ROADMAP.md).

**Decision:** Keep PR as **Draft**, keep main/live v0.8.0, never force push, never merge without explicit approval. Production deployment of v0.9.0 cannot be claimed.
