# Acceptance matrix · TYKORA vs established typing services

Date: 2026-10-25. TYKORA is a **source candidate**, not a production competitor. The matrix explicitly distinguishes code-delivered functions from proven outcomes.

| Dimension | TYKORA Beta v0.8.0 | Market benchmark / gap | Closure plan |
|---|---|---|---|
| Price | No paywall, subscription, advertising SDKs or mandatory backend in source. Hosting free subject to quota. | Typing.com free course includes ads and has paid PLUS. | Verify network requests and free-host quota after deployment. |
| Design | Original CSS design system, 24 palettes, focus mode. | Monkeytype already offers very mature minimalist UI and themes. | Usability studies and responsive user testing; don't claim design superiority yet. |
| Structured course | 124 generated RU/EN beta lessons in 10 levels. | TypingClub / Typing.com offer mature courses and teacher-supported pedagogy. | Pilot with learners; revise skill prerequisites and lesson repetition. |
| Adaptive lessons | Per-key/bigram/trigram estimates and adaptive drill generator. | Keybr is an established adaptive specialist. | Add blinded A/B comparison for transfer speed and retention. |
| Analytics | Net/raw WPM, accuracy, consistency, correction types; basic skill analysis. | Monkeytype and Keybr have mature visual analytics. | Add richer charts, heatmaps, confidence intervals, and export of longitudinal data. |
| Racing | Offline simulated bots, experimental 1:1 manually signaled WebRTC. | TypeRacer / Клавогонки provide reliable online matchmaking. | Real multi-network tests, consent-aware relay option, anti-abuse and UX improvements. |
| Classrooms | Teacher assignments, manual report collection and CSV. | TypingClub / Typing.com provide real teacher dashboards and school workflows. | Build self-contained local dashboard and verified offline data exchange. |
| Languages/layouts | 10 UI shell locales, 2 course languages, 8+ selectable physical layout hints; not a complete locale-dependent method. | 10FastFingers has many test languages; Typing.com supports many layouts. | Translate all pages, adapt input text and finger maps per hardware layout, audit IME. |
| Accessibility | Reduced-motion, font, zoom/contrast modes and basic keyboard improvements. | TypingClub/Typing.com already offer substantive accessibility features. | Independent WCAG 2.2 AA audit including VoiceOver/NVDA/tremor tests. |
| Offline | PWA/service-worker and precache configured; no production offline browser test completed here. | Competitors vary; no blanket claim. | Run installed-device offline regression on each release. |
| Privacy | IndexedDB local progress and portable backup; optional STUN/peer traffic only after user choice. | Different competitors have different account and collection practices. | External network audit, private mode threat model, documented retention. |
| Open code | Source MIT license; distributed archive. | Monkeytype and Keybr already publish source. | Public GitHub repository, contributor governance, reproducible CI, signed releases. |

**Final disposition:** promising differentiators in local-first architecture and integrated course+analytics, but no verified overall superiority. Core gaps: production testing, educational validation, multilingual completion, accessibility, social reliability, deep analytics.
