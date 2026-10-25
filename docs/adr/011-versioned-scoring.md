# ADR-011 — Version scoring rather than rewriting history (2026-10-25)
Context: v0.8.0 scores clamp time at 1 second and use attempted CPM, conflicting with v0.9 specifications.
Decision: introduce a separate `calculateScoreV2` with active-time, nullable speeds, final-accuracy and rhythm fields.
Historical `tykora-1.0.0` records remain immutable; migrations never rescore them.
Alternative: change `calculateScore` in place; rejected because it silently changes old metric semantics.
Ordinary Practice, background scoring Worker, nullable result/home/analytics display and backup validation now accept v2; Race and Classroom remain on v1 pending careful migration. Explicit user-rescore is deferred.
Risk: elapsed wall time and active time must remain distinct in timed modes.
