# TYKORA Iteration 6 — Step 1–3 interim evidence table
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
