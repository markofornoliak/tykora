# TYKORA Beta v0.9.0 — Technical Report (Draft)

**Date:** 2026-10-25  
**Status:** Engineering candidate, **not accepted / not deployed**.  
**Scope:** `feature/v0.9.0` → [Draft PR #1](https://github.com/markofornoliak/tykora/pull/1). Main remains v0.8.0 at `9fb97bc`.

## 1. Verified starting point

- [v0.8 main quality run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299) and [Pages run 40145391276](https://github.com/markofornoliak/tykora/actions/runs/40145391276) succeeded.
- Baseline protocol: Lighthouse 12.8.2, GitHub-hosted Ubuntu, Node 24, production Vite preview at `http://127.0.0.1:4174/`. Mobile 412×823, CPU ×4, RTT 150ms, throughput 1638.4Kbps; desktop 1350×940, CPU ×1, RTT 40ms.
- Immutable v0.8 repeated runs: mobile Performance 93 and 87, mobile LCP 1995.10ms and 2055.85ms. Desktop 100 and 100; CLS approximately zero. Scores vary with benchmarkIndex.
- axe-core on v0.8 Practice at 320/768/1440 found one moderate heading-order issue per tested width, zero critical. That is not a WCAG audit of the entire app.

## 2. Architecture changes

- Ordinary Practice uses a separate, pure TypeScript `calculateScoreV2` and `score.worker.ts`; legacy `tykora-1.0.0` records are never rescored implicitly.
- `ScoreV2` distinguishes unavailable speeds (null) from zero, separates wall and active time, calculates accurate final-character CPM, and emits rhythm and error metrics. Race/Classroom still use legacy scoring. State mutation/event timestamp architecture remains unfinished.
- React Router keeps the shared Layout eager, Home eager for initial LCP, and defers eight specialist screens using `React.lazy` and Suspense.
- Existing Dexie schema version 4 is unchanged. Synthetic native IndexedDB versions 10/20/30 exercise upgrades to native 40. Real v1–v3 user profile snapshots are **not available** and therefore **not proven**.

## 3. Data, privacy and security

- Backup export takes all five tables inside one Dexie readonly transaction.
- Replace validates the incoming file, initiates a local safety backup download, and asks for explicit confirmation. Transactions prevent partial replacement; the browser cannot prove a downloaded file reached durable external storage.
- A backward-compatible optional CRC32 checksum detects accidental alteration of newer JSON exports. Older files without a checksum remain importable. CRC32 is **not** a signature or cryptographic authentication.
- Production E2E instruments HTTP(S) requests while using typing, profile and analytics without optional social network connections. This limited test cannot prove all routes and WebRTC behaviors are privacy-safe.

## 4. Quality evidence

- At candidate SHA `07fe948624c71b99cab0b57be65277397e2b22bd`, [Quality gates run 40198849057](https://github.com/markofornoliak/tykora/actions/runs/40198849057) succeeded: **45 Vitest tests across 9 files**, **16 backup format checks**, **75 browser E2E tests**, and **9 production E2E tests**. Browser matrix includes Chromium, Firefox and WebKit; runner Ubuntu, Node 24. These are logged test counts, not users or performance measures.
- [Performance audit 40198849012](https://github.com/markofornoliak/tykora/actions/runs/40198849012), same candidate SHA: Lighthouse mobile **96 / 100 / 100 / 100**, LCP **2256.48ms**, CLS 0. Desktop **100 / 100 / 100 / 100**, LCP **442.10ms**, CLS **0.0003314**. Mobile benchmarkIndex 3451.5 differs from baseline runs; claims of performance gains are **not warranted**.
- Entrypoint JS gzip measured by Vite build logs: baseline 181.50 kB, candidate 150.27 kB (17.2% smaller). Route chunks must be evaluated separately; gzip reduction does not prove faster interaction.
- Documentation and quality evidence pertain to those exact commit SHAs; they are not an assertion that subsequent branch commits passed.

## 5. Known unverified or unmet Definition-of-Done items

- Mobile LCP under 1 second is **not met** in the measured lab runs.
- Input-to-paint p95 below 16ms, React commits per keystroke, full stable 60fps, and comparable field performance are **not confirmed**.
- Full end-to-end i18n, curriculum mastery, entire Adaptive 2.0, Precision Lab visuals, proper lint, and fast-check property-based coverage remain unfinished.
- Comprehensive WCAG 2.2 AA audit (manual NVDA/VoiceOver), contrast and 200%-zoom across all screens and themes: **not confirmed**.
- Real historical database migrations, long-lived storage durability, complete production network/privacy verification, installed PWA update lifecycle, and live v0.9 smoke test: **not confirmed**.
- No release tag, version bump, or main-branch merge is made; user approval remains required before merging.

## 6. Safe next gates

1. Keep the latest branch commit green in all CI checks, including WebKit focus, synthetic migrations, CRC backups and production offline.
2. Capture repeatable typing-event paint traces on original v0.8 and candidate v0.9, and repair any regression.
3. Complete the remaining high-priority content, adaptive, metrics, accessibility and localization requirements and verify them.
4. Only after full DoD and explicit permission to merge, tag a release and run live GitHub Pages smoke tests.

Source-of-truth comparison: [docs/PERF-BASELINE-v0.8.0.md](PERF-BASELINE-v0.8.0.md).  
All performance numbers above are lab measurements on GitHub Actions, not real-device guarantees.
