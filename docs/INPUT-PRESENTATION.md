# Input→presentation evidence — five runs per CPU

This workflow records the Chrome CDP EventLatency trace labels, inclusive Event Timing component p50/p95/p99, variance across five runs, 500 inputs per run, CPU×1 and ×4. Raw EventLatency events cannot be declared keypress→photon without correlation by interaction ID. The next-rAF anomaly (CPU×4 appears shorter than CPU×1) reflects rAF scheduling phase relative to input dispatch, not superior rendering on throttled CPUs. Existing CSS candidates are NOT retested at one sample; five-plus runs required to promote one.

**Current status:** workflow created, data pending CI. New acceptance requires actual browser evidence; do not call sub-16ms success based on rAF callback only.

## Actual ten-run CDP trace evidence — 2026-11-05

Source: https://github.com/markofornoliak/tykora/actions/runs/42039411859 ; SHA 2077808c61f11327de317398cf96987023b76af2 ; Chromium 156.0.8078.4; production Vite preview; 500 inputs per run; 1280×900; CDP CPU ×1 and ×4, 5 runs each.

| CPU | Trial | Observed events | p50 | p95 | p99 | InputDelay p95 | Processing p95 | Presentation p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ×1 | 1 | 294 | 16ms | 24ms | 24ms | 1.1ms | 0.2ms | 20.8ms |
| ×1 | 2 | 285 | 16ms | 24ms | 24ms | 1.1ms | 0.2ms | 20.0ms |
| ×1 | 3 | 286 | 16ms | 24ms | 24ms | 2.6ms | 0.2ms | 20.9ms |
| ×1 | 4 | 293 | 16ms | 24ms | 24ms | 1.2ms | 0.2ms | 20.7ms |
| ×1 | 5 | 294 | 16ms | 24ms | 24ms | 2.8ms | 0.2ms | 21.1ms |
| ×4 | 1 | 500 | 24ms | 32ms | 40ms | 5.3ms | 1.0ms | 29.9ms |
| ×4 | 2 | 500 | 24ms | 32ms | 32ms | 9.9ms | 1.0ms | 29.3ms |
| ×4 | 3 | 500 | 24ms | 32ms | 32ms | 10.7ms | 0.9ms | 29.3ms |
| ×4 | 4 | 500 | 24ms | 40ms | 48ms | 10.5ms | 1.0ms | 38.9ms |
| ×4 | 5 | 500 | 24ms | 32ms | 32ms | 10.0ms | 1.0ms | 29.2ms |

Event Timing sampling threshold >=16ms and 8ms quantization: CPU×1 event counts 294, 285, 286, 293, 294 rather than 500 per trial.
CPU×1 p95 mean 24.0ms SD 0.0ms; CPU×4 p95 mean 33.6ms SD 3.2ms.
CPU×1 p99 mean 24.0ms SD 0.0ms; CPU×4 p99 mean 36.8ms SD 6.4ms.
Trace labels EventLatency, EndActivateToSubmitCompositorFrame and SubmitCompositorFrameToPresentationCompositorFrame exist. Approximately 1000 EventLatency duration slices are observed for 500 input calls: not one-to-one. They are not reliably correlated with a specific keystroke/presentation; accurate input-to-photon remains UNCONFIRMED.
Acceptance: CPU×1 p95≤16ms FAIL (24ms in all five); CPU×4 p95≤32ms FAIL robustly (32,32,32,40,32ms). Do not loosen targets into a one/two-frame pass without correlation evidence.
Why earlier rAF CPU×4 appeared faster than ×1: next-rAF callback wait depends on where the input lands relative to the browser's frame boundary. New 5-run next-rAF p95 averages are CPU×1 13.38ms and CPU×4 15.08ms; earlier anomaly was not stable. rAF is not presentation.
