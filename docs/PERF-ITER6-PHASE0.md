# Iteration 6 · matched Phase 0 baseline (pending)

This is the **measurement protocol**, not a claimed result. The original iteration 5 ledger is `docs/PERF-v0.10-BASELINE.md`; its historical data must not be relabelled as current iteration 6 measurements.

| Branch | Exact source SHA | LCP median ×10 | LCP range | CLS | TBT | Performance | Initial JS gzip | Status |
|---|---|---|---|---|---|---|---|---|
| main | `0a7d167bc320b503a03dfe1247c96687526ca28b` | — | — | — | — | — | — | Not measured |
| iter5 | `244c5060b37ba9d802dbad796b3ce1ed562f5339` | — | — | — | — | — | — | Not measured |
| iter6 | exact CI `GITHUB_SHA` | — | — | — | — | — | — | Not measured |

## Fixed environment

- One `ubuntu-24.04` GitHub Actions runner, sequential builds and runs for all three variants (not three separate runner machines).
- Node 24; package-lock respected with `npm ci`; production build via `VITE_BASE_PATH=/ npm run build` and local Vite preview on `127.0.0.1:4174`.
- Lighthouse 12.8.2, 412×823 simulated mobile, CPU slowdown ×4, RTT 150ms; automation **asserts** those settings against raw LHR config.
- Ten independent Lighthouse invocations per variant, raw LHR JSON, version, Chrome host user agent, request waterfall, available LCP element snippet, median, 5th/95th percentiles and observed range.
- Gzip JS budget includes entry scripts, modulepreloads and transitively *static* JS imports. Dynamic imports are excluded until routed to; the manifest and per-file map accompany the number. This is a reproducible local bundle budget rather than actual gzip transfer bytes of GitHub Pages.
- No physical Moto G Power, no headed GPU and no 500-input presentation trace in this workflow; those are separate acceptance measurements.

**No regression verdict until** workflow succeeds, 30 raw runs exist, and the two version/config equality gates pass. CI quality run in `checks.yml` is separate.
