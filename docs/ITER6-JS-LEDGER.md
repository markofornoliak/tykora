# TYKORA · Iteration 6 — complete Vite JS chunk inventory and source attribution

## Verified lab-only build

- Source SHA `c12d8a97bdd528e5b3229fa3512f72965cb57432` (app runtime identical to `9dedc20b`; intervening changes only workflow/scripts/docs).
- [Source-map attribution CI #42227143157](https://github.com/markofornoliak/tykora/actions/runs/42227143157): SUCCESS. Build uses `npx vite build --sourcemap` in GitHub Actions **only**, never production. Raw exact file gzip bytes and module source paths/source sizes retained in attached JSON `iter6-js-module-ledger-no-source-code`. No third-party source code or source maps published to the app.
- The graph below reports **all 19 generated JS files**, including Workbox, service worker, lazy routes and helper chunks. Source content labels are grounded in lab source maps; labels do not imply every module in the group executes on initial Home.
- **Interactive Home startup bundle:** `bootstrap` 151,361 gzip + eager `index` 1,559 gzip + `registerSW.js` 125 gzip = **153,045 bytes** for this source-map build (source-map generation changes emitted minification metadata and hash). Compare baseline production build **152,790 B** at `12ee7458` instead of presenting the lab bytes as production transferred bytes. The 1,559 B eager entry alone is **NOT** the full initial interactive cost.

| Actual emitted JS file | gzip bytes | Content group from source map | Home interactive requirement |
|---|---:|---|---|
| `assets/bootstrap-avq7YVCP.js` | 151,361 | React DOM, React Router, Dexie, i18next, React, 27 TYKORA modules | Yes |
| `assets/Practice-BAlX_3FX.js` | 11,505 | Practice feature, typing UI, 10 local modules | No (lazy route) |
| `assets/curriculum-BWxnXQoN.js` | 8,306 | Curriculum and lessons, 2 local modules | No |
| `assets/Profile-CacOty6j.js` | 7,572 | Profile, 4 local modules | No |
| `assets/Race-COyBc9iB.js` | 7,181 | Race, 3 local modules | No |
| `assets/Classroom-C6qK-ey1.js` | 5,466 | Classroom, 2 local modules | No |
| `workbox-2178cfdb.js` | 5,205 | Generated Workbox service-worker runtime | No (service worker) |
| `assets/modes-DKmgdJG8.js` | 4,827 | Typing modes, 2 local modules | No |
| `assets/Results-BdUrClZz.js` | 3,668 | Results UI, 1 local module | No |
| `assets/Academy-5N72-cZg.js` | 3,621 | Academy UI, 1 local module | No |
| `assets/Analytics-Er8mk1oe.js` | 3,601 | Analytics UI, 2 local modules | No |
| `assets/score.worker-BjpljPGw.js` | 2,165 | Scoring worker, 6 local modules | No (worker) |
| `assets/Themes-BYd2T20I.js` | 2,097 | Theme UI, 1 local module | No |
| `assets/index-BHsSU4Y5.js` | 1,559 | Initial bootstrap scheduler and static CSS imports, 1 local module | Yes |
| `assets/prompts-DNfuXa5B.js` | 1,337 | Training prompts, 1 local module | No |
| `sw.js` | 1,150 | Generated service worker entry | No (worker) |
| `assets/download-46PJoffW.js` | 419 | Download helper, 1 local module | No |
| `assets/useBilingual-CUZiqAvO.js` | 178 | Localization helper, 1 local module | No |
| `registerSW.js` | 125 | Service-worker registration stub | Yes, eager ref |

## Why bootstrap is large (module attribution, not fabricated compressed contributions)

Source maps show bootstrap contains **52 original modules**. Largest source-size groupings (raw original bytes, **not gzip contribution**): `react-dom` 635,226 B across four sources; `react-router` 375,607 B in one source; `dexie` 276,271 B across two; `i18next` 82,840 B; TYKORA own 69,356 B across 27; React 19,412 B across four. These source byte sums **cannot be used as a partition of the 151,361 gzip bytes** because Vite minifies/tree-shakes and gzip compresses across module boundaries.

This is strong evidence for the next **individual** experiments: move persistence out of the Home hydration dependency closure, then consider a compatible runtime reduction under full a11y/hydration/scoring tests. Splitting files without removing total requested code is not falsely counted as a JS budget win.

## Rejected opt-in Preact lab experiment on native shell

[Matched React vs Preact ×10 #42226025567](https://github.com/markofornoliak/tykora/actions/runs/42226025567) at `f8dd74790a4bd2b49973406cfe98caa800833a0d`. Same ubuntu-24.04 runner, Lighthouse 12.8.2 mobile with matched settings:

| Metric | React current | Experimental Preact |
|---|---:|---:|
| Full interactive JS gzip | **152,969 B** | **92,899 B** |
| LCP median, N10 | 947.646 ms | 940.802 ms |
| TBT median | **84.25 ms** | **99.5 ms** |
| Performance median | **100** | **99** |

Preact cut JS by **60,070 B (39.27%)** and passed **186 cross-browser E2E / 30 planned skips + 9 offline PWA**. However it *regressed* TBT by **15.25ms** and Performance median by 1 point in this matched simulation, and its compatibility shim implements React Profiler as a transparent child passthrough: **Profiler data are not comparable**. Therefore it is **rejected for production at this step**; it remains opt-in CI-only, no dependency change, no deploy. A byte budget ≤105,000 B in experimental Preact is not permission to ignore TBT/performance or instrumentation regressions.

## Status

- Production React Home full interactive JS ≤105,000 B: **FAIL**.
- Full interactive JS ≤90,000 B: **FAIL**.
- No external startup requests and offline remain separately protected by E2E; bundle audit does not replace them.
- All source attribution data are observed; none of the modules' individual compressed contribution has been estimated from raw source bytes.
