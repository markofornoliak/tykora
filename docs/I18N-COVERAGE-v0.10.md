# Iteration 5 — RU/EN localization coverage and known gaps

Status: **PARTIAL — full RU/EN acceptance NOT confirmed.** The pre-existing checked registry of chrome keys (49) and six general page-copy keys is populated for 10 locales; its 100% figure describes **only that small registry**, not full product translation.

| Page / workflow | RU/EN newly authored | Remaining English-view Russian strings / gaps |
|---|---|---|
| Home | Main headings, one CTA, metrics, daily goal, empty states | Some stored content titles and resource text |
| Academy | Title, objectives, level status, plan form, key CTAs | Some descriptive routine content and generated lessons tied to content language |
| Practice | Main controls, selected mode labels, keyboard helper, statuses, empty states | Some domain notices, review-generation/error paths |
| Results | Heading, metrics, interval table, save-card action | Some dynamic notices, score/source labels |
| Analytics | Heading, table headers, recommendations, chart | Keyboard heatmap descriptions and specialist strings partially Russian |
| Themes | Intro, contrast explanation, settings notes | Imported theme names remain proper nouns; some previews |
| Profile | **NOT translated fully** | Forms, export/import confirmations, headings |
| Race | **NOT translated fully** | Live/P2P setup and warnings |
| Classroom | **NOT translated fully** | Student/teacher workflows and reports |

This matrix is scope-based, not a fabricated numerical percentage of all visible text. Ten UI shell locales are still distinct from **three independent language dimensions** (UI locale, layout and content language); all three controls are not yet normalized into a persistent settings schema. User's history and backup IDs remain untouched. No claims of complete localization or professional native-speaker QA.

CI: `e2e/iter5-english.spec.ts` checks six main routes in English against actual text; this is a smoke test, **not** exhaustive translation inventory, plural forms or layout-overflow coverage. Existing `check:i18n` still covers registered keys only.
