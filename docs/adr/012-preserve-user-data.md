# ADR-012 — Preserve user data during backup import (2026-10-25)
Context: destructive replace cleared all Dexie tables transactionally but did not make a recovery copy first.
Decision: export a consistent readonly transaction snapshot before replace; initiate a local JSON download, then ask the user to verify it and explicitly confirm.
Invalid imports are rejected before backup creation or mutation; cancellation leaves the database unchanged.
Merge retains the previous stable-ID bulkPut semantics; replace remains inside one read-write transaction.
Alternative: invisible internal-only copy was rejected because browser storage itself can be evicted.
Risk: web browsers cannot guarantee downloads are persisted; confirmation explicitly discloses this uncertainty.
Evidence: e2e/backup.spec.ts covers safety download, cancelled replace and ordinary merge.
