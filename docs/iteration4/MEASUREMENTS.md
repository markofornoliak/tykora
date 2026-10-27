# TYKORA Iteration 4 — measured evidence
Date: 2026-10-27 (UTC). All claims refer to a specific commit and CI job, not the entire release.

| Check / tool | Commit | Reproducible evidence | Actual result |
|---|---|---|---|
| Content audit, Node 24 / `scripts/content-audit.mjs` | `99fd60bb` | [run 40593385564](https://github.com/markofornoliak/tykora/actions/runs/40593385564) | 248 language-specific lesson measurements, 92 reading entries. RU/EN level-1 and 2 legacy review vocabulary intersection 100%; **pedagogical content gate FAIL** |
| Full CI matrix including TypeScript, lint, Vitest, browser E2E | `99fd60bb` | same workflow | PASS at this historic candidate SHA; not proof of latest SHA |
| Baseline vs pre-CSS candidate, `benchmark-input.mjs` 10+10, Chromium CPU×4 | `2a5bfdad` | [run 40593238130](https://github.com/markofornoliak/tykora/actions/runs/40593238130) | median Event Timing p95 32→32 ms; 1.00x |
| Baseline vs post-CSS candidate, same 10+10 protocol, CPU×4, Chromium, 500 keystrokes | `6ba49671` | [run 40593650529](https://github.com/markofornoliak/tykora/actions/runs/40593650529) | Event Timing p95 median **32→32 ms**, baseline 32–32, candidate 24–32, ratio 1.0 PASS **no >10% regression**; absolute <16 ms FAIL |
| Browser screenshots and axe-core/Playwright, 9 routes × 3 widths × 6 palette choices | `a73a877a` | [run 40593999708](https://github.com/markofornoliak/tykora/actions/runs/40593999708) | 162 screenshots; 0 horizontal overflow, 0 JS page errors; 0 critical/serious axe for 18 route/theme combos at 768px. No manual WCAG review or 0–3 scored visual rubric |
| CSS source static scan, Node `scripts/audit-css.mjs` | `a73a877a` | same run | 32,093 bytes; 29 distinct token names, 26 distinct raw font-size expressions, 98 raw spacing values, 15 literal hex colors. **Textual counts, not computed-token-compliance proof** |
| Lighthouse 12.8.2 mobile, default throttling | `a73a877a` | same run | Home: performance **86**, LCP **1,905.4 ms**, CLS 0; Practice: performance **96**, LCP **2,369.0 ms**, CLS 0.0378; accessibility score 100 automated on both. Neither LCP <1s |
| Lighthouse 12.8.2 mobile, prior run with same CSS source | `c8595412` | [run 40593861142](https://github.com/markofornoliak/tykora/actions/runs/40593861142) | Home performance 54, LCP 3,293.6 ms; Practice performance 97, LCP 2,317.4 ms. **Not a paired before/after baseline**; score variability must be shown honestly |
| Python `ast.parse`, Node `--check`, g++ C++14 syntax-only, Python sqlite3 | `a7b45b04` | [run 40594431974](https://github.com/markofornoliak/tykora/actions/runs/40594431974) | 2 Python, 2 JS, 2 C++, 24 unique SQLite examples individually pass; this overall CI run was RED due separate ESLint unnecessary escape issue, fixed in `8b826f47` |

**Open / not verified:** All 24 palettes against all interactive state combinations in both schemes; manual WCAG/screen readers; licensed PD corpus; new curriculum v2 and old-ID compatibility after migration; complete 120 passage/locale and 24/track targets; full route-wide i18n; real historical Dexie databases; 30-lesson/10-passage bilingual editorial review; robust offline PWA update persistence; candidate Lighthouse matched immutable baseline; last-head CI until finished.

Artifacts with screenshots, Lighthouse JSON and raw 10-run performance readings are downloadable from the GitHub Actions workflow pages (not committed binaries).
