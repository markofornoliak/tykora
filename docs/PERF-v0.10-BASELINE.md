# TYKORA iteration 5 — performance evidence ledger

**Reference checkout:** `main@0a7d167bc320b503a03dfe1247c96687526ca28b` (the exact source at the start of iteration 5).

## Reference baseline (not a new measurement)

Source: [PERF-v0.9-BASELINE.md](PERF-v0.9-BASELINE.md). The older documented experiment was on commits `e0ec7dc` and `54d4bf3`, **not** on current `main`; therefore the numbers below are historical context and must **not** be called a fresh before/after comparison.

| Metric | Historical before | Historical optimized | Current main (fresh) | Iter5 candidate |
|---|---:|---:|---|---|
| Chromium CPU×4 Event Timing keydown p95 | 32ms | 40ms | Pending GitHub Actions evidence | Not measured |
| React subtree commits / 500 inputs (profiling build) | 1003 | 511 | Pending | Not measured |
| CLS, 1,250-grapheme scenario | 0 | 0 | Pending | Not measured |
| Mobile Lighthouse LCP | — | Above 1s objective | Not measured | Not measured |
| Event Timing p50 / p99 | — | — | Pending script extension | Not measured |
| Initial JS gzip, Lighthouse×5 median, 10-minute memory | — | — | Not measured | Not measured |

**Strict protocol:** use `scripts/benchmark-input.mjs`, Chromium, 1,250 ASCII graphemes / 500 synthetic keyboard input events, 1280×900, CDP CPU throttle ×4, Vite production preview, and separate `TYKORA_PROFILE=1` React profiling build. Results only count with raw JSON artifact, runner/browser version, full SHA, zero input loss, and no sampling ambiguity.

**Important limitation:** `PerformanceObserver({type:'event',durationThreshold:16})` does not observe all sub-16ms events; an observed p95 cannot certify true sub-16ms end-to-end input-to-paint. Two-rAF timings are an upper-bound proxy, not a presentation timestamp. A measurement on one GitHub runner is not a controlled device baseline.

**Stage gate:** Phases A–G are not passed merely because a change or benchmark workflow exists. Repeat multiple measurements under identical conditions and report both numerator/sample counts and uncertainty. Do not merge or publish from this branch.
