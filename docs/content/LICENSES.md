# TYKORA content provenance ledger — Iteration 4
Updated: 2026-10-27 UTC.

| Material | Path | Origin | License / permission | Verification |
|---|---|---|---|---|
| Existing 22×RU + 22×EN original passages | `src/domain/content/library.ts` (`entries`) | TYKORA author-created; no third-party extracts | Project's MIT license, repository `LICENSE` | Source-level provenance declaration; no external rights attestation |
| Added 24 SQLite code exercises, shared between RU and EN | `src/domain/content/sql.ts` | Original snippets authored specifically for TYKORA | Project's MIT license | Executable validation via Python stdlib SQLite in `npm run check:content` |
| Existing course focus patterns | `src/domain/lessons/curriculum.ts` | Original TYKORA | Project MIT | Pedagogical diversity **not** accepted |
| Existing adaptive public word bank | `src/domain/content/prompts.ts` | Original declared starter vocabulary | Project MIT | Vocabulary breadth/word origins not independently licensed as a dictionary |
| Public-domain quotation inventory | Not shipped | Not yet verified | N/A | **0 verified PD records; do not claim a quotes corpus** |
| Fonts | No new web/local font files added | System fallback stack in `src/styles/app.css` | OS-managed | No shipped font asset requires new OFL entry; do not fetch CDN fonts |

Any imported text, font or translated quote requires a per-item source/license record before entering production content. Modern translations of public-domain originals are **not** presumed public domain. SQL examples contain no user data and refer only to inline literal tables.
