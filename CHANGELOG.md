# Changelog

## 0.9.0 Beta · 2026-10-26 · GitHub Pages

**Beta publication approved by the project owner.** This is an experimental release, not confirmation of all v0.9 Definition-of-Done targets. Previous v0.8 code remains available in Git history.

- Added a documented v0.8.0 audit and repeat Lighthouse/axe-core baselines, with reproducible candidate measurements and explicit unverified dimensions.
- Introduced versioned scoring v2 into Practice and background scoring workers: active-time speed, corrected CPM, nullable short-session WPM, confidence-bound-safe retention of legacy v1 history.
- Added schema-compatible backup checksums (CRC32 for corruption detection, not a digital signature), consistent IndexedDB snapshot export and a mandatory pre-replace download/confirmation.
- Extended CI to reproducible `npm ci`, browser E2E across Chromium, Firefox and WebKit; added synthetic Dexie v1–v3 migration regression, result scoring, data-privacy and accessibility checks.
- Added route-level code splitting, keeping Home eagerly loaded to avoid a second cold-load request. A single mobile Lighthouse score can vary with runner performance; measured LCP remains above target.
- Added deterministic Wilson-bound adaptive filtering and accessible historical speed table under the analytics chart.
- Replaced single-run course mastery with two distinct text variants (original practice plus review), level-dependent accuracy thresholds (95%/96%/97%) and preserved old v0.8 results as first-stage progress.
- Added native input-event timestamp normalization, dedicated clock tests and rapid Unicode/multiline engine regressions; never inferred typed characters from physical key codes.
- Documented unfinished acceptance items and prior decisions. Unmet targets remain visible in the Beta release notes; performance below 16 ms has not been demonstrated.


## 0.8.0 · 2026-10-25 · Previous GitHub Pages beta

- Added 5-table local JSON backup/export/import with transaction-safe merge/replace, schema validation and size bounds.
- Added GitHub Pages CI-gated publishing workflow and Cloudflare Pages deployment instructions.
- Added PNG PWA icons and Apple touch icon, explicit base-path handling and artifact-verification gate.
- Added browser scenarios for backup handling and built-PWA offline behavior (not run without dependencies).
- Updated privacy, contribution, and release documentation; clarified that full production validation is incomplete.

## 0.7.0 and earlier

See `docs/STAGE7-QUALITY.md` and preceding stage documents for earlier milestones.
