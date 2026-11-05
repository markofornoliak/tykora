# Iteration 5 — WCAG 2.2 AA manual audit ledger

Status: **NOT PERFORMED** (2026-11-05). Automated tests do not establish conformance.

| Scenario | VoiceOver / Safari / macOS | NVDA / Firefox / Windows | Keyboard only / browser | Risk |
|---|---|---|---|---|
| Open Practice, find target, begin typing | Not performed | Not performed | Automated smoke only | Target text and native textarea announcements may conflict |
| IME composition, dead keys, AltGr | Not performed | Not performed | Unit tests only for some paths | Physical input could diverge |
| Pause / resume / focus mode | Not performed | Not performed | Escape/focus E2E for focus mode | Focus restoration and timer semantics incomplete |
| Finish, result announcement and navigation | Not performed | Not performed | Existing E2E checks | Live region announcement quality unknown |
| Theme and a11y preferences | Not performed | Not performed | Added keyboard selection E2E | Visibility in all palettes requires manual review |
| 320 CSS px; 200% browser zoom | Not performed | Not performed | 320px axe checks, not actual zoom | Reflow and clipping unverified |
| 400% text enlargement / line spacing | Not performed | Not performed | Not tested | Potential horizontal overflow |
| Forced colors / high contrast | Not performed | Not performed | Programmatic media smoke only | Actual system palettes unverified |
| Touch targets and mobile keyboard/visualViewport | Not performed | Not performed | CSS coarse-pointer rule only | Physical mobile landscape obstruction unknown |

## Automated scope

- Main CI: axe 9 routes × 3 widths (320/768/1440) across Chromium, Firefox and WebKit; **one active theme** per test unless user preferences vary.
- Added dedicated CI: axe 9 routes × 24 default themes × 3 widths in Chromium (648 scans); **do not claim passed until linked workflow succeeds**. The original three-browser base suite remains separate.
- Added keyboard skip-link, target a11y-hidden, theme selector and forced-colors/reduced-motion smoke tests.
- Colour role matrix: separate Vitest 24×15 numeric pairs. It does **not** validate all real rendered combinations or disabled/hover/active states.

Open requirements: actual VoiceOver/Safari and NVDA/Firefox, actual zoom at 200%/400%, tested modal focus return, screen-reader verbosity controls, landscape mobile virtual keyboard and full rendered screenshot diff baselines. Mark any unavailable device **not conducted**, never PASS.
