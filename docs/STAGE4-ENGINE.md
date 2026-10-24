# Stage 4 — Typing, Metrics and Adaptation

## Engine invariants

1. A `TypingPrompt` has a stable ID, license, language and layout. All text is normalized to NFC before segmentation.
2. `EngineState` is an immutable transition of full native textarea values (not guessed `keypress` text). The DOM's composition preview is ignored until `compositionend`.
3. `startedAtMs` and `endedAtMs` are measured with a monotonic clock; event timestamp sequence is non-decreasing for the normal UI. No wall-clock time is used to compute duration.
4. Target length is a grapheme count, not UTF-16 `string.length`. A completed exercise cannot mutate until reset.
5. Pasting and dragging text is blocked in the practice UI; the domain rejects explicit `source:'paste'`. This is *not a security boundary*.
6. The text field remains a real semantic textarea for screen-reader, IME, dead-key and mobile-keyboard compatibility.
7. Typed content and event traces remain in memory. Persist only scored summaries and aggregated per-sequence skill states.

## Performance decisions

- Live calculation is linear in the target length (O(n)) with bounded exercise text.
- Final edit alignment is optimal string alignment (OSA) Damerau–Levenshtein O(n*m), max 1200 graphemes on each side, executed only for final scoring.
- React currently rerenders only the practice field and metrics every accepted input. A further optimization using a requestAnimationFrame presentation coordinator is planned after actual profiling. Sub-16ms keystroke latency is not yet measured.

## Skill estimation v1

- Each layout + locale + sequence (key, bigram, trigram) has counts of successes and failures.
- Beta(2,2) prior: `mastery = (successes + 2) / (samples + 4)`; confidence weight = `samples / (samples+12)`. These are *heuristics*, not calibrated learning probabilities.
- Erroneous target letters penalize key and expected n-gram contexts. Valid consecutive correctly typed graphemes reward contexts.
- Successes push review time out 1, 3 or 7 days; mistakes become due after 10 minutes.
- Generate candidate word weights from component weakness, review due state and measured input latency; perform seeded weighted sampling **without replacement**. Optional `recentWords` prevents immediate word repetition across drills during a running session.
- Minimum evidence for updates: at least 20 inserted grapheme attempts, >= 8 seconds, completed test. These are initial operational thresholds requiring future tuning.
- No finger-level correctness is inferred. No claim of outperforming Keybr without controlled learning research.

## Known limitations / next stage

- Full production-grade IME and accessibility testing needs macOS, Windows, Android and iOS browsers. Simulator-level implementation is not enough.
- If native autocorrect replaces text through input methods, it may contaminate timing/skill estimates; flag these sessions in a later reliability model.
- Some Unicode grapheme segmentation falls back to `Array.from` on browsers without `Intl.Segmenter`. Those browsers need a polyfill before becoming fully supported.
- Content generation currently uses a small original lexicon. Stage 5 adds language-level corpus structure, license metadata, anti-memorization tracking and review scheduling.
- Word-level comparisons between Net WPM engines are not directly comparable unless their scoring versions and policies match.
- Stage 7 adds import/export and comprehensive WCAG/e2e audits.
