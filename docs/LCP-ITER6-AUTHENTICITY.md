# Iteration 6 · Authenticity audit (in progress)

Evidence source: [Lighthouse 12.8.2 three-way N=10 #42125543917](https://github.com/markofornoliak/tykora/actions/runs/42125543917), application SHA `d5bd96ca5611d73c70298eda7c7fd369b8ff1315`.

The script `scripts/iter6-lcp-evidence.mjs` extracts the two trials bracketing the mathematical N=10 median and chooses the closest trial (tie: lower trial ID). It saves raw LCP insight, candidate nodes, all filmstrip frames and a filmstrip HTML with nearest-before/after timestamps. There is no substitution of the eager-entry-only JS size for the complete interactive JS budget.

**Status: pending execution and DOM identity verification.** Do not label LCP authentic until the element and visual evidence are inspected. If the element is a temporary placeholder, reject/roll back the optimization and update `docs/DECISIONS.md`.
