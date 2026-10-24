# TYKORA · Beta v0.8.0

**Free forever · Offline-first · Local-first · Open source (MIT).**

TYKORA is an experimental typing-learning platform built with React, TypeScript and Vite. It includes 124 RU/EN lessons, 12 exercise modes, an adaptive model of individual keys and n-grams, local results, 24 themes, 10-language *UI shell*, bot races, a manual-code WebRTC prototype, a teacher assignment prototype, and portable IndexedDB backups.

**Release status: source release candidate, not a verified production release.** The authoring environment cannot resolve `registry.npmjs.org`, so full dependency installation, Vite production build, browser E2E, Lighthouse, and WCAG audit are not verified. Do not publish it as independently validated until the checks in [docs/RELEASE.md](docs/RELEASE.md) pass.

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

**Reproducible installs:** generate and commit `package-lock.json` after a successful install, then change the CI steps from `npm install` to `npm ci`. A lockfile could not be generated while offline. Do not substitute a synthetic lockfile.

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

The 10 UI languages only cover the shell and primary labels, not every page or lesson. The 124 lessons are a curriculum prototype without controlled educational efficacy evidence. Layout customization, authenticated classes, global rankings, tamper-proof certificates, true screen-reader and accessibility audit, and complete production/browser validation remain outstanding. Lighthouse target >= 95 and LCP < 1s have **not** been measured. The 60 fps / <16ms interaction target is unverified.

## Documentation

- [Deployment and release checklist](docs/RELEASE.md)
- [Privacy](docs/PRIVACY.md)
- [Contributor guide](CONTRIBUTING.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Stages 4–7](docs/STAGE7-QUALITY.md)

MIT © contributors. The project's title and name/domain clearance have not been independently established.
