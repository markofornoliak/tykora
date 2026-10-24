# Architecture Decision Records

**ADR-001: React + Vite + TypeScript.** Chosen for reusable UI, testability, offline static builds and contributor ecosystem. Tradeoff: dependency size and modern Node requirements. React isn't used in the keystroke hot path.

**ADR-002: Feature-first directory and dependency-inverted domain.** Code is organized by product workflow, with reusable lower-layer contracts for teaching, metrics, and persistence. Avoids giant components and a premature monorepo.

**ADR-003: IndexedDB via Dexie.** Transactional storage for sessions and skill stats. Storage remains best-effort; export/import and persistent-storage requests are future work.

**ADR-004: Hash-based routing.** GitHub Pages deep-link reload works without a dedicated server. Tradeoff: less elegant URLs, acceptable for a PWA.

**ADR-005: Local-first without registration.** No server is required for typing or lessons; community features are optional adapters, not global prerequisites.

**ADR-006: Versioned metrics.** Every historical result references a scoringVersion, layoutId, locale, content ID and mode to avoid quietly changing past performance comparisons.

**ADR-007: Transparent stages.** Stage-4 implements real measurement and skills but cannot claim a full educational corpus, audited offline installability or empirically validated adaptation until verified. No artificial user scores.

**ADR-008: UI heritage.** Stage-2 CSS is initially migrated as a visual baseline; iterative extraction to CSS Modules should preserve screenshots, token semantics and a11y.

**ADR-009: Preserve native composition.** Use native textarea value and composition-end commits for actual characters, `KeyboardEvent.code` only for non-text physical-key hints.

**ADR-010: Calibrated language.** Skill confidence is a heuristic evidence weight; no validated probability claim.
