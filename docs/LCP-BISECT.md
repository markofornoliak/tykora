# Iteration 5 — matched LCP commit bisect

Eight immutable commit checkpoints from `3ef431f`/`75663d2` to `0ded9a7`, five Lighthouse 12.8.2 runs each. On one consistent GitHub Actions Ubuntu configuration, fixed simulated mobile profile, same base path/preview. Each run logs LCP element, LCP median, standard deviation, raw Lighthouse JSON, entry JS exact filename and gzip byte size. Results **pending** until all jobs complete. This is a read-only checkout comparison: no deployment or release.

## Completed five-run bisect and isolated cause

1. [Eight-commit controlled run #42035312314](https://github.com/markofornoliak/tykora/actions/runs/42035312314): `fece018` LCP median 1953.75ms, `ab8e9d9` 2275.51ms, `0ded9a7` 2278.72ms. Each value is a median of five Lighthouse 12.8.2 simulated mobile observations with separate per-run SD and artifacts. This isolates the first affected commit to `ab8e9d9`.
2. [Eight single-file controlled reversion variants #42036088912](https://github.com/markofornoliak/tykora/actions/runs/42036088912), five independent Lighthouse mobile observations per variant:
   - ab8e unchanged **2273.86ms**
   - old index.html only **2269.48ms**
   - old Layout only **2270.25ms**
   - old Home only **1954.92ms** (but entry JavaScript returns to 150.36kB gzip)
   - old uiStore only **1955.88ms** (entry JavaScript returns to 150.46kB gzip)
   - old Layout + store **1955.64ms**
   - old Layout + Home **1953.56ms**
   - all four old files **1955.03ms**

**Root-cause boundary:** the combination of both lazy persistence import paths (Home and uiStore) changes first-load LCP behavior; restoring either old import graph removes ~320ms of measured LCP delay. This finding is a causal code-isolation comparison, **not** proof of exact renderer wait time. Static HTML shell is *not* the primary culprit. Additional LCP element inspection is still required.

**Chosen repair candidate:** reinstate eager facade import in `uiStore`; retain the after-first-paint `Layout` call to load settings and existing async Home data hydration. This avoids migration and removes the measured cold-start bundle structure associated with the regression. It may raise initial JS gzip from ~112.77kB back toward ~150.4kB and **does not meet the ≤105kB entry budget**; that trade-off is explicitly flagged. Candidate must be measured again on the latest SHA.

## Idle Service Worker registration A/B (rejected)

Raw Lighthouse report at current repair baseline showed Home `<h1>` as LCP element, TTFB 452.5ms, render delay 1502.5ms, and a modelled `registerSW.js` blocking opportunity ~301ms. Deferring registration until load/idle yielded LCP median **1952.95ms** over five Lighthouse 12.8.2 runs at SHA `9cc89e0d` (Actions #42079644192), versus approximately 1954ms pre-change. This does not meet target ≤1200ms and the difference is within run variability. Restored VitePWA's original bootstrap rather than keep a semantic change without measured LCP benefit.
