# Iteration 6 · matched Phase 0 baseline (pending)

This protocol has now been **executed and verified** in [run #42114840487](https://github.com/markofornoliak/tykora/actions/runs/42114840487). The original iteration 5 ledger is `docs/PERF-v0.10-BASELINE.md`; its historical data must not be relabelled as current iteration 6 measurements.

| Branch | Exact source SHA | LCP median ×10 | LCP range | CLS | TBT | Performance | Initial JS gzip | Status |
|---|---|---|---|---|---|---|---|---|
| main | `0a7d167bc320b503a03dfe1247c96687526ca28b` | 1953.9814 ms | 1952.7636–1957.1257 ms | 0 | 7.5 ms | 98 | 150491 bytes | Measured ×10 |
| iter5 | `244c5060b37ba9d802dbad796b3ce1ed562f5339` | 1952.9922 ms | 1805.2779–1958.2916 ms | 0 | 4.5 ms | 98 | 151870 bytes | Measured ×10 |
| iter6 initial | `a2b200a7053abf5770cf1fd99823899e21fa91d3` | 1955.7971 ms | 1804.9328–1983.0601 ms | 0 | 6.5 ms | 98 | 151870 bytes | Measured ×10 |

## Fixed environment

- One `ubuntu-24.04` GitHub Actions runner, sequential builds and runs for all three variants (not three separate runner machines).
- Node 24; package-lock respected with `npm ci`; production build via `VITE_BASE_PATH=/ npm run build` and local Vite preview on `127.0.0.1:4174`.
- Lighthouse 12.8.2, 412×823 simulated mobile, CPU slowdown ×4, RTT 150ms; automation **asserts** those settings against raw LHR config.
- Ten independent Lighthouse invocations per variant, raw LHR JSON, version, Chrome host user agent, request waterfall, available LCP element snippet, median, 5th/95th percentiles and observed range.
- Gzip JS budget includes entry scripts, modulepreloads and transitively *static* JS imports. Dynamic imports are excluded until routed to; the manifest and per-file map accompany the number. This is a reproducible local bundle budget rather than actual gzip transfer bytes of GitHub Pages.
- No physical Moto G Power, no headed GPU and no 500-input presentation trace in this workflow; those are separate acceptance measurements.

**Verdict (verified):** workflow PASS with 30 raw results and all browser/config equality gates. No demonstrated material LCP regression relative to main, but 1s/1.2s LCP and 90k/105k gzip budgets remain unmet. Full details are appended to `docs/PERF-v0.10-BASELINE.md`. CI quality workflow is separate.


### Correction of quantile arithmetic (raw Lighthouse evidence, 2026-11-05)

All earlier `ITER6_PHASE0_*` summaries used **nearest-rank p50**, the 5th ordered value when N=10, and incorrectly called this a mathematical median. The original raw reports are intact. Recomputing as the arithmetic mean of 5th and 6th observations, from the exact same [run #42119203944](https://github.com/markofornoliak/tykora/actions/runs/42119203944) **without discarding trials**, gives:

| Matched variant | Genuine N=10 LCP median | Genuine TBT median | Perf score median (before integer UI rounding) | CLS median | Full Home interactive JS gzip |
|---|---:|---:|---:|---:|---:|
| main `0a7d167b` | **1955.0003 ms** | 16.25 ms | 98 | 0 | 150491 bytes |
| iter5 `244c5060` | **1956.1089 ms** | 16.0 ms | 98 | 0 | 151870 bytes |
| iter6 `1c97ec25` | **946.2403 ms** | 88.5 ms | **99.5** (trial scores 99–100) | 0 | **152509 bytes** |

LCP ranges unchanged: main 1952.9447–1968.6435ms, iter5 1805.3122–1958.6371ms, iter6 904.5901–952.3355ms. The corrected interpolating percentile/median function is committed to the harness for all subsequent runs (R type 7). This is a **calculation correction**, not a change of workload or acceptance target. Performance 100 remains **NOT MET on all runs**, since some scored 99. LCP/TBT pass their numerical *simulated* targets; JS fails.
