# TYKORA Iteration 6 — Step 1–3 evidence report

## Completed same-runner 3×5×N10 matrix with exact build attestation (pre-CLS/pre-Dexie source)

[Workflow #42279863002](https://github.com/markofornoliak/tykora/actions/runs/42279863002) **SUCCESS**. **This is the fully valid requested one-runner 15-cell format** (not the later optimized SHA): one ubuntu-24.04 runner, sequential `main` at `0a7d167bc320b503a03dfe1247c96687526ca28b`, `iter5` at `244c5060b37ba9d802dbad796b3ce1ed562f5339` and `iter6` at `d169d2efc264ecd31b15206d2c6193757fe0df79`. Same fixed Chrome and Lighthouse 12.8.2 simulated mobile 412×823 CPU×4 RTT150, 10 independent trials per source-route cell (150 raw LHR). For every source, exact SHA-256 digest of *every* generated HTML/CSS/JS asset was verified byte-for-byte against the active preview server (19 main files, 20 iter5, 21 iter6). Separate **150 cold browser contexts** captured actual requested JS *after actual route heading+networkidle*, including dynamically imported bootstrap, gzip sizes against that same built dist. All 150 contexts were checked for exact asset membership; no static-entry-only false reductions.

| Route | Source SHA | LCP p50 / p90 / max (ms) | TBT p50 / p90 / max (ms) | CLS p50 / max | Requested JS gzip (B, N10) |
|---|---|---:|---:|---:|---:|
| Home `/` | main `0a7d167b` | 1954.4 / 1968.4 / 1971.1 | 8.8 / 11.5 / 11.5 | 0.0 / 0.0 | 150,491 |
| Home `/` | iter5 `244c5060` | 1954.0 / 1981.8 / 1983.1 | 7.0 / 12.0 / 12.5 | 0.0 / 0.0 | 151,870 |
| Home `/` | iter6 `d169d2ef` | 939.0 / 940.1 / 942.1 | 39.0 / 45.3 / 47.5 | 0.0 / 0.0 | 152,969 |
| academy | main `0a7d167b` | 2335.1 / 2341.2 / 2344.1 | 13.5 / 19.1 / 33.0 | 0.03776 / 0.03776 | 160,570 |
| academy | iter5 `244c5060` | 2346.0 / 2349.5 / 2357.8 | 27.0 / 31.0 / 31.0 | 0.03698 / 0.03698 | 163,000 |
| academy | iter6 `d169d2ef` | 2318.3 / 2330.7 / 2339.1 | 22.0 / 25.5 / 26.0 | 0.03698 / 0.03698 | 166,255 |
| practice | main `0a7d167b` | 2336.2 / 2342.0 / 2345.5 | 13.0 / 14.6 / 15.0 | 0.03776 / 0.03776 | 171,992 |
| practice | iter5 `244c5060` | 2493.2 / 2522.5 / 2737.0 | 23.0 / 30.1 / 31.0 | 0.03698 / 0.03698 | 175,672 |
| practice | iter6 `d169d2ef` | 2472.1 / 2473.6 / 2475.3 | 24.3 / 26.7 / 28.5 | 0.03698 / 0.03698 | 178,930 |
| analytics | main `0a7d167b` | 2175.5 / 2179.1 / 2180.2 | 9.3 / 12.5 / 12.5 | 0.03776 / 0.03776 | 152,440 |
| analytics | iter5 `244c5060` | 2193.0 / 2198.6 / 2199.5 | 25.5 / 30.3 / 33.0 | 0.03698 / 0.03698 | 155,552 |
| analytics | iter6 `d169d2ef` | 2166.1 / 2169.7 / 2171.9 | 24.8 / 27.6 / 28.5 | 0.03698 / 0.03698 | 156,672 |
| profile | main `0a7d167b` | 2180.7 / 2185.8 / 2199.3 | 12.2 / 14.7 / 16.5 | 0.03776 / 0.03776 | 157,156 |
| profile | iter5 `244c5060` | 2187.6 / 2194.1 / 2194.4 | 23.5 / 27.0 / 27.0 | 0.03698 / 0.03698 | 159,911 |
| profile | iter6 `d169d2ef` | 2166.4 / 2170.7 / 2170.9 | 24.0 / 28.0 / 28.5 | 0.03698 / 0.03698 | 161,030 |

**Interpretation and limitations:** This source `d169d2ef` precedes accepted viewport-reserved Suspense loading, active-route preload and lazy Dexie. It proves authentic Home `/` LCP p50 939.1ms at this runner, unlike main/iter5 ~1954ms, but all four deep routes still fail LCP≤1.4s and CLS0. Deep JS grew vs iter5 on this snapshot on all routes; the later strict CI no-growth gate is **not** retroactively passed. Do not combine new Home 114,931B from source1455 with this old matrix in a single same-source table. Historical raw 17MB archive is attached to the workflow. Low TBT here reflects Lighthouse window behavior, not a proven compositor or fully hydrated interaction.

---

## 2026-11-06 · Controlled Step 1/2 acceptance and Step 3 experiment status

**Important version separation:** the historical five-*runner* 15-cell table below is superseded for determining the contradictory Home regression by the completed *single-runner* bisect. It remains historical evidence, **not the requested unified final 15-cell table**. Attested single-runner all-5-route N10/JS workflows [initial #42279863002](https://github.com/markofornoliak/tykora/actions/runs/42279863002) and post-optimization [#42283000598](https://github.com/markofornoliak/tykora/actions/runs/42283000598) were running when this paragraph was written; don't fill missing rows with the old different-SHA measurements.

### Step 1 — authentic Home verified (N=100; one runner, same URL, SHA256 bytes)

[Bisect #42279731534](https://github.com/markofornoliak/tykora/actions/runs/42279731534) **SUCCESS**: all 5 versions × both exact URLs `/`, `/#/` × 10 trials each, one ubuntu-24.04 runner Lighthouse 12.8.2 412×823 CPU×4 RTT150. Every one of the 21 built JS/CSS/HTML source artifacts matched the served file bytes using SHA-256, and every LCP is the real Home H1. There is **no runtime commit responsible for the historical 908→1954ms jump**. SHA `9dedc20b` and `f655e862` have byte-identical output assets. Same-URL Home p50/p90/max (ms):

| Source SHA | / LCP | / TBT | /#/ LCP | /#/ TBT |
|---|---|---|---|---|
| d5bd96ca | 932.61 / 1971.49 / 2109.19 | 6 / 55.95 / 492 | 904.87 / 929.47 / 931.91 | 5.75 / 8.15 / 9.5 |
| 12ee7458 | 905.53 / 929.96 / 932.51 | 6.25 / 8.60 / 9.5 | 916.32 / 931.94 / 935.87 | 6.50 / 7.55 / 8 |
| effe80d8 | 931.14 / 938.24 / 939.61 | 6.25 / 8.10 / 9 | 904.31 / 932.13 / 937.95 | 6.75 / 7.55 / 8 |
| 9dedc20b | 904.13 / 908.46 / 932.92 | 6.50 / 8.05 / 8.5 | 904.07 / 905.10 / 905.11 | 6 / 7.65 / 9 |
| f655e862 | 904.85 / 932.64 / 940.58 | 6 / 6.80 / 9.5 | 903.84 / 936.49 / 938.97 | 6 / 12.35 / 56 |

Latest post-Dexie `1455ca77a171fb245921cdc1c0af93dba3cf9ed4`: [URL parity #42282876306](https://github.com/markofornoliak/tykora/actions/runs/42282876306) **SUCCESS** (Home H1 all 30 trials; observed full Home interactive static requested chunk closure **114,931 gzip bytes**, above 105,000B target). Metrics p50/p90/max:

| Home URL | LCP ms | TBT ms | CLS p50/max |
|---|---|---|---|
| `/` | 933.36 / **1821.24** / **1935.59** | 0 / 9.60 / **91.5** | 0/0 |
| `/#/` | 920.25 / 939.75 / 940.84 | 0 / 3.50 / 3.5 | 0/0 |
| `/#/home` | 904.29 / 934.68 / 943.02 | 0.5 / 1.60 / 2.5 | 0/0 |

Low TBT does not prove the deferred bootstrap completed during the Lighthouse metric window or that the full app is interactive; full browser-requested JS remains separately measured. The `/` high LCP tail is retained, **not trimmed**. Independent earlier same-SHA61a / outlier TBT2362ms was associated with 1079/408ms bootstrap and506ms registerSW tasks; no causal attribution to SW or Dexie proven. Details/ADR in [DECISIONS.md](DECISIONS.md).

### Step 2 — pixel diff

All five historical failures inspected: three Practice were not-ready route screenshots (900px document vs correct 1430/1356/2045); two Contrast Dark desktop goldens pinned old sidebar ~200px below its correct top. After route-specific H1/content and font readiness, scroll-to-top, scrollY0 and sidebar geometry assertions, the reviewed new golden (run [#42281897793](https://github.com/markofornoliak/tykora/actions/runs/42281897793), SHA `32236f2d`) passes [#42282386276](https://github.com/markofornoliak/tykora/actions/runs/42282386276): **36/36 at unchanged 1.5%**. Recorded why a prior provisional reference also had stale scrollY204 and was replaced. No exclusions or tolerance increase.

### Step 3 — measured Academy CLS only; deep-route performance thresholds open

Before source adoption, [isolated full-gates same-SHA Academy N10 A/B #42232589205](https://github.com/markofornoliak/tykora/actions/runs/42232589205) demonstrated true viewport reserved Suspense fallback reduces Academy CLS p50/max **0.03698→0** without worsening p50 LCP (2354.64→2352.76ms). Fallback carried to source and true active route modulepreload added using Vite's emitted chunk manifest. Real content remains LCP. **No claim of five-route CLS0 or deep LCP≤1.4s/≤1.0s** until single-runner current-SHA raw LHR results; notably the standalone CLS experiment did *not* reach LCP targets.

### Outbound gates and safety

- New `iter6-one-runner-matrix.yml` produces exact served SHA256 byte attestations and 150 Lighthouse reports plus 150 browser JS-request contexts; `iter6-initial-js-budget.mjs` fails if any current route's actual requested initial gzip JS exceeds immutable iter5. Home goal ≤105KB and stretch ≤90KB separate and **not yet passed**.
- Selected isolated Dexie lazy settings import has proven old lab 152,844→114,792 bytes; latest source URL parity measures 114,931 bytes, still above 105,000. Other routes may still grow and correctly fail new CI regression gate.
- Manual owner accessibility scenarios recorded in [ITER6-MANUAL-A11Y-OWNER.md](ITER6-MANUAL-A11Y-OWNER.md) as **UNRUN**. [ITER6-INPUT-MEMORY.md](ITER6-INPUT-MEMORY.md) retains N10 input rAF proxy only (no compositor proof), and five-GC heap slope +197,841.6B/session (not stable), detached DOM0.
- Rejected Preact (larger TBT, no comparable Profiler), rejected deferred SW registration without measured LCP win, old corrupt goldens replaced with explicit reason. Draft PR #4 unmerged, main SHA fixed, no release tag or deploy.

---

**No launch / no merge / no tag.** This table is from completed [matched five-route x10 Lighthouse #42226462615](https://github.com/markofornoliak/tykora/actions/runs/42226462615), not the latest commit. Five independent GitHub Linux runners, one per route; **within each route** all three source variants were measured sequentially on that route's runner. Lighthouse 12.8.2 mobile 412×823, CPU×4, RTT150ms, N=10 each. Do not compare different routes as controlled same-machine observations.

| Route | Variant · SHA | LCP median ms | TBT median ms | CLS median | Full route interactive JS gzip |
|---|---|---:|---:|---:|---|
| Home `/#/` | main `0a7d167b` | 1955.53 | 28.75 | 0 | not yet verified per route |
| Home `/#/` | iter5 `244c5060` | 1954.63 | 23.75 | 0 | not yet verified per route |
| Home `/#/` | iter6 `f655e862` | 1954.47 | 23.50 | 0 | not yet verified per route |
| Academy | main `0a7d167b` | 2336.42 | 13.25 | 0.03776 | not yet verified per route |
| Academy | iter5 `244c5060` | 2333.40 | 12.00 | 0.03776 | not yet verified per route |
| Academy | iter6 `f655e862` | 2332.64 | 13.00 | 0.03776 | not yet verified per route |
| Practice | main `0a7d167b` | 2366.74 | 28.00 | 0.03776 | not yet verified per route |
| Practice | iter5 `244c5060` | 2372.05 | 30.75 | 0.03776 | not yet verified per route |
| Practice | iter6 `f655e862` | 2371.89 | 31.75 | 0.03776 | not yet verified per route |
| Analytics | main `0a7d167b` | 2180.27 | 11.50 | 0.03776 | not yet verified per route |
| Analytics | iter5 `244c5060` | 2177.59 | 10.50 | 0.03776 | not yet verified per route |
| Analytics | iter6 `f655e862` | 2176.12 | 9.50 | 0.03776 | not yet verified per route |
| Profile | main `0a7d167b` | 2215.83 | 29.50 | 0.03776 | not yet verified per route |
| Profile | iter5 `244c5060` | 2215.44 | 28.75 | 0.03776 | not yet verified per route |
| Profile | iter6 `f655e862` | 2214.31 | 29.00 | 0.03776 | not yet verified per route |

**JS caveat:** the successful parallel workflow's `requestedJsGzip` is **not** complete; on some deferred-bootstrap cases it counted only 125B/1415B because Lighthouse closed its request window before dynamic bootstrap. These false-low cells are deliberately omitted from this table. The independently verified React Home full bootstrap is about 152–153 kB gzip, **above both 105k and 90k targets**. A new `iter6-route-js-budget.yml` test records *requested* JS files and local gzip bytes on five fresh browser contexts for each of the five routes and three variants (75 normal page visits), after the actual route heading and network idle. That will support route-specific JS numbers, without pretending to count unrequested future-route chunks.

**LCP authenticity:** exact true Home headline, not placeholder. [Evidence](LCP-ITER6-AUTHENTICITY.md) and original 8-frame filmstrip from full LHR: `d5bd96ca`, LCP run7 908.2511ms (median 908.2175ms). Four **simulated** stages: TTFB454.12555, load delay0, load duration0, render delay454.12555ms. Raw trace 4.5ms/106.987ms is a different clock. [Raw workflow](https://github.com/markofornoliak/tykora/actions/runs/42221093767).

**Structural focus:** native skip-link and main outside replaceable React roots; five direct hash URLs × five repetitions × three browsers, **90/90** in [stress #42225392245](https://github.com/markofornoliak/tykora/actions/runs/42225392245). Full quality [#42227682843](https://github.com/markofornoliak/tykora/actions/runs/42227682843) passed on `2e12fe6c`, but not the *latest* post-report commit. The 30 default skips are enumerated in [ITER6-SKIPPED-E2E.md](ITER6-SKIPPED-E2E.md): 27 independently scheduled full-palette tests, three raw visual-capture cases. Firefox/WebKit full 24-theme and three-engine golden checks remain open.

**Outstanding:** matched `/` vs `/#/` vs `/#/home` route-parity workflow; latest-sha deep route LCP/CLS, full JS gzip, real-device keyboard-to-presentation, rising forced-GC heap, accessibility at all themes/zoom and proper visual-golden approval. Do **not** recommend merge.


### Follow-up same-source URL parity (not a substitute for the earlier three-source table)

[Independent URL-parity #42229177523](https://github.com/markofornoliak/tykora/actions/runs/42229177523) on **one exact iter6 SHA `61a27432`**, one runner, Lighthouse N10 each, found Home `/` **LCP 938.8115 / TBT46.25 / CLS0**, Home `/#/` **LCP938.4724 / TBT45 / CLS0**, and `/#/home` **LCP905.88075 / TBT46.5 / CLS0** (all ms except CLS). Each uses real H1, full interactive JS **152969B gzip**. `/` had a real extreme outlier LCP1954.35075/TBT2362ms; not excluded. Do not compare the earlier N10 `/#/` value ~1954ms on different source/runner as proof hash links are slower. Latest HEAD still requires remeasurement after any runtime change.

## Verified requested JS after route readiness (separate N=5 census)

[75-visit CI #42230674960](https://github.com/markofornoliak/tykora/actions/runs/42230674960) **SUCCESS**, fresh browser contexts, no omitted deferred React bootstrap. Source main `0a7d167bc320b503a03dfe1247c96687526ca28b`, iter5 `244c5060b37ba9d802dbad796b3ce1ed562f5339`, iter6 `5777982e64221aa4564a992889955927bcc9b233`. Five identical observed gzip sizes on each cell:

| Route | main (bytes) | iter5 (bytes) | iter6 (bytes) |
|---|---:|---:|---:|
| Home | 150491 | 151870 | **152969** |
| Academy | 160570 | 163000 | **166255** |
| Practice | 171992 | 175672 | **178930** |
| Analytics | 152440 | 155552 | **156672** |
| Profile | 157156 | 159911 | **161030** |

Numbers are gzipped local lengths of the JavaScript actually requested by the browser **after actual route H1 and network idle**, not transfer bytes or chunks required only for future interaction. Independent from the N10 Lighthouse trials (and at a different iter6 SHA), therefore cannot be represented as one synchronous experiment. The Home deferred `bootstrap` **was included**. All iter6 route results fail both 105000/90000-byte targets.

**Unchanged pinned pixel golden #42227299262 FAIL:** 31/36 pass and five fail; three Daylight Practice captures have real height mismatches. See [ITER6-VISUAL-FAILURES.md](ITER6-VISUAL-FAILURES.md), no golden/threshold changes.
