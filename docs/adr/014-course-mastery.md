# ADR-014 — Evidence-based course mastery (2026-10-25)
Context: v0.8 marked an entire course lesson mastered after one accurate run of one static text.
Decision: retain the original lesson prompt/id as stage one; add a stable second review text with a distinct id.
Mastery requires two separate session IDs, full grapheme length on each text, positive measured WPM, and level-specific accuracy (95%, 96%, 97%).
Existing v0.8 session history continues to count as stage one; it is never rewritten, erased or silently counted as both stages.
Alternative: upgrade old records to mastered automatically; rejected because a single pass is not repeat confirmation.
Limit: distinct reviews are authored transformations of each lesson's focus, not independently validated unseen-word transfer.
Evidence: domain tests plus an E2E progression test; CI must pass on the latest commit.
