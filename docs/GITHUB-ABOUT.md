# GitHub About and showcase draft — owner-only metadata edits

The installed GitHub integration supports content commits, but does **not** expose an edit-repository-metadata operation. Consequently the actual GitHub About **description, website URL and topics are unchanged**. Do not claim these fields were set. This is the ready-to-review text for the repository owner, not an automatic action.

**Suggested About description:** “Local-first typing practice: 124 RU/EN lessons, adaptive exercises, accessible themes, offline PWA and private browser-based progress. MIT.”

**Suggested website:** Owner should verify the real live Pages URL and current HTTPS certificate before setting it in About. Do not infer a hostname from GitHub Pages naming conventions.

**Suggested topics:** `typing-trainer`, `typing-practice`, `touch-typing`, `education`, `local-first`, `offline-first`, `pwa`, `react`, `typescript`, `accessibility`.

**Existing release:** main Beta v0.9.0. Branch iteration 6 is in [Draft PR #4](https://github.com/markofornoliak/tykora/pull/4), not an advertised production release. Do not showcase preliminary perf numbers as current site metrics.

## Hero assets still missing

The repository currently has icon PNGs and an SVG memory trend, **no actual Home light/dark screenshots or recorded GIF** under `docs/assets/`. Do **not** produce fabricated static mockups labelled screenshots or point README at nonexistent images. Capture the *actual built app* from a reviewed immutable SHA in real Chromium, inspect them for layout/alt text/PII, then commit approved screenshots and a short GIF. Give them meaningful alt text in README. Do not update visual-regression goldens without reviewing their diffs.

## Before changing name

See [Naming collision review](NAMING.md). Domain, registry and social-handle availability require further checks and explicit owner decision. No automatic rename or registered trademark assertion.
