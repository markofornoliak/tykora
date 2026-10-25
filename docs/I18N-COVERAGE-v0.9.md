# TYKORA v0.9.0 — i18n registry coverage audit
Date: 2026-10-25. The CI contract validates the registered interface catalog and `pageCopy` keys (not all literal strings inside every feature screen). See `src/shared/i18n/catalog.test.ts` and `npm run check:i18n`.

| Locale | Chrome filled | Page copy filled | Registered coverage |
|---|---:|---:|---:|
| ru | 49/49 | 6/6 | 55/55 = 100% |
| en | 49/49 | 6/6 | 55/55 = 100% |
| uk | 49/49 | 6/6 | 55/55 = 100% |
| de | 49/49 | 6/6 | 55/55 = 100% |
| fr | 49/49 | 6/6 | 55/55 = 100% |
| es | 49/49 | 6/6 | 55/55 = 100% |
| pt | 49/49 | 6/6 | 55/55 = 100% |
| pl | 49/49 | 6/6 | 55/55 = 100% |
| tr | 49/49 | 6/6 | 55/55 = 100% |
| it | 49/49 | 6/6 | 55/55 = 100% |

All 10 locale inventories have the same 49 chrome keys; 6 page-copy keys are present for each. Placeholder names are compared against the Russian master in automated tests. CI now emits `TYKORA_I18N_COVERAGE` per locale with exact numerators and denominators.

**Coverage limitation:** This is **100% of 55 registered keys, not 100% of the application's UI copy**. The Academy, Practice mode names and several other feature pages still contain hardcoded Russian strings. Only RU and EN study text is curated; translated study curricula for UK/DE/FR/ES/PT/PL/TR/IT are not available. Route-wide literal-string coverage has not been quantified and must not be represented as complete translation.
