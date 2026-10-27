# TYKORA Iteration 4 — interim acceptance report (27 Oct 2026 UTC)
Base `main@0a7d167`; review branch `feature/iter4-design-content`; draft PR #2. **Incomplete / NOT MERGE-READY.**
1. Added 24 original SQLite examples, exposed to RU/EN (48 localized entries); old 44 passage IDs unchanged.
2. Added 30 original ergonomic tips for RU and EN, shown in Academy; tests cover count, uniqueness and rotation.
3. Added SQL/Python/JS/C++ syntax pipeline; old C++ fragment compiles with synthetic wrapper, not standalone.
4. Added original-content provenance ledger, course diversity audit, per-route JSX localization scan, CSS token scan, and passive-route network audit.
5. Added locally generated PNG Results card and conservative editorial CSS; no typing engine, Dexie, lesson ID, promptId or version changes.
6. Measured `99fd60bb`: 248 lesson language metrics, 92 passage entries; L1/L2 legacy practice/review word overlap 100% — S1 curriculum defect **OPEN**.
7. Visual Playwright `a73a877a`, [Actions 40593999708](https://github.com/markofornoliak/tykora/actions/runs/40593999708): 162 shots; 0 width overflow; 0 page JS errors; 0 axe critical/serious in tested 18 cases. Human visual rubric unverified.
8. Static CSS `a73a877a`: 32,093 bytes; 29 CSS token names, 26 raw font-size expressions, 98 raw spacing values, 15 literal hex colors; not computed-token compliance.
9. 10+10 input runs `6ba49671`, [Actions 40593650529](https://github.com/markofornoliak/tykora/actions/runs/40593650529): Chromium CDP CPU×4, 500 inputs; median Event Timing p95 **32→32 ms**, 0% regression; <16ms goal **FAIL**.
10. Mobile Lighthouse 12.8.2 `a73a877a`: Home performance **86**, LCP **1,905 ms**, CLS 0; Practice performance **96**, LCP **2,369 ms**, CLS 0.0378; target <1s **FAIL**. Home repeat at same CSS ranged score 54–86, so no improvement claim.
11. All 24 palettes preserved; automated validator now checks text and accent against both background/surface >=4.5:1. Full-state AA and manual WCAG **unverified**.
12. Completed CI [40594653418](https://github.com/markofornoliak/tykora/actions/runs/40594653418) at `8b826f47` is green; latest-head CI **unverified until completed**.
13. Pending: content-v2 restricted-alphabet lessons, 120 prose passages/locale, 24/track except SQL, 150 verified PD quotes/locale, licensed local fonts and original-source verification.
14. Pending: full design-system/component rollout, localized all-feature strings, human/native-speaker reading, true data migration fixtures, offline-PWA storage preservation, visual rubric and manual WCAG.
15. Latest passive network trace, new Academy tests/contrast/i18n checks and all-browser latest-head quality must be confirmed against their own run IDs; no fake PASS.
16. No owner-approved merge, no release, no Dexie schema change, no main modifications, no new version.
Source details: [AUDIT](AUDIT.md), [MEASUREMENTS](MEASUREMENTS.md), [CONTENT-AUDIT](CONTENT-AUDIT.md), [LOG](LOG.md), [candidate notes](RELEASE_NOTES-DRAFT.md).
