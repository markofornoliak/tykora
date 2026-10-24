# TYKORA Architecture v1.0 · Stage 3

## Invariants

1. `src/domain/` has zero imports from React, Zustand, Dexie, browser DOM, analytics, or networking.
2. `src/application/` depends only on `src/domain/` and application ports.
3. `src/infrastructure/` implements application ports; no direct imports from features.
4. `src/features/` may use application use cases / domain read models, but should never import raw Dexie tables. (Stage-3 Analytics currently consumes the repositories composition root directly; split into a use case in stage 4.)
5. The typing engine is event-driven, synchronous and deterministic; UI receives a bounded snapshot rate.
6. PWA caching and offline persistence are distinct systems. WebRTC and rankings cannot be on the critical path of typing.

## Dependency graph

```
           app / composition
                 |
       shared UI and features
                 |
              use cases
                / \
          domain   ports <----- infrastructure adapters
```

## Stage-4 input-engine contract

- Normalize display, input and cursor positions by **Unicode grapheme clusters**, not JS UTF-16 code units.
- `beforeinput`/`input` are authoritative for committed text. `keydown.code` is for physical positions and shortcuts. `keydown.key` is contextual to active keyboard layout; never infer inserted text exclusively from keydown.
- Handle `compositionstart/update/end` as a transaction. No scoring of partial IME composition.
- Clock: `performance.now()` in the active tab; monotonic timestamps and well-defined start/pause/end semantics. On reload session is not silently resumed with elapsed wall-clock time.
- Preserve backspace/corrections and distinguish corrected/uncorrected errors.
- Rate charts are derived from measured input events, not animation frames.
- WPM and accuracy must declare exact denominator policies; version the scoring algorithm so historic results remain comparable.
- Treat paste, automation and suspect inputs as different reliability categories, never as proof of cheating.

## Accuracy and teaching constraints

- Multilingual keyboards need a separate mapping from character targets to physical-key advice. A browser cannot identify which finger was actually used.
- Learner profiles partition by layout and locale; never merge timing data across layouts without explicit comparability rules.
- Low-sample skill estimates must expose sample counts / uncertainty.
- Use static, licensed, versioned content packages; all lessons have stable IDs.

## IndexedDB version 1

- `settings`: singleton row key `'app'`, value AppSettings.
- `sessions`: unique ID; secondary indexes on timestamp, mode, and layout. `summary.scoringVersion` is required.
- `skills`: stable ID includes layout and skill unit; sample counts, latency, estimator version.
- Future migration can add profiles, course completions, text licenses, export metadata, adaptive queues.
- Never persist arbitrary pasted texts or raw typed input by default. Prefer aggregated session metrics. Export requires explicit user action.

## Performance and a11y budgets

- Hot path should avoid React renders per hardware keydown. Batch presentation at most once per requestAnimationFrame; preserve exact event timestamps.
- Target 60fps visual updates on midrange devices, no forced reflow from caret movement, no glyph regeneration of entire paragraph per keypress.
- Respect `prefers-reduced-motion` and in-app override; keep focus visible, semantic textarea, status updates throttled for assistive tech.
- Test Chromium, Firefox, WebKit and mobile keyboard/IME separately. High Lighthouse scores are an objective, not a current test result.

## Static hosting and networking

- `HashRouter` ensures routes work on GitHub Pages without a server rewrite.
- Workbox caches only public bundled code/assets; do not add runtime caching of user-submitted content.
- No dependency on hosted telemetry or online auth.
- A TURN-free WebRTC setup cannot guarantee peer connectivity; manual signalling is a baseline fallback, with optional free signalling service later.
- GitHub Actions and free tier builds are subject to vendor quotas; no paid runtime infrastructure is required for local-only learning.
