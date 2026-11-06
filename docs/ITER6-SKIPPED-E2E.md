# Iteration 6 · 30 intentional Playwright skips (no invisible gaps)

Source: `e2e/iter5-a11y-matrix.spec.ts` and `e2e/iter5-visual.spec.ts` at `e8dd01f752bfe311f88d77940721c3e459270fed`.
The standard `test:e2e` runs 3 projects. Exactly 27 skipped are the 9-route 24-theme × 3-width axe **separate** matrix (nine specs × three projects), plus 3 skipped Chromium/Firefox/WebKit visual **capture-only** tasks. Their skip conditions have named Playwright descriptions in source; none represents an unreported product failure or a disabled base route test.

| # | Test file | Route/coverage | Project | Current skip reason |
|---:|---|---|---|---|
| 0 | `e2e/iter5-a11y-matrix.spec.ts` | `/` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 1 | `e2e/iter5-a11y-matrix.spec.ts` | `/` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 2 | `e2e/iter5-a11y-matrix.spec.ts` | `/` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 3 | `e2e/iter5-a11y-matrix.spec.ts` | `/practice` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 4 | `e2e/iter5-a11y-matrix.spec.ts` | `/practice` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 5 | `e2e/iter5-a11y-matrix.spec.ts` | `/practice` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 6 | `e2e/iter5-a11y-matrix.spec.ts` | `/academy` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 7 | `e2e/iter5-a11y-matrix.spec.ts` | `/academy` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 8 | `e2e/iter5-a11y-matrix.spec.ts` | `/academy` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 9 | `e2e/iter5-a11y-matrix.spec.ts` | `/analytics` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 10 | `e2e/iter5-a11y-matrix.spec.ts` | `/analytics` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 11 | `e2e/iter5-a11y-matrix.spec.ts` | `/analytics` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 12 | `e2e/iter5-a11y-matrix.spec.ts` | `/result` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 13 | `e2e/iter5-a11y-matrix.spec.ts` | `/result` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 14 | `e2e/iter5-a11y-matrix.spec.ts` | `/result` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 15 | `e2e/iter5-a11y-matrix.spec.ts` | `/themes` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 16 | `e2e/iter5-a11y-matrix.spec.ts` | `/themes` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 17 | `e2e/iter5-a11y-matrix.spec.ts` | `/themes` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 18 | `e2e/iter5-a11y-matrix.spec.ts` | `/race` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 19 | `e2e/iter5-a11y-matrix.spec.ts` | `/race` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 20 | `e2e/iter5-a11y-matrix.spec.ts` | `/race` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 21 | `e2e/iter5-a11y-matrix.spec.ts` | `/profile` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 22 | `e2e/iter5-a11y-matrix.spec.ts` | `/profile` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 23 | `e2e/iter5-a11y-matrix.spec.ts` | `/profile` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 24 | `e2e/iter5-a11y-matrix.spec.ts` | `/classroom` | Chromium | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 25 | `e2e/iter5-a11y-matrix.spec.ts` | `/classroom` | Firefox | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 26 | `e2e/iter5-a11y-matrix.spec.ts` | `/classroom` | WebKit | `TYKORA_A11Y_FULL_MATRIX !== '1'` in default CI; dedicated Chromium full-matrix run |
| 28 | `e2e/iter5-visual.spec.ts` | capture 3 themes × 3 widths × 4 routes | Chromium | `TYKORA_VISUAL_CAPTURE !== '1'` in default CI; dedicated Chromium evidence capture |
| 29 | `e2e/iter5-visual.spec.ts` | capture 3 themes × 3 widths × 4 routes | Firefox | `TYKORA_VISUAL_CAPTURE !== '1'` in default CI; dedicated Chromium evidence capture |
| 30 | `e2e/iter5-visual.spec.ts` | capture 3 themes × 3 widths × 4 routes | WebKit | `TYKORA_VISUAL_CAPTURE !== '1'` in default CI; dedicated Chromium evidence capture |

## Dedicated, never hidden checks

- Run 9×24×3 axe Chromium through `TYKORA_A11Y_FULL_MATRIX=1` in `.github/workflows/iter6-a11y-visual.yml`. This runs 648 actual theme-route-width cells; dedicated CI must be SUCCESS before claiming full matrix. Firefox/WebKit general route accessibility stays in the standard 3-engine Playwright suite. Chromium-only full palette is an explicit scope restriction, not proof of 24-palettes in other browsers.
- Run 3×3×4 screenshot generation under `TYKORA_VISUAL_CAPTURE=1` with a Chromium project, for 36 screenshots. These are **raw images for review**, not validated golden pixel diffs. Firefox and WebKit are deliberately excluded from this exact capture suite; visual regression across engines is an uncompleted iteration-6 goal.
- On a dedicated run, `test.skip(browserName!=='chromium')` is an explicit, human-readable project guard. It is **not** a license to omit Firefox/WebKit focus, keyboard, basic axe, routing, production PWA or offline tests.
- If fresh default CI reports a different skip count, fail the inventory reconciliation and investigate before accepting. Counts here describe the existing standard 198-test suite and may expand as new tests are added; no claim that a 30-skip count is a universal invariant.
