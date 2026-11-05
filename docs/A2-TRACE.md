# TYKORA Iteration 5 — A2 measured CDP frame trace and memory audit

**Source:** [Actions run #42022735338](https://github.com/markofornoliak/tykora/actions/runs/42022735338), exact SHA `43045e5b8541b4f495810c3d1ebeb8660bd01050`, Chromium `156.0.8078.4` on GitHub-hosted Ubuntu, 1280×900, 500/500 keyboard.type inputs on 1,250 characters per run, CPU×1/×4 with 3 baseline runs each. CDP Tracing JSON and extracted per-run JSON uploaded as artifacts.

## Event Timing breakdown (p95, ms)

| CPU | Trial | Input delay | Processing time | Presentation delay | Overall p95 | Next-rAF p95 | Double-rAF upper-bound p95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| ×1 | 1 | 2.00 | 0.20 | 21.40 | 24.00 | 14.10 | 30.70 |
| ×1 | 2 | 2.10 | 0.20 | 21.50 | 24.00 | 14.10 | 30.80 |
| ×1 | 3 | 2.20 | 0.20 | 21.60 | 24.00 | 14.30 | 30.80 |
| ×4 | 1 | 8.50 | 0.80 | 23.80 | 32.00 | 9.40 | 26.80 |
| ×4 | 2 | 8.50 | 0.80 | 23.80 | 32.00 | 9.60 | 27.00 |
| ×4 | 3 | 8.10 | 0.70 | 23.70 | 32.00 | 9.40 | 26.80 |

Component p95s do not add algebraically to overall p95. Event Timing is **thresholded at ≥16ms and quantized**; observed 32ms exactly at CPU×4 is only an observed-bound pass, not independently verified <32ms input-to-present. Next-rAF is a pre-paint timestamp; double-rAF is an upper-bound proxy, neither a present-time oracle.

## Run-to-run dispersion (p95)

| Throttle | Event Timing values | Mean / population SD | Next-rAF p95 values | Mean / population SD |
|---|---|---|---|---|
| ×1 | 24.00, 24.00, 24.00 | 24.00 / 0.000 ms | 14.10, 14.10, 14.30 | 14.17 / 0.094 ms |
| ×4 | 32.00, 32.00, 32.00 | 32.00 / 0.000 ms | 9.40, 9.60, 9.40 | 9.47 / 0.094 ms |

Zero SD of rounded Event Timing p95 **does not** indicate noise-free user experience. No physical keyboard or Moto G Power data.

## Isolated CSS candidate experiments (one run each, CPU×4)

| Experiment | Observed Event Timing p95 | Two-rAF upper bound p95 | Interpretation |
|---|---:|---:|---|
| contain | 48 ms | 26.50 ms | regressed |
| content-visibility | 32 ms | 26.90 ms | no stable gain demonstrated |
| remove-effects | 32 ms | 26.80 ms | no stable gain demonstrated |
| transform-caret | 32 ms | 26.80 ms | no stable gain demonstrated |
| hide-keyboard | 32 ms | 26.70 ms | no stable gain demonstrated |

All candidate inputs 500/500 accepted. Only temporary benchmark-page CSS changes were made; results do not justify applying any unverified candidate to the product. Word-class-only drawing loses per-grapheme errors/caret, so was rejected without a functionally equivalent renderer. React input/IME cannot safely use passive/keydown-exclusive scoring; no per-key score-worker postMessage exists; completed IndexedDB saves already run after idle.

## Main-thread trace labels (not exclusive frame budgets)

CPU×4 trial 1 trace event totals across all recorded threads and events (categories can overlap):

| Label | Count | Sum of event durations | Maximum single event |
|---|---:|---:|---:|
| UpdateLayoutTree | 805 | 200.175 ms | 1.998 ms |
| Layout | 795 | 917.925 ms | 4.507 ms |
| Paint | 582 | 970.657 ms | 3.105 ms |
| PrePaint | 595 | 366.047 ms | 2.967 ms |
| RasterTask | 3923 | 350.437 ms | 0.539 ms |
| FireAnimationFrame | 1288 | 122.16 ms | 5.119 ms |
| EventDispatch | 3018 | 2630.04 ms | 12.075 ms |

A separate composite-layer duration was **not exposed** by this trace category set; do not fabricate a Composite count. The recorded Layout/Paint totals are **not per-key causal attribution** and overlap thread activity; the dominant observed Event Timing component remains presentation wait.

## Ten-minute heap test

Same [workflow #42022735338](https://github.com/markofornoliak/tykora/actions/runs/42022735338); Chrome CDP forced GC before each sample, continuing input to 4,000 graphemes.

| Minute | Used JS heap (MB) | DOM elements | Typed characters |
|---|---:|---:|---:|
| 0 | 3.902 | 514 | 0 |
| 1 | 4.494 | 516 | 400 |
| 2 | 4.633 | 516 | 800 |
| 3 | 4.905 | 516 | 1200 |
| 4 | 4.936 | 516 | 1600 |
| 5 | 4.799 | 516 | 2000 |
| 6 | 4.841 | 516 | 2400 |
| 7 | 4.887 | 516 | 2800 |
| 8 | 4.926 | 516 | 3200 |
| 9 | 4.973 | 516 | 3600 |
| 10 | 5.010 | 516 | 4000 |

Heap change 0→10 minutes: **+1.108 MB**; DOM elements **514→516**. Requirement 'no heap growth' is **not met literally**. This single continuous exercise naturally grows attempt history; it does not by itself establish an uncontrolled memory leak. A repeated reset/start/finish heap plateau test is still needed.

## Mobile LCP — candidate/rollback, five runs each

| SHA | Change | Simulated Lighthouse mobile LCP median | CLS | Interpretation |
|---|---|---:|---:|---|
| `38c25928` | Earlier v0.9 hot-path baseline | 1954.24 ms | 0 | already above target |
| `ab8e9d94` | Startup HTML skeleton + deferred Dexie | 2272.80 ms | 0 | regression; do not adopt static shell |
| `a963528d` | Shell reverted, deferred Dexie retained | 2272.68 ms | 0 | deferred-import candidate still above baseline |
| `94dd8e8f` | Design tokens and 24 themes | 2271.59 ms | 0 | target 1200ms / 1000ms not achieved |

Source runs: [baseline](https://github.com/markofornoliak/tykora/actions/runs/42019720034), [HTML shell](https://github.com/markofornoliak/tykora/actions/runs/42022662472), [rollback](https://github.com/markofornoliak/tykora/actions/runs/42023135714), [tokens](https://github.com/markofornoliak/tykora/actions/runs/42023695006). All are GitHub-hosted *simulated* Lighthouse mobile, 412×823, CPU×4, RTT 150ms, throughput ~1638kbps, not physical Moto G Power. Cross-run runner variance and concurrent changes limit causal inference.

## Vite asset inventory (B source build at 94dd8e8f)

Output from [quality run #42023703107](https://github.com/markofornoliak/tykora/actions/runs/42023703107). Worker has no gzip column in Vite output.

| Emitted asset | Minified (kB) | gzip (kB) |
|---|---:|---:|
| `score.worker-ByiOM38v.js` | 4.63 | not reported |
| `index-DUbtXdTL.css` | 32.18 | 7.60 |
| `download-DNmIrJ87.js` | 0.46 | 0.38 |
| `prompts-BZnD18hQ.js` | 2.50 | 1.29 |
| `Results-BIdUZchb.js` | 3.75 | 1.53 |
| `Themes-BegwGldD.js` | 3.82 | 1.62 |
| `Analytics-l6SniYoK.js` | 4.44 | 1.99 |
| `metrics-CFZRKRGX.js` | 4.75 | 2.10 |
| `Academy-C09360if.js` | 7.27 | 2.96 |
| `modes-D6wW1xAQ.js` | 10.03 | 4.79 |
| `Classroom-BAI8xxsd.js` | 12.08 | 4.48 |
| `curriculum-Dii6Svzp.js` | 13.12 | 5.90 |
| `Race-CmT6KTFd.js` | 15.91 | 5.96 |
| `Profile-CDMpJpZF.js` | 16.45 | 6.32 |
| `Practice-DWrk2h2G.js` | 24.88 | 10.15 |
| `repositories-CGgjdyH6.js` | 105.66 | 35.27 |
| `index-BOjMN4Fy.js` | 344.04 | 112.77 |

Initial entry `index-*.js` gzip **112.77kB**, vs previous hot-path build entry **150.37kB** (approximately **−25.0%** entry only). Deferred `repositories-*.js` costs **35.27kB gzip** when loaded. Hence the **complete initial network graph, post-hydration cost and −30% target are NOT verified**; don't add unrelated lazy chunks to initial bytes. Static shell removed after LCP regression. Self-hosted font subsets are absent, and worker is only instantiated at session finish.

## A2 final gate

- CPU×1 Event Timing p95 ≤16ms: **FAIL (24ms)**.
- CPU×4 Event Timing p95 ≤32ms: **observed boundary (32ms)**; not an exact next-paint guarantee.
- Simulated LCP ≤1.2s, then ≤1.0s: **FAIL (latest 2.27s)**.
- No 10-minute heap growth: **FAIL under strict literal criterion (+1.108MB)**; leak unconfirmed.
- Initial JS ≤baseline and −30%: **NOT CONFIRMED** for complete network dependency graph.
- Actual smartphone/VoiceOver/NVDA: **NOT TESTED**.
