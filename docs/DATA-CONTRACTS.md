# Data Contract Rules

- IDs: stable UUID for sessions; stable authored IDs for courses, prompts, and layouts.
- Time: monotonic `performance.now()` for intervals; UTC ISO strings for persistence.
- Unicode: grapheme clusters for user-visible characters, normalized only under explicit rules per language. Preserve composed accent/dead key semantics.
- WPM: explicitly define gross and net formulas and what constitutes a word (standard 5-character equivalent vs lexical words). Do not compare different scoring versions naively.
- Accuracy: define denominator and whether corrections count; store all relevant counts alongside ratio.
- Aggregation: user-local statistics only; no keyboard event uploads or background telemetry.
- File import: future versioned JSON envelope with schemaVersion, validated fields, limits and preview before replace/merge.
- Exports: avoid exporting private custom text by default. Add optional encryption of exported files in stage 7 if demanded.
- Content licenses: each source packaged with SPDX-like license field and attribution where required.
