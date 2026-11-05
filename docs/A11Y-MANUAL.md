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

## Проверка владельцем — ручные сценарии / Owner-required manual tests

**VoiceOver (macOS + Safari): ТРЕБУЕТ ВЛАДЕЛЬЦА — НЕ ПРОВЕДЕНО.**
1. Checkout текущей feature-ветки; зафиксировать `git rev-parse HEAD`, macOS и версию Safari; локально запустить `npm ci` и `npm run dev`.
2. Включить VoiceOver (Command+F5 либо Системные настройки → Универсальный доступ → VoiceOver). В Safari с адресной строки пройти клавишей Tab до Skip link; активировать Enter; проверить реальный фокус в main и сохранение URL.
3. Клавиатурой и VoiceOver открыть Practice, прочитать текст и название поля, ввести 20 символов с ошибками и исправлениями. Отметить, если каждый символ из target озвучивается навязчиво.
4. Проверить IME/Dead key/AltGr при наличии физической раскладки. Нажать Focus, выйти Escape, завершить сессию, проверить однократное итоговое aria-live и фокус после перехода.
5. Переключить Daylight/Nightfall/Contrast Dark, включить Reduced Motion; проверить видимость focus-ring, активное состояние, озвучку переключателей.
6. При zoom 200% и 400% повторить Practice, Result, Themes на эквивалентной ширине 320 CSS px, проверить горизонтальный скролл и наличие недоступных элементов.
7. Записать SHA, браузер/ОС/версию VoiceOver, последовательность шагов, фактическую речь, PASS/FAIL/BLOCKED. Если Safari/macOS нет, оставить 'требует владельца'.

**NVDA (Windows + Firefox): ТРЕБУЕТ ВЛАДЕЛЬЦА — НЕ ПРОВЕДЕНО.**
1. На Windows запустить тот же исходный SHA локально, открыть Firefox с новым профилем. Записать версии Windows, Firefox и NVDA.
2. Включить NVDA; проверить Tab/Shift+Tab, NVDA browse/focus mode, Skip link, 9 пунктов навигации и возврат фокуса после перехода.
3. В Practice с NVDA прочитать target, ввести/исправить 20 символов, завершить, прослушать результат один раз. Проверить, не дублирует ли динамическая область каждый символ.
4. Проверить реальную клавиатуру: IME, dead keys, AltGr, вставку и автокоррекцию (где доступно). Отсутствующее оборудование/IME = BLOCKED, не PASS.
5. Включить Windows Contrast Theme и увеличить Firefox до 200% и 400%; проверить фокус, границы кнопок, отсутствие обрезания текста и ловушек.
6. Для каждого дефекта указать воспроизведение, ожидаемое/фактическое, скрин/запись при необходимости, точный SHA. Завершить журналом PASS/FAIL/BLOCKED.

| Сеанс | Статус | Нужный исполнитель |
|---|---|---|
| VoiceOver / Safari / macOS | ТРЕБУЕТ ВЛАДЕЛЬЦА; НЕ ПРОВЕДЕНО | владелец с Mac |
| NVDA / Firefox / Windows | ТРЕБУЕТ ВЛАДЕЛЬЦА; НЕ ПРОВЕДЕНО | владелец с Windows |

Автоматическая axe-матрица 9 маршрутов × 24 темы × 3 ширины (Chromium) действительно прошла на 0ded9a7: https://github.com/markofornoliak/tykora/actions/runs/42025942260. Это не подтверждает VoiceOver/NVDA.