# TYKORA performance baseline — v0.8.0

Date: 2026-10-25. Source: `main` at `9fb97bce89b54d071e6344e7449e095d818f51be`.
Only values logged by [successful Linux GitHub Actions run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299) are called measured. Mobile, desktop and interaction performance values require repeatable browser traces and have **not been measured**.

| Metric | v0.8.0 baseline | Tool / conditions | v0.9.0 | Status |
|---|---:|---|---|---|
| Input-to-paint p95, long passage | not confirmed | Performance/Event Timing, device and CPU throttle not recorded | not confirmed | measurement missing |
| React commits per keypress | not confirmed | React Profiler not run | not confirmed | measurement missing |
| Lighthouse mobile: performance/accessibility/best practices/SEO | not confirmed | mobile emulation/throttling not recorded | not confirmed | measurement missing |
| Lighthouse desktop: four categories | not confirmed | desktop settings not recorded | not confirmed | measurement missing |
| LCP | not confirmed | cold-load browser trace missing | not confirmed | measurement missing |
| CLS | not confirmed | browser trace missing | not confirmed | measurement missing |
| Long-text frame rate | not confirmed | trace missing | not confirmed | measurement missing |
| axe-core violations | not confirmed | test report missing | not confirmed | measurement missing |
| Console uncaught errors | not confirmed | aggregated browser audit missing | not confirmed | measurement missing |
| JS main chunk (minified) | 552.70 kB | Vite 7 build log; Node 24, ubuntu-latest, 2026-10-25 | not confirmed | build artifact |
| JS main chunk (gzip) | 181.50 kB | same as above | not confirmed | build artifact |
| CSS chunk (gzip) | 6.97 kB | same as above | not confirmed | build artifact |
| Vitest tests | 34 passing / 7 files | GitHub Actions, Ubuntu, Node 24, 2026-10-25 | not confirmed | test-run evidence |
| Playwright dev / production, Chromium | 18 / 2 passing | GitHub Actions, Ubuntu, Node 24, 2026-10-25 | not confirmed | test-run evidence |

**Important:** the build-size measurements are not Lighthouse/latency results. An unmeasured baseline cannot prove a regression or an improvement. Do not use synthetic benchmarks as end-user results.