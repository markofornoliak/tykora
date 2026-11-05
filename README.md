# TYKORA · Beta v0.9.0

[![Quality gates (main)](https://github.com/markofornoliak/tykora/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/markofornoliak/tykora/actions/workflows/checks.yml?query=branch%3Amain) ![MIT license](https://img.shields.io/badge/license-MIT-informational) ![Unreleased work](https://img.shields.io/badge/iteration%206-DRAFT-lightgrey)

**Free forever · Offline-first · Local-first · Open source (MIT).**

TYKORA is an experimental typing-learning platform built with React, TypeScript and Vite. It includes 124 RU/EN lessons, 12 exercise modes, an adaptive model of individual keys and n-grams, local results, 24 themes, 10-language *UI shell*, bot races, a manual-code WebRTC prototype, a teacher assignment prototype, and portable IndexedDB backups.

**Verified v0.8.0 deployment:** GitHub Actions [quality run 40145391299](https://github.com/markofornoliak/tykora/actions/runs/40145391299) and [Pages release run 40145391276](https://github.com/markofornoliak/tykora/actions/runs/40145391276) succeeded on 2026-10-25 at commit `9fb97bc`. This is source/build/Chromium E2E evidence, **not** a full accessibility, cross-browser or performance certification. Beta v0.9.0 is published by project-owner authorization as an experimental beta; **several original v0.9 acceptance targets remain unmet**. See [release notes](docs/RELEASE_NOTES-v0.9.0.md), [measured input latency](docs/PERF-v0.9-BASELINE.md) and [roadmap](docs/ROADMAP.md). See [v0.8 audit](docs/audit-v0.8.0.md) and [measured baseline](docs/PERF-BASELINE-v0.8.0.md).

## Current development and honest measurements

**Published:** Beta v0.9.0 on `main`, still experimental. **Unreleased:** iteration 5 in Draft PR #3; iteration 6 in [Draft PR #4](https://github.com/markofornoliak/tykora/pull/4) from iter5. No merging, tagging or production deployment is authorized for those drafts.

The [matched Phase 0 report](docs/PERF-v0.10-BASELINE.md) measured mobile Lighthouse 12.8.2 at 412×823, CPU ×4, RTT 150ms, N=10: LCP main **1954ms**, iter5 **1953ms**, initial iter6 **1956ms**; Performance 98, CLS 0. An iteration 6 *candidate* measured **917ms LCP** (N=10), but **118ms TBT** and unresolved cross-browser navigation at the time of that measurement; its extremely small eager JS chunk hides a deferred **full interactive bootstrap** and is NOT proof of ≤90kB startup JS. This branch remains subject to full CI and measured cleanup. The [worklog](docs/ITER6-LOG.md) records failed experiments as well as successes.

The full RU/EN 124-lesson candidate [content audit](https://github.com/markofornoliak/tykora/actions/runs/42118759970) found zero four-gram overlap/coverage violations; human editorial quality is not certified. [Naming due diligence](docs/NAMING.md) documents a known exact-name DeFi project and owner-only decision. Do not interpret these draft results as features or certifications of the published build.

## Quickstart

Install [Node.js 24 LTS](https://nodejs.org/) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build:

```bash
npm run check:domain
npm run check:backup
npm run check:quality
npm run check:workers
npm run check
npm run test
npm run build
npm run check:dist
npm run preview
```

For end-to-end browser testing:

```bash
npx playwright install chromium
npm run test:e2e
npm run test:e2e:production  # requires npm run build first
```

**Reproducible installs:** Beta v0.9.0 commits npm-generated `package-lock.json` and uses `npm ci` in CI and the Pages deployment workflow.

## Directory structure

- `src/domain` — typing, scoring, content, skill modelling, backup format, social logic; framework-independent.
- `src/application` — repository contracts and use cases.
- `src/infrastructure` — Dexie IndexedDB, workers, WebRTC, backup import/export.
- `src/features` — page-level UI; `src/shared` — shell, themes and i18n.
- `public` — PWA icons and optional Cloudflare security headers.
- `e2e` — browser scenarios against Vite; `e2e-production` — service worker and offline smoke tests against production preview.
- `.github/workflows` — CI and GitHub Pages release pipeline.
- `docs/RELEASE.md` — deployment and acceptance instructions.

## Privacy and storage

No account, cookies used for tracking, ad code, or external analytics. Completed sessions, settings, n-gram skill data, training plans, and optional pseudonym are stored in IndexedDB in the browser. **Profile → My data** exports/imports a portable JSON backup locally (25 MB maximum import). Import supports merge or destructive replace (with confirmation). The file contains personal learning history; store it privately. Offline storage can be evicted by the browser; keep backup files elsewhere.

Experimental friend racing optionally uses Google STUN only with explicit opt-in and requires manual exchange of WebRTC SDP codes; the peer can learn your IP address. P2P is not guaranteed across restrictive NATs and has no independent anti-cheating verification. Certificates and server-verified leaderboards are not implemented.

## Known gaps

The 10 UI languages only cover the shell and primary labels, not every page or lesson. The 124 lessons are a curriculum prototype without controlled educational efficacy evidence. Layout customization, authenticated classes, global rankings, tamper-proof certificates, true screen-reader and accessibility audit, and complete production/browser validation remain outstanding. Measured mobile LCP is above the intended 1-second target, and the 500-input Chromium CPU×4 p95 Event Timing measurement is 40 ms in the documented later trial. The requested <16ms typing latency is **not met / not verified**. See `docs/PERF-v0.9-BASELINE.md`.

## Documentation

- [Deployment and release checklist](docs/RELEASE.md)
- [Privacy](docs/PRIVACY.md)
- [Terms and product limitations](docs/TERMS.md)
- [Matched iteration 6 performance baseline](docs/PERF-v0.10-BASELINE.md)
- [Iteration 6 live engineering log](docs/ITER6-LOG.md)
- [Naming collision review (decision pending)](docs/NAMING.md)
- [Contributor guide](CONTRIBUTING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Stages 4–7](docs/STAGE7-QUALITY.md)

MIT © contributors. The project's title and name/domain clearance have not been independently established.
