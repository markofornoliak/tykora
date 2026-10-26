# TYKORA v0.9.0 — performance baseline for iteration 3

**Date:** 2026-10-25 (UTC), browser **Chromium 156.0.8078.4**, GitHub-hosted Ubuntu, Playwright/CDP CPU throttle **4×**, 1280 × 900 viewport, production Vite build + preview. Script: `scripts/benchmark-input.mjs`.

## Reproducible comparison
- Immutable starting application code: `e0ec7dc39729d19b73d5aed0d1e639293cfcb6db`, measured with identical instrumentation on dedicated measurement branch `perf/iter3-e0ec7dc` at `1d41b6da`. No edits to `main`.
- After rAF-coalescing application: feature commit `54d4bf356c286f804e8ae38bd1265ca57d6730ba`. Ordinary web build and separate production-style React-profiling build use the *same* Playwright procedure.
- Exact input: 1,250 ASCII graphemes original custom prompt; 500 real `page.keyboard.type` inputs (1 ms requested delay), **500/500 accepted** in all measured runs, no text saved to user profile.

| Output, single captured trial per build | BEFORE (e0ec) | AFTER (optimized) | Scope |
|---|---:|---:|---|
| Event Timing keydown p95, **ordinary production** | 32 ms | 40 ms | 500 eligible before, 500 observed input events after; **not improved** |
| Event Timing keydown p95, **profiling build** | 32 ms | 32 ms | Profiling instrumentation has separate overhead |
| Two-requestAnimationFrame upper-bound p95, ordinary production | 34.8 ms | 27.8 ms | Approximate frame-bound marker, NOT exact paint |
| React Profiler subtree commit count, separate profiling build | 1,003 | 511 | **2.006 → 1.022 commits per input**, 49.1% fewer |
| CLS from non-recent-input layout-shift entries, ordinary production | 0 | 0 | Only this long-text scenario |
| Native input events delivered and final textarea content | 500/500 | 500/500 | No loss observed |

**Raw evidence:** [before job 40214771733](https://github.com/markofornoliak/tykora/actions/runs/40214771733), [after job 40214777052](https://github.com/markofornoliak/tykora/actions/runs/40214777052). Both workflows upload `standard.json` and `profiling.json`. Full scripts and commit SHAs retained.

## Instrumentation and limitations
- `PerformanceObserver` `event` duration is subject to a 16 ms observation threshold and browser-specific time quantization. It approximates the event duration up to next paint but is **not exact sub-16-ms input-to-paint measurement**. Do not count missing short interactions as zero.
- A double `requestAnimationFrame` time measured from native `Event.timeStamp` is an **upper-bound proxy**, not a measured presentation/paint timestamp.
- React `<Profiler>` callbacks are disabled in ordinary production React, so **React commit counts are taken only from a separately instrumented `react-dom/profiling` build**, with Vite alias `TYKORA_PROFILE=1`. Direct component invocation counters from older development runs are a different metric; those values must not be compared to commits.
- Profiling instrumentation changes scheduling and adds overhead; its latency distribution is not interchangeable with the ordinary production-build distribution.
- Another earlier optimized production run, [40214496099](https://github.com/markofornoliak/tykora/actions/runs/40214496099), measured p95 **24 ms**, while a later equally configured run measured **40 ms**. Runner jitter and browser scheduling variability mean this data **cannot prove a latency improvement**.
- Required p95 below 16 ms is **NOT MET / NOT VERIFIED**. Neither a macOS hardware keyboard measurement nor a controlled repeated-run estimate was performed. CLS=0 is limited to the measured scenario, not a sitewide claim.

## Commands
`VITE_BASE_PATH=/ npm run build`; `npm run preview -- --host 127.0.0.1 --port 4174`; `node scripts/benchmark-input.mjs`.
For commits: `VITE_BASE_PATH=/ TYKORA_PROFILE=1 npm run build -- --outDir dist-profile`; `npm run preview -- --host 127.0.0.1 --port 4175 --outDir dist-profile`; `BENCH_BASE_URL=http://127.0.0.1:4175 TYKORA_EXPECT_PROFILER=1 node scripts/benchmark-input.mjs`.
