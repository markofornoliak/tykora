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
## Second immutable-source run and axe audit

A repeat of the **unchanged v0.8.0 main commit** completed successfully on 2026-10-25:
[Actions baseline run 40196865720](https://github.com/markofornoliak/tykora/actions/runs/40196865720), same Lighthouse 12.8.2 configuration and Chrome headless on GitHub-hosted Ubuntu. Measured mobile **87 / 100 / 100 / 100** (Performance / Accessibility / Best Practices / SEO), LCP **2055.85 ms**, CLS **0**; desktop **100 / 100 / 100 / 100**, LCP **483.47 ms**, CLS **0.0003314**. Host benchmarkIndex differed (mobile 1906 versus 2650.5 in the earlier run), so report the **observed mobile Performance range 87–93** rather than treating one run as a stable score.

axe-core on the production **Practice** route at widths **320, 768 and 1440 CSS px** reported **one moderate heading-order violation** at each width, **zero critical**, and **zero pageerror events** in the instrumented scenario. These findings apply only to those audited views, not all screens or browser engines. Original JSON artifacts are attached to the Actions run.

Remaining Phase-0 blockers: exact input-to-paint p95, React commits/keypress, visual dual-theme review, IndexedDB v1–v4 snapshots and a true production network data-exfiltration inspection are not confirmed.
