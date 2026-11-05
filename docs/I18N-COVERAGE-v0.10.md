# Iteration 5 — RU/EN localization coverage and known gaps

Status: **PARTIAL — all nine primary route interfaces now have RU/EN authored copy; exhaustive dynamic paths and native speaker QA NOT confirmed.** The pre-existing checked registry of chrome keys (49) and six general page-copy keys is populated for 10 locales; its 100% figure describes **only that small registry**, not full product translation.

| Page / workflow | RU/EN newly authored | Remaining English-view Russian strings / gaps |
|---|---|---|
| Home | Main headings, one CTA, metrics, daily goal, empty states | Some stored content titles and resource text |
| Academy | Title, objectives, level status, plan form, key CTAs | Some descriptive routine content and generated lessons tied to content language |
| Practice | Main controls, selected mode labels, keyboard helper, statuses, empty states | Some domain notices, review-generation/error paths |
| Results | Heading, metrics, interval table, save-card action | Some dynamic notices, score/source labels |
| Analytics | Heading, table headers, recommendations, chart | Keyboard heatmap descriptions and specialist strings partially Russian |
| Themes | Intro, contrast explanation, settings notes | Imported theme names remain proper nouns; some previews |
| Profile | Main copy, backup/import safety confirmations, achievements, tiers and SVG sharing card now RU/EN | Native-supplied error texts outside known paths and independent copy audit still need coverage |
| Race | P2P controls, privacy/IP/STUN disclosures, bot labels and race-status copy now RU/EN | Raw connection state strings, domain-level errors and physical P2P protocol QA remain |
| Classroom | Teacher/student form controls, importing/exporting and validated-domain errors now RU/EN | User-authored lesson text remains independent and intentionally is not machine-translated |

This matrix is scope-based, not a fabricated numerical percentage of all visible text. Ten UI shell locales are still distinct from **three independent language dimensions** (UI locale, layout and content language); all three controls are not yet normalized into a persistent settings schema. User's history and backup IDs remain untouched. No claims of complete localization or professional native-speaker QA.

CI: `e2e/iter5-english.spec.ts` checks six main routes in English against actual text; this is a smoke test, **not** exhaustive translation inventory, plural forms or layout-overflow coverage. Existing `check:i18n` still covers registered keys only.

## 2026-11-05 owner-directed continuation

- Profile, Race and Classroom UI/consent/backup copy added through `useBilingual()`; no replacement of typed exercise language, scores or historic backup IDs. Test: `e2e/iter5-english.spec.ts` now covers nine primary routes and asserts the presence of English P2P IP disclosure and destructive backup wording. CI proof required on exact later SHA.
- Remaining gap is **not** zero: domain-originated errors, some achievement/race dynamic notices, registered 10-locale chrome vs individual route copy, and all content curricula outside RU/EN remain scoped separately. Source token scans and browser focus/pixel captures are not equivalent to a native-speaker line-by-line review.
- For D, the first three lessons have distinct versioned practice/review text and a 4-grapheme n-gram overlap test with `<10%` threshold. CI unit test is a focused 6-text regression, not a complete 124-lesson editorial audit. No historical saved score or ID rewrite.
