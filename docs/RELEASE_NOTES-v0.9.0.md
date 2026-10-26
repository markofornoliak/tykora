# TYKORA Beta v0.9.0 — GitHub Pages release notes

**Released:** 2026-10-26 (owner-approved Beta publication)
**Audience:** testers and existing TYKORA users. This is *not* a completed or independently certified v0.9 Definition of Done.

## Changes since Beta v0.8.0

- Ordinary typing results now use a versioned scoring-v2 algorithm with explicit active time, nullable insufficient-data speeds and improved rhythm/error data. Existing v1 records are preserved and are not silently rescored.
- Export takes a consistent snapshot of local IndexedDB records. Backup files support an optional CRC32 corruption check. Destructive import replacement requires a pre-replace backup download and explicit confirmation; browser download completion cannot be guaranteed.
- Academy now requires two distinct successful texts per lesson and level-dependent minimum accuracy. Earlier v0.8 successful lesson results remain available as first-stage evidence; two-hour or new-UTC-day review intervals and public-bank holdout-word generation are included in the Beta.
- Adaptive practice adds confidence-aware weak-skill selection and seeded, reproducible exercises. Course materials and learning effectiveness have not been independently validated.
- Practice uses the browser's native input timestamp when credible. Key handling, accessible navigation and many automated regression scenarios were expanded.
- App loads specialist routes on demand, keeping Home eager for cold-load responsiveness. No speedup is promised.

## Quality and verification

Before merging, the owner-approved release branch must pass the full GitHub Actions quality matrix (TypeScript, ESLint, unit/property tests and Chromium/Firefox/WebKit E2E). The deployment workflow repeats acceptance checks, builds for the `/tykora/` base path, verifies versioned HTML and performs a version-specific live smoke test.

## Important limitations

- Measured Chromium 4× CPU-throttled key-event p95 **40 ms** after optimization versus **32 ms** before in one documented comparison. The intended less-than-16-ms interaction requirement is **not met**. React commits per key fell from 2.006 to 1.022 in a separate profiling build; this does not prove lower latency.
- Measured mobile LCP in an earlier candidate was **2.256 seconds**, exceeding the under-one-second goal. These laboratory figures are not guarantees for other hardware.
- UI navigation phrasebook covers 10 locales, but many pages and lessons still contain RU/EN-only copy.
- Real historical v1–v3 user database fixtures, full manual WCAG 2.2 AA validation, effectiveness studies, complete holdout vocabulary tracking, and some Adaptive/Precision Lab goals remain open.
- Browser data persistence is best effort. **Export your existing history in Profile before upgrading**, particularly if you use multiple browsers/devices. Clearing site data can erase local progress. PWA updates and caches may delay the new version until refreshed.
- Optional peer-to-peer WebRTC uses manual invitation and can disclose an IP address to the peer; it is not guaranteed to connect. No server leaderboard, independent anti-cheat or formal certificates.

## Links
- [Application](https://markofornoliak.github.io/tykora/)
- [GitHub repository](https://github.com/markofornoliak/tykora)
- [Measured performance](PERF-v0.9-BASELINE.md)
- [Technical report](TECHNICAL-REPORT-v0.9.0-DRAFT.md)
- [Remaining acceptance work](ROADMAP.md)
