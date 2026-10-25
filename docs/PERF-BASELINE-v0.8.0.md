# TYKORA performance baseline — v0.8.0

Date: 2026-10-25. Source: `main` at `9fb97bce89b54d071e6344e7449e095d818f51be`.
Only values logged by [successful Linux GitHub Actions run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299) are called measured. Lighthouse Home-page values were measured on immutable main, but interaction/typing metrics and full axe coverage remain unconfirmed.

Measured on 2026-10-25 by [immutable-main browser-baseline run 40196542139](https://github.com/markofornoliak/tykora/actions/runs/40196542139): Lighthouse 12.8.2, production Vite build served locally on 127.0.0.1:4174, GitHub Actions Ubuntu, Node 24, Chrome headless. Mobile emulation 412×823 CSS px, device scale 1.75, simulated CPU slowdown ×4, simulated network RTT 150 ms, throughput 1638.4 Kbps; desktop emulation 1350×940 CSS px, CPU slowdown ×1, RTT 40 ms. Values refer to **lab tests on the root Home screen**, not field data or the typing route.

| Metric | v0.8.0 baseline | Tool / conditions | v0.9.0 | Status |
|---|---:|---|---|---|
| Input-to-paint p95, long passage | not confirmed | Performance/Event Timing, device and CPU throttle not recorded | not confirmed | measurement missing |
| React commits per keypress | not confirmed | React Profiler not run | not confirmed | measurement missing |
| Lighthouse mobile: performance/accessibility/best practices/SEO | 93 / 100 / 100 / 100 | Lighthouse 12.8.2, 412px, ×4 CPU, 150ms RTT, Ubuntu runner 2026-10-25 | not confirmed | measured Home lab |
| Lighthouse desktop: performance/accessibility/best practices/SEO | 100 / 100 / 100 / 100 | Lighthouse 12.8.2, 1350px, ×1 CPU, 40ms RTT, Ubuntu runner 2026-10-25 | not confirmed | measured Home lab |
| LCP | mobile 1995.10ms; desktop 485.09ms | Lighthouse 12.8.2 lab, same environments above | not confirmed | measured Home lab |
| CLS | mobile 0; desktop 0.0003314 | Lighthouse 12.8.2 lab, same environments above | not confirmed | measured Home lab |
| Long-text frame rate | not confirmed | trace missing | not confirmed | measurement missing |
| axe-core violations | not confirmed | test report missing | not confirmed | measurement missing |
| Console uncaught errors | not confirmed | aggregated browser audit missing | not confirmed | measurement missing |
| JS main chunk (minified) | 552.70 kB | Vite 7 build log; Node 24, ubuntu-latest, 2026-10-25 | not confirmed | build artifact |
| JS main chunk (gzip) | 181.50 kB | same as above | not confirmed | build artifact |
| CSS chunk (gzip) | 6.97 kB | same as above | not confirmed | build artifact |
| Vitest tests | 34 passing / 7 files | GitHub Actions, Ubuntu, Node 24, 2026-10-25 | not confirmed | test-run evidence |
| Playwright dev / production, Chromium | 18 / 2 passing | GitHub Actions, Ubuntu, Node 24, 2026-10-25 | not confirmed | test-run evidence |

**Important:** the build-size measurements are not Lighthouse/latency results. The mobile Lighthouse performance baseline (93) is below the v0.9 target (95); mobile LCP (1995.10ms) is above the 1000ms target. The measurements are only one run and should be repeated. An unmeasured typing baseline cannot prove an interaction regression or improvement. Do not use synthetic benchmarks as end-user results.