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


## 2026-11-06 — root cause and explicit golden update (threshold unchanged)

Compared the **original pixels**, not just CI percentages: archive [old golden #42041281178](https://github.com/markofornoliak/tykora/actions/runs/42041281178) against actual run [#42231771148](https://github.com/markofornoliak/tykora/actions/runs/42231771148) and the diff masks from [#42231771095](https://github.com/markofornoliak/tykora/actions/runs/42231771095).

1. **Daylight Practice at 1440, 768, 320:** original regression run captured the wrong (previous/unfinished) route with document height 900 rather than the actual Practice 1430/1356/2045px. After a route-specific readiness assertion on #practice-mode, a visible real Practice H1, network idle, font readiness and two rAFs, these three comparisons pass unchanged at 0.219%, 0.0117%, 0.0136%; exact geometry 1430/1356/2045. **Cause: capture readiness instability**, not an intentional redesign. No threshold changed.
2. **Contrast Dark Home 1440 (1.5940%):** original pinned reference unexpectedly has the desktop sidebar chrome rendered from **y ≈ 200px**, while the main content begins at its expected position. The actual screenshot and other themes show the sidebar correctly beginning at **y = 0**. The diff mask is concentrated in the sidebar and top 200px. This is a **genuine shell-layout correction**, not an LCP placeholder.
3. **Contrast Dark Practice 1440 (1.5389%):** the *same* old misplaced sidebar, ~200px down, while actual Practice content and document height are intact. **Genuine fixed-sidebar geometry**.

Reference decision: retain the valid, settled run [#42231771148](https://github.com/markofornoliak/tykora/actions/runs/42231771148), SHA d1f95ef9759e63d709a33a1c055b80f11f39b31b, as the **new explicitly reviewed complete 36-image golden**, because it contains the real loaded route and properly placed shell. The unchanged threshold remains 1.5%. This replaces the intentionally flawed historical reference from run #42041281178, SHA 722b66615a60507bc243ce622650aa9974da738f; it does **not** retroactively change old FAIL outcomes into PASS. Future captures now assert 1440px .sidebar top = 0 so the old bad geometry cannot silently re-enter the approved baseline. No content was removed, no theme altered, no production deployment.

**Acceptance:** 36/36 is only PASS after the freshly pinned comparison CI succeeds. Until then the previous 34/36 replay is the last verified result.


## Final stabilized visual baseline after explicit scroll normalization

Later replay [#42281142063](https://github.com/markofornoliak/tykora/actions/runs/42281142063) detected a **further real fixture hazard**: after changing location.hash from the long Themes page, browser scroll persisted at y=204px and sticky sidebar viewport y=-204px. This is not an app paint difference and not permission to remove screenshots. Capture now explicitly calls `window.scrollTo(0,0)`, asserts scrollY=0, waits for route-specific loaded content and fonts, then asserts sidebar y=0 for desktop. Comparison of old/new actual screenshot pixels confirmed residual differences were solely the preserved-scroll/positioned bottom-nav state, especially Contrast Dark at 320 and 768px.

**Current approved golden:** all 36 screenshot files from [dedicated visual run #42281897793](https://github.com/markofornoliak/tykora/actions/runs/42281897793), source SHA `32236f2d21d346e4ce5cfb6eb527f3c91d9de482`, all captured at document scrollY0. Re-pinned comparison [#42282386276](https://github.com/markofornoliak/tykora/actions/runs/42282386276) and [#42282379703](https://github.com/markofornoliak/tykora/actions/runs/42282379703) both **SUCCESS 36/36**. Pixel limit remained **0.015** with **zero changed thresholds or omitted screens**. Final baseline is intentionally later than earlier provisional #42231771148 and supersedes it because the latter was polluted by inconsistent scroll state. The original 31/36 and interim 34/36 remain correctly documented as historical failures. Subsequent product commits still require their own screenshot replay; a green historical artifact is not a universal status.
