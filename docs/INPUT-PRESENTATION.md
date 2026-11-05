# Input→presentation evidence — five runs per CPU

This workflow records the Chrome CDP EventLatency trace labels, inclusive Event Timing component p50/p95/p99, variance across five runs, 500 inputs per run, CPU×1 and ×4. Raw EventLatency events cannot be declared keypress→photon without correlation by interaction ID. The next-rAF anomaly (CPU×4 appears shorter than CPU×1) reflects rAF scheduling phase relative to input dispatch, not superior rendering on throttled CPUs. Existing CSS candidates are NOT retested at one sample; five-plus runs required to promote one.

**Current status:** workflow created, data pending CI. New acceptance requires actual browser evidence; do not call sub-16ms success based on rAF callback only.
