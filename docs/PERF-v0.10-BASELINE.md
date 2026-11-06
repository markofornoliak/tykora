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

## Five-run input gate

CDP ×1 and ×4, five runs each: CPU×1 p95 24ms (FAIL ≤16ms); CPU×4 p95 32/32/32/40/32ms (FAIL robust ≤32ms). See docs/INPUT-PRESENTATION.md and Actions #42039411859.

## Iteration 6 · Phase 0 — verified matched triple baseline (2026-11-05)

**Completed run:** [three-way Lighthouse x10 #42114840487](https://github.com/markofornoliak/tykora/actions/runs/42114840487); workflow SUCCESS; all thirty raw JSON reports saved as GitHub Actions artifact `tykora-iter6-phase0-3way-lh12x`. This section supersedes the *pending* Iteration 6 placeholders, not the earlier historical Iteration 5 observations.

Single `ubuntu-24.04` runner, sequential `npm ci`, `check`, `lint`, `test`, `build`, `check:dist` for each immutable source; Lighthouse **12.8.2**, 412×823 simulated mobile, CPU ×4, RTT 150ms; 10 trials each (N=10). Automated cross-variant Lighthouse version, Chrome host user-agent and throttling/screen configuration equality: **PASS**.

| Variant (immutable SHA) | LCP median (ms), N=10 | LCP min–max (ms) | CLS median | TBT median (ms) | Performance median | Entry gzip (bytes) | Initial static JS graph gzip (bytes) |
|---|---:|---:|---:|---:|---:|---:|---:|
| main `0a7d167bc320b503a03dfe1247c96687526ca28b` | 1953.9814 | 1952.7636–1957.1257 | 0 | 7.5 | 98 | 150366 | 150491 |
| iter5 `244c5060b37ba9d802dbad796b3ce1ed562f5339` | 1952.9922 | 1805.2779–1958.2916 | 0 | 4.5 | 98 | 151745 | 151870 |
| iter6 initial `a2b200a7053abf5770cf1fd99823899e21fa91d3` | 1955.7971 | 1804.9328–1983.0601 | 0 | 6.5 | 98 | 151745 | 151870 |

**Verdict:** Iter5 median LCP differs from main by **−0.9892ms**; initial iter6 by **+1.8157ms**, dwarfed by observed variability. No supported significant LCP gain or regression. All three FAIL ≤1200ms minimum and ≤1000ms target. Initial graph gzip on iter6 **151870 bytes**, FAIL ≤105k/≤90k. CLS=0 accepted in this *Lighthouse scenario only*; Performance=98 FAIL ≥99. The *static import graph* budget is not a full browser HAR accounting for dynamic routes, workers or requests after load.

**Known limitation:** the Lighthouse 12.8.2 LHR `largest-contentful-paint-element` diagnostic snippet is **null** in the emitted summary for all thirty reports; do not claim LCP element identification from this audit. This is a Linux Lighthouse emulation, not a physical low-end phone. Need trace/request chain and full Lighthouse artifact to establish the 4 LCP subparts and browser rendering causality.

## Iteration 6 · five equal-session memory evidence (2026-11-05)

Run: [#42116205658](https://github.com/markofornoliak/tykora/actions/runs/42116205658), commit `2cfcc70ea492df74652a47440a3ebce313b6be74`. Workflow SUCCESS, 5 finished **identical 500-character custom-text sessions** on one Chromium tab with UI reset each time and forced GC after restart. Baseline and final gzip Chrome heap snapshots are uploaded; browser-reported nodes and listeners were stable.

| GC sample | Heap used bytes | DOM elements | JS event listeners | Detached DOM |
|---|---:|---:|---:|---:|
| Before | 3830460 | 513 | 204 | 0 |
| After #1 | 4626364 | 513 | 204 | 0 |
| After #2 | 4780232 | 513 | 204 | 0 |
| After #3 | 4869752 | 513 | 204 | 0 |
| After #4 | 4960752 | 513 | 204 | 0 |
| After #5 | 5026648 | 513 | 204 | 0 |

Ordinary-least-squares **+202104 bytes/session**, total **+1196188 bytes** (before vs after 5), but decelerating increments after the first session; likely initial runtime warm-up and/or accumulated references, not yet diagnosed. **Memory plateau ≈0 and leak absence are NOT proven.** No detached elements in these CDP samples and no increase in the 204 event listeners. To distinguish caches from retained sessions, compare snapshot retainers and repeat equal-session blocks without expanding session/IDB histories.

### Iter6 Phase P1 (conditional, NOT accepted)

[Candidate `ac695bcfe19b911f281d24010d9a7c94de9a430e`, matched Lighthouse x10](https://github.com/markofornoliak/tykora/actions/runs/42117102911) had main LCP median 1954.7715ms, iter5 1953.8973ms, iter6 candidate 917.3164ms (range 904.2743–955.3455ms). CLS=0, Perf=99. However TBT **118ms** on candidate versus 26ms on iter5, FAIL ≤100ms, and Firefox mobile navigation E2E FAILED on one run. Static eager JS graph 1322 bytes omits dynamic React bootstrap; **do not** compare that to 90k/105k full initial JS budget. The Phase0 harness now also computes interactive startup graph and browser JS network transfer. Re-run after navigation fix before deciding whether to keep P1.

### Correction of quantile arithmetic (raw Lighthouse evidence, 2026-11-05)

All earlier `ITER6_PHASE0_*` summaries used **nearest-rank p50**, the 5th ordered value when N=10, and incorrectly called this a mathematical median. The original raw reports are intact. Recomputing as the arithmetic mean of 5th and 6th observations, from the exact same [run #42119203944](https://github.com/markofornoliak/tykora/actions/runs/42119203944) **without discarding trials**, gives:

| Matched variant | Genuine N=10 LCP median | Genuine TBT median | Perf score median (before integer UI rounding) | CLS median | Full Home interactive JS gzip |
|---|---:|---:|---:|---:|---:|
| main `0a7d167b` | **1955.0003 ms** | 16.25 ms | 98 | 0 | 150491 bytes |
| iter5 `244c5060` | **1956.1089 ms** | 16.0 ms | 98 | 0 | 151870 bytes |
| iter6 `1c97ec25` | **946.2403 ms** | 88.5 ms | **99.5** (trial scores 99–100) | 0 | **152509 bytes** |

LCP ranges unchanged: main 1952.9447–1968.6435ms, iter5 1805.3122–1958.6371ms, iter6 904.5901–952.3355ms. The corrected interpolating percentile/median function is committed to the harness for all subsequent runs (R type 7). This is a **calculation correction**, not a change of workload or acceptance target. Performance 100 remains **NOT MET on all runs**, since some scored 99. LCP/TBT pass their numerical *simulated* targets; JS fails.

## Iteration 6 — verified Phase 0 at app SHA d5bd96ca (2026-11-05)

The same-runner N=10 baseline [workflow #42125543917](https://github.com/markofornoliak/tykora/actions/runs/42125543917) measured main `0a7d167b` LCP 1955.3563ms / initial interactive gzip 150491B; iter5 `244c5060` LCP 1955.27845ms / 151870B; iter6 `d5bd96ca` LCP **908.2175ms** / **152568B**. Exact median CLS=0 for all, iter6 TBT median **110.5ms**, Lighthouse Performance median **99**. All runs simulated 412×823, CPU×4, RTT 150ms, Lighthouse 12.8.2, N=10, identical GitHub runner. Raw JSON and per-chunk map are available in run artifact. **LCP goal passed in simulator; full summit did not pass (TBT, Performance and interactive JS budget fail).**

Skip-link race fix at `d5bd96ca`: full [quality #42125551475](https://github.com/markofornoliak/tykora/actions/runs/42125551475) passed 168 E2E / 30 existing skips and 9 offline PWA; supplementary 5-repeat Chromium focus [#42126592040](https://github.com/markofornoliak/tykora/actions/runs/42126592040) passed 45/45 tests at workflow-only commit `19a2ad7c`. No claim of exact physical keyboard-to-photon latency.

## Iteration 6 · November 6, 2026 native shell and unreported input/heap evidence

Source references, distinct SHAs and protocol must not be mixed.

- [LCP authenticity raw audit #42221093767](https://github.com/markofornoliak/tykora/actions/runs/42221093767) on `d5bd96ca`: genuine first-visit Home H1, no replacement after real hydration. LCP mathematical median **908.2175ms** for N10, representative #7 **908.2511ms**; raw insight TTFB4.5ms/renderDelay106.987ms, text image-loading stages N/A, not additive to simulated LCP. 8 filmstrip frames preserved.
- [Matched three-source after-native-shell trial #42222639704](https://github.com/markofornoliak/tykora/actions/runs/42222639704), **N10** same ubuntu-24.04, Lighthouse12.8.2 mobile412×823 CPU4 RTT150: main LCP **1954.85845ms**, TBT **4.75ms**, CLS0, full initial interactive JS **150491B gzip**; iter5 LCP **1957.04485ms**, TBT **4.75ms**, CLS0, JS **151870B**; native-shell `12ee74586164092f46e4b7da6cf272ae5ebd7428` LCP **906.5617ms**, TBT **10.5ms**, CLS0, Performance median100, full interactive JS **152790B**. This is historical candidate evidence, **not the current head**; full interactive budget FAIL 105k/90k.
- [Current structural full-quality #42224715967](https://github.com/markofornoliak/tykora/actions/runs/42224715967) at `9dedc20bd4b6551e35d18323d9affed84133e40b`: SUCCESS, 186 passing E2E / 30 intentionally skipped, **9 production offline tests passed**; independent identical SHA quality #42224724114 SUCCESS. Source skip/main preserved; native five-route x5 stress at preceding `effe80d8` **90/90 PASS** [#42223695365](https://github.com/markofornoliak/tykora/actions/runs/42223695365). Re-run after router repair remains required.
- [Measured 20-trial keydown/rAF proxy #42224396853](https://github.com/markofornoliak/tykora/actions/runs/42224396853) at `4b1c45ae`: accepted 500/500 every run. CPU×1 rAF1 p50 6.95ms, rAF1 p95 13.80ms, thresholded Event Timing p95 16ms; CPU×4 rAF1 p50 3.90ms, rAF1 p95 15.55ms, observed Event Timing p95 32ms. **Not compositor-paired presentation**; goal NOT CONFIRMED.
- [Five equal-session GC heap #42224715840](https://github.com/markofornoliak/tykora/actions/runs/42224715840) at `9dedc20b`: 3,734,948→4,899,772B after five identical sessions; +197,841.6B/session slope, 516 DOM nodes, 332 JS event listeners, detached=0 throughout. **Heap stabilization NOT MET**. See [ITER6-INPUT-MEMORY.md](ITER6-INPUT-MEMORY.md) for all rows and limitations.
- Matched 150-trial main/iter5/iter6×5-route source-head comparison is **running**, not yet verified. Deep-route numeric cells must remain blank until that workflow returns valid exact SHA/version/protocol data. No borrowed 5-trial estimates.
