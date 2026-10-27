# TYKORA — Iteration 4 candidate notes (DRAFT / NOT RELEASED)
Base: `main@0a7d167` (Beta v0.9.0). Branch: `feature/iter4-design-content`.
**Version remains 0.9.0. Main, GitHub Pages and existing IndexedDB schema are unchanged.**

## Implemented in the isolated candidate
- Adds SQL to the Practice track selector and 24 original executable SQLite snippets in each RU/EN library (same syntax text for both). Retains the 44 existing passage IDs and all existing lesson/prompt IDs.
- Adds deterministic lesson/reading diversity measurements (word count, TTR, top-word concentration, consecutive repetition, bigram reuse, practice/review vocabulary intersection and grapheme count).
- Runs a strict structural, original-license and SQLite execution gate in CI without lowering the previous lint, TypeScript or E2E gates.
- Introduces a locally generated PNG export card in Results (browser canvas, no upload).
- Refines editorial spacing/type treatment without touching the practice input engine. Records reproducible screenshot and ten-run performance evidence separately.
- Updates out-of-date released-version wording and documents sources, audit and risks.

## NOT accepted / release blockers
- 120 curated prose passages/locale, 24 unique items for **every** track, fully constrained words in L1–L3, content-v2 migration, public-domain quote catalog and rights verification, independent native-language review.
- Full tokenized component system and full redesigned screens, 24-palette interactive AA in both schemes, WCAG manual audit, fixed-rubric design scoring, complete i18n extraction.
- 10× paired timing, Lighthouse before/after, full PWA migration/backups from real v1–v3 databases, screen-reader/manual WCAG verification must be attached with numbers before acceptance.
- No unverified improvement claims, no new languages described as complete, no merge/release until owner approval and quality gates.

Evidence: `docs/iteration4/AUDIT.md`, `docs/iteration4/LOG.md`, GitHub Actions visual and input benchmark runs. Passing automated axe checks is not a WCAG certification.
