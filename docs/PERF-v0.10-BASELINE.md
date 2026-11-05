# TYKORA iteration 5 — performance evidence ledger

**Reference checkout:** `main@0a7d167bc320b503a03dfe1247c96687526ca28b` (the exact source at the start of iteration 5).

## Reference baseline (not a new measurement)

Source: [PERF-v0.9-BASELINE.md](PERF-v0.9-BASELINE.md). The older documented experiment was on commits `e0ec7dc` and `54d4bf3`, **not** on current `main`; therefore the numbers below are historical context and must **not** be called a fresh before/after comparison.

| Metric | Historical before | Historical optimized | Current main (fresh) | Iter5 candidate |
|---|---:|---:|---|---|
| Chromium CPU×4 Event Timing keydown p95 | 32ms | 40ms | **32ms** (0ce60bc) | **24–32ms** across 3 single-run candidates; target unmet |
| React subtree commits / 500 inputs (profiling build) | 1003 | 511 | **514** (0ce60bc) | **4–5** (e02aea1, 3ef431f, 75663d2) |
| CLS, 1,250-grapheme scenario | 0 | 0 | **0** | **0** in measured scenario |
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

## Diagnostic run — sources of latency

[Input benchmark #42019977034](https://github.com/markofornoliak/tykora/actions/runs/42019977034), candidate `75663d24ba2376b797dd9bb6490af2f35b9316d7`, standard production Chromium 156 CPU×4:
- 500/500 inputs, 500 handler samples; **handler time p50 ≈0.1ms, p95 ≈0.8ms, p99 ≈1ms**.
- 138 rAF paint samples; **paint JS p50 0ms, p95 ≈0.5ms, p99 ≈1.6ms**. These measure JS repaint code, not end-to-end paint or rasterisation.
- Ordinary production observed Event Timing keydown: **285 thresholded samples, p50 16ms, p95 24ms, p99 24ms**. Profiling build: 500 observed samples, p95 32ms, 5 React commits. Comparing profiling latency with standard production latency is not valid.
- This diagnostic adds timing probes and uses a separate GitHub runner trial. **Do not attribute the 32→24ms single-trial difference to the implementation.** The earlier comparable candidate runs were all 32ms at p95. Browser scheduling, frame processing and input-to-next-paint await a Chrome trace / Long Animation Frames analysis before attempting deeper engine changes.

## Lighthouse mobile ×5 (2026-11-05)

Run: [#42019720034](https://github.com/markofornoliak/tykora/actions/runs/42019720034), source `38c259284ea4e19883d8414ec48097bc34f53ed6`, Lighthouse **12.8.2**, simulated mobile 412×823, CPU×4, network emulation: RTT 150ms, throughput 1638.4kbps, on GitHub-hosted Linux.

| Trial | LCP ms | CLS | Performance score |
|---|---:|---:|---:|
| 1 | 1827.67 | 0 | 85 |
| 2 | 1956.52 | 0 | 98 |
| 3 | 1954.20 | 0 | 98 |
| 4 | 1957.90 | 0 | 98 |
| 5 | 1954.24 | 0 | 98 |
| **Median** | **1954.24** | **0** | **98** |

**LCP ≤1000ms FAIL** under this simulation. This is *not* physical Moto G Power measurement. No before-iteration matched five-run Lighthouse set yet, so an LCP improvement/regression cannot be claimed.

Build log for the same source: Vite entry `index-*.js` **150.37kB gzip**, CSS **6.97kB gzip**, Practice lazy chunk **10.08kB gzip**. Entry gzip alone is **not** the full initial JS network payload; dependent JS import graphs and browser request logs remain unmeasured. No credible “−30% initial JS” claim can be made.

## Open acceptance blockers / next engineering experiments

1. **Event p95 ≤16ms — FAIL / not proven.** Collect Chrome Performance trace with input, style/layout and presentation timing on a repeatable fixed runner and physical device. Separate keydown vs beforeinput/input INP spans, check rendering, and repeat multiple trials before attributing wins.
2. **Mobile LCP ≤1000ms — FAIL.** Inspect LCP element, main-thread startup, actual initial request waterfall and script parse/execute time; evaluate removing noncritical runtime libraries from the eager Home import graph without destabilizing local-first data or offline.
3. **Bundle −30% — NOT MEASURED.** Build Vite manifest + dependency-aware initial JS budget script at both SHAs.
4. **10-minute memory leak test — NOT RUN.** Requires controlled prolonged session and memory snapshots, not extrapolation from this 500-input benchmark.
5. **True input-to-paint <16ms — NOT PROVEN.** Event Timing is thresholded; two-rAF is only a bound.
6. **Manual mobile / IME / hardware — NOT RUN.** Automated cross-browser E2E is not a substitute.

## A2 trace evidence and failed gate

A2 measured report: [A2-TRACE.md](A2-TRACE.md) (Chrome trace runs ×1/×4, 3 each, experimental CSS candidates, 10-minute heap, simulated Home LCP, and all emitted Vite chunks). **CPU×1 p95 24ms FAIL**, **CPU×4 32ms observed only**, simulated LCP ~2.27s FAIL, heap +1.108MB (not necessarily leak). B/C work proceeds despite these open failures.
