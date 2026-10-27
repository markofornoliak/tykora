# ADR-017 — Legacy typing-prompt compatibility in Iteration 4
Date: 2026-10-27 · Status: Accepted for isolated feature branch

## Context
Existing user history records only stable `promptId` and summary statistics. `lessonProgressFromScores` reconstructs target length through `lessonPrompt`, and `historicalLessonVocabulary` reconstructs legacy course vocabulary. Editing existing practice/review text while reusing `course-LXX-YY-ru|en` could make old sessions appear too short, too long or different.

## Decision
1. Existing 124 lesson IDs, legacy prompt IDs, prompts and Dexie schema remain byte-for-byte semantically compatible in this iteration's safe subset.
2. Existing 44 passage IDs/text are not modified. New SQLite snippets use a distinct `tykora-sql-NNN-ru|en` namespace.
3. Course-diversity issues are measurable and are **not accepted as fixed**. New curriculum words/text require a future content-versioned prompt identity plus a dedicated legacy reconstruction path, review-exclusion update and historical-score tests.
4. SQL is authored and tested as 24 standalone SQLite statements; both RU and EN learners type exactly the same executable code (not a translated SQL dialect).
5. `scripts/content-audit.mjs` produces explicit metrics without changing mastery thresholds or disguising repeated legacy patterns.

## Consequences
This prevents unplanned data migration and enables safe library expansion, but current Academy lessons retain their baseline pedagogical repetition. Genuine restricted-alphabet teaching and content-v2 rollout are pending. Future changes must include before/after metrics, consent-safe ID migration, and 10-run input timing on the same protocol.
