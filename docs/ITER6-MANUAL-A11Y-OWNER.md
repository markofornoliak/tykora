# TYKORA Iteration 6 · Owner manual accessibility acceptance

**Status: UNRUN.** This is a human test protocol, not an automated PASS. Keep Draft PR #4 and `main` untouched. Test either the PR branch via local `VITE_BASE_PATH=/ npm run build && npm run preview` or an isolated preview; **do not trigger a production deploy**. Report browser/OS, version, device, locale/theme, viewport/zoom, observed result and screenshot/recording for every failure.

## A. Keyboard and focus (desktop, no mouse)

1. Load `/#/home`, `/#/academy`, `/#/practice`, `/#/analytics`, `/#/profile` directly in new private windows. On first Tab the native “Перейти к содержимому” must receive visible focus; Enter must focus the real `main#main-content` without changing route/hash or dismissing Home/losing input.
2. Starting from every deep link, Tab and Shift+Tab through all interactive controls: visible focus indicator, coherent order, no keyboard trap. Use Enter/Space on theme switches, links, start/reset, skill settings. Enter/Escape into and out of practice focus mode; check focus restoration. Navigate using hash links and browser Back/Forward, checking active link and page H1.
3. Switch RU ↔ EN, reload deep route; language in `html lang`, accessible names and screen-reader announcements must match visible current locale. Try a non-EN/RU UI locale; separately record every untranslated long text, not just chrome key coverage.
4. Test typing using physical keyboard and assistive IME (one CJK composition and one accent/dead-key composition). Native textarea must reflect actual committed characters; composition must not count intermediate keydown characters, change historical score, or trap Tab.

## B. Screen readers

5. Windows NVDA + Firefox and Chrome; macOS VoiceOver + Safari; mobile iOS VoiceOver + Safari and Android TalkBack + Chrome where devices available. Verify exactly one useful main landmark, correct nav semantics, heading sequence H1→H2 and no duplicate pre-rendered hidden Home content on deep links. Confirm skip-link announcement.
6. In Practice, hear target instructions, native typing input label, evolving score in a non-spammy manner, state transition Started/Finished and appropriate errors. Announce route loading (“Загрузка раздела…”) once if delayed, then actual route H1; make sure it isn't misrepresented as the largest useful content.
7. Confirm settings radio/checkbox/range values are read correctly, custom colors invalid/success communicated, destructive backup/import consent and WebRTC optional IP/STUN disclosure read in selected language. Any unlabeled control or stale message is a failure.

## C. Zoom, contrast, motion and responsive

8. At viewport widths 320, 390, 768, 1440 and browser zoom 100%, 200%, 400% run Home, Practice, Academy, Analytics, Profile, Themes, Race, Classroom (8 routes × 4 named checks). Observe no loss of content or function, no sideways scrolling except explicitly justified complex visualization, all interactive targets visible and keyboard reachable. Capture width plus screenshots.
9. Test Daylight, Nightfall, Contrast Dark and all other **24 themes** at mobile 320 and desktop 1440: contrast on text, links, buttons, focus outlines and keyboard highlights. Check text-scale 100, 130, 160% and readable font. WCAG 2.2 AA relevant rules need *manual* validation; automated axe passed limited matrix does not certify all combinations.
10. Enable OS reduced motion + in-app toggle. Check no essential content is conveyed only by animation. Force network latency and navigate immediately away from lazy route; loading geometry must not cause a footer jump or leave stale controls focusable. Test at each viewport with active browser back and keyboard skip.
11. On touch-only, ensure every route can be reached and typing focus exited. At mobile bottom nav must not obscure CTA or input when virtual keyboard opens. Try landscape and large text.

## D. Persistence and local data

12. On Themes, set reduce motion and text scale 130%, wait for explicit persistence completion, reload while online and offline, assert exact values restored. Toggle custom theme and language rapidly and reload to check write ordering, then disable IndexedDB and verify visible non-blocking notice, no silent false saved indicator.
13. On Profile create **synthetic only** exercise sessions, export JSON, import a valid backup and a deliberate invalid backup, verify version/CRC protections and no loss/corruption; test offline update and return online. No private personal session records should enter screenshots or CI artifacts.
14. Accessibility in standalone installed PWA after cold install/upgrade, including focus, offline support and switching between hash routes. Verify service-worker update doesn't strand users on cached stale UI.

## E. Owner recording and acceptance

For each case record: `ID | browser/device | width/zoom/theme/locale | actual behavior | PASS/FAIL/BLOCKED | evidence link | bug owner`. Do not count unavailable device combinations as PASS. Re-test repaired failures and retain the original incident. Owner approval is a manual signoff only after all critical routes can be completed with keyboard and screen readers; automatic CI cannot substitute.

**No verification claimed by this document.** Outstanding devices, actual keyboard-to-compositor timing, human translation review, brand clearance, and under-threshold LCP/JS remain separate release blockers.
