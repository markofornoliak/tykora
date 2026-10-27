# TYKORA — Iteration 4 candidate notes (DRAFT / NOT RELEASED)
Base: `main@0a7d167` (Beta v0.9.0). Branch: `feature/iter4-design-content`.
**Version remains 0.9.0. Main, GitHub Pages and existing IndexedDB schema are unchanged.**

## Implemented in the isolated candidate
- Adds SQL to the Practice track selector and 24 original executable SQLite snippets in each RU/EN library (same syntax text for both). Retains the 44 existing passage IDs and all existing lesson/prompt IDs.
- Adds deterministic lesson/reading diversity measurements (word count, TTR, top-word concentration, consecutive repetition, bigram reuse, practice/review vocabulary intersection and grapheme count).
- Runs a strict structural, original-license and SQLite execution gate in CI without lowering the previous lint, TypeScript or E2E gates.
- Introduces a locally generated PNG export card in Results (browser canvas, no upload).
- Adds 30 original RU and 30 EN ergonomic hints with compact Academy display and deterministic selection, validated in unit tests.
- Parses or compiles all existing unique Python, JavaScript, C++ and SQL snippets in CI. The legacy C++ fragment with no includes/main is wrapped for syntax checking, not claimed to be a standalone executable.
- Refines editorial spacing/type treatment without touching the practice input engine. Records reproducible screenshot and ten-run performance evidence separately.
- Updates out-of-date released-version wording and documents sources, audit and risks.

## NOT accepted / release blockers
- 120 curated prose passages/locale, 24 unique items for **every** track, fully constrained words in L1–L3, content-v2 migration, public-domain quote catalog and rights verification, independent native-language review.
- Full tokenized component system and full redesigned screens, 24-palette interactive AA in both schemes, WCAG manual audit, fixed-rubric design scoring, complete i18n extraction.
- 10× paired timing, Lighthouse before/after, full PWA migration/backups from real v1–v3 databases, screen-reader/manual WCAG verification must be attached with numbers before acceptance.
- No unverified improvement claims, no new languages described as complete, no merge/release until owner approval and quality gates.

Evidence: `docs/iteration4/AUDIT.md`, `docs/iteration4/LOG.md`, GitHub Actions visual and input benchmark runs. Passing automated axe checks is not a WCAG certification.

## Measured candidate checks
- Post-CSS benchmark on [40593650529](https://github.com/markofornoliak/tykora/actions/runs/40593650529), `6ba49671`: ten baseline + ten candidate, median Event Timing p95 **32→32 ms**; not below 16 ms.
- Visual/Lighthouse on [40593999708](https://github.com/markofornoliak/tykora/actions/runs/40593999708), `a73a877a`: 162 screenshots, zero overflows/browser errors/critical or serious axe in measured subset; Lighthouse Home performance 86/LCP 1,905 ms, Practice performance 96/LCP 2,369 ms. One separate identical-css run had different Home Lighthouse scores; no unqualified before/after performance claim.
