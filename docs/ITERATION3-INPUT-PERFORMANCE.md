# TYKORA iteration 3 — typed-input benchmark and controlled comparison
Date: 2026-10-25. **Both source and results are independently auditable GitHub Actions records.** No claim that tests approximate a physical device.

## Protocol
- Script: `scripts/benchmark-input.mjs`. GitHub Actions Ubuntu `ubuntu-latest`; Playwright Chromium **156.0.8078.4**, Vite built production app, Chrome DevTools Protocol `Emulation.setCPUThrottlingRate({rate:4})`, viewport 1280×900.
- Set a **680-character original custom text**, then call real `page.keyboard.type` for **500 characters** with requested 1ms delay; verify exact textarea value and observed native `input` event count, fail on input loss.
- `PerformanceObserver({type:'event', durationThreshold:16})`: 95th percentile of keydown `PerformanceEventTiming.duration` across eligible interactionIds. Chromium quantizes these timings and censors below the threshold. This is **NOT exact unrounded input-to-paint time**.
- Independent `Event.timeStamp` → two consecutive `requestAnimationFrame` upper-bound p95 (not pixel presentation) measured in page performance clock.
- Strict opt-in counters at `Practice()` and `TargetDisplay()` invocation sites, reset before the input sequence. These are **render invocations, not React Profiler commit counts**.
- Data captured as JSON in workflow artifacts; passing baseline and optimized sessions did not lose input.

## Recorded observations

| Metric | Baseline | Intermediate DOM compression | RAF-coalesced input |
|:---|---:|---:|---:|
| SHA | `a4877ffa8` | `46c458f1d` | `9d2f5897b` |
| Chromium Event Timing p95 | 32 ms | 32 ms | 32 ms |
| Two-rAF time upper-bound p95 | 33.6 ms | 33 ms | 27.3 ms |
| Practice render invocations | 1,004 | 1,013 | 506 |
| Practice invocations / input | 2.008 | 2.026 | 1.012 |
| TargetDisplay render invocations | 500 | 500 | 275 |
| TargetDisplay invocations / input | 1.000 | 1.000 | 0.550 |
| Input characters accepted | 500/500 | 500/500 | 500/500 |

Evidence:
- [Baseline raw report / logs 40208523859](https://github.com/markofornoliak/tykora/actions/runs/40208523859).
- [Intermediate report 40208712391](https://github.com/markofornoliak/tykora/actions/runs/40208712391).
- [RAF coalescing after report 40208877647](https://github.com/markofornoliak/tykora/actions/runs/40208877647).

## Interpretation and limits
- Practice render invocations per input decreased **49.6%** ((2.008−1.012)/2.008). DOM character window was further compacted by grouping contiguous status runs, then per-input React state publishing was coalesced per animation frame. Native textarea remains the authoritative instantaneous input; engine retains every character.
- **No measurable improvement to Chromium Event Timing p95 was observed** in these single runs (32 ms before and after). The two-rAF proxy fell 6.3 ms but is not definitive real paint timing. Run-to-run CPU jitter is uncontrolled; repeat runs on stable hardware are still required.
- The method is not a manual NVDA/IME test, nor an Input-to-Next-Paint field INP percentile measured from genuine hardware on macOS. The 4× factor is synthetic; user device latency may differ. CI does not yet meet a verified p95 <16ms threshold.
