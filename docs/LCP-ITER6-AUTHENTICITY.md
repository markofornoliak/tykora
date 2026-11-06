# TYKORA · Iteration 6 — authentic Home LCP audit (verified on recorded candidate)

## Exact source and median run

- Real application source for the raw Lighthouse artifact: `d5bd96ca5611d73c70298eda7c7fd369b8ff1315` (not the later native-shell SHA).
- [Raw 30-run three-way Lighthouse set](https://github.com/markofornoliak/tykora/actions/runs/42125543917) and [median filmstrip extraction #42221093767](https://github.com/markofornoliak/tykora/actions/runs/42221093767), both successful. N=10 per source, Lighthouse 12.8.2 simulated mobile 412×823, CPU×4, RTT 150ms, ubuntu-24.04.
- Exact mathematical N=10 LCP median: **908.2175 ms**. Ordered middle samples were run #9 **908.1839 ms** and run #7 **908.2511 ms**; run #7 was chosen as the representative (0.0336ms from median).
- LCP candidate identified in raw `largest-contentful-paint-element` and `lcp-breakdown-insight`: `main#main-content > section > header.pagehead > h1`; **«Каждое нажатие — шаг вперёд.»**, actual substantive Home title, rect left 16/top119,width380,height79.
- Filmstrip eight **real JPEG frames** at 375, 750, 1125, 1500, 1875, 2250, 2625, 3000ms. Nearest before/after LCP are 750 and 1125ms. All eight saved filmstrip screenshots were bit-identical and already show full Home content: heading, CTA, daily goal, navigation. The frame is a sampled screenshot, not a pixel-precise trace at LCP time. Original images and `filmstrip.html` are attached to the audit workflow, not synthesized from an image generator.
- The source `index.html` contains the full meaningful Home HTML, not an ad-hoc Lighthouse-only placeholder. `e2e/iter6-lcp-real-content.spec.ts` blocks the genuine module then verifies `===` identity of its H1 before/after React hydration, meaningful CTA, and observes LCP candidate. Both cross-browser quality runs [#42221669820](https://github.com/markofornoliak/tykora/actions/runs/42221669820) and [#42221662881](https://github.com/markofornoliak/tykora/actions/runs/42221662881) **SUCCESS**. Subsequent native-shell `e2e/iter6-native-focus.spec.ts` additionally requires exact same Home H1 identity through two-root hydration.

## Four LCP stage fields, no fabricated additivity

| Phase | Extracted value | Interpretation |
|---|---:|---|
| Time to first byte | **4.5 ms** | Raw `lcp-breakdown-insight` |
| Resource load delay | **N/A (0 resource ms)** | Text H1 does not fetch an image resource |
| Resource load duration | **N/A (0 resource ms)** | Text H1 does not fetch an image resource |
| Element render delay | **106.987 ms** | Raw `lcp-breakdown-insight` |

**Timing caveat:** The raw breakdown sum (111.487ms) is not the 908.2175ms **simulated Lighthouse** LCP. Lighthouse's simulated network/CPU metric and raw trace-stage breakdown are not the same clock/domain. Reporting the former as the sum would be misleading. No fake stage estimate has been inserted to close the difference.

**Acceptance boundary:** The title and filmstrip are authentic on the recorded source SHA. This does NOT automatically certify the latest candidate's LCP or real-device paint; the fixed native shell must keep its own median and H1 identity gates green after every runtime change. If a future measurement reveals a transient placeholder or replaced H1, reject that optimization and record a rollback in DECISIONS.md.
