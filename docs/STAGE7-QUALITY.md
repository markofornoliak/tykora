# TYKORA v0.7.0 — Internationalization, accessibility, performance, QA

**25 October 2026 · Stage 7 of 8 · Source milestone, not production-certified.**

## Implemented and wired

1. **Language chrome:** local i18next phrasebook for RU / EN / UK / DE / FR / ES / PT / PL / TR / IT (46 compact labels in each language), translated home/practice headings and introductions, user selection, IndexedDB persistence, updated `<html lang>`. All resources bundled; no translation API, trackers, or CDN.
2. **Accessibility preferences:** native checkboxes and range control for reduced motion, high contrast, readable system font, target-text size (100–160%), one-hand-sized keyboard hints, gentle hardcore option (keeps raw scoring unchanged); stored in existing settings table. These are assists rather than validated assistive devices or a certified dyslexia typeface.
3. **Keyboard access:** skip-to-content now prevents HashRouter URL damage; programmatic main focus on client route transitions (but not initial load); 9 navigation destinations available on mobile through a horizontally scrollable navigation strip; large focus-visible indicators; fixed focus-mode exit button usable with touch or keyboard.
4. **Screen reader support:** active textarea retains native composition and keyboard focus; controls have names; the accessible target description now presents a rolling 110-grapheme excerpt rather than attempting to announce long exercises in full. Frequent per-character live announcements are intentionally omitted.
5. **Custom colors:** CSS-variable palette editor with four browser-native color inputs, visual preview, contrast precheck and IndexedDB persistence. Unsafe/corrupt stored custom palettes are ignored. The editor validates primary text/background and accent visibility, not every component state.
6. **Input performance:** immutable prompt and engine-state grapheme caches (WeakMaps); final OSA edit alignment now calculated off the main thread using a Web Worker, with best-effort synchronous fallback; the live clock updates 4 times/second; memoized visible text tokenization. Existing score semantics and historical data remain unchanged.
7. **QA and CI:** additional dependency-free TypeScript locale/palette/accessibility static checks, standalone worker TypeScript compilation, six Playwright integration scenarios, and benchmarks. All prior 32 domain checks still pass, plus four cache/long-score checks.

## Current localization coverage

| Scope | RU | EN | UK / DE / FR / ES / PT / PL / TR / IT |
|---|---|---|---|
| Primary navigation and preferences | Yes | Yes | Yes |
| Home and practice hero copy | Yes | Yes | Yes |
| Full Home cards | Yes | Partial | Not yet |
| Practice controls and mode descriptions | Yes | Partial | Not yet |
| Academy, Analytics, Results, Races, Profile, Classroom | Yes | Mostly Russian | Mostly Russian |
| Lesson content | Yes | Yes | No |

**Do not describe this release as fully localized in ten languages.** Those are *UI shell locales*; complete coverage is a Stage 8/release blocker.

## WCAG 2.2 AA status

Implementation targets WCAG 2.2 AA; **no AA compliance certification or manual assistive-technology testing has been completed.** Still required:

- NVDA + Firefox; VoiceOver + Safari desktop/iOS; keyboard-only; physical switch/alternative input.
- Full focus ordering on all modal/status transitions, landmark semantics, heading hierarchy, errors and labels.
- 200% and 400% browser zoom and 320 CSS-pixel reflow; especially scrollable mobile menu.
- Interactive contrast (focus indicator, error states and all 24 palettes), forced colors, color-only meaning.
- Test classroom import, privacy-sensitive exports, WebRTC connection errors, IME, dead keys, AltGr on real hardware.
- Audit native `title`, aria status frequency, error identification and target sizes under WCAG 2.2 §2.5.8.

Sources: https://www.w3.org/TR/WCAG22/ and https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions

## Performance evidence and limits

Engine benchmark (Node v22.16.0, synthetic 6,000-grapheme exercise, append-one-key + live score): before Unicode cache **median ~16.2 ms**, after **median ~5.8–6.5 ms**, varying with benchmark structure. Measured in the authoring container, not on a browser or midrange phone. Use `npm run benchmark:engine` to reproduce. Performance target `keypress < 16 ms` is **not validated** as an end-to-end interaction measure. Similarly, Lighthouse ≥95, LCP <1s, 60 fps, and service-worker offline after install are **not verified**.

Web Worker scoring avoids synchronous final-text alignment for modern browsers; browser runtime and service-worker caching still need tests. The in-memory typed trace remains ephemeral and is not stored in IndexedDB.

## Testing status

**Executed successfully in current authoring environment:**

- `npm run check:domain` → 22 Stage 4–5 + 10 Stage 6 + 4 Stage 7 = **36** checks.
- `npm run check:quality` → **11** locale/contrast/static UI checks.
- `npm run check:workers` → strict TypeScript compile of worker layer.
- TypeScript TS/TSX syntax parse of entire source tree.
- Dependency-free Node input/metrics microbenchmarks.

**Added but not run here:** `npm run test` (Vitest), `npm run check` (full React TS), `npm run build` (Vite), `npm run test:e2e` (Playwright), Lighthouse, axe-core, real WebRTC integration and PWA offline. The npm registry was unavailable with EAI_AGAIN; no `node_modules` or package-lock was fabricated. GitHub Actions runs the checks when published to a connected repository.

## Files worth reviewing

- `src/shared/i18n/catalog.ts` / `pageCopy.ts`: localized UI resources.
- `src/app/store/uiStore.ts`: theme, locale and accessibility preferences.
- `src/features/themes/Themes.tsx`: custom color editor and display controls.
- `src/shared/ui/Layout.tsx`: keyboard and mobile navigation.
- `src/shared/ui/TargetDisplay.tsx`: memoized prompt renderer.
- `src/domain/typing/engine.ts`: immutable grapheme caches.
- `src/infrastructure/workers/score.worker.ts` and `scoreAsync.ts`: off-main-thread final metrics.
- `e2e/a11y-i18n.spec.ts`: additional integration scenarios.

## Stage 8 release blockers

1. Install dependencies and commit a lockfile; `npm ci` clean reproducible build on GitHub Actions.
2. Fix any full-React typecheck/E2E failures; test workers and PWA offline using production build.
3. Complete 10-language UI translations or remove the full-localization promise and label partial locales correctly.
4. Manual WCAG 2.2 AA audit including alternative input, contrast checks, localization and responsive layout.
5. Actual INP, LCP and Lighthouse readings in mobile throttling and keypress visual-response benchmark, with performance fixes as needed.
6. Regression test imports/exports, classroom privacy, race failure behavior and mobile navigation.

## Honest state

An implemented source-code milestone with verified domain / worker / i18n-palette checks; **not a deploy-verified or WCAG-certified application**.
