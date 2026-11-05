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

## Iteration 5 implementation hypothesis

A stores transient input state off React and uses bounded native DOM runs. It does **not** change the scoring formula or IndexedDB. This is a candidate until a **fresh matched main-vs-branch run** establishes actual p50/p95/p99, React commits and layout stability. The benchmark's 16ms Event Timing sampling threshold cannot prove <=16ms latency from an observed distribution.

## Measured single-run matched comparison (2026-11-05)

Both builds use Chromium 156.0.8078.4, CDP CPU×4, 1280×900, 1,250-grapheme prompt and 500 keyboard.type calls on GitHub Actions Ubuntu. Standard production and separate profiling builds are **different distributions**. Each row below is one run, not a statistical distribution of run medians.

| Version / exact SHA | Production Event Timing p95 | Two-rAF bound p95 | Profiling-build React commits / 500 | Input accepted | CLS |
|---|---:|---:|---:|---:|---:|
| Fresh main-equivalent baseline `0ce60bc77a9a8a2e0bf23243543f16e1f77699f5` | **32 ms** | 27.5 ms | **514** | 500/500 | 0 |
| External store `e02aea19213b09b2f357e880463b813ed04f81f5` | **32 ms** | 27.2 ms | **4** | 500/500 | 0 |
| Changed-glyph painter `3ef431fa6777501ab2da4eb61c52e50b289db839` | **32 ms** | 25.1 ms | **5** | 500/500 | 0 |

Raw run links: [baseline #42018802786](https://github.com/markofornoliak/tykora/actions/runs/42018802786), [first candidate #42019118123](https://github.com/markofornoliak/tykora/actions/runs/42019118123), [second candidate #42019495329](https://github.com/markofornoliak/tykora/actions/runs/42019495329).

**Interpretation:** Dramatically fewer React commits; **no demonstrated reduction in Event Timing p95**. The p95 target is *not met*. The two-rAF bound cannot be equated with an actual presented frame and small single-trial differences can be runner noise. Sample counts differ: baseline and the second candidate each had 500 Event Timing samples, while the first candidate reported 437 thresholded keydown entries in the ordinary build. PerformanceObserver quantization and the 16ms threshold remain limitations.
