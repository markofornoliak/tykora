# Iteration 5 — design-system and visual acceptance ledger

- Visual direction: restrained professional training instrument. Semantic tokens and 24 palette numeric role resolver exist in src/shared/theme.
- Typography: target 24–32px fluid with 1.65 line-height; ligatures disabled; non-color error underline; focus-visible and reduced-motion/forced-colors overrides.
- Defined design primitives: 4/8 spacing scale, modular typography, three radii/shadows/durations, two easing curves, z layers; legacy CSS still contains hardcoded values.
- 36 baseline-candidate screenshots captured by a dedicated GitHub Actions workflow: 4 routes × 3 themes × 3 widths, Chromium. **Capture is not visual regression PASS**.
- Missing: approved reference image set, pixel-diff threshold, audited default/hover/active/disabled/loading/error/empty states for all components, Home/Results visual redesign, accessible Precision Lab chart tables, downloadable PNG result image, self-hosted font subsets and social preview asset.
- No visual QA certification without screenshot review and browser-device checks.

## Results screen incremental work

Added a local-only PNG export rendered with Canvas from stored summary metrics, comparable-session average (only same locale/layout/scoringVersion), and up to five actual weak n-grams; no simulated charts/false time series. The rest of the page redesign and graphical time-series require privacy-consistent data contracts.
