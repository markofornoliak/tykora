# Iteration 6 · URL-dependent Home LCP parity gate

[Three-variant Lighthouse x10 on five routes #42226462615](https://github.com/markofornoliak/tykora/actions/runs/42226462615) measured Home `/#/` LCP ~1954ms; [the earlier 30-run original experiment #42125543917](https://github.com/markofornoliak/tykora/actions/runs/42125543917) measured `/` ~908ms on iter6. Both raw reports identify substantive Home H1. **Different source SHA and URL make direct comparison invalid.**

This evidence gate compares exact `/`, `/#/`, `/#/home` on one fixed SHA and runner, Lighthouse 12.8.2 mobile 412×823, CPU×4, RTT150, N=10 per URL. Original screenshots and simulated four-stage LCP data are archived, with separate raw-trace stage annotations that must not be algebraically added to the simulated LCP.

**Until the same-source workflow succeeds, the portable universal LCP ≤1s claim is NOT CONFIRMED**. Neither the early 908ms nor later 1954ms is a pretext to serve reduced content to Lighthouse. The real H1 and stable node identity remain mandated by unchanged browser tests.

JS acceptance must count *entry + deferred React bootstrap + SW registration*. The Lighthouse request subset can omit the bootstrap if it loads after the snapshot and cannot be called complete initial JS. Current default React exceeds 105KB gzip by the versioned chunk ledger.



## 2026-11-06 · Same-source Home URL parity SUCCESS (30 raw Lighthouse trials)

- [URL-parity CI #42229177523](https://github.com/markofornoliak/tykora/actions/runs/42229177523) **SUCCESS**, immutable SHA `61a2743222f1f2958da34857dceefff817753d0e`; one Ubuntu runner, Lighthouse 12.8.2 mobile 412×823, CPU×4, RTT150, ten independent runs each on `/`, `/#/`, `/#/home`. All 30 runs identify real Home H1 and CLS=0.
- `/`: LCP **938.8115 ms** median (range **904.6234–1954.35075**), TBT **46.25 ms** median (range **37.5–2362**), one severe anomalous trial (#1); `/#/`: LCP **938.4724 ms** (902.7449–954.071), TBT **45 ms** (37–57); `/#/home`: LCP **905.88075 ms** (902.3316–948.6308), TBT **46.5 ms** (37–49). Each uses the same genuine H1 and full Home static content.
- H1 is not replaced by lightweight placeholder. Four **simulated** LCP stages on representative `/#/` trial #9: TTFB **451.4029**, load delay 0, load duration 0, render delay **486.4029ms**; sum 937.8058ms. Raw trace phases **3.224** / **87.874ms** are different clocks and are not added to simulated LCP.
- Full Home startup JS gzip `bootstrap-1XejNZPU.js` + `index-BU0dNfE0.js` + `registerSW.js`: **152,969 bytes**. JS budget <=105kB / <=90kB remains FAIL. The earlier 1954ms `/#/` median at a *different* runner and SHA cannot be attributed to the hash route alone.
- Do **not** delete the severe `/` outlier. Inspecting raw trial #1 showed huge main-thread work, including Lighthouse long tasks attributed to bootstrap **1079ms, 408ms** and `registerSW.js` **506ms**. A median under 50ms does not demonstrate tail latency stability; CPU/task-tail investigation remains OPEN. Source LHR artifacts include original filmstrip JPEGs for each near-median trial.

**Current disposition:** The same-source same-runner hash URL is **not intrinsically ~1s slower**. We cannot claim physical-device or cross-runner universal <=1000ms. Also one 2362ms TBT trial remains a performance incident; include it in variability and investigate rather than trim. Full interactive JS still >105kB. The candidate runtime was not modified by this audit.
