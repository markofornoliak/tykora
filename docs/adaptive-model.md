# Adaptive 2.0 — evidence threshold (candidate, 2026-10-25)

Current incremental change: identify a *genuine weak skill* only after **20 or more observations**, when the **upper endpoint of a two-sided 95% Wilson binomial confidence interval** on observed accuracy falls below **0.95**. Missing or smaller samples are **unknown/exploration**, never automatically a weakness. The classification applies consistently to key, bigram and trigram. No historical skill records are migrated and no user data is erased.

Wilson with z=1.959963984540054, p=successes/n, denominator=1+z²/n, center=(p+z²/(2n))/denominator, margin=(z/denominator) sqrt(p(1-p)/n+z²/(4n²)); interval is [center−margin, center+margin] constrained to [0,1]. Example: 60 correct out of 100 yields approximately [0.5020,0.6906] and is a problem; 97/100 yields approximately [0.9155,0.9897] and is **not**.

Exercise selection separates exploration (unknown or sparse n-grams receive a controlled positive weight) from proven weakness (higher weight). The generator remains reproducible for a supplied seed, clock `nowMs`, model and content bank. Existing `ESTIMATOR_VERSION=tykora-beta-1` is unchanged because this change does not reinterpret persisted counters or rewrite them. The **new classification policy** is versioned by this document; further adaptive 2.0 work should introduce explicit `generatorVersion` and a holdout text protocol.

Remaining P0: use per-person latency baseline instead of absolute 250ms, sufficient duration for age-sensitive bigram distributions, stored spaced repetition with holdout text, unit statistical independence caveats, principled offline effectiveness evaluation (no improvement promise), and content lint. This file is not evidence for end-to-end educational effectiveness.
