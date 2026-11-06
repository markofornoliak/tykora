# Iteration 6 — visual regression evidence (not accepted)

Pinned pixel comparison [Actions #42227299262](https://github.com/markofornoliak/tykora/actions/runs/42227299262), app SHA `e0410119e6b0cfcb148998ed075c1fd70581e408`, reference SHA `722b66615a60507bc243ce622650aa9974da738f`. Original 1.5% pixel-change threshold kept. **31 of 36 pass; 5 fail.** No golden changes made.

| Failure | Changed pixels | Reference size | Candidate size |
|---|---:|---|---|
| Contrast Dark — Home 1440 | 1.5940% | 1440×1104 | 1440×1104 |
| Contrast Dark — Practice 1440 | 1.5389% | 1440×1430 | 1440×1430 |
| Daylight — Practice 1440 | 4.7092% | 1440×1430 | 1440×900 |
| Daylight — Practice 768 | 6.2660% | 768×1356 | 768×900 |
| Daylight — Practice 320 | 9.4244% | 320×2045 | 320×900 |

Diff PNGs inspected; Daylight Practice changes include large page-height mismatch, not just antialiasing. Cause is **not proved**: could be route readiness, screenshot timing or true layout regression. A controlled reproduction and visual inspection must distinguish them. Golden update, changed tolerance or disabled tests are forbidden without reviewed decision. Status **FAIL**; blocks merge.
