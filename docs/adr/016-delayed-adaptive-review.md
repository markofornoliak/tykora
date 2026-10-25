# ADR-016 — Delayed adaptive review, history limits and migration safety
Date: 2026-10-25. Applies only to v0.9.0 feature branch.

## Decision
- Preserve the **original v0.8 course prompt ID** and the existing version-1 review ID. No historical session overwrite, database schema bump, destructive migration or implicit rescoring.
- The new version-2 review is generated from TYKORA's own RU/EN vocabulary and a reproducibly seeded skill-weighted generator. All available original practice tokens and explicitly reconstructed historic **course prompt** tokens are excluded before sampling. If fewer than 12 unique eligible words remain, fail closed instead of reusing known words.
- Enforce **24 hours = 86,400,000 ms** from qualifying first practice to qualifying second session. This is an intentional delayed-retrieval interval, not a claim of scientifically optimized spacing or proven learning effectiveness. The chosen duration avoids a same-minute memorization pass and is feasible for daily practice.
- Mastery requires validated distinct session IDs, level accuracy threshold (95/96/97%), positive non-null WPM, completed grapheme-length requirement, parseable `endedAt` timestamps and actual elapsed interval. The new review ID encodes its generated target length. The old session schema `schemaVersion:1` remains unchanged; stored scores are read only. Synthetic historical profile tests ensure non-destructive interpretation.
- Do **not** claim that every word of arbitrary historical user-typed content is excluded. The old app deliberately did not save full typed/prompt text for private custom sessions. Existing old `promptId` fields are insufficient to reconstruct arbitrary custom content. No safe migration can recover words that were never retained. This is an explicit unmet scope constraint, **not** a hidden fallback; otherwise the app would need to store new privacy-sensitive exposure information and supply opt-in migration UX.
- Model skill profiles are local; sampled review target remains an original prompt. A genuine randomly assigned post-training learning-effectiveness experiment is outside this ADR.

## Validation
- `src/domain/lessons/review.test.ts`: synthetic skill profiles, deterministic holdout, exclusion, fail-closed exhaustion, 24-hour boundary, distinct session IDs, complete target length.
- `src/domain/lessons/curriculum.test.ts`: existing canonical 124-lesson and historic progression contract.
- `e2e/course-modes.spec.ts`: preserved v0.8-style session and new review navigation under real IndexedDB, Chromium/Firefox/WebKit.
- Local backup validation remains backward compatible; refer to ADR-012 and `e2e/migrations.spec.ts`.
