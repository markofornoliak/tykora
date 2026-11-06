# Iteration 6 · URL-dependent Home LCP parity gate

[Three-variant Lighthouse x10 on five routes #42226462615](https://github.com/markofornoliak/tykora/actions/runs/42226462615) measured Home `/#/` LCP ~1954ms; [the earlier 30-run original experiment #42125543917](https://github.com/markofornoliak/tykora/actions/runs/42125543917) measured `/` ~908ms on iter6. Both raw reports identify substantive Home H1. **Different source SHA and URL make direct comparison invalid.**

This evidence gate compares exact `/`, `/#/`, `/#/home` on one fixed SHA and runner, Lighthouse 12.8.2 mobile 412×823, CPU×4, RTT150, N=10 per URL. Original screenshots and simulated four-stage LCP data are archived, with separate raw-trace stage annotations that must not be algebraically added to the simulated LCP.

**Until the same-source workflow succeeds, the portable universal LCP ≤1s claim is NOT CONFIRMED**. Neither the early 908ms nor later 1954ms is a pretext to serve reduced content to Lighthouse. The real H1 and stable node identity remain mandated by unchanged browser tests.

JS acceptance must count *entry + deferred React bootstrap + SW registration*. The Lighthouse request subset can omit the bootstrap if it loads after the snapshot and cannot be called complete initial JS. Current default React exceeds 105KB gzip by the versioned chunk ledger.
