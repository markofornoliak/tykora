# TYKORA Beta v0.9.0 — Release notes (DRAFT / NOT PUBLISHED)

This is an engineering candidate on `feature/v0.9.0`, not the released app. The public site and `main` remain on v0.8.0.

## What has changed in the candidate
- Completed ordinary Practice results use versioned scoring v2, including active-time pace, honest insufficient-data handling and new rhythm/error measurements.
- Improved protection of local session history with transactional export, backup-before-replace confirmation and a backward-compatible CRC32 corruption check.
- Academy tracks lesson progress across **two separate texts**: the original practice passage and a different review passage. Accuracy requirements increase by course level (95% / 96% / 97%). Original v0.8 session records still count as a first-stage success where applicable.
- Adaptive practice now uses a stable generator seed and explicit as-of timestamp; a record's prompt ID includes the model version/seed.
- Practice event timestamps now derive from the original native browser input event when credible; fallback covers invalid/legacy timestamps.
- More automated tests across Chromium, Firefox and WebKit, including synthetic old-IndexedDB migrations and Unicode input regression.

## Known limitations / acceptance gates still open
- **Mobile LCP target below one second has not been met** in measured production-preview lab runs; see `docs/PERF-BASELINE-v0.8.0.md`.
- No instrumented evidence yet for long-text input-to-paint p95, React commits per keystroke or frame rate.
- The secondary course text is a distinct deterministic variation, **not** a validated unseen-word-transfer assessment.
- Complete 10-language UI, Adaptive 2.0, content lint, WCAG 2.2 AA manual testing and advanced Precision Lab are still unfinished.
- Current app packages do not claim any pedagogical improvement, server certificate, global leaderboard or guaranteed peer race connectivity.
- Migration fixtures are synthetic; historical user databases must still be recovered and tested.

## Evidence and provenance
See [Draft PR #1](https://github.com/markofornoliak/tykora/pull/1), `docs/TECHNICAL-REPORT-v0.9.0-DRAFT.md` and `docs/ROADMAP.md`. Only the checks for the final branch commit can establish current candidate readiness. Do not merge or deploy the draft without user authorization and passing the full v0.9 Definition of Done.
