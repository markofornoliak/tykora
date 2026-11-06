# TYKORA · Iteration 6 — matched input proxy and equal-session heap evidence

## 500 character input, precise interpretation

Source `4b1c45ae34550b2de65b3c1a4b2a23da4a0f4109` ([paired-input CI #42224396853](https://github.com/markofornoliak/tykora/actions/runs/42224396853)). Chromium CDP 1280×900, CPU×1 and ×4, **10 independent runs each**, **500/500 correct characters every trial**. The script records a unique native keydown row with event.timestamp, first rAF, second rAF and after-rAF callback per key, and pairs thresholded PerformanceEventTiming records by ≤2ms startTime difference. All raw trials archived.

| Metric | CPU×1, median of trial summary | CPU×4, median of trial summary |
|---|---:|---:|
| First rAF delay, within-trial p50 | **6.95 ms** | **3.90 ms** |
| First rAF delay, within-trial p95 | **13.80 ms** | **15.55 ms** |
| Second rAF delay, within-trial p95 | **30.50 ms** | **32.25 ms** |
| Observed Event Timing p95 (thresholded ≥16ms) | **16 ms** | **32 ms** |
| Count of keydowns per trial | 500 | 500 |
| Matching Event Timing records per trial | 228–236 | 500 |

**Hard limitation:** rAF runs *before* rendering; these times are NOT keydown-to-presented-frame, not guaranteed display latency and cannot establish p50≤1 frame or p95≤2 frames on real GPU. Thresholded Event Timing excludes sub-16ms entries, so it cannot certify the true input p50. Requirements for compositor-paired EventLatency, confidence intervals and headed/GPU and owner-device remain **NOT CONFIRMED**. No artificial result was imputed.

## Five identical sessions, forced GC

Source `9dedc20bd4b6551e35d18323d9affed84133e40b` ([memory CI #42224715840](https://github.com/markofornoliak/tykora/actions/runs/42224715840), SUCCESS). Five completed 500-character custom sessions in one document with input resets and forced CDP GC after each. Raw summary, beginning/end compressed heap snapshots archived.

| GC checkpoint | JS heap (bytes) | DOM nodes | JS event listeners | Detached DOM |
|---|---:|---:|---:|---:|
| Baseline | 3,734,948 | 516 | 332 | 0 |
| Session 1 | 4,497,696 | 516 | 332 | 0 |
| Session 2 | 4,646,484 | 516 | 332 | 0 |
| Session 3 | 4,754,288 | 516 | 332 | 0 |
| Session 4 | 4,828,540 | 516 | 332 | 0 |
| Session 5 | 4,899,772 | 516 | 332 | 0 |

Regression slope (ordinary least squares): **+197,841.6 bytes/session**; endpoint growth **+1,164,824 bytes**. Window/document listeners stayed 10/301 across samples. Heap levels rise with decreasing increments; no progressive DOM/listener growth. **Heap-slope≈0 NOT MET** and leak **NOT diagnosed**: warm-up caches, persisted session records and retained references must be distinguished by heap-snapshot retainer analysis and longer repeated blocks. Headless CI is not physical-device memory proof.
