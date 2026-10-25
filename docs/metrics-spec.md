# Metrics contract — TYKORA scoring v2 (candidate)

Date: 2026-10-25. **Candidate implementation; not yet connected to the application.** Historical `tykora-1.0.0` session summaries remain stored verbatim. No automatic rescore of stored sessions.

Definitions (grapheme = Unicode extended grapheme cluster, one word = five graphemes):

| Field | Exact rule | Unit / insufficient data |
|---|---|---|
| rawWpm | (number of all accepted grapheme attempts / 5) / active minutes | WPM; null if active <3 s or attempts <10 |
| netWpm | (number of correct graphemes in final alignment / 5) / active minutes | WPM; same null criteria, bounded by raw |
| cpm | number of correct graphemes in final alignment / active minutes | chars/min; same null criteria |
| accuracy | correct attempts / all attempts | fraction [0,1], empty = 0 |
| finalAccuracy | correct final alignment / target grapheme count | fraction [0,1], empty = null; early manual finish only considers attempted prefix |
| durationMs | end-start inclusive of pauses | milliseconds, nonnegative |
| activeDurationMs | sum of positive consecutive gaps <= pauseThresholdMs (default 2000 ms) | milliseconds; long gaps excluded entirely |
| consistency | 1-CV of attempt counts in complete 5 s **active-time** windows, clamped [0,1] | fraction; null without >=3 complete windows |
| correctedErrorRate | corrected errors / attempts *100 | events per 100 attempts |
| uncorrectedErrorRate | final alignment errors / attempts *100 | alignment errors per 100 attempts |
| medianIntervalMs | median of positive inter-attempt delays <= threshold | ms; null if none |
| p90IntervalMs | nearest-rank 90th percentile for the same inter-attempt delays | ms; null if none |
| rhythmStability | (p75-p25) / median of valid intervals | dimensionless; null if no median or median=0 |

Event timestamps originate from the session engine and are treated as monotonic, but clock origin must be validated at the UI boundary. A multi-character composition commit creates multiple grapheme attempts at the same timestamp; such zero intervals do not enter latency. A pause does not imply cheating; inserted text from alternative input must be separately classified by the engine. All rates round only for display/stored summary and use bounded divisions.

Eligibility for skill model updates: finished session, at least 20 grapheme attempts and 8000 ms active time. Insufficient evidence is not a zero-speed result. Legacy summaries are not rewritten; any future user-triggered rescore must keep both versions auditable. Race and wall-clock timer continue to use actual elapsed time, not active time.

Unit tests use hand-calculated fixtures and seeded property sweeps; `fast-check` requirement remains open. Performance and browser integration remain unverified until the new calculator is wired and corresponding acceptance gates pass.
