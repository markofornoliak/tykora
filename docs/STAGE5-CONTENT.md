# TYKORA · Stage 5 — Curriculum, content and practice modes

Status: source implementation with domain-level validation. **Browser E2E, npm build, Lighthouse and cross-platform accessibility were not verified in the current environment.**

## Course

The deterministic, versioned curriculum in `src/domain/lessons/curriculum.ts` exposes **124 distinct prompts for RU and 124 for EN** across 10 levels. It is a **beta drill curriculum**: the exercises progress from row recognition and keyboard reach through words, Shift, punctuation, numbers, language-switching, rhythm, speed and endurance. Many exercises deliberately repeat targeted sequences. The overall pedagogical efficacy and finger-by-finger movement guidance have **not** been field-validated yet.

Levels and allocations:

| Level | Focus | Lessons |
|:--|:--|--:|
| 1 | Foundations / home row | 14 |
| 2 | Reach / upper + lower rows | 16 |
| 3 | Fluency / words + accuracy | 12 |
| 4 | Shift and punctuation | 12 |
| 5 | Numbers + symbols | 12 |
| 6 | Language / layout switching | 12 |
| 7 | Rhythm | 10 |
| 8 | Speed | 12 |
| 9 | Endurance | 12 |
| 10 | Mixed mastery | 12 |
| **Total** | | **124** |

Curriculum metadata includes `id`, ordered `index`, level, step, titles and objective in RU/EN, estimated minutes, focus sequences, and version. Exercise text is created deterministically from original teaching patterns; changing those patterns requires a curriculum version change. **No competitor text was copied.** Users may open any lesson with no artificial locks. A lesson is marked mastered only when a fully entered text has at least 90% attempt accuracy and a nonzero net WPM. The threshold is a product decision, **not a validated proficiency standard**.

Local source entries: 22 original RU passages and 22 corresponding EN passages in `src/domain/content/library.ts`, each attributed to TYKORA, including 8 categories: general, Python, C++, JavaScript, finance, business, medicine, law. 44 passages total. Code snippets are program examples, not user-generated material. User-imported text is tagged `user-provided` and never represented as free-licensed.

## Modes

| UI mode | Behavior | Stage 5 constraints |
|--|--|--|
| Diagnostic | Original short fixed passage | RU/EN only |
| Adaptive | Stage 4 skill model picks words from local bank | Heuristic beta model, not proven |
| Time | 15/30/60/120 seconds; starts on first input | Browser timer when backgrounded may fire later but calculates from monotonic clock |
| Words | 10/25/50/100 words | Local deterministic picker; may repeat over long passages |
| Quote | Original passages filtered by domain | No third-party license downloads |
| Custom | User input or local TXT/MD file (max 6k Unicode graphemes) | Content not saved or uploaded; file <= 100 KB |
| Zen | Long uninterrupted text, manual stop | Does not provide infinite streamed content yet |
| Hardcore | Stops on first wrong grapheme attempt | IME commits can include multiple graphemes |
| Blind | Target becomes visually hidden after starting | Text remains in screenreader accessible description; needs usability testing |
| Burst | 12-word speed exercise | No dedicated burst comparisons yet |
| Daily | Deterministic challenge by local date and locale | Changing device timezone may produce a different calendar day; no verified score |
| Marathon | 260-word test | Not an infinite endurance mode |

### Modes and metrics

- Stopping before the end never treats unseen remaining text as omissions. Alignment compares the typed text to the attempted prefix.
- A completed course lesson must include the full prompt; manually stopping after a couple of correct keystrokes cannot mark it mastered.
- The `TypingPrompt.license` union now includes `user-provided` for arbitrary custom text.
- `TypingPrompt.mode` describes the scoring family, while `ModeId` describes the current UI behavior. Specialized modes intentionally share scoring families; richer per-mode session metadata is a future migration.
- The DOM displays a **bounded ~260 grapheme window** for long passages to avoid rendering thousands of character elements on each update; the full target remains accessible to assistive technology. Further performance profiling is Stage 7.
- Physical layout previews are visual guides, **not** operating-system keyboard switching or validated finger detection. The non-QWERTY templates need verification against actual ISO/ANSI physical layouts before production acceptance.

## Optional plan

`TrainingPlan` is persisted in IndexedDB v3 via a repository port. Goal 20–200 WPM, horizon 7–365 days, daily routine 10, 15 or 20 minutes. Suggested blocks: warmup, adaptive practice, unfamiliar-text check, review. It is only a repeatable **practice schedule**, not a speed forecast or achievement guarantee. Personal coaching based on longitudinal improvement data will be developed in a later iteration.

## What remains

- Full professional editorial review of all 124 drills (readability, actual key/finger progression, fatigue patterns, spelling, educational progression) and usability testing.
- Explicit ergonomic mini-lessons, screenreader-audited instructions, accessible hand animation, left-/right-hand alternatives and numpad-specific workouts.
- Polish, Ukrainian, German, French, Spanish, Portuguese, Turkish, Italian content and UI translation, with Unicode punctuation coverage.
- Real dictation: local audio assets or on-device TTS voice availability and fallback. Error-correction mode, layout switching exercises, custom layout builder.
- Adaptive daily plans backed by measured transfer tests, plus plan export/import.
- Playwright regression of all modes, mobile keyboard/IME, Lighthouse/a11y, robust offline tests.

## Checks

`npm run check:domain` builds the framework-free TS domain and runs **22 dependency-free assertions**, including exercises per locale, license provenance, daily determinism, timing end behavior, and mastery criteria. `npm test` contains more Vitest assertions but needs dependencies to be installed. Full build requires `npm install` and `npm run build`; not verified in this environment due to registry unavailability.
