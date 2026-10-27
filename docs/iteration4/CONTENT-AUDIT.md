# Iteration 4 content audit — measured, not accepted
Date: 2026-10-27 UTC · Node.js 24 / `npm run check:content` / `scripts/content-audit.mjs`.
Evidence: [successful Actions run 40593385564](https://github.com/markofornoliak/tykora/actions/runs/40593385564), commit `99fd60bb` (source tree for measurements). Baseline `main@0a7d167`.

## Counts before / after
| Item | Main v0.9.0 | Current candidate | Change |
|---|---:|---:|---:|
| Stable course lessons | 124 | 124 | 0 |
| Original passage library per language | 22 | 46 | +24 |
| Original library total RU+EN | 44 | 92 | +48 |
| SQL passages per language | 0 | 24 | +24 |
| SQL executable samples (unique code) | 0 | 24 | +24 |
| Practice vocabulary and pattern-based texts | existing | unchanged | **no pedagogical improvement** |

Both locales share the same 24 SQLite code snippets, with language-specific titles. The automated SQLite execution gate passed (Python `sqlite3`). This is neither a Python nor a C++ grammar check.

## Actual course-diversity metrics
`TTR = uniqueWords / tokens`. Overlap is fraction of practice unique words also in the **legacy fallback** `lessonPrompt(...,'review')`; the live Academy review usually uses a separate adaptive word-bank holdout.

| Locale | Level | Average practice TTR | Highest-frequency word share | Repeated bigram share | Practice/review overlap |
|---|---:|---:|---:|---:|---:|
| RU | 1 | 0.1250 | 0.3155 | 0.7270 | 1.0000 |
| RU | 2 | 0.1250 | 0.4063 | 0.7661 | 1.0000 |
| RU | 3 | 0.5527 | 0.2636 | 0.3338 | 0.2636 |
| RU | 9 | 0.4096 | 0.1604 | 0.5259 | 0.4060 |
| RU | 10 | 0.3854 | 0.1560 | 0.5523 | 0.4363 |
| EN | 1 | 0.1250 | 0.3631 | 0.7379 | 1.0000 |
| EN | 2 | 0.1250 | 0.4219 | 0.7718 | 1.0000 |
| EN | 3 | 0.6086 | 0.2447 | 0.3087 | 0.2176 |
| EN | 9 | 0.3825 | 0.1367 | 0.5631 | 0.4325 |
| EN | 10 | 0.3842 | 0.1485 | 0.5637 | 0.4314 |

**Verdict:** proposed ≤0.25 maximum-word share and 0 practice/review overlap for levels 1–3 do **not** pass. Raw course content and reconstruction identifiers remain untouched until safe content-v2 migration and independently checked word banks are available. `--check` currently enforces only original provenance, NFC, trailing whitespace, preservation/count and runnable SQL; it **does not** waive or label pedagogical checks as passing.

## Track deficits after this increment
SQL now has 24 samples/locale. General still has 8/locale, and business, finance, medicine, legal, Python, C++, JavaScript have 2/locale each: all below the requested 24 per track. Syntax checking for these legacy code snippets and human review of 30 lessons/10 readings have **not** been performed as an accepted gate.

## Next content gate
Versioned `promptId` and legacy text reconstruction; approved RU/EN real-word banks using exact keyboard alphabets; 30+ inspected lessons/readings; curricular prose packs; rights metadata for every quote and font; 0 word overlap in actual practice/holdout. Keep severity S1 until measured.
