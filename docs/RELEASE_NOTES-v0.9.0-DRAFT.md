# TYKORA Beta v0.9.0 — Release notes (DRAFT / NOT PUBLISHED)

This is an engineering candidate on `feature/v0.9.0`, not the released app. The public site and `main` remain on v0.8.0.

## What has changed in the candidate
- Completed ordinary Practice results use versioned scoring v2, including active-time pace, honest insufficient-data handling and new rhythm/error measurements.
- Improved protection of local session history with transactional export, backup-before-replace confirmation and a backward-compatible CRC32 corruption check.
- Academy requires a first practice plus an independently generated public-word-bank review, with at least **two hours or a new UTC calendar date**, different saved session IDs and accuracy thresholds of 95% / 96% / 97% by level. Identifiers encode seed, model version, target length and nonprivate public-word indices. Earlier saved practice and review IDs remain readable.
- Adaptive practice now uses a stable generator seed and explicit as-of timestamp; a record's prompt ID includes the model version/seed.
- Practice event timestamps now derive from the original native browser input event when credible; fallback covers invalid/legacy timestamps.
- More automated tests across Chromium, Firefox and WebKit, including synthetic old-IndexedDB migrations and Unicode input regression.

## Known limitations / acceptance gates still open
- **Mobile LCP target below one second has not been met** in measured production-preview lab runs; see `docs/PERF-BASELINE-v0.8.0.md`.
- Long-text Chromium Event Timing was measured at CPU×4 and 500/500 characters; ordinary production p95 **32→40 ms** in the strict before/after protocol, which is **not an improvement** and above the requested 16 ms. Separate React profiling measured **1,003→511 subtree commits**. Full input-to-paint under 16 ms and stable hardware validation remain unproven; see `docs/PERF-v0.9-BASELINE.md`.
- Generated review words exclude known original course, diagnostics and reconstructable public-bank exposures; earlier unsaved custom text and legacy unindexed reviews cannot be reconstructed, so universally unseen historical vocabulary is **not guaranteed**.
- ESLint, fast-check, 3-width all-route axe and ten-locale i18n catalog/placeholder gates run in CI. Registered catalogs contain 55/55 keys per locale, but **many page strings remain untranslated**. Adaptive 2.0, content lint, manual WCAG 2.2 AA and advanced Precision Lab are still unfinished.
- Current app packages do not claim any pedagogical improvement, server certificate, global leaderboard or guaranteed peer race connectivity.
- Migration fixtures are synthetic; historical user databases must still be recovered and tested.

## Evidence and provenance
See [Draft PR #1](https://github.com/markofornoliak/tykora/pull/1), `docs/TECHNICAL-REPORT-v0.9.0-DRAFT.md` and `docs/ROADMAP.md`. Only the checks for the final branch commit can establish current candidate readiness. Do not merge or deploy the draft without user authorization and passing the full v0.9 Definition of Done.
