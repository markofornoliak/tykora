# Iteration 5 — reviewed visual golden baseline (2026-11-05)

The owner explicitly requested selecting golden screenshots for this iteration. Reference: GitHub Actions run #42041281178 (success), source SHA `722b66615a60507bc243ce622650aa9974da738f`, image artifact ID `13420688462`. Inspected all 36 full-page screenshots in Daylight / Nightfall / Contrast Dark at 320 / 768 / 1440 CSS pixels on Home, Practice, Results and Themes. This is a reviewed **automated screenshot baseline**, not independent screen-reader or on-device approval.

CI downloads the exact archived images read-only; changed pixels (>24 RGB-channel difference) beyond **1.5%** or any dimension mismatch fail. Changed views generate diff PNGs and JSON. The historical 0ded baseline must no longer be used for redesigned Home/Results screenshots. Rebaseline requires a newly inspected artifact; no automatic reference updates.

Known limitations: 320px screenshots have sticky bottom navigation that must be tested manually with touch and physical landscape virtual keyboard; screenshots show empty session states, not all loading/error/active/finished states; no browser zoom, NVDA, VoiceOver or real Moto G Power evidence. Passing pixel diff **alone** does not establish visual or WCAG conformance.

Proof: [visual/a11y successful capture](https://github.com/markofornoliak/tykora/actions/runs/42041281178), [source commit](https://github.com/markofornoliak/tykora/commit/722b66615a60507bc243ce622650aa9974da738f); latest pinned-reference CI status must be checked separately.